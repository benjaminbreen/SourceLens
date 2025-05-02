// components/draft/TableOfContents.tsx
import React from 'react';
import { SavedDraft } from '@/lib/libraryContext';

interface TableOfContentsProps {
  draft: SavedDraft;
  darkMode: boolean;
}

export default function TableOfContents({ draft, darkMode }: TableOfContentsProps) {
  const scrollToSection = (sectionId: string) => {
    const sectionElement = document.querySelector(`[data-section-id="${sectionId}"]`);
    if (sectionElement) {
      sectionElement.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  if (!draft.sections || draft.sections.length === 0) {
    return (
      <div className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
        No sections available for this draft.
      </div>
    );
  }
  
  return (
    <div className="space-y-1">
      {draft.sections.map((section, index) => (
        <button
          key={section.id}
          onClick={() => scrollToSection(section.id)}
          className={`w-full text-left text-sm py-1 px-2 rounded ${
            darkMode
              ? 'text-slate-300 hover:bg-slate-800'
              : 'text-slate-700 hover:bg-slate-100'
          } flex items-start`}
        >
          <span className={`mr-2 font-mono text-xs mt-0.5 ${
            darkMode ? 'text-indigo-400' : 'text-indigo-600'
          }`}>
            {(index + 1).toString().padStart(2, '0')}
          </span>
          <span className="line-clamp-2">{section.title}</span>
        </button>
      ))}
    </div>
  );
}