// components/CounterNarrative.tsx
// Create or update this component for better styling

import React from 'react';
import { useAppStore } from '@/lib/store';
import ReactMarkdown from 'react-markdown';

export default function CounterNarrative() {
  const { counterNarrative } = useAppStore();
  
  if (!counterNarrative) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <svg className="w-16 h-16 text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m-4 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
        <p className="text-slate-500 max-w-md">
          Click "Generate Counter-Narrative" in the tools panel to see an alternative interpretation of this source.
        </p>
      </div>
    );
  }
  
  // Split the counterNarrative into sections if it contains headings
  const sections = counterNarrative.split(/(?=## )/);
  const mainText = sections[0]; // First part before any headings
  const additionalSections = sections.slice(1); // Any sections that start with "## "
  
  return (
    <div className="space-y-6">
      {/* Title and overview section */}
      <div className="border-b border-slate-200 pb-4">

        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-lg border border-indigo-100 shadow-sm">
          <h3 className="text-lg font-medium text-indigo-800 mb-2">The conventional perspective</h3>
          <div className="prose prose-indigo max-w-none">
            <ReactMarkdown>{mainText}</ReactMarkdown>
          </div>
        </div>
      </div>
      
      {/* Additional sections if present */}
      {additionalSections.length > 0 && (
        <div className="space-y-5">
          {additionalSections.map((section, index) => {
            // Extract heading from the section
            const headingMatch = section.match(/## (.*)/);
            const heading = headingMatch ? headingMatch[1] : `Aspect ${index + 1}`;
            const content = section.replace(/## .*\n/, ''); // Remove heading
            
            return (
              <div key={index} className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                  <h3 className="font-lg text-slate-800">{heading}</h3>
                </div>
                <div className="p-4 prose prose-sm max-w-none">
                  <ReactMarkdown>{content}</ReactMarkdown>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {/* Visual divider */}
      <div className="relative py-3">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-slate-200"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="px-2 bg-white text-sm text-slate-500">Interpretive lens</span>
        </div>
      </div>
      
      {/* Methodological notes */}
      <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
        <h3 className="text-sm font-medium text-slate-700 mb-2 flex items-center">
          <svg className="w-4 h-4 mr-1 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          About Counter-Narratives
        </h3>
        <p className="text-xs text-slate-600">
          Counter-narratives offer alternative interpretations that challenge conventional readings.
          They can reveal hidden power dynamics, marginalized perspectives, and overlooked 
          dimensions of historical texts. This analysis attempts to read "against the grain" 
          to uncover possible meanings that might otherwise remain invisible.
        </p>
      </div>
    </div>
  );
}