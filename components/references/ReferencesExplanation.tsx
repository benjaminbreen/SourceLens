// components/references/ReferencesExplanation.tsx
// Provides explanatory text about the suggested references feature for the right panel

'use client';

import React from 'react';

export default function ReferencesExplanation() {
  return (
    <div className="space-y-3">
      <div>
        <p className="text-slate-700 mb-2">
          These suggested references have been generated based on the content, context, and themes 
          in your primary source. The AI has considered the author, time period, and your 
          stated research goals.
        </p>
        <p className="text-slate-700">
          Each reference is color-coded by type (book, journal article, website, or other source) 
          and ranked by estimated relevance. Expanding a reference reveals why it was suggested and 
          which specific passage from your source it may help contextualize. You can sort references 
          by importance, date, or alphabetically, and switch between citation styles.
        </p>
      </div>
      
      <div className="bg-amber-50 p-3 rounded-md border border-amber-100">
        <h4 className="font-medium text-amber-800 mb-2 flex items-center">
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Important Note
        </h4>
        <p className="text-sm text-amber-700">
          This is an experimental feature and accuracy is not guaranteed. PLEASE be sure to verify the existence, 
          accuracy, and relevance of these sources before citing them. These references should serve 
          as a starting point for deeper research that YOU perform.
        </p>
      </div>
      
      <div className="mt-6">
        <h4 className="text-md font-medium text-slate-700 mb-2">Using These References</h4>
        <ul className="list-disc ml-5 space-y-1 text-sm text-slate-600">
          <li>Click the <span className="text-indigo-600">link icon</span> to open the source URL (when available)</li>
          <li>Click the <span className="text-amber-600">copy icon</span> to copy the citation to your clipboard</li>
           <li>Click the <span className="text-emerald-600">plus sign icon</span> to save the citation to your library</li>
          <li>Click anywhere on the reference to expand and see additional details</li>
          <li>Use the dropdowns to change citation styles or sort order</li>
          <li>Check the "Related Passage" section to see which part of your source the reference addresses</li>
        </ul>
      </div>
    </div>
  );
}