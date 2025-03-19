// components/references/ReferencesExplanation.tsx
// Provides explanatory text about the suggested references feature for the right panel

'use client';

import React from 'react';

export default function ReferencesExplanation() {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium text-slate-800 mb-3 pb-2 border-b border-slate-100">
          About These References
        </h3>
        <p className="text-slate-700 mb-3">
          These suggested references have been generated based on the content, context, and themes 
          present in your primary source. The AI has considered the author, time period, and your 
          stated research goals to identify scholarly works that may provide valuable insights and 
          context.
        </p>
        <p className="text-slate-700">
          Each reference is color-coded by type (book, journal article, website, or other source) 
          and ranked by estimated relevance. Expanding a reference reveals why it was suggested and 
          which specific passage from your source it may help contextualize. You can sort references 
          by importance, date, or alphabetically, and switch between citation styles.
        </p>
      </div>
      
      <div className="bg-amber-50 p-4 rounded-md border border-amber-100">
        <h4 className="font-medium text-amber-800 mb-2 flex items-center">
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Important Note
        </h4>
        <p className="text-sm text-amber-700">
          While these suggestions are based on real scholarly works, please verify their existence, 
          accuracy, and relevance to your research before citing them. URLs and availability may 
          change over time, and the AI's knowledge has limitations. These references should serve 
          as a starting point for deeper research rather than definitive sources.
        </p>
      </div>
      
      <div className="mt-6">
        <h4 className="text-md font-medium text-slate-700 mb-2">Using These References</h4>
        <ul className="list-disc ml-5 space-y-1 text-sm text-slate-600">
          <li>Click the <span className="text-indigo-600">link icon</span> to open the source URL (when available)</li>
          <li>Click the <span className="text-amber-600">copy icon</span> to copy the citation to your clipboard</li>
          <li>Click anywhere on the reference to expand and see additional details</li>
          <li>Use the dropdowns to change citation styles or sort order</li>
          <li>Check the "Related Passage" section to see which part of your source the reference addresses</li>
        </ul>
      </div>
    </div>
  );
}