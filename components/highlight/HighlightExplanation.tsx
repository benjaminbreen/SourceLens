// components/highlight/HighlightExplanation.tsx
// Component that explains the text highlighting feature
// Provides information about how the feature works and how to use it

import React from 'react';

export default function HighlightExplanation() {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium text-slate-800 mb-3 pb-2 border-b border-slate-100">
          About Text Highlighting
        </h3>
        <p className="text-slate-700 mb-3">
          The Text Highlighting feature uses AI to identify and highlight specific passages in your primary source
          based on the criteria you provide. This is useful for quickly identifying relevant sections, analyzing
          thematic elements, or finding specific information within a larger text.
        </p>
        <p className="text-slate-700">
          Simply enter what you're looking for, such as "the most emotionally charged passages" or "sections about
          technological innovation," and the AI will analyze the text to find matching segments. Segments are
          color-coded by relevance, with warmer colors (yellow, orange, red) indicating higher relevance.
        </p>
      </div>
      
      <div className="bg-amber-50 p-4 rounded-md border border-amber-100">
        <h4 className="font-medium text-amber-800 mb-2 flex items-center">
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          How It Works
        </h4>
        <p className="text-sm text-amber-700">
          The AI analyzes your text to find segments that best match your query. Each segment is scored based on its
          relevance, and color-coded accordingly. You can specify how many segments to highlight, and easily navigate 
          between them. When highlights are active, they'll be visible in the main text display.
        </p>
      </div>
      
      <div className="mt-4">
        <h4 className="text-md font-medium text-slate-700 mb-2">Try asking for:</h4>
        <ul className="list-disc ml-5 space-y-1 text-sm text-slate-600">
          <li>The most emotional passages</li>
          <li>Parts that discuss ethics or morality</li>
          <li>Sections with irony or humor</li>
          <li>Passages with vivid descriptions</li>
          <li>Parts that relate to specific historical events</li>
          <li>Segments that challenge conventional thinking</li>
          <li>Sections that use metaphorical language</li>
        </ul>
      </div>
    </div>
  );
}