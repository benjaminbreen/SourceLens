// components/translate/ExpandedTranslationView.tsx
// Modal for side-by-side translation view with accurate line numbering and margin annotations
// Displays original and translated text in synchronized sections with expandable content

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '@/lib/store';

interface ExpandedTranslationViewProps {
  isOpen: boolean;
  onClose: () => void;
  translatedText: string;
  originalText: string;
  targetLanguage: string;
  isDarkMode: boolean; 
}

interface TextSection {
  id: string;
  title: string;
  content: string;
  summary: string;
  expanded: boolean;
  startLine: number; // Track starting line number for continuous counting
}

interface Annotation {
  text: string;
  lineIndex: number;
}

export default function ExpandedTranslationView({
  isOpen,
  onClose,
  translatedText,
  originalText,
  targetLanguage
}: ExpandedTranslationViewProps) {
  const [translationSections, setTranslationSections] = useState<TextSection[]>([]);
  const [originalSections, setOriginalSections] = useState<TextSection[]>([]);
  const [isChunking, setIsChunking] = useState(false);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const { llmModel, metadata, translationOptions } = useAppStore();
  
  // Refs for scrolling synchronization
  const originalRef = useRef<HTMLDivElement>(null);
  const translationRef = useRef<HTMLDivElement>(null);

  // Process texts into sections when component mounts or text changes
  useEffect(() => {
    if (!isOpen) return;

    // Extract annotations from translated text
    const extractAnnotations = (text: string): [string, Annotation[]] => {
      if (!text) return ["", []];
      
      const annotations: Annotation[] = [];
      const lines = text.split('\n');
      
      // Process each line for annotations
      const processedLines = lines.map((line, lineIndex) => {
        // Find all annotations in square brackets
        const regex = /\[(.*?)\]/g;
        let match;
        let processedLine = line;
        
        while ((match = regex.exec(line)) !== null) {
          annotations.push({
            text: match[1],
            lineIndex
          });
          
          // Remove the annotation from the line for clean display
          processedLine = processedLine.replace(match[0], '');
        }
        
        return processedLine;
      });
      
      return [processedLines.join('\n'), annotations];
    };
    
    // Only extract annotations if explanations are enabled
    if (translationOptions.explanationLevel !== 'minimal') {
      const [cleanedText, extractedAnnotations] = extractAnnotations(translatedText);
      setAnnotations(extractedAnnotations);
    }

    // For shorter texts, use a simpler structure
    if (originalText.length < 5000) {
      setOriginalSections([{
        id: '1',
        title: 'Original',
        content: originalText,
        summary: 'Complete original text',
        expanded: true,
        startLine: 1
      }]);
      
      setTranslationSections([{
        id: '1',
        title: 'Translation',
        content: translatedText,
        summary: 'Complete translation',
        expanded: true,
        startLine: 1
      }]);
      
      return;
    }
    
    // For longer texts, chunk the content
    handleChunkContent();
  }, [isOpen, originalText, translatedText, translationOptions.explanationLevel]);

  // Function to fetch chunked content from the API
  const handleChunkContent = async () => {
    if (originalText.length < 5000) return;
    
    setIsChunking(true);
    try {
      const response = await fetch('/api/chunk-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalText,
          translatedText,
          modelId: llmModel
        }),
      });

      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
      }

      const data = await response.json();
      
      // Process sections and add startLine property for continuous line numbering
      let translationLineCount = 1;
      let originalLineCount = 1;
      
      const processedOriginalSections = data.originalSections.map((section: any, index: number) => {
        const startLine = originalLineCount;
        const lineCount = (section.content.match(/\n/g) || []).length + 1;
        originalLineCount += lineCount;
        
        return {
          ...section,
          expanded: false, // Start collapsed
          startLine
        };
      });
      
      const processedTranslationSections = data.translationSections.map((section: any, index: number) => {
        const startLine = translationLineCount;
        const lineCount = (section.content.match(/\n/g) || []).length + 1;
        translationLineCount += lineCount;
        
        return {
          ...section,
          expanded: false, // Start collapsed
          startLine
        };
      });
      
      setOriginalSections(processedOriginalSections);
      setTranslationSections(processedTranslationSections);
    } catch (error) {
      console.error("Text chunking error:", error);
      // Fallback to basic sections
      setOriginalSections([{
        id: '1',
        title: 'Original',
        content: originalText,
        summary: 'Complete original text',
        expanded: true,
        startLine: 1
      }]);
      
      setTranslationSections([{
        id: '1',
        title: 'Translation',
        content: translatedText,
        summary: 'Complete translation',
        expanded: true,
        startLine: 1
      }]);
    } finally {
      setIsChunking(false);
    }
  };

  // Toggle section expansion for both translation and original simultaneously
  const toggleSection = (id: string) => {
    setTranslationSections(prev => 
      prev.map(section => 
        section.id === id 
          ? { ...section, expanded: !section.expanded } 
          : section
      )
    );
    
    setOriginalSections(prev => 
      prev.map(section => 
        section.id === id 
          ? { ...section, expanded: !section.expanded } 
          : section
      )
    );
  };

  // Generate proper line numbers based on content
  const renderLineNumbers = (content: string, startLine: number) => {
    if (!content) return [];

    const lines = content.split('\n');
    const numbers = [];
    
    // Create a line number for every 10th line
    for (let i = 0; i < lines.length; i += 10) {
      const lineNumber = startLine + i;
      numbers.push(
        <div 
          key={lineNumber} 
          className="text-right pr-2 text-slate-400 text-xs font-mono"
          style={{ 
            position: 'absolute', 
            left: 0, 
            top: `${i * 1.5}rem` // Position line numbers at proper height (1.5rem per line)
          }}
        >
          {lineNumber}
        </div>
      );
    }
    
    return numbers;
  };
  
  // Render annotations for specific lines
  const renderAnnotations = (content: string, startLine: number) => {
    if (!content || annotations.length === 0) return [];
    
    const lines = content.split('\n');
    const relevantAnnotations = annotations.filter(
      ann => ann.lineIndex >= startLine && ann.lineIndex < startLine + lines.length
    );
    
    return relevantAnnotations.map((annotation, index) => {
      const linePosition = (annotation.lineIndex - startLine) * 1.5; // 1.5rem per line
      
      return (
        <div 
          key={`ann-${index}`}
          className="absolute left-2 text-red-600 text-xs font-medium max-w-[10rem] bg-red-50 p-1 rounded border border-red-200 shadow-sm"
          style={{ 
            top: `${linePosition}rem`,
            transform: 'translateX(-100%)',
            marginLeft: '-0.5rem'
          }}
        >
          {annotation.text}
        </div>
      );
    });
  };
  
  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden'; // Prevent scrolling
    }
    
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = ''; // Re-enable scrolling
    };
  }, [isOpen, onClose]);

  // Sync scrolling between original and translation panels
  useEffect(() => {
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLElement;
      
      if (target === originalRef.current && translationRef.current) {
        translationRef.current.scrollTop = target.scrollTop;
      } else if (target === translationRef.current && originalRef.current) {
        originalRef.current.scrollTop = target.scrollTop;
      }
    };
    
    if (originalRef.current) {
      originalRef.current.addEventListener('scroll', handleScroll);
    }
    
    if (translationRef.current) {
      translationRef.current.addEventListener('scroll', handleScroll);
    }
    
    return () => {
      originalRef.current?.removeEventListener('scroll', handleScroll);
      translationRef.current?.removeEventListener('scroll', handleScroll);
    };
  }, [translationSections, originalSections]);
  
  // Exit if not open
  if (!isOpen) return null;

  // Function to format paragraphs with preserved line breaks
  const renderParagraphs = (text: string) => {
    if (!text) return null;
    
    return text.split('\n').map((line, idx) => (
      <div key={idx} className="leading-6 min-h-6 mb-0" style={{ lineHeight: '1.5rem' }}>
        {line.trim() === '' ? '\u00A0' : line}
      </div>
    ));
  };

  // Determine explanation level badge text
  const getExplanationLevelBadge = () => {
    switch (translationOptions.explanationLevel) {
      case 'minimal': return null;
      case 'moderate': return (
        <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-800 rounded-full">
          Brief explanations
        </span>
      );
      case 'extensive': return (
        <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded-full">
          Detailed explanations
        </span>
      );
      default: return null;
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm overflow-y-auto"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="min-h-screen flex items-center justify-center p-4">
        <div 
          className="bg-white rounded-xl shadow-2xl w-full max-w-8xl max-h-[90vh] flex flex-col overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b border-slate-200 bg-slate-50">
            <h2 className="text-xl font-semibold text-slate-800 flex items-center">
              <svg className="w-5 h-5 mr-2 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M9.5 14.5a18.022 18.022 0 01-1.5-5" />
              </svg>
              Translation View - {metadata?.title || 'Document'} 
              <span className="ml-2 text-sm font-normal text-slate-600">
                {metadata?.author ? `by ${metadata.author}` : ''}
              </span>
              {getExplanationLevelBadge()}
            </h2>
            
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-slate-700 p-1"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-auto p-0">
            {isChunking ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="w-10 h-10 border-4 border-cyan-200 border-t-cyan-600 rounded-full animate-spin mb-4 mx-auto"></div>
                  <p className="text-slate-600">Processing document sections...</p>
                </div>
              </div>
            ) : (
              <div className="flex h-full">
                {/* Translation Column */}
                <div className="w-1/2 border-r border-slate-200 overflow-hidden">
                  <div className="sticky top-0 bg-cyan-50 p-3 border-b border-cyan-100 z-10">
                    <h3 className="font-bold text-cyan-800">Translation</h3>
                  </div>
                  
                  <div className="p-0 overflow-y-auto max-h-[calc(90vh-8rem)]" ref={translationRef}>
                    {translationSections.map((section) => (
                      <div key={section.id} className="mb-0">
                        <button
                          onClick={() => toggleSection(section.id)}
                          className="w-full flex items-center justify-between bg-cyan-50 p-2 sticky top-0 z-10 hover:bg-cyan-100 transition-colors"
                        >
                          <span className="font-medium text-cyan-800">{section.title}</span>
                          <svg 
                            className={`w-5 h-5 text-cyan-500 transition-transform ${section.expanded ? 'transform rotate-180' : ''}`} 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        
                        {!section.expanded && (
                          <div className="text-sm text-slate-600 italic pl-2 p-2 border-b border-slate-100">
                            {section.summary}
                          </div>
                        )}
                        
                        {section.expanded && (
                          <div className="pl-16 relative p-4">
                            {/* Line numbers with continuous counting */}
                            <div className="absolute left-4 top-4 bottom-0 w-12">
                              {renderLineNumbers(section.content, section.startLine)}
                            </div>
                            
                            {/* Margin annotations */}
                            <div className="absolute left-0 top-4 bottom-0">
                              {annotations.length > 0 && translationOptions.explanationLevel !== 'minimal' && 
                                renderAnnotations(section.content, section.startLine)}
                            </div>
                            
                            {/* Section content */}
                            <div className="font-['Lora',serif] text-slate-800 relative">
                              {renderParagraphs(section.content)}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Original Text Column */}
                <div className="w-1/2 overflow-hidden">
                  <div className="sticky top-0 bg-slate-50 p-3 border-b border-slate-200 z-10">
                    <h3 className="font-bold text-slate-700">Original Source</h3>
                  </div>
                  
                  <div className="p-0 overflow-y-auto max-h-[calc(90vh-8rem)]" ref={originalRef}>
                    {originalSections.map((section) => (
                      <div key={section.id} className="mb-0">
                        <button
                          onClick={() => toggleSection(section.id)}
                          className="w-full flex items-center justify-between bg-slate-50 p-2 sticky top-0 z-10 hover:bg-slate-100 transition-colors"
                        >
                          <span className="font-medium text-slate-700">{section.title}</span>
                          <svg 
                            className={`w-5 h-5 text-slate-500 transition-transform ${section.expanded ? 'transform rotate-180' : ''}`} 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        
                        {!section.expanded && (
                          <div className="text-sm text-slate-500 italic pl-2 p-2 border-b border-slate-100">
                            {section.summary}
                          </div>
                        )}
                        
                        {section.expanded && (
                          <div className="pl-16 relative p-4">
                            {/* Line numbers with continuous counting */}
                            <div className="absolute left-4 top-4 bottom-0 w-12">
                              {renderLineNumbers(section.content, section.startLine)}
                            </div>
                            
                            {/* Section content */}
                            <div className="font-sans text-sm text-slate-700 relative">
                              {renderParagraphs(section.content)}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="p-3 border-t border-slate-200 bg-slate-50 flex justify-between items-center">
            <div className="text-xs text-slate-500">
              {originalText.length.toLocaleString()} characters • Translated to {
                SUPPORTED_LANGUAGES.find(lang => lang.code === targetLanguage)?.name || 'Unknown language'
              }
              {annotations.length > 0 && translationOptions.explanationLevel !== 'minimal' && 
                ` • ${annotations.length} explanatory notes`}
            </div>
            
            <button
              onClick={onClose}
              className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 transition-colors text-sm font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Language helper constant
const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ru', name: 'Russian' },
  { code: 'ar', name: 'Arabic' }
];