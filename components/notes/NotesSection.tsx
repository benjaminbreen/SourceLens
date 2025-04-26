// components/notes/NotesSection.tsx
// Simple component for showing a preview of a note in the sources panel

'use client';

import React, { useState, useEffect } from 'react';
import { useLibraryStorage } from '@/lib/libraryStorageProvider';

interface NotesSectionProps {
  sourceId: string;
  darkMode?: boolean;
}

interface SimpleNote {
  id: string;
  content: string;
  sourceId: string;
  lastModified: number;
}

export default function NotesSection({ sourceId, darkMode = false }: NotesSectionProps) {
  const [note, setNote] = useState<SimpleNote | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const { getItems } = useLibraryStorage();
  
  // Load note for this source
  useEffect(() => {
    const loadNote = async () => {
      try {
        setIsLoading(true);
        const notes = await getItems<SimpleNote>('notes');
        const sourceNote = notes.find(n => n.sourceId === sourceId);
        
        if (sourceNote) {
          setNote(sourceNote);
        }
      } catch (error) {
        console.error('Error loading note:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadNote();
  }, [sourceId, getItems]);
  
  if (isLoading) {
    return (
      <div className={`text-xs italic ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
        Loading note...
      </div>
    );
  }
  
  if (!note) {
    return null;
  }
  
  // Format date
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };
  
  return (
    <div className={`mt-2 border-t ${darkMode ? 'border-slate-700/50' : 'border-slate-200/70'} pt-2`}>
      <div className={`text-xs font-medium ${darkMode ? 'text-indigo-400' : 'text-indigo-600'} mb-1 flex items-center`}>
        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        Note from {formatDate(note.lastModified)}
      </div>
      <div className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'} line-clamp-2`}>
        {note.content}
      </div>
    </div>
  );
}