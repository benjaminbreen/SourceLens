// components/ui/WikipediaPanel.tsx
// Sliding panel that displays detailed Wikipedia information about a topic
// Integrates with custom LLM API for enhanced context

'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface SourceContext {
  date?: string;
  author?: string;
  title?: string;
  type?: string;
}

interface WikipediaPanelProps {
  title: string;
  onClose: () => void;
  sourceContext?: SourceContext;
  isLoading?: boolean;
}

export default function WikipediaPanel({ 
  title, 
  onClose,
  sourceContext = {},
  isLoading = false
}: WikipediaPanelProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [enhancedDescription, setEnhancedDescription] = useState<string | null>(null);
  const [llmLoading, setLlmLoading] = useState(false);
  const [llmError, setLlmError] = useState<string | null>(null);
  const [relatedTopics, setRelatedTopics] = useState<string[]>([]);
  const [contentType, setContentType] = useState<'author' | 'date' | 'general'>('general');
  const [relevantParagraph, setRelevantParagraph] = useState<string | null>(null);
  const [normalizedTitle, setNormalizedTitle] = useState<string>(title);
  const [displayTitle, setDisplayTitle] = useState<string>(title);
  const [fallbackAttempts, setFallbackAttempts] = useState<string[]>([]);
  
    const normalizeDateString = (dateStr: string): { 
  searchTitle: string, 
  fallbacks: string[], 
  isDate: boolean 
} => {
  console.log('Normalizing date string:', dateStr);

  // --- Normalize common issues in user input ---
  dateStr = dateStr
    .replace(/-0000\b/, ' BCE')                      // Handle malformed BCE indicator
    .replace(/\b0*(\d{1,4})/, '$1')                  // Strip leading zeroes
    .replace(/\s{2,}/g, ' ')                         // Normalize excessive whitespace
    .trim();

  // --- Patterns ---
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const monthPattern = new RegExp(`\\b(${monthNames.join('|')})\\b`, 'i');
  const dayPattern = /\b([0-9]{1,2})(st|nd|rd|th)?\b/;
  const circaPattern = /\b(circa|c\.|c|ca\.|ca|around|approximately|about)\b/i;

  const monthMatch = dateStr.match(monthPattern);
  const dayMatch = dateStr.match(dayPattern);
  const circaMatch = dateStr.match(circaPattern);

  // --- BCE/BC date handling ---
  const bcePattern = /\b(?:c\.?|ca\.?|circa|around|approximately)?\s*0*(\d{1,4})\s*(BCE|BC)\b/i;
  const bceMatch = dateStr.match(bcePattern);
  if (bceMatch) {
    const year = bceMatch[1].replace(/^0+/, '');
    const label = `${year}_BCE`;
    const fallbacks = [
      `${year}s_BCE`,
      `${Math.floor(parseInt(year) / 100) + 1}th_century_BCE`
    ];
    return {
      searchTitle: label,
      fallbacks,
      isDate: true
    };
  }

  // --- CE year detection ---
  const yearPattern = /\b(1[0-9]{3}|20[0-2][0-9])\b/; // 1000–2029
  const yearMatch = dateStr.match(yearPattern);
  if (yearMatch) {
    const year = yearMatch[1];
    const fallbacks: string[] = [];

    // Month and day handling
    if (monthMatch) {
      const month = monthMatch[1];
      if (dayMatch) {
        const day = dayMatch[1];
        fallbacks.push(`${month}_${day}`); // Most specific
      }
      fallbacks.push(`${month}_${year}`);
    }

    fallbacks.push(year);

    if (circaMatch) {
      const decade = `${year.substring(0, 3)}0s`;
      fallbacks.push(`${decade}_(decade)`);

      const centuryNum = Math.floor(parseInt(year) / 100) + 1;
      fallbacks.push(`${centuryNum}th_century`);
    }

    return {
      searchTitle: fallbacks[0],
      fallbacks: fallbacks.slice(1),
      isDate: true
    };
  }

  // --- Fallback for non-date strings ---
  return {
    searchTitle: dateStr,
    fallbacks: [],
    isDate: false
  };
};
  
  // Determine content type and normalize title
  useEffect(() => {
    if (!title) return;
    
    // First check if it might be a date
    const dateTest = /\b(1[0-9]{3}|20[0-2][0-9])\b|january|february|march|april|may|june|july|august|september|october|november|december/i;
    if (dateTest.test(title)) {
      setContentType('date');
      const { searchTitle, fallbacks, isDate } = normalizeDateString(title);
      setFallbackAttempts(fallbacks);
      setNormalizedTitle(searchTitle);
      setDisplayTitle(title); // Keep original for display
    } 
    // Check if it's likely an author name
    else if (title.match(/^[A-Z][a-z]+(\s+[A-Z][a-z]+)+$/)) {
      setContentType('author');
      setNormalizedTitle(title);
      setDisplayTitle(title);
    } 
    // Default handling
    else {
      setContentType('general');
      setNormalizedTitle(title);
      setDisplayTitle(title);
    }
    
    console.log('Content type determined:', { title, type: contentType, normalized: normalizedTitle });
  }, [title]);
  
  // Show animation on mount
  useEffect(() => {
    // Small delay for animation
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 10);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Fetch Wikipedia content
  useEffect(() => {
    let isMounted = true;
    let currentFallbackIndex = -1;
    
    async function fetchWikipediaContent(searchTitle: string) {
      if (!searchTitle || !isMounted) return;
      
      setLoading(true);
      setError(null);
      
      try {
        console.log('Fetching Wikipedia content for:', searchTitle);
        // Encode the title for URL
        const encodedTitle = encodeURIComponent(searchTitle);
        
        // Get extended data using REST API
        const summaryResponse = await fetch(
          `https://en.wikipedia.org/api/rest_v1/page/summary/${encodedTitle}`
        );
        
        if (!summaryResponse.ok) {
          console.log(`Failed to fetch Wikipedia content for ${searchTitle}, status: ${summaryResponse.status}`);
          
          // Try next fallback if available
          if (currentFallbackIndex < fallbackAttempts.length - 1) {
            currentFallbackIndex++;
            const nextFallback = fallbackAttempts[currentFallbackIndex];
            console.log(`Trying fallback #${currentFallbackIndex + 1}:`, nextFallback);
            fetchWikipediaContent(nextFallback);
            return;
          }
          
          // All fallbacks failed
          throw new Error('Failed to fetch Wikipedia content for all attempts');
        }
        
        const summaryData = await summaryResponse.json();
        if (isMounted) {
          setContent(summaryData);
          console.log('Received Wikipedia content:', summaryData);
          
          // For dates, also try to get more detailed information
          if (contentType === 'date') {
            try {
              // For year articles, try to get the second section which often has important events
              const parseResponse = await fetch(
                `https://en.wikipedia.org/w/api.php?action=parse&format=json&page=${encodedTitle}&prop=text&section=1&disabletoc=3&origin=*`
              );
              
              if (parseResponse.ok) {
                const parseData = await parseResponse.json();
                if (parseData.parse && parseData.parse.text) {
                  // Create a temporary element to parse the HTML
                  const tempDiv = document.createElement('div');
                  tempDiv.innerHTML = parseData.parse.text['*'];
                  
                  // Extract paragraphs and skip the first one (which is about the Gregorian calendar)
                  const paragraphs = tempDiv.querySelectorAll('p');
                  if (paragraphs.length > 1) {
                    setRelevantParagraph(paragraphs[1].textContent);
                  }
                }
              }
            } catch (parseError) {
              console.error('Error fetching detailed wiki content for date:', parseError);
              // Continue with basic summary
            }
          }
          
          // Also try to get related pages using MediaWiki API
          try {
            const relatedResponse = await fetch(
              `https://en.wikipedia.org/w/api.php?action=query&format=json&generator=links&titles=${encodedTitle}&prop=info&inprop=url&gpllimit=10&origin=*`
            );
            
            if (relatedResponse.ok) {
              const relatedData = await relatedResponse.json();
              if (relatedData.query && relatedData.query.pages) {
                const relatedPages = Object.values(relatedData.query.pages)
                  .map((page: any) => page.title)
                  .filter((title: string) => !title.includes(':')) // Filter out namespace pages
                  .slice(0, 8); // Limit to 8 related topics
                
                if (isMounted) {
                  setRelatedTopics(relatedPages);
                }
              }
            }
          } catch (relatedError) {
            console.error('Error fetching related pages:', relatedError);
            // Continue without related pages
          }
        }
      } catch (err) {
        console.error('Error fetching Wikipedia content:', err);
        if (isMounted) {
          // Don't show error if we're using fallbacks, only show if all fails
          if (currentFallbackIndex >= fallbackAttempts.length - 1 || fallbackAttempts.length === 0) {
            setError('Unable to load Wikipedia content for this topic.');
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          
          // Now fetch our enhanced description from our LLM API
          // Do this regardless of Wikipedia success/failure
          fetchEnhancedDescription(contentType);
        }
      }
    }
    
    // Start with the normalized title
    fetchWikipediaContent(normalizedTitle);
    
    return () => {
      isMounted = false;
    };
  }, [normalizedTitle, contentType, fallbackAttempts]);
  
  // Fetch enhanced description from our API
  const fetchEnhancedDescription = async (type: 'author' | 'date' | 'general') => {
    setLlmLoading(true);
    setLlmError(null); // Reset error state before making request
    
    try {
      console.log("Fetching enhanced description for:", { 
        title: sourceContext?.title || displayTitle,
        type, 
        sourceContext 
      });
      
      const response = await fetch('/api/generate-wiki-overview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: displayTitle, // Use display title, not normalized
          sourceContext,
          type
        }),
      });
      
      const data = await response.json();
      console.log("Received API response:", data);
      
      if (!response.ok || data.error) {
        throw new Error(data.message || `Failed to generate enhanced description: ${response.status}`);
      }
      
      if (!data.summary) {
        throw new Error('No summary was generated');
      }
      
      setEnhancedDescription(data.summary);
    } catch (err) {
      console.error('Error generating enhanced description:', err);
      // Set a specific error message instead of fallback content
      setLlmError(`Failed to generate AI summary: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLlmLoading(false);
    }
  };
  
  // Handle close with animation
  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };
  
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);
  
  // Get an emoji based on the content type
  const getEmoji = () => {
    switch (contentType) {
      case 'date': return '📅';
      case 'author': return '👤';
      default: return '📚';
    }
  };
  
  return (
    <div className={`fixed top-[0px] right-0 bottom-0 w-full sm:w-96 md:w-[450px] bg-slate-900/95 border-l border-slate-700 shadow-xl backdrop-blur-md z-[1000] transform transition-transform duration-300 ease-in-out ${
      isVisible ? 'translate-x-0' : 'translate-x-full'
    }`}
    style={{ height: 'calc(100vh - 0px)' }}
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-700 flex justify-between items-center sticky top-0 z-10 bg-slate-900/95 backdrop-blur-md">
        <h3 className="text-xl font-medium text-white flex items-center">
          <span className="text-2xl mr-3">{getEmoji()}</span>
          <span className="truncate">{displayTitle}</span>
        </h3>
        <button 
          onClick={handleClose}
          className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Close panel"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      {/* Content */}
      <div className="p-4 overflow-auto max-h-[calc(100vh-124px)]">
        {loading && !enhancedDescription ? (
          <div className="flex flex-col items-center justify-center py-12">
            <svg className="animate-spin h-8 w-8 text-indigo-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-35" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-slate-400">Loading content...</p>
          </div>
        ) : (
          <>
            {/* LLM-generated enhanced description - shown regardless of Wikipedia success */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-slate-300">
                  {contentType === 'date' ? 'Historical Context' : 
                   contentType === 'author' ? 'Author Overview' : 'Overview'}
                </h4>
                {llmLoading && (
                  <span className="text-xs text-slate-400 flex items-center">
                    <svg className="animate-spin h-3 w-3 mr-1 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                  </span>
                )}
              </div>
           <div className="bg-indigo-900/30 border border-indigo-700/30 rounded-lg p-4 text-indigo-100 text-sm leading-relaxed">
             {llmLoading ? (
               <p className="text-indigo-300/70 italic">Generating AI summary...</p>
             ) : llmError ? (
               <div className="text-rose-300">
                 <p className="font-medium mb-1">AI Summary Error</p>
                 <p className="text-xs">{llmError}</p>
               </div>
             ) : (
              <p>{(enhancedDescription || "No AI summary available.").replace(/\blikely\b/gi, '')}</p>
             )}
           </div>
            </div>
            
            {/* Wikipedia thumbnail if available */}
            {content?.thumbnail && (
              <div className="mb-4">
                <div className="relative w-full h-88 bg-slate-800 rounded-lg overflow-hidden">
                  <Image 
                    src={content.thumbnail.source} 
                    alt={displayTitle}
                    fill
                    className="object-cover"
                    sizes="(max-width: 450px) 100vw, 450px"
                  />
                </div>
                {content.description && (
                  <p className="text-xs text-slate-400 mt-1 text-center italic">{content.description}</p>
                )}
              </div>
            )}
            
            {/* Wikipedia content */}
            {contentType === 'date' && relevantParagraph ? (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-slate-300 mb-2">Events in {displayTitle}</h4>
                <div className="bg-slate-800/50 p-4 rounded-md text-sm text-slate-300 leading-relaxed">
                  <p>{relevantParagraph}</p>
                </div>
              </div>
            ) : content?.extract ? (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-slate-300 mb-2">From Wikipedia</h4>
                <div className="bg-slate-800/50 p-4 rounded-md text-sm text-slate-300 leading-relaxed">
                  <p>{content.extract}</p>
                </div>
              </div>
            ) : !loading && error ? (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-slate-300 mb-2">Wikipedia Information</h4>
                <div className="bg-slate-800/30 border border-slate-700/50 p-4 rounded-md text-sm text-slate-400 leading-relaxed">
                  <p className="italic">No Wikipedia article found for this topic.</p>
                </div>
              </div>
            ) : null}
            
            {/* External Link - only show if we found a Wikipedia page */}
            {content?.content_urls?.desktop?.page && (
              <div className="mb-6">
                <a
                  href={content.content_urls.desktop.page}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-3 bg-slate-800/70 hover:bg-slate-800 transition-colors rounded-md text-indigo-300 hover:text-indigo-200"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  <span className="text-sm">Open Full Wikipedia Page</span>
                </a>
              </div>
            )}
            
            {/* Related pages */}
            {relatedTopics.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-slate-300 mb-2">Related Topics</h4>
                <div className="bg-slate-800/50 p-4 rounded-md">
                  <div className="flex flex-wrap gap-2">
                    {relatedTopics.map((topic, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          // Close current panel and open new one with this topic
                          handleClose();
                          setTimeout(() => {
                            // Trigger event to open new panel
                            window.dispatchEvent(new CustomEvent('openWikipediaPanel', { 
                              detail: { title: topic } 
                            }));
                          }, 300);
                        }}
                        className="bg-slate-700/50 hover:bg-slate-700 px-3 py-1 rounded-full text-xs text-slate-300 hover:text-white transition-colors"
                      >
                        {topic}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}