'use client';

import { useState, useEffect } from 'react';

const LoadingPopup = ({ isVisible, type = 'parsing' }) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [dots, setDots] = useState('');

  // Different message sets for different operations
  const messageSets = {
    parsing: [
      "🔍 Analyzing your resume",
      "🧠 Extracting skills with AI magic",
      "✨ Sprinkling some tech dust",
      "🎯 Matching skills to job requirements",
      "🚀 Preparing your skill arsenal"
    ],
    generating: [
      "🎨 Crafting perfect bullet points",
      "✨ Adding AI magic to your resume",
      "🚀 Generating cover letter magic",
      "🎯 Tailoring content to the job",
      "💫 Sprinkling professional stardust",
      "🔥 Igniting your career potential"
    ]
  };

  const messages = messageSets[type] || messageSets.parsing;

  // Cycle through messages every 2 seconds
  useEffect(() => {
    if (!isVisible) return;

    const messageInterval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
    }, 2000);

    return () => clearInterval(messageInterval);
  }, [isVisible, messages.length]);

  // Animate dots
  useEffect(() => {
    if (!isVisible) return;

    const dotsInterval = setInterval(() => {
      setDots((prev) => {
        if (prev === '...') return '';
        return prev + '.';
      });
    }, 500);

    return () => clearInterval(dotsInterval);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-80 mx-4">
        {/* Document Checking Animation - Matching Reference */}
        <div className="flex justify-center mb-6">
          <div className="w-40 h-40 flex items-center justify-center relative">
            {/* Back Document (Blue) */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-24 h-32 bg-blue-600 rounded-lg shadow-lg relative -z-10" style={{ transform: 'translate(-4px, -4px)' }}>
                <div className="p-3">
                  <div className="h-1 bg-blue-200 rounded mb-2"></div>
                  <div className="h-1 bg-blue-200 rounded mb-2 w-3/4"></div>
                  <div className="h-1 bg-blue-200 rounded mb-2 w-1/2"></div>
                  <div className="h-1 bg-blue-200 rounded mb-2 w-5/6"></div>
                  <div className="h-1 bg-blue-200 rounded mb-2 w-2/3"></div>
                </div>
              </div>
            </div>
            
            {/* Front Document (White) */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-24 h-32 bg-white border-2 border-gray-200 rounded-lg shadow-lg relative z-10">
                <div className="p-3">
                  {/* Checkmark in top-left */}
                  <div className="flex items-center mb-3">
                    <div className="w-4 h-4 bg-blue-600 rounded-sm flex items-center justify-center mr-2">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div className="h-2 bg-blue-600 rounded w-16"></div>
                  </div>
                  
                  {/* Bullet points with text fields */}
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-gray-300 rounded-full mr-2"></div>
                      <div className="h-1.5 bg-gray-300 rounded w-12"></div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-gray-300 rounded-full mr-2"></div>
                      <div className="h-1.5 bg-gray-300 rounded w-16"></div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-gray-300 rounded-full mr-2"></div>
                      <div className="h-1.5 bg-gray-300 rounded w-10"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Large Gear (overlapping bottom-right) */}
            <div className="absolute bottom-2 right-2 w-12 h-12 animate-spin z-20" style={{ animationDuration: '2s' }}>
              <svg className="w-12 h-12 text-blue-600" fill="currentColor" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="currentColor"/>
                <circle cx="50" cy="50" r="15" fill="white"/>
                {/* Gear teeth */}
                <rect x="48" y="5" width="4" height="12" fill="currentColor"/>
                <rect x="48" y="83" width="4" height="12" fill="currentColor"/>
                <rect x="5" y="48" width="12" height="4" fill="currentColor"/>
                <rect x="83" y="48" width="12" height="4" fill="currentColor"/>
                <rect x="15" y="15" width="4" height="12" fill="currentColor" transform="rotate(45 17 21)"/>
                <rect x="81" y="73" width="4" height="12" fill="currentColor" transform="rotate(45 83 79)"/>
                <rect x="73" y="15" width="4" height="12" fill="currentColor" transform="rotate(-45 75 21)"/>
                <rect x="15" y="73" width="4" height="12" fill="currentColor" transform="rotate(-45 17 79)"/>
              </svg>
            </div>
            
            {/* Small Gear (behind large gear) */}
            <div className="absolute bottom-4 right-6 w-8 h-8 animate-spin z-10" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }}>
              <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="35" fill="currentColor"/>
                <circle cx="50" cy="50" r="12" fill="white"/>
                {/* Gear teeth */}
                <rect x="48" y="8" width="4" height="10" fill="currentColor"/>
                <rect x="48" y="82" width="4" height="10" fill="currentColor"/>
                <rect x="8" y="48" width="10" height="4" fill="currentColor"/>
                <rect x="82" y="48" width="10" height="4" fill="currentColor"/>
                <rect x="20" y="20" width="4" height="10" fill="currentColor" transform="rotate(45 22 25)"/>
                <rect x="76" y="70" width="4" height="10" fill="currentColor" transform="rotate(45 78 75)"/>
                <rect x="70" y="20" width="4" height="10" fill="currentColor" transform="rotate(-45 72 25)"/>
                <rect x="20" y="70" width="4" height="10" fill="currentColor" transform="rotate(-45 22 75)"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Fun message */}
        <div className="text-center">
          <h3 className="text-xl font-bold text-gray-800">
            {messages[currentMessageIndex]}
          </h3>
        </div>
      </div>
    </div>
  );
};

export default LoadingPopup;
