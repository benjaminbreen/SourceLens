// components/chat/ChatInput.tsx
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
    llmModel
  } = useAppStore();
  
  const [input, setInput] = useState('');

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!input.trim() || isLoading) return;

    // Store the user's message and clear input
    const userMessage = input.trim();
    setInput('');
    
    // Add to conversation
    addMessage({
      role: 'user',
      content: userMessage
    });
    
    // Set loading state
    setLoading(true);
    console.log("Starting chat request");
    
    try {
      // Basic API call to our new endpoint
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          source: sourceContent,
          metadata: metadata,
          model: llmModel
        }),
      });
      
      console.log("Received response status:", response.status);
      
      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Parsed JSON response");
      
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
  
  // Add message to conversation with proper error type handling
  addMessage({
    role: 'assistant',
    content: `Error: ${error instanceof Error ? error.message : 'An unknown error occurred'}`
  });
} finally {
  console.log("Setting loading to false");
  setLoading(false);
}
  };
  
  return (
    <form onSubmit={handleSubmit} className="flex">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ask about this source..."
        className="flex-1 px-4 py-2 border border-slate-300 rounded-l focus:outline-none"
        disabled={isLoading}
      />
      <button
        type="submit"
        disabled={!input.trim() || isLoading}
        className={`px-4 py-2 rounded-r ${
          !input.trim() || isLoading
            ? 'bg-slate-200 text-slate-400'
            : 'bg-indigo-600 text-white'
        }`}
      >
        {isLoading ? '...' : 'Send'}
      </button>
    </form>
  );
}