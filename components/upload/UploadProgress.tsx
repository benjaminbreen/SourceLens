// Add this component to your components folder:
// components/upload/UploadProgress.tsx

import React from 'react';

interface UploadProgressProps {
  show: boolean;
  progress: number;
  currentMessage: string;
  messages: string[];
}

export default function UploadProgress({ 
  show, 
  progress, 
  currentMessage, 
  messages 
}: UploadProgressProps) {
  if (!show) return null;
  
  return (
    <div className="mb-4 px-4 py-3 bg-slate-50 border border-slate-200 rounded-md animate-in fade-in slide-in-from-bottom duration-300">
      <div className="mb-2 flex justify-between items-center">
        <span className="text-sm font-medium text-slate-700">{currentMessage}</span>
        <span className="text-sm font-medium text-slate-700">{progress}%</span>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-1.5">
        <div 
          className="bg-amber-600 h-1.5 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      {/* Status message log - shows last few messages */}
      <div className="mt-2 max-h-16 overflow-y-auto text-xs text-slate-500">
        {messages.slice(-3).map((message, idx) => (
          <div key={idx} className={`${idx === messages.length - 1 ? 'text-slate-700' : ''}`}>
            {message}
          </div>
        ))}
      </div>
    </div>
  );
}