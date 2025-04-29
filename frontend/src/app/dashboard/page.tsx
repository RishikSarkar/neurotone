'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import RealTimeWaveform from '@/components/RealTimeWaveform';
import { CdrTrajectoryChart, cdrBucketMidpoints } from '@/components/CdrTrajectoryChart';
import { CurrentRecommendations } from '@/components/CurrentRecommendations';
import { getCdrBandKeyFromScore, recommendationsData } from '@/lib/recommendations';
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

interface ChartDataPoint {
  date: string;
  eCdrSb: number;
  rawP: number;
}

const cdrBuckets: string[] = ['0', '0.5', '1', '2', '3'];

const getPriorDistribution = (globalCdr: number | null): Record<string, number> | null => {
  if (globalCdr === null) return null;
  switch (globalCdr) {
    case 0:   return { '0': 0.70, '0.5': 0.15, '1': 0.10, '2': 0.04, '3': 0.01 };
    case 0.5: return { '0': 0.15, '0.5': 0.60, '1': 0.15, '2': 0.05, '3': 0.05 };
    case 1:   return { '0': 0.05, '0.5': 0.15, '1': 0.60, '2': 0.15, '3': 0.05 };
    case 2:   return { '0': 0.01, '0.5': 0.04, '1': 0.15, '2': 0.60, '3': 0.20 };
    case 3:   return { '0': 0.01, '0.5': 0.01, '1': 0.03, '2': 0.25, '3': 0.70 };
    default:  return { '0': 0.2, '0.5': 0.2, '1': 0.2, '2': 0.2, '3': 0.2 };
  }
};

const getLikelihoods = (probability: number): Record<string, number> => {
  const pImpairment = probability;
  const pNoImpairment = 1 - probability;

  // Define severity weights (adjust these based on calibration/desired sensitivity)
  // These weights scale the base 'pImpairment' likelihood for each bucket.
  // Weight for '0' is implicitly handled by using pNoImpairment.
  const severityWeights: Record<string, number> = {
    '0.5': 0.6, // Questionable/Very Mild
    '1':   0.8, // Mild
    '2':   0.9, // Moderate
    '3':   1.0, // Severe (gets the full impact of pImpairment)
  };

  const likelihoods: Record<string, number> = {
    '0': pNoImpairment, // Likelihood for CDR=0 bucket remains based on no impairment
  };

  // Calculate likelihood for impairment buckets based on weights
  for (const bucket of ['0.5', '1', '2', '3']) {
    // Likelihood = P(impairment detected) * Weight(severity bucket)
    // We multiply by pImpairment. If pImpairment is low, all these likelihoods are low.
    // If pImpairment is high, the likelihood is scaled by the bucket's weight.
    likelihoods[bucket] = pImpairment * severityWeights[bucket];

    // Ensure likelihood doesn't exceed 1 (though mathematically unlikely with weights <= 1)
    likelihoods[bucket] = Math.min(1, Math.max(0, likelihoods[bucket]));
  }

  // --- Optional: Normalization ---
  // Strictly speaking, likelihoods don't *have* to be normalized for Bayes update,
  // but sometimes it helps prevent tiny float values if p is very small.
  // If you uncomment this, test carefully.
  // let likelihoodSum = 0;
  // for(const bucket of cdrBuckets) { likelihoodSum += likelihoods[bucket]; }
  // if (likelihoodSum > 0) {
  //   for(const bucket of cdrBuckets) { likelihoods[bucket] /= likelihoodSum; }
  // }
  // --- End Optional Normalization ---

  return likelihoods;
};

const updatePosterior = (
  prior: Record<string, number>,
  likelihoods: Record<string, number>
): Record<string, number> => {
  const unnormalizedPosterior: Record<string, number> = {};
  let totalProbability = 0;

  for (const bucket of cdrBuckets) {
    unnormalizedPosterior[bucket] = prior[bucket] * likelihoods[bucket];
    totalProbability += unnormalizedPosterior[bucket];
  }

  const posterior: Record<string, number> = {};
  if (totalProbability === 0) {
      console.warn("Total probability is zero during posterior update, returning prior.");
      return prior;
  }
  for (const bucket of cdrBuckets) {
    posterior[bucket] = unnormalizedPosterior[bucket] / totalProbability;
  }
  return posterior;
};

const calculateExpectedCdrSb = (posterior: Record<string, number>): number => {
  let expectedValue = 0;
  for (const bucket of cdrBuckets) {
    expectedValue += posterior[bucket] * cdrBucketMidpoints[bucket];
  }
  return expectedValue;
};

const applyEmaSmoothing = (data: ChartDataPoint[], alpha: number = 0.3): ChartDataPoint[] => {
    if (!data || data.length === 0) return [];
    const smoothedData = [...data];

    for (let i = 1; i < smoothedData.length; i++) {
        smoothedData[i].eCdrSb = alpha * data[i].eCdrSb + (1 - alpha) * smoothedData[i-1].eCdrSb;
    }
    return smoothedData;
};

// --- Local Storage Keys ---
const LS_BASELINE_SB = 'baselineCdrSb';
const LS_BASELINE_GLOBAL = 'baselineGlobalCdr';
const LS_CHART_DATA = 'chartData';
const LS_POSTERIOR = 'currentPosterior';

export default function Dashboard() {
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus>('idle');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [predictionResult, setPredictionResult] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState<string>('');
  const [showRecordingModal, setShowRecordingModal] = useState(false);

  const [baselineCdrSb, setBaselineCdrSb] = useState<number | null>(null);
  const [baselineGlobalCdr, setBaselineGlobalCdr] = useState<number | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [currentPosterior, setCurrentPosterior] = useState<Record<string, number> | null>(null);
  const [isChartLoading, setIsChartLoading] = useState<boolean>(true);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    setIsChartLoading(true);
    try {
        const storedBaselineSb = localStorage.getItem(LS_BASELINE_SB);
        const storedBaselineGlobal = localStorage.getItem(LS_BASELINE_GLOBAL);
        const storedChartData = localStorage.getItem(LS_CHART_DATA);
        const storedPosterior = localStorage.getItem(LS_POSTERIOR);

        const loadedBaselineSb = storedBaselineSb ? parseFloat(storedBaselineSb) : null;
        const loadedBaselineGlobal = storedBaselineGlobal ? parseFloat(storedBaselineGlobal) : null;
        const loadedChartData: ChartDataPoint[] = storedChartData ? JSON.parse(storedChartData) : [];
        const loadedPosterior = storedPosterior ? JSON.parse(storedPosterior) : null;

        setBaselineCdrSb(loadedBaselineSb);
        setBaselineGlobalCdr(loadedBaselineGlobal);
        setChartData(loadedChartData);

        if (loadedChartData.length === 0 && loadedBaselineGlobal !== null) {
            setCurrentPosterior(getPriorDistribution(loadedBaselineGlobal));
        } else {
             setCurrentPosterior(loadedPosterior);
        }

        console.log("Loaded Baseline SB:", loadedBaselineSb);
        console.log("Loaded Baseline Global:", loadedBaselineGlobal);
        console.log("Loaded Chart Data:", loadedChartData);
        console.log("Loaded Posterior:", loadedPosterior || getPriorDistribution(loadedBaselineGlobal));

    } catch (error) {
        console.error("Error loading data from local storage:", error);
        setError("Could not load previous analysis data.");
        setBaselineCdrSb(null);
        setBaselineGlobalCdr(null);
        setChartData([]);
        setCurrentPosterior(null);
    } finally {
        setIsChartLoading(false);
    }
  }, []);

  useEffect(() => {
      if (!isChartLoading) {
          try {
              localStorage.setItem(LS_CHART_DATA, JSON.stringify(chartData));
              if (currentPosterior) {
                  localStorage.setItem(LS_POSTERIOR, JSON.stringify(currentPosterior));
              }
          } catch (error) {
              console.error("Error saving data to local storage:", error);
          }
      }
  }, [chartData, currentPosterior, isChartLoading]);

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
      } catch {
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
        setIsRecording(false);
      };

      recorder.onerror = (event: Event) => {
        console.error("MediaRecorder error:", event);
        setError(`An error occurred during recording: ${(event as any)?.error?.message || 'Unknown error'}`);
        cleanupAudio();
        setIsRecording(false);
        setShowRecordingModal(false);
        setIsProcessing(false);
      };

      recorder.start();
      setIsRecording(true);
      setShowRecordingModal(true);
    } catch (err) {
      console.error("Could not start recording:", err);
      setError("Could not start recording. Please ensure your microphone is connected and permissions are granted.");
      cleanupAudio();
    }
  };

  const stopRecordingAndProcess = () => {
    if (mediaRecorderRef.current && isRecording) {
        console.log("Stopping recording...");
        setShowRecordingModal(false);
        mediaRecorderRef.current.stop();
    } else {
        console.log("Stop called but no active recorder or not recording.");
        setShowRecordingModal(false);
    }
  };

  const sendAudioToBackend = (blob: Blob) => {
    if (!blob) {
      setError("No audio data captured.");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setPredictionResult(null);

    console.log("Simulating backend processing with progressive increase...");

    // Simulate delay (random between 4 and 10 seconds)
    const delay = Math.random() * (10000 - 4000) + 4000; // ms

    // --- Calculate the target probability based on history ---
    // Get the number of previous recordings
    const numberOfPreviousRecordings = chartData.length;

    // Define the increase step per recording
    const increaseStep = 0.15; // Target increase each time

    // Calculate the base probability target for this recording
    // For the first recording (index 0), target is 0. For the second (index 1), target is 0.15, etc.
    const baseTargetProbability = numberOfPreviousRecordings * increaseStep;

    // Add some randomness around the target (+/- 0.05 for example)
    const randomnessRange = 0.1; // Total range of randomness (e.g., 0.1 means -0.05 to +0.05)
    const randomOffset = (Math.random() * randomnessRange) - (randomnessRange / 2);

    // Calculate the raw simulated probability
    const rawSimulatedProbability = baseTargetProbability + randomOffset;

    // Clamp the probability between 0.0 and 1.0
    const clampedProbability = Math.max(0, Math.min(1, rawSimulatedProbability));

    console.log(`Previous recordings: ${numberOfPreviousRecordings}`);
    console.log(`Base target probability: ${baseTargetProbability.toFixed(3)}`);
    console.log(`Random offset: ${randomOffset.toFixed(3)}`);
    console.log(`Raw simulated probability: ${rawSimulatedProbability.toFixed(3)}`);
    console.log(`Clamped simulated probability: ${clampedProbability.toFixed(3)}`);
    // --- End of probability calculation ---


    setTimeout(() => {
      try {
        // Use the calculated and clamped probability
        console.log(`Simulation complete. Setting Probability: ${clampedProbability.toFixed(3)}`);
        setPredictionResult(clampedProbability);

      } catch (err) {
        // Handle potential errors during simulation (less likely here)
        console.error("Error during simulation:", err);
        setError("An unexpected error occurred during analysis simulation.");
        setPredictionResult(null);
      } finally {
        setIsProcessing(false); // Stop processing indicator
        setAudioBlob(null); // Clear the processed blob
      }
    }, delay);
  };

  useEffect(() => {
    if (audioBlob && !isProcessing) {
      sendAudioToBackend(audioBlob);
    }
  }, [audioBlob]);

  useEffect(() => {
    let processed = false;
    if (predictionResult !== null && !isChartLoading && chartData !== null) {
      processed = true;
      console.log("--- Bayesian Update Cycle ---");
      console.log("Input Probability (p):", predictionResult.toFixed(3));

      // Determine the initial prior source
      let prior = currentPosterior ?? getPriorDistribution(baselineGlobalCdr);

      // --- FIX: Handle null prior case ---
      if (!prior) {
         console.warn("Prior calculation resulted in null (likely missing baseline/posterior). Using default uniform prior.");
         // Assign a default uniform prior
         prior = { '0': 0.2, '0.5': 0.2, '1': 0.2, '2': 0.2, '3': 0.2 };
         // Optionally set an error message, but allow processing to continue
         // setError("Warning: Using default prior due to missing baseline data.");
      }
      // --- End FIX ---
      
      // Now 'prior' is guaranteed to be an object, proceed with calculations
      console.log("Using Prior Distribution:", JSON.stringify(prior, null, 2));

      const likelihoods = getLikelihoods(predictionResult);
      console.log("Calculated Likelihoods:", JSON.stringify(likelihoods, null, 2));

      const newPosterior = updatePosterior(prior, likelihoods);
      console.log("Calculated New Posterior Distribution:", JSON.stringify(newPosterior, null, 2));

      const newECdrSb = calculateExpectedCdrSb(newPosterior);
      console.log("Calculated E[CDR-SB]:", newECdrSb.toFixed(3));

      const newDataPoint: ChartDataPoint = {
        date: new Date().toISOString(),
        eCdrSb: newECdrSb,
        rawP: predictionResult,
      };

      setChartData(prevData => {
          const validPrevData = Array.isArray(prevData) ? prevData : [];
          return [...validPrevData, newDataPoint];
      });
      setCurrentPosterior(newPosterior);

      console.log("Update complete. Chart data and current posterior state updated.");
      console.log("-----------------------------");

      setPredictionResult(null);
    }

    return () => {
      
    }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [predictionResult, isChartLoading, baselineGlobalCdr, currentPosterior, chartData]);

  const smoothedChartData = applyEmaSmoothing(chartData);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow pt-20 bg-bg-color">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 pt-8">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h1 className="text-3xl font-bold text-dark-blue">Voice Analysis</h1>
              <p className="mt-1 text-medium-blue/80">Record your voice to monitor progress</p>
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
                <p className="text-sm mt-1">You may need to adjust permissions in your browser&apos;s site settings and refresh the page.</p>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-black rounded-xl border border-blue-teal/20 overflow-hidden text-white">
                <div className="p-6 border-b border-blue-teal/20">
                  <h2 className="text-xl font-semibold text-white">Voice Recording</h2>
                </div>
                <div className="p-10 flex flex-col items-center justify-center">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-medium-blue/40 to-blue-teal/30 flex items-center justify-center mb-8 ring-1 ring-blue-teal/30">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-primary-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </div>
                  <button
                    onClick={startRecording}
                    disabled={isRecording || isProcessing || permissionStatus === 'denied'}
                    className="inline-flex items-center px-8 py-3 bg-white text-gray-900 border border-transparent hover:border-transparent hover:bg-gradient-to-r hover:from-primary-teal/80 hover:to-blue-teal/80 hover:text-gray-900 rounded-lg font-semibold transition-all duration-150 ease-linear hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-primary-teal disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 cursor-pointer"
                  >
                    {permissionStatus === 'granted' ? 'Start Recording' : 'Check Mic & Start'}
                  </button>
                  {permissionStatus === 'denied' && <p className="mt-4 text-sm text-red-400">Microphone access denied. Check browser settings.</p>}
                  {permissionStatus === 'prompted' && <p className="mt-4 text-sm text-blue-teal">Waiting for microphone permission...</p>}
                </div>
              </div>

              <div className="bg-[#f9f9f9] rounded-xl border-2 border-black overflow-hidden">
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

              <div className="bg-[#f9f9f9] rounded-xl border-2 border-black overflow-hidden">
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
                        <p className="text-medium-blue">View your updated progress chart</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-6">
              <div className="bg-black rounded-xl border border-blue-teal/20 overflow-hidden relative text-gray-300">
                  {isProcessing && (
                      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center">
                          <svg className="animate-spin h-10 w-10 text-primary-teal mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <p className="text-lg font-medium text-gray-200">Processing audio...</p>
                      </div>
                  )}

                  <div className="p-6 border-b border-blue-teal/20 flex justify-between items-center">
                      <h2 className="text-xl font-semibold text-white">Analysis Results</h2>
                  </div>
                  <CdrTrajectoryChart
                      data={smoothedChartData}
                      baselineCdrSb={baselineCdrSb}
                      loading={isChartLoading}
                      currentScore={chartData.length > 0 ? chartData[chartData.length - 1].eCdrSb : baselineCdrSb}
                  />
                  <div className="p-4 border-t border-blue-teal/20">
                      <p className="text-xs text-white text-center">
                          This chart shows the estimated Clinical Dementia Rating (CDR) Sum-of-Boxes score over time, updated with each voice analysis. Bands indicate severity levels. This is a screening tool, not a diagnosis. Consult a healthcare professional.
                      </p>
                  </div>
              </div>

              <CurrentRecommendations
                  chartData={chartData}
                  baselineCdrSb={baselineCdrSb}
              />
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
              className="bg-black rounded-xl border border-blue-teal/20 w-full max-w-3xl h-[70vh] flex flex-col overflow-hidden shadow-xl text-gray-300"
            >
              <div className="p-6 border-b border-blue-teal/20">
                <p className="text-lg font-medium text-center text-gray-100">Please read the following prompt:</p>
                <p className="text-xl text-center mt-2 text-primary-teal">{currentPrompt}</p>
              </div>

              <div className="flex-grow p-6 relative bg-black">
                <RealTimeWaveform audioStream={audioStreamRef.current} />
                {isRecording && <div className="absolute top-8 right-8 text-xs font-medium text-white animate-pulse">RECORDING</div>}
              </div>

              <div className="p-6 border-t border-blue-teal/20 flex justify-center">
                <button
                  onClick={stopRecordingAndProcess}
                  disabled={!isRecording}
                  className="inline-flex items-center px-6 py-3 bg-white text-gray-900 border border-transparent hover:border-transparent hover:bg-gradient-to-r hover:from-primary-teal/80 hover:to-blue-teal/80 hover:text-gray-900 rounded-xl font-semibold transition-all duration-150 ease-linear hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-primary-teal disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 cursor-pointer"
                >
                  Stop Recording & Analyze
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 