/**
 * PrimaryActionButton.tsx
 * 
 * A sophisticated, elegant button component for primary actions with enhanced
 * animations and visual feedback. Features include:
 * 
 * - Beautiful emerald pulse animation when active
 * - Subtle hover effects with smooth transitions
 * - Animated directional indicator (arrow) for better user guidance
 * - Proper accessibility support
 * - Responsive design for all devices and browsers
 */

import React, { useState, useEffect, useRef } from 'react';

interface PrimaryActionButtonProps {
  /** Click handler for the button */
  onClick: () => void;
  
  /** Whether the button is disabled */
  disabled: boolean;
  
  /** Button content */
  children: React.ReactNode;
  
  /** Additional CSS classes */
  className?: string;
  
  /** Whether to show the step number indicator */
  showNumber?: boolean;
  
  /** Whether the button is in active state */
  isActive?: boolean;
}

/**
 * Primary action button with enhanced visual feedback and animations
 */
const PrimaryActionButton: React.FC<PrimaryActionButtonProps> = ({
  onClick,
  disabled,
  children,
  className = "",
  showNumber = false,
  isActive = false,
}) => {
  // State to manage animation and interaction effects
  const [isHovered, setIsHovered] = useState(false);

  const buttonRef = useRef<HTMLButtonElement>(null);
  

  
  // Stop the demo button pulse when this button is active
  useEffect(() => {
    if (isActive) {
      // Find the demo button and remove its pulse animation
      const demoButton = document.querySelector('button.pulse-ring');
      if (demoButton) {
        demoButton.classList.remove('pulse-ring');
      }
    }
  }, [isActive]);

  return (
    <div className="flex flex-col mt-2 sm:flex-row sm:items-center sm:justify-between gap-4 w-full">
      {/* Number + Label with animated arrow */}
      {showNumber && (
        <div className={`flex items-center gap-2.5 relative transition-all duration-300 ${
          isHovered && isActive ? 'transform translate-x-2' : ''
        }`}>
          {/* Step number with pulse effect when active */}
          <span className={`
            flex items-center justify-center w-8 h-8 rounded-full text-xl font-bold
            transition-all duration-300 ease-out
            ${isActive
              ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-md animate-pulse-ring-emerald'
              : 'bg-white text-slate-900 border border-emerald-400'}
          `}>
            3
          </span>
          
          {/* Label with animated arrow */}
          <div className="flex items-center">
            <span className="bg-gradient-to-r from-slate-800 to-slate-700 bg-clip-text text-transparent text-xl font-bold">
              Start Exploring
            </span>
            
            {/* Animated arrow that appears when active */}
           <div
  className={`
    ml-2 transform transition-all duration-500
    ${isHovered ? 'opacity-100 translate-x-1 text-emerald-600' : 'opacity-0 translate-x-0'}
  `}
>
  <svg 
    className="w-5 h-5" 
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
      
      {/* Button with enhanced effects */}
      <button
        ref={buttonRef}
        onClick={onClick}
        disabled={disabled}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          relative overflow-hidden border border-emerald-700 py-3 px-6 rounded-lg 
          text-white font-semibold mr-4
          transition-all duration-300 ease-in-out 
  
          ${!disabled
            ? `  
               hover:-translate-y-1 ${isActive ? 'animate-pulse-ring-emerald scale-103': ''}`
            : 'bg-slate-400 cursor-not-allowed opacity-70'}
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
            {/* Base gradient */}
            <div 
              className={`
                absolute inset-0 bg-gradient-to-r from-emerald-500 to-emerald-600
                transition-opacity duration-300 
                ${isHovered ? 'saturate-130' : 'opacity-100'}
              `}
            ></div>
            
          
            
            {/* Fancy shimmer effect on hover */}
            {isHovered && (
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 animate-shine"></div>
            )}
            
            {/* Progress indicator for active state */}
            {isActive && (
              <div className="absolute bottom-0 left-0 h-1 bg-white/30 w-full transition-all duration-1000 ease-out origin-left"></div>
            )}
          </>
        )}
      </button>
      
      
    </div>
  );
};

export default PrimaryActionButton;