// components/drafts/DraftContext.tsx
// Component for showing and selecting active draft context
'use client';
import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { useLibrary, SavedDraft } from '@/lib/libraryContext';
import DraftSelectionModal from './DraftSelectionModal';

// Accept className and children props
export default function DraftContext({ className, children }: { className?: string, children?: React.ReactNode }) {
  const { activeDraft, setActiveDraft } = useAppStore();
  const [showDraftModal, setShowDraftModal] = useState(false);
  
  // Truncate text for display
  const truncateText = (text: string, maxLength: number = 60) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };
  
  return (
    <div className="w-full">
      {activeDraft ? (
        // Show active draft info
        <div className="bg-teal-50 border border-teal-200 rounded-lg p-3 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center">
                <svg className="w-4 h-4 text-teal-700 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <h4 className="font-medium text-teal-900 text-sm">Using Draft Context</h4>
              </div>
              <p className="text-sm text-teal-800 mt-1">
                <span className="font-medium">{activeDraft.title}</span>
                {activeDraft.summary && (
                  <span className="block text-xs text-teal-700 mt-1 italic">
                    {truncateText(activeDraft.summary, 100)}
                  </span>
                )}
              </p>
            </div>
            <button 
              onClick={() => setActiveDraft(null)}
              className="text-teal-700 hover:text-teal-900 p-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="mt-2 flex gap-2">
            <button
              onClick={() => setShowDraftModal(true)}
              className="text-xs px-2 py-1 bg-teal-100 text-teal-800 rounded hover:bg-teal-200 transition-colors"
            >
              Change Draft
            </button>
            <button 
              onClick={() => setActiveDraft(null)}
              className="text-xs px-2 py-1 bg-slate-100 text-slate-700 rounded hover:bg-slate-200 transition-colors"
            >
              Remove Context
            </button>
          </div>
        </div>
      ) : (
        // Show button to select a draft - use passed className and children if provided
        <button
          onClick={() => setShowDraftModal(true)}
          className={className || "w-full flex items-center justify-center gap-2 py-2 px-4 bg-white border border-teal-200 text-teal-800 rounded-lg hover:bg-teal-50 transition-colors text-sm"}
        >
          {children || (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Add Draft
            </>
          )}
        </button>
      )}
      
      {/* Draft Selection Modal */}
      <DraftSelectionModal
        isOpen={showDraftModal}
        onClose={() => setShowDraftModal(false)}
      />
    </div>
  );
}