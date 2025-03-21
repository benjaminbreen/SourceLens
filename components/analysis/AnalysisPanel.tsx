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
}

export default function AnalysisPanel() {
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
    metadata
  } = useAppStore();
  
  const [selectedQuestion, setSelectedQuestion] = useState<number | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [references, setReferences] = useState<Reference[]>([]);
  const [citationMap, setCitationMap] = useState<Record<string, number>>({});

  // Refs for text content elements to check their height
  const contentRefs = {
    context: useRef<HTMLDivElement>(null),
    author: useRef<HTMLDivElement>(null),
    themes: useRef<HTMLDivElement>(null),
    evidence: useRef<HTMLDivElement>(null),
    significance: useRef<HTMLDivElement>(null)
  };
  
  // Track which sections need "Show more" buttons
  const [sectionHasMore, setSectionHasMore] = useState<Record<string, boolean>>({
    context: false,
    author: false,
    themes: false,
    evidence: false,
    significance: false
  });
  
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
      const contextMatch = detailedAnalysis.match(/(?:###CONTEXT:|1\.\s*###CONTEXT:|1\.\s*CONTEXT:)([\s\S]*?)(?=###AUTHOR|2\.|$)/i);
      const authorMatch = detailedAnalysis.match(/(?:###AUTHOR PERSPECTIVE:|2\.\s*###AUTHOR PERSPECTIVE:|2\.\s*AUTHOR PERSPECTIVE:)([\s\S]*?)(?=###KEY|3\.|$)/i);
      const themesMatch = detailedAnalysis.match(/(?:###KEY THEMES:|3\.\s*###KEY THEMES:|3\.\s*KEY THEMES:)([\s\S]*?)(?=###EVIDENCE|4\.|$)/i);
      const evidenceMatch = detailedAnalysis.match(/(?:###EVIDENCE & RHETORIC:|4\.\s*###EVIDENCE & RHETORIC:|4\.\s*EVIDENCE & RHETORIC:)([\s\S]*?)(?=###SIGNIFICANCE|5\.|$)/i);
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
        const altAuthorMatch = detailedAnalysis.match(/(?:### 2\. AUTHOR|### AUTHOR PERSPECTIVE)([\s\S]*?)(?=### 3\.|### KEY|$)/i);
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
    }
      
      console.log("Parsed sections:", sections);
    }
  }, [detailedAnalysis]);
  
  // Check section heights after render to determine if "Show more" is needed
  useEffect(() => {
    const checkSectionHeights = () => {
      const lineHeight = 24; // Approximate line height in pixels
      const maxLines = 8; // Maximum number of lines before showing "Show more"
      const maxHeight = lineHeight * maxLines;
      
      const newSectionHasMore = { ...sectionHasMore };
      
      Object.keys(contentRefs).forEach(key => {
        const ref = contentRefs[key as keyof typeof contentRefs].current;
        if (ref) {
          const hasMore = ref.scrollHeight > maxHeight;
          newSectionHasMore[key] = hasMore;
        }
      });
      
      setSectionHasMore(newSectionHasMore);
    };
    
    // Check after a short delay to ensure content is rendered
    const timer = setTimeout(checkSectionHeights, 100);
    return () => clearTimeout(timer);
  }, [parsedSections]);
  
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
      addMessage({
        role: 'user',
        content: question
      });
    }
  };
  
  // Toggle section expansion
  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Define section colors and styles for the enhanced typography
  const sectionStyles = {
    context: {
      color: 'text-indigo-900',
      border: 'border-none',
      bg: 'bg-indigo-50/80',
      btn: 'text-indigo-600 hover:text-indigo-800',
      icon: 'text-indigo-500 hover:text-indigo-700'
    },
    author: {
      color: 'text-amber-900',
      border: 'border-none',
      bg: 'bg-amber-50/80',
      btn: 'text-blue-600 hover:text-blue-800',
      icon: 'text-amber-500 hover:text-amber-700'
    },
    themes: {
      color: 'text-emerald-900',
      border: 'border-none',
      bg: 'bg-emerald-50/80',
      btn: 'text-blue-600 hover:text-blue-800',
      icon: 'text-emerald-500 hover:text-emerald-700'
    },
    evidence: {
      color: 'text-purple-900',
      border: 'border-none',
      bg: 'bg-purple-50/80',
      btn: 'text-blue-600 hover:text-blue-800',
      icon: 'text-purple-500 hover:text-purple-700'
    },
    significance: {
      color: 'text-rose-900',
      border: 'border-none',
      bg: 'bg-rose-50',
      btn: 'text-blue-600 hover:text-blue-800',
      icon: 'text-rose-500 hover:text-rose-700'
    },
    references: {
      color: 'text-blue-900',
      border: 'border-blue-300',
      bg: 'bg-blue-50',
      btn: 'text-blue-600 hover:text-blue-800',
      icon: 'text-blue-500 hover:text-blue-700'
    }
  };

  if (isLoading && !initialAnalysis) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center">
        <div className="w-12 h-12 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin mb-4"></div>
        <p className="text-slate-600">Analyzing your source...</p>
      </div>
    );
  }

  if (!initialAnalysis) {
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
   
   // Handle both the unicode emoji and the text representation
   const emojiPatterns = [
     /📚\(([^)]+)\)/g,         // Unicode emoji: 📚(Author, Year)
     /\\uD83D\\uDCDA\(([^)]+)\)/g, // Escaped unicode: \uD83D\uDCDA(Author, Year)
     /book emoji\(([^)]+)\)/gi, // Text description: book emoji(Author, Year)
     /📚\s*\(([^)]+)\)/g      // Unicode emoji with space: 📚 (Author, Year)
   ];
   
   let processedText = text;
   
   // Process each emoji pattern
   emojiPatterns.forEach(pattern => {
     processedText = processedText.replace(pattern, (match, citation) => {
       // Extract author name (and year if present)
       const parts = citation.split(',');
       const author = parts[0].trim().toLowerCase();
       
       // Try to find the reference ID in the citation map
       const refId = citationMap[author];
       
       // If we found a matching reference, create a link
       if (refId !== undefined) {
         // Replace the emoji or text with just normal parentheses
         const cleanedMatch = match
           .replace(/📚\s*/, '')
           .replace(/\\uD83D\\uDCDA\s*/, '')
           .replace(/book emoji\s*/i, '');
         return `<a href="#reference-${refId}" class="citation-link">${cleanedMatch}</a>`;
       }
       
       // Return the original match without the emoji/text if no reference found
       return match
         .replace(/📚\s*/, '')
         .replace(/\\uD83D\\uDCDA\s*/, '')
         .replace(/book emoji\s*/i, '');
     });
   });
   
   // Also look for citations directly (Author, Year) without emoji
   // This is a fallback for citations that might be in the text but not properly marked
   if (!emojiPatterns.some(pattern => pattern.test(text))) {
     const referenceAuthors = references.map(ref => {
       const authorMatch = ref.text.match(/^([^,]+)/);
       return authorMatch ? authorMatch[1].trim().toLowerCase() : null;
     }).filter(Boolean);
     
     // Find citations in the form (Author, Year) or Author (Year)
     const citationPatterns = [
       /\(([^,\)]+),?\s*(\d{4})?\)/g,  // (Author, 2005) or (Author)
       /\b([A-Z][a-z]+)\s+\((\d{4})\)/g,  // Author (2005)
     ];
     
     citationPatterns.forEach(pattern => {
       processedText = processedText.replace(pattern, (match, author, year) => {
         if (!author) return match;
         
         const authorKey = author.trim().toLowerCase();
         
         // Only process if this author is in our references
         if (referenceAuthors.includes(authorKey)) {
           const refId = citationMap[authorKey];
           
           if (refId !== undefined) {
             return `<a href="#reference-${refId}" class="citation-link">${match}</a>`;
           }
         }
         
         return match;
       });
     });
     
     // Also try specific author names (more targeted approach)
     references.forEach(ref => {
       const authorMatch = ref.text.match(/^([^,]+)/);
       if (authorMatch) {
         const author = authorMatch[1].trim();
         const regex = new RegExp(`\\b${author}\\b`, 'g');
         
         processedText = processedText.replace(regex, (match) => {
           return `<a href="#reference-${ref.id}" class="citation-link">${match}</a>`;
         });
       }
     });
   }
   
   return processedText;
 };

 const renderContent = () => {
  switch (activePanel) {
case 'counter':
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-slate-800">Counter-Narrative</h3>
        <SaveToLibraryButton 
          type="analysis"
          data={{
            type: 'counter',
            title: `Counter-Narrative ${metadata?.author ? `for ${metadata.author}` : ''}`,
            content: counterNarrative || '',
            sourceName: metadata?.title || 'Untitled Source',
            sourceAuthor: metadata?.author || 'Unknown',
            sourceDate: metadata?.date || 'Unknown date',
            perspective: perspective || 'Default'
          }}
          variant="secondary"
          size="sm"
        />
      </div>
      <CounterNarrative />
    </div>
  );
      
    case 'roleplay':
      return (
        <div>
          <h3 className="text-lg font-medium text-slate-800 mb-3 pb-2 border-b border-slate-100">Author Perspective</h3>
          <p className="text-slate-500 italic">
            Click "Begin Roleplay" in the tools panel to simulate a conversation with the author.
          </p>
        </div>
      );
      
    case 'detailed-analysis':
      // Always show detailed analysis when this panel is active
      if (detailedAnalysis) {
        return (
           <div>
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg font-medium text-slate-800">Detailed Analysis</h3>
      <SaveToLibraryButton 
        type="analysis"
        data={{
          type: 'detailed',
          title: `Analysis of ${metadata?.author ? `${metadata.author}'s Work` : 'Primary Source'}`,
          content: detailedAnalysis || '',
          sourceName: metadata?.title || 'Untitled Source',
          sourceAuthor: metadata?.author || 'Unknown',
          sourceDate: metadata?.date || 'Unknown date',
          perspective: perspective || 'Default',
          model: llmModel
        }}
        variant="secondary"
        size="sm"
      />
    </div>
            {/* Context Section */}
            <div className="mb-2">
              <div className={` rounded-lg overflow-hidden mb-1 `}>
                <h4 className={`text-md shadow-sm  font-bold font-mono tracking-tight ${sectionStyles.context.color} ${sectionStyles.context.bg} p-1 border-b-1 ${sectionStyles.context.border} flex items-center`}>
                  <span className={`mr-3 ${sectionStyles.context.icon}`}>
                    <svg className="w-5 h-5 " fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </span>
                  1. CONTEXT
                  <p className="text-slate-600/90 font-serif tracking-tight font-light ml-auto  mr-2 text-md italic">
                    What is the historical background?
                  </p>
                </h4>

                <div className="relative">
                  <div 
                    ref={contentRefs.context}
                    className={`text-slate-700 font-medium leading-relaxed mb-2 py-2 px-3 ${
                      !expandedSections.context && sectionHasMore.context 
                        ? 'max-h-48 overflow-hidden' 
                        : ''
                    }`}
                    dangerouslySetInnerHTML={{ 
                      __html: processContentWithCitations(parsedSections.context) 
                    }}
                  />
                  
                  
                </div>
              </div>
            
            </div>
            
            {/* Author Perspective Section */}
            <div className="mb-5">
              <div className={`rounded-lg overflow-hidden mb-1`}>
                <h4 className={`text-md shadow-sm font-bold font-mono tracking-tight ${sectionStyles.author.color} ${sectionStyles.author.bg} p-1 border-b-1 ${sectionStyles.author.border} flex items-center`}>
                  <span className={`mr-3 ${sectionStyles.author.icon}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </span>
                  2. AUTHOR PERSPECTIVE
                  <p className="text-slate-600/90 font-serif tracking-tight font-light ml-auto  mr-2  text-md italic">
                    Who created this and why?
                  </p>
                </h4>
                <div className="relative">
                  <div 
                    ref={contentRefs.author}
                    className={`text-slate-700 leading-relaxed py-2 px-3 ${
                      !expandedSections.author && sectionHasMore.author 
                        ? 'max-h-48 overflow-hidden' 
                        : ''
                    }`}
                    dangerouslySetInnerHTML={{ 
                      __html: processContentWithCitations(parsedSections.author) 
                    }}
                  />
                  
                  {/* Fade-out overlay when collapsed */}
                  {!expandedSections.author && sectionHasMore.author && (
                    <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-white to-transparent"></div>
                  )}
                </div>
              </div>
              {sectionHasMore.author && (
                <button
                  onClick={() => toggleSection('author')}
                  className={`mt-1 flex items-center justify-center w-full py-1.5 px-2 text-sm ${sectionStyles.author.btn} font-medium`}
                >
                  {expandedSections.author ? 'Show less' : 'Show more'} 
                  <svg className={`w-4 h-4 ml-1 transition-transform ${expandedSections.author ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              )}
            </div>

            {/* Key Themes Section */}
            <div className="mb-5">
              <div className={`rounded-lg overflow-hidden mb-1`}>
                <h4 className={`text-md shadow-sm font-bold font-mono tracking-tight ${sectionStyles.themes.color} ${sectionStyles.themes.bg} p-1 border-b-1 ${sectionStyles.themes.border} flex items-center`}>
                  <span className={`mr-3 ${sectionStyles.themes.icon}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </span>
                  3. KEY THEMES
                  <p className="text-slate-600/90 font-serif tracking-tight font-light ml-auto  mr-2  text-md italic">
                    What are the main ideas?
                  </p>
                </h4>
                <div className="relative">
                  <div 
                    ref={contentRefs.themes}
                    className={`text-slate-700 leading-relaxed py-2 px-3 ${
                      !expandedSections.themes && sectionHasMore.themes 
                        ? 'max-h-48 overflow-hidden' 
                        : ''
                    }`}
                    dangerouslySetInnerHTML={{ 
                      __html: processContentWithCitations(parsedSections.themes) 
                    }}
                  />
                  
                  {/* Fade-out overlay when collapsed */}
                  {!expandedSections.themes && sectionHasMore.themes && (
                    <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-white to-transparent"></div>
                  )}
                </div>
              </div>
              {sectionHasMore.themes && (
                <button
                  onClick={() => toggleSection('themes')}
                  className={`mt-1 flex items-center justify-center w-full py-1.5 px-2 text-sm ${sectionStyles.themes.btn} font-medium`}
                >
                  {expandedSections.themes ? 'Show less' : 'Show more'} 
                  <svg className={`w-4 h-4 ml-1 transition-transform ${expandedSections.themes ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              )}
            </div>

            {/* Evidence & Rhetoric Section */}
            <div className="mb-5">
              <div className={`rounded-lg overflow-hidden mb-1`}>
                <h4 className={`text-md shadow-sm font-bold font-mono tracking-tight ${sectionStyles.evidence.color} ${sectionStyles.evidence.bg} p-1 border-b-1 ${sectionStyles.evidence.border} flex items-center`}>
                  <span className={`mr-3 ${sectionStyles.evidence.icon}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </span>
                  4. EVIDENCE & RHETORIC
                  <p className="text-slate-600/90 font-serif tracking-tight font-light ml-auto  mr-2  text-md italic">
                    How is the argument constructed?
                  </p>
                </h4>
                <div className="relative">
                  <div 
                    ref={contentRefs.evidence}
                    className={`text-slate-700 leading-relaxed py-2 px-3 ${
                      !expandedSections.evidence && sectionHasMore.evidence 
                        ? 'max-h-48 overflow-hidden' 
                        : ''
                    }`}
                    dangerouslySetInnerHTML={{ 
                      __html: processContentWithCitations(parsedSections.evidence) 
                    }}
                  />
                  
                  {/* Fade-out overlay when collapsed */}
                  {!expandedSections.evidence && sectionHasMore.evidence && (
                    <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-white to-transparent"></div>
                  )}
                </div>
              </div>
              {sectionHasMore.evidence && (
                <button
                  onClick={() => toggleSection('evidence')}
                  className={`mt-1 flex items-center justify-center w-full py-1.5 px-2 text-sm ${sectionStyles.evidence.btn} font-medium`}
                >
                  {expandedSections.evidence ? 'Show less' : 'Show more'} 
                  <svg className={`w-4 h-4 ml-1 transition-transform ${expandedSections.evidence ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              )}
            </div>

            {/* Significance Section */}
            <div className="mb-5">
              <div className={`rounded-lg overflow-hidden mb-1`}>
                <h4 className={`text-md shadow-sm font-bold font-mono tracking-tight ${sectionStyles.significance.color} ${sectionStyles.significance.bg} p-1 border-b-1 ${sectionStyles.significance.border} flex items-center`}>
                  <span className={`mr-3 ${sectionStyles.significance.icon}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </span>
                  5. SIGNIFICANCE
                  <p className="text-slate-600/90 font-serif tracking-tight font-light ml-auto  mr-2  text-md italic">
                    Why does this matter?
                  </p>
                </h4>
                <div className="relative">
                  <div 
                    ref={contentRefs.significance}
                    className={`text-slate-700 leading-relaxed py-2 px-3 ${
                      !expandedSections.significance && sectionHasMore.significance 
                        ? 'max-h-48 overflow-hidden' 
                        : ''
                    }`}
                    dangerouslySetInnerHTML={{ 
                      __html: processContentWithCitations(parsedSections.significance) 
                    }}
                  />
                  
                  {/* Fade-out overlay when collapsed */}
                  {!expandedSections.significance && sectionHasMore.significance && (
                    <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-white to-transparent"></div>
                  )}
                </div>
              </div>
              {sectionHasMore.significance && (
                <button
                  onClick={() => toggleSection('significance')}
                  className={`mt-1 flex items-center justify-center w-full py-1.5 px-2 text-sm ${sectionStyles.significance.btn} font-medium`}
                >
                  {expandedSections.significance ? 'Show less' : 'Show more'} 
                  <svg className={`w-4 h-4 ml-1 transition-transform ${expandedSections.significance ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              )}
            </div>
            
            {/* References Section - Always shown in full */}
            {references.length > 0 && (
              <div className="mb-5">
                <div className={`rounded-md overflow-hidden mb-2 shadow-sm border ${sectionStyles.references.border}`}>
                  <h4 className={`text-lg font-black font-serif ${sectionStyles.references.color} ${sectionStyles.references.bg} p-3 border-b-2 ${sectionStyles.references.border} flex items-center justify-between`}>
                    <div className="flex items-center">
                      <span className={`mr-2 ${sectionStyles.references.icon}`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </span>
                      Scholarly References 
                    </div>
                    <span className="text-xs font-normal bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {references.length} {references.length === 1 ? 'source' : 'sources'}
                    </span>
                  </h4>
                  <div className="py-2">
                    <ul className="divide-y divide-slate-100">
                      {references.map((ref) => (
                        <li key={ref.id} id={`reference-${ref.id}`} className="py-2 px-4 target:bg-blue-50 transition-colors">
                          <div className="flex items-start justify-between">
                            <p className="text-sm font-mono text-slate-700 leading-relaxed">
                              {ref.text}
                            </p>
                            <div className="ml-3 flex-shrink-0">
                              <button
                                onClick={() => addToLibrary(ref.id)}
                                disabled={ref.inLibrary}
                                className={`flex items-center text-xs px-2 py-1 rounded transition-colors ${
                                  ref.inLibrary
                                    ? 'bg-green-100 text-green-700 cursor-default'
                                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                }`}
                              >
                                {ref.inLibrary ? (
                                  <>
                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Added
                                  </>
                                ) : (
                                  <>
                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    Add to Library
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      }
      // Fall through to basic analysis if detailed analysis isn't available
      
    case 'analysis':
    default:
      // Always show basic/initial analysis for the 'analysis' panel
      return (
        <div>
          <div className="mb-5">
            <h3 className="text-lg font-medium text-slate-800 mb-3 pb-2 border-b border-slate-100">Summary</h3>
            <p className="text-slate-700">{initialAnalysis.summary}</p>
          </div>
          
          <div className="mb-5">
            <h3 className="text-lg font-medium text-slate-800 mb-3 pb-2 border-b border-slate-100">Preliminary Analysis</h3>
            <p className="text-slate-700">{initialAnalysis.analysis}</p>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-slate-800 mb-3 pb-2 border-b border-slate-100">Follow-up Questions</h3>
            <p className="text-sm text-slate-500 mb-3">
              Click a question to add it in the discussion:
            </p>
            <div className="space-y-2">
              {initialAnalysis.followupQuestions.map((question, idx) => (
                <div 
                  key={idx}
                  className={`p-3 border rounded-md cursor-pointer transition-colors ${
                    selectedQuestion === idx 
                      ? 'bg-indigo-50 border-indigo-300 shadow-sm' 
                      : 'hover:bg-slate-50 border-slate-200'
                  }`}
                  onClick={() => {
                    setSelectedQuestion(idx);
                    handleAskQuestion(question);
                  }}
                >
                  <p className="text-slate-700">{question}</p>
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
                                      