// components/notes/NotesSection.tsx
// Simple component for showing a preview of a note in the sources panel
// Fetches the specific note content needed for display.

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useLibraryStorage } from '@/lib/libraryStorageProvider';
import { Note } from '@/lib/libraryContext'; // Use the main Note type which includes content

// Define the props for this component
interface NotesSectionProps {
  sourceId: string;
  darkMode?: boolean;
}

// Use the full Note type for state as we need the content
export default function NotesSection({ sourceId, darkMode = false }: NotesSectionProps) {
  const [note, setNote] = useState<Note | null>(null); // State expects the full Note type
  const [isLoading, setIsLoading] = useState(true);
  const [errorLoading, setErrorLoading] = useState<string | null>(null);

  // Get the necessary functions from the storage provider
  const { getItemsBySourceId, getFullItem } = useLibraryStorage();

  // Load the specific note(s) for this sourceId
  const loadNote = useCallback(async () => {
    // Prevent loading if sourceId is invalid
    if (!sourceId || typeof sourceId !== 'string') {
        console.warn("NotesSection: Invalid sourceId provided", sourceId);
        setIsLoading(false);
        setErrorLoading("Invalid source reference.");
        return;
    }

    try {
      setIsLoading(true);
      setErrorLoading(null); // Reset error
      setNote(null); // Reset note while loading

      // 1. Find the metadata for notes associated with this source
      // getItemsBySourceId returns Partial<Note>[] (metadata only)
      const notesMetadata = await getItemsBySourceId<Note>('notes', sourceId);

      // 2. If notes metadata exists, get the ID of the most recent one
      if (notesMetadata && notesMetadata.length > 0) {
          // Assuming the first one is the most recent (based on provider sort)
          const mostRecentNoteMetadata = notesMetadata[0];
          const noteIdToFetch = mostRecentNoteMetadata?.id;

          if (noteIdToFetch) {
              // 3. Fetch the FULL note content using its ID
              console.log(`NotesSection: Fetching full note ${noteIdToFetch} for source ${sourceId}`);
              const fullNote = await getFullItem<Note>('notes', noteIdToFetch);

              if (fullNote) {
                   console.log(`NotesSection: Successfully fetched full note ${noteIdToFetch}`);
                  setNote(fullNote); // Set the state with the complete Note object
              } else {
                  console.warn(`NotesSection: Full note ${noteIdToFetch} not found after getting metadata.`);
                  setErrorLoading("Note details could not be loaded.");
              }
          } else {
               console.warn(`NotesSection: Found note metadata but no valid ID for source ${sourceId}`, notesMetadata);
               setErrorLoading("Note reference invalid.");
          }
      } else {
         console.log(`NotesSection: No notes found for source ${sourceId}`);
         // No error, just no note to display
      }
    } catch (error) {
      console.error(`NotesSection: Error loading note for source ${sourceId}:`, error);
      setErrorLoading("Failed to load note.");
    } finally {
      setIsLoading(false);
    }
  // Add getFullItem to dependency array
  }, [sourceId, getItemsBySourceId, getFullItem]);

  // Trigger loadNote when component mounts or sourceId changes
  useEffect(() => {
      loadNote();
  }, [loadNote]); // Depend on the memoized loadNote function

  // --- Render Logic ---

  if (isLoading) {
    return (
      <div className={`text-xs italic ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
        Loading note...
      </div>
    );
  }

   if (errorLoading) {
     return (
       <div className={`text-xs italic ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
         Error: {errorLoading}
       </div>
     );
   }

  // If no note was found after loading
  if (!note) {
    return null; // Don't render anything if there's no note for this source
  }

  // Format date (ensure timestamp exists and is valid)
  const formatDate = (timestamp: number | undefined): string => {
    if (!timestamp || typeof timestamp !== 'number' || isNaN(timestamp)) return 'N/A';
    try {
        return new Date(timestamp).toLocaleDateString(undefined, {
             month: 'short', day: 'numeric', year: 'numeric' // Simplified format
        });
    } catch (e) {
        return 'Invalid Date';
    }
  };

  // Truncate content for preview
   const truncateContent = (content: string | undefined, maxLength = 80): string => {
       if (!content) return '[No content]';
       if (content.length <= maxLength) return content;
       return content.substring(0, maxLength).replace(/\s+\S*$/, '') + '...';
   };


  return (
    <div className={`mt-2 border-t ${darkMode ? 'border-slate-700/50' : 'border-slate-200/70'} pt-2`}>
      <div className={`text-xs font-medium ${darkMode ? 'text-indigo-400' : 'text-indigo-600'} mb-1 flex items-center`}>
        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        {/* Use the full note object which is guaranteed to have lastModified */}
        Note from {formatDate(note.lastModified)}
      </div>
      <div className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'} line-clamp-2`}>
        {/* Use the full note object which is guaranteed to have content */}
        {truncateContent(note.content)}
      </div>
    </div>
  );
}