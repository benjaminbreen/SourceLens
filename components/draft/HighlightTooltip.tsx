// components/draft/HighlightTooltip.tsx
import React, { useEffect, useRef } from 'react';

interface HighlightTooltipProps {
  x: number;
  y: number;
  onClose: () => void;
  onAction: (action: 'relate' | 'critique' | 'segue') => void;
  hasSourceSelected: boolean;
  darkMode: boolean;
}

export default function HighlightTooltip({
  x,
  y,
  onClose,
  onAction,
  hasSourceSelected,
  darkMode
}: HighlightTooltipProps) {
  const tooltipRef = useRef<HTMLDivElement>(null);
  
  // Adjust tooltip position to prevent overflow
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    
    // Add event listener
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);
  
  return (
    <div
      ref={tooltipRef}
      className={`absolute z-50 ${
        darkMode 
          ? 'bg-slate-800 border border-slate-700 shadow-lg shadow-slate-900/50' 
          : 'bg-white border border-slate-200 shadow-lg shadow-slate-300/10'
      } rounded-lg`}
      style={{
        left: `${x}px`,
        top: `${y - 10}px`,
        transform: 'translate(-50%, -100%)'
      }}
    >
      <div className="flex p-1.5">
        <button
          disabled={!hasSourceSelected}
          onClick={() => onAction('relate')}
          className={`px-3 py-1.5 rounded-md text-sm flex items-center space-x-2 ${
            hasSourceSelected 
              ? darkMode 
                ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
              : darkMode 
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          }`}
          title={hasSourceSelected ? "Find connections to selected source" : "Select a source first"}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.172 13.828a4 4 0 015.656 0l4 4a4 4 0 01-5.656 5.656l-1.102-1.101" />
          </svg>
          <span>Relate to Source</span>
        </button>
        
        <div className="mx-1"></div>
        
        <button
          onClick={() => onAction('segue')}
          className={`px-3 py-1.5 rounded-md text-sm flex items-center space-x-2 ${
            darkMode 
              ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
              : 'bg-emerald-600 text-white hover:bg-emerald-700'
          }`}
          title="Generate transition sentence(s)"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
          <span>Segue</span>
        </button>
        
        <div className="mx-1"></div>
        
        <button
          onClick={() => onAction('critique')}
          className={`px-3 py-1.5 rounded-md text-sm flex items-center space-x-2 ${
            darkMode 
              ? 'bg-amber-600 text-white hover:bg-amber-700' 
              : 'bg-amber-600 text-white hover:bg-amber-700'
          }`}
          title="Get critical feedback on this selection"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m0 16v1m9-9h-1M4 12H3m.93-5.67l.71.71M19.07 6.33l-.71.71m0 11.32l.71.71M6.34 18.36l-.71.71" />
          </svg>
          <span>Critique</span>
        </button>
      </div>
      
      {/* Tooltip arrow */}
      <div 
        className={`absolute w-3 h-3 transform rotate-45 ${
          darkMode ? 'bg-slate-800 border-r border-b border-slate-700' : 'bg-white border-r border-b border-slate-200'
        }`}
        style={{
          left: '50%',
          marginLeft: '-6px',
          bottom: '-6px',
        }}
      ></div>
    </div>
  );
}