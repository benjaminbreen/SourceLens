// components/upload/UploadProgress.tsx
// Enhanced progress UI with smoother animations, better visual appearance,
// and fade-out effect when complete - follows Swiss minimalist design principles

import React, { useState, useEffect, useRef } from 'react';

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
  messages 
}: UploadProgressProps) {
  // Create smoother progress animation
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [progressStage, setProgressStage] = useState('initializing');
  const [isFadingOut, setIsFadingOut] = useState(false);
  const fadeOutTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Calculate status based on progress
  useEffect(() => {
    // Clear any existing fade-out timeout when progress changes
    if (fadeOutTimeoutRef.current) {
      clearTimeout(fadeOutTimeoutRef.current);
      fadeOutTimeoutRef.current = null;
    }

    // Set progress stage based on current progress value
    if (progress < 15) setProgressStage('initializing');
    else if (progress < 40) setProgressStage('processing');
    else if (progress < 80) setProgressStage('analyzing');
    else setProgressStage('finishing');
    
    // Handle fade-out when progress reaches 100%
    if (progress >= 100 && !isFadingOut) {
      setIsFadingOut(true);
      // Begin fade-out animation after a small delay
      fadeOutTimeoutRef.current = setTimeout(() => {
        // Let the CSS animation handle the actual fading
      }, 500);
    } else if (progress < 100 && isFadingOut) {
      // Reset fade state if progress goes back down
      setIsFadingOut(false);
    }
    
    // Animate progress more smoothly
    const animateProgress = () => {
      // Always ensure animation is moving forward, even if actual progress is stuck
      setAnimatedProgress(prev => {
        // If real progress is far ahead, jump closer to it
        if (progress > prev + 10) return prev + 5 + Math.random() * 5;
        
        // When real progress is 0 but animated progress is higher, reset
        if (progress === 0 && prev > 0) return 0;
        
        // Add small random increment to make it appear to be making progress
        const increment = prev < progress 
          ? Math.min(progress - prev, 0.5 + Math.random() * 0.5) 
          : (prev < 99 ? 0.2 + Math.random() * 0.3 : 0);
        
        // Cap at 99% until progress actually reaches 100
        return progress >= 100 ? 100 : Math.min(prev + increment, progress >= 100 ? 100 : 99);
      });
    };
    
    const timer = setInterval(animateProgress, 100);
    return () => {
      clearInterval(timer);
      if (fadeOutTimeoutRef.current) {
        clearTimeout(fadeOutTimeoutRef.current);
      }
    };
  }, [progress, isFadingOut]);
  
  if (!show) return null;
  
  // Get color based on progress stage
  const getStageColor = () => {
    switch (progressStage) {
      case 'initializing': return 'from-blue-500 to-blue-600';
      case 'processing': return 'from-indigo-500 to-indigo-600';
      case 'analyzing': return 'from-violet-500 to-violet-600';
      case 'finishing': return 'from-amber-500 to-amber-600';
      default: return 'from-blue-500 to-blue-600';
    }
  };
  
  // Get appropriate icon based on stage
  const getStageIcon = () => {
    switch (progressStage) {
      case 'initializing':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        );
      case 'processing':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        );
      case 'analyzing':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
      case 'finishing':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      default:
        return null;
    }
  };
  
  // Stage label text
  const getStageLabel = () => {
    switch (progressStage) {
      case 'initializing': return 'Preparing...';
      case 'processing': return 'Processing...';
      case 'analyzing': return 'Analyzing...';
      case 'finishing': return 'Finalizing...';
      default: return 'Processing...';
    }
  };
  
  return (
    <div 
      className={`
        bg-white rounded-xl shadow-lg p-8 w-[450px] border border-slate-200
        transition-all duration-500 ease-in-out
        ${isFadingOut ? 'opacity-0' : 'opacity-100'}
        animate-scaleIn
      `}
    >
      <div className="space-y-6">
        {/* Progress Header */}
        <div className="flex items-center">
          <div className={`rounded-full w-10 h-10 flex items-center justify-center text-white bg-gradient-to-r ${getStageColor()} shadow-sm`}>
            {getStageIcon()}
          </div>
          <div className="ml-4">
            <h3 className="text-xl font-medium text-slate-800">
              {Math.round(animatedProgress)}% Complete
            </h3>
            <p className="text-sm text-slate-500 mt-0.5">{getStageLabel()}</p>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden relative">
          <div 
            className={`absolute top-0 left-0 h-full bg-gradient-to-r ${getStageColor()} transition-all duration-300 ease-out`}
            style={{ width: `${animatedProgress}%` }}
          >
            {/* Pulse effect on progress bar */}
            <div className="absolute right-0 top-0 h-full w-4 bg-white/20 animate-pulse"></div>
          </div>
        </div>
        
        {/* Current Status */}
        <div className="text-sm">
          <p className={`text-slate-600 ${currentMessage ? 'mb-2' : ''}`}>
            {currentMessage || getStageLabel()}
          </p>
          
          {/* Recent Messages Log */}
          <div className="max-h-24 overflow-auto custom-scrollbar">
            <div className="space-y-1.5 text-xs text-slate-500 pl-4 border-l-2 border-slate-200">
              {messages.slice().reverse().map((msg, i) => (
                <p key={i} className="animate-fadeIn">
                  {msg}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}