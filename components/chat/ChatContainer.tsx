// components/chat/ChatContainer.tsx
// Container component that combines chat input and conversation display
// Features draggable height adjustment and auto-expansion on first message

'use client';

import React, { useState, useRef, useEffect } from 'react';
import ChatInput from './ChatInput';
import ConversationDisplay from './ConversationDisplay';
import { useAppStore } from '@/lib/store';

export default function ChatContainer() {
  const { llmModel, conversation, activePanel } = useAppStore();
  const [isExpanded, setIsExpanded] = useState(true); // Default to expanded
  const [containerHeight, setContainerHeight] = useState(100); // Start at 100px
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef<number>(0);
  const startHeightRef = useRef<number>(0);
  const hasExpandedRef = useRef<boolean>(false);
  const prevActivePanelRef = useRef(activePanel);
  
  // Auto-collapse when detailed analysis or counter-narrative is generated
  useEffect(() => {
    // If active panel changed to detailed analysis or counter-narrative
    if (
      (activePanel === 'analysis' && prevActivePanelRef.current === 'analysis' && 
       useAppStore.getState().detailedAnalysis) || 
      activePanel === 'counter'
    ) {
      setIsExpanded(false);
    }
    
    prevActivePanelRef.current = activePanel;
  }, [activePanel, useAppStore.getState().detailedAnalysis]);
  
  
  // Auto-expand to 300px on first message
  useEffect(() => {
    if (conversation.length > 0 && !hasExpandedRef.current) {
      setContainerHeight(300);
      hasExpandedRef.current = true;
    }
  }, [conversation]);
  
  // Handle global mouse events for dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const deltaY = e.clientY - startYRef.current;
      const newHeight = Math.max(100, startHeightRef.current + deltaY); // Min height 100px
      
      setContainerHeight(newHeight);
    };
    
    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        document.body.style.cursor = 'default';
      }
    };
    
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);
  
  // Start dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    startYRef.current = e.clientY;
    startHeightRef.current = containerHeight;
    setIsDragging(true);
    document.body.style.cursor = 'ns-resize';
  };
  
  // Get model name for display
  const getModelDisplayName = () => {
    const modelId = llmModel || 'gpt-4o-mini';
    // Strip any extra identifiers and just keep the core model name
    return modelId.replace(/-\d{4}-\d{2}-\d{2}$/, '').toUpperCase();
  };
  
  return (
    <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden transition-all duration-300">
      <div className="flex justify-between items-center px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="flex items-center">
          <h3 className="font-medium">Discuss this source</h3>
          
          {/* Model indicator */}
          <div className="ml-2 flex items-center">
            <span className="ml-2 text-xs px-2 py-0.5 bg-white/10 rounded font-mono text-white/70 flex items-center">
              <svg className="w-3 h-3 mr-1 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              {getModelDisplayName()}
            </span>
          </div>
        </div>
        
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-white/80 hover:text-white transition-colors"
          aria-label={isExpanded ? "Collapse conversation" : "Expand conversation"}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d={isExpanded ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} 
            />
          </svg>
        </button>
      </div>
      
      <div 
        ref={containerRef}
        className={`transition-all duration-300 overflow-hidden relative ${
          isExpanded ? '' : 'max-h-0'
        }`}
        style={{ 
          height: isExpanded ? `${containerHeight}px` : 0
        }}
      >
        <ConversationDisplay />
        
        {/* Resizer handle */}
        {isExpanded && (
          <div 
            className="absolute bottom-0 left-0 right-0 h-5 bg-gradient-to-t from-slate-100 to-transparent cursor-ns-resize flex justify-center items-end"
            onMouseDown={handleMouseDown}
          >
            <div className="w-16 h-1 mb-1 bg-slate-300 rounded-full hover:bg-slate-400 transition-colors"></div>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <ChatInput />
      </div>
    </div>
  );
}