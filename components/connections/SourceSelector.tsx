// components/connections/SourceSelector.tsx
// Component for selecting a source to analyze in the connections view
// Provides a dropdown with saved sources and the current source

'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface SourceSelectorProps {
  sources: any[];
  selected: any | null;
  onSelect: (source: any) => void;
}

export default function SourceSelector({ sources, selected, onSelect }: SourceSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  
  // Handle selecting a source
  const handleSelect = (source: any) => {
    onSelect(source);
    setIsOpen(false);
  };
  
  // Go to upload page
  const handleUploadNew = () => {
    router.push('/');
  };
  
  return (
    <div className="relative">
      {/* Selected source display */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center w-full max-w-lg bg-slate-900/60 border border-slate-700 rounded-lg p-3 hover:bg-slate-800/60 transition-colors"
      >
        {selected ? (
          <>
            <div className="shrink-0 w-10 h-10 bg-slate-800 rounded-full border border-slate-600 flex items-center justify-center text-xl mr-3">
              {selected.metadata?.documentEmoji || '📄'}
            </div>
            <div className="flex-1 overflow-hidden">
              <h3 className="font-medium text-white truncate">
                {selected.metadata?.title || selected.metadata?.author || 'Untitled Source'}
              </h3>
              <div className="flex items-center text-xs text-slate-400">
                {selected.metadata?.author && (
                  <span className="truncate">{selected.metadata.author}</span>
                )}
                {selected.metadata?.author && selected.metadata?.date && (
                  <span className="mx-1">•</span>
                )}
                {selected.metadata?.date && (
                  <span>{selected.metadata.date}</span>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="text-slate-300">Select a source</div>
        )}
        <svg
          className={`w-5 h-5 ml-2 text-slate-400 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 max-w-lg bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-30 max-h-80 overflow-auto animate-in fade-in slide-in-from-top-5 duration-150">
          <div className="p-2">
            {/* Current source */}
            {selected && (
              <div className="px-2 py-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider border-b border-slate-700 mb-1">
                Current Source
              </div>
            )}
            
            {/* Sources from library */}
            {sources.length > 0 && (
              <>
                <div className="px-2 py-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider border-b border-slate-700 mb-1 mt-2">
                  Your Library
                </div>
                {sources.map((source) => (
                  <button
                    key={source.id}
                    onClick={() => handleSelect(source)}
                    className="flex items-center w-full p-2 hover:bg-slate-800/60 rounded-md transition-colors"
                  >
                    <div className="shrink-0 w-8 h-8 bg-slate-800 rounded-full border border-slate-700 flex items-center justify-center text-lg mr-3">
                      {source.metadata?.documentEmoji || '📄'}
                    </div>
                    <div className="flex-1 overflow-hidden text-left">
                      <div className="font-medium text-white truncate">
                        {source.metadata?.title || source.metadata?.author || 'Untitled Source'}
                      </div>
                      <div className="flex items-center text-xs text-slate-400">
                        {source.metadata?.author && (
                          <span className="truncate">{source.metadata.author}</span>
                        )}
                        {source.metadata?.author && source.metadata?.date && (
                          <span className="mx-1">•</span>
                        )}
                        {source.metadata?.date && (
                          <span>{source.metadata.date}</span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </>
            )}
            
            {/* Add new source */}
            <div className="mt-2 pt-2 border-t border-slate-700/60">
              <button
                onClick={handleUploadNew}
                className="flex items-center w-full p-2 text-indigo-400 hover:bg-indigo-900/30 rounded-md transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Upload New Source
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}