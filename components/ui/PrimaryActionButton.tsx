/**
 * PrimaryActionButton.tsx
 * 
 * An elegant, minimalist button component for primary actions with sophisticated
 * hover and active animations. Features:
 * 
 * - Clean, Swiss design aesthetic with subtle visual feedback
 * - Animated directional indicator for better user guidance
 * - Smooth transitions and subtle hover effects
 * - Accessible focus states and semantic markup
 * - Responsive design across all devices
 * - Full dark mode support with appropriate color adjustments
 */

import React, { useState, useRef } from 'react';

interface PrimaryActionButtonProps {
  /** Click handler for the button */
  onClick: () => void;
  
  /** Whether the button is disabled */
  disabled?: boolean;
  
  /** Button content */
  children: React.ReactNode;
  
  /** Additional CSS classes */
  className?: string;
  
  /** Whether to show the step number indicator */
  showNumber?: boolean;
  
  /** Whether the button is in active state */
  isActive?: boolean;
  
  /** Step number to display (if showNumber is true) */
  stepNumber?: number;
  
  /** Label text to display (if showNumber is true) */
  label?: string;
  
  /** Whether dark mode is enabled */
  isDarkMode?: boolean;
  id?: string; 
}

/**
 * Primary action button with elegant animations and minimal design
 */
const PrimaryActionButton: React.FC<PrimaryActionButtonProps> = ({
  onClick,
  disabled = false,
  children,
  className = "",
  showNumber = false,
  isActive = false,
  stepNumber = 3,
  label = "Start Exploring",
  isDarkMode = false,
  id
}) => {
  // State to manage animation and interaction effects
  const [isHovered, setIsHovered] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  return (
    <div className="flex flex-col mt-2 sm:flex-row sm:items-center sm:justify-between gap-4 w-full">
      {/* Number + Label with animated arrow */}
      {showNumber && (
        <div className={`flex items-center gap-3 relative transition-all duration-300 ${
          isHovered ? 'transform translate-x-1' : ''
        }`}>
          {/* Step number with subtle effect when active */}
          <span className={`
            flex items-center justify-center w-8 h-8 rounded-full text-xl font-medium
            transition-all duration-500 ease-out
            ${isActive
              ? isDarkMode
                ? 'bg-emerald-700 text-emerald-100 shadow-sm ring-2 ring-emerald-900 ring-offset-2 ring-offset-slate-800'
                : 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-200 ring-offset-2 ring-offset-white'
              : isDarkMode
                ? 'bg-slate-800 text-slate-200 border border-slate-600 shadow-sm'
                : 'bg-white text-slate-800 border border-slate-300 shadow-sm'}
          `}>
            {stepNumber}
          </span>
          
          {/* Label with animated arrow */}
          <div className="flex items-center">
            <span className={`text-xl font-medium tracking-tight ${
              isDarkMode ? 'text-slate-200' : 'text-slate-900'
            } transition-colors duration-200`}>
              {label}
            </span>
            
            {/* Animated arrow that appears when hovered */}
            <div
              className={`
                ml-2 transform transition-all duration-300 ease-out
                ${isHovered 
                  ? `opacity-100 translate-x-1 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}` 
                  : 'opacity-0 -translate-x-2'}
              `}
            >
              <svg 
                className="w-4 h-4" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M13 7l5 5m0 0l-5 5m5-5H6" 
                />
              </svg>
            </div>
          </div>
        </div>
      )}
      
      {/* Button with refined effects */}
      <button
      id={id}
        ref={buttonRef}
        onClick={onClick}
        disabled={disabled}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-live="polite"
        className={`
          relative overflow-hidden py-4 px-8 rounded-full
          font-medium text-white transition-all duration-300 ease-out 
          focus:outline-none active:scale-95 ${isDarkMode 
            ? 'focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800' 
            : 'focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2'}

          ${isActive 
            ? `border-3 ${isHovered 
                ? isDarkMode ? 'border-emerald-600' : 'border-emerald-400' 
                : isDarkMode ? 'border-emerald-700' : 'border-emerald-600'}`
            : 'border-transparent'}

          ${!disabled
            ? `hover:translate-y-[-2px] hover:shadow-md ${isActive ? 'animate-pulse-ring-emerald' : ''}`
            : isDarkMode 
              ? 'bg-slate-700 cursor-not-allowed opacity-60' 
              : 'bg-slate-300 cursor-not-allowed opacity-60'}

          ${className}
        `}
      >
        {/* Button content */}
        <span className="relative z-10 flex items-center justify-center">
          {children}
        </span>
        
        {/* Enhanced background effects */}
        {!disabled && (
          <>
            {/* Base gradient with subtle shift on hover */}
            <div 
              className={`
                absolute inset-0 transition-all duration-500 ease-out
                ${isDarkMode
                  ? isHovered 
                    ? 'bg-gradient-to-r from-emerald-700 to-emerald-600' 
                    : 'bg-gradient-to-r from-emerald-800 to-emerald-700'
                  : isHovered 
                    ? 'bg-gradient-to-r from-emerald-600 to-emerald-500' 
                    : 'bg-gradient-to-r from-emerald-500 to-emerald-600'
                }
              `}
            />
            
            {/* Subtle shine effect on hover */}
            {isHovered && (
              <div className={`absolute top-0 left-0 w-full h-full ${
                isDarkMode 
                  ? 'bg-gradient-to-r from-transparent via-white/5 to-transparent' 
                  : 'bg-gradient-to-r from-transparent via-white/10 to-transparent'
                } transform -translate-x-full animate-shine`}
              ></div>
            )}
            
            {/* Subtle glow for active state */}
            {isActive && (
              <div className={`absolute -inset-px rounded-md ${
                isDarkMode 
                  ? 'bg-emerald-600/30' 
                  : 'bg-emerald-400/30'
                } animate-pulse blur-sm`}
              ></div>
            )}
            
            {/* Bottom border accent */}
            <div 
              className={`
                absolute bottom-0 left-0 h-[2px] ${
                  isDarkMode ? 'bg-emerald-500' : 'bg-emerald-300'
                }
                transition-all duration-300 ease-out
                ${isHovered ? 'w-full' : 'w-0'}
              `}
            />
          </>
        )}
      </button>
    </div>
  );
};

export default PrimaryActionButton;