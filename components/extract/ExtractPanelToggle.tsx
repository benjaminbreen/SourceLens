// components/extract/ExtractPanelToggle.tsx
// Simple toggle button component to show/hide the extract info input panel
// Used in the header of the Extract Information panel

'use client';

import React, { useState, useEffect } from 'react';

export default function ExtractPanelToggle() {
  const [isExpanded, setIsExpanded] = useState(true);
  
  // This function will broadcast the toggle state change via a custom event
  const togglePanel = () => {
    setIsExpanded(!isExpanded);
    // Dispatch a custom event that ExtractInfoPanel can listen for
    const event = new CustomEvent('extract-panel-toggle', { 
      detail: { isExpanded: !isExpanded } 
    });
    document.dispatchEvent(event);
  };
  
  return (
    <button 
      onClick={togglePanel}
      className="p-2 rounded text-slate-500 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
      title={isExpanded ? "Hide input form" : "Show input form"}
    >
      <svg 
        className={`w-5 h-5 transition-transform duration-300 ${isExpanded ? 'rotate-0' : 'rotate-180'}`} 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    </button>
  );
}