// components/analysis/SourceDisplay.tsx
// Switches between enhanced Markdown view and simple highlight view.
// Adds font size control for better readability and fixes hydration errors with code blocks

'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useAppStore, HighlightedSegment } from '@/lib/store';
import Image from 'next/image';
import ReactMarkdown, { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';

// --- Icon Components ---
const HighlightIndicatorIcon = () => (
    <svg className="w-4 h-4 text-amber-600 dark:text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" /></svg>
);

interface SourceDisplayProps {
   darkMode?: boolean;
  toggleDarkMode?: () => void;
  renderHighlights?: boolean;
  fontSize?: number; 
}

export default function SourceDisplay({ darkMode = false, toggleDarkMode, renderHighlights = true, fontSize = 16 }: SourceDisplayProps) {
  const {
    sourceContent, sourceType, sourceFile, highlightedSegments,
    isHighlightMode, highlightQuery, llmModel
  } = useAppStore();

  const [containerHeight, setContainerHeight] = useState(600);
  const [isDragging, setIsDragging] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef<number>(0);
  const startHeightRef = useRef<number>(0);

  // --- Dragging Logic ---
  const handleMouseDown = (e: React.MouseEvent) => { 
    e.preventDefault(); 
    startYRef.current = e.clientY; 
    startHeightRef.current = containerHeight; 
    setIsDragging(true); 
    document.body.style.cursor = 'ns-resize'; 
    document.addEventListener('mousemove', handleMouseMove); 
    document.addEventListener('mouseup', handleMouseUp); 
  };
  
  const handleMouseMove = (e: MouseEvent) => { 
    if (!isDragging) return; 
    const deltaY = e.clientY - startYRef.current; 
    const newHeight = Math.max(200, Math.min(1200, startHeightRef.current + deltaY)); 
    setContainerHeight(newHeight); 
  };
  
  const handleMouseUp = () => { 
    if (isDragging) { 
      setIsDragging(false); 
      document.body.style.cursor = 'default'; 
      document.removeEventListener('mousemove', handleMouseMove); 
      document.removeEventListener('mouseup', handleMouseUp); 
    } 
  };
  
  useEffect(() => { 
    return () => { 
      document.removeEventListener('mousemove', handleMouseMove); 
      document.removeEventListener('mouseup', handleMouseUp); 
    }; 
  }, []);

  // --- Highlight Color Logic ---
  const getHighlightClass = (score: number): string => {
    const base = "rounded px-1 mx-px py-0.5 cursor-help transition-colors duration-150";
    if (darkMode) {
      if (score < 0.2) return `${base} bg-blue-800/60 hover:bg-blue-700/70`;
      if (score < 0.4) return `${base} bg-emerald-800/60 hover:bg-emerald-700/70`;
      if (score < 0.6) return `${base} bg-yellow-800/60 hover:bg-yellow-700/70`;
      if (score < 0.8) return `${base} bg-orange-800/60 hover:bg-orange-700/70`;
      return `${base} bg-red-800/60 hover:bg-red-700/70`;
    } else {
      if (score < 0.2) return `${base} bg-blue-100 hover:bg-blue-200`;
      if (score < 0.4) return `${base} bg-emerald-100 hover:bg-emerald-200`;
      if (score < 0.6) return `${base} bg-yellow-100 hover:bg-yellow-200`;
      if (score < 0.8) return `${base} bg-orange-100 hover:bg-orange-200`;
      return `${base} bg-red-100 hover:bg-red-200`;
    }
  };

  // --- Enhanced Markdown Components - FIXED to prevent <pre> inside <p> ---
  const markdownComponents = useMemo<Components>(() => ({
    h1: ({node, ...props}) => <h1 style={{fontSize: `${fontSize * 1.875}px`}} className="font-semibold font-serif mt-8 mb-5 border-b pb-2 dark:border-slate-700 border-slate-300" {...props} />,
    h2: ({node, ...props}) => <h2 style={{fontSize: `${fontSize * 1.5}px`}} className="font-semibold font-serif mt-7 mb-4 border-b pb-1 dark:border-slate-700 border-slate-300" {...props} />,
    h3: ({node, ...props}) => <h3 style={{fontSize: `${fontSize * 1.25}px`}} className="font-semibold font-serif mt-6 mb-3" {...props} />,
    h4: ({node, ...props}) => <h4 style={{fontSize: `${fontSize * 1.125}px`}} className="font-semibold font-serif mt-5 mb-2" {...props} />,
    p: ({node, ...props}) => <p style={{fontSize: `${fontSize}px`}} className="mb-5 font-serif leading-relaxed md:leading-loose" {...props} />,
    ul: ({node, ...props}) => <ul style={{fontSize: `${fontSize}px`}} className="list-disc pl-6 mb-5 space-y-2 font-serif" {...props} />,
    ol: ({node, ...props}) => <ol style={{fontSize: `${fontSize}px`}} className="list-decimal pl-6 mb-5 space-y-2 font-serif" {...props} />,
    li: ({node, ...props}) => <li style={{fontSize: `${fontSize}px`}} className="mb-1.5 font-serif leading-relaxed" {...props} />,
    blockquote: ({node, ...props}) => <blockquote style={{fontSize: `${fontSize}px`}} className="border-l-4 pl-5 py-2 my-5 italic font-serif dark:border-indigo-500 border-indigo-300 dark:bg-indigo-900/20 bg-indigo-50/50 dark:text-indigo-200 text-indigo-800" {...props} />,
    
    // Fix: Use the any type for the inline prop
    code: ({ className, children, ...props }: any) => {
      const match = /language-(\w+)/.exec(className || '');
      
      // Only apply inline styling for inline code (not blocks)
      if (props.inline) {
        return (
          <code style={{fontSize: `${fontSize * 0.875}px`}} className="px-1.5 py-0.5 rounded font-mono bg-slate-200 text-purple-700 dark:bg-slate-700 dark:text-amber-300" {...props}>
            {children}
          </code>
        );
      }
      
      // We don't render code blocks here - they'll be handled by pre
      return <code className={className} {...props}>{children}</code>;
    },
    
    // Handle code blocks at the pre level to avoid nesting issues
    pre: ({node, children, ...props}) => (
      <div className="my-6">
        <pre 
          style={{fontSize: `${fontSize * 0.875}px`}} 
          className={`p-4 rounded-md overflow-x-auto font-mono shadow-inner ${
            darkMode ? 'bg-slate-800 text-slate-200 ring-1 ring-slate-700' : 'bg-slate-100 text-slate-800 ring-1 ring-slate-200'
          }`}
          {...props}
        >
          {children}
        </pre>
      </div>
    ),
    
    table: ({node, ...props}) => <div className={`overflow-x-auto my-5 border rounded-lg shadow-sm ${darkMode ? 'border-slate-700' : 'border-slate-300'}`}><table style={{fontSize: `${fontSize}px`}} className="min-w-full divide-y dark:divide-slate-700 divide-slate-300" {...props} /></div>,
    thead: ({node, ...props}) => <thead className={darkMode ? 'bg-slate-800' : 'bg-slate-100'} {...props} />,
    tbody: ({node, ...props}) => <tbody className={`divide-y ${darkMode ? 'divide-slate-700' : 'divide-slate-200'}`} {...props} />,
    tr: ({node, ...props}) => <tr className={`transition-colors ${darkMode ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}`} {...props} />,
    th: ({node, ...props}) => <th style={{fontSize: `${fontSize * 0.75}px`}} className="px-4 py-2.5 text-left font-semibold uppercase tracking-wider font-sans dark:text-slate-400 text-slate-500" {...props} />,
    td: ({node, ...props}) => <td style={{fontSize: `${fontSize * 0.875}px`}} className="px-4 py-2 font-serif" {...props} />,
    a: ({node, ...props}) => <a style={{fontSize: `${fontSize}px`}} className="text-indigo-600 dark:text-indigo-400 hover:underline decoration-dotted" target="_blank" rel="noopener noreferrer" {...props} />,
    hr: ({node, ...props}) => <hr className={`my-8 border-dashed ${darkMode ? 'border-slate-700' : 'border-slate-300'}`} {...props} />,
  }), [darkMode, fontSize]);


  // --- Highlight Rendering Logic ---
  // --- Highlight Rendering Logic ---
const renderParagraphWithHighlights = (paragraph: string, paragraphIndex: number) => {
  // Skip if paragraph looks like a code block to prevent rendering issues
  if (paragraph.trim().startsWith('```')) {
    return (
      <div key={paragraphIndex} className="mb-4">
        <pre style={{fontSize: `${fontSize * 0.875}px`}} className={`p-4 rounded-md overflow-x-auto font-mono shadow-inner ${
          darkMode ? 'bg-slate-800 text-slate-200 ring-1 ring-slate-700' : 'bg-slate-100 text-slate-800 ring-1 ring-slate-200'
        }`}>
          {paragraph.replace(/^```(\w*)\n/, '').replace(/```$/, '')}
        </pre>
      </div>
    );
  }
  
  const relevantSegments = highlightedSegments.filter(segment =>
    paragraph.includes(segment.text)
  );

  if (relevantSegments.length === 0) {
    // Render plain text paragraph
    return <p key={paragraphIndex} style={{fontSize: `${fontSize}px`}} className="mb-4">{paragraph}</p>;
  }

  const parts: React.ReactNode[] = [];
  let remainingText = paragraph;
  let partKey = 0;
  const modelName = llmModel || 'Unknown Model';

  relevantSegments
    .sort((a, b) => paragraph.indexOf(a.text) - paragraph.indexOf(b.text))
    .forEach((segment, idx) => {
      const segmentPos = remainingText.indexOf(segment.text);
      if (segmentPos === -1) return;

      // Add text before the segment
      if (segmentPos > 0) {
        parts.push(<React.Fragment key={`before-${partKey}`}>{remainingText.substring(0, segmentPos)}</React.Fragment>);
        partKey++;
      }

      // Add the highlighted segment with tooltip
      const tooltipTitle = `Relevance: ${Math.round(segment.score * 100)}%\nModel: ${modelName}\nExplanation: ${segment.explanation}`;
      parts.push(
        <span
          key={`hl-${idx}`} // Use only idx as key
          id={`highlight-${idx}`} // Use only idx as ID
          className={getHighlightClass(segment.score)}
          title={tooltipTitle}
        >
          {segment.text}
        </span>
      );
      partKey++;

      remainingText = remainingText.substring(segmentPos + segment.text.length);
    });

  // Add any remaining text after the last segment
  if (remainingText) {
    parts.push(<React.Fragment key={`after-${partKey}`}>{remainingText}</React.Fragment>);
  }

  // Render paragraph with highlighted parts
  return <p key={paragraphIndex} style={{fontSize: `${fontSize}px`}} className="mb-4">{parts}</p>;
};

  // --- Handle Code Blocks Separately ---
  const processSourceContent = (content: string) => {
    if (!content) return [];
    
    // Match code blocks and split text by them
    const codeBlockRegex = /```[\s\S]*?```/g;
    const parts: { type: 'text' | 'code'; content: string }[] = [];
    
    let lastIndex = 0;
    let match;
    
    while ((match = codeBlockRegex.exec(content)) !== null) {
      // Add text before the code block
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: content.substring(lastIndex, match.index)
        });
      }
      
      // Add the code block
      parts.push({
        type: 'code',
        content: match[0]
      });
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add any remaining text after the last code block
    if (lastIndex < content.length) {
      parts.push({
        type: 'text',
        content: content.substring(lastIndex)
      });
    }
    
    return parts;
  };

  // --- Main Content Display Logic ---
  const displayContent = () => {
    const showHighlights = isHighlightMode && renderHighlights && highlightedSegments && highlightedSegments.length > 0;

    if (!sourceContent && !sourceFile) {
      return <div className="flex items-center justify-center h-full"><p className={`${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>No source content to display</p></div>;
    }

    // Handle PDF/Image
    if ((sourceType === 'pdf' || sourceType === 'image') && sourceFile) {
      return (
        <div className="space-y-5">
          {/* File Info Box */}
          <div className={`p-4 rounded-lg shadow-sm ${darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-slate-50 border border-slate-200'}`}>
            <p className={`${darkMode ? 'text-slate-300' : 'text-slate-700'} mb-1 font-medium`}>{sourceType === 'pdf' ? 'PDF Document:' : 'Image Source:'}</p>
            <p className={`font-mono text-sm break-all ${darkMode ? 'text-indigo-300' : 'text-indigo-700'}`}>{sourceFile.name}</p>
            {sourceType === 'image' && <div className="relative w-full max-h-[40vh] my-4 rounded overflow-hidden border dark:border-slate-700"><Image src={URL.createObjectURL(sourceFile)} alt="Source document image" className="object-contain" fill /></div>}
            <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'} mt-2`}>Extracted text displayed below.</p>
          </div>
          
          {/* Fix: Use special content handling for highlighted or regular view */}
          {showHighlights ? (
            <div className={`font-sans leading-relaxed ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
              {(sourceContent || '').split('\n\n').map(renderParagraphWithHighlights)}
            </div>
          ) : (
            // For normal display, use processSourceContent instead of ReactMarkdown
            <div>
              {processSourceContent(sourceContent || '').map((part, index) => (
                <React.Fragment key={index}>
                  {part.type === 'code' ? (
                    <div className="my-6">
                      <pre style={{fontSize: `${fontSize * 0.875}px`}} className={`p-4 rounded-md overflow-x-auto font-mono shadow-inner ${
                        darkMode ? 'bg-slate-800 text-slate-200 ring-1 ring-slate-700' : 'bg-slate-100 text-slate-800 ring-1 ring-slate-200'
                      }`}>
                        {part.content.replace(/^```(\w*)\n/, '').replace(/```$/, '')}
                      </pre>
                    </div>
                  ) : (
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]} 
                      components={markdownComponents}
                    >
                      {part.content}
                    </ReactMarkdown>
                  )}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
      );
    }

    // Default rendering for regular text
    if (showHighlights) {
      return (
        <div className={`font-sans leading-relaxed ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
          {(sourceContent || '').split('\n\n').map(renderParagraphWithHighlights)}
        </div>
      );
    } else {
      // Use processSourceContent for safe rendering of code blocks
      return (
        <div>
          {processSourceContent(sourceContent || '').map((part, index) => (
            <React.Fragment key={index}>
              {part.type === 'code' ? (
                <div className="my-6">
                  <pre style={{fontSize: `${fontSize * 0.875}px`}} className={`p-4 rounded-md overflow-x-auto font-mono shadow-inner ${
                    darkMode ? 'bg-slate-800 text-slate-200 ring-1 ring-slate-700' : 'bg-slate-100 text-slate-800 ring-1 ring-slate-200'
                  }`}>
                    {part.content.replace(/^```(\w*)\n/, '').replace(/```$/, '')}
                  </pre>
                </div>
              ) : (
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]} 
                  components={markdownComponents}
                >
                  {part.content}
                </ReactMarkdown>
              )}
            </React.Fragment>
          ))}
        </div>
      );
    }
  };

  return (
    <div className="relative">
      {/* Highlight mode indicator */}
      {isHighlightMode && highlightedSegments && highlightedSegments.length > 0 && renderHighlights && (
        <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 z-10 transition-all duration-300 ease-out">
          <div className="bg-yellow-100 dark:bg-yellow-800/80 border border-yellow-300 dark:border-yellow-600/80 rounded-full px-3 py-1 text-xs text-yellow-900 dark:text-yellow-100 shadow-md flex items-center space-x-1.5 backdrop-blur-sm animate-pulse-slow">
            <HighlightIndicatorIcon />
            <span>Highlighting <strong>{highlightedSegments.length}</strong> segments {highlightQuery ? <>for: <em className="font-medium">"{highlightQuery}"</em></> : ''}</span>
          </div>
        </div>
      )}

      {/* Main content container */}
      <div ref={containerRef}
        className={`overflow-y-auto border ${darkMode ? 'border-slate-700 bg-slate-900/95' : 'border-slate-200 bg-white'} rounded-md transition-colors duration-300`}
        style={{ height: `${containerHeight}px`, maxHeight: '1200px', minHeight: '200px', transition: isDragging ? 'none' : 'height 0.1s ease-out' }}>
        <div className={`p-4 md:p-6 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`} style={{ fontSize: `${fontSize}px` }}>
          {displayContent()}
        </div>
      </div>

      {/* Resizer handle */}
      <div className={`absolute bottom-0 left-0 right-0 h-5 ${darkMode ? 'bg-gradient-to-t from-slate-800/80 to-transparent' : 'bg-gradient-to-t from-slate-100/80 to-transparent'} cursor-ns-resize flex justify-center items-end transition-colors duration-300 group`}
        onMouseDown={handleMouseDown} title="Drag to resize source panel">
        <div className={`w-16 h-1.5 mb-1 ${darkMode ? 'bg-slate-600 group-hover:bg-slate-500' : 'bg-slate-300 group-hover:bg-slate-400'} rounded-full transition-colors duration-200`}></div>
      </div>

      {/* Animation styles */}
      <style jsx>{`
        @keyframes pulse-slow { 50% { opacity: .7; } }
        .animate-pulse-slow { animation: pulse-slow 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
      `}</style>
    </div>
  );
}