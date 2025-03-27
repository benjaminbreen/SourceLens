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
        className="flex items-center w-full p-2 mt-2 rounded-md transition-all bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-md"
        aria-label="Show Document Summary"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
        <span className="text-sm">Summary</span>
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