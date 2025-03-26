// components/ui/SummaryButton.tsx
// Persistent button to reopen the document summary modal

'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import SummarizeText from '../text/SummarizeText';

export default function SummaryButton() {
  const { summarySections } = useAppStore();
  const [showSummary, setShowSummary] = useState(false);
  
  // Only show the button if we have summary data
  if (summarySections.length === 0) {
    return null;
  }
  
  return (
    <>
      <button
        onClick={() => setShowSummary(true)}
        className="px-2 py-1.5 rounded-md bg-emerald-600 text-white transition-all duration-300
          hover:bg-emerald-700 hover:shadow-md focus:outline-none flex items-center gap-1.5
          hover:shadow-[0_0_6px_rgba(16,185,129,0.4)]"
        aria-label="Show Document Summary"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
        <span className="text-xs font-medium">Summary</span>
      </button>
      
      {/* Summarize Modal */}
      {showSummary && (
        <SummarizeText 
          onClose={() => setShowSummary(false)} 
        />
      )}
    </>
  );
}