// components/highlight/HighlightPanel.tsx
// Component for the text highlighting feature
// Allows users to search for specific types of content in the source text
// and displays results with color-coded highlights

'use client';

import React, { useState, useEffect } from 'react';
import { useAppStore, HighlightedSegment } from '@/lib/store';
import ReactMarkdown from 'react-markdown';

export default function HighlightPanel() {
  const { 
    sourceContent, 
    isLoading, 
    setLoading, 
    llmModel,
    setRawPrompt,
    setRawResponse,
    setHighlightedSegments,
    setHighlightQuery,
    setHighlightMode,
    highlightedSegments,
    highlightQuery,
    isHighlightMode
  } = useAppStore();

  // Local state
  const [query, setQuery] = useState('');
  const [numSegments, setNumSegments] = useState(5);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [examples, setExamples] = useState<string[]>([
    "Show me the most emotionally charged passages",
    "Identify parts that discuss ethical dilemmas",
    "Find sections about technological innovation",
    "Highlight passages with vivid nature descriptions",
    "Locate parts with historical references"
  ]);

  // Reset query when highlight mode is toggled off
  useEffect(() => {
    if (!isHighlightMode) {
      setQuery('');
    } else if (highlightQuery) {
      setQuery(highlightQuery);
    }
  }, [isHighlightMode, highlightQuery]);

  // Process the highlight request
  const processHighlightRequest = async () => {
    if (!sourceContent || !query.trim() || isProcessing) {
      return;
    }

    setError(null);
    setIsProcessing(true);
    setLoading(true);

    try {
      // Call the API to get highlighted segments
      const response = await fetch('/api/highlight-segments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: sourceContent,
          query: query.trim(),
          modelId: llmModel,
          numSegments
        }),
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const data = await response.json();
      
      // Store the results in the app state
      setHighlightedSegments(data.segments);
      setHighlightQuery(query.trim());
      setHighlightMode(true);
      
      // Store raw data for transparency
      setRawPrompt(data.rawPrompt);
      setRawResponse(data.rawResponse);

    } catch (error) {
      console.error('Highlight processing error:', error);
      setError(error instanceof Error ? error.message : 'Failed to process highlight request');
      setHighlightedSegments([]);
      setHighlightMode(false);
    } finally {
      setIsProcessing(false);
      setLoading(false);
    }
  };

  // Clear highlights
  const clearHighlights = () => {
    setHighlightedSegments([]);
    setHighlightQuery('');
    setHighlightMode(false);
    setQuery('');
  };

  // Get color for score (blue to green to yellow to orange to red)
  const getScoreColor = (score: number): string => {
    if (score < 0.2) return 'bg-blue-500/25';
    if (score < 0.4) return 'bg-emerald-500/25';
    if (score < 0.6) return 'bg-yellow-500/25';
    if (score < 0.8) return 'bg-orange-500/25';
    return 'bg-red-500/25';
  };

  // Get text color for score
  const getScoreTextColor = (score: number): string => {
    if (score < 0.2) return 'text-blue-700';
    if (score < 0.4) return 'text-emerald-700';
    if (score < 0.6) return 'text-yellow-700';
    if (score < 0.8) return 'text-orange-700';
    return 'text-red-700';
  };

  // Handle example click
  const handleExampleClick = (example: string) => {
    setQuery(example);
  };

  return (
    <div className="space-y-4">
      {/* Input form */}

        
        {error && (
          <div className="mb-3 p-3 bg-red-50 text-red-700 rounded-md border border-red-200">
            {error}
          </div>
        )}
        
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              What would you like to highlight in the text?
            </label>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., Show me the funniest parts, Find sections about climate change..."
              className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              disabled={isProcessing}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Number of segments to highlight
            </label>
            <select
              value={numSegments}
              onChange={(e) => setNumSegments(parseInt(e.target.value, 10))}
              className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              disabled={isProcessing}
            >
              <option value={3}>3 segments</option>
              <option value={5}>5 segments</option>
              <option value={7}>7 segments</option>
              <option value={10}>10 segments</option>
            </select>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={processHighlightRequest}
              disabled={!query.trim() || isProcessing}
              className={`flex-1 py-2 px-4 rounded-md text-white font-medium transition-colors ${
                !query.trim() || isProcessing
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {isProcessing ? 'Processing...' : isHighlightMode ? 'Update Highlights' : 'Highlight Text'}
            </button>
            
            {isHighlightMode && (
              <button
                onClick={clearHighlights}
                disabled={isProcessing}
                className="py-2 px-4 rounded-md text-slate-700 font-medium border border-slate-300 hover:bg-slate-50 transition-colors"
              >
                Clear
              </button>
            )}
     
        </div>
        
        {/* Examples */}
        <div className="mt-4">
          <p className="text-xs text-slate-500 mb-2">Try these examples:</p>
          <div className="flex flex-wrap gap-2">
            {examples.map((example, index) => (
              <button
                key={index}
                onClick={() => handleExampleClick(example)}
                className="px-2 py-1 text-xs bg-slate-100 text-slate-700 rounded hover:bg-slate-200 transition-colors"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Results */}
      {isHighlightMode && highlightedSegments.length > 0 && (
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
          <h3 className="text-lg font-medium text-slate-800 mb-2">Highlighted Segments</h3>
          <p className="text-sm text-slate-600 mb-4">
            Showing {highlightedSegments.length} segments matching: "{highlightQuery}"
          </p>
          
          {/* Color legend */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-slate-700 mb-2">Relevance Scale:</h4>
            <div className="flex items-center space-x-1">
              <span className="px-2 py-1 bg-blue-500/25 text-blue-700 rounded text-xs">Low</span>
              <span className="px-2 py-1 bg-emerald-500/25 text-emerald-700 rounded text-xs"></span>
              <span className="px-2 py-1 bg-yellow-500/25 text-yellow-700 rounded text-xs"></span>
              <span className="px-2 py-1 bg-orange-500/25 text-orange-700 rounded text-xs"></span>
              <span className="px-2 py-1 bg-red-500/25 text-red-700 rounded text-xs">High</span>
            </div>
          </div>
          
          {/* Segments list */}
          <div className="space-y-3">
            {highlightedSegments.map((segment, index) => (
              <div 
                key={index}
                className={`p-3 rounded-md ${getScoreColor(segment.score)} border border-slate-200`}
              >
                <div className="flex items-start justify-between mb-2">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getScoreTextColor(segment.score)} bg-white/50`}>
                    Relevance: {Math.round(segment.score * 100)}%
                  </span>
                  <button
                    onClick={() => {
                      // Scroll to this segment in the text
                      const element = document.getElementById(`highlight-${index}`);
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }
                    }}
                    className="text-xs px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full hover:bg-indigo-200 transition-colors"
                  >
                    Scroll to segment
                  </button>
                </div>
                <p className="text-slate-800 mb-2">{segment.text}</p>
                <p className="text-xs text-slate-600 italic">{segment.explanation}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}