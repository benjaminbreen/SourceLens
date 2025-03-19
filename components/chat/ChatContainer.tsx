// components/chat/ChatContainer.tsx
// Container component that combines chat input and conversation display
// Provides a unified interface for user-LLM interaction

'use client';

import React, { useState } from 'react';
import ChatInput from './ChatInput';
import ConversationDisplay from './ConversationDisplay';

export default function ChatContainer() {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden transition-all duration-300">
      <div className="flex justify-between items-center px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <h3 className="font-medium">Source Conversation</h3>
        
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
      
      <div className={`transition-all duration-300 overflow-hidden ${
        isExpanded ? 'max-h-[60vh]' : 'max-h-0'
      }`}>
        <ConversationDisplay />
      </div>
      
      <div className="p-4">
        <ChatInput />
      </div>
    </div>
  );
}