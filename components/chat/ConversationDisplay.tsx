// components/chat/ConversationDisplay.tsx
'use client';

import React from 'react';
import { useAppStore } from '@/lib/store';

export default function ConversationDisplay() {
  const { conversation } = useAppStore();
  
  if (conversation.length === 0) {
    return (
      <div className="p-4 text-center text-slate-500 italic">
        <p>Your conversation will appear here.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-3 p-3 max-h-60 overflow-y-auto">
      {conversation.map((message, index) => (
        <div
          key={index}
          className={`p-3 rounded-lg ${
            message.role === 'user'
              ? 'bg-indigo-100 ml-6'
              : 'bg-slate-100 mr-6'
          }`}
        >
          <div className="text-xs font-medium mb-1">
            {message.role === 'user' ? 'You' : 'Assistant'}
          </div>
          <div>{message.content}</div>
        </div>
      ))}
    </div>
  );
}