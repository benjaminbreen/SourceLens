// components/text/SummarizeText.tsx
// Updated to store summary data in app store for persistence

'use client';

import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface SummarizeTextProps {
  onClose: () => void;
}

interface Section {
  id: string;
  title: string;
  summary: string;
  fullText: string;
}

export default function SummarizeText({ onClose }: SummarizeTextProps) {
  const { 
    sourceContent, 
    metadata,
    summarySections,
    setSummarySections,
    summaryOverall,
    setSummaryOverall
  } = useAppStore();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  
  useEffect(() => {
    // If we already have a summary, use it
    if (summarySections.length > 0) {
      return;
    }
    
    // Otherwise, generate a new one
    if (sourceContent) {
      summarizeText();
    }
  }, [sourceContent, summarySections.length]);

  const summarizeText = async () => {
    if (!sourceContent) return;
    
    setIsProcessing(true);
    setProgress(10);
    setStatus('Analyzing text structure...');
    
    try {
      // Start progress animation
      let progressInterval = setInterval(() => {
        setProgress(prev => {
          // Slow down progress as we get closer to 90%
          const increment = prev < 30 ? 5 : prev < 60 ? 2 : prev < 85 ? 1 : 0.5;
          const newProgress = Math.min(prev + increment, 90);
          
          // Update status based on progress
          if (newProgress > 80 && status !== 'Finalizing summary...') {
            setStatus('Finalizing summary...');
          } else if (newProgress > 60 && status !== 'Generating section summaries...') {
            setStatus('Generating section summaries...');
          } else if (newProgress > 30 && status !== 'Identifying key sections...') {
            setStatus('Identifying key sections...');
          }
          
          return newProgress;
        });
      }, 300);
      
      // API call to summarize text
      const response = await fetch('/api/summarize-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: sourceContent,
          modelId: 'gemini-flash-lite',
          metadata: metadata || {},
        }),
      });
      
      clearInterval(progressInterval);
      
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.sections || !Array.isArray(data.sections)) {
        throw new Error('Invalid response format from server');
      }
      
      // Store in the app state
      setSummarySections(data.sections);
      setSummaryOverall(data.overallSummary || '');
      
      setProgress(100);
      setStatus('Summary complete!');
      
    } catch (error) {
      console.error('Text summarization error:', error);
      setStatus('Error summarizing text');
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
      setProgress(0);
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full h-[85vh] mx-4 flex flex-col animate-in slide-in-from-bottom-10 duration-300">
        <div className="flex justify-between items-center p-6 border-b border-slate-200">
          <h3 className="text-xl font-medium text-slate-800">Document Summary</h3>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
            disabled={isProcessing}
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          {isProcessing ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-6"></div>
              <p className="text-lg font-medium text-slate-700 mb-2">{status}</p>
              
              {/* Progress bar */}
              <div className="w-64 bg-slate-200 rounded-full h-2.5 mb-6">
                <div 
                  className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              
              <p className="text-sm text-slate-500 max-w-md text-center">
                Our AI is analyzing your document to create a structured summary with key sections and insights.
              </p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="w-16 h-16 flex items-center justify-center bg-red-100 text-red-600 rounded-full mb-6">
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-lg font-medium text-slate-700 mb-2">Error Summarizing Text</p>
              <p className="text-sm text-slate-500 max-w-md text-center mb-6">{error}</p>
              <button
                onClick={summarizeText}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Overall summary section */}
              {summaryOverall && (
                <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
                  <h2 className="text-lg font-medium text-indigo-900 mb-2">Executive Summary</h2>
                  <p className="text-indigo-800">{summaryOverall}</p>
                </div>
              )}
              
              {/* Sections */}
              <div className="space-y-4">
                {summarySections.map((section) => (
                  <div 
                    key={section.id}
                    className="border border-slate-200 rounded-lg overflow-hidden transition-all duration-300"
                  >
                    {/* Section header */}
                    <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                      <h2 className="font-medium text-lg text-slate-800">{section.title}</h2>
                    </div>
                    
                    {/* Section summary */}
                    <div className="p-4">
                      {/* Summary with expand/collapse */}
                      <div 
                        onClick={() => toggleSection(section.id)}
                        className="flex cursor-pointer py-1 text-slate-700 hover:text-slate-900 transition-colors"
                      >
                        <div className="mr-2 mt-1 text-indigo-600">
                          <svg 
                            className={`w-4 h-4 transition-transform ${expandedSections[section.id] ? 'rotate-90' : ''}`} 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                        <p className="font-medium">
                          {section.summary}
                        </p>
                      </div>
                      
                      {/* Full text (conditionally shown) */}
                      {expandedSections[section.id] && (
                        <div className="mt-3 pl-6 pt-3 border-t border-slate-100 prose prose-sm max-w-none prose-slate">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                          >
                            {section.fullText}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Footer */}
        {!isProcessing && !error && (
          <div className="flex justify-between items-center p-4 border-t border-slate-200 bg-slate-50">
            <div className="text-xs text-slate-500">
              {summarySections.length} sections identified
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300 transition-colors"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}