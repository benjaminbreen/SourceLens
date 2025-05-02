// components/draft/SectionHeader.tsx
import React from 'react';

interface SectionHeaderProps {
  section: {
    id: string;
    title: string;
    summary: string;
  };
  isExpanded: boolean;
  toggleExpand: () => void;
  darkMode: boolean;
}

export default function SectionHeader({
  section,
  isExpanded,
  toggleExpand,
  darkMode
}: SectionHeaderProps) {
  return (
    <div 
      className={`flex items-start p-4 cursor-pointer ${
        darkMode 
          ? `bg-slate-800 hover:bg-slate-750 ${isExpanded ? 'border-b border-slate-700' : ''}` 
          : `bg-slate-50 hover:bg-slate-100 ${isExpanded ? 'border-b border-slate-200' : ''}`
      }`} 
      onClick={toggleExpand}
    >
      <button
        className={`mt-1 p-1 rounded-full transition-transform ${
          isExpanded ? 'transform rotate-90' : ''
        } ${darkMode ? 'text-slate-400 hover:text-slate-300' : 'text-slate-500 hover:text-slate-700'}`}
        aria-label={isExpanded ? "Collapse section" : "Expand section"}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
      
      <div className="ml-2 flex-grow">
        <h3 className={`font-medium text-lg ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
          {section.title}
        </h3>
        <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
          {section.summary}
        </p>
      </div>
    </div>
  );
}