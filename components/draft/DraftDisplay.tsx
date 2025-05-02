// components/draft/DraftDisplay.tsx
import React, { useState, useRef, useEffect } from 'react';
import { SavedDraft } from '@/lib/libraryContext';
import SectionHeader from './SectionHeader';
import HighlightTooltip from './HighlightTooltip';

interface DraftDisplayProps {
  draft: SavedDraft;
  onHighlight: (info: { text: string; startIndex: number; endIndex: number; sectionId?: string; } | null) => void;
  onDraftAssist: (action: 'relate' | 'critique' | 'segue', text: string, start: number, end: number, sectionId?: string) => void;
  onSourceDrop: (sourceId: string, sectionId: string) => void;
  selectedSourceId: string | null;
  darkMode: boolean;
}

export default function DraftDisplay({
  draft,
  onHighlight,
  onDraftAssist,
  onSourceDrop,
  selectedSourceId,
  darkMode
}: DraftDisplayProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [tooltipInfo, setTooltipInfo] = useState<{
    visible: boolean;
    x: number;
    y: number;
    text: string;
    startIndex: number;
    endIndex: number;
    sectionId?: string;
  } | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const hasSections = draft.sections && draft.sections.length > 0;
  
  // Initialize expanded sections on draft load
  useEffect(() => {
    if (draft.sections && draft.sections.length > 0) {
      // Initially expand only the first section if there are many
      if (draft.sections.length > 3) {
        setExpandedSections(new Set([draft.sections[0].id]));
      } else {
        // Expand all sections if there are just a few
        setExpandedSections(new Set(draft.sections.map(s => s.id)));
      }
    }
  }, [draft.id, draft.sections]);
  
  // Handle section toggle
  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };
  
  // Handle text selection/highlighting
  const handleTextSelection = () => {
    const selection = window.getSelection();
    
    if (!selection || selection.isCollapsed || !containerRef.current) {
      // No actual selection, hide tooltip
      setTooltipInfo(null);
      return;
    }
    
    // Get selection details
    const range = selection.getRangeAt(0);
    const text = selection.toString().trim();
    
    if (!text || text.length < 3) {
      setTooltipInfo(null);
      return;
    }
    
    // Calculate relative position in the document
    // This is a simplification - a more precise implementation would track 
    // character indices in the sections
    const startIndex = getTextPosition(draft.content, text, 0);
    const endIndex = startIndex + text.length;
    
    // Find which section this belongs to
    let sectionId: string | undefined;
    
    if (draft.sections) {
      // Find the closest section ancestor
      let element: HTMLElement | null = range.commonAncestorContainer as HTMLElement;
      
      // If the node is a text node, get its parent element
      if (element.nodeType === Node.TEXT_NODE) {
        element = element.parentElement;
      }
      
      // Traverse up to find section element
      while (element && !element.dataset.sectionId) {
        element = element.parentElement;
      }
      
      if (element && element.dataset.sectionId) {
        sectionId = element.dataset.sectionId;
      }
    }
    
    // Calculate tooltip position
    const rect = range.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();
    
    const x = rect.left - containerRect.left + rect.width / 2;
    const y = rect.top - containerRect.top + window.scrollY;
    
    // Show tooltip
    setTooltipInfo({
      visible: true,
      x,
      y,
      text,
      startIndex,
      endIndex,
      sectionId
    });
    
    // Send highlight data to parent
    onHighlight({
      text,
      startIndex,
      endIndex,
      sectionId
    });
  };
  
  // Find position of text in content
  const getTextPosition = (content: string, text: string, startFrom: number = 0): number => {
    const index = content.indexOf(text, startFrom);
    return index >= 0 ? index : 0;
  };
  
  // Handle tooltip action click
  const handleTooltipAction = (action: 'relate' | 'critique' | 'segue') => {
    if (!tooltipInfo) return;
    
    onDraftAssist(
      action,
      tooltipInfo.text,
      tooltipInfo.startIndex,
      tooltipInfo.endIndex,
      tooltipInfo.sectionId
    );
    
    // Hide tooltip after action
    setTooltipInfo(null);
  };
  
  // Handle drag over for source dropping
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };
  
  // Handle dropping a source
  const handleDrop = (e: React.DragEvent, sectionId: string) => {
    e.preventDefault();
    
    try {
      // Extract source ID from data transfer
      const data = e.dataTransfer.getData('application/sourceLens');
      if (!data) return;
      
      const sourceData = JSON.parse(data);
      if (sourceData && sourceData.id) {
        onSourceDrop(sourceData.id, sectionId);
      }
    } catch (error) {
      console.error('Error handling source drop:', error);
    }
  };
  
  // Render the appropriate content based on sections
  const renderContent = () => {
    if (!hasSections) {
      // No sections, render the whole content
      return (
        <div 
          className={`p-6 ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}
          onMouseUp={handleTextSelection}
        >
          {draft.content.split('\n').map((paragraph, i) => (
            <p key={i} className={paragraph === '' ? 'h-4' : 'mb-4'}>
              {paragraph}
            </p>
          ))}
        </div>
      );
    }
    
    // Render sectioned content
    return draft.sections!.map((section) => (
      <div 
        key={section.id}
        data-section-id={section.id}
        className={`border-b ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, section.id)}
      >
        <SectionHeader
          section={section}
          isExpanded={expandedSections.has(section.id)}
          toggleExpand={() => toggleSection(section.id)}
          darkMode={darkMode}
        />
        
        {expandedSections.has(section.id) && (
          <div 
            className={`p-6 ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}
            onMouseUp={handleTextSelection}
          >
            {section.fullText.split('\n').map((paragraph, i) => (
              <p key={i} className={paragraph === '' ? 'h-4' : 'mb-4'}>
                {paragraph}
              </p>
            ))}
          </div>
        )}
      </div>
    ));
  };
  
  // Render tooltips and content
  return (
    <div 
      ref={containerRef}
      className={`flex-grow overflow-y-auto relative ${darkMode ? 'bg-slate-900' : 'bg-white'}`}
    >
      {/* Draft title */}
      <div className={`sticky top-0 z-10 px-6 py-3 ${darkMode ? 'bg-slate-800 text-slate-200 border-b border-slate-700' : 'bg-white text-slate-800 border-b border-slate-200'}`}>
        <h1 className="text-xl font-medium">
          {draft.title}
        </h1>
        {draft.summary && (
          <p className={`mt-1 text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            {draft.summary}
          </p>
        )}
      </div>
      
      {/* Draft content */}
      <div className="max-w-4xl mx-auto">
        {renderContent()}
      </div>
      
      {/* Highlight tooltip */}
      {tooltipInfo && tooltipInfo.visible && (
        <HighlightTooltip
          x={tooltipInfo.x}
          y={tooltipInfo.y}
          onClose={() => setTooltipInfo(null)}
          onAction={handleTooltipAction}
          hasSourceSelected={!!selectedSourceId}
          darkMode={darkMode}
        />
      )}
    </div>
  );
}