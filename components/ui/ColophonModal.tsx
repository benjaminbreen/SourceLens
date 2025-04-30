// components/ui/ColophonModal.tsx
// Colophon page detailing the technical specifications and design elements of SourceLens
// Provides information about frameworks, libraries, fonts, and other tools used

'use client';

import React from 'react';
import DocModal from './DocModal';

interface ColophonModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
}

export default function ColophonModal({ isOpen, onClose, isDarkMode }: ColophonModalProps) {
  return (
    <DocModal
      isOpen={isOpen}
      onClose={onClose}
      title="Colophon"
      slug="colophon"
      isDarkMode={isDarkMode}
    >
      <h3 className={`${isDarkMode ? 'text-indigo-300' : 'text-indigo-900'} text-2xl font-semibold mb-4`}>
        Colophon
      </h3>
      
      <p className={`${isDarkMode ? 'text-slate-300' : 'text-slate-700'} mb-6`}>
        SourceLens was designed and built by Benjamin Breen with a focus on creating an intuitive, responsive research tool
        that doesn't shy away from quirky, perhaps even eccentric, design and functionality. Was it vibe-coded? Depends on how you define the term. 
        I am a beginning coder and relied almost exclusively on Claude Sonnet 3.7 to write the code, but the underlying architecture,
        functions, and many UI/design elements are human-made. Thank you to everyone maintaining open source code libraries and tools
        used in this code. 
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section>
          <h4 className={`text-lg font-medium ${isDarkMode ? 'text-amber-400' : 'text-indigo-800'} mb-3`}>
            Technologies
          </h4>
          <ul className={`space-y-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
            <li className="flex items-center gap-2">
              <span className={`inline-block w-3 h-3 rounded-full ${isDarkMode ? 'bg-indigo-500' : 'bg-indigo-600'}`}></span>
              <span><strong>Framework:</strong> Next.js 14</span>
            </li>
            <li className="flex items-center gap-2">
              <span className={`inline-block w-3 h-3 rounded-full ${isDarkMode ? 'bg-indigo-500' : 'bg-indigo-600'}`}></span>
              <span><strong>Styling:</strong> Tailwind CSS v4</span>
            </li>
            <li className="flex items-center gap-2">
              <span className={`inline-block w-3 h-3 rounded-full ${isDarkMode ? 'bg-indigo-500' : 'bg-indigo-600'}`}></span>
              <span><strong>Language:</strong> TypeScript</span>
            </li>
            <li className="flex items-center gap-2">
              <span className={`inline-block w-3 h-3 rounded-full ${isDarkMode ? 'bg-indigo-500' : 'bg-indigo-600'}`}></span>
              <span><strong>Authentication:</strong> Supabase Auth</span>
            </li>
            <li className="flex items-center gap-2">
              <span className={`inline-block w-3 h-3 rounded-full ${isDarkMode ? 'bg-indigo-500' : 'bg-indigo-600'}`}></span>
              <span><strong>Database:</strong> Supabase</span>
            </li>
            <li className="flex items-center gap-2">
              <span className={`inline-block w-3 h-3 rounded-full ${isDarkMode ? 'bg-indigo-500' : 'bg-indigo-600'}`}></span>
              <span><strong>State Management:</strong> Zustand</span>
            </li>
            <li className="flex items-center gap-2">
              <span className={`inline-block w-3 h-3 rounded-full ${isDarkMode ? 'bg-indigo-500' : 'bg-indigo-600'}`}></span>
              <span><strong>AI Integration:</strong> Anthropic Claude, OpenAI, Gemini API</span>
            </li>
          </ul>
        </section>
        
        <section>
          <h4 className={`text-lg font-medium ${isDarkMode ? 'text-amber-400' : 'text-indigo-800'} mb-3`}>
            Typography & Design
          </h4>
          <ul className={`space-y-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
            <li className="flex items-center gap-2">
              <span className={`inline-block w-3 h-3 rounded-full ${isDarkMode ? 'bg-amber-500' : 'bg-amber-600'}`}></span>
              <span><strong>Primary Font:</strong> Space Grotesk</span>
            </li>
            <li className="flex items-center gap-2">
              <span className={`inline-block w-3 h-3 rounded-full ${isDarkMode ? 'bg-amber-500' : 'bg-amber-600'}`}></span>
              <span><strong>Secondary Font:</strong> Lora (serif)</span>
            </li>
            <li className="flex items-center gap-2">
              <span className={`inline-block w-3 h-3 rounded-full ${isDarkMode ? 'bg-amber-500' : 'bg-amber-600'}`}></span>
              <span><strong>Monospace Font:</strong> Geist Mono</span>
            </li>
            <li className="flex items-center gap-2">
              <span className={`inline-block w-3 h-3 rounded-full ${isDarkMode ? 'bg-amber-500' : 'bg-amber-600'}`}></span>
              <span><strong>Color Palette:</strong> Tailwind Slate & Indigo</span>
            </li>
            <li className="flex items-center gap-2">
              <span className={`inline-block w-3 h-3 rounded-full ${isDarkMode ? 'bg-amber-500' : 'bg-amber-600'}`}></span>
              <span><strong>Icons:</strong> Custom SVG & Lucide React</span>
            </li>
            <li className="flex items-center gap-2">
              <span className={`inline-block w-3 h-3 rounded-full ${isDarkMode ? 'bg-amber-500' : 'bg-amber-600'}`}></span>
              <span><strong>Animations:</strong> Framer Motion</span>
            </li>
            <li className="flex items-center gap-2">
              <span className={`inline-block w-3 h-3 rounded-full ${isDarkMode ? 'bg-amber-500' : 'bg-amber-600'}`}></span>
              <span><strong>Data Visualization:</strong> Recharts</span>
            </li>
          </ul>
        </section>
      </div>
      
      <section className="mt-6">
        <h4 className={`text-lg font-medium ${isDarkMode ? 'text-amber-400' : 'text-indigo-800'} mb-3`}>
          Additional Libraries & Tools
        </h4>
        <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
          <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-slate-50 border border-slate-200'} text-center`}>
            React-Markdown
          </div>
          <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-slate-50 border border-slate-200'} text-center`}>
            date-fns
          </div>
          <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-slate-50 border border-slate-200'} text-center`}>
            PapaParse
          </div>
          <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-slate-50 border border-slate-200'} text-center`}>
            SheetJS
          </div>
          <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-slate-50 border border-slate-200'} text-center`}>
            React-Dropzone
          </div>
          <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-slate-50 border border-slate-200'} text-center`}>
            React-Hook-Form
          </div>
          <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-slate-50 border border-slate-200'} text-center`}>
            UUID
          </div>
          <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-slate-50 border border-slate-200'} text-center`}>
            Lodash
          </div>
        </div>
      </section>

       <div className={`mt-8 p-4 rounded-lg ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-slate-50 border border-slate-200'}`}>
        <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          Version 1.0 • April 2025
        </p>
      </div>
    </DocModal>
  );
}