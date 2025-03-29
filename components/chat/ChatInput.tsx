// components/chat/ChatInput.tsx
// Chat input component that supports conversation history
// Tracks conversation ID for maintaining context in API calls

'use client';

import React, { useState, useEffect } from 'react';
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
    console.log("Starting chat request");
    
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
          conversationId, // Send the conversation ID if we have one
          history         // Send conversation history
        }),
      });
      
      console.log("Received response status:", response.status);
      
      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Parsed JSON response");
      
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
      
      // Add type checking for the error before accessing the message property
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Unknown error occurred';
      
      // Add error message to conversation
      addMessage({
        role: 'assistant',
        content: `Error: ${errorMessage}`
      });
    } finally {
      console.log("Setting loading to false");
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
  
  // Handle drag over event
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };
  
  // Handle drag leave event
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };
  
  return (
    <form onSubmit={handleSubmit} className="flex flex-col">
      {isCardDropped ? (
        <div className="mb-2 px-4 py-3 bg-amber-50 border border-amber-200 rounded-md">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-md font-bold text-amber-800 mb-1">
                Creative strategy card enabled
              </p>
              <p className="text-sm text-amber-700">{cardText}</p>
            </div>
            <button 
              type="button"
              onClick={() => {
                setIsCardDropped(false);
                setCardText('');
              }}
              className="text-amber-600 hover:text-amber-800 transition-colors"
              aria-label="Remove card"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      ) : (
        <div className="mb-2 w-full relative">
          {isDragOver && (
            <div className="absolute inset-0 flex items-center justify-center text-amber-600 pointer-events-none">
              <span className="text-sm bg-amber-50 px-2 py-1 rounded shadow-sm">Drop card here and see what happens</span>
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
          placeholder="Ask the AI about this source..."
          className={`flex-1 px-4 py-2 border ${isDragOver ? 'border-amber-400 bg-amber-50/30' : 'border-slate-300'} rounded-l focus:outline-none transition-colors ${isCardDropped ? 'hidden' : 'block'}`}
          disabled={isLoading}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        />
        <button
          type="submit"
          disabled={(!input.trim() && !isCardDropped) || isLoading}
          className={`px-4 py-2 rounded-r ${
            (!input.trim() && !isCardDropped) || isLoading
              ? 'bg-slate-200 text-slate-400'
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          } transition-colors`}
        >
          {isLoading ? '...' : 'Send'}
        </button>
      </div>
    </form>
  );
}