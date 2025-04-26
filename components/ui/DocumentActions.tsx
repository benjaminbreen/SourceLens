// components/ui/DocumentActions.tsx
// Button menu system that provides actions for the primary source document
// Includes dark mode toggle, text cleanup, translation, highlighting, font size control,
// and saving source to library functionality

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { useLibrary } from '@/lib/libraryContext';
import CleanupText from '../text/CleanupText';
import SummarizeText from '../text/SummarizeText';
import DraftContext from '../drafts/DraftContext';
import DraftSelectionModal from '../drafts/DraftSelectionModal';

interface DocumentActionsProps {
  onAction?: (action: string) => void;
  darkMode?: boolean;
  toggleDarkMode?: () => void;
  onSummarizeComplete?: () => void;
  onFontSizeChange?: (size: number) => void;
  currentFontSize?: number;
}

export default function DocumentActions({ 
  onAction, 
  darkMode, 
  toggleDarkMode,
  onSummarizeComplete,
  onFontSizeChange,
  currentFontSize = 18, // Default font size
}: DocumentActionsProps) {
  const { setActivePanel, activePanel, sourceContent, metadata, sourceType } = useAppStore();
  const { addSource, sourceExists } = useLibrary();
  const [isOpen, setIsOpen] = useState(false);
  const [showCleanup, setShowCleanup] = useState(false);
  const [showSummarize, setShowSummarize] = useState(false);
  const [showAnimation, setShowAnimation] = useState(true);
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [fontSize, setFontSize] = useState(currentFontSize);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error' | 'exists'>('idle');
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  // Start animation and automatically stop it after 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowAnimation(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node) && 
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleCleanupClick = () => {
    setShowCleanup(true);
    setIsOpen(false);
  };

  const handleSummarizeClick = () => {
    setShowSummarize(true);
    setIsOpen(false);
  };

  const handleHighlightClick = () => {
    setActivePanel('highlight');
    setIsOpen(false);
    if (onAction) onAction('highlight');
  };

  const handleTranslateClick = () => {
    alert('Translation feature coming soon!');
    setIsOpen(false);
    if (onAction) onAction('translate');
  };

  const handleToggleDarkMode = () => {
    if (toggleDarkMode) {
      toggleDarkMode();
    }
    setIsOpen(false);
  };

  // Handle saving source to library
  const handleSaveToLibrary = () => {
    if (!sourceContent || !metadata) {
      alert('No source content or metadata available to save');
      return;
    }

    // Check if source already exists
    if (sourceExists(sourceContent)) {
      setSaveStatus('exists');
      setTimeout(() => setSaveStatus('idle'), 2000);
      setIsOpen(false);
      return;
    }

    setSaveStatus('saving');
    
    try {
      addSource({
        content: sourceContent,
        metadata: metadata,
       type: sourceType === 'audio' ? 'text' : (sourceType || 'text'),
        // Category and tags can be added later in the library
        category: metadata.academicSubfield || 'Uncategorized',
        tags: Array.isArray(metadata.tags) 
          ? metadata.tags 
          : typeof metadata.tags === 'string' 
            ? metadata.tags.split(',').map(tag => tag.trim())
            : []
      });
      
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Error saving source to library:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
    
    setIsOpen(false);
  };

  // Handle summary completion
  const handleSummarizeClose = () => {
    setShowSummarize(false);
    // Notify parent component that summarization is complete
    if (onSummarizeComplete) {
      onSummarizeComplete();
    }
  };

  // Handle font size change
  const handleFontSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSize = parseInt(e.target.value);
    setFontSize(newSize);
    if (onFontSizeChange) {
      onFontSizeChange(newSize);
    }
  };

  // Get save button text/icon based on status
  const getSaveButtonText = () => {
    switch (saveStatus) {
      case 'saving': return 'Saving...';
      case 'success': return 'Saved!';
      case 'error': return 'Error!';
      case 'exists': return 'Already saved';
      default: return 'Save to Library';
    }
  };

  return (
    <div className="relative inline-block">
      {/* Document Icon Button with Blue Styling */}
      <button
        ref={buttonRef}
        onClick={handleToggleMenu}
        className={`px-2 py-1.5 rounded-md bg-indigo-600 text-white transition-all duration-300
          hover:bg-indigo-700 hover:shadow-md focus:outline-none flex items-center gap-1.5
          ${showAnimation ? 'animate-pulse shadow-[0_0_8px_rgba(79,70,229,0.5)]' : 'hover:shadow-[0_0_6px_rgba(79,70,229,0.4)]'}`}
        aria-label="Document Options"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span className="text-xs font-medium">Actions</span>
      </button>

      {/* Save status indicator (outside menu) */}
      {saveStatus !== 'idle' && (
        <div className={`absolute -top-10 left-1/2 transform -translate-x-1/2 px-3 py-1.5 rounded shadow-md text-white text-xs whitespace-nowrap z-50 
          ${saveStatus === 'success' ? 'bg-emerald-600' : 
            saveStatus === 'error' ? 'bg-red-600' : 
            saveStatus === 'exists' ? 'bg-amber-600' : 'bg-blue-600'}`}>
          {getSaveButtonText()}
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 rotate-45 
            ${saveStatus === 'success' ? 'bg-emerald-600' : 
              saveStatus === 'error' ? 'bg-red-600' : 
              saveStatus === 'exists' ? 'bg-amber-600' : 'bg-blue-600'}"></div>
        </div>
      )}

      {/* Dropdown Menu */}
      {isOpen && (
        <div 
          ref={menuRef}
          className="absolute right-0 mt-1 bg-white rounded-lg shadow-xl border border-slate-200 w-60 py-1 z-50 origin-top-right animate-in fade-in-50 zoom-in-95 duration-200"
          style={{ transformOrigin: 'top right' }}
        >
          {/* Save to Library Button - NEW */}
          <button
            onClick={handleSaveToLibrary}
            className="flex items-center font-medium w-full px-4 py-2.5 text-left text-sm text-emerald-700 hover:bg-emerald-50 border-b border-slate-100"
          >
            <svg className="w-4 h-4 mr-3 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Save to Library
          </button>


            {/* Add Research Context Button (using the updated component) */}
          <button
            onClick={() => setShowDraftModal(true)}
            className="flex items-center w-full px-4 py-2.5 text-left text-sm text-emerald-700 hover:bg-emerald-50 border-b border-slate-100"
          >
            <svg className="w-4 h-4 mr-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Upload a Draft
          </button>

          
          <button
            onClick={handleCleanupClick}
            className="flex items-center w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50"
          >
            <svg className="w-4 h-4 mr-3 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            Clean up text
          </button>
          
          {/* Summarize Button */}
          <button
            onClick={handleSummarizeClick}
            className="flex items-center w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50"
          >
            <svg className="w-4 h-4 mr-3 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            Summarize text
          </button>
          
          {/* Highlight Button */}
          <button
            onClick={handleHighlightClick}
            className="flex items-center w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50"
          >
            <svg className="w-4 h-4 mr-3 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Highlight text
          </button>
          
          <button
            onClick={handleTranslateClick}
            className="flex items-center w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50"
          >
            <svg className="w-4 h-4 mr-3 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10m-11.048-2.5a18.022 18.022 0 000-5" />
            </svg>
            Translate text
          </button>
          
          {/* Font Size Slider */}
          <div className="px-4 py-2.5 text-sm border-t border-slate-100">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-slate-700">Font Size</span>
              <span className="text-slate-500 text-xs">{fontSize}px</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-400">A</span>
              <input 
                type="range" 
                min="12" 
                max="24" 
                value={fontSize} 
                onChange={handleFontSizeChange}
                className="w-full h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer"
              />
              <span className="text-base text-slate-400">A</span>
            </div>
          </div>
          
          {/* Dark Mode Toggle */}
          <button
            onClick={handleToggleDarkMode}
            className="flex items-center w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 border-t border-slate-100"
          >
            {darkMode ? (
              <>
                <svg className="w-4 h-4 mr-3 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 12.728l-.707-.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Light mode
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-3 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
                Dark mode
              </>
            )}
          </button>
        </div>
      )}

      {/* Cleanup Modal */}
      {showCleanup && (
        <CleanupText 
          onClose={() => setShowCleanup(false)} 
        />
      )}

      {showDraftModal && (
  <DraftSelectionModal
    isOpen={true}
    onClose={() => setShowDraftModal(false)}
  />
)}

      {/* Summarize Modal */}
      {showSummarize && (
        <SummarizeText 
          onClose={handleSummarizeClose}
        />
      )}
    </div>
  );
}