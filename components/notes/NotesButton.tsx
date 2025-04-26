// components/notes/NotesButton.tsx
// Enhanced button to toggle note panel visibility with keyboard shortcut support

'use client';

import React, { useEffect } from 'react';
import { useAppStore } from '@/lib/store';

export default function NotesButton() {
  const { isNotePanelVisible, setNotePanelVisible } = useAppStore();
  
  const toggleNotePanel = () => {
    setNotePanelVisible(!isNotePanelVisible);
  };
  
  // Listen for custom toggleNotePanel event
  useEffect(() => {
    const handleToggleNotePanel = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && typeof customEvent.detail.open === 'boolean') {
        setNotePanelVisible(customEvent.detail.open);
      } else {
        toggleNotePanel();
      }
    };
    
    document.addEventListener('toggleNotePanel', handleToggleNotePanel);
    
    return () => {
      document.removeEventListener('toggleNotePanel', handleToggleNotePanel);
    };
  }, [setNotePanelVisible]);
  
  return (
    <button
      onClick={toggleNotePanel}
      className={`group flex items-center justify-center h-10 rounded-lg border transition-all duration-200 ${
        isNotePanelVisible ? 
          'bg-indigo-50 text-indigo-700 border-indigo-200 shadow-inner' :
          'bg-white text-slate-700 border-slate-200 hover:bg-indigo-50/50 hover:text-indigo-700 hover:border-indigo-200 hover:shadow-sm'
      }`}
      title="Toggle notes panel (← to open, → to close)"
    >
      <svg className={`w-4 h-4 mr-1.5 transition-colors duration-200 ${
        isNotePanelVisible ? 'text-indigo-600' : 'text-slate-500 group-hover:text-indigo-500'
      }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
      <span className="text-sm font-medium truncate">Notes</span>
      
      {/* Keyboard shortcut indicator */}
      <kbd className={`ml-1.5 hidden sm:inline-block px-1 py-0.5 text-[10px] font-mono ${
        isNotePanelVisible ? 
          'bg-indigo-100 text-indigo-800' : 
          'bg-slate-100 text-slate-600 group-hover:bg-indigo-100 group-hover:text-indigo-800'
      } rounded transition-colors`}>
        ←
      </kbd>
    </button>
  );
}