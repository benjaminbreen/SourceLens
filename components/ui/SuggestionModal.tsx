// components/ui/SuggestionModal.tsx
// A modal component to display AI-suggested next steps for the user

import React from 'react';

interface SuggestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  suggestion: string;
  darkMode?: boolean;
}

export default function SuggestionModal({ isOpen, onClose, suggestion, darkMode = false }: SuggestionModalProps) {
  if (!isOpen) return null;

  const themeClasses = {
    backdrop: darkMode ? 'bg-black/70' : 'bg-slate-900/50',
    container: darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200',
    header: darkMode ? 'border-slate-700 text-white' : 'border-slate-200 text-slate-900',
    content: darkMode ? 'text-slate-300' : 'text-slate-700',
    button: darkMode ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
  };

  return (
    <div className={`fixed inset-0 ${themeClasses.backdrop} backdrop-blur-sm flex items-center justify-center z-50 p-4`}>
      <div className={`rounded-lg shadow-xl max-w-md w-full ${themeClasses.container} border`}>
        <div className={`p-4 border-b ${themeClasses.header} flex justify-between items-center`}>
          <h3 className="font-medium text-lg flex items-center">
            <svg className="w-5 h-5 mr-2 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            Suggested Next Steps
          </h3>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white text-2xl transition-colors"
          >
            &times;
          </button>
        </div>
        
        <div className="p-6">
          <p className={`${themeClasses.content} leading-relaxed`}>
            {suggestion}
          </p>
        </div>
        
        <div className="p-4 border-t border-slate-700 flex justify-end">
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${themeClasses.button}`}
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}