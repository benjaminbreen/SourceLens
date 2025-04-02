// components/chat/ChatInput.tsx
// Terminal-styled chat input that integrates with the cyberpunk aesthetic
// Supports strategy cards and conversation history
// Features seamless dark styling to match the conversation display

'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';

export default function ChatInput() {
  const { 
    addMessage, 
    isLoading,
    setLoading,
    setRawPrompt,
    setRawResponse,
    sourceContent,
    metadata,
    llmModel,
    conversation
  } = useAppStore();
  
  const [input, setInput] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [isCardDropped, setIsCardDropped] = useState(false);
  const [cardText, setCardText] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if ((!input.trim() && !isCardDropped) || isLoading) return;
    
    // Store the user's message and clear input
    let userMessage = input.trim();
    
    // If a card was dropped, add the explanatory text for the LLM
    if (isCardDropped && cardText) {
      userMessage = `Here is a koan-like suggestion to encourage creativity, experimentation, and factually-grounded perspective-taking when considering this source: ${cardText}`;
    }
    
    setInput('');
    setIsCardDropped(false);
    setCardText('');
    
    // Add to conversation
    addMessage({
      role: 'user',
      content: userMessage
    });
    
    // Set loading state
    setLoading(true);
    
    try {
      // Format conversation history for API
      const history = conversation.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      // API call with conversation history
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          source: sourceContent,
          metadata: metadata,
          model: llmModel,
          conversationId,
          history
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
      }
      
      const data = await response.json();
      
      // Store the conversation ID for future messages
      if (data.conversationId) {
        setConversationId(data.conversationId);
      }
      
      // Add assistant response to conversation
      addMessage({
        role: 'assistant',
        content: data.rawResponse || 'No response received'
      });
      
      // Set raw data for transparency
      setRawPrompt(data.rawPrompt || null);
      setRawResponse(data.rawResponse || null);
      
    } catch (error) {
      console.error("Chat error:", error);
      
      // Add error message to conversation
      addMessage({
        role: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Handle drop event
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    // Get the dropped text
    const droppedText = e.dataTransfer.getData('text/plain');
    if (droppedText) {
      setIsCardDropped(true);
      setCardText(droppedText);
      setInput(''); // Clear any existing input
    }
  };
  
  // Handle drag events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };
  
  return (
    <form onSubmit={handleSubmit} className="flex flex-col">
      {isCardDropped ? (
        <div className="mb-2 px-3 py-2 bg-amber-900/30 border border-amber-700/50 rounded-sm">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs font-bold text-amber-400 mb-1">
                Creative strategy card enabled
              </p>
              <p className="text-xs text-amber-300">{cardText}</p>
            </div>
            <button 
              type="button"
              onClick={() => {
                setIsCardDropped(false);
                setCardText('');
              }}
              className="text-amber-400 hover:text-amber-300 transition-colors"
              aria-label="Remove card"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      ) : (
        <div className="relative">
          {isDragOver && (
            <div className="absolute inset-0 flex items-center justify-center text-amber-400 pointer-events-none z-10">
              <span className="text-xs bg-slate-800 border border-amber-500/50 px-2 py-1 rounded shadow-sm">
                Drop card here
              </span>
            </div>
          )}
        </div>
      )}
      
      <div className="flex">
        <input
          type="text"
          value={isCardDropped ? '' : input}
          onChange={(e) => {
            setInput(e.target.value);
            if (isCardDropped) {
              setIsCardDropped(false);
              setCardText('');
            }
          }}
          placeholder={isLoading ? 'Processing...' : 'Ask about this source...'}
          className={`flex-grow font-mono text-sm bg-slate-600 text-white px-3 py-1 border ${
            isDragOver ? 'border-amber-500 bg-slate-800/80' : 'border-slate-700'
          } rounded-l-sm focus:outline-none focus:border-cyan-500 transition-colors ${isLoading ? 'opacity-60' : ''}`}
          disabled={isLoading}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        />
        <button
          type="submit"
          disabled={(!input.trim() && !isCardDropped) || isLoading}
          className={`px-3 py-1 rounded-r-sm font-mono text-sm ${
            (!input.trim() && !isCardDropped) || isLoading
              ? 'bg-slate-500 text-slate-200'
              : 'bg-cyan-500 text-white hover:bg-cyan-500'
          } transition-colors`}
        >
          {isLoading ? '...' : '>_'}
        </button>
      </div>
    </form>
  );
}