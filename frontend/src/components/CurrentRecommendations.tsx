'use client';

import React from 'react';
import { recommendationsData, getCdrBandKeyFromScore } from '@/lib/recommendations';

interface ChartDataPoint {
  date: string;
  eCdrSb: number;
  rawP: number;
}

interface CurrentRecommendationsProps {
  chartData: ChartDataPoint[];
  baselineCdrSb: number | null;
}

export const CurrentRecommendations: React.FC<CurrentRecommendationsProps> = ({ chartData, baselineCdrSb }) => {
  // Determine the current score: latest from chart data, or baseline if no data
  const currentScore = chartData.length > 0
    ? chartData[chartData.length - 1].eCdrSb
    : baselineCdrSb;

  const currentBandKey = getCdrBandKeyFromScore(currentScore);
  const recommendation = currentBandKey ? recommendationsData[currentBandKey] : null;

  // Don't render if no baseline is set yet
  if (baselineCdrSb === null) {
      return null;
  }

  return (
    <div className="bg-[#f9f9f9] rounded-xl border-2 border-black overflow-hidden">
        <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-dark-blue">Current Recommendations</h2>
            {currentScore !== null ? (
                 <p className="text-sm text-medium-blue/70 mt-1">
                    Based on your latest estimated score of <span className="font-semibold">{currentScore.toFixed(2)}</span> (CDR-SB)
                 </p>
            ) : (
                 <p className="text-sm text-medium-blue/70 mt-1">Based on your baseline score</p>
            )}
        </div>

        <div className="p-6">
            {recommendation ? (
                <div>
                    <p className="text-md font-semibold text-blue-teal mb-1">{recommendation.label}</p>
                    <h3 className="text-lg font-bold text-dark-blue mb-3">{recommendation.title}</h3>
                    <ul className="space-y-2.5">
                        {recommendation.points.map((point, index) => (
                        <li key={index} className="flex items-start">
                            <svg className="flex-shrink-0 h-5 w-5 text-blue-teal mt-0.5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-medium-blue/90 text-sm">{point}</span>
                        </li>
                        ))}
                    </ul>
                </div>
            ) : currentBandKey === null && currentScore !== null ? (
                <p className="text-medium-blue/80">Your current score ({currentScore.toFixed(2)}) is outside the standard CDR-SB ranges.</p>
            ) : (
                 <p className="text-medium-blue/80">Recommendations will appear here based on your analysis results.</p>
            )}
             <p className="mt-6 text-xs text-medium-blue/60 text-center italic">
                These are general recommendations. Always consult with your healthcare provider for personalized advice and diagnosis.
            </p>
        </div>
    </div>
  );
}; 