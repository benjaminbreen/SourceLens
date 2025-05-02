// components/draft/ResultsPanel.tsx
import React, { useState } from 'react';
import { SavedDraft } from '@/lib/libraryContext';
import TableOfContents from './TableOfContents';

interface ResultsPanelProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  draft: SavedDraft | null;
  llmResults: {
    type: 'relate' | 'critique' | 'segue';
    suggestions: string[];
  } | null;
  isLoading: boolean;
  onRegenerateRequest: (feedback?: string) => void;
  tocVisible: boolean;
  setTocVisible: (visible: boolean) => void;
  darkMode: boolean;
}

export default function ResultsPanel({
  isOpen,
  setIsOpen,
  draft,
  llmResults,
  isLoading,
  onRegenerateRequest,
  tocVisible,
  setTocVisible,
  darkMode
}: ResultsPanelProps) {
  const [feedbackText, setFeedbackText] = useState('');
  const [showFeedbackInput, setShowFeedbackInput] = useState(false);
  
  // Get action title based on results type
  const getActionTitle = () => {
    if (!llmResults) return null;
    
    switch (llmResults.type) {
      case 'relate':
        return 'Source Connections';
      case 'critique':
        return 'Critiques';
      case 'segue':
        return 'Transition Suggestions';
      default:
        return 'Suggestions';
    }
  };
  
  // Handle copying a suggestion to clipboard
  const handleCopySuggestion = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        // Display a brief toast or indicator that copying succeeded
        alert('Copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
      });
  };
  
  // Handle sending feedback
  const handleSendFeedback = () => {
    if (!feedbackText.trim()) return;
    
    onRegenerateRequest(feedbackText);
    setFeedbackText('');
    setShowFeedbackInput(false);
  };
  
  // Panel width style
  const panelStyle = {
    width: isOpen ? '350px' : '0',
    minWidth: isOpen ? '350px' : '0',
    opacity: isOpen ? 1 : 0,
  };
  
  return (
    <>
      {/* Panel stub (always visible) */}
      <div
        className={`fixed right-0 top-1/2 -translate-y-1/2 z-20 ${
          isOpen ? 'hidden' : 'block'
        }`}
      >
        <button
          onClick={() => setIsOpen(true)}
          className={`flex items-center justify-center p-2 ${
            darkMode
              ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              : 'bg-white text-slate-600 hover:bg-slate-50'
          } border ${
            darkMode ? 'border-slate-700' : 'border-slate-200'
          } rounded-l-md shadow-sm`}
          title="Show results panel"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <span className="sr-only">Show results panel</span>
        </button>
      </div>
      
      {/* Main panel */}
      <div
        className={`h-screen border-l ${
          darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'
        } transition-all duration-300 ease-in-out overflow-hidden`}
        style={panelStyle}
      >
        {/* Panel header */}
        <div
          className={`p-4 border-b flex justify-between items-center ${
            darkMode ? 'border-slate-700' : 'border-slate-200'
          }`}
        >
          <h2
            className={`text-lg font-medium ${
              darkMode ? 'text-slate-200' : 'text-slate-800'
            }`}
          >
            {getActionTitle() || 'Draft Navigator'}
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            className={`p-1 rounded-full ${
              darkMode
                ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
            }`}
            title="Close panel"
          >
            <svg
             // components/draft/ResultsPanel.tsx (continued from previous)
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        
        <div className="overflow-y-auto h-full pb-4">
          {/* Table of Contents section */}
          {draft && tocVisible && (
            <div className={`p-4 ${llmResults ? 'border-b' : ''} ${
              darkMode ? 'border-slate-700' : 'border-slate-200'
            }`}>
              <div className="flex justify-between items-center mb-2">
                <h3 className={`text-sm font-medium ${
                  darkMode ? 'text-slate-300' : 'text-slate-700'
                }`}>
                  Table of Contents
                </h3>
                <button
                  onClick={() => setTocVisible(false)}
                  className={`p-1 rounded ${
                    darkMode
                      ? 'text-slate-400 hover:text-slate-300 hover:bg-slate-700'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                  }`}
                  title="Hide table of contents"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
              
              <TableOfContents draft={draft} darkMode={darkMode} />
            </div>
          )}
          
          {/* Loading indicator */}
          {isLoading && (
            <div className={`flex flex-col items-center justify-center p-8 ${
              darkMode ? 'text-slate-400' : 'text-slate-600'
            }`}>
              <svg className="animate-spin h-8 w-8 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p>Generating suggestions...</p>
            </div>
          )}
          
          {/* Results section */}
          {!isLoading && llmResults && (
            <div className="p-4">
              {/* Results by type */}
              <div className="space-y-4">
                {llmResults.suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-md ${
                      darkMode 
                        ? 'bg-slate-800 border border-slate-700' 
                        : 'bg-white border border-slate-200'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        llmResults.type === 'relate'
                          ? darkMode
                            ? 'bg-indigo-900/30 text-indigo-300 border border-indigo-800/40'
                            : 'bg-indigo-50 text-indigo-800 border border-indigo-100'
                          : llmResults.type === 'critique'
                          ? darkMode
                            ? 'bg-amber-900/30 text-amber-300 border border-amber-800/40'
                            : 'bg-amber-50 text-amber-800 border border-amber-100'
                          : darkMode
                          ? 'bg-emerald-900/30 text-emerald-300 border border-emerald-800/40'
                          : 'bg-emerald-50 text-emerald-800 border border-emerald-100'
                      }`}>
                        Option {index + 1}
                      </div>
                      
                      <button
                        onClick={() => handleCopySuggestion(suggestion)}
                        className={`p-1 rounded ${
                          darkMode
                            ? 'text-slate-400 hover:text-slate-300 hover:bg-slate-700'
                            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                        }`}
                        title="Copy to clipboard"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
                    
                    <div className={`${
                      darkMode ? 'text-slate-300' : 'text-slate-700'
                    } text-sm`}>
                      {suggestion}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Action buttons */}
              <div className="flex space-x-2 mt-4">
                <button
                  onClick={() => onRegenerateRequest()}
                  className={`px-3 py-1.5 text-sm rounded-md flex items-center ${
                    darkMode
                      ? 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Generate More</span>
                </button>
                
                <button
                  onClick={() => setShowFeedbackInput(!showFeedbackInput)}
                  className={`px-3 py-1.5 text-sm rounded-md flex items-center ${
                    darkMode
                      ? 'bg-indigo-800/30 text-indigo-300 border border-indigo-700/40 hover:bg-indigo-800/50'
                      : 'bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100'
                  }`}
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                  <span>Give Feedback</span>
                </button>
              </div>
              
              {/* Feedback input */}
              {showFeedbackInput && (
                <div className="mt-4">
                  <textarea
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="Add details about what you want to see..."
                    className={`w-full px-3 py-2 rounded-md ${
                      darkMode
                        ? 'bg-slate-800 border-slate-700 text-slate-200 placeholder:text-slate-500'
                        : 'bg-white border-slate-300 text-slate-800 placeholder:text-slate-400'
                    } border focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                    rows={3}
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={handleSendFeedback}
                      disabled={!feedbackText.trim()}
                      className={`px-3 py-1.5 text-sm rounded-md ${
                        !feedbackText.trim()
                          ? darkMode
                            ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          : darkMode
                          ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'
                      }`}
                    >
                      Send Feedback
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Empty state */}
          {!isLoading && !llmResults && !tocVisible && (
            <div className={`flex flex-col items-center justify-center p-8 ${
              darkMode ? 'text-slate-400' : 'text-slate-600'
            }`}>
              <svg className={`h-12 w-12 mb-3 ${
                darkMode ? 'text-slate-700' : 'text-slate-300'
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <p className="text-center">
                Highlight text in your draft to get suggestions, critiques, or segues.
              </p>
              <button
                onClick={() => setTocVisible(true)}
                className={`mt-4 px-3 py-1.5 text-sm rounded-md flex items-center ${
                  darkMode
                    ? 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                <span>Show Table of Contents</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
             