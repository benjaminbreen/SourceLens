// components/upload/UploadProgress.tsx
// Enhanced progress indicator for file uploads and processing
// Features smooth animations, clear status messaging, and optimized positioning

'use client';

import React, { useEffect, useState } from 'react';

interface UploadProgressProps {
  show: boolean;
  progress: number;
  currentMessage: string;
  messages: string[];
}

export default function UploadProgress({ 
  show, 
  progress, 
  currentMessage, 
  messages = []
}: UploadProgressProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  
  // Smooth progress animation
  useEffect(() => {
    // Only animate if progress is increasing
    if (progress > animatedProgress) {
      // Start animation
      const increment = (progress - animatedProgress) / 10;
      const timer = setInterval(() => {
        setAnimatedProgress(prev => {
          const next = prev + increment;
          if (next >= progress) {
            clearInterval(timer);
            return progress;
          }
          return next;
        });
      }, 50);
      
      return () => clearInterval(timer);
    } else if (progress < animatedProgress) {
      // If progress resets, snap to it immediately
      setAnimatedProgress(progress);
    }
  }, [progress, animatedProgress]);

  if (!show) return null;

  // Determine gradient color based on progress
  const getGradientColor = () => {
    if (progress < 30) return 'from-blue-400 to-indigo-500';
    if (progress < 60) return 'from-indigo-400 to-amber-500';
    if (progress < 90) return 'from-amber-400 to-amber-600';
    return 'from-emerald-400 to-emerald-600';
  };

  return (
    <div className="fixed top-44 left-1/2 transform -translate-x-1/2 z-50 w-[90%] max-w-lg">
      <div className="bg-white rounded-xl border border-slate-200 shadow-lg p-5 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-md font-semibold text-slate-800">
            {progress < 100 ? 'Processing Source' : 'Processing Complete'}
          </h3>
          <div className="flex items-center space-x-1.5">
            <span className="text-sm font-medium text-slate-600">{Math.round(animatedProgress)}%</span>
            
            {/* Status indicator */}
            <div className={`h-2 w-2 rounded-full ${
              progress < 100 ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
            }`}></div>
          </div>
        </div>
        
        {/* Main progress bar */}
        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden mb-4">
          <div 
            className={`h-full rounded-full bg-gradient-to-r ${getGradientColor()} transition-all duration-300 ease-out`}
            style={{ width: `${animatedProgress}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent "></div>
          </div>
        </div>
        
        {/* Current message display */}
        <div className="text-sm text-slate-600 mb-1 flex items-center">
          <div className="mr-2 shrink-0">
            <svg className={`w-5 h-5 ${progress < 100 ? 'text-amber-500' : 'text-emerald-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d={progress < 100 
                  ? "M13 10V3L4 14h7v7l9-11h-7z" 
                  : "M5 13l4 4L19 7"} 
              />
            </svg>
          </div>
          <p className="font-medium">
            {currentMessage || (progress < 100 ? 'Working...' : 'Done!')}
          </p>
        </div>
        
        {/* Previous steps log */}
        {messages.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-100">
            <div className="max-h-28 overflow-y-auto scrollbar-thin">
              <ul className="space-y-1.5">
                {messages.map((msg, index) => (
                  <li 
                    key={index} 
                    className={`text-xs flex items-center ${
                      index === messages.length - 1 
                        ? 'text-slate-500' 
                        : 'text-slate-400'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 mr-2 rounded-full ${
                      index === messages.length - 1 
                        ? 'bg-slate-400' 
                        : 'bg-slate-300'
                    }`}></span>
                    {msg}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
      
    </div>
  );
}