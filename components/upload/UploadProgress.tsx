// Updated UploadProgress.tsx for overlay display

import React, { useEffect, useState, useRef } from 'react';

interface UploadProgressProps {
  show: boolean;
  progress: number;
  currentMessage: string;
  messages: string[];
}

const UploadProgress: React.FC<UploadProgressProps> = ({ 
  show, 
  progress, 
  currentMessage, 
  messages 
}) => {
  // Auto-progressing animation
  const [displayProgress, setDisplayProgress] = useState(progress);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    // Start with actual progress
    setDisplayProgress(progress);
    
    // If progress is at 20% and not completed, start animation
    if (progress >= 20 && progress < 80) {
      // Clear any existing interval
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
      
      // Create smooth animation from current to 80%
      let currentValue = progress;
      progressInterval.current = setInterval(() => {
        // Add small random increment (0.3 to 1.2)
        currentValue += Math.random() * 0.9 + 0.3;
        
        // Cap at 80%
        if (currentValue >= 80) {
          currentValue = 80;
          if (progressInterval.current) {
            clearInterval(progressInterval.current);
            progressInterval.current = null;
          }
        }
        
        setDisplayProgress(currentValue);
      }, 200); // Update every 200ms for smooth animation
    } else if (progress >= 80) {
      // If actual progress exceeds 80%, use the real value
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
        progressInterval.current = null;
      }
      setDisplayProgress(progress);
    }
    
    // Cleanup interval on unmount
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [progress]);

  if (!show) return null;
  
  return (
    <div className="w-full bg-white border border-slate-200 rounded-lg shadow-xl transition-all duration-300 animate-fade-in p-4">
      <div className="flex items-center justify-between mb-1.5">
        <h4 className="text-sm font-medium text-slate-700">{currentMessage}</h4>
        <span className="text-xs font-medium text-slate-500">{Math.round(displayProgress)}%</span>
      </div>
      
      {/* Progress bar with animated gradient for active uploads */}
      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full ${
            displayProgress < 100 
              ? 'bg-gradient-to-r from-blue-400 to-amber-500 animate-pulse' 
              : 'bg-emerald-500'
          }`}
          style={{ 
            width: `${displayProgress}%`, 
            transition: 'width 0.3s ease-out'
          }}
        ></div>
      </div>
      
      {/* Only show message history if there are multiple messages */}
      {messages.length > 1 && (
        <div className="mt-3 pt-3 border-t border-slate-100">
          <h5 className="text-xs font-medium text-slate-500 mb-2">Processing Steps:</h5>
          <ul className="space-y-1 max-h-20 overflow-y-auto pr-2">
            {messages.map((message, index) => (
              <li 
                key={index} 
                className={`text-xs flex items-center ${
                  index === messages.length - 1 
                    ? 'text-slate-700 font-medium' 
                    : 'text-slate-500'
                }`}
              >
                {index === messages.length - 1 ? (
                  <svg className="w-3 h-3 mr-1.5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="w-3 h-3 mr-1.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {message}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default UploadProgress;