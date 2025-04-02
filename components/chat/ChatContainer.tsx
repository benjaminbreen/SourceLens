// components/chat/ChatContainer.tsx
// Container component that combines chat input and conversation display
// Features smooth transitions and subtle terminal-inspired aesthetics
// Uses inset styling for input area and polished animations

'use client';

import React, { useState, useRef, useEffect } from 'react';
import ChatInput from './ChatInput';
import ConversationDisplay from './ConversationDisplay';
import { useAppStore } from '@/lib/store';

export default function ChatContainer() {
  const { llmModel, conversation, activePanel } = useAppStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [containerHeight, setContainerHeight] = useState(280);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef<number>(0);
  const startHeightRef = useRef<number>(0);
  const hasExpandedRef = useRef<boolean>(false);
  const prevActivePanelRef = useRef(activePanel);
  
  // Auto-collapse when detailed analysis or counter-narrative is generated
  useEffect(() => {
    if (
      (activePanel === 'analysis' && prevActivePanelRef.current === 'analysis' && 
       useAppStore.getState().detailedAnalysis) || 
      activePanel === 'counter'
    ) {
      setIsExpanded(false);
    }
    
    prevActivePanelRef.current = activePanel;
  }, [activePanel, useAppStore.getState().detailedAnalysis]);
  
  // Auto-expand on first message
  useEffect(() => {
    if (conversation.length > 0 && !hasExpandedRef.current) {
      setIsExpanded(true);
      hasExpandedRef.current = true;
    }
  }, [conversation]);
  
  // Handle global mouse events for dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const deltaY = e.clientY - startYRef.current;
      const newHeight = Math.max(100, startHeightRef.current + deltaY);
      
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
    return modelId.replace(/-\d{4}-\d{2}-\d{2}$/, '').toUpperCase();
  };
  
  return (
    <div className="bg-white rounded-xl shadow-md border-1 border-slate-300 overflow-hidden">
      {/* Header - clean and professional */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className={`flex justify-between items-center px-5 py-3 bg-slate-50 border-l-4 border-indigo-500 
          text-slate-800 cursor-pointer transition-all duration-300 
          ${isExpanded ? 'border-b border-b-indigo-200 border-b-2 shadow-sm' : ''}`}
      >
        <div className="flex items-center">
          <h3 className="font-medium">Discuss this source with</h3>
          
          {/* Model indicator */}
          <div className="ml-2 flex items-center">
            <span className="text-xs px-1 py-1 bg-slate-100 rounded font-mono text-slate-600 flex items-center border border-slate-200">
              <svg className="w-3 h-3 mr-1 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              {getModelDisplayName()}
            </span>
          </div>
        </div>
        
        <button
          aria-label={isExpanded ? "Collapse conversation" : "Expand conversation"}
          className="text-slate-500 hover:text-slate-800 transition-colors focus:outline-none"
        >
          <svg 
            className={`w-5 h-5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} 
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
      </div>
      
      {/* Conversation container with smooth height transition */}
      <div 
        className="overflow-hidden transition-all duration-300 ease-out"
        style={{ 
          height: isExpanded ? `${containerHeight}px` : '0px',
          opacity: isExpanded ? 1 : 0
        }}
      >
        <div 
          ref={containerRef}
          className="relative h-[calc(100%-60px)]"
        >
          <ConversationDisplay />
          
          {/* Subtle resizer handle */}
          <div 
            className="absolute bottom-0 left-0 right-0 h-5 cursor-ns-resize flex justify-center items-end"
            onMouseDown={handleMouseDown}
          >
            <div className="w-10 h-1 mb-1 bg-slate-200 rounded-full hover:bg-slate-300 transition-colors"></div>
          </div>
        </div>
        
        {/* Input area with inset styling */}
        <div className="h-[60px] p-3 border-t-2  border-indigo-300 bg-gradient-to-b from-slate-300 to-white">
          <div className="bg-slate-100 rounded border-b-2 shadow-inner ring-1 ring-slate-200">
            <ChatInput />
          </div>
        </div>
      </div>
    </div>
  );
}