// components/analysis/SourceDisplay.tsx
// Enhanced source display component with fixed height, scrolling, and dark mode toggle
// Specifically optimized for OCR text with code block formatting disabled to prevent hydration errors

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface SourceDisplayProps {
  darkMode?: boolean;
  toggleDarkMode?: () => void;
}

export default function SourceDisplay({ darkMode, toggleDarkMode }: SourceDisplayProps) {
  const { sourceContent, sourceType, sourceFile } = useAppStore();
  const [containerHeight, setContainerHeight] = useState(600); // Default height
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef<number>(0);
  const startHeightRef = useRef<number>(0);

  // Use local function only if parent didn't provide one
  const handleToggleDarkMode = () => {
    if (toggleDarkMode) {
      toggleDarkMode();
    }
  };
  
  // Clean OCR text if needed
  const processedContent = React.useMemo(() => {
    if (!sourceContent) return '';
    return sourceContent;
  }, [sourceContent]);

  // Handle mouse down to start dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    startYRef.current = e.clientY;
    startHeightRef.current = containerHeight;
    setIsDragging(true);
    document.body.style.cursor = 'ns-resize';
  };

  // Handle global mouse events for dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const deltaY = e.clientY - startYRef.current;
      // Set min height to 200px and max height to 1200px
      const newHeight = Math.max(200, Math.min(1200, startHeightRef.current + deltaY));
      
      setContainerHeight(newHeight);
    };
    
    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        document.body.style.cursor = 'default';
      }
    };
    
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // Display different content based on source type
  const renderContent = () => {
    if (!sourceContent && !sourceFile) {
      return (
        <div className="flex items-center justify-center h-full">
          <p className={`${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>No source content to display</p>
        </div>
      );
    }

    if (sourceType === 'pdf' && sourceFile) {
      return (
        <div className={`p-4 ${darkMode ? 'bg-slate-800' : 'bg-slate-50'} rounded-md`}>
          <p className={`${darkMode ? 'text-slate-300' : 'text-slate-700'} mb-2`}>PDF Document:</p>
          <p className={`font-medium ${darkMode ? 'text-white' : ''}`}>{sourceFile.name}</p>
          <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'} mt-2`}>
            PDF content has been extracted and cleaned for analysis.
          </p>
        </div>
      );
    }

    if (sourceType === 'image' && sourceFile) {
      return (
        <div className="flex flex-col items-center">
          <p className={`${darkMode ? 'text-slate-300' : 'text-slate-700'} mb-2`}>Image Source:</p>
          <div className="relative w-full h-[70vh]">
            <Image 
              src={URL.createObjectURL(sourceFile)} 
              alt="Source document" 
              className="rounded-md shadow-md object-contain" 
              fill
            />
          </div>
          <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'} mt-2`}>
            Image text has been extracted and cleaned for analysis.
          </p>
        </div>
      );
    }

    // For text content with markdown support - with code blocks disabled
    return (
      <div className={`font-serif leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
        {processedContent.includes('#') || processedContent.includes('*') || processedContent.includes('- ') ? (
          <div className="prose prose-slate max-w-none dark:prose-invert">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({node, ...props}) => <h1 className="text-2xl font-bold mt-6 mb-4" {...props} />,
                h2: ({node, ...props}) => <h2 className="text-xl font-bold mt-5 mb-3" {...props} />,
                h3: ({node, ...props}) => <h3 className="text-lg font-bold mt-4 mb-2" {...props} />,
                h4: ({node, ...props}) => <h4 className="text-base font-bold mt-3 mb-2" {...props} />,
                p: ({node, ...props}) => <p className="mb-4" {...props} />,
                ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-4" {...props} />,
                ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-4" {...props} />,
                li: ({node, ...props}) => <li className="mb-1" {...props} />,
                blockquote: ({node, ...props}) => (
                  <blockquote className={`border-l-4 ${darkMode ? 'border-slate-600 bg-slate-800/50' : 'border-slate-300 bg-slate-100/50'} pl-4 py-1 my-4 italic`} {...props} />
                ),
                // IMPORTANT CHANGE: Handle code blocks as paragraphs instead
               code: ({node, className, children, ...props}: any) => {
                 // Always treat as regular text - disable special code formatting
                 return <span className="font-mono" {...props}>{children}</span>;
               },
                // Render pre tags as divs to prevent nesting issues
                pre: ({node, children, ...props}) => (
                  <div className="mb-4 whitespace-pre-wrap font-mono text-sm">
                    {children}
                  </div>
                ),
                table: ({node, ...props}) => (
                  <div className="overflow-x-auto my-4">
                    <table className={`min-w-full border ${darkMode ? 'border-slate-700' : 'border-slate-300'}`} {...props} />
                  </div>
                ),
                thead: ({node, ...props}) => <thead className={darkMode ? 'bg-slate-800' : 'bg-slate-100'} {...props} />,
                tbody: ({node, ...props}) => <tbody {...props} />,
                tr: ({node, ...props}) => <tr className={darkMode ? 'border-t border-slate-700' : 'border-t border-slate-300'} {...props} />,
                th: ({node, ...props}) => <th className={`px-3 py-2 text-left font-medium ${darkMode ? 'border-slate-700' : 'border-slate-300'}`} {...props} />,
                td: ({node, ...props}) => <td className={`px-3 py-2 ${darkMode ? 'border-slate-700' : 'border-slate-300'}`} {...props} />
              }}
            >
              {processedContent}
            </ReactMarkdown>
          </div>
        ) : (
          // Fallback to simple paragraph rendering if no markdown detected
          <>
            {processedContent.split('\n\n').map((paragraph, index) => (
              <p key={index} className="mb-4">{paragraph}</p>
            ))}
          </>
        )}
      </div>
    );
  };

  return (
    <div className="relative">
      {/* Dark mode toggle - only visible to parent component */}
      <div className="dark-mode-toggle absolute -top-16 left-43 z-5">
        
      </div>

      {/* Main content container with fixed height and scrolling */}
      <div 
        ref={containerRef}
        className={`overflow-y-auto border ${
          darkMode 
            ? 'border-slate-700 bg-slate-900/90 text-lg' 
            : 'border-slate-200 bg-white text-lg'
        } rounded-md transition-colors duration-300`}
        style={{ 
          height: `${containerHeight}px`,
          maxHeight: '1200px',
          transition: isDragging ? 'none' : 'height 0.1s ease-out'
        }}
      >
        <div className="p-4">
          {renderContent()}
        </div>
      </div>
      
      {/* Resizer handle */}
      <div 
        className={`absolute bottom-0 left-0 right-0 h-5 bg-gradient-to-t ${
          darkMode 
            ? 'from-slate-800 to-transparent' 
            : 'from-slate-100 to-transparent'
        } cursor-ns-resize flex justify-center items-end transition-colors duration-300`}
        onMouseDown={handleMouseDown}
      >
        <div className={`w-16 h-1 mb-1 ${
          darkMode 
            ? 'bg-slate-600 hover:bg-slate-500' 
            : 'bg-slate-300 hover:bg-slate-400'
        } rounded-full transition-colors`}></div>
      </div>
    </div>
  );
}