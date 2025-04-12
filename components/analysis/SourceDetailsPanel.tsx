// components/analysis/SourceDetailsPanel.tsx
// Displays source metadata with edit functionality and citation actions
// Can be used as a standalone component or within the main layout

'use client';

import React from 'react';
import { useAppStore, Metadata } from '@/lib/store';
import { useLibrary } from '@/lib/libraryContext';


interface SourceDetailsPanelProps {
  metadata?: Metadata | null;
  darkMode?: boolean;
  compact?: boolean;
}

export default function SourceDetailsPanel({ 
  metadata,
  darkMode = false,
  compact = false
}: SourceDetailsPanelProps) {


  const library = useLibrary();
  
  // Handle copy to clipboard
  const handleCopy = () => {
    if (metadata?.fullCitation) {
      navigator.clipboard.writeText(metadata.fullCitation);
      // Optional: Add toast notification
    }
  };
  const setShowMetadataModal = useAppStore(state => state.setShowMetadataModal);
  
  // Handle save to library 
  const handleSave = () => {
    if (metadata?.fullCitation && library) {
      // Implement save to library
      // library.addReference({
      //   citation: metadata.fullCitation,
      //   url: '',
      //   type: 'book',
      //   relevance: 'Primary Source',
      //   sourceQuote: '',
      //   importance: 5,
      //   sourceName: metadata.title || 'Untitled Source',
      //   sourceAuthor: metadata.author || 'Unknown',
      //   sourceDate: metadata.date || ''
      // });
      // Optional: Add toast notification
    }
  };

  return (
    <div className={`rounded-xl overflow-hidden ${darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white '}`}>
      <div className="flex justify-between items-center px-4 py-3 border-b border-slate-300/20">
        <h2 className={`font-medium ${darkMode ? 'text-white' : 'text-indigo-900'} text-lg flex items-center `}>
          <svg className="w-5 h-5 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
          </svg>
          Source Details
        </h2>
        
        {/* Edit button */}
       <button 
         onClick={() => setShowMetadataModal(true)}
         className={`flex items-center text-xs px-2 py-1 rounded-md transition-colors ${
           darkMode 
             ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' 
             : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
         }`}
       >
         <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
         </svg>
         Edit Details
       </button>
      </div>
      
      <div className={`p-4 ${compact ? 'space-y-2' : 'space-y-5 px-5'}`}>
        {metadata ? (
          <>
            {/* Metadata card with grid layout */}
            <div className={`rounded-lg ${darkMode ? 'bg-slate-900/50 border border-slate-700' : 'bg-slate-50 border border-slate-200'} shadow-inner overflow-hidden`}>
              <div className="grid grid-cols-2 divide-x divide-y divide-slate-200/20">
                {/* Left column */}
                <div className="p-4 px-5 space-y-1">
                  {metadata.date && (
                    <div>
                      <span className={`text-xs uppercase tracking-wider font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        Date:
                      </span>
                      <p className={`${darkMode ? 'text-white' : 'text-slate-900'} text-sm font-medium`}>
                        {metadata.date}
                      </p>
                    </div>
                  )}
                  
                  {metadata.placeOfPublication && (
                    <div>
                      <span className={`text-xs uppercase tracking-wider font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        Place:
                      </span>
                      <p className={`${darkMode ? 'text-white' : 'text-slate-900'} text-sm font-medium`}>
                        {metadata.placeOfPublication}
                      </p>
                    </div>
                  )}
                  
                  {metadata.documentType && (
                    <div>
                      <span className={`text-xs uppercase tracking-wider font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        Type:
                      </span>
                      <p className={`${darkMode ? 'text-white' : 'text-slate-900'} text-sm font-medium`}>
                        {metadata.documentType}
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Right column */}
                <div className="p-4 px-10 space-y-1">
                  {metadata.author && (
                    <div>
                      <span className={`text-xs uppercase tracking-wide font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        Author:
                      </span>
                      <p className={`${darkMode ? 'text-white' : 'text-slate-900'} text-sm font-medium`}>
                        {metadata.author}
                      </p>
                    </div>
                  )}
                  
                  {metadata.genre && (
                    <div>
                      <span className={`text-xs uppercase tracking-wide font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        Genre:
                      </span>
                      <p className={`${darkMode ? 'text-white' : 'text-slate-900'} text-sm font-medium`}>
                        {metadata.genre}
                      </p>
                    </div>
                  )}
                  
                  {metadata.academicSubfield && (
                    <div>
                      <span className={`text-xs uppercase tracking-wide font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        Field:
                      </span>
                      <p className={`${darkMode ? 'text-white' : 'text-slate-900'} text-sm font-medium`}>
                        {metadata.academicSubfield}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Tags */}
            {metadata.tags && (Array.isArray(metadata.tags) ? metadata.tags.length > 0 : metadata.tags.trim() !== '') && (
              <div>
                <span className={`text-xs uppercase tracking-wider font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'} mb-2 block`}>
                  Tags:
                </span>
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(metadata.tags) 
                    ? metadata.tags.map((tag, index) => (
                      <span key={index} className={`px-2 py-1 mb-1 text-xs font-mono rounded-md ${
                        darkMode 
                          ? 'bg-indigo-900/40 text-indigo-200' 
                          : 'bg-indigo-50 text-slate-900'
                        } hover:shadow-sm shadow-indigo-300 `}>
                        {tag}
                      </span>
                    ))
                    : typeof metadata.tags === 'string' 
                      ? metadata.tags.split(',').map((tag, index) => (
                        <span key={index} className={`px-2 py-1 text-xs rounded-full ${
                          darkMode 
                            ? 'bg-indigo-900/40 text-indigo-200' 
                            : 'bg-indigo-50 text-indigo-800'
                          } font-medium`}>
                          {tag.trim()}
                        </span>
                      ))
                      : null
                  }
                </div>
              </div>
            )}
            
            {!compact && (
              <>
                {/* Research goals */}
                {metadata.researchGoals && (
                  <div>
                    <span className={`text-xs uppercase tracking-wider font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'} mb-2 block`}>
                      Research Goals:
                    </span>
                    <p className={`text-sm ${darkMode ? 'bg-slate-900/50 text-white' : 'bg-slate-50 text-slate-800'} p-3 rounded-lg border ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                      {metadata.researchGoals}
                    </p>
                  </div>
                )}
                
                {/* Additional context */}
                {metadata.additionalInfo && (
                  <div>
                    <span className={`text-xs uppercase tracking-wider font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'} mb-2 block`}>
                      Additional Context:
                    </span>
                    <p className={`text-sm ${darkMode ? 'bg-slate-900/50 text-white' : 'bg-slate-50 text-slate-800'} p-3 rounded-lg border ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                      {metadata.additionalInfo}
                    </p>
                  </div>
                )}
              </>
            )}
            
            {/* Citation with copy and save buttons */}
            {metadata.fullCitation && (
              <div className="relative mb-8">
                <span className={`text-xs uppercase tracking-wider font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'} mb-2 block`}>
                  Citation:
                </span>
                <div className={`${darkMode ? 'bg-slate-900/50 border-slate-700' : 'bg-slate-50 border-slate-200'} p-3 pr-20 rounded-lg border italic text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'} font-serif min-h-[3rem]`}>
                  {metadata.fullCitation}
                  
                  {/* Buttons absolutely positioned on right side */}
                  <div className="absolute right-2 top-2 flex flex-col gap-1.5">
                    <button 
                      onClick={handleCopy}
                      className={`flex items-center text-xs px-1.5 py-1 rounded-md transition-colors ${
                        darkMode 
                          ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' 
                          : 'bg-white text-slate-600 hover:bg-slate-100'
                      }`}
                      title="Copy to clipboard"
                    >
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy
                    </button>
                    
                    <button 
                      onClick={handleSave}
                      className={`flex items-center text-xs px-1.5 py-1 rounded-md transition-colors ${
                        darkMode 
                          ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' 
                          : 'bg-white text-slate-600 hover:bg-slate-100'
                      }`}
                      title="Save to library"
                    >
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                      Save
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <p className={`text-center py-4 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            No source metadata available
          </p>
        )}
      </div>
    </div>
  );
}