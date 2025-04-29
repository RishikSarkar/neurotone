import os
import io
import numpy as np
import torch
import torch.nn as nn
import soundfile as sf
import librosa
from fastapi import FastAPI, File, UploadFile, HTTPException
from transformers import WavLMModel, WavLMConfig, AutoFeatureExtractor
from pathlib import Path

# --- Configuration ---
MODEL_PATH = Path("./model/final_model_binary_segmented_balanced.pt") # Path to your trained model
BASE_MODEL_NAME = "microsoft/wavlm-base-plus"
TARGET_SAMPLE_RATE = 16000
MAX_LENGTH_SAMPLES = 160000 # Corresponds to 10 seconds at 16kHz
CLASS_NAMES = ['No Dementia', 'Dementia'] # Match training
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# --- Model Definition (Copy from your Training Notebook) ---
# Ensure this class definition exactly matches the one used for training
class WavLMForDementiaClassification(nn.Module):
    def __init__(self, base_model_name, num_classes=1): # num_classes=1 for binary
        super(WavLMForDementiaClassification, self).__init__()
        self.wavlm = WavLMModel.from_pretrained(base_model_name)
        hidden_size = self.wavlm.config.hidden_size
        self.classifier = nn.Sequential(
            nn.Linear(hidden_size, 512),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(512, 256),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(256, 1) # Output 1 logit for binary classification
        )

    def forward(self, input_values, attention_mask=None):
        outputs = self.wavlm(input_values=input_values, attention_mask=attention_mask)
        pooled_output = outputs.last_hidden_state.mean(dim=1)
        logits = self.classifier(pooled_output)
        return logits

# --- Global Variables / Application State ---
# Load model and feature extractor only once when the application starts
app = FastAPI(title="NeuroTone Dementia Detection API")
model = None
feature_extractor = None

@app.on_event("startup")
async def load_model():
    """Load the model and feature extractor when the server starts."""
    global model, feature_extractor
    print(f"Loading model from: {MODEL_PATH}")
    print(f"Using device: {DEVICE}")

    if not MODEL_PATH.exists():
        raise RuntimeError(f"Model file not found at {MODEL_PATH}")

    feature_extractor = AutoFeatureExtractor.from_pretrained(BASE_MODEL_NAME)
    model = WavLMForDementiaClassification(BASE_MODEL_NAME, num_classes=1) # num_classes=1

    try:
        # Load checkpoint onto the correct device, allowing non-tensor objects
        checkpoint = torch.load(MODEL_PATH, map_location=DEVICE, weights_only=False)
        model.load_state_dict(checkpoint['model_state_dict'])
        model.to(DEVICE)
        model.eval() # Set model to evaluation mode
        print("Model loaded successfully.")
    except KeyError:
        print("Error: 'model_state_dict' not found in checkpoint. Trying to load the whole object directly (legacy format?).")
        # Fallback if the .pt file IS just the state_dict (less likely given how you saved)
        model.load_state_dict(torch.load(MODEL_PATH, map_location=DEVICE, weights_only=False))
        model.to(DEVICE)
        model.eval()
        print("Model loaded directly successfully.")
    except Exception as e:
        print(f"Error loading model checkpoint: {e}")
        # Decide if the app should fail to start or continue without a model
        raise RuntimeError(f"Failed to load model state_dict: {e}")


# --- Helper Function: Preprocessing ---
def preprocess_audio(audio_bytes: bytes):
    """
    Loads audio from bytes, preprocesses it (resample, mono, pad/truncate),
    and extracts features. Matches training preprocessing.
    """
    waveform = None
    try:
        # Load audio directly from bytes
        waveform, sr = sf.read(io.BytesIO(audio_bytes), dtype='float32')

        # 1. Resample if necessary
        if sr != TARGET_SAMPLE_RATE:
            print(f"Resampling from {sr} Hz to {TARGET_SAMPLE_RATE} Hz")
            waveform = librosa.resample(waveform, orig_sr=sr, target_sr=TARGET_SAMPLE_RATE)

        # 2. Convert to Mono if necessary
        if waveform.ndim > 1:
             # Simple average for stereo to mono conversion
             print("Converting stereo to mono")
             waveform = np.mean(waveform, axis=1)

        # 3. Pad or Truncate (Same as training)
        current_len = len(waveform)
        if current_len > MAX_LENGTH_SAMPLES:
            print(f"Truncating waveform from {current_len} to {MAX_LENGTH_SAMPLES}")
            waveform = waveform[:MAX_LENGTH_SAMPLES]
        elif current_len < MAX_LENGTH_SAMPLES:
            padding = MAX_LENGTH_SAMPLES - current_len
            print(f"Padding waveform with {padding} zeros")
            waveform = np.pad(waveform, (0, padding), 'constant')

        # 4. Extract Features
        # Ensure feature_extractor is loaded
        if feature_extractor is None:
            raise RuntimeError("Feature extractor not loaded.")

        # The feature extractor expects a list/batch, even if it's just one item
        inputs = feature_extractor(
            waveform,
            sampling_rate=TARGET_SAMPLE_RATE,
            return_tensors="pt",
            padding=False, # Padding was handled manually above
            truncation=False # Truncation was handled manually above
        )
        return inputs

    except Exception as e:
        print(f"Error during audio preprocessing: {e}")
        # Handle specific errors (e.g., invalid audio format) if needed
        raise ValueError(f"Failed to preprocess audio: {e}")


# --- API Endpoint ---
@app.post("/predict")
async def predict(file: UploadFile = File(..., description="Audio file to process")):
    """
    Receives an audio file, preprocesses it, runs inference,
    and returns the dementia probability.
    """
    global model # Access the globally loaded model

    if model is None or feature_extractor is None:
        raise HTTPException(status_code=503, detail="Model or feature extractor not loaded.")

    print(f"Received file: {file.filename}, content type: {file.content_type}")

    # Read audio file bytes
    try:
        audio_bytes = await file.read()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read uploaded file: {e}")

    # Preprocess audio and extract features
    try:
        inputs = preprocess_audio(audio_bytes)
        input_values = inputs.get('input_values')
        attention_mask = inputs.get('attention_mask', None) # WavLM might create this

        if input_values is None:
             raise ValueError("Preprocessing did not return 'input_values'.")

        # Move tensors to the correct device
        input_values = input_values.to(DEVICE)
        if attention_mask is not None:
            attention_mask = attention_mask.to(DEVICE)

    except ValueError as e:
         # Error during preprocessing
         raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
         # Catch other unexpected errors during preprocessing
         print(f"Unexpected preprocessing error: {e}")
         raise HTTPException(status_code=500, detail="Internal server error during preprocessing.")


    # Perform inference
    print("Running inference...")
    probability = 0.0
    try:
        with torch.no_grad():
             # Use autocast if using AMP & GPU (recommended if you used it in training)
             with torch.amp.autocast(device_type=DEVICE.type, enabled=(DEVICE.type == 'cuda')):
                 logits = model(input_values=input_values, attention_mask=attention_mask)

             # Calculate probability
             probability = torch.sigmoid(logits).squeeze().item() # .item() gets Python number from tensor

        print(f"Inference successful. Raw logit: {logits.item():.4f}, Probability: {probability:.4f}")

    except Exception as e:
        print(f"Error during model inference: {e}")
        raise HTTPException(status_code=500, detail="Internal server error during model inference.")

    return {"probability": probability}

@app.get("/")
async def root():
    return {"message": "NeuroTone Dementia Detection API is running."}