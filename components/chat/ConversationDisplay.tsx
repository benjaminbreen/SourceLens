// components/chat/ConversationDisplay.tsx
// Modified to properly limit scrolling and show thinking indicator only for chat responses

'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';
import ReactMarkdown from 'react-markdown';

export default function ConversationDisplay() {
  const { conversation, llmModel, isLoading } = useAppStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [animationDots, setAnimationDots] = useState('...');
  const [showThinking, setShowThinking] = useState(false);
  
  // Determine if we should show thinking indicator based on the last message
  useEffect(() => {
    // Only show thinking if we're loading AND the last message was from the user
    if (isLoading && conversation.length > 0 && conversation[conversation.length-1].role === 'user') {
      setShowThinking(true);
    } else {
      setShowThinking(false);
    }
  }, [isLoading, conversation]);
  
  // Animated dots for thinking indicator
  useEffect(() => {
    if (!showThinking) return;
    
    const interval = setInterval(() => {
      setAnimationDots(prev => {
        if (prev.length >= 3) return '.';
        return prev + '.';
      });
    }, 400);
    
    return () => clearInterval(interval);
  }, [showThinking]);
  
  // Scroll to bottom within the chat container ONLY
  useEffect(() => {
    if (messagesEndRef.current && chatContainerRef.current && (showThinking || conversation.length > 0)) {
      // Use scrollIntoView with preventScroll option to prevent page scrolling
      const scrollOptions = {
        behavior: 'smooth' as ScrollBehavior,
        block: 'end' as ScrollLogicalPosition
      };
      
      // Directly control the scroll position of the container instead
      const container = chatContainerRef.current;
      container.scrollTop = container.scrollHeight;
    }
  }, [conversation, showThinking]);
  
  // Get model display name (shorter version)
  const getModelName = () => {
    return llmModel?.split('-').slice(0, 2).join('-') || 'GPT-4o-mini';
  };
  
  if (conversation.length === 0 && !showThinking) {
    return (
      <div className="p-2 h-full flex flex-col items-center justify-center">
        <div className="max-w-md text-center">
          <svg className="w-12 h-8 mx-auto text-slate-300 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p className="text-slate-500">Your conversation about this source will appear here.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div ref={chatContainerRef} className="space-y-3 p-3 h-full overflow-y-auto pb-8">
      {conversation.map((message, index) => (
        <div
          key={index}
          className={`p-3 rounded-lg ${
            message.role === 'user'
              ? 'bg-indigo-100 ml-6'
              : 'bg-slate-100 mr-6'
          }`}
        >
          <div className="text-xs font-medium mb-1 flex items-center">
            {message.role === 'user' ? (
              'You'
            ) : (
              <div className="flex items-center">
                <span className="font-semibold text-indigo-800">SourceLens</span>
                <span className="ml-2 text-xs px-1.5 py-0.5 bg-slate-200 rounded font-mono text-slate-500 text-[10px]">
                  {getModelName()}
                </span>
              </div>
            )}
          </div>
          <div className="prose prose-sm max-w-none prose-p:my-1 prose-headings:mb-1 prose-table:border-collapse">
            {message.role === 'user' ? (
              <div>{message.content}</div>
            ) : (
              <ReactMarkdown
                components={{
                  // Custom table rendering
                  table: ({node, ...props}) => (
                    <div className="overflow-x-auto my-2">
                      <table className="w-full border-collapse border border-slate-300" {...props} />
                    </div>
                  ),
                  thead: ({node, ...props}) => <thead className="bg-slate-100" {...props} />,
                  tbody: ({node, ...props}) => <tbody {...props} />,
                  tr: ({node, ...props}) => <tr className="border-b border-slate-300" {...props} />,
                  th: ({node, ...props}) => <th className="border border-slate-300 p-2 text-left font-medium" {...props} />,
                  td: ({node, ...props}) => <td className="border border-slate-300 p-2" {...props} />
                }}
              >
                {message.content}
              </ReactMarkdown>
            )}
          </div>
        </div>
      ))}
      
      {/* Thinking indicator - only shown when user has submitted a message */}
      {showThinking && (
        <div className="mb-2 animate-fade-in transition-all duration-500">
          <div className="bg-slate-100 rounded-lg p-3 ml-6 inline-block">
            <div className="flex items-center">
              <div className="bg-slate-200 rounded-full w-5 h-5 flex items-center justify-center mr-2">
                <div className="w-3 h-3 bg-slate-400/60 rounded-full animate-pulse"></div>
              </div>
              <span className="text-slate-500 font-medium text-sm flex items-center">
                <span className="mr-1">Thinking through a response</span>
                <span className="font-mono min-w-5">{animationDots}</span>
              </span>
            </div>
          </div>
        </div>
      )}
      
      {/* Reference to scroll to */}
      <div ref={messagesEndRef} />
    </div>
  );
}