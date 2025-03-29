// components/drafts/DraftSelectionModal.tsx
// Modal for selecting a draft to use as context for analysis

'use client';

import React, { useState } from 'react';
import { useLibrary, SavedDraft } from '@/lib/libraryContext';
import { useAppStore } from '@/lib/store';

interface DraftSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DraftSelectionModal({ isOpen, onClose }: DraftSelectionModalProps) {
  const { drafts } = useLibrary();
  const { setActiveDraft } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  
  if (!isOpen) return null;
  
  // Filter drafts based on search
  const filteredDrafts = drafts.filter(draft => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      draft.title.toLowerCase().includes(term) ||
      (draft.tags && draft.tags.some(tag => tag.toLowerCase().includes(term)))
    );
  });
  
  // Sort by last edited
  const sortedDrafts = [...filteredDrafts].sort((a, b) => {
    const aTime = a.lastEdited || a.dateAdded;
    const bTime = b.lastEdited || b.dateAdded;
    return bTime - aTime;
  });
  
  // Handle draft selection
  const handleSelectDraft = (draft: SavedDraft) => {
    setActiveDraft(draft);
    onClose();
  };
  
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="font-bold text-lg">Select a Draft for Context</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 text-2xl"
          >
            &times;
          </button>
        </div>
        
        <div className="p-4 border-b border-slate-200">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search drafts..."
              className="pl-10 p-2 border border-slate-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2">
          {drafts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <svg className="w-16 h-16 text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <h3 className="text-lg font-medium text-slate-700 mb-1">No drafts available</h3>
              <p className="text-slate-500 max-w-md">
                Add research drafts in the Library section to enhance your analysis with personalized context.
              </p>
              <button
                onClick={onClose}
                className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
              >
                Close
              </button>
            </div>
          ) : sortedDrafts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <svg className="w-12 h-12 text-slate-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h3 className="text-lg font-medium text-slate-700">No matching drafts</h3>
              <p className="text-slate-500">Try adjusting your search criteria</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {sortedDrafts.map((draft) => (
                <div 
                  key={draft.id}
                  className="border border-slate-200 rounded-lg p-3 hover:bg-teal-50 hover:border-teal-200 cursor-pointer transition-colors"
                  onClick={() => handleSelectDraft(draft)}
                >
                  <div className="flex items-start mb-2">
                    <svg className="w-5 h-5 text-teal-700 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-800">{draft.title}</h4>
                      <p className="text-xs text-slate-500">
                        {draft.wordCount || 'Unknown'} words • Last edited: {new Date(draft.lastEdited || draft.dateAdded).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  {/* Draft summary preview */}
                  {draft.summary && (
                    <p className="text-sm text-slate-600 line-clamp-2 mb-2">
                      {draft.summary}
                    </p>
                  )}
                  
                  {/* Tags if available */}
                  {draft.tags && draft.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {draft.tags.map((tag, index) => (
                        <span 
                          key={index}
                          className="text-xs px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 text-slate-800 rounded mr-2 hover:bg-slate-300 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}