// components/analysis/SourceDisplay.tsx
// Enhanced document viewer with improved typography, responsive design, and accessibility
// Handles both regular text and highlighted segments with smooth transitions and better readability

'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useAppStore, HighlightedSegment } from '@/lib/store';
import Image from 'next/image';
import ReactMarkdown, { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';

// --- Icon Components ---
const HighlightIndicatorIcon = () => (
  <svg className="w-4 h-4 text-amber-600 dark:text-amber-400" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
  </svg>
);



interface SourceDisplayProps {
  darkMode?: boolean;
  toggleDarkMode?: () => void;
  renderHighlights?: boolean;
  fontSize?: number;
  onFontSizeChange?: (size: number) => void;
}

export default function SourceDisplay({ 
  darkMode = false, 
  toggleDarkMode, 
  renderHighlights = true, 
  fontSize = 16,
  onFontSizeChange
}: SourceDisplayProps) {
  const {
    sourceContent, 
    sourceType, 
    sourceFile, 
    highlightedSegments,
    isHighlightMode, 
    highlightQuery, 
    llmModel
  } = useAppStore();

  const [containerHeight, setContainerHeight] = useState(780);
  const [isDragging, setIsDragging] = useState(false);
  const [localFontSize, setLocalFontSize] = useState(fontSize);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef<number>(0);
  const startHeightRef = useRef<number>(0);

  // Update local font size when prop changes
  useEffect(() => {
    setLocalFontSize(fontSize);
  }, [fontSize]);

  // Handle font size changes internally if no external handler
  const handleFontSizeChange = (newSize: number) => {
    setLocalFontSize(newSize);
    if (onFontSizeChange) {
      onFontSizeChange(newSize);
    }
  };

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
    const newHeight = Math.max(300, Math.min(1200, startHeightRef.current + deltaY)); 
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
    const base = "rounded px-1.5 mx-0.5 py-0.5 cursor-help transition-colors duration-150 relative group";
    if (darkMode) {
      if (score < 0.2) return `${base} bg-blue-800/60 hover:bg-blue-700/80`;
      if (score < 0.4) return `${base} bg-emerald-800/60 hover:bg-emerald-700/80`;
      if (score < 0.6) return `${base} bg-yellow-800/60 hover:bg-yellow-700/80`;
      if (score < 0.8) return `${base} bg-orange-800/60 hover:bg-orange-700/80`;
      return `${base} bg-red-800/60 hover:bg-red-700/80`;
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
    h1: ({node, ...props}) => <h1 style={{fontSize: `${localFontSize * 1.5}px`}} className="font-bold font-serif mt-8 mb-4 border-b pb-2 dark:border-slate-700 border-slate-300" {...props} />,
    h2: ({node, ...props}) => <h2 style={{fontSize: `${localFontSize * 1.3}px`}} className="font-semibold font-serif mt-7 mb-3 border-b pb-1 dark:border-slate-700 border-slate-300" {...props} />,
    h3: ({node, ...props}) => <h3 style={{fontSize: `${localFontSize * 1.15}px`}} className="font-semibold font-serif mt-6 mb-3" {...props} />,
    h4: ({node, ...props}) => <h4 style={{fontSize: `${localFontSize * 1.05}px`}} className="font-semibold font-serif mt-5 mb-2" {...props} />,
    p: ({node, ...props}) => <p style={{fontSize: `${localFontSize}px`}} className="mb-5 font-serif leading-relaxed md:leading-loose" {...props} />,
    ul: ({node, ...props}) => <ul style={{fontSize: `${localFontSize}px`}} className="list-disc pl-6 mb-5 space-y-2 font-serif" {...props} />,
    ol: ({node, ...props}) => <ol style={{fontSize: `${localFontSize}px`}} className="list-decimal pl-6 mb-5 space-y-2 font-serif" {...props} />,
    li: ({node, ...props}) => <li style={{fontSize: `${localFontSize}px`}} className="mb-1.5 font-serif leading-relaxed" {...props} />,
    blockquote: ({node, ...props}) => (
      <blockquote 
        style={{fontSize: `${localFontSize}px`}} 
        className="border-l-4 pl-5 py-2 my-5 italic font-serif dark:border-indigo-500 border-indigo-300 dark:bg-indigo-900/20 bg-indigo-50/50 dark:text-indigo-200 text-indigo-800 rounded-r" 
        {...props} 
      />
    ),
    
    // Fix: Use the any type for the inline prop
    code: ({ className, children, ...props }: any) => {
      const match = /language-(\w+)/.exec(className || '');
      
      // Only apply inline styling for inline code (not blocks)
      if (props.inline) {
        return (
          <code 
            style={{fontSize: `${localFontSize * 0.9}px`}} 
            className="px-1.5 py-0.5 rounded font-mono bg-slate-200 text-purple-700 dark:bg-slate-700 dark:text-amber-300" 
            {...props}
          >
            {children}
          </code>
        );
      }
      
      // We don't render code blocks here - they'll be handled by pre
      return <code className={className} {...props}>{children}</code>;
    },
    
    // Handle code blocks at the pre level to avoid nesting issues
    pre: ({node, children, ...props}) => (
      <div className="my-6 relative group">
        <pre 
          style={{fontSize: `${localFontSize * 0.9}px`}} 
          className={`p-4 rounded-md overflow-x-auto font-mono shadow-inner ${
            darkMode ? 'bg-slate-800 text-slate-200 ring-1 ring-slate-700' : 'bg-slate-100 text-slate-800 ring-1 ring-slate-200'
          }`}
          {...props}
        >
          {children}
        </pre>
      </div>
    ),
    
    table: ({node, ...props}) => (
      <div className={`overflow-x-auto my-5 border rounded-lg shadow-sm ${darkMode ? 'border-slate-700' : 'border-slate-300'}`}>
        <table style={{fontSize: `${localFontSize}px`}} className="min-w-full divide-y dark:divide-slate-700 divide-slate-300" {...props} />
      </div>
    ),
    thead: ({node, ...props}) => <thead className={darkMode ? 'bg-slate-800' : 'bg-slate-100'} {...props} />,
    tbody: ({node, ...props}) => <tbody className={`divide-y ${darkMode ? 'divide-slate-700' : 'divide-slate-200'}`} {...props} />,
    tr: ({node, ...props}) => <tr className={`transition-colors ${darkMode ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}`} {...props} />,
    th: ({node, ...props}) => (
      <th 
        style={{fontSize: `${localFontSize * 0.8}px`}} 
        className="px-4 py-2.5 text-left font-semibold uppercase tracking-wider font-sans dark:text-slate-400 text-slate-500" 
        {...props} 
      />
    ),
    td: ({node, ...props}) => <td style={{fontSize: `${localFontSize * 0.9}px`}} className="px-4 py-2 font-serif" {...props} />,
    a: ({node, ...props}) => (
      <a 
        style={{fontSize: `${localFontSize}px`}} 
        className="text-indigo-600 dark:text-indigo-400 hover:underline decoration-dotted" 
        target="_blank" 
        rel="noopener noreferrer" 
        {...props} 
      />
    ),
    hr: ({node, ...props}) => <hr className={`my-8 border-dashed ${darkMode ? 'border-slate-700' : 'border-slate-300'}`} {...props} />,
  }), [darkMode, localFontSize]);

  // --- Highlight Rendering Logic ---
  const renderParagraphWithHighlights = (paragraph: string, paragraphIndex: number) => {
    // Skip if paragraph looks like a code block to prevent rendering issues
    if (paragraph.trim().startsWith('```')) {
      return (
        <div key={paragraphIndex} className="mb-4">
          <pre 
            style={{fontSize: `${localFontSize * 0.9}px`}} 
            className={`p-4 rounded-md overflow-x-auto font-mono shadow-inner ${
              darkMode ? 'bg-slate-800 text-slate-200 ring-1 ring-slate-700' : 'bg-slate-100 text-slate-800 ring-1 ring-slate-200'
            }`}
          >
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
      return <p key={paragraphIndex} style={{fontSize: `${localFontSize}px`}} className="mb-4 font-serif">{paragraph}</p>;
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
            key={`hl-${idx}`}
            id={`highlight-${segment.id || idx}`} // Use segment.id if available
            className={getHighlightClass(segment.score)}
            title={tooltipTitle}
          >
            <span className="z-10 relative">{segment.text}</span>
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-current opacity-20"></span>
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
    return (
      <p key={paragraphIndex} style={{fontSize: `${localFontSize}px`}} className="mb-4 font-serif leading-relaxed">
        {parts}
      </p>
    );
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
      return (
        <div className="flex flex-col items-center justify-center h-full p-8">
          <svg className="w-16 h-16 text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className={`${darkMode ? 'text-slate-400' : 'text-slate-500'} text-center`}>
            No source content to display.
            <br />
            <span className="text-sm opacity-75">Upload a document or enter text to analyze.</span>
          </p>
        </div>
      );
    }

    // Handle PDF/Image
    if ((sourceType === 'pdf' || sourceType === 'image') && sourceFile) {
      return (
        <div className="space-y-4">
          {/* File Info Box */}
          <div className={`rounded-lg ${darkMode ? 'bg-slate-800/80 border border-slate-700' : 'bg-slate-50/90 border border-slate-200'} backdrop-blur-sm`}>
            <div className="flex items-center gap-2 p-3 border-b dark:border-slate-700 border-slate-200">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={
                  sourceType === 'pdf' 
                    ? "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    : "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                } />
              </svg>
              <div className="flex-1 min-w-0">
                <p className={`${darkMode ? 'text-slate-300' : 'text-slate-700'} font-medium truncate`}>
                  {sourceFile.name}
                </p>
                <p className="text-xs text-slate-500">
                  {sourceType === 'pdf' ? 'PDF Document' : 'Image with extracted text'}
                </p>
              </div>
            </div>
            
            {sourceType === 'image' && (
              <div className="p-4 bg-slate-900/20 rounded-b-lg">
                <div className="relative aspect-video max-h-[50vh] rounded overflow-hidden ring-1 ring-white/10">
                  <Image 
                    src={URL.createObjectURL(sourceFile)} 
                    alt="Source document image" 
                    className="object-contain" 
                    fill 
                    sizes="(max-width: 768px) 100vw, 80vw"
                    priority
                  />
                </div>
              </div>
            )}
          </div>
          
          {/* Content based on highlighting mode */}
          <div className={`pb-4 ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
            {showHighlights ? (
              <div className="font-serif leading-relaxed">
                {(sourceContent || '').split('\n\n').map(renderParagraphWithHighlights)}
              </div>
            ) : (
              <div>
                {processSourceContent(sourceContent || '').map((part, index) => (
                  <React.Fragment key={index}>
                    {part.type === 'code' ? (
                      <div className="my-6">
                        <pre 
                          style={{fontSize: `${localFontSize * 0.9}px`}} 
                          className={`p-4 rounded-md overflow-x-auto font-mono shadow-inner ${
                            darkMode ? 'bg-slate-800 text-slate-200 ring-1 ring-slate-700' : 'bg-slate-100 text-slate-800 ring-1 ring-slate-200'
                          }`}
                        >
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
        </div>
      );
    }

    // Default rendering for regular text
    return (
      <div className="pb-4">
        {showHighlights ? (
          <div className={`font-serif leading-relaxed ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
            {(sourceContent || '').split('\n\n').map(renderParagraphWithHighlights)}
          </div>
        ) : (
          <div>
            {processSourceContent(sourceContent || '').map((part, index) => (
              <React.Fragment key={index}>
                {part.type === 'code' ? (
                  <div className="my-6">
                    <pre 
                      style={{fontSize: `${localFontSize * 0.9}px`}} 
                      className={`p-4 rounded-md overflow-x-auto font-mono shadow-inner ${
                        darkMode ? 'bg-slate-800 text-slate-200 ring-1 ring-slate-700' : 'bg-slate-100 text-slate-800 ring-1 ring-slate-200'
                      }`}
                    >
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
  };

  return (
    <div className="relative">
      

      {/* Highlight mode indicator */}
      {isHighlightMode && highlightedSegments && highlightedSegments.length > 0 && renderHighlights && (
        <div className="absolute -top-15 left-1/2 transform -translate-x-1/2 z-10 transition-all duration-300 ease-out">
          <div className="bg-yellow-100/20 border border-yellow-200 rounded-full px-2 py-1.5 text-xs text-yellow-800 shadow-md flex items-center space-x-1.5 backdrop-blur-sm">
            <HighlightIndicatorIcon />
            <span>
              Highlighting {highlightedSegments.length} segments
              {highlightQuery ? <>: <em className="font-medium">"{highlightQuery}"</em></> : ''}
            </span>
          </div>
        </div>
      )}

      {/* Main content container */}
      <div 
        ref={containerRef}
        className={`overflow-y-auto border ${
          darkMode 
            ? 'border-slate-700 bg-slate-900/95 text-slate-200' 
            : 'border-slate-300 bg-white text-slate-800'
        } shadow-md rounded-lg transition-colors duration-300`}
        style={{ 
          height: `${containerHeight}px`, 
          maxHeight: '1200px', 
          minHeight: '300px', 
          transition: isDragging ? 'none' : 'height 0.1s ease-out'
        }}
      >
        <div className="p-4 md:p-6" style={{ fontSize: `${localFontSize}px` }}>
          {displayContent()}
        </div>
      </div>

      {/* Resizer handle */}
      <div 
        className={`absolute bottom-0 left-0 right-0 h-6 ${
          darkMode 
            ? 'bg-gradient-to-t from-slate-800/90 to-transparent' 
            : 'bg-gradient-to-t from-slate-100/90 to-transparent'
        } cursor-ns-resize flex justify-center items-end transition-colors duration-300 group rounded-b-lg`}
        onMouseDown={handleMouseDown} 
        title="Drag to resize source panel"
      >
        <div className={`w-16 h-1.5 mb-1.5 ${
          darkMode 
            ? 'bg-slate-600 group-hover:bg-slate-500' 
            : 'bg-slate-300 group-hover:bg-slate-400'
        } rounded-full transition-colors duration-200`}>
        </div>
      </div>

      {/* Animation styles */}
      <style jsx>{`
        @keyframes pulse-slow { 50% { opacity: .7; } }
        .animate-pulse-slow { animation: pulse-slow 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
      `}</style>
    </div>
  );
}