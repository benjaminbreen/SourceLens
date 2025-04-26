// components/ui/DarkModeToggle.tsx
// A simple, elegant dark mode toggle button with animation
// Shows sun/moon icons with a smooth transition between states

'use client';

import React from 'react';
import { useAppStore } from '@/lib/store';

interface DarkModeToggleProps {
  className?: string;
  variant?: 'default' | 'minimal' | 'icon';
}

export function DarkModeToggle({ className = '', variant = 'default' }: DarkModeToggleProps) {
  const { isDarkMode, toggleDarkMode } = useAppStore();
  
  // Icon-only variant
  if (variant === 'icon') {
    return (
      <button
        onClick={toggleDarkMode}
        className={`relative p-2 rounded-full transition-colors ${
          isDarkMode 
            ? 'text-amber-300 hover:text-amber-200 hover:bg-slate-800/50' 
            : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/50'
        } ${className}`}
        aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {/* Sun icon (shown in light mode) */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`w-5 h-5 transition-all duration-300 ${
            isDarkMode ? 'scale-0 opacity-0 absolute' : 'scale-100 opacity-100 relative'
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
        
        {/* Moon icon (shown in dark mode) */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`w-5 h-5 transition-all duration-300 ${
            isDarkMode ? 'scale-100 opacity-100 relative' : 'scale-0 opacity-0 absolute'
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      </button>
    );
  }
  
  // Minimal variant (just the switch)
  if (variant === 'minimal') {
    return (
      <button
        onClick={toggleDarkMode}
        className={`relative rounded-full w-12 h-6 transition-colors ${
          isDarkMode ? 'bg-indigo-600' : 'bg-slate-300'
        } ${className}`}
        aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        <div
          className={`absolute rounded-full w-5 h-5 transform transition-transform duration-300 ${
            isDarkMode 
              ? 'translate-x-6 bg-indigo-200' 
              : 'translate-x-1 bg-white'
          }`}
        />
      </button>
    );
  }
  
  // Default variant (with label)
  return (
    <button
      onClick={toggleDarkMode}
      className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
        isDarkMode 
          ? 'bg-slate-800 text-slate-200 hover:bg-slate-700' 
          : 'bg-slate-200 text-slate-800 hover:bg-slate-300'
      } ${className}`}
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDarkMode ? (
        <>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5 text-amber-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
            />
          </svg>
          <span className="text-sm font-medium">Dark</span>
        </>
      ) : (
        <>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5 text-amber-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
          <span className="text-sm font-medium">Light</span>
        </>
      )}
    </button>
  );
}