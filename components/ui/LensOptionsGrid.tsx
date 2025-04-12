// components/ui/LensOptionsGrid.tsx
// Enhanced lens selection grid with elegant typography, subtle color coding,
// and contextual suggestions based on the document type being analyzed.

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAppStore } from '@/lib/store';

// Define the lens option type for clarity
type LensOption = {
  id: string;
  label: string;
  description: string;
  imageSrc: string;
  color: string;
  isNew?: boolean;
};

function LensOptionsGrid({ 
  onSelectLens, 
  disabled = false,
  className = "",
  detailsOnLeft = true // Toggle to control detail panel position
}: { 
  onSelectLens: (id: string) => void;
  disabled?: boolean;
  className?: string;
  detailsOnLeft?: boolean;
}) {
  const [hoveredLens, setHoveredLens] = useState<string | null>(null);
  const [windowWidth, setWindowWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 0);
  const { metadata } = useAppStore();
  
  // Update window width on resize
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const isMobile = windowWidth < 768;

  // Lens options with image paths and metadata
  const lensOptions: LensOption[] = [
    { 
      id: 'detailed-analysis', 
      label: 'Detailed Analysis', 
      description: 'Comprehensive close reading of a source from multiple angles', 
      imageSrc: '/lenses/detailed.png',
      color: 'blue' 
    },
    { 
      id: 'extract-info', 
      label: 'Extract Info', 
      description: 'Pull structured data to display as tables or save as .csv', 
      imageSrc: '/lenses/extract.png',
      color: 'emerald' 
    },
    { 
      id: 'references', 
      label: 'Find References', 
      description: 'Discover and save citations related to a source', 
      imageSrc: '/lenses/references.png',
      color: 'amber'
    },
    { 
      id: 'translate', 
      label: 'Translate', 
      description: 'Control the tone, length, and poetic license of translations', 
      imageSrc: '/lenses/translate.png',
      color: 'cyan',

    },
    { 
      id: 'roleplay', 
      label: 'Simulation Mode', 
      description: 'Summon a confused simulacrum of the author', 
      imageSrc: '/lenses/simulate.png',
      color: 'sky' 
    },
    { 
      id: 'connections', 
      label: 'Find Connections', 
      description: 'Discover related concepts through network analysis', 
      imageSrc: '/lenses/connections.png',
      color: 'rose',
      isNew: true 
    },
    { 
      id: 'counter', 
      label: 'Counter-Narrative', 
      description: 'Read against the grain', 
      imageSrc: '/lenses/counter.png',
      color: 'purple' 
    },
    { 
      id: 'highlight', 
      label: 'Highlight Text', 
      description: 'Find key passages via flexible, intuitive queries', 
      imageSrc: '/lenses/highlight.png',
      color: 'yellow' 
    }
  ];
  
  // Get color classes for arrows based on lens color
  const getArrowColor = (color: string): string => {
    switch(color) {
      case 'blue': return 'text-blue-500';
      case 'emerald': return 'text-emerald-500';
      case 'amber': return 'text-amber-500';
      case 'cyan': return 'text-cyan-500';
      case 'sky': return 'text-sky-500';
      case 'purple': return 'text-purple-500';
      case 'yellow': return 'text-yellow-500';
      case 'rose': return 'text-rose-500';
      default: return 'text-slate-500';
    }
  };

  // Get color classes for the color indicator dot in the detail panel
  const getColorDot = (color: string): string => {
    switch(color) {
      case 'blue': return 'bg-blue-500';
      case 'emerald': return 'bg-emerald-500';
      case 'amber': return 'bg-amber-500';
      case 'cyan': return 'bg-cyan-500';
      case 'sky': return 'bg-sky-500';
      case 'purple': return 'bg-purple-500';
      case 'yellow': return 'bg-yellow-500';
      case 'rose': return 'bg-rose-500';
      default: return 'bg-slate-500';
    }
  };

  // Get document type text for "Try it on your [documentType]" feature
  const getDocumentTypeText = () => {
    if (!metadata) return 'document';
    
    if (metadata.documentType) {
      return metadata.documentType.toLowerCase();
    } else if (metadata.genre) {
      return metadata.genre.toLowerCase();
    } else {
      return 'source';
    }
  };
  
  // Enhanced lens description content
  const getLensDetailContent = (lensId: string) => {
    switch(lensId) {
      case 'detailed-analysis':
        return {
          title: "Detailed Analysis",
          description: "Comprehensive close reading of text",
          detail: "Performs a thorough examination of the source, analyzing structure, themes, tone, and context. Ideal for literary analysis, historical documents, and academic texts.",
          useCases: ["Literary criticism", "Academic papers", "Historical documents", "Legal interpretation"],
          tips: "Best for complex texts requiring interpretive understanding. Provides insights into both explicit and implicit meanings."
        };
      case 'extract-info':
        return {
          title: "Extract Info",
          description: "Pull structured data from the text",
          detail: "Identifies and extracts specific information patterns, creating structured data from unstructured text. Perfect for analyzing and organizing key details.",
          useCases: ["Entity extraction", "Scientific texts", "Financial documents", "Technical manuals"],
          tips: "Specify exactly what information patterns you're looking for to get the most relevant results."
        };
      case 'references':
        return {
          title: "Find References",
          description: "Discover sources and citations",
          detail: "Identifies citations, references, and sources mentioned within the text. Maps connections to other works and contextualizes them.",
          useCases: ["Academic research", "Literature reviews", "Bibliographic analysis", "Source verification"],
          tips: "Great for understanding the intellectual foundations of a text and building a research bibliography."
        };
      case 'translate':
        return {
          title: "Translate",
          description: "Convert text to another language",
          detail: "Translates the source content while preserving meaning, context, and nuance. Supports a wide range of languages with sensitivity to cultural context.",
          useCases: ["Cross-cultural research", "Comparative analysis", "Multilingual projects"],
          tips: "Can include cultural and contextual notes to enhance understanding of translated content."
        };
      case 'roleplay':
        return {
          title: "Simulation Mode",
          description: "Interact with the author",
          detail: "Enables a simulated dialogue with the document's author or narrator, allowing you to explore perspectives, clarify points, and deepen understanding.",
          useCases: ["Historical perspective taking", "Author interviews", "Character studies", "Primary source exploration"],
          tips: "Ask open-ended questions and explore hypotheticals to get the most insightful responses."
        };
      case 'connections':
        return {
          title: "Find Connections",
          description: "Discover related concepts",
          detail: "Maps relationships between concepts, identifies patterns, and surfaces interconnections within the text. Shows how ideas influence and relate to each other.",
          useCases: ["Concept mapping", "Interdisciplinary research", "Network analysis", "Thematic exploration"],
          tips: "Particularly useful for complex texts with multiple interrelated themes or concepts."
        };
      case 'counter':
        return {
          title: "Counter-Narrative",
          description: "Read against the grain",
          detail: "Analyzes the text from alternative perspectives, challenging assumptions and revealing overlooked aspects. Explores what's unsaid and considers marginalized viewpoints.",
          useCases: ["Critical theory", "Alternative histories", "Power structure examination"],
          tips: "Specify particular counter-perspectives to explore or let the lens identify significant alternatives."
        };
      case 'highlight':
        return {
          title: "Highlight Text",
          description: "Find key passages and themes",
          detail: "Identifies and emphasizes the most significant passages, arguments, or themes in the text. Creates a map of important points for further analysis.",
          useCases: ["Parsing complex documents", "Isolating names or concepts", "Surfacing hidden patterns"],
          tips: "You can specify particular themes or topics to highlight, or discover the most prominent elements."
        };
      default:
        return {
          title: "Select a lens",
          description: "Choose an analysis approach",
          detail: "Each lens offers a different way to examine and understand your source material.",
          useCases: ["Research", "Analysis", "Understanding", "Exploration"],
          tips: "Hover over a lens to learn more about it."
        };
    }
  };
  
  return (
    <div className={`grid grid-cols-12 gap-6 mb-12 ${className}`}>
      {/* Header & Detail Panel Column */}
      {!isMobile && detailsOnLeft && (
        <div className="col-span-3 mr-5">
          {/* Header with number */}
          <div className="mb-5 flex items-center">
            <span className="flex items-center justify-center w-8 h-8 bg-white border border-indigo-400 text-slate-900 rounded-full text-lg font-bold mr-2.5">
              4
            </span>
            <h2 className="text-lg font-bold text-slate-800">
              Analysis Lenses
            </h2>
          </div>
          
          {/* One-sentence description in Swiss minimalist style */}
         <div className="mb-6">
           <p className="font-sans text-sm tracking-wide text-slate-700 leading-6 max-w-md">
             Choose between <span className="font-semibold text-slate-800">eight specialized analytical tools</span> to reveal different dimensions of your source.
           </p>
         </div>


        
          
          {/* Detail panel that animates in */}
          <div className="bg-white border border-slate-200 rounded-md p-4 shadow-sm">
            {hoveredLens ? (
              <div className="animate-fade-in-slide-up">
                {lensOptions.map(lens => 
                  lens.id === hoveredLens && (
                    <div key={`detail-${lens.id}`}>
                      <div className="mb-3 pb-2 border-b border-slate-100">
                        <div className="flex items-center mb-1">
                          {/* Color dot indicator */}
                          <div className={`w-2.5 h-2.5 rounded-full ${getColorDot(lens.color)} mr-2`}></div>
                          <h3 className="text-lg font-medium text-slate-800">{getLensDetailContent(lens.id).title}</h3>
                          {lens.isNew && (
                            <span className="ml-2 px-1.5 py-0.5 text-xs bg-amber-100 text-amber-800 rounded-sm">
                              New
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-500 italic">{getLensDetailContent(lens.id).description}</p>
                      </div>
                      
                      <div className="mb-3">
                        <p className="text-sm text-slate-700 leading-relaxed">
                          {getLensDetailContent(lens.id).detail}
                        </p>
                      </div>
                      
                      <div className="mb-3">
                        <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">USE CASES</h4>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {getLensDetailContent(lens.id).useCases.map((useCase, i) => (
                            <span 
                              key={i}
                              className="inline-block px-2 py-1 text-xs bg-slate-100 text-slate-700 rounded-md"
                            >
                              {useCase}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">TIP</h4>
                        <p className="text-xs text-slate-600 italic leading-relaxed">
                          {getLensDetailContent(lens.id).tips}
                        </p>
                      </div>
                    </div>
                  )
                )}
              </div>
            ) : (
              <div className="text-center py-8 px-2">
                <p className="text-sm text-slate-400 italic">
                  Hover over a lens to see details
                </p>
                <svg className="w-16 h-16 mx-auto mt-4 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122">
                  </path>
                </svg>
              </div>
            )}
          </div>
        </div>
      )}

      
      {/* Main lens options grid (3 columns when detail panel is shown) */}
      <div className={`${isMobile ? 'col-span-12' : (detailsOnLeft || !detailsOnLeft ? 'col-span-9' : 'col-span-12')}`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {lensOptions.map((lens) => {
            const isHovered = hoveredLens === lens.id;
            const arrowColor = getArrowColor(lens.color);
            
            return (
              <button
                key={lens.id}
                onClick={() => onSelectLens(lens.id)}
                disabled={disabled}
                onMouseEnter={() => setHoveredLens(lens.id)}
                onMouseLeave={() => setHoveredLens(null)}
                onTouchStart={() => setHoveredLens(lens.id === hoveredLens ? null : lens.id)}
                className={`
                  group relative rounded-md overflow-hidden border border-slate-300 
                  transition-all duration-300 flex flex-col h-full
                  ${!disabled 
                    ? `hover:shadow-md hover:border-slate-300  ${isHovered ? 'shadow-md border-slate-300 bg-slate-50' : 'bg-white'}`
                    : 'bg-slate-50 opacity-60 cursor-not-allowed'}
                `}
                aria-label={`Analyze using ${lens.label}`}
              >
                {/* Image container */}
                <div className="aspect-square w-full relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center bg-slate-50 justify-center p-6 ">
                    <Image 
                      src={lens.imageSrc}
                      alt={`${lens.label} illustration`}
                      width={160}
                      height={160}
                      className={`
                        w-full h-full object-contain transition-transform duration-300
                        ${!disabled ? `group-hover:scale-[1.1]   ${isHovered ? 'scale-[1.1] ' : ''}` : 'opacity-70'}
                      `}
                    />
                  </div>
                  
                  {/* "New" badge - positioned on top of image */}
                  {lens.isNew && (
                    <span className="absolute top-2 right-2 inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-medium bg-amber-100 text-amber-800">
                      New
                    </span>
                  )}
                </div>
                
                {/* Content section */}
                <div className="p-4 flex flex-col flex-grow border-t border-slate-100">
                  <h3 className={`text-base font-medium ${!disabled ? 'text-slate-800' : 'text-slate-500'}`}>
                    {lens.label}
                  </h3>
                  <p className={`text-xs ${!disabled ? 'text-slate-600' : 'text-slate-400'} mt-1`}>
                    {lens.description}
                  </p>
                  
                  {/* Footer with arrow and "Try it on" text */}
                  <div className="mt-auto pt-3 -mb-1 flex items-right">
                    {/* Color-coded arrow that appears on hover */}
                    <div className={`
                      transition-opacity duration-300 ${arrowColor}
                      ${isHovered ? 'opacity-100' : 'opacity-0'}
                    `}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </div>
                    
                 
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Header & Detail Panel Column on the right side */}
      {!isMobile && !detailsOnLeft && (
        <div className="col-span-3">
          {/* Header with number */}
          <div className="mb-5 flex items-center">
            <span className="flex items-center justify-center w-8 h-8 bg-white border border-indigo-400 text-slate-900 rounded-full text-lg font-bold mr-2.5">
              4
            </span>
            <h2 className="text-lg font-bold text-slate-800">
              Analysis Lenses
            </h2>
          </div>
          
          {/* One-sentence description in Swiss minimalist style */}
          <div className="mb-4">
            <p className="font-sans text-sm tracking-wide text-slate-700 leading-6 max-w-md">
              SourceLens provides specialized analytical tools that reveal different dimensions of your text through multiple interpretive perspectives.
            </p>
          </div>

          {/* Stylish lens list in Swiss design */}
          <div className="mb-6 border-l-2 border-slate-200 pl-4 space-y-2.5">
            {lensOptions.map(lens => (
              <div key={lens.id} className="font-sans">
                <p className={`text-xs uppercase tracking-wider font-medium ${lens.id === hoveredLens ? getArrowColor(lens.color) : 'text-slate-500'}`}>
                  {lens.label}
                </p>
              </div>
            ))}
          </div>
          
          {/* Detail panel that animates in */}
          <div className="bg-white border border-slate-200 rounded-md p-5 shadow-sm">
            {hoveredLens ? (
              <div className="animate-fade-in-slide-up">
                {lensOptions.map(lens => 
                  lens.id === hoveredLens && (
                    <div key={`detail-${lens.id}`}>
                      <div className="mb-3 pb-2 border-b border-slate-100">
                        <div className="flex items-center mb-1">
                          {/* Color dot indicator */}
                          <div className={`w-2.5 h-2.5 rounded-full ${getColorDot(lens.color)} mr-2`}></div>
                          <h3 className="text-lg font-medium text-slate-800">{getLensDetailContent(lens.id).title}</h3>
                          {lens.isNew && (
                            <span className="ml-2 px-1.5 py-0.5 text-xs bg-amber-100 text-amber-800 rounded-sm">
                              New
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-500 italic">{getLensDetailContent(lens.id).description}</p>
                      </div>
                      
                      <div className="mb-3">
                        <p className="text-sm text-slate-700 leading-relaxed">
                          {getLensDetailContent(lens.id).detail}
                        </p>
                      </div>
                      
                      <div className="mb-3">
                        <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">USE CASES</h4>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {getLensDetailContent(lens.id).useCases.map((useCase, i) => (
                            <span 
                              key={i}
                              className="inline-block px-2 py-1 text-xs bg-slate-00 text-slate-700 rounded-md"
                            >
                              {useCase}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">TIP</h4>
                        <p className="text-xs text-slate-600 italic leading-relaxed">
                          {getLensDetailContent(lens.id).tips}
                        </p>
                      </div>
                    </div>
                  )
                )}
              </div>
            ) : (
              <div className="text-center py-8 px-2">
                <p className="text-sm text-slate-400 italic">
                  Hover over a lens to see details
                </p>
                <svg className="w-16 h-16 mx-auto mt-4 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122">
                  </path>
                </svg>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Mobile Detail Panel (shown below) */}
      {isMobile && hoveredLens && (
        <div className="col-span-12 mt-4 animate-fade-in-slide-up">
          <div className="bg-white border border-slate-200 rounded-md p-4 shadow-sm">
            {lensOptions.map(lens => 
              lens.id === hoveredLens && (
                <div key={`detail-mobile-${lens.id}`}>
                  <div className="mb-3 pb-2 border-b border-slate-100">
                    <div className="flex items-center mb-1">
                      {/* Color dot indicator */}
                      <div className={`w-2.5 h-2.5 rounded-full ${getColorDot(lens.color)} mr-2`}></div>
                      <h3 className="text-lg font-medium text-slate-800">{getLensDetailContent(lens.id).title}</h3>
                      {lens.isNew && (
                        <span className="ml-2 px-1.5 py-0.5 text-xs bg-amber-100 text-amber-800 rounded-sm">
                          New
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 italic">{getLensDetailContent(lens.id).description}</p>
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {getLensDetailContent(lens.id).detail}
                    </p>
                  </div>
                  
                  <div className="mb-13">
                    <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">USE CASES</h4>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {getLensDetailContent(lens.id).useCases.map((useCase, i) => (
                        <span 
                          key={i}
                          className="inline-block px-2 py-1 text-xs bg-slate-100 text-slate-700 rounded-md"
                        >
                          {useCase}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">TIP</h4>
                    <p className="text-xs text-slate-600 italic leading-relaxed">
                      {getLensDetailContent(lens.id).tips}
                    </p>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      )}
       
    </div>

  );
}

export default LensOptionsGrid;