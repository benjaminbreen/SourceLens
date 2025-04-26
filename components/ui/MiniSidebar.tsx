// components/ui/MiniSidebar.tsx
// Compact vertical navbar that appears when the main sidebar is collapsed
// Provides icon-only navigation with hover-to-expand functionality

import React from 'react';
import { useAppStore } from '@/lib/store';

interface MiniSidebarProps {
  darkMode: boolean;
  activePanel: string;
  setActivePanel: (panel: any) => void;
  onExpandSidebar: () => void;
  sidebarHovered: boolean;
}

export default function MiniSidebar({ 
  darkMode, 
  activePanel, 
  setActivePanel, 
  onExpandSidebar,
  sidebarHovered
}: MiniSidebarProps) {
  // Handle panel activation
  const handleSetPanel = (panel: string) => {
    setActivePanel(panel);
  };

  // Theme classes based on dark mode
  const themeClasses = {
    background: darkMode 
      ? 'bg-slate-800 border-slate-700' 
      : 'bg-white border-slate-200',
    hover: darkMode
      ? 'hover:bg-slate-700'
      : 'hover:bg-slate-100',
    active: darkMode
      ? 'bg-indigo-900/40 text-indigo-300 border-indigo-700'
      : 'bg-indigo-50 text-indigo-700 border-indigo-200',
    text: darkMode
      ? 'text-slate-300'
      : 'text-slate-600',
  };

  // Navigation items with icons
  const navItems = [
    { 
      id: 'analysis', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      label: 'Basic Analysis'
    },
    { 
      id: 'detailed-analysis', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      label: 'Detailed Analysis'
    },
    { 
      id: 'extract-info', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2M19 13l-4 4m0 0l-4-4m4 4V7" />
        </svg>
      ),
      label: 'Extract Info'
    },
    { 
      id: 'references', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      label: 'References'
    },
    
    { 
      id: 'counter', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m-4 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      ),
      label: 'Counter-Narrative'
    },
    { 
      id: 'highlight', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      ),
      label: 'Highlight'
    },
    { 
      id: 'connections', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      ),
      label: 'Connections'
    },
  ];

  return (
    <div 
     className={`absolute top-0 left-0 bottom-0 z-30 w-14 flex flex-col items-center pt-20 pb-8 
    ${themeClasses.background} border-r shadow-md transition-all duration-300`}
    >
      {/* Expand button */}
      <button 
        onClick={onExpandSidebar}
        className={`mb-8 p-2 rounded-lg ${themeClasses.background} border shadow-sm transition-all duration-200 
          ${themeClasses.hover} ${themeClasses.text}`}
        aria-label="Expand sidebar"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <div className="flex flex-col items-center space-y-4">
        {navItems.map((item) => (
          <div 
            key={item.id} 
            className="relative group"
          >
            {/* Icon button */}
            <button
              onClick={() => handleSetPanel(item.id)}
              className={`p-2.5 rounded-lg transition-all duration-200 ${
                activePanel === item.id 
                  ? themeClasses.active 
                  : `${themeClasses.background} ${themeClasses.text} ${themeClasses.hover}`
              }`}
              aria-label={item.label}
            >
              {item.icon}
            </button>
            
            {/* Expanded label on hover */}
            <div 
              className={`absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-1.5 rounded-md shadow-lg 
                ${themeClasses.background} whitespace-nowrap opacity-0 pointer-events-none 
                ${sidebarHovered ? 'opacity-0' : 'group-hover:opacity-100 group-hover:pointer-events-auto'} 
                transition-all duration-300 z-50`}
            >
              <span className={themeClasses.text}>{item.label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}