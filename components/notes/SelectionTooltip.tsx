// components/ui/SelectionTooltip.tsx
// Enhanced floating tooltip that appears when text is selected
// Now integrates with the improved note panel system

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '@/lib/store';

interface SelectionTooltipProps {
  darkMode?: boolean;
}

export default function SelectionTooltip({ darkMode = false }: SelectionTooltipProps) {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [selectedText, setSelectedText] = useState('');
  const [sourceType, setSourceType] = useState('');
  
  const tooltipRef = useRef<HTMLDivElement>(null);
  const { activePanel, setNotePanelVisible, metadata } = useAppStore();

  // Handle text selection
  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      
      if (!selection || selection.isCollapsed || selection.toString().trim() === '') {
        setVisible(false);
        return;
      }

      const selectionText = selection.toString().trim();
      if (selectionText !== selectedText) {
        setSelectedText(selectionText);
      }

      // Identify the source type based on where the selection is made
      let sourceContext = identifySourceContext();
      setSourceType(sourceContext);

      // Calculate position for the tooltip
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      
      const tooltipHeight = tooltipRef.current?.offsetHeight || 40;
      const tooltipWidth = tooltipRef.current?.offsetWidth || 100;
      
      // Position the tooltip above the selection
      setPosition({
        x: rect.left + rect.width / 2 - tooltipWidth / 2,
        y: rect.top - tooltipHeight - 10 + window.scrollY
      });
      
      setVisible(true);
    };

    // Identify source context based on DOM structure
    const identifySourceContext = (): string => {
      const selection = window.getSelection();
      if (!selection) return 'unknown';
      
      const range = selection.getRangeAt(0);
      const startContainer = range.startContainer;
      
      // Get the element that contains the selection
      let element = startContainer.nodeType === Node.TEXT_NODE 
        ? startContainer.parentElement 
        : startContainer as Element;
        
      // Traverse up the DOM to identify the context
      while (element && element !== document.body) {
        // Check if we're in the SourceDisplay component
        if (
          element.classList.contains('source-panel') || 
          element.closest('[id^="source-display"]') || 
          element.closest('[class*="source-display"]') ||
          // Look for structural hints that we're in the source panel
          (element.classList.contains('p-4') && 
           element.classList.contains('md:p-6') && 
           element.parentElement?.classList.contains('overflow-y-auto'))
        ) {
          const sourceName = metadata?.title || 'Source Document';
          return `Source content: ${sourceName}`;
        }
        
        // Specific checks for different panels
        if (element.closest('#chat-container') || element.closest('.conversation-display')) {
          return 'AI-generated chat response';
        }
        
        if (element.closest('#detailed-analysis') || element.closest('.detailed-analysis-section')) {
          return 'AI-generated analysis content';
        }
        
        if (element.closest('#counter-narrative') || element.closest('.counter-narrative-section')) {
          return 'AI-generated counter-narrative';
        }
        
        if (element.closest('#references-panel') || element.closest('.references-section')) {
          return 'References section';
        }
        
        // Move up to the parent element
        element = element.parentElement as Element;
      }
      
      // Fallback: If we couldn't determine from DOM, use active panel
      switch (activePanel) {
        case 'analysis':
          return 'AI-generated basic analysis';
        case 'detailed-analysis':
          return 'AI-generated detailed analysis';
        case 'counter':
          return 'AI-generated counter-narrative';
        case 'roleplay':
          return 'AI-generated chat conversation';
        case 'references':
          return 'References content';
        case 'highlight':
          return 'Highlighted source content';
        default:
          // If we get here, it's most likely source content
          const sourceName = metadata?.title || 'Source Document';
          return `Source content: ${sourceName}`;
      }
    };

    // Handle mouse up event for text selection
    const handleMouseUp = () => {
      setTimeout(handleSelection, 10);
    };

    // Hide tooltip when clicking elsewhere
    const handleClickOutside = (e: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(e.target as Node)) {
        setVisible(false);
      }
    };

    // Handle escape key to dismiss tooltip
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setVisible(false);
      }
    };

    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedText, activePanel, metadata]);

  // Add the selected text to notes
  const handleAddToNotes = () => {
    if (selectedText && typeof window.appendToNote === 'function') {
      window.appendToNote(selectedText, sourceType);
      setVisible(false);
    }
  };

  // Copy text to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(selectedText).then(() => {
      setVisible(false);
    });
  };

  if (!visible) return null;

  return (
    <div
      ref={tooltipRef}
      className={`fixed z-[9999] px-2 py-1.5 rounded-md shadow-lg transition-opacity animate-fade-in ${
        darkMode 
          ? 'bg-slate-800 border border-slate-700' 
          : 'bg-white border border-slate-200'
      }`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        opacity: visible ? 1 : 0
      }}
    >
      <div className="flex gap-1">
        {/* Add to Notes button */}
        <button
          onClick={handleAddToNotes}
          className={`p-1 rounded text-xs font-medium flex items-center ${
            darkMode
              ? 'bg-indigo-900/60 text-indigo-200 hover:bg-indigo-800'
              : 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200'
          }`}
          title="Add to notes"
        >
          <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Note
        </button>
        
        {/* Copy button */}
        <button
          onClick={handleCopy}
          className={`p-1 rounded text-xs font-medium flex items-center ${
            darkMode
              ? 'bg-slate-700 text-slate-200 hover:bg-slate-600'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
          title="Copy to clipboard"
        >
          <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Copy
        </button>
      </div>
      
      {/* Arrow pointing to selection */}
      <div 
        className={`absolute left-1/2 bottom-0 w-2 h-2 transform rotate-45 -translate-x-1/2 translate-y-1/2 ${
          darkMode ? 'bg-slate-800 border-r border-b border-slate-700' : 'bg-white border-r border-b border-slate-200'
        }`}
      ></div>
    </div>
  );
}