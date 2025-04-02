// components/chat/ConversationDisplay.tsx
// Terminal-styled conversation display with clean styling
// Shows messages in a professional format with syntax highlighting

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
      // Directly control the scroll position of the container
      const container = chatContainerRef.current;
      container.scrollTop = container.scrollHeight;
    }
  }, [conversation, showThinking]);
  
  // Get model display name (shorter version)
  const getModelName = () => {
    return llmModel?.split('-').slice(0, 2).join('-').toUpperCase() || 'GEMINI-FLASH';
  };
  
  if (conversation.length === 0 && !showThinking) {
    return (
      <div ref={chatContainerRef} className="p-4 h-full flex flex-col items-center justify-center bg-slate-900 text-slate-300">
        <div className="max-w-md text-center font-mono text-xs">
          <pre className="mb-2 text-cyan-400">
{`
 ┌───────────────────────────┐
 │ TERMINAL INTERFACE ACTIVE │
 └───────────────────────────┘
`}
          </pre>
          <p className="text-slate-400">Your conversation about this source will appear here.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div 
      ref={chatContainerRef} 
      className="h-full overflow-y-auto pb-8 bg-slate-900 text-slate-300 px-2"
    >
      <div className="space-y-3 p-2">
        {conversation.map((message, index) => (
          <div
            key={index}
            className={`p-3 my-2 rounded-sm ${
              message.role === 'user'
                ? 'bg-slate-800 border-l-2 border-cyan-500 ml-6 shadow-md'
                : 'bg-slate-800/50 border-l-2 border-green-500 mr-6 shadow-sm'
            }`}
          >
            <div className="text-xs font-mono mb-1 flex items-center">
              {message.role === 'user' ? (
                <span className="text-cyan-400">&gt; USER</span>
              ) : (
                <div className="flex items-center">
                  <span className="font-mono text-green-400">&gt; SYSTEM</span>
                  <span className="ml-2 text-[10px] px-1.5 py-0.5 bg-slate-950 rounded font-mono text-slate-500">
                    {getModelName()}
                  </span>
                </div>
              )}
            </div>
            <div className={`prose prose-sm max-w-none ${message.role === 'user' ? 'prose-cyan' : 'prose-invert'} prose-p:my-1 prose-headings:mb-1 prose-table:border-collapse`}>
              {message.role === 'user' ? (
                <div className="text-slate-300">{message.content}</div>
              ) : (
                <ReactMarkdown
                  components={{
                    // Custom table rendering
                    table: ({node, ...props}) => (
                      <div className="overflow-x-auto my-2">
                        <table className="w-full border-collapse border border-slate-700" {...props} />
                      </div>
                    ),
                    thead: ({node, ...props}) => <thead className="bg-slate-800" {...props} />,
                    tbody: ({node, ...props}) => <tbody {...props} />,
                    tr: ({node, ...props}) => <tr className="border-b border-slate-700" {...props} />,
                    th: ({node, ...props}) => <th className="border border-slate-700 p-2 text-left font-medium" {...props} />,
                    td: ({node, ...props}) => <td className="border border-slate-700 p-2" {...props} />,
                    code: ({node, className, children, ...props}: any) => {
                      const isInline = !className;
                      return isInline 
                        ? <code className="bg-slate-950 text-cyan-300 px-1 py-0.5 rounded font-mono text-xs" {...props}>{children}</code>
                        : <code className="block bg-slate-950 text-cyan-300 p-2 rounded font-mono text-xs" {...props}>{children}</code>
                    }
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              )}
            </div>
          </div>
        ))}
        
        {/* Thinking indicator */}
        {showThinking && (
          <div className="mb-2 animate-fade-in transition-all duration-500">
            <div className="bg-slate-800/60 border-l-2 border-amber-500 rounded-sm p-3 ml-6 inline-block">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-amber-500/60 rounded-full animate-pulse mr-2"></div>
                <span className="text-slate-300 font-mono text-xs flex items-center">
                  <span className="text-amber-400 mr-1">PROCESSING</span>
                  <span className="font-mono text-amber-300 min-w-5">{animationDots}</span>
                </span>
              </div>
            </div>
          </div>
        )}
        
        {/* Scroll reference */}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}