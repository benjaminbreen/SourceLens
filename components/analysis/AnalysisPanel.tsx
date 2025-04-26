// components/analysis/AnalysisPanel.tsx
// Optimized Analysis panel component for better performance with large documents
// Uses virtualized rendering, memoization, and lazy loading to improve efficiency

'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import CounterNarrative from './CounterNarrative';
import SaveToLibraryButton from '../library/SaveToLibraryButton';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import HighlightPanel from '../highlight/HighlightPanel';
import HighlightExplanation from '../highlight/HighlightExplanation';

// Citation link styling - extracted to reduce re-renders
const citationLinkStyle = `
  .citation-link {
    color: var(--citation-link-color, #4F46E5);
    text-decoration: none;
    border-bottom: 1px dotted var(--citation-link-color, #4F46E5);
    transition: all 0.2s;
  }
  .citation-link:hover {
    background-color: var(--citation-link-hover-bg, rgba(79, 70, 229, 0.1));
    border-bottom: 1px solid var(--citation-link-color, #4F46E5);
  }
  :target {
    scroll-margin-top: 1rem;
    animation: highlight 2s ease-out;
  }
  @keyframes highlight {
    0% { background-color: var(--highlight-animation-color, rgba(79, 70, 229, 0.2)); }
    100% { background-color: transparent; }
  }

  .dark .citation-link {
    --citation-link-color: #818CF8;
    --citation-link-hover-bg: rgba(129, 140, 248, 0.2);
    --highlight-animation-color: rgba(129, 140, 248, 0.3);
  }
`;

interface AnalysisPanelProps {
  darkMode?: boolean;
}

// Interface for parsed references
interface Reference {
  id: number;
  text: string;
  inLibrary: boolean;
  url?: string;
}

export default function AnalysisPanel({ darkMode = false }: AnalysisPanelProps) {
  const {
    initialAnalysis,
    detailedAnalysis,
    counterNarrative,
    activePanel,
    isLoading,
    addMessage,
    perspective,
    sourceType,
    llmModel,
    metadata,
    setLoading,
    setRawPrompt,
    setRawResponse,
    sourceContent
  } = useAppStore();

  // Component state
  const [selectedQuestion, setSelectedQuestion] = useState<number | null>(null);
  const [references, setReferences] = useState<Reference[]>([]);
  const [citationMap, setCitationMap] = useState<Record<string, number>>({});
  const [visibleSections, setVisibleSections] = useState<string[]>(['context']);
  
  const analysisPanelRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  // Memoized section styles to prevent recalculations on every render
  const sectionStyles = useMemo(() => ({
    context: {
      color: darkMode ? 'text-purple-300' : 'text-purple-900',
      bg: darkMode ? 'bg-purple-950/30' : 'bg-purple-50/50',
      iconColor: darkMode ? 'text-purple-300' : 'text-purple-600',
      borderColor: darkMode ? 'border-purple-800' : 'border-purple-200',
      hoverColor: darkMode ? 'hover:text-purple-300' : 'hover:text-purple-600'
    },
    author: {
      color: darkMode ? 'text-pink-300' : 'text-pink-900',
      bg: darkMode ? 'bg-pink-950/30' : 'bg-pink-50/50',
      iconColor: darkMode ? 'text-pink-300' : 'text-pink-600',
      borderColor: darkMode ? 'border-pink-800' : 'border-pink-200',
      hoverColor: darkMode ? 'hover:text-pink-300' : 'hover:text-pink-600'
    },
    themes: {
      color: darkMode ? 'text-sky-300' : 'text-sky-900',
      bg: darkMode ? 'bg-sky-950/30' : 'bg-sky-50/50',
      iconColor: darkMode ? 'text-sky-300' : 'text-sky-600',
      borderColor: darkMode ? 'border-sky-800' : 'border-sky-200',
      hoverColor: darkMode ? 'hover:text-sky-300' : 'hover:text-sky-600'
    },
    evidence: {
      color: darkMode ? 'text-teal-300' : 'text-teal-900',
      bg: darkMode ? 'bg-teal-950/30' : 'bg-teal-50/50',
      iconColor: darkMode ? 'text-teal-300' : 'text-teal-600',
      borderColor: darkMode ? 'border-teal-800' : 'border-teal-200',
      hoverColor: darkMode ? 'hover:text-teal-300' : 'hover:text-teal-600'
    },
    significance: {
      color: darkMode ? 'text-indigo-300' : 'text-indigo-900',
      bg: darkMode ? 'bg-indigo-950/30' : 'bg-indigo-50/50',
      iconColor: darkMode ? 'text-indigo-300' : 'text-indigo-600',
      borderColor: darkMode ? 'border-indigo-800' : 'border-indigo-200',
      hoverColor: darkMode ? 'hover:text-indigo-300' : 'hover:text-indigo-600'
    },
    references: {
      color: darkMode ? 'text-blue-300' : 'text-blue-900',
      bg: darkMode ? 'bg-blue-950/30' : 'bg-blue-100',
      iconColor: darkMode ? 'text-blue-300' : 'text-blue-700',
      borderColor: darkMode ? 'border-blue-800' : 'border-blue-300',
      hoverColor: darkMode ? 'hover:text-blue-300' : 'hover:text-blue-700'
    }
  }), [darkMode]);

  // Memoized navigation icons to prevent recalculations
  const fastTravelIcons = useMemo(() => [
    { key: 'context', label: 'Context', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, targetId: 'analysis-context' },
    { key: 'author', label: 'Author Perspective', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>, targetId: 'analysis-author' },
    { key: 'themes', label: 'Key Themes', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>, targetId: 'analysis-themes' },
    { key: 'evidence', label: 'Evidence & Rhetoric', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>, targetId: 'analysis-evidence' },
    { key: 'significance', label: 'Significance', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>, targetId: 'analysis-significance' },
    { key: 'references', label: 'References', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>, targetId: 'analysis-references' }
  ], []);

  // Optimized implementation of parsing detailed analysis
  // Uses RegExp.exec instead of match for better performance
  const parseParsedSections = (detailedAnalysis: string) => {
    if (!detailedAnalysis) return {
      context: '',
      author: '',
      themes: '',
      evidence: '',
      significance: '',
      references: ''
    };
    
    // Cache the detailed analysis
    const content = detailedAnalysis.trim();
    
    // Define regex patterns - compiled only once
    const patterns = {
      context: /(?:###CONTEXT:|1\.\s*###CONTEXT:|1\.\s*CONTEXT:)([\s\S]*?)(?=###PERSPECTIVE|2\.|$)/i,
      author: /(?:###PERSPECTIVE:|2\.\s*###PERSPECTIVE:|2\.\s*PERSPECTIVE:)([\s\S]*?)(?=###THEMES|3\.|$)/i,
      themes: /(?:###THEMES:|3\.\s*###KEY THEMES:|3\.\s*THEMES:)([\s\S]*?)(?=###EVIDENCE|4\.|$)/i,
      evidence: /(?:###EVIDENCE:|4\.\s*###EVIDENCE:|4\.\s*EVIDENCE:)([\s\S]*?)(?=###SIGNIFICANCE|5\.|$)/i,
      significance: /(?:###SIGNIFICANCE:|5\.\s*###SIGNIFICANCE:|5\.\s*SIGNIFICANCE:)([\s\S]*?)(?=###REFERENCES|6\.|$)/i,
      references: /(?:###REFERENCES:|6\.\s*###REFERENCES:|6\.\s*REFERENCES:)([\s\S]*?)(?=$)/i
    };
    
    // Extract sections with fallbacks
    const sections = {
      context: '',
      author: '',
      themes: '',
      evidence: '',
      significance: '',
      references: ''
    };
    
    // Process each section
    Object.entries(patterns).forEach(([key, pattern]) => {
      const match = pattern.exec(content);
      sections[key as keyof typeof sections] = match?.[1]?.trim() || '';
    });
    
    // If any sections are empty, try alternate patterns
    if (!sections.context) {
      const altMatch = /(?:### 1\. CONTEXT|### CONTEXT)([\s\S]*?)(?=### 2\.|### AUTHOR|$)/i.exec(content);
      sections.context = altMatch?.[1]?.trim() || 'Context analysis not available.';
    }
    
    if (!sections.author) {
      const altMatch = /(?:### 2\. PERSPECTIVE|###PERSPECTIVE)([\s\S]*?)(?=### 3\.|### KEY|$)/i.exec(content);
      sections.author = altMatch?.[1]?.trim() || 'Author perspective analysis not available.';
    }
    
    if (!sections.themes) {
      const altMatch = /(?:### 3\. KEY|### KEY THEMES)([\s\S]*?)(?=### 4\.|### EVIDENCE|$)/i.exec(content);
      sections.themes = altMatch?.[1]?.trim() || 'Theme analysis not available.';
    }
    
    if (!sections.evidence) {
      const altMatch = /(?:### 4\. EVIDENCE|### EVIDENCE)([\s\S]*?)(?=### 5\.|### SIGNIFICANCE|$)/i.exec(content);
      sections.evidence = altMatch?.[1]?.trim() || 'Evidence and rhetoric analysis not available.';
    }
    
    if (!sections.significance) {
      const altMatch = /(?:### 5\. SIGNIFICANCE|### SIGNIFICANCE)([\s\S]*?)(?=### 6\.|### REFERENCES|$)/i.exec(content);
      sections.significance = altMatch?.[1]?.trim() || 'Significance analysis not available.';
    }
    
    if (!sections.references) {
      const altMatch = /(?:### 6\. REFERENCES|### REFERENCES)([\s\S]*?)(?=$)/i.exec(content);
      sections.references = altMatch?.[1]?.trim() || '';
    }
    
    // Cleanup section headings
    const cleanupPatterns = [
      /^(CONTEXT|AUTHOR PERSPECTIVE|KEY THEMES|EVIDENCE & RHETORIC|SIGNIFICANCE|REFERENCES):\s*/i,
      /^(PERSPECTIVE|THEMES|RHETORIC|REFERENCES):\s*/i
    ];
    
    Object.keys(sections).forEach(key => {
      let section = sections[key as keyof typeof sections];
      
      cleanupPatterns.forEach(pattern => {
        section = section.replace(pattern, '');
      });
      
      sections[key as keyof typeof sections] = section.trim();
    });
    
    return sections;
  };

  // Memoize parsed sections to avoid recalculation on every render
  const parsedSections = useMemo(() => {
    return parseParsedSections(detailedAnalysis || '');
  }, [detailedAnalysis]);

  // Parse references from text - optimized version
  const parseReferences = (referencesText: string): Reference[] => {
    if (!referencesText) return [];

    // Use a more efficient approach with split + map + filter
    const segments = referencesText.split(/\n+|-\s+|^\d+\.\s+/m);
    
    return segments
      .map(segment => segment.trim())
      .filter(line => line.length > 0 && /[A-Za-z]/.test(line))
      .map((text, index) => ({
        id: index,
        text,
        inLibrary: false
      }));
  };
  
  // Build citation map - memoized to prevent recalculations
  const buildCitationMap = (refs: Reference[]): Record<string, number> => {
    const map: Record<string, number> = {};
    
    refs.forEach(ref => {
      // Extract author last name using different patterns
      let authorLastName = '';
      
      // Try standard Chicago style first
      const standardMatch = /^([^,.]+)/.exec(ref.text);
      if (standardMatch) {
        authorLastName = standardMatch[1].trim();
      }
      
      // Also try MLA style: "Last, First. Title..."
      if (!authorLastName) {
        const mlaMatch = /^([^,]+),\s*[^.]+\./.exec(ref.text);
        if (mlaMatch) {
          authorLastName = mlaMatch[1].trim();
        }
      }
      
      // Also try "First Last. Title..." format
      if (!authorLastName) {
        const firstLastMatch = /^([A-Z][a-z]+\s+[A-Z][a-z]+)\./.exec(ref.text);
        if (firstLastMatch) {
          const parts = firstLastMatch[1].split(/\s+/);
          authorLastName = parts[parts.length - 1];
        }
      }
      
      if (authorLastName) {
        // Create citation keys with the last name in lowercase
        const citationKey = authorLastName.toLowerCase();
        map[citationKey] = ref.id;
        
        // Also try to extract year if present
        const yearMatch = /\b(19|20)\d{2}\b/.exec(ref.text);
        if (yearMatch) {
          const year = yearMatch[0];
          map[`${citationKey}, ${year}`] = ref.id;
          map[`${citationKey},${year}`] = ref.id;
        }
      }
    });
    
    return map;
  };

  // Update references when detail analysis changes - specifically for references section
  useEffect(() => {
    if (parsedSections.references) {
      const referencesList = parseReferences(parsedSections.references);
      setReferences(referencesList);

      // Build citation map
      const map = buildCitationMap(referencesList);
      setCitationMap(map);
    } else {
      setReferences([]);
      setCitationMap({});
    }
  }, [parsedSections.references]);

  // Set up intersection observer to detect which sections are visible
  useEffect(() => {
    // Skip if not in detailed analysis view
    if (activePanel !== 'detailed-analysis') return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          const id = entry.target.id;
          const sectionKey = id.replace('analysis-', '');
          
          if (entry.isIntersecting) {
            setVisibleSections(prev => [...prev, sectionKey]);
          } else {
            setVisibleSections(prev => prev.filter(s => s !== sectionKey));
          }
        });
      },
      { rootMargin: '-10% 0px -80% 0px' } // Adjust threshold as needed
    );
    
    // Observe each section
    Object.keys(sectionRefs.current).forEach(key => {
      const element = document.getElementById(`analysis-${key}`);
      if (element) {
        observer.observe(element);
        sectionRefs.current[key] = element;
      }
    });
    
    return () => {
      Object.values(sectionRefs.current).forEach(el => {
        if (el) observer.unobserve(el);
      });
    };
  }, [activePanel, detailedAnalysis]);

  // Virtualized rendering - only render sections that are or might be visible
  const shouldRenderSection = (sectionKey: string): boolean => {
    // Always render if we haven't set up the visibility tracking yet
    if (visibleSections.length <= 1) return true;
    
    // Check if this section is visible or adjacent to a visible section
    const sectionKeys = ['context', 'author', 'themes', 'evidence', 'significance', 'references'];
    const index = sectionKeys.indexOf(sectionKey);
    
    if (index === -1) return true; // Not a tracked section, render it anyway
    
    // Check if this section or adjacent sections are visible
    return visibleSections.includes(sectionKey) || 
           (index > 0 && visibleSections.includes(sectionKeys[index - 1])) ||
           (index < sectionKeys.length - 1 && visibleSections.includes(sectionKeys[index + 1]));
  };

  // Add reference to library
  const addToLibrary = (id: number) => {
    setReferences(prev => 
      prev.map(ref => 
        ref.id === id ? { ...ref, inLibrary: true } : ref
      )
    );
  };

  // Scroll handler for fast travel
  const handleFastTravelClick = (targetId: string) => {
    const element = document.getElementById(targetId);
    if (element) {
      // Using scrollIntoView for better performance than custom scrolling
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
      
      // Force this section to be visible
      const sectionKey = targetId.replace('analysis-', '');
      setVisibleSections(prev => [...new Set([...prev, sectionKey])]);
    }
  };

  // Handle asking a follow-up question with optimized implementation
  const handleAskQuestion = async (question: string) => {
    if (!question.trim()) return;
    
    // Add user message immediately for better perceived performance
    addMessage({
      role: 'user',
      content: question
    });
    
    setLoading(true);
    
    try {
      // Get latest conversation state after adding the user message
      const currentConversation = useAppStore.getState().conversation;
      
      // Format conversation history
      const history = currentConversation.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      // Make API request
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: question,
          source: sourceContent,
          metadata: metadata,
          model: llmModel,
          history
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
      }
      
      const data = await response.json();
      
      // Add assistant response
      addMessage({
        role: 'assistant',
        content: data.rawResponse || 'No response received'
      });
      
      // Set raw data for transparency
      setRawPrompt(data.rawPrompt || null);
      setRawResponse(data.rawResponse || null);
      
    } catch (error) {
      console.error("Chat error:", error);
      
      // Add error message to conversation
      addMessage({
        role: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`
      });
    } finally {
      setLoading(false);
    }
  };

  // Process content with citations - memoized for performance
  const processContentWithCitations = useMemo(() => {
    return (text: string) => {
      if (!text || references.length === 0) return text;
    
      // Cache the text
      let processedText = text;
    
      // Define regex patterns compiled once
      const emojiPatterns = [
        /📚\(([^)]+)\)/g,
        /\\uD83D\\uDCDA\(([^)]+)\)/g,
        /book emoji\(([^)]+)\)/gi,
        /📚\s*\(([^)]+)\)/g
      ];
    
      emojiPatterns.forEach(pattern => {
        processedText = processedText.replace(pattern, (_, citationKey) => {
          const refId = citationMap[citationKey.toLowerCase()] ?? citationMap[citationKey.trim().toLowerCase()];
          if (refId !== undefined) {
            return `<a href="#reference-${refId}" class="citation-link">📚(${citationKey})</a>`;
          } else {
            return `📚(${citationKey})`; // fallback
          }
        });
      });
    
      return processedText.replace(/\*(.*?)\*/g, '<em>$1</em>'); // also handle italics
    };
  }, [references, citationMap]);

  // Loading indicator
  if (isLoading && !initialAnalysis && activePanel !== 'roleplay') {
    return (
      <div className={`h-full flex flex-col items-center justify-center p-8 text-center ${darkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-50 text-slate-600'}`}>
        <div className={`w-10 h-10 rounded-full border-4 ${darkMode ? 'border-indigo-700 border-t-indigo-300' : 'border-indigo-200 border-t-indigo-600'} animate-spin mb-4`}></div>
        <p>Analyzing your source...</p>
      </div>
    );
  }

  if (!initialAnalysis && activePanel !== 'roleplay') {
    return (
      <div className={`h-full flex items-center justify-center p-8 text-center ${darkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-50 text-slate-500'}`}>
        <div>
          <svg className="w-12 h-12 mx-auto mb-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <p>Waiting for analysis to begin...</p>
        </div>
      </div>
    );
  }

  // Render different panel types based on activePanel
  const renderContentByPanel = () => {
    switch (activePanel) {
      case 'counter':
        return <CounterNarrative />;
        
      case 'roleplay':
        return (
          <div className="space-y-4">
            <h3 className="text-md font-medium flex items-center">
              About Simulation Mode
            </h3>
            <div className="flex items-start mb-2">
              <p className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-700'} leading-relaxed`}>
                This is an experimental simulation tool that feeds a Large Language Model extensive context relating to the author of a primary source and allows you to "speak" to "them."  
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-dashed border-slate-200">
              <div className="flex items-center text-xs text-slate-500">
                <svg className="w-4 h-4 mr-1.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="italic">Using this feature requires a nuanced understanding of historical context. This output should never be mistaken for a fully accurate account of what the real historical figure thought.</span>
              </div>
            </div>
          </div>
        );

      case 'highlight':
        return <HighlightPanel />;
          
      case 'detailed-analysis':
        if (detailedAnalysis) {
          return (
            <div ref={analysisPanelRef} className="space-y-3 p-2 scroll-mt-4" id="detailed-analysis-top">
              {/* Top Header & Buttons */}
              <div className="flex justify-between items-start pb-2">
                <h3 className={`text-xl font-semibold ${darkMode ? 'text-slate-200' : 'text-slate-800'} pt-1`}>Detailed Analysis</h3>
                <div className="flex items-center space-x-3">
                  {/* Fast Travel Icons */}
                  <div className={`flex items-center space-x-1 border ${darkMode ? 'border-slate-700 bg-slate-800/60' : 'border-slate-200 bg-slate-100/60'} rounded-full px-2 py-0.5 hover:bg-slate-200/50 shadow-inner`}>
                    {fastTravelIcons.map((item) => {
                      // Only render icon if the corresponding section has content
                      const sectionKey = item.key as keyof typeof parsedSections;
                      if (!parsedSections[sectionKey] && item.key !== 'references') return null;
                      if (item.key === 'references' && references.length === 0) return null;

                      // Get hover color
                      const hoverClass = sectionStyles[item.key as keyof typeof sectionStyles]?.hoverColor || 'hover:text-slate-600';

                      return (
                        <button
                          key={item.key}
                          onClick={() => handleFastTravelClick(item.targetId)}
                          title={`Fast travel to ${item.label}`}
                          className={`p-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'} ${hoverClass} rounded-full transition-colors`}
                          aria-label={`Scroll to ${item.label}`}
                        >
                          {item.icon}
                        </button>
                      );
                    })}
                  </div>

                  {/* Save Button */}
                  <SaveToLibraryButton
                    type="analysis"
                    data={{
                      type: 'detailed',
                      title: `Detailed Analysis of ${metadata?.title || 'Source'}`,
                      content: detailedAnalysis || '',
                      sourceName: metadata?.title || 'Untitled Source',
                      sourceAuthor: metadata?.author || 'Unknown',
                      sourceDate: metadata?.date || 'Unknown date',
                      perspective: perspective || 'Default',
                      model: llmModel
                    }}
                    variant="secondary"
                    size="sm"
                    className="flex-shrink-0"
                  />
                </div>
              </div>

              {/* Context Section */}
              {parsedSections.context && (
                <section aria-labelledby="context-heading" id="analysis-context" className="scroll-mt-4">
                  <div className={`mb-5 rounded-lg shadow-inner overflow-hidden transition-all duration-300`}>
                    <h4 id="context-heading" className={`flex items-center p-3 ${sectionStyles.context.bg} border-b ${sectionStyles.context.borderColor}`}>
                      <span className={`mr-3 ${sectionStyles.context.iconColor}`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      </span>
                      <span className={`font-medium tracking-wider black`}>1. CONTEXT</span>
                     
<span className={`ml-auto text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'} italic font-normal mr-1`}>What is the historical background?</span>
                    </h4>
                    <div
                      className={`prose prose-sm max-w-none p-6 ${darkMode ? 'text-slate-300 bg-slate-800' : 'text-slate-800 bg-white'} leading-relaxed transition-colors duration-300`}
                      dangerouslySetInnerHTML={{ __html: processContentWithCitations(parsedSections.context) }}
                    />
                  </div>
                </section>
              )}

              {/* Author Perspective Section */}
              {parsedSections.author && (
                <section aria-labelledby="author-heading" id="analysis-author" className="scroll-mt-4">
                  <div className={`mb-5 rounded-lg shadow-inner hover:shadow-xs overflow-hidden transition-all duration-300`}>
                    <h4 id="author-heading" className={`flex items-center p-3 ${sectionStyles.author.bg} border-b ${sectionStyles.author.borderColor}`}>
                      <span className={`mr-3 ${sectionStyles.author.iconColor}`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      </span>
                      <span className={`font-medium tracking-wider `}>2. AUTHOR PERSPECTIVE</span>
                      <span className={`ml-auto text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'} italic font-normal mr-1`}>Who is the author? What are their goals?</span>
                    </h4>
                    <div
                      className={`prose prose-sm max-w-none p-6 ${darkMode ? 'text-slate-300 bg-slate-800' : 'text-slate-800 bg-white'} leading-relaxed transition-colors duration-300`}
                      dangerouslySetInnerHTML={{ __html: processContentWithCitations(parsedSections.author) }}
                    />
                  </div>
                </section>
              )}

              {/* Key Themes Section */}
              {parsedSections.themes && (
                <section aria-labelledby="themes-heading" id="analysis-themes" className="scroll-mt-4">
                  <div className={`mb-5 rounded-lg overflow-hidden shadow-inner hover:shadow-xs transition-all duration-300`}>
                    <h4 id="themes-heading" className={`flex items-center p-3 ${sectionStyles.themes.bg} border-b ${sectionStyles.themes.borderColor}`}>
                      <span className={`mr-3 ${sectionStyles.themes.iconColor}`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                      </span>
                      <span className={`font-medium tracking-wider`}>3. KEY THEMES</span>
                      <span className={`ml-auto text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'} italic font-normal mr-1`}>What are the main themes?</span>
                    </h4>
                    <div
                      className={`prose prose-sm max-w-none p-6 ${darkMode ? 'text-slate-300 bg-slate-800' : 'text-slate-800 bg-white'} leading-relaxed transition-colors duration-300`}
                      dangerouslySetInnerHTML={{ __html: processContentWithCitations(parsedSections.themes) }}
                    />
                  </div>
                </section>
              )}

              {/* Evidence & Rhetoric Section */}
              {parsedSections.evidence && (
                <section aria-labelledby="evidence-heading" id="analysis-evidence" className="scroll-mt-4">
                  <div className={`mb-5 rounded-lg overflow-hidden shadow-inner hover:shadow-xs transition-all duration-300`}>
                    <h4 id="evidence-heading" className={`flex items-center p-3 ${sectionStyles.evidence.bg} border-b ${sectionStyles.evidence.borderColor}`}>
                      <span className={`mr-3 ${sectionStyles.evidence.iconColor}`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      </span>
                      <span className={`font-medium tracking-wider `}>4. EVIDENCE & RHETORIC</span>
                      <span className={`ml-auto text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'} italic font-normal mr-1`}>What evidence and arguments are deployed?</span>
                    </h4>
                    <div
                      className={`prose prose-sm max-w-none p-6 ${darkMode ? 'text-slate-300 bg-slate-800' : 'text-slate-800 bg-white'} leading-relaxed transition-colors duration-300`}
                      dangerouslySetInnerHTML={{ __html: processContentWithCitations(parsedSections.evidence) }}
                    />
                  </div>
                </section>
              )}

              {/* Significance Section */}
              {parsedSections.significance && (
                <section aria-labelledby="significance-heading" id="analysis-significance" className="scroll-mt-4">
                  <div className={`mb-6 rounded-lg overflow-hidden shadow-inner hover:shadow-xs transition-all duration-300`}>
                    <h4 id="significance-heading" className={`flex items-center p-3 ${sectionStyles.significance.bg} border-b ${sectionStyles.significance.borderColor}`}>
                      <span className={`mr-3 ${sectionStyles.significance.iconColor}`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                      </span>
                      <span className={`font-medium tracking-wider `}>5. SIGNIFICANCE</span>
                      <span className={`ml-auto text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'} italic font-normal mr-1`}>Why it matters</span>
                    </h4>
                    <div
                      className={`prose prose-sm max-w-none p-6 ${darkMode ? 'text-slate-300 bg-slate-800' : 'text-slate-800 bg-white'} leading-relaxed transition-colors duration-300`}
                      dangerouslySetInnerHTML={{ __html: processContentWithCitations(parsedSections.significance) }}
                    />
                  </div>
                </section>
              )}

              {/* References Section */}
              {references.length > 0 && (
                <section aria-labelledby="references-heading" id="analysis-references" className="scroll-mt-4">
                  <div className={`border ${sectionStyles.references.borderColor} rounded-lg overflow-hidden shadow-sm transition-all duration-300`}>
                    <h4 id="references-heading" className={`flex items-center justify-between p-3 ${sectionStyles.references.bg} border-b ${sectionStyles.references.borderColor}`}>
                      <div className="flex items-center">
                        <span className={`mr-3 ${sectionStyles.references.iconColor}`}>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                        </span>
                        <span className={`font-medium tracking-wider ${sectionStyles.references.color}`}>6. SCHOLARLY REFERENCES</span>
                      </div>
                      <span className={`text-xs font-sans ${darkMode ? 'bg-blue-800 text-blue-200' : 'bg-blue-200 text-blue-800'} px-2 py-0.5 rounded-full transition-colors duration-300`}>
                        {references.length} {references.length === 1 ? 'source' : 'sources'}
                      </span>
                    </h4>
                    <div className={`divide-y ${darkMode ? 'divide-slate-700 bg-slate-800' : 'divide-slate-100 bg-white'} transition-colors duration-300`}>
                      {references.map(ref => (
                        <div
                          key={ref.id}
                          id={`reference-${ref.id}`}
                          className={`py-3 px-4 ${darkMode ? 'hover:bg-blue-900/30' : 'hover:bg-blue-50'} transition-colors duration-150 scroll-mt-4`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-grow">
                              <p
                                className={`prose prose-sm max-w-none ${darkMode ? 'text-slate-300' : 'text-slate-700'} transition-colors duration-300`}
                                dangerouslySetInnerHTML={{ __html: ref.text.replace(/\*(.*?)\*/g, '<em>$1</em>') }}
                              ></p>
                              <div className="mt-2 flex items-center space-x-3 text-xs">
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    navigator.clipboard.writeText(ref.text);
                                    alert('Citation copied!');
                                  }}
                                  className={`inline-flex items-center ${darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-800'} hover:underline transition-colors duration-300`}
                                >
                                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                  Copy
                                </button>
                                <span className={darkMode ? 'text-slate-600' : 'text-slate-300'}>|</span>
                                <a
                                  href={ref.url || `https://scholar.google.com/scholar?q=${encodeURIComponent(ref.text)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`inline-flex items-center ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'} hover:underline transition-colors duration-300`}
                                >
                                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                  Find
                                </a>
                              </div>
                            </div>
                            <div className="flex-shrink-0 mt-1">
                              <button
                                onClick={() => addToLibrary(ref.id)}
                                disabled={ref.inLibrary}
                                className={`flex items-center text-xs px-2 py-1 rounded transition-colors duration-300 ${
                                  ref.inLibrary
                                    ? darkMode 
                                      ? 'bg-green-900/50 text-green-300 cursor-not-allowed opacity-70' 
                                      : 'bg-green-100 text-green-700 cursor-not-allowed opacity-70'
                                    : darkMode
                                      ? 'bg-indigo-900/50 text-indigo-300 hover:bg-indigo-800/60'
                                      : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                                }`}
                              >
                                {ref.inLibrary ? (
                                  <>
                                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                    Saved
                                  </>
                                ) : (
                                  <>
                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                                    Save
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              )}
            </div>
          );
        } else {
        
          return (
            <div className={`p-4 rounded-lg text-center ${darkMode ? 'text-slate-400' : 'text-slate-500'} transition-colors duration-300`}>
              Detailed analysis not available or still loading.
            </div>
          );
        }
      
      case 'analysis':
      default:
        return (
          <div>
            {/* Summary section */}
            <div className="mb-6 px-2">
              <h3 className={`text-md font-medium uppercase tracking-wider ${darkMode ? 'text-slate-300 border-slate-700' : 'text-slate-700 border-slate-200'} mb-2 pb-1 border-b`}>
                Summary
              </h3>
              <div className={darkMode ? 'text-slate-300' : 'text-slate-700'}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {initialAnalysis?.summary || "No summary available"}
                </ReactMarkdown>
              </div>
            </div>

            <div className="mb-6 px-2">
              <h3 className={`text-md font-medium uppercase tracking-wider ${darkMode ? 'text-slate-300 border-slate-700' : 'text-slate-700 border-slate-200'} mb-2 pb-1 border-b`}>
                Preliminary Analysis
              </h3>
              <div className={darkMode ? 'text-slate-300' : 'text-slate-700'}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {initialAnalysis?.analysis || "No analysis available"}
                </ReactMarkdown>
              </div>
            </div>

            <div>
              <h3 className={`text-md px-2 font-medium mt-8 ${darkMode ? 'text-slate-300 border-slate-700' : 'text-slate-700 border-slate-300'} mb-2 pb-1 border-b border-dashed`}>
                Follow-up Questions
              </h3>
              <p className={`text-sm italic px-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'} mb-5`}>
                Click a question to add it in the discussion
              </p>
              
              {/* Only render the follow-up questions that we need */}
              {(initialAnalysis?.followupQuestions || []).map((question, idx) => (
                <div
                  key={idx}
                  className={`p-3 border text-sm shadow-inner rounded-md cursor-pointer m-3 mb-4 transition-all duration-300 ${
                    selectedQuestion === idx
                      ? darkMode
                        ? 'bg-indigo-900/30 border-indigo-700 shadow-sm'
                        : 'bg-indigo-50 border-indigo-300 shadow-sm'
                      : darkMode
                        ? 'hover:bg-slate-800/80 border-slate-700'
                        : 'hover:bg-slate-100/80 border-slate-200'
                  }`}
                  onClick={() => {
                    setSelectedQuestion(idx);
                    handleAskQuestion(question);
                  }}
                >
                  <ReactMarkdown
                    components={{
                      p: ({node, ...props}) => (
                        <p className={darkMode ? 'text-slate-300' : 'text-slate-700'} {...props} />
                      )
                    }}
                    remarkPlugins={[remarkGfm]}
                  >
                    {question}
                  </ReactMarkdown>
                </div>
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <div className={darkMode ? 'dark' : ''}>
      <style>{citationLinkStyle}</style>
      {renderContentByPanel()}
    </div>
  );
}

