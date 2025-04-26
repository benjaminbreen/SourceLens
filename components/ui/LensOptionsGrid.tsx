// components/ui/LensOptionsGrid.tsx
// Enhanced lens selection grid with elegant typography, subtle color coding,
// and contextual suggestions based on the document type being analyzed.
// Now features full dark mode support and improved hover animations.

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAppStore } from '@/lib/store';
import { useSourcePossibilities } from '@/lib/hooks/useSourcePossibilities';
import TypewriterEffect from '@/components/ui/TypewriterEffect';
import { motion, AnimatePresence } from 'framer-motion';
import { Space_Grotesk } from 'next/font/google';


const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  weight: ['300', '400', '500', '600', '700',],
  variable: '--font-space-grotesk',
});

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
  detailsOnLeft = true, // Toggle to control detail panel position
  isDarkMode = false // Dark mode support
}: { 
  onSelectLens: (id: string) => void;
  disabled?: boolean;
  className?: string;
  detailsOnLeft?: boolean;
  isDarkMode?: boolean;
}) {
  const [hoveredLens, setHoveredLens] = useState<string | null>(null);
  const [windowWidth, setWindowWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 0);
  const { metadata } = useAppStore();
  const { possibilities } = useSourcePossibilities();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
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
  
  // Get color classes for arrows based on lens color - with dark mode support
  const getArrowColor = (color: string): string => {
    if (isDarkMode) {
      switch(color) {
        case 'blue': return 'text-blue-400';
        case 'emerald': return 'text-emerald-400';
        case 'amber': return 'text-amber-400';
        case 'cyan': return 'text-cyan-400';
        case 'sky': return 'text-sky-400';
        case 'purple': return 'text-purple-400';
        case 'yellow': return 'text-yellow-400';
        case 'rose': return 'text-rose-400';
        default: return 'text-slate-400';
      }
    } else {
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
    }
  };

  // Get color classes for the color indicator dot in the detail panel
  const getColorDot = (color: string): string => {
    if (isDarkMode) {
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
    } else {
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
    }
  };

  // Get border classes for the card based on lens color - with dark mode support
  const getCardHighlightBorder = (color: string, isHovered: boolean): string => {
    if (!isHovered) return isDarkMode ? 'border-slate-700' : 'border-slate-300';
    
    if (isDarkMode) {
      switch(color) {
        case 'blue': return 'border-blue-800';
        case 'emerald': return 'border-emerald-800';
        case 'amber': return 'border-amber-800';
        case 'cyan': return 'border-cyan-800';
        case 'sky': return 'border-sky-800';
        case 'purple': return 'border-purple-800';
        case 'yellow': return 'border-yellow-800';
        case 'rose': return 'border-rose-800';
        default: return 'border-slate-700';
      }
    } else {
      switch(color) {
        case 'blue': return 'border-blue-300';
        case 'emerald': return 'border-emerald-300';
        case 'amber': return 'border-amber-300';
        case 'cyan': return 'border-cyan-300';
        case 'sky': return 'border-sky-300';
        case 'purple': return 'border-purple-300';
        case 'yellow': return 'border-yellow-300';
        case 'rose': return 'border-rose-300';
        default: return 'border-slate-300';
      }
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

  useEffect(() => {
  try {
    // Check if possibilities is defined
    if (!possibilities) {
      setErrorMessage("Possibilities object is undefined");
    } else if (typeof possibilities !== 'object') {
      setErrorMessage(`Possibilities has invalid type: ${typeof possibilities}`);
    } else {
      // Log what we have for debugging
      console.log("Source possibilities data:", possibilities);
      setErrorMessage(null);
    }
  } catch (err) {
    console.error("Error in source possibilities:", err);
    setErrorMessage(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }
}, [possibilities]);

  const getLensDefaultDescription = (lensId: string): string => {
  switch(lensId) {
    case 'detailed-analysis':
      return "Reveals the document's structure, context, and main arguments.";
    case 'extract-info':
      return "Extracts structured data like names, dates, and key facts.";
    case 'references':
      return "Identifies sources and related scholarly works.";
    case 'translate':
      return "Converts content to different languages while preserving meaning.";
    case 'roleplay':
      return "Simulates conversation with the document's author.";
    case 'connections':
      return "Maps relationships between concepts mentioned in the text.";
    case 'counter':
      return "Reveals alternative perspectives and hidden assumptions.";
    case 'highlight':
      return "Identifies significant passages based on specific criteria.";
    default:
      return "Provides unique analytical insights for this source.";
  }
};
  
  return (
    <div className={`grid grid-cols-14 gap-10 mb-12 ${className}`}>
    
    {errorMessage && (
  <div className={`mb-4 p-3 border rounded-md ${isDarkMode ? 'bg-red-900/20 border-red-800 text-red-300' : 'bg-red-50 border-red-200 text-red-600'}`}>
    <div className="flex items-start">
      <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <div>
        <p className="font-medium">Source Possibilities Error</p>
        <p className="text-sm mt-1">{errorMessage}</p>
        <p className="text-xs mt-2 italic">Check console for more details</p>
      </div>
    </div>
  </div>
)}
      {/* Header & Detail Panel Column */}
      {!isMobile && detailsOnLeft && (
        <div className="col-span-4 mr-5">
          {/* Header with number */}
          <div className="mb-5 flex items-center">
            <span className={`flex items-center justify-center w-8 h-8 
              ${isDarkMode 
                ? 'bg-slate-800 border-indigo-600 text-slate-100' 
                : 'bg-white border-indigo-400 text-slate-900'} 
              border rounded-full text-lg font-bold mr-2.5 transition-colors`}>
              4
            </span>
            <h2 className={`text-lg font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'} transition-colors`}>
              Analysis Lenses
            </h2>
          </div>
          
          {/* Detail panel that animates in */}
         

          <div className={`${
            isDarkMode 
              ? 'bg-slate-900 border-slate-700 shadow-slate-900/20' 
              : 'bg-white border-slate-200'
            } border rounded-md p-4 shadow-sm transition-colors`}>


            {hoveredLens ? (

              <div className="animate-fade-in-slide-up">
                {lensOptions.map(lens => 
                  lens.id === hoveredLens && (

                    <div key={`detail-${lens.id}`}>
                      <div className={`mb-3 pb-2 border-b ${isDarkMode ? 'border-slate-700' : 'border-slate-100'} transition-colors`}>
                        <div className="flex items-center mb-1">
                          {/* Color dot indicator */}
                          <div className={`w-2.5 h-2.5 rounded-full ${getColorDot(lens.color)} mr-2`}></div>
                          <h3 className={`text-lg font-medium ${isDarkMode ? 'text-slate-100' : 'text-slate-800'} transition-colors`}>
                            {getLensDetailContent(lens.id).title}
                          </h3>
                          {lens.isNew && (
                            <span className={`ml-2 px-1.5 py-0.5 text-xs ${
                              isDarkMode 
                                ? 'bg-amber-400/50 text-amber-300 ring-1 ring-amber-700' 
                                : 'bg-amber-100 text-amber-800'
                              } rounded-sm transition-colors`}>
                              New
                            </span>
                          )}
                        </div>
                        <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} italic transition-colors`}>
                          {getLensDetailContent(lens.id).description}
                        </p>
                      </div>
                      
                      <div className="mb-3">
                        <p className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-700'} leading-relaxed transition-colors`}>
                          {getLensDetailContent(lens.id).detail}
                        </p>
                      </div>
                      
                      <div className="mb-3">
                        <h4 className={`text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} uppercase tracking-wider mb-1 transition-colors`}>
                          USE CASES
                        </h4>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {getLensDetailContent(lens.id).useCases.map((useCase, i) => (
                            <span 
                              key={i}
                              className={`inline-block px-2 py-1 text-xs ${
                                isDarkMode 
                                  ? 'bg-slate-700 text-slate-300' 
                                  : 'bg-slate-100 text-slate-700'
                                } rounded-md transition-colors`}
                            >
                              {useCase}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className={`text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} uppercase tracking-wider mb-1 transition-colors`}>
                          TIP
                        </h4>
                        <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'} italic leading-relaxed transition-colors`}>
                          {getLensDetailContent(lens.id).tips}
                        </p>
                      </div>
                    </div>
                  )
                )}
              </div>
           ) : (
             <div className="text-center py-8 px-2">
               {possibilities.summary ? (
                 <div className="flex flex-col space-y-4">
                   <p className={`text-md ${isDarkMode ? 'text-slate-300' : 'text-slate-600'} ${spaceGrotesk.className} tracking-tight font mb-4 transition-colors`}>
                     {possibilities.summary}
                   </p>
                   <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'} italic transition-colors`}>
                     Hover over a lens to see specific possibilities for this source
                   </p>
                 </div>
               ) : (
                 <p className={`text-md ${isDarkMode ? 'text-slate-500' : 'text-slate-400'} italic transition-colors`}>
                   Hover over a lens to see details. Each is designed to provide a complementary perspective on a source. 
                 </p>
               )}
               <svg className={`w-16 h-16 mx-auto mt-4 ${isDarkMode ? 'text-slate-700' : 'text-slate-200'} transition-colors`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122">
                 </path>
               </svg>
             </div>
            )}
          </div>
           {hoveredLens && possibilities[hoveredLens] && (
  <div className="flex-shrink-0 px-4 py-5 mt-3 mb-4 rounded-lg border border-slate-200 shadow-sm transition-all duration-400">
    <h4 className={`text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} uppercase tracking-wider mb-1`}>
      AI preview 
    </h4>
    <div className="h-26 overflow-hidden">
      <AnimatePresence mode="wait">
        <TypewriterEffect 
          key={`possibility-${hoveredLens}`}
          text={hoveredLens ? possibilities[hoveredLens] : ''}
          isVisible={true}
          speed={15}
          isDarkMode={isDarkMode}
        />
      </AnimatePresence>
    </div>
  </div>
)}
        </div>

      )}

      {/* Main lens options grid (3 columns when detail panel is shown) */}
      <div className={`${isMobile ? 'col-span-12' : (detailsOnLeft || !detailsOnLeft ? 'col-span-9' : 'col-span-12')}`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {lensOptions.map((lens) => {
            const isHovered = hoveredLens === lens.id;
            const arrowColor = getArrowColor(lens.color);
            const cardBorder = getCardHighlightBorder(lens.color, isHovered);
            
            return (
              <button
                key={lens.id}
                onClick={() => onSelectLens(lens.id)}
                disabled={disabled}
                onMouseEnter={() => setHoveredLens(lens.id)}
                onMouseLeave={() => setHoveredLens(null)}
                onTouchStart={() => setHoveredLens(lens.id === hoveredLens ? null : lens.id)}
                className={`
                  group relative rounded-lg overflow-hidden border ${cardBorder}
                  transition-all duration-300 flex flex-col h-full
                  ${!disabled 
                    ? `hover:shadow-md ${isHovered 
                        ? `shadow-md ${isDarkMode ? 'bg-slate-900' : 'bg-slate-50/80'}` 
                        : isDarkMode ? 'bg-slate-900' : 'bg-white'}`
                    : `${isDarkMode ? 'bg-slate-800' : 'bg-slate-50 opacity-50'} cursor-not-allowed`}
                `}
                aria-label={`Analyze using ${lens.label}`}
              >
                {/* Subtle background glow effect on hover */}
                <div 
                  className={`absolute inset-0 opacity-0 transition-opacity duration-300 ${
                    !disabled && isHovered ? 'opacity-20' : ''
                  } rounded-lg`}
                  style={{ 
                    backgroundImage: `radial-gradient(circle at center, ${
                      lens.color === 'blue' ? (isDarkMode ? '#3B82F6' : '#93C5FD') :
                      lens.color === 'emerald' ? (isDarkMode ? '#10B981' : '#6EE7B7') :
                      lens.color === 'amber' ? (isDarkMode ? '#F59E0B' : '#FCD34D') :
                      lens.color === 'cyan' ? (isDarkMode ? '#06B6D4' : '#67E8F9') :
                      lens.color === 'sky' ? (isDarkMode ? '#0EA5E9' : '#7DD3FC') :
                      lens.color === 'purple' ? (isDarkMode ? '#8B5CF6' : '#C4B5FD') :
                      lens.color === 'yellow' ? (isDarkMode ? '#EAB308' : '#FEF08A') :
                      lens.color === 'rose' ? (isDarkMode ? '#F43F5E' : '#FDA4AF') :
                      (isDarkMode ? '#71717A' : '#E2E8F0')
                    }, transparent 70%)`,
                    pointerEvents: 'none'
                  }}
                ></div>
                
                {/* Image container */}
                <div className={`aspect-square w-full relative ${
                  isDarkMode 
                    ? `${isHovered ? 'bg-slate-800' : 'bg-slate-800/50'}` 
                    : `${isHovered ? 'bg-slate-100' : 'bg-slate-50'}`
                  } overflow-hidden transition-colors duration-300`}>
                  <div className="absolute inset-0 flex items-center justify-center p-4">
                    <Image 
                      src={lens.imageSrc}
                      alt={`${lens.label} illustration`}
                      width={160}
                      height={160}
                      className={`
                        w-full h-full object-contain transition-transform duration-500
                        ${!disabled ? `
                          ${isHovered 
                            ? 'scale-[1.1] filter brightness-110' 
                            : isDarkMode ? 'brightness-90' : ''}` 
                            : 'opacity-70 filter grayscale'
                        }`}
                    />
                  </div>
                  
                  {/* "New" badge - positioned on top of image */}
                  {lens.isNew && (
                    <span className={`absolute top-2 right-2 inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-medium ${
                      isDarkMode 
                        ? 'bg-amber-900/70 text-amber-300 ring-1 ring-amber-700/70' 
                        : 'bg-amber-100 text-amber-800'
                      } transition-colors`}>
                      New
                    </span>
                  )}
                </div>
                
                {/* Content section */}
                <div className={`p-4 flex flex-col flex-grow border-t ${
                  isDarkMode ? 'border-slate-700' : 'border-slate-100'
                  } transition-colors`}>
                  <h3 className={`text-base font-medium ${
                    !disabled 
                      ? isDarkMode ? 'text-slate-200' : 'text-slate-800' 
                      : isDarkMode ? 'text-slate-400' : 'text-slate-500'
                    } transition-colors`}>
                    {lens.label}
                  </h3>
                  <p className={`text-xs ${
                    !disabled 
                      ? isDarkMode ? 'text-slate-400' : 'text-slate-600' 
                      : isDarkMode ? 'text-slate-500' : 'text-slate-400'
                    } mt-1 transition-colors`}>
                    {lens.description}
                  </p>
                  
                  {/* Footer with arrow */}
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
            <span className={`flex items-center justify-center w-8 h-8 
              ${isDarkMode 
                ? 'bg-slate-800 border-indigo-600 text-slate-100' 
                : 'bg-white border-indigo-400 text-slate-900'} 
              border rounded-full text-lg font-bold mr-2.5 transition-colors`}>
              4
            </span>
            <h2 className={`text-lg font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'} transition-colors`}>
              Analysis Lenses
            </h2>
          </div>
          
          {/* One-sentence description in Swiss minimalist style */}
          <div className="mb-4">
            <p className={`font-sans text-sm tracking-wide ${isDarkMode ? 'text-slate-300' : 'text-slate-700'} leading-6 max-w-md transition-colors`}>
              SourceLens provides specialized analytical tools that reveal different dimensions of your text through multiple interpretive perspectives.
            </p>
          </div>

          {/* Stylish lens list in Swiss design */}
          <div className={`mb-6 border-l-2 ${isDarkMode ? 'border-slate-700' : 'border-slate-200'} pl-4 space-y-2.5 transition-colors`}>
            {lensOptions.map(lens => (
              <div key={lens.id} className="font-sans">
                <p className={`text-xs uppercase tracking-wider font-medium ${
                  lens.id === hoveredLens 
                    ? getArrowColor(lens.color) 
                    : isDarkMode ? 'text-slate-400' : 'text-slate-500'
                  } transition-colors`}>
                  {lens.label}
                </p>
              </div>
            ))}
          </div>
          
   

         {/* Detail panel that animates in */}
         <div className={`${
           isDarkMode 
             ? 'bg-slate-900 border-slate-700 shadow-slate-900/20' 
             : 'bg-white border-slate-200'
           } border rounded-md p-4 shadow-sm transition-colors`}>
           
           {/* Summary display - ALWAYS visible */}
           <div className="mb-4">
             {possibilities && possibilities.summary ? (
               <div className="flex flex-col space-y-2">
                 <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'} font-medium transition-colors`}>
                   {possibilities.summary}
                 </p>
                 {!hoveredLens && (
                   <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'} italic transition-colors`}>
                     Hover over a lens to see specific insights for this source
                   </p>
                 )}
               </div>
             ) : (
               <p className={`text-sm ${isDarkMode ? 'text-slate-500' : 'text-slate-400'} italic transition-colors`}>
                 Source lens analysis ready. Hover over a lens to explore possibilities.
               </p>
             )}
           </div>
             
           {/* Source insight for current lens - shown ONLY when hovering */}
           {hoveredLens && possibilities && (
             <div className="flex-shrink-0 lg:w-3/10 bg-slate-50 px-7 py-5 mt-4 rounded-xl border border-slate-200 shadow-sm">
               <h4 className={`text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} uppercase tracking-wider mb-1 transition-colors`}>
                 SOURCE INSIGHT
               </h4>
               <div className="h-16 overflow-hidden relative">
                 <AnimatePresence mode="wait">
                   <TypewriterEffect 
                     key={`possibility-${hoveredLens}`}
                     text={possibilities[hoveredLens] || getLensDefaultDescription(hoveredLens)}
                     isVisible={true}
                     speed={30}
                     isDarkMode={isDarkMode}
                     className="min-h-[3rem]"
                   />
                 </AnimatePresence>
               </div>
             </div>
           )}
             
           {/* Lens details - still shown when hovering */}
           {hoveredLens ? (
             <div className="animate-fade-in-slide-up">
               {lensOptions.map(lens => 
                 lens.id === hoveredLens && (
                   <div key={`detail-${lens.id}`}>
                     <div className={`mb-3 pb-2 border-b ${isDarkMode ? 'border-slate-700' : 'border-slate-100'} transition-colors`}>
                       <div className="flex items-center mb-1">
                         {/* Color dot indicator */}
                         <div className={`w-2.5 h-2.5 rounded-full ${getColorDot(lens.color)} mr-2`}></div>
                         <h3 className={`text-lg font-medium ${isDarkMode ? 'text-slate-100' : 'text-slate-800'} transition-colors`}>
                           {getLensDetailContent(lens.id).title}
                         </h3>
                         {lens.isNew && (
                           <span className={`ml-2 px-1.5 py-0.5 text-xs ${
                             isDarkMode 
                               ? 'bg-amber-400/50 text-amber-300 ring-1 ring-amber-700' 
                               : 'bg-amber-100 text-amber-800'
                             } rounded-sm transition-colors`}>
                             New
                           </span>
                         )}
                       </div>
                       <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} italic transition-colors`}>
                         {getLensDetailContent(lens.id).description}
                       </p>
                     </div>
                     
                     <div className="mb-3">
                       <p className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-700'} leading-relaxed transition-colors`}>
                         {getLensDetailContent(lens.id).detail}
                       </p>
                     </div>
                     
                     <div className="mb-3">
                       <h4 className={`text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} uppercase tracking-wider mb-1 transition-colors`}>
                         USE CASES
                       </h4>
                       <div className="flex flex-wrap gap-1 mt-1">
                         {getLensDetailContent(lens.id).useCases.map((useCase, i) => (
                           <span 
                             key={i}
                             className={`inline-block px-2 py-1 text-xs ${
                               isDarkMode 
                                 ? 'bg-slate-700 text-slate-300' 
                                 : 'bg-slate-100 text-slate-700'
                               } rounded-md transition-colors`}
                           >
                             {useCase}
                           </span>
                         ))}
                       </div>
                     </div>
                     
                     <div>
                       <h4 className={`text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} uppercase tracking-wider mb-1 transition-colors`}>
                         TIP
                       </h4>
                       <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'} italic leading-relaxed transition-colors`}>
                         {getLensDetailContent(lens.id).tips}
                       </p>
                     </div>
                   </div>
                 )
               )}
             </div>
           ) : (
             <div className="flex justify-center">
               <svg className={`w-16 h-16 ${isDarkMode ? 'text-slate-700' : 'text-slate-200'} transition-colors`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <div className={`${
            isDarkMode 
              ? 'bg-slate-800 border-slate-700' 
              : 'bg-white border-slate-200'
            } border rounded-md p-4 shadow-sm transition-colors`}>
            {lensOptions.map(lens => 
              lens.id === hoveredLens && (
                <div key={`detail-mobile-${lens.id}`}>
                  <div className={`mb-3 pb-2 border-b ${isDarkMode ? 'border-slate-700' : 'border-slate-100'} transition-colors`}>
                    <div className="flex items-center mb-1">
                      {/* Color dot indicator */}
                      <div className={`w-2.5 h-2.5 rounded-full ${getColorDot(lens.color)} mr-2`}></div>
                      <h3 className={`text-lg font-medium ${isDarkMode ? 'text-slate-100' : 'text-slate-800'} transition-colors`}>
                        {getLensDetailContent(lens.id).title}
                      </h3>
                      {lens.isNew && (
                        <span className={`ml-2 px-1.5 py-0.5 text-xs ${
                          isDarkMode 
                            ? 'bg-amber-900/50 text-amber-300 ring-1 ring-amber-700' 
                            : 'bg-amber-100 text-amber-800'
                          } rounded-sm transition-colors`}>
                          New
                        </span>
                      )}
                    </div>
                    <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} italic transition-colors`}>
                      {getLensDetailContent(lens.id).description}
                    </p>
                  </div>
                  
                  <div className="mb-3">
                    <p className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-700'} leading-relaxed transition-colors`}>
                      {getLensDetailContent(lens.id).detail}
                    </p>
                  </div>
                  
                  <div className="mb-13">
                    <h4 className={`text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} uppercase tracking-wider mb-1 transition-colors`}>
                      USE CASES
                    </h4>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {getLensDetailContent(lens.id).useCases.map((useCase, i) => (
                        <span 
                          key={i}
                          className={`inline-block px-2 py-1 text-xs ${
                            isDarkMode 
                              ? 'bg-slate-700 text-slate-300' 
                              : 'bg-slate-100 text-slate-700'
                            } rounded-md transition-colors`}
                        >
                          {useCase}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className={`text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} uppercase tracking-wider mb-1 transition-colors`}>
                      TIP
                    </h4>
                    <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'} italic leading-relaxed transition-colors`}>
                      {getLensDetailContent(lens.id).tips}
                    </p>
                  </div>
                </div>
              )
            )}
            {possibilities && hoveredLens && possibilities[hoveredLens] && (
  <div className="flex-shrink-0 lg:w-3/10 bg-slate-50 px-7 py-5 mt-4 rounded-xl border border-slate-200 shadow-sm">
    <h4 className={`text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} uppercase tracking-wider mb-1 transition-colors`}>
      SOURCE INSIGHT
    </h4>
    <div className="h-16 overflow-hidden relative">
      <AnimatePresence mode="wait">
        <TypewriterEffect 
          key={`possibility-${hoveredLens}`}
          text={possibilities[hoveredLens] || "No specific insights available for this source yet."}
          isVisible={true}
          speed={30}
          isDarkMode={isDarkMode}
          className="min-h-[3rem]"
        />
      </AnimatePresence>
    </div>
  </div>
)}
          </div>
        </div>
      )}
    </div>
  );
}

export default LensOptionsGrid;