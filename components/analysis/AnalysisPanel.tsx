// components/analysis/AnalysisPanel.tsx
// Component for displaying different types of analysis results
// Includes enhanced styling for section headers, text truncation with fade effect,
// and special handling for references

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '@/lib/store';
import CounterNarrative from './CounterNarrative';
import SaveToLibraryButton from '../library/SaveToLibraryButton';
import { useLibrary } from '@/lib/libraryContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import HighlightPanel from '../highlight/HighlightPanel';
import HighlightExplanation from '../highlight/HighlightExplanation';


// Add this style
const citationLinkStyle = `
  .citation-link {
    color: #4F46E5;
    text-decoration: none;
    border-bottom: 1px dotted #4F46E5;
    transition: all 0.2s;
  }
  .citation-link:hover {
    background-color: rgba(79, 70, 229, 0.1);
    border-bottom: 1px solid #4F46E5;
  }
  :target {
    scroll-margin-top: 1rem;
    animation: highlight 2s ease-out;
  }
  @keyframes highlight {
    0% { background-color: rgba(79, 70, 229, 0.2); }
    100% { background-color: transparent; }
  }
`;

// Interface for parsed references
interface Reference {
  id: number;
  text: string;
  inLibrary: boolean;
  url?: string; // optional
}

export default function AnalysisPanel() {
  const { 
    initialAnalysis, 
    detailedAnalysis,
    counterNarrative,
    activePanel,
    isLoading,
    addMessage,
    setLoading,
    setRawPrompt,
    setRawResponse,
    sourceContent,
    perspective,
    sourceType,
    llmModel,
    metadata
  } = useAppStore();
  
  const [selectedQuestion, setSelectedQuestion] = useState<number | null>(null);
  
  const [references, setReferences] = useState<Reference[]>([]);
  const [citationMap, setCitationMap] = useState<Record<string, number>>({});
  const analysisPanelRef = useRef<HTMLDivElement>(null);
  
  // Parse detailed analysis sections
  const [parsedSections, setParsedSections] = useState({
    context: '',
    author: '',
    themes: '',
    evidence: '',
    significance: '',
    references: ''
  });

const buildCitationMap = (references: Reference[]) => {
  const map: Record<string, number> = {};
  
  references.forEach(ref => {
    // Extract author last name using different patterns
    // Standard format: "Last, First. Year. Title..."
    let authorLastName = '';
    
    // Try standard Chicago style first
    const standardMatch = ref.text.match(/^([^,.]+)/);
    if (standardMatch) {
      authorLastName = standardMatch[1].trim();
    }
    
    // Also try MLA style: "Last, First. Title..."
    const mlaMatch = ref.text.match(/^([^,]+),\s*[^.]+\./);
    if (!authorLastName && mlaMatch) {
      authorLastName = mlaMatch[1].trim();
    }
    
    // Also try "First Last. Title..." format
    const firstLastMatch = ref.text.match(/^([A-Z][a-z]+\s+[A-Z][a-z]+)\./);
    if (!authorLastName && firstLastMatch) {
      const parts = firstLastMatch[1].split(/\s+/);
      authorLastName = parts[parts.length - 1];
    }
    
    if (authorLastName) {
      // Create citation keys with the last name in lowercase
      const citationKey = authorLastName.toLowerCase();
      map[citationKey] = ref.id;
      
      // Also try to extract year if present
      const yearMatch = ref.text.match(/\b(19|20)\d{2}\b/);
      if (yearMatch) {
        const year = yearMatch[0];
        map[`${citationKey}, ${year}`] = ref.id;
        map[`${citationKey},${year}`] = ref.id;
      }
      
      // For debugging
      console.log(`Added citation key: ${citationKey} -> ref ${ref.id}`);
    }
  });
  
  console.log("Citation map:", map);
  return map;
};


  // Extract sections from detailed analysis when it changes
  useEffect(() => {
    if (detailedAnalysis) {
      console.log("Parsing detailed analysis:", detailedAnalysis);
      
      // Parse with the new format that includes ###REFERENCES
      const contextMatch = detailedAnalysis.match(/(?:###CONTEXT:|1\.\s*###CONTEXT:|1\.\s*CONTEXT:)([\s\S]*?)(?=###PERSPECTIVE|2\.|$)/i);
      const authorMatch = detailedAnalysis.match(/(?:###PERSPECTIVE:|2\.\s*###PERSPECTIVE:|2\.\s*PERSPECTIVE:)([\s\S]*?)(?=###THEMES|3\.|$)/i);
      const themesMatch = detailedAnalysis.match(/(?:###THEMES:|3\.\s*###KEY THEMES:|3\.\s*THEMES:)([\s\S]*?)(?=###EVIDENCE|4\.|$)/i);
      const evidenceMatch = detailedAnalysis.match(/(?:###EVIDENCE:|4\.\s*###EVIDENCE:|4\.\s*EVIDENCE:)([\s\S]*?)(?=###SIGNIFICANCE|5\.|$)/i);
      const significanceMatch = detailedAnalysis.match(/(?:###SIGNIFICANCE:|5\.\s*###SIGNIFICANCE:|5\.\s*SIGNIFICANCE:)([\s\S]*?)(?=###REFERENCES|6\.|$)/i);
      const referencesMatch = detailedAnalysis.match(/(?:###REFERENCES:|6\.\s*###REFERENCES:|6\.\s*REFERENCES:)([\s\S]*?)(?=$)/i);
      
      // Fall back to older format patterns if the new ones don't match
      const sections = {
        context: contextMatch?.[1]?.trim() || '',
        author: authorMatch?.[1]?.trim() || '',
        themes: themesMatch?.[1]?.trim() || '',
        evidence: evidenceMatch?.[1]?.trim() || '',
        significance: significanceMatch?.[1]?.trim() || '',
        references: referencesMatch?.[1]?.trim() || ''
      };
      
      // If any sections are empty, try alternate pattern matching
      if (!sections.context) {
        const altContextMatch = detailedAnalysis.match(/(?:### 1\. CONTEXT|### CONTEXT)([\s\S]*?)(?=### 2\.|### AUTHOR|$)/i);
        sections.context = altContextMatch?.[1]?.trim() || 'Context analysis not available.';
      }
      
      if (!sections.author) {
        const altAuthorMatch = detailedAnalysis.match(/(?:### 2\. PERSPECTIVE|###PERSPECTIVE)([\s\S]*?)(?=### 3\.|### KEY|$)/i);
        sections.author = altAuthorMatch?.[1]?.trim() || 'Author perspective analysis not available.';
      }
      
      if (!sections.themes) {
        const altThemesMatch = detailedAnalysis.match(/(?:### 3\. KEY|### KEY THEMES)([\s\S]*?)(?=### 4\.|### EVIDENCE|$)/i);
        sections.themes = altThemesMatch?.[1]?.trim() || 'Theme analysis not available.';
      }
      
      if (!sections.evidence) {
        const altEvidenceMatch = detailedAnalysis.match(/(?:### 4\. EVIDENCE|### EVIDENCE)([\s\S]*?)(?=### 5\.|### SIGNIFICANCE|$)/i);
        sections.evidence = altEvidenceMatch?.[1]?.trim() || 'Evidence and rhetoric analysis not available.';
      }
      
      if (!sections.significance) {
        const altSignificanceMatch = detailedAnalysis.match(/(?:### 5\. SIGNIFICANCE|### SIGNIFICANCE)([\s\S]*?)(?=### 6\.|### REFERENCES|$)/i);
        sections.significance = altSignificanceMatch?.[1]?.trim() || 'Significance analysis not available.';
      }
      
      if (!sections.references) {
        const altReferencesMatch = detailedAnalysis.match(/(?:### 6\. REFERENCES|### REFERENCES)([\s\S]*?)(?=$)/i);
        sections.references = altReferencesMatch?.[1]?.trim() || '';
      }
      
      // Clean up repeated section headers in content
      Object.keys(sections).forEach(key => {
        const section = sections[key as keyof typeof sections];
        // Remove any section header text that got included in the content
        sections[key as keyof typeof sections] = section
          .replace(/^(CONTEXT|AUTHOR PERSPECTIVE|KEY THEMES|EVIDENCE & RHETORIC|SIGNIFICANCE|REFERENCES):\s*/i, '')
          .replace(/^(PERSPECTIVE|THEMES|RHETORIC|REFERENCES):\s*/i, '')
          .trim();
      });
      
      setParsedSections(sections);
      
      // Parse references into individual items
      if (sections.references) {
        const referencesList = parseReferences(sections.references);
        setReferences(referencesList);

        // Build citation map
        const map = buildCitationMap(referencesList);
        setCitationMap(map);
      } else {
        setReferences([]);
        setCitationMap({});
      }
      
      console.log("Parsed sections:", sections);
    }
  }, [detailedAnalysis]);
  
  
  // Parse references into individual items
 const parseReferences = (referencesText: string): Reference[] => {
  if (!referencesText) return [];
  
  // Split by common reference separators (could be hyphens, newlines, or numbered entries)
  const lines = referencesText
    .split(/\n+|-\s+|^\d+\.\s+/m)
    .map(line => line.trim())
    .filter(line => line.length > 0 && line.match(/[A-Za-z]/)); // Must contain letters
  
  console.log("Reference lines:", lines);
  
  // Filter out empty lines and process each reference
  return lines.map((line, index) => ({
    id: index,
    text: line.trim(),
    inLibrary: false
  }));
};
  
  // Add reference to library
  const addToLibrary = (id: number) => {
    setReferences(prev => 
      prev.map(ref => 
        ref.id === id ? { ...ref, inLibrary: true } : ref
      )
    );
    
    // Here you would normally also add this to a global library state
    // For demo purposes, we're just toggling a visual state
  };

  // Function to handle asking a follow-up question
const handleAskQuestion = (question: string) => {
  if (question.trim()) {
    // Add the user message to the conversation
    addMessage({
      role: 'user',
      content: question
    });

    // Fetch the current conversation from the store
    const currentConversation = useAppStore.getState().conversation;

    // Manually trigger the API call logic
    (async () => {
      // Set loading state
      setLoading(true);
      
      try {
        // Format conversation history for API
        const history = currentConversation.map(msg => ({
          role: msg.role,
          content: msg.content
        }));
        
        // API call with conversation history
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
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
        
        // Add assistant response to conversation
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
    })();
  }
};
 

  // Define section colors and styles for the enhanced typography
   const sectionStyles = {
     context: {
        color: 'text-purple-1000',
        bg: 'bg-purple-50/50',
        iconColor: 'text-purple-600',
        borderColor: 'border-purple-200',
        hoverColor: 'hover:text-purple-600' // Added hoverColor
     },
     author: {
        color: 'text-pink-1000',
        bg: 'bg-pink-50/50',
        iconColor: 'text-pink-600',
        borderColor: 'border-pink-200',
        hoverColor: 'hover:text-pink-600' // Added hoverColor
     },
     themes: {
        color: 'text-sky-1000',
        bg: 'bg-sky-50/50',
        iconColor: 'text-sky-600',
        borderColor: 'border-sky-200',
        hoverColor: 'hover:text-sky-600' // Added hoverColor
     },
     evidence: {
        color: 'text-teal-1000',
        bg: 'bg-teal-50/50',
        iconColor: 'text-teal-600',
        borderColor: 'border-teal-200',
        hoverColor: 'hover:text-teal-600' // Added hoverColor
     },
     significance: {
        color: 'text-indigo-1000',
        bg: 'bg-indigo-50/50',
        iconColor: 'text-indigo-600',
        borderColor: 'border-indigo-200',
        hoverColor: 'hover:text-indigo-600' // Added hoverColor
     },
     references: {
        color: 'text-blue-900',
        bg: 'bg-blue-100',
        iconColor: 'text-blue-700',
        borderColor: 'border-blue-300',
        hoverColor: 'hover:text-blue-700' // Added hoverColor
     }
  };

const fastTravelIcons = [
    { key: 'context', label: 'Context', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, targetId: 'analysis-context' },
    { key: 'author', label: 'Author Perspective', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>, targetId: 'analysis-author' },
    { key: 'themes', label: 'Key Themes', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>, targetId: 'analysis-themes' },
    { key: 'evidence', label: 'Evidence & Rhetoric', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>, targetId: 'analysis-evidence' },
    { key: 'significance', label: 'Significance', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>, targetId: 'analysis-significance' },
    { key: 'references', label: 'References', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>, targetId: 'analysis-references' }
  ];

  // --- NEW: Scroll Handler ---
  const handleFastTravelClick = (targetId: string) => {
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start' // Aligns the top of the element to the top of the viewport
      });
    } else {
      console.warn(`Fast travel target element not found: ${targetId}`);
    }
  };

  // --- NEW: Scroll to Top Handler ---
   const scrollToTop = () => {
    if (analysisPanelRef.current) {
      analysisPanelRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };


// loading indicator
if (isLoading && !initialAnalysis && activePanel !== 'roleplay') {
  return (
    <div className="h-full flex flex-col items-center justify-center p-8 text-center">
      <div className="w-12 h-12 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin mb-4"></div>
      <p className="text-slate-600">Analyzing your source...</p>
    </div>
  );
}

if (!initialAnalysis && activePanel !== 'roleplay') {
  return (
    <div className="h-full flex items-center justify-center p-8 text-center">
      <div className="text-slate-500">
        <svg className="w-12 h-12 mx-auto mb-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <p>
          Waiting for analysis to begin...
        </p>
      </div>
    </div>
  );
}

const processContentWithCitations = (text: string) => {
  if (!text || references.length === 0) return text;

  let processedText = text;

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

  return processedText.replace(/\*(.*?)\*/g, '<em>$1</em>'); // also handle italics here
};


 const renderContent = () => {
  switch (activePanel) {
case 'counter':
  return (


      <CounterNarrative />

  );
      
   // roleplay case 
case 'roleplay':
  return (
    <div className="space-y-4">

      {/* simulation mode explanation panel */}
      
        <h3 className="text-md font-medium flex items-center">
         
          About Simulation Mode
        </h3>

        <div className="flex items-start mb-2">
          <p className="text-sm text-slate-700 leading-relaxed">
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

{/* text highlights panel */}
     case 'highlight':
  return (
        <HighlightPanel />
  );
      
          case 'detailed-analysis':
        if (detailedAnalysis) {
          return (
           
            <div ref={analysisPanelRef} className="space-y-3 p-2 scroll-mt-4" id="detailed-analysis-top"> {/* Adjust scroll-mt if you have a sticky header */}
              {/* Top Header & Buttons */}
              <div className="flex justify-between items-start pb-2 ">
                 {/* Left side: Title */}
                 <h3 className="text-xl font-semibold text-slate-800 pt-1">Detailed Analysis</h3>

                 {/* Right side: Fast Travel Icons & Save Button */}
                 <div className="flex items-center space-x-3">
                    {/* Fast Travel Icons */}
                   <div className="flex items-center space-x-1 border border-slate-200 rounded-full px-2 py-0.5 bg-slate-100/60 hover:bg-slate-200/50 shadow-inner">
                     {/* Scroll to Top Button */}
                      

                      {fastTravelIcons.map((item) => {
                       // Only render icon if the corresponding section has content
                       const sectionKey = item.key as keyof typeof parsedSections;
                       if (!parsedSections[sectionKey] && item.key !== 'references') return null;
                       if (item.key === 'references' && references.length === 0) return null;

                       // Get hover color, default to gray if not found
                       const hoverClass = sectionStyles[item.key as keyof typeof sectionStyles]?.hoverColor || 'hover:text-slate-600';

                       return (
                         <button
                           key={item.key}
                           onClick={() => handleFastTravelClick(item.targetId)}
                           title={`Fast travel to ${item.label}`}
                           className={`p-1 text-slate-400 ${hoverClass} rounded-full transition-colors`}
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
                     data={{ // Fill in the actual data object
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
                     className="flex-shrink-0" // Prevent button from shrinking
                   />
                 </div>
              </div>

              {/* --- Sections --- */}

              {/* Context Section */}
              {parsedSections.context && (
                <section aria-labelledby="context-heading" id="analysis-context" className="scroll-mt-4 "> {/* Add ID and scroll-margin */}
                   <div className={`mb-5 rounded-lg shadow-inner   overflow-hidden`}>
                    <h4 id="context-heading" className={`flex items-center  p-3 bg-${sectionStyles.context.bg} border-b ${sectionStyles.context.borderColor}`}>
                       <span className={`mr-3 ${sectionStyles.context.iconColor}`}>
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                       </span>
                       <span className={`font-medium tracking-wider ${sectionStyles.context.color}`}>1. CONTEXT</span>
                       <span className="ml-auto text-sm text-slate-500 italic font-normal mr-1">What is the historical background?</span>
                    </h4>
                    <div
                      className="prose  prose-sm max-w-none p-6 text-slate-800 leading-relaxed bg-white "
                      dangerouslySetInnerHTML={{ __html: processContentWithCitations(parsedSections.context) }}
                    />
                  </div>
                </section>
              )}

              {/* Author Perspective Section */}
              {parsedSections.author && (
                 <section aria-labelledby="author-heading" id="analysis-author" className="scroll-mt-4"> {/* Add ID and scroll-margin */}
                   <div className={`mmb-5 rounded-lg shadow-inner hover:shadow-xs overflow-hidden`}>
                     <h4 id="author-heading" className={`flex items-center p-3 ${sectionStyles.author.bg} border-b ${sectionStyles.author.borderColor}`}>
                       <span className={`mr-3 ${sectionStyles.author.iconColor}`}>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                       </span>
                       <span className={`font-medium tracking-wider ${sectionStyles.author.color}`}>2. AUTHOR PERSPECTIVE</span>
                        <span className="ml-auto text-sm text-slate-500 italic font-normal mr-1">Who is the author? What are their goals?</span>
                     </h4>
                     <div
                       className="prose prose-sm max-w-none p-6 text-slate-800 leading-relaxed bg-white"
                       dangerouslySetInnerHTML={{ __html: processContentWithCitations(parsedSections.author) }}
                     />
                   </div>
                 </section>
              )}

              {/* Key Themes Section */}
               {parsedSections.themes && (
                 <section aria-labelledby="themes-heading" id="analysis-themes" className="scroll-mt-4"> {/* Add ID and scroll-margin */}
                   <div className={`mb-5 rounded-lg overflow-hidden shadow-inner hover:shadow-xs`}>
                     <h4 id="themes-heading" className={`flex items-center p-3 ${sectionStyles.themes.bg} border-b ${sectionStyles.themes.borderColor}`}>
                       <span className={`mr-3 ${sectionStyles.themes.iconColor}`}>
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                       </span>
                       <span className={`font-medium tracking-wider ${sectionStyles.themes.color}`}>3. KEY THEMES</span>
                       <span className="ml-auto text-sm text-slate-500 italic font-normal mr-1">What are the main themes?</span>
                     </h4>
                     <div
                       className="prose prose-sm max-w-none p-6 text-slate-800 leading-relaxed bg-white"
                       dangerouslySetInnerHTML={{ __html: processContentWithCitations(parsedSections.themes) }}
                     />
                   </div>
                 </section>
              )}

              {/* Evidence & Rhetoric Section */}
              {parsedSections.evidence && (
                 <section aria-labelledby="evidence-heading" id="analysis-evidence" className="scroll-mt-4"> {/* Add ID and scroll-margin */}
                   <div className={`mb-5 rounded-lg overflow-hidden shadow-inner hover:shadow-xs`}>
                     <h4 id="evidence-heading" className={`flex items-center p-3 ${sectionStyles.evidence.bg} border-b ${sectionStyles.evidence.borderColor}`}>
                       <span className={`mr-3 ${sectionStyles.evidence.iconColor}`}>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                       </span>
                       <span className={`font-medium tracking-wider ${sectionStyles.evidence.color}`}>4. EVIDENCE & RHETORIC</span>
                        <span className="ml-auto text-sm text-slate-500 italic font-normal mr-1">What evidence and arguments are deployed?</span>
                     </h4>
                     <div
                       className="prose prose-sm max-w-none p-6 text-slate-800 leading-relaxed bg-white"
                       dangerouslySetInnerHTML={{ __html: processContentWithCitations(parsedSections.evidence) }}
                     />
                   </div>
                 </section>
              )}

              {/* Significance Section */}
              {parsedSections.significance && (
                <section aria-labelledby="significance-heading" id="analysis-significance" className="scroll-mt-4"> {/* Add ID and scroll-margin */}
                   <div className={`mb-6 rounded-lg overflow-hidden shadow-inner hover:shadow-xs`}>
                    <h4 id="significance-heading" className={`flex items-center p-3 ${sectionStyles.significance.bg} border-b ${sectionStyles.significance.borderColor}`}>
                      <span className={`mr-3 ${sectionStyles.significance.iconColor}`}>
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                      </span>
                      <span className={`font-medium tracking-wider ${sectionStyles.significance.color}`}>5. SIGNIFICANCE</span>
                       <span className="ml-auto text-sm text-slate-500 italic font-normal mr-1">Why it matters</span>
                    </h4>
                    <div
                      className="prose prose-sm max-w-none p-6 text-slate-800 leading-relaxed bg-white"
                      dangerouslySetInnerHTML={{ __html: processContentWithCitations(parsedSections.significance) }}
                    />
                  </div>
                </section>
              )}

              {/* References Section */}
              {references.length > 0 && (
                <section aria-labelledby="references-heading" id="analysis-references" className="scroll-mt-4"> {/* Add ID and scroll-margin */}
                   <div className={`border ${sectionStyles.references.borderColor} rounded-lg overflow-hidden shadow-sm`}>
                    <h4 id="references-heading" className={`flex items-center justify-between p-3 ${sectionStyles.references.bg} border-b ${sectionStyles.references.borderColor}`}>
                      <div className="flex items-center">
                          <span className={`mr-3 ${sectionStyles.references.iconColor}`}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                          </span>
                          <span className={`font-medium tracking-wider ${sectionStyles.references.color}`}>6. SCHOLARLY REFERENCES</span>
                      </div>
                       <span className="text-xs font-sans bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full">
                         {references.length} {references.length === 1 ? 'source' : 'sources'}
                       </span>
                    </h4>
                    <div className="divide-y divide-slate-100 bg-white">
                      {references.map(ref => (
                        <div
                          key={ref.id}
                          id={`reference-${ref.id}`} // ID for citation links
                          className="py-3 px-4 hover:bg-blue-50 transition-colors duration-150 scroll-mt-4" // Add scroll-margin for citation links too
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-grow">
                              <p
                                className="prose prose-sm max-w-none text-slate-700"
                                dangerouslySetInnerHTML={{ __html: ref.text.replace(/\*(.*?)\*/g, '<em>$1</em>') }}
                              ></p>
                              <div className="mt-2 flex items-center space-x-3 text-xs">
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    navigator.clipboard.writeText(ref.text);
                                    alert('Citation copied!');
                                  }}
                                  className="inline-flex items-center text-indigo-600 hover:text-indigo-800 hover:underline"
                                >
                                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                  Copy
                                </button>
                                <span className="text-slate-300">|</span>
                                <a
                                  href={ref.url || `https://scholar.google.com/scholar?q=${encodeURIComponent(ref.text)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center text-blue-600 hover:text-blue-800 hover:underline"
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
                                className={`flex items-center text-xs px-2 py-1 rounded transition-colors ${
                                  ref.inLibrary
                                    ? 'bg-green-100 text-green-700 cursor-not-allowed opacity-70'
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
           // Fallback content when detailedAnalysis is not available

           return (
             <div className="p-4 text-center text-slate-500">
               Detailed analysis not available or still loading.
             </div>
           );
        }
     
      
  case 'analysis':
default:
  return (
    <div>
      {/* Summary section */}
      <div className="mb-4 px-2">
        <h3 className="text-md font-medium uppercase tracking-wider text-slate-700 mb-2 pb-1 border-b border-slate-200">
          Summary
        </h3>
        {/* Wrap ReactMarkdown in a parent div */}
        <div className="text-slate-700">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {initialAnalysis?.summary || "No summary available"}
          </ReactMarkdown>
        </div>
      </div>

     <div className="mb-4 px-2">
  <h3 className="text-md font-medium uppercase tracking-wider text-slate-700 mb-2 pb-1 border-b border-slate-200">
    Preliminary Analysis
  </h3>
  <div className="text-slate-700">
    <ReactMarkdown remarkPlugins={[remarkGfm]}>
      {initialAnalysis?.analysis || "No analysis available"}
    </ReactMarkdown>
  </div>
</div>

     <div>
       <h3 className="text-md px-2 font-medium mt-8 text-slate-700 mb-2 pb-1 border-b border-dashed border-slate-300">
         Follow-up Questions
       </h3>
       <p className="text-sm italic px-2 text-slate-500 mb-5">
         Click a question to add it in the discussion
       </p>
       <div className="space-y-5 px-3 mb-3">
  {initialAnalysis?.followupQuestions?.map((question, idx) => (
    <div
      key={idx}
      className={`p-3 border text-sm shadow-inner rounded-md cursor-pointer transition-colors ${
        selectedQuestion === idx 
          ? 'bg-indigo-50 border-indigo-300 shadow-sm' 
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
            <p className="text-slate-700" {...props} />
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
     
    </div>


  );
  }
};

 return (
  <div>
    <style>{citationLinkStyle}</style>
    {renderContent()}
  </div>
);
}
                                      