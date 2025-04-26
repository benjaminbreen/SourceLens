// components/ui/RightMiniToolbar.tsx
// Fixed compact vertical toolbar that's only visible when right panel is collapsed
// Provides quick access to right panel functions through icons with tooltips

import React from 'react';

interface RightMiniToolbarProps {
  darkMode: boolean;
  onExpandRightPanel: () => void; // Only expand functionality needed here
  onHighlight: () => void;
  onSummary: () => void;
  onNotes: () => void;
  onToggleDarkMode: () => void; // Add this prop for dark mode toggle
}

export default function RightMiniToolbar({ 
  darkMode, 
  onExpandRightPanel,
  onHighlight,
  onSummary,
  onNotes,
  onToggleDarkMode // Accept the toggle function
}: RightMiniToolbarProps) {
  // Theme classes based on dark mode
  const themeClasses = {
    background: darkMode 
      ? 'bg-slate-800 border-slate-700' 
      : 'bg-white border-slate-200',
    hover: darkMode
      ? 'hover:bg-slate-700'
      : 'hover:bg-slate-100',
    active: darkMode
      ? 'bg-indigo-900/40 text-indigo-300'
      : 'bg-indigo-50 text-indigo-700',
    text: darkMode
      ? 'text-slate-300'
      : 'text-slate-600',
  };

  // Toolbar buttons with icons and tooltips
  const toolbarButtons = [
    {
      id: 'expand',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M9 5l7 7-7 7"
          />
        </svg>
      ),
      label: 'Expand Panel',
      description: 'Show the analysis panel',
      onClick: onExpandRightPanel
    },
    {
      id: 'highlight',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      ),
      label: 'Highlight',
      description: 'Highlight key passages in text',
      onClick: onHighlight
    },
    {
      id: 'summary',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
      label: 'Summary',
      description: 'View or generate text summary',
      onClick: onSummary
    },
    {
      id: 'notes',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      label: 'Research Notes',
      description: 'Manage your research notes',
      onClick: onNotes
    },
    // Dark mode toggle button
    {
      id: 'darkMode',
      icon: darkMode ? (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      ),
      label: darkMode ? 'Light Mode' : 'Dark Mode',
      description: darkMode ? 'Switch to light mode' : 'Switch to dark mode',
      onClick: onToggleDarkMode
    },
 
  ];

  return (
    <div 
      className={`fixed right-0 top-1/2 -translate-y-1/2 z-10 flex flex-col items-center py-4 px-2
      ${themeClasses.background} border-l border-t border-b rounded-l-lg shadow-md transition-all duration-300`}
    >
      <div className="flex flex-col items-center space-y-6">
        {toolbarButtons.map((button) => (
          <div 
            key={button.id} 
            className="relative group"
          >
            {/* Icon button */}
            <button
              onClick={button.onClick}
              className={`p-2 rounded-lg transition-all duration-200
                ${themeClasses.text} ${themeClasses.hover}`}
              aria-label={button.label}
            >
              {button.icon}
            </button>
            
            {/* Tooltip on hover */}
            <div 
              className={`absolute right-full top-1/2 -translate-y-1/2 mr-2 p-2 rounded-md shadow-lg 
                ${themeClasses.background} whitespace-nowrap opacity-0 pointer-events-none 
                group-hover:opacity-100 group-hover:pointer-events-auto
                transition-all duration-300 z-50 min-w-max border ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}
            >
              <p className={`${themeClasses.text} font-medium`}>{button.label}</p>
              <p className={`${darkMode ? 'text-slate-400' : 'text-slate-500'} text-xs mt-0.5`}>{button.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}