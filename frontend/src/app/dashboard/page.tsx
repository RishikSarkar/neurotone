'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import RealTimeWaveform from '@/components/RealTimeWaveform';
import { motion, AnimatePresence } from 'framer-motion';

const sampleQuestions = [
  "Please describe what you did yesterday in as much detail as possible.",
  "Tell me about the last movie or TV show you watched. What did you like or dislike about it?",
  "Describe your favorite place to visit and why it's special to you.",
  "If you could travel anywhere in the world, where would you go and why?",
  "Read the following sentence: The quick brown fox jumps over the lazy dog.",
  "Describe the steps involved in making a cup of tea or coffee."
];

type PermissionStatus = 'idle' | 'prompted' | 'granted' | 'denied';

export default function Dashboard() {
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus>('idle');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [predictionResult, setPredictionResult] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState<string>('');
  const [showRecordingModal, setShowRecordingModal] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioStreamRef = useRef<MediaStream | null>(null);

  const cleanupAudio = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(track => track.stop());
      audioStreamRef.current = null;
    }
    mediaRecorderRef.current = null;
    audioChunksRef.current = [];
    setAudioBlob(null);
  }, []);

  useEffect(() => {
    return () => {
      cleanupAudio();
    };
  }, [cleanupAudio]);

  const requestPermission = async () => {
    setPermissionStatus('prompted');
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;
      setPermissionStatus('granted');
      return stream;
    } catch {
      setError("Microphone permission is required to record audio. Please grant access in your browser settings.");
      setPermissionStatus('denied');
      cleanupAudio();
      return null;
    }
  };

  const startRecording = async () => {
    setError(null);
    setPredictionResult(null);

    let stream = audioStreamRef.current;

    if (!stream || permissionStatus !== 'granted') {
      stream = await requestPermission();
      if (!stream) return;
    }

    if (window.AudioContext && window.AudioContext.prototype && typeof window.AudioContext.prototype.resume === 'function') {
      const tempContext = new (window.AudioContext || window.webkitAudioContext)();
      if (tempContext.state === 'suspended') {
        await tempContext.resume().catch(() => console.warn("Could not resume audio context:"));
      }
      await tempContext.close().catch(() => console.warn("Could not close temp audio context:"));
    }

    const randomIndex = Math.floor(Math.random() * sampleQuestions.length);
    setCurrentPrompt(sampleQuestions[randomIndex]);

    audioChunksRef.current = [];
    setAudioBlob(null);

    try {
      const options = { mimeType: 'audio/wav' };
      let recorder: MediaRecorder;
      try {
        recorder = new MediaRecorder(stream, options);
      } catch (e) {
        recorder = new MediaRecorder(stream);
      }
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: recorder.mimeType || 'audio/wav' });
        setAudioBlob(blob);
      };

      recorder.onerror = () => {
        setError("An error occurred during recording.");
        cleanupAudio();
        setIsRecording(false);
        setShowRecordingModal(false);
      };

      recorder.start();
      setIsRecording(true);
      setShowRecordingModal(true);
    } catch {
      setError("Could not start recording. Please ensure your microphone is connected and permissions are granted.");
      cleanupAudio();
    }
  };

  const stopRecordingAndProcess = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const sendAudioToBackend = async (blob: Blob) => {
    if (!blob) {
      setError("No audio data captured.");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setPredictionResult(null);

    const formData = new FormData();
    const fileName = `recording.${blob.type.split('/')[1] || 'wav'}`;
    formData.append('file', blob, fileName);

    try {
      const response = await fetch('http://localhost:8000/predict', {
        method: 'POST',
        body: formData,
        headers: {
          'accept': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Backend error: ${response.status} ${response.statusText}. ${errorData}`);
      }

      const result = await response.json();

      if (typeof result.probability === 'number') {
        setPredictionResult(result.probability);
      } else {
        throw new Error("Invalid probability value received from backend.");
      }

    } catch (err) {
      let message = "Failed to process audio. Please try again.";
      if (err instanceof Error) {
        if (err.message.includes('Failed to fetch')) {
          message = "Could not connect to the analysis server. Please ensure it's running and accessible.";
        } else {
          message = err.message;
        }
      }
      setError(message);
      setPredictionResult(null);
    } finally {
      setIsProcessing(false);
      setShowRecordingModal(false);
      cleanupAudio();
    }
  };

  useEffect(() => {
    if (audioBlob && !isRecording && !isProcessing) {
      sendAudioToBackend(audioBlob);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioBlob, isRecording, isProcessing]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow pt-20 bg-bg-color">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 pt-8">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h1 className="text-3xl font-bold text-dark-blue">Voice Analysis</h1>
              <p className="mt-1 text-medium-blue/80">Record your voice to start monitoring</p>
            </div>
            <div className="hidden md:block">
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${isRecording ? 'bg-red-100 text-red-700' : 'bg-blue-teal/10 text-medium-blue'}`}>
                <span className={`mr-1.5 h-2 w-2 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-blue-teal'}`}></span>
                {isRecording ? 'Recording Active' : (permissionStatus === 'granted' ? 'Ready to record' : 'Mic check needed')}
              </span>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-800 rounded-lg">
              <p className="font-medium">Error:</p>
              <p>{error}</p>
              {permissionStatus === 'denied' && (
                <p className="text-sm mt-1">You may need to adjust permissions in your browser's site settings and refresh the page.</p>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-[#f9f9f9] rounded-xl border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-xl font-semibold text-dark-blue">Voice Recording</h2>
                </div>
                <div className="p-8 flex flex-col items-center justify-center">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-teal/20 to-medium-blue/10 flex items-center justify-center mb-8">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-medium-blue/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </div>
                  <button
                    onClick={startRecording}
                    disabled={isRecording || isProcessing}
                    className="inline-flex items-center px-6 py-3 bg-white text-gray-800 border border-black hover:border-transparent hover:bg-gradient-to-r hover:from-[#051934] hover:to-[#98b7b3] hover:text-white rounded-xl font-medium transition-[background-color,color] duration-100 ease-linear hover:animate-gradient-wave bg-[length:200%_auto] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {permissionStatus === 'granted' ? 'Start Recording' : 'Check Mic & Start'}
                  </button>
                  {permissionStatus === 'denied' && <p className="mt-4 text-sm text-red-600">Microphone access denied.</p>}
                  {permissionStatus === 'prompted' && <p className="mt-4 text-sm text-medium-blue">Waiting for microphone permission...</p>}
                </div>
              </div>

              <div className="bg-[#f9f9f9] rounded-xl border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-xl font-semibold text-dark-blue">Speaking Prompts</h2>
                  <p className="text-sm text-medium-blue/70 mt-1">A prompt will be shown when you start recording.</p>
                </div>
                <div className="p-6">
                  <ul className="space-y-3 max-h-60 overflow-y-auto">
                    {sampleQuestions.map((question, index) => (
                      <li key={index} className="p-3 bg-blue-teal/5 rounded-lg">
                        <p className="text-sm text-medium-blue">{question}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-6">
              <div className="bg-[#f9f9f9] rounded-xl border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-xl font-semibold text-dark-blue">Analysis Result</h2>
                </div>
                <div className="p-6 min-h-[150px] flex items-center justify-center">
                  {isProcessing ? (
                    <div className="flex flex-col items-center text-medium-blue/80">
                      <svg className="animate-spin h-8 w-8 text-blue-teal mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing audio...
                    </div>
                  ) : predictionResult !== null ? (
                    <div className="text-center">
                      <p className="text-lg font-semibold text-dark-blue mb-1">Probability Score:</p>
                      <p className="text-4xl font-bold text-blue-teal mb-3">
                        {(predictionResult * 100).toFixed(1)}%
                      </p>
                      <p className="text-sm text-medium-blue/70">(Higher score may indicate similarity to patterns associated with certain conditions)</p>
                    </div>
                  ) : error && !error.toLowerCase().includes("permission") ? (
                    <p className="text-medium-blue/90 text-center">Analysis failed. {error}</p>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-teal/30 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <p className="text-medium-blue/70">Complete a recording to see analysis results.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-[#f9f9f9] rounded-xl border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-xl font-semibold text-dark-blue">How It Works</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex">
                      <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 bg-blue-teal/10 rounded-full mr-3">
                        <span className="text-sm font-medium text-medium-blue">1</span>
                      </div>
                      <div>
                        <p className="text-medium-blue">Start recording & read the prompt</p>
                      </div>
                    </div>
                    <div className="flex">
                      <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 bg-blue-teal/10 rounded-full mr-3">
                        <span className="text-sm font-medium text-medium-blue">2</span>
                      </div>
                      <div>
                        <p className="text-medium-blue">Stop recording to send audio for analysis</p>
                      </div>
                    </div>
                    <div className="flex">
                      <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 bg-blue-teal/10 rounded-full mr-3">
                        <span className="text-sm font-medium text-medium-blue">3</span>
                      </div>
                      <div>
                        <p className="text-medium-blue">View your probability score</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {showRecordingModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="bg-[#f9f9f9] rounded-xl border border-gray-100 w-full max-w-3xl h-[70vh] flex flex-col overflow-hidden"
            >
              <div className="p-6 border-b border-gray-200 bg-white/50">
                <p className="text-lg font-medium text-center text-dark-blue">Please read the following prompt:</p>
                <p className="text-xl text-center mt-2 text-medium-blue">{currentPrompt}</p>
              </div>

              <div className="flex-grow p-6 relative">
                <RealTimeWaveform audioStream={audioStreamRef.current} />
                {isRecording && <div className="absolute top-8 right-8 text-xs font-medium text-red-600 animate-pulse">RECORDING</div>}
              </div>

              <div className="p-6 border-t border-gray-200 bg-white/50 flex justify-center">
                <button
                  onClick={stopRecordingAndProcess}
                  disabled={!isRecording || isProcessing}
                  className="inline-flex items-center px-6 py-3 bg-white text-gray-800 border border-black hover:border-transparent hover:bg-gradient-to-r hover:from-[#051934] hover:to-[#98b7b3] hover:text-white rounded-xl font-medium transition-[background-color,color] duration-100 ease-linear hover:animate-gradient-wave bg-[length:200%_auto] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : 'Stop Recording & Analyze'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 