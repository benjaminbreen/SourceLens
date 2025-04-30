// components/ui/LoadingBar.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { create } from 'zustand';

// --- Zustand Store for Loading State ---
// (Needed only to *trigger* the start of the bar)
interface LoadingBarStore {
  loading: boolean;
  setLoading: (isLoading: boolean) => void;
}
export const useLoadingBar = create<LoadingBarStore>((set) => ({
  loading: false,
  setLoading: (isLoading) => set({ loading: isLoading }),
}));


// --- Loading Bar Component ---
interface LoadingBarProps {
  color?: string;
  height?: number;
  // --- Key durations for the fixed simulation ---
  stage1Duration?: number; // Time to reach 80% (ms)
  totalDuration?: number;  // Total time before auto-completing (ms)
  // --- Other props ---
  delay?: number;
  isDarkMode?: boolean;
  position?: 'top' | 'bottom';
}

// --- Constants for timing and progress ---
const STAGE1_TARGET_PERCENT = 80;
const STAGE2_TARGET_PERCENT = 96; // Target just below 100 before final jump
const COMPLETION_PERCENT = 100;
const START_PERCENT = 5;
const DEFAULT_STAGE1_DURATION = 1000; // 3 seconds to reach 80%
const DEFAULT_TOTAL_DURATION = 2000; // 5 seconds total simulation
const DEFAULT_DELAY = 500;
const HIDE_DELAY = 100; // Time after reaching 100% before hiding

export default function LoadingBar({
  color,
  height = 4,
  stage1Duration = DEFAULT_STAGE1_DURATION,
  totalDuration = DEFAULT_TOTAL_DURATION,
  delay = DEFAULT_DELAY,
  isDarkMode = false,
  position = 'bottom',
}: LoadingBarProps) {
  const isLoading = useLoadingBar((state) => state.loading); // Only used to TRIGGER

  const [isVisible, setIsVisible] = useState(false);
  const [percent, setPercent] = useState(0);
  const [currentTransition, setCurrentTransition] = useState('none'); // Control CSS transition

  // Refs for timers
  const showTimerRef = useRef<NodeJS.Timeout | null>(null);
  const stage2TimerRef = useRef<NodeJS.Timeout | null>(null);
  const completeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);

  const barColor = color || (isDarkMode ? '#fbbf24' : '#4f46e5');

  // Function to handle the final completion animation and hiding
  const handleCompletion = () => {
    setPercent(COMPLETION_PERCENT);
    // Fast transition to 100%
    setCurrentTransition(`width 0.3s ease-out, opacity 0.4s ease-out 0.2s`);

    // Hide after animations finish
    hideTimerRef.current = setTimeout(() => {
      setIsVisible(false);
      // Reset fully after fade out
      setTimeout(() => {
         setPercent(0);
         setCurrentTransition('none'); // Reset transition for next time
      }, HIDE_DELAY);
      hideTimerRef.current = null;
    }, HIDE_DELAY + 300); // Wait for width + opacity transitions
  };

  useEffect(() => {
    // Clear all timers on unmount or if loading state changes unexpectedly
    // (though we mostly ignore loading=false after starting)
    const clearTimers = () => {
        if (showTimerRef.current) clearTimeout(showTimerRef.current);
        if (stage2TimerRef.current) clearTimeout(stage2TimerRef.current);
        if (completeTimerRef.current) clearTimeout(completeTimerRef.current);
        if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
        showTimerRef.current = null;
        stage2TimerRef.current = null;
        completeTimerRef.current = null;
        hideTimerRef.current = null;
    };

    if (isLoading) {
      // --- Start or Restart Loading Simulation ---
      clearTimers(); // Clear previous timers if restarted

      // Timer to initially show the bar
      showTimerRef.current = setTimeout(() => {
        setIsVisible(true);
        setPercent(START_PERCENT);

        // Set transition for stage 1 (0 -> 80%)
        setCurrentTransition(`width ${stage1Duration}ms cubic-bezier(0.25, 0.1, 0.25, 1.0)`); // Ease-out like
        requestAnimationFrame(() => { // Ensure DOM update before transition starts
            setPercent(STAGE1_TARGET_PERCENT);
        });

        // Timer to start stage 2 (80% -> 96%)
        const stage2StartTime = Math.max(0, totalDuration - stage1Duration - HIDE_DELAY); // Calculate remaining time
        stage2TimerRef.current = setTimeout(() => {
          setCurrentTransition(`width ${stage2StartTime}ms linear`); // Slower, linear progress
           requestAnimationFrame(() => {
               setPercent(STAGE2_TARGET_PERCENT);
           });
           stage2TimerRef.current = null;
        }, stage1Duration);

        // Timer to force completion after total duration
        completeTimerRef.current = setTimeout(() => {
           handleCompletion();
           completeTimerRef.current = null;
        }, totalDuration);

        showTimerRef.current = null;
      }, delay);

    } else {
       // If loading becomes false *before* the show delay finishes, cancel showing.
       if (showTimerRef.current) {
          clearTimers();
          setIsVisible(false);
          setPercent(0);
       }
       // If loading becomes false *after* the bar is visible, we let the internal
       // timers complete the simulation anyway for predictable behavior.
    }

    // Cleanup timers when component unmounts
    return clearTimers;

  }, [isLoading, delay, stage1Duration, totalDuration]); // Effect dependencies


  // Render nothing if the bar isn't supposed to be visible and is fully reset
  if (!isVisible && percent === 0) {
    return null;
  }

  return (
    <div
      className={`fixed ${position === 'top' ? 'top-0' : 'bottom-0'} left-0 z-[9999] w-full pointer-events-none`}
      style={{ height: `${height}px` }}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      aria-hidden={!isVisible}
      aria-label="Loading progress"
    >
      <div
        className="h-full"
        style={{
          width: `${percent}%`, // Target the current state percentage
          backgroundColor: barColor,
          boxShadow: `0 0 10px ${barColor}80`,
          opacity: isVisible ? 1 : 0,
          transition: currentTransition, // Apply the dynamically set transition
        }}
      />
    </div>
  );
}