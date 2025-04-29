'use client';

import React from 'react';
import { motion } from 'framer-motion'; // Import motion
import { Recommendation, recommendationsData } from '@/lib/recommendations'; // Import types and data

interface RecommendationAlertProps {
  bandKey: string; // The key ('0', '0.5', '1', '2', '3') for the active alert
  onDismiss: (bandKey: string) => void;
}

export const RecommendationAlert: React.FC<RecommendationAlertProps> = ({ bandKey, onDismiss }) => {
  const recommendation = recommendationsData[bandKey];

  if (!recommendation) {
    // Should not happen if called correctly, but good practice
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="mb-6 p-5 bg-blue-teal/10 border border-blue-teal/30 text-medium-blue rounded-lg shadow-md"
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="text-sm font-semibold text-blue-teal uppercase tracking-wide">{recommendation.label}</p>
          <h3 className="text-lg font-bold text-dark-blue mt-1">{recommendation.title}</h3>
        </div>
        <button
          onClick={() => onDismiss(bandKey)}
          className="text-gray-400 hover:text-gray-600 transition-colors text-xl font-light p-1 -mt-1 -mr-1"
          aria-label="Dismiss recommendation"
        >
          × {/* Simple close icon */}
        </button>
      </div>

      <ul className="space-y-2 list-disc list-inside text-sm">
        {recommendation.points.map((point, index) => (
          <li key={index}>{point}</li>
        ))}
      </ul>

      {/* Optional: Add resource links here if defined in recommendationsData */}
      {/* {recommendation.links && recommendation.links.length > 0 && (
         <div className="mt-4 pt-3 border-t border-blue-teal/20">
           <p className="text-xs font-semibold text-gray-600 mb-1">Resources:</p>
           <ul className="space-y-1">
             {recommendation.links.map((link, i) => (
                <li key={i}>
                   <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">{link.text}</a>
                </li>
             ))}
           </ul>
         </div>
       )} */}
    </motion.div>
  );
}; 