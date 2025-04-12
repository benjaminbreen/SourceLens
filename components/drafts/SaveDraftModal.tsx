// components/drafts/SaveDraftModal.tsx
// Modal to capture title and save text content as a new draft in the library.

import React, { useState, useEffect, useCallback } from 'react';
import { useLibrary, SavedDraft } from '@/lib/libraryContext'; // Import context and type
import { Dialog } from '@headlessui/react'; // Using Headless UI for accessible modals
import { useAuth } from '@/lib/auth/authContext';

interface SaveDraftModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialText: string;
}



export default function SaveDraftModal({ isOpen, onClose, initialText }: SaveDraftModalProps) {
  const { addDraft, draftExists } = useLibrary();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState<'in-progress' | 'review' | 'final'>('in-progress'); // Default status
  const [tags, setTags] = useState(''); // Comma-separated tags string
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Pre-fill title suggestion when modal opens or initialText changes
  useEffect(() => {
    if (isOpen && initialText) {
      let suggestedTitle = `Draft: ${initialText.substring(0, 50).replace(/\s+/g, ' ').trim()}`;
      if (initialText.length > 50) suggestedTitle += '...';
      // Basic check if default title exists, could add timestamp or prompt user
      if (draftExists(suggestedTitle)) {
          suggestedTitle = `${suggestedTitle} (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`;
      }
      setTitle(suggestedTitle);
      setError(null); // Reset error on open
      setSuccessMessage(null); // Reset success message
    }
  }, [isOpen, initialText, draftExists]);

  // Handle the save action
  const handleSave = useCallback(async () => {
    if (!title.trim()) {
      setError('Draft title cannot be empty.');
      return;
    }
    if (draftExists(title.trim())) {
      setError('A draft with this title already exists. Please choose a unique title.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // 1. Prepare draft data for summary API
      const draftDataForSummary = {
        title: title.trim(),
        content: initialText,
       
      };

      // 2. Call Summarization API
      const response = await fetch('/api/summarize-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ draft: draftDataForSummary }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to generate draft summary');
      }
      const summaryData = await response.json();

      // 3. Create the final SavedDraft object
        const newDraft = {
        id: crypto.randomUUID(),
        dateAdded: Date.now(),
        lastEdited: Date.now(),
         userId: user?.id ?? 'unknown',
        title: title.trim(),
        content: initialText,
        type: 'text' as const,
        status: status,
        tags: tags.split(',').map(tag => tag.trim()).filter(Boolean), // Process tags
        summary: summaryData.overallSummary,
        sections: summaryData.sections,
        wordCount: summaryData.wordCount,
      };

      // 4. Add to Library using context function
     await addDraft(newDraft);
      console.log("Draft saved:", newDraft.id);

      // 5. Show success and close modal after a delay
      setSuccessMessage(`Draft "${newDraft.title}" saved successfully!`);
      setTimeout(() => {
        onClose(); // Close the modal
      }, 1500); // Close after 1.5 seconds

    } catch (err) {
      console.error("Error saving draft:", err);
      const message = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Failed to save draft: ${message}`);
      setIsLoading(false); // Stop loading on error
    }
    // No need to set isLoading false on success because the modal closes
  }, [title, initialText, status, tags, draftExists, addDraft, onClose]);

  // Close handler resets internal state
  const handleClose = () => {
    if (isLoading) return; // Don't close if loading
    setTitle('');
    setStatus('in-progress');
    setTags('');
    setError(null);
    setSuccessMessage(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />

      {/* Modal Content */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-lg w-full rounded-lg bg-white shadow-xl overflow-hidden">
          <Dialog.Title className="px-5 py-3 bg-teal-50 border-b border-teal-100 text-lg font-semibold text-teal-800">
            Save Text as Draft
          </Dialog.Title>

          <div className="p-5 space-y-4">
            {/* Title Input */}
            <div>
              <label htmlFor="draftTitle" className="block text-sm font-medium text-slate-700 mb-1">
                Draft Title*
              </label>
              <input
                id="draftTitle"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 disabled:bg-slate-100"
                placeholder="Enter a title for this draft"
                disabled={isLoading}
                required
              />
            </div>

            {/* Status Selection */}
             <div>
                <label htmlFor="draftStatus" className="block text-sm font-medium text-slate-700 mb-1">
                  Status
                </label>
                <select
                  id="draftStatus"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white disabled:bg-slate-100"
                  disabled={isLoading}
                >
                  <option value="in-progress">In Progress</option>
                  <option value="review">Review</option>
                  <option value="final">Final</option>
                </select>
              </div>

            {/* Tags Input */}
             <div>
                <label htmlFor="draftTags" className="block text-sm font-medium text-slate-700 mb-1">
                  Tags <span className="text-xs text-slate-500">(comma separated)</span>
                </label>
                <input
                  id="draftTags"
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 disabled:bg-slate-100"
                  placeholder="e.g., notes, chapter 1, analysis"
                  disabled={isLoading}
                />
              </div>

            {/* Error Message */}
            {error && (
              <p className="text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200">{error}</p>
            )}

            {/* Success Message */}
            {successMessage && (
              <p className="text-sm text-green-700 bg-green-50 p-2 rounded border border-green-200 flex items-center">
                 <svg className="w-4 h-4 mr-2 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                 </svg>
                 {successMessage}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-400 disabled:opacity-50"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className={`px-4 py-2 text-sm font-medium text-white rounded-md flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors duration-150 ${
                isLoading || !title.trim()
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-teal-600 hover:bg-teal-700'
              }`}
              disabled={isLoading || !title.trim()}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                'Save Draft'
              )}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}