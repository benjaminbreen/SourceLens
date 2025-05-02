// components/draft/DraftSelectDropdown.tsx
import React, { useState, useEffect } from 'react';
import { useLibraryStorage } from '@/lib/libraryStorageProvider';
import { SavedDraft } from '@/lib/libraryContext';
import { format } from 'date-fns';

interface DraftSelectDropdownProps {
  onSelectDraft: (draftId: string) => void;
  selectedDraftId: string | null;
  darkMode: boolean;
}

export default function DraftSelectDropdown({
  onSelectDraft,
  selectedDraftId,
  darkMode
}: DraftSelectDropdownProps) {
  const [drafts, setDrafts] = useState<Partial<SavedDraft>[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { getItems } = useLibraryStorage();
  
  // Fetch drafts
  useEffect(() => {
    const fetchDrafts = async () => {
      try {
        setIsLoading(true);
        const draftList = await getItems<SavedDraft>('drafts');
        
        // Sort by last edited (most recent first)
        const sortedDrafts = [...draftList].sort((a, b) => {
          const aTime = a.lastEdited || a.dateAdded || 0;
          const bTime = b.lastEdited || b.dateAdded || 0;
          return bTime - aTime;
        });
        
        setDrafts(sortedDrafts);
      } catch (error) {
        console.error('Error fetching drafts:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDrafts();
  }, [getItems]);
  
  // Find selected draft
  const selectedDraft = selectedDraftId 
    ? drafts.find(draft => draft.id === selectedDraftId) 
    : null;
  
  // Format date for display
  const formatDate = (timestamp?: number) => {
    if (!timestamp) return '';
    return format(new Date(timestamp), 'MMM d, yyyy h:mm a');
  };
  
  // Handle dropdown outside clicks
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!(event.target as Element).closest('.draft-dropdown')) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  return (
    <div className="draft-dropdown relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between w-full px-4 py-2 text-left rounded-md ${
          darkMode
            ? 'bg-slate-700 hover:bg-slate-600 text-slate-200 border border-slate-600'
            : 'bg-white hover:bg-slate-50 text-slate-800 border border-slate-300'
        } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
      >
        <span className="truncate">
          {isLoading
            ? 'Loading drafts...'
            : selectedDraft
              ? selectedDraft.title
              : 'Select a draft'}
        </span>
        <svg
          className={`w-5 h-5 ml-2 transition-transform ${
            isOpen ? 'transform rotate-180' : ''
          } ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      
      {isOpen && (
        <div
          className={`absolute z-20 w-full mt-1 overflow-auto rounded-md shadow-lg max-h-60 ${
            darkMode
              ? 'bg-slate-800 border border-slate-700'
              : 'bg-white border border-slate-200'
          }`}
        >
          {isLoading ? (
            <div
              className={`px-4 py-3 text-sm ${
                darkMode ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              <div className="flex items-center">
                <svg
                  className={`w-5 h-5 mr-2 animate-spin ${
                    darkMode ? 'text-slate-500' : 'text-slate-400'
                  }`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>Loading drafts...</span>
              </div>
            </div>
          ) : drafts.length === 0 ? (
            <div
              className={`px-4 py-3 text-sm ${
                darkMode ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              No drafts found. Create a new draft in the Library page.
            </div>
          ) : (
            <ul className="py-1">
              {drafts.map((draft) => (
                <li key={draft.id}>
                  <button
                    onClick={() => {
                      if (draft.id) {
                        onSelectDraft(draft.id);
                        setIsOpen(false);
                      }
                    }}
                    className={`flex flex-col w-full px-4 py-2 text-left ${
                      selectedDraftId === draft.id
                        ? darkMode
                          ? 'bg-slate-700 text-indigo-300'
                          : 'bg-indigo-50 text-indigo-800'
                        : darkMode
                        ? 'text-slate-200 hover:bg-slate-700'
                        : 'text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    <span className="font-medium truncate">{draft.title}</span>
                    <span
                      className={`text-xs ${
                        darkMode ? 'text-slate-400' : 'text-slate-500'
                      }`}
                    >
                      {formatDate(draft.lastEdited || draft.dateAdded)}
                      {(typeof draft.wordCount === 'number') && ` • ${draft.wordCount} words`}
                      {draft.status && ` • ${draft.status}`}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}