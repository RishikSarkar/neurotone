'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';

export default function Dashboard() {
  const [isRecording, setIsRecording] = useState(false);
  
  // Sample data for the chart (will be replaced with real data later)
  const sampleQuestions = [
    "Please describe what you did yesterday in as much detail as possible.",
    "Tell me about the last movie or TV show you watched. What did you like or dislike about it?",
    "Describe your favorite place to visit and why it's special to you.",
    "If you could travel anywhere in the world, where would you go and why?"
  ];
  
  const startRecording = () => {
    setIsRecording(true);
  };
  
  const stopRecording = () => {
    setIsRecording(false);
    // Here we would process the recording and update results
  };
  
  return (
    // Outer container for flex structure
    <div className="flex flex-col min-h-screen">
      <Navbar />
      {/* Add pt-20 (h-20 of navbar) to main, keep min-h-screen if footer removed */}
      <main className="flex-grow pt-20 bg-bg-color">
        {/* Content div - adjust padding if needed, maybe remove py- top */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 pt-8">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h1 className="text-3xl font-bold text-dark-blue">Voice Analysis</h1>
              <p className="mt-1 text-medium-blue/80">Record your voice to start monitoring</p>
            </div>
            <div className="hidden md:block">
              <span className="inline-flex items-center rounded-full bg-blue-teal/10 px-3 py-1 text-sm font-medium text-medium-blue">
                <span className="mr-1 h-2 w-2 rounded-full bg-blue-teal"></span>
                Ready to record
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main content area */}
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-[#f9f9f9] rounded-xl overflow-hidden shadow-sm border border-gray-100">
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-xl font-semibold text-dark-blue">Voice Recording</h2>
                </div>
                
                {!isRecording ? (
                  <div className="p-8 flex flex-col items-center justify-center">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-teal/20 to-medium-blue/10 flex items-center justify-center mb-8">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-medium-blue/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                      </svg>
                    </div>
                    <button
                      onClick={startRecording}
                      className="inline-flex items-center px-6 py-3 bg-white text-gray-800 border border-black hover:border-transparent hover:bg-gradient-to-r hover:from-[#051934] hover:to-[#98b7b3] hover:text-white rounded-xl font-medium transition-[background-color,color] duration-100 ease-linear hover:animate-gradient-wave bg-[length:200%_auto]"
                    >
                      Start Recording
                    </button>
                  </div>
                ) : (
                  <div className="p-8 flex flex-col items-center justify-center">
                    <div className="w-32 h-32 rounded-full bg-red-50 border-4 border-red-500/30 flex items-center justify-center mb-8 relative">
                      <div className="w-20 h-20 bg-red-500 rounded-full animate-pulse"></div>
                      <div className="absolute inset-0 rounded-full border-4 border-red-500 opacity-30 animate-ping"></div>
                    </div>
                    <p className="text-medium-blue/90 font-medium mb-6">Recording in progress...</p>
                    <button
                      onClick={stopRecording}
                      className="inline-flex items-center px-6 py-3 bg-white text-gray-800 border border-black hover:border-transparent hover:bg-gradient-to-r hover:from-[#051934] hover:to-[#98b7b3] hover:text-white rounded-xl font-medium transition-[background-color,color] duration-100 ease-linear hover:animate-gradient-wave bg-[length:200%_auto]"
                    >
                      Stop Recording
                    </button>
                  </div>
                )}
              </div>
              
              <div className="bg-[#f9f9f9] rounded-xl overflow-hidden shadow-sm border border-gray-100">
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-xl font-semibold text-dark-blue">Speaking Prompts</h2>
                </div>
                <div className="p-6">
                  <ul className="space-y-3">
                    {sampleQuestions.map((question, index) => (
                      <li key={index} className="p-4 bg-blue-teal/5 rounded-lg">
                        <p className="text-medium-blue">{question}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            
            {/* Sidebar */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-[#f9f9f9] rounded-xl overflow-hidden shadow-sm border border-gray-100">
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-xl font-semibold text-dark-blue">Analysis</h2>
                </div>
                <div className="p-6">
                  <div className="flex flex-col items-center justify-center py-8">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-blue-teal/30 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <p className="text-medium-blue/70 text-center">Complete a recording to see analysis results</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-[#f9f9f9] rounded-xl overflow-hidden shadow-sm border border-gray-100">
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
                        <p className="text-medium-blue">Record your voice speaking naturally</p>
                      </div>
                    </div>
                    <div className="flex">
                      <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 bg-blue-teal/10 rounded-full mr-3">
                        <span className="text-sm font-medium text-medium-blue">2</span>
                      </div>
                      <div>
                        <p className="text-medium-blue">Our AI analyzes your speech patterns</p>
                      </div>
                    </div>
                    <div className="flex">
                      <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 bg-blue-teal/10 rounded-full mr-3">
                        <span className="text-sm font-medium text-medium-blue">3</span>
                      </div>
                      <div>
                        <p className="text-medium-blue">View your analysis results and track changes over time</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      {/* Footer removed as per original request */}
    </div>
  );
} 