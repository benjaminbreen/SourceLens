// components/references/ReferencesDisplay.tsx
// Component for displaying AI-suggested scholarly references for a primary source
// Features color-coded reference types, sortable list, and expandable details with source quotes

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAppStore, Reference as StoreReference } from '@/lib/store';
import LLMTransparency from '../ui/LLMTransparency';
import ReactMarkdown from 'react-markdown';
import { COMPONENT_DEFAULT_MODELS, DEFAULT_MODEL_ID } from '@/lib/models';

// Reference interface matching API return type
interface ReferenceItem {
  citation: string;
  url: string;
  type: 'book' | 'journal' | 'website' | 'other';
  relevance: string;
  reliability?: string; // Added reliability field as optional for backward compatibility
  sourceQuote: string;
  importance: number; // 1-5 ranking
}

// Available citation styles
type CitationStyle = 'chicago' | 'apa' | 'mla';

export default function ReferencesDisplay() {
  const { 
    sourceContent,
    metadata,
    isLoading,
    setLoading,
    perspective,
    llmModel,
    rawPrompt,
    rawResponse,
    setRawPrompt,
    setRawResponse,
    setLLMModel
  } = useAppStore();
  
  // Local state - using the StoreReference type from the store
  const [references, setReferences] = useState<StoreReference[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'importance' | 'date' | 'alphabetical'>('importance');
  const [citationStyle, setCitationStyle] = useState<CitationStyle>('chicago');
  const [styledReferences, setStyledReferences] = useState<StoreReference[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);
  const [modelUsed, setModelUsed] = useState<string | null>(null);
  const [loadingStatus, setLoadingStatus] = useState<string>('');
  const [generationProgress, setGenerationProgress] = useState<number>(0);

  // Use refs to prevent infinite loops
  const hasSetModelRef = useRef(false);
  const hasGeneratedRef = useRef(false);
  const sortedRefsRef = useRef(false);

  // Set preferred model for references on component mount (only once)
  useEffect(() => {
    if (!hasSetModelRef.current && (!llmModel || llmModel === DEFAULT_MODEL_ID)) {
      console.log("Setting references-specific model:", COMPONENT_DEFAULT_MODELS?.['references'] || 'claude-sonnet');
      setLLMModel(COMPONENT_DEFAULT_MODELS?.['references'] || 'claude-sonnet');
      hasSetModelRef.current = true;
    }
  }, [llmModel, setLLMModel]);

  // Generate references on component mount (only once)
  useEffect(() => {
    if (sourceContent && metadata && !isGenerating && !hasGeneratedRef.current) {
      hasGeneratedRef.current = true;
      generateReferences();
    }
  }, [sourceContent, metadata, isGenerating]);
  
  // Regenerate styled references when citation style changes
  useEffect(() => {
    if (references.length > 0 && citationStyle !== 'chicago') {
      convertCitationStyle();
    } else {
      setStyledReferences(references);
    }
  }, [references, citationStyle]);
  
  // Sort references when sort method changes
  useEffect(() => {
    if (styledReferences.length > 0) {
      const refsToSort = [...styledReferences];
      let sorted;
      
      switch (sortBy) {
        case 'importance':
          sorted = [...refsToSort].sort((a, b) => b.importance - a.importance);
          break;
        case 'alphabetical':
          sorted = [...refsToSort].sort((a, b) => {
            // Extract author's last name or first word
            const getFirstWord = (text: string) => text.split(',')[0].trim().toLowerCase();
            return getFirstWord(a.citation).localeCompare(getFirstWord(b.citation));
          });
          break;
        case 'date':
          sorted = [...refsToSort].sort((a, b) => {
            // Extract year from citation
            const yearPattern = /\b(19|20)\d{2}\b/;
            const yearA = a.citation.match(yearPattern);
            const yearB = b.citation.match(yearPattern);
            
            if (!yearA && !yearB) return 0;
            if (!yearA) return 1;
            if (!yearB) return -1;
            
            return parseInt(yearB[0]) - parseInt(yearA[0]);
          });
          break;
        default:
          sorted = refsToSort;
      }
      
      // Check if the array has actually changed to prevent unnecessary re-renders
      if (JSON.stringify(sorted) !== JSON.stringify(styledReferences)) {
        setStyledReferences(sorted);
      }
    }
  }, [sortBy, references.length]);
  
  // Simulated progress for generating references
  useEffect(() => {
    let progressInterval: NodeJS.Timeout;
    
    if (isGenerating) {
      setGenerationProgress(0);
      progressInterval = setInterval(() => {
        setGenerationProgress(prev => {
          // Slow down progress as we get closer to 100%
          const increment = prev < 30 ? 5 : prev < 60 ? 3 : prev < 85 ? 1 : 0.5;
          const newProgress = Math.min(prev + increment, 95);
          
          // Update loading status based on progress
          if (newProgress > 90 && loadingStatus !== 'Formatting references...') {
            setLoadingStatus('Formatting references...');
          } else if (newProgress > 70 && loadingStatus !== 'Processing scholarly sources...') {
            setLoadingStatus('Processing scholarly sources...');
          } else if (newProgress > 40 && loadingStatus !== 'Analyzing source relevance...') {
            setLoadingStatus('Analyzing source relevance...');
          } else if (newProgress > 10 && loadingStatus !== 'Thinking it through...') {
            setLoadingStatus('Exploring vector space...');
          }
          
          return newProgress;
        });
      }, 500);
    } else {
      setGenerationProgress(isGenerating ? 0 : 100);
    }
    
    return () => clearInterval(progressInterval);
  }, [isGenerating]);
  
  // Generate references using the API
  const generateReferences = async () => {
    if (!sourceContent || !metadata) return;
    
    setIsGenerating(true);
    setLoading(true);
    setLoadingStatus('Preparing references request...');
    
    try {
      setLoadingStatus('Generating scholarly references...');
      
      const response = await fetch('/api/suggested-references', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source: sourceContent,
          metadata: metadata,
          perspective: perspective,
          modelId: 'claude-sonnet' // Always use Claude Sonnet for references
        }),
      });
      
      setLoadingStatus('Processing references data...');
      
      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
      }
      
      const data = await response.json();
      
      // Set model used
      if (data.modelUsed) {
        setModelUsed(data.modelUsed);
      }
      
      // Set references
      setLoadingStatus('Preparing references display...');
      
      // Add reliability field if missing
      const refsWithReliability = (data.references || []).map((ref: any) => ({
        ...ref,
        reliability: ref.reliability || 'Reliability assessment not available for this source.'
      }));
      
      setReferences(refsWithReliability);
      setStyledReferences(refsWithReliability);
      
      // Set raw data for transparency
      setRawPrompt(data.rawPrompt);
      setRawResponse(data.rawResponse);
      
    } catch (error) {
      console.error("References generation error:", error);
      // Show error in UI with fallback references with explicit typing
      const fallbackRef: StoreReference[] = [{
        citation: "Error generating references. Please try again.",
        url: "#",
        type: "other" as const, // Using a literal type
        relevance: "An error occurred while trying to generate references.",
        reliability: "Unable to assess reliability due to generation error.",
        sourceQuote: "N/A",
        importance: 3
      }];
      setReferences(fallbackRef);
      setStyledReferences(fallbackRef);
    } finally {
      // Delay completion slightly for a smoother UX
      setTimeout(() => {
        setLoading(false);
        setIsGenerating(false);
        setLoadingStatus('');
      }, 500);
    }
  };

  // Convert citations to the selected style
  const convertCitationStyle = async () => {
    if (references.length === 0 || citationStyle === 'chicago') return;
    
    setLoading(true);
    
    try {
      // Use LLM to convert citation styles
      const prompt = `Convert the following ${references.length} Chicago style citations to ${citationStyle.toUpperCase()} format. Return ONLY a valid JSON array of the converted citations in the same order, with the same data structure but updated citation field.
      
Original citations in Chicago style:
${JSON.stringify(references, null, 2)}

Return the same structure with updated citation field in ${citationStyle.toUpperCase()} style. Maintain the exact same structure and all other fields.`;

      // Simplified mock conversion for demo - in production, call the API
      // This would be replaced with a real API call
      
      setLoading(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create a deep copy and modify
      const converted = JSON.parse(JSON.stringify(references));
      
      // Apply simple modifications to simulate style changes
      converted.forEach((ref: StoreReference) => {
        if (citationStyle === 'apa') {
          // Very simplistic APA conversion simulation
          ref.citation = ref.citation.replace(/\./g, '') // Remove periods
            .replace(/,([^,]*)$/, ' ($1)') // Last comma becomes parentheses for year
            .replace(/"/g, ''); // Remove quotes around titles
        } else if (citationStyle === 'mla') {
          // Very simplistic MLA conversion simulation
          ref.citation = ref.citation.replace(/\./g, '') // Remove periods
            .replace(/\([^)]*\)/g, '') // Remove parenthetical information
            .replace(/"/g, '"') // Change quotes to straight quotes
            .trim();
        }
      });
      
      setStyledReferences(converted);
      
    } catch (error) {
      console.error("Citation conversion error:", error);
    } finally {
      setLoading(false);
    }
  };
  
  // Process citation text to convert asterisks to proper markdown for italics
  const processCitation = (citation: string = '') => {
    // Convert *Book Title* to _Book Title_ for proper markdown italics
    // and ensure quotation marks are properly displayed
    return citation
      .replace(/\*(.*?)\*/g, "_$1_")
      .replace(/"/g, '"')
      .replace(/"/g, '"');
  };
  
  // Copy citation to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        // Show success message
        setCopyMessage("Citation copied!");
        setTimeout(() => setCopyMessage(null), 2000);
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
        setCopyMessage("Failed to copy");
        setTimeout(() => setCopyMessage(null), 2000);
      });
  };
  
  // Get color for reference type
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'book':
        return 'bg-indigo-500';
      case 'journal':
        return 'bg-amber-500';
      case 'website':
        return 'bg-emerald-500';
      case 'other':
      default:
        return 'bg-slate-500';
    }
  };
  
  // Get more readable display name for reference type
  const getTypeName = (type: string) => {
    switch (type) {
      case 'book': return 'Book';
      case 'journal': return 'Journal Article';
      case 'website': return 'Website';
      case 'other': return 'Other Source';
      default: return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  // Get URL description
  const getUrlDescription = (url: string) => {
    if (url.includes('scholar.google.com')) {
      return 'Search on Google Scholar';
    } else if (url.includes('books.google.com')) {
      return 'View on Google Books';
    } else if (url.includes('doi.org')) {
      return 'Access via DOI';
    } else if (url.includes('jstor.org')) {
      return 'View on JSTOR';
    } else {
      return 'View Source';
    }
  };

  if (isLoading && references.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <div className="w-14 h-14 rounded-full border-4 border-amber-200 border-t-amber-700 animate-spin mb-4"></div>
        <p className="text-lg text-slate-700">Searching for scholarly references...</p>
        {loadingStatus && (
          <p className="text-sm text-slate-500 mt-2">
            {loadingStatus}
          </p>
        )}
        {isGenerating && (
          <div className="w-64 bg-slate-200 rounded-full h-2 mt-4">
            <div 
              className="bg-amber-500 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${generationProgress}%` }}
            ></div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header with controls */}
      <div className="bg-white border-b border-slate-200 p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
          <h2 className="text-xl font-medium text-slate-800 flex items-center">
            <svg className="w-6 h-6 mr-2 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Suggested References
          </h2>
          
          <div className="flex gap-2">
            {/* Style dropdown */}
            <div className="relative">
              <select
                value={citationStyle}
                onChange={(e) => setCitationStyle(e.target.value as CitationStyle)}
                className="bg-white border border-slate-300 text-slate-700 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block w-full p-2"
              >
                <option value="chicago">Chicago Style</option>
                <option value="apa">APA Style</option>
                <option value="mla">MLA Style</option>
              </select>
            </div>
            
            {/* Sort dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'importance' | 'date' | 'alphabetical')}
                className="bg-white border border-slate-300 text-slate-700 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block w-full p-2"
              >
                <option value="importance">By Importance</option>
                <option value="date">By Date</option>
                <option value="alphabetical">Alphabetical</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Legend */}
        <div className="flex flex-wrap gap-3 pb-2">
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-indigo-500 mr-1"></span>
            <span className="text-xs text-slate-600">Book</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-amber-500 mr-1"></span>
            <span className="text-xs text-slate-600">Journal Article</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-emerald-500 mr-1"></span>
            <span className="text-xs text-slate-600">Website</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-slate-500 mr-1"></span>
            <span className="text-xs text-slate-600">Other</span>
          </div>
        </div>
        
        {/* Model used info */}
        {modelUsed && (
          <div className="text-xs text-slate-500 mt-1">
            Model used: <span className="font-medium">{modelUsed}</span>
          </div>
        )}
      </div>

      {/* Copy notification */}
      {copyMessage && (
        <div className="fixed top-16 right-4 bg-slate-800 text-white px-4 py-2 rounded-md shadow-lg z-50 animate-fade-in-out">
          {copyMessage}
        </div>
      )}

      {/* References list */}
      <div className="flex-1 overflow-y-auto bg-slate-50 p-4">
        {styledReferences.length > 0 ? (
          <ul className="space-y-3">
            {styledReferences.map((reference, index) => (
              <li 
                key={index}
                className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden"
              >
                <div 
                  className="p-4 cursor-pointer"
                  onClick={() => setExpandedId(expandedId === index ? null : index)}
                >
                  <div className="flex items-start">
                    {/* Type indicator */}
                    <div className="mr-3 mt-1.5">
                      <span 
                        className={`inline-block w-3 h-3 rounded-full ${getTypeColor(reference.type)}`}
                        title={getTypeName(reference.type)}
                      ></span>
                    </div>
                    
                    {/* Citation text - using ReactMarkdown for proper formatting */}
                    <div className="flex-1 text-slate-800">
                      <div className="text-sm prose prose-slate max-w-none">
                        <ReactMarkdown>{processCitation(reference.citation)}</ReactMarkdown>
                      </div>
                      
                      {/* Importance indicator (small stars) */}
                      <div className="flex mt-1">
                        {[...Array(5)].map((_, i) => (
                          <svg 
                            key={i} 
                            className={`w-3 h-3 ${
                              i < reference.importance ? 'text-amber-500' : 'text-slate-200'
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                    
                 <div className="flex items-center ml-2 space-x-2">
                   <button
                     onClick={(e) => {
                       e.stopPropagation();
                       copyToClipboard(reference.citation);
                     }}
                     className="p-1.5 text-amber-600 hover:text-amber-800 rounded-full hover:bg-amber-50 transition-colors"
                     title="Copy citation"
                   >
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                     </svg>
                   </button>
                   
                   {/* Google Scholar search button */}
                  <a
  href={reference.url}
  target="_blank"
  rel="noopener noreferrer"
  className="p-1.5 text-indigo-600 hover:text-indigo-800 rounded-full hover:bg-indigo-50 transition-colors"
  title="Search on Google Scholar"
  onClick={(e) => e.stopPropagation()}
>
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
</a>
                   
                   <button
                     className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50 transition-colors"
                     title={expandedId === index ? "Collapse" : "Expand"}
                   >
                     <svg 
                       className={`w-5 h-5 transition-transform ${
                         expandedId === index ? 'rotate-180' : ''
                       }`}
                       fill="none" 
                       stroke="currentColor" 
                       viewBox="0 0 24 24"
                     >
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                     </svg>
                   </button>
 
                     
                    </div>
                  </div>
                </div>
                
                {/* Expanded content */}
                {expandedId === index && (
                  <div className="px-4 pb-4 pt-0">
                    <div className="mt-1 pl-6 border-l-2 border-slate-200">
                      {/* Reference type */}
                      <div className="mb-3">
                        <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full text-white ${getTypeColor(reference.type)}`}>
                          {getTypeName(reference.type)}
                        </span>
                      </div>
                      
                      {/* Relevance */}
                      <div className="mb-3">
                        <h4 className="text-xs font-medium text-slate-500 mb-1">WHY THIS IS RELEVANT:</h4>
                        <div className="text-sm text-slate-700 prose prose-sm max-w-none">
                          <ReactMarkdown>{processCitation(reference.relevance)}</ReactMarkdown>
                        </div>
                      </div>
                      
                      {/* Reliability - New section */}
                      <div className="mb-3">
                        <h4 className="text-xs font-medium text-slate-500 mb-1">SOURCE RELIABILITY:</h4>
                        <div className="text-sm text-slate-700 prose prose-sm max-w-none bg-slate-50 p-2 rounded">
                          <ReactMarkdown>{processCitation(reference.reliability || 'Reliability assessment not available for this source.')}</ReactMarkdown>
                        </div>
                      </div>
                      
                      {/* Source quote */}
                      <div>
                        <h4 className="text-xs font-medium text-slate-500 mb-1">RELATED PASSAGE IN SOURCE:</h4>
                        <blockquote className="text-sm italic border-l-4 border-amber-300 pl-3 py-1 bg-amber-50 text-slate-700">
                          "{reference.sourceQuote}"
                        </blockquote>
                      </div>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        ) : isGenerating ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-14 h-14 rounded-full border-4 border-amber-200 border-t-amber-700 animate-spin mb-4"></div>
            <p className="text-lg text-slate-700">Generating references...</p>
            {loadingStatus && (
              <p className="text-sm text-slate-500 mt-2">
                {loadingStatus}
              </p>
            )}
            <div className="w-64 bg-slate-200 rounded-full h-2 mt-4">
              <div 
                className="bg-amber-500 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${generationProgress}%` }}
              ></div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <svg className="w-16 h-16 text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <p className="text-slate-500">No references found</p>
            <button 
              onClick={generateReferences}
              className="mt-4 px-4 py-2 bg-amber-700 text-white rounded-md hover:bg-amber-800 transition-colors"
            >
              Generate References
            </button>
          </div>
        )}
      </div>
      
      {/* Transparency section */}
      <div className="border-t border-slate-200 p-4 bg-white">
        <LLMTransparency rawPrompt={rawPrompt} rawResponse={rawResponse} />
      </div>
    </div>
  );
}