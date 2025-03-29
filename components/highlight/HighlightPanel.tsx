// components/highlight/HighlightPanel.tsx
// This file contains the UI for the text highlighting feature
// We're removing dark mode styling to ensure consistent light appearance

'use client';

import React, { useState, useEffect } from 'react';
import { useAppStore, HighlightedSegment } from '@/lib/store';

// Icon component (replace with your actual icon library if needed)
const ChevronDownIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);
const UpdateIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
);
const ClearIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);
const ScrollIcon = () => (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13l-3 3m0 0l-3-3m3 3V8m0 13a9 9 0 110-18 9 9 0 010 18z" /></svg>
);
const InfoIcon = () => (
    <svg className="w-5 h-5 mr-2 text-indigo-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);


export default function HighlightPanel() {
  const {
    sourceContent, isLoading, setLoading, llmModel,
    setRawPrompt, setRawResponse, setHighlightedSegments,
    setHighlightQuery, setHighlightMode, highlightedSegments,
    highlightQuery, isHighlightMode
  } = useAppStore();

  const [query, setQuery] = useState('');
  const [numSegments, setNumSegments] = useState(5);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showExamples, setShowExamples] = useState(true);
  const [examples] = useState<string[]>([ // Keep examples concise
    "Emotional passages", "Ethical dilemmas", "Anthropocene",
    "Nature descriptions", "City references", "Political ideology",
    "Figurative language"
  ]);

  useEffect(() => {
    if (!isHighlightMode) {
      setQuery('');
      setShowExamples(true);
    } else if (highlightQuery) {
      setQuery(highlightQuery);
      setShowExamples(false);
    } else {
      setShowExamples(true);
    }
  }, [isHighlightMode, highlightQuery]);

  const processHighlightRequest = async () => {
    if (!sourceContent || !query.trim() || isProcessing) return;
    setError(null);
    setIsProcessing(true);
    setLoading(true);
    try {
      const response = await fetch('/api/highlight-segments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: sourceContent, query: query.trim(), modelId: llmModel, numSegments }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Server responded with ${response.status}`);
      }
      const data = await response.json();
      setHighlightedSegments(data.segments || []);
      setHighlightQuery(query.trim());
      setHighlightMode(true);
      setRawPrompt(data.rawPrompt);
      setRawResponse(data.rawResponse);
      setShowExamples(false);
    } catch (err) {
      console.error('Highlight processing error:', err);
      setError(err instanceof Error ? err.message : 'Failed to process highlight request');
      setHighlightedSegments([]);
      setHighlightMode(false);
    } finally {
      setIsProcessing(false);
      setLoading(false);
    }
  };

  const clearHighlights = () => {
    setHighlightedSegments([]);
    setHighlightQuery('');
    setHighlightMode(false);
    setQuery('');
    setShowExamples(true);
  };

  // --- Color Helpers (Light mode only) ---
  const getScoreBgColor = (score: number): string => {
    if (score < 0.2) return 'bg-blue-100/70';
    if (score < 0.4) return 'bg-emerald-100/70'; 
    if (score < 0.6) return 'bg-yellow-100/70';
    if (score < 0.8) return 'bg-orange-100/70';
    return 'bg-red-100/70';
  };
  
  const getScoreTextColor = (score: number): string => { // For badge text
    if (score < 0.2) return 'text-blue-800';
    if (score < 0.4) return 'text-emerald-800';
    if (score < 0.6) return 'text-yellow-800';
    if (score < 0.8) return 'text-orange-800';
    return 'text-red-800';
  };
  
  const getScoreBorderColor = (score: number): string => {
    if (score < 0.2) return 'border-blue-300';
    if (score < 0.4) return 'border-emerald-300';
    if (score < 0.6) return 'border-yellow-300';
    if (score < 0.8) return 'border-orange-300';
    return 'border-red-300';
  };
  
  const getScaleDotColor = (level: string): string => { // For legend dots
    switch(level) {
      case 'low': return 'bg-blue-400';
      case 'med-low': return 'bg-emerald-400';
      case 'med': return 'bg-yellow-400';
      case 'med-high': return 'bg-orange-400';
      case 'high': return 'bg-red-400';
      default: return 'bg-slate-400';
    }
  }
  // --- End Color Helpers ---

  const handleExampleClick = (example: string) => setQuery(example);
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && query.trim() && !isProcessing) processHighlightRequest();
  };

  return (
    // Use the parent padding provided in MainLayout's right panel
    <div className="space-y-4">
      {/* Panel Header */}
       
      {error && ( /* Error message styling */
        <div className="p-3 bg-red-100 text-red-700 rounded-md border border-red-300 text-sm">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Input Section */}
      <div className="space-y-3 bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
        <div>
          <label htmlFor="highlight-query" className="block text-sm font-medium text-slate-700 mb-1">
            Highlight content related to:
          </label>
          <input id="highlight-query" type="text" value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={handleKeyDown}
            placeholder="Keywords, themes, names, places..."
            className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white text-slate-900 placeholder-slate-400"
            disabled={isProcessing} />
        </div>

        <div>
          <label htmlFor="highlight-num-segments" className="block text-sm font-medium text-slate-700 mb-1">
            Max segments:
          </label>
          <select id="highlight-num-segments" value={numSegments} onChange={(e) => setNumSegments(parseInt(e.target.value, 10))}
            className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white text-slate-900 appearance-none bg-no-repeat bg-right pr-8" // Basic custom arrow styling
            style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundSize: '1.5em 1.5em' }}
            disabled={isProcessing}>
            <option value={3}>Top 3</option>
            <option value={5}>Top 5</option>
            <option value={7}>Top 7</option>
            <option value={10}>Top 10</option>
            <option value={15}>Top 15</option>
          </select>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 pt-1">
          <button onClick={processHighlightRequest} disabled={!query.trim() || isProcessing}
            className={`flex-1 py-2 px-4 rounded-md text-white font-semibold transition-all duration-200 ease-in-out flex items-center justify-center space-x-2 ${!query.trim() || isProcessing ? 'bg-slate-400 cursor-not-allowed opacity-70' : 'bg-indigo-600 hover:bg-indigo-700 shadow-sm hover:shadow-md transform hover:-translate-y-0.5'}`}>
            {isProcessing ? ( /* Loading Spinner */
              <><svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg><span>Processing...</span></>
            ) : ( /* Button Text & Icon */
              <><UpdateIcon /><span>{isHighlightMode ? 'Update Highlights' : 'Highlight Text'}</span></>
            )}
          </button>
          {isHighlightMode && ( /* Clear Button */
            <button onClick={clearHighlights} disabled={isProcessing}
              className="py-2 px-4 rounded-md text-slate-700 font-medium border border-slate-300 bg-white hover:bg-slate-100 transition-colors flex items-center justify-center space-x-1">
              <ClearIcon /><span>Clear</span>
            </button>
          )}
        </div>

        {/* Examples - Collapsible */}
        <div className="pt-2">
          <button onClick={() => setShowExamples(!showExamples)}
            className="w-full flex justify-between items-center py-1.5 text-left" aria-expanded={showExamples}>
            <span className="text-xs font-medium text-slate-500 hover:text-indigo-600">
              Example prompts
            </span>
            <ChevronDownIcon />
          </button>
          <div className={`transition-all duration-300 ease-in-out overflow-hidden ${showExamples ? 'max-h-96 opacity-100 pt-2' : 'max-h-0 opacity-0'}`}>
             {showExamples && (
                <div className="flex flex-wrap gap-1.5">
                    {examples.map((example, index) => (
                    <button key={index} onClick={() => handleExampleClick(example)}
                        className="px-2.5 py-1 text-xs bg-slate-100 text-slate-700 rounded-full hover:bg-indigo-100 hover:text-indigo-700 transition-colors focus:outline-none focus:ring-1 focus:ring-indigo-300">
                        {example}
                    </button>
                    ))}
                </div>
             )}
          </div>
        </div>
      </div> {/* End Input Section */}


      {/* Results Section */}
      {isHighlightMode && highlightedSegments.length > 0 && (
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm mt-5 animate-fade-in">
          <h3 className="text-base font-semibold text-slate-800 mb-2"> {/* Slightly smaller header */}
            Highlighted Segments
          </h3>
          <p className="text-sm text-slate-600 mb-3">
            Showing {highlightedSegments.length} segments matching: <em className="font-medium text-slate-700">"{highlightQuery}"</em>
          </p>

          {/* Relevance Scale - matching screenshot */}
          <div className="mb-4">
            <h4 className="text-xs font-medium text-slate-500 mb-1.5">Relevance Scale:</h4>
            <div className="flex flex-wrap gap-x-2 gap-y-1">
              <span className="flex items-center text-xs"><span className={`w-2.5 h-2.5 rounded-full mr-1.5 ${getScaleDotColor('low')}`}></span>Low</span>
              <span className="flex items-center text-xs"><span className={`w-2.5 h-2.5 rounded-full mr-1.5 ${getScaleDotColor('med-low')}`}></span>Med-Low</span>
              <span className="flex items-center text-xs"><span className={`w-2.5 h-2.5 rounded-full mr-1.5 ${getScaleDotColor('med')}`}></span>Med</span>
              <span className="flex items-center text-xs"><span className={`w-2.5 h-2.5 rounded-full mr-1.5 ${getScaleDotColor('med-high')}`}></span>Med-High</span>
              <span className="flex items-center text-xs"><span className={`w-2.5 h-2.5 rounded-full mr-1.5 ${getScaleDotColor('high')}`}></span>High</span>
            </div>
          </div>

          {/* Segments list */}
          <div className="space-y-3">
            {highlightedSegments.map((segment) => (
              <div key={segment.id}
                className={`p-3 rounded-md ${getScoreBgColor(segment.score)} border ${getScoreBorderColor(segment.score)} transition-shadow duration-200 ease-in-out shadow-sm hover:shadow-md`}>
                {/* Top row: Badge and Scroll button */}
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${getScoreTextColor(segment.score)} bg-white/70 border border-black/10`}>
                    Relevance: {Math.round(segment.score * 100)}%
                  </span>
                  <button onClick={() => { /* Scroll logic */
                      const element = document.getElementById(`highlight-${segment.id}`);
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        element.classList.add('ring-2', 'ring-offset-2', 'ring-indigo-400', 'transition-all', 'duration-1000', 'ease-out');
                        element.style.transition = 'box-shadow 1s ease-out';
                        setTimeout(() => {
                            element.classList.remove('ring-2', 'ring-offset-2', 'ring-indigo-400');
                            element.style.transition = '';
                        }, 1500);
                      }
                    }}
                    className="text-xs px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full hover:bg-indigo-200 transition-colors flex items-center space-x-1 group"
                    title="Scroll to segment in source text">
                    <ScrollIcon />
                    <span className="hidden sm:inline">Scroll</span> {/* Hide text on small screens */}
                  </button>
                </div>
                {/* Segment Text */}
                <p className="text-slate-800 text-sm leading-relaxed mb-1.5">{segment.text}</p>
                {/* Explanation */}
                <p className="text-xs text-slate-600 italic">
                  <span className="font-medium not-italic text-slate-700">Why relevant:</span> {segment.explanation}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Placeholder */}
      {!isHighlightMode && !isLoading && ( /* Placeholder styling */
         <div className="mt-5 text-center p-4 border border-dashed border-slate-300 rounded-md bg-slate-50">
            <svg className="w-8 h-8 mx-auto mb-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732zM10 5h4M7 21h10" /></svg>
           <p className="text-sm text-slate-500">Enter a query above to highlight relevant text segments.</p>
         </div>
       )}

       {/* Animation Styles */}
       <style jsx>{`
         @keyframes fade-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
         .animate-fade-in { animation: fade-in 0.4s ease-out forwards; }
         /* Ensure bounce animation is defined if not globally available */
         @keyframes bounce { 0%, 100% { transform: translateY(-20%); animation-timing-function: cubic-bezier(0.8,0,1,1); } 50% { transform: none; animation-timing-function: cubic-bezier(0,0,0.2,1); } }
         .group:hover .animate-bounce { animation: bounce 1s infinite; }
       `}</style>
    </div>
  );
}