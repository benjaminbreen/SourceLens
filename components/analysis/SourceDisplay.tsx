// components/analysis/SourceDisplay.tsx
// Enhanced source display component with fixed height, scrolling, and dark mode toggle
// Now featuring text highlighting capability with color-coded relevance indicators

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAppStore, HighlightedSegment } from '@/lib/store';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface SourceDisplayProps {
  darkMode?: boolean;
  toggleDarkMode?: () => void;
  // New prop for highlight rendering (optional)
  renderHighlights?: boolean;
}

export default function SourceDisplay({ darkMode, toggleDarkMode, renderHighlights = true }: SourceDisplayProps) {
  const { 
    sourceContent, 
    sourceType, 
    sourceFile,
    highlightedSegments, 
    isHighlightMode 
  } = useAppStore();
  
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

  // Add this function to create highlighted text
  const renderHighlightedText = (text: string): React.ReactNode => {
    if (!text || !isHighlightMode || !highlightedSegments || highlightedSegments.length === 0 || !renderHighlights) {
      // If highlighting is off or no segments, just render paragraphs as before
      return text.split('\n\n').map((paragraph, index) => (
        <p key={index} className="mb-4">{paragraph}</p>
      ));
    }

    // Sort segments by startIndex
    const sortedSegments = [...highlightedSegments].sort((a, b) => a.startIndex - b.startIndex);

    // Create an array of text chunks with highlight information
    const chunks: {text: string; highlight: boolean; score: number; index: number}[] = [];
    let lastIndex = 0;

    sortedSegments.forEach((segment, segIndex) => {
      // Add text before this segment if needed
      if (segment.startIndex > lastIndex) {
        chunks.push({
          text: text.substring(lastIndex, segment.startIndex),
          highlight: false,
          score: 0,
          index: -1
        });
      }

      // Add the highlighted segment
      chunks.push({
        text: text.substring(segment.startIndex, segment.endIndex),
        highlight: true,
        score: segment.score,
        index: segIndex
      });

      lastIndex = segment.endIndex;
    });

    // Add any remaining text after the last segment
    if (lastIndex < text.length) {
      chunks.push({
        text: text.substring(lastIndex),
        highlight: false,
        score: 0,
        index: -1
      });
    }

    // Get color class based on score
    const getHighlightClass = (score: number): string => {
      if (darkMode) {
        // Dark mode highlight colors (more subtle)
        if (score < 0.2) return 'bg-blue-500/20 border-l-2 border-blue-500';
        if (score < 0.4) return 'bg-emerald-500/20 border-l-2 border-emerald-500';
        if (score < 0.6) return 'bg-yellow-500/20 border-l-2 border-yellow-500';
        if (score < 0.8) return 'bg-orange-500/20 border-l-2 border-orange-500';
        return 'bg-red-500/20 border-l-2 border-red-500';
      } else {
        // Light mode highlight colors
        if (score < 0.2) return 'bg-blue-200/40 border-l-2 border-blue-400';
        if (score < 0.4) return 'bg-emerald-200/40 border-l-2 border-emerald-400';
        if (score < 0.6) return 'bg-yellow-200/50 border-l-2 border-yellow-400';
        if (score < 0.8) return 'bg-orange-200/40 border-l-2 border-orange-400';
        return 'bg-red-200/40 border-l-2 border-red-400';
      }
    };

    // Render the chunks with appropriate highlighting
    return (
      <div>
        {chunks.map((chunk, index) => {
          // Split each chunk into paragraphs
          const paragraphs = chunk.text.split('\n\n');
          
          return (
            <React.Fragment key={index}>
              {paragraphs.map((paragraph, pIndex) => (
                <p key={`${index}-${pIndex}`} className="mb-4">
                  {chunk.highlight ? (
                    <span 
                      id={`highlight-${chunk.index}`}
                      className={`px-1 py-0.5 rounded-md transition-colors ${getHighlightClass(chunk.score)}`}
                    >
                      {paragraph}
                    </span>
                  ) : (
                    paragraph
                  )}
                </p>
              ))}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

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

    // For text content - use different rendering based on highlight mode
    if (isHighlightMode && renderHighlights && highlightedSegments && highlightedSegments.length > 0) {
      return renderHighlightedText(processedContent);
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
      <div className="dark-mode-toggle absolute -top-16 left-43 z-5"></div>

      {/* Highlight mode indicator */}
      {isHighlightMode && highlightedSegments && highlightedSegments.length > 0 && (
        <div className="absolute -top-10 left-0 right-0 flex justify-center">
          <div className="bg-amber-50 border border-amber-200 rounded-full px-3 py-1 text-xs text-amber-700 shadow-sm flex items-center">
            <svg className="w-4 h-4 mr-1 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Highlighting {highlightedSegments.length} segments
          </div>
        </div>
      )}

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