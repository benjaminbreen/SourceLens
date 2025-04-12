// components/ui/DemoButtons.tsx
'use client';

import React, { useState, useEffect, RefObject, useRef } from 'react';
import Image from 'next/image';
import ImagePreloader from './ImagePreloader';

// --- Define Interfaces ---
interface Metadata {
  date?: string;
  author?: string;
  researchGoals?: string;
  additionalInfo?: string;
  title?: string;
  summary?: string;
  documentEmoji?: string;
  documentType?: string;
  genre?: string;
  placeOfPublication?: string;
  academicSubfield?: string;
  tags?: string[] | string;
  fullCitation?: string;
  thumbnailUrl?: string | null;
}

interface DemoTextItem {
  emoji: string;
  title: string;
  description: string;
  text: string;
  metadata: Metadata;
  thumbnailUrl?: string;
}

type ActivePanelType = 'analysis' | 'detailed-analysis' | 'counter' | 'roleplay' | 'references' | 'extract-info' | 'highlight' | 'translate';

interface DemoButtonsProps {
  demoTexts: DemoTextItem[];
  selectedDemo: number | null;
  loadDemoContent: (index: number) => void;
  handleQuickDemo: (index: number, panel: ActivePanelType) => void;
  handleManhattanNarrative: () => void;
  handleHighlightDemo: (index: number, query: string) => void;
  showDemoOptions: boolean;
  setShowDemoOptions: (show: boolean) => void;
  buttonRef?: RefObject<HTMLButtonElement>;
  dropdownRef?: RefObject<HTMLDivElement>;
}

// --- Enhanced Detail Panel Component ---
const DetailPanel = ({ demo }: { demo: DemoTextItem | null }) => {
  if (!demo) {
    return (
      <div className="relative  overflow-hidden mt-2 rounded-xl shadow-lg bg-white border border-slate-200 transition-all duration-300">
        <div className="p-6 py-5  text-center">
          <p className="text-slate-400 text-xl font-serif italic">
            Select a source to view its details
          </p>
        </div>
      </div>
    );
  }
  
  // Format tags for display
  const tags = Array.isArray(demo.metadata.tags) 
    ? demo.metadata.tags 
    : typeof demo.metadata.tags === 'string' 
      ? demo.metadata.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      : [];
  
  // Helper function to get thumbnail path
  const getThumbnailPath = () => {
    if (demo.metadata.thumbnailUrl) return demo.metadata.thumbnailUrl;
    
    const title = demo.title.toLowerCase();
    
    if (title.includes('sumerian') || title.includes('ea-nāṣir') || title.includes('complaint')) 
      return '/demo-thumbnails/nannitablet.jpg';
    if (title.includes('freud') || title.includes('cocaine')) 
      return '/demo-thumbnails/coca.jpg';
    if (title.includes('mead') || title.includes('samoa')) 
      return '/demo-thumbnails/meadnotes.jpg';
    if (title.includes('woolf') || title.includes('letter')) 
      return '/demo-thumbnails/woolfletter.jpg';
    if (title.includes('mun') || title.includes('english coin')) 
      return '/demo-thumbnails/munbook.jpg';
    if (title.includes('inquisition') || title.includes('peyote')) 
      return '/demo-thumbnails/inquisition.jpg';
    if (title.includes('manhattan') || title.includes('lenape')) 
      return '/demo-thumbnails/manhattan.jpg';
    if (title.includes('nitrous')) 
      return '/demo-thumbnails/nitrous.jpg';
    if (title.includes('memorial') || title.includes('memorial')) 
      return '/demo-thumbnails/memorial.jpg';
    if (title.includes('gettysburg') || title.includes('lincoln')) 
      return '/demo-thumbnails/gettysburg.jpg';
    if (title.includes('demons') || title.includes('pelbartus')) 
      return '/demo-thumbnails/pelbartus.jpg';
      
    return `/demo-thumbnails/${title.toLowerCase().replace(/[\s:,]+/g, '-').replace(/['']/g, '')}.jpg`;
  };
  
  const thumbnailPath = getThumbnailPath();
  
  return (
    <div className="relative overflow-hidden mt-2 rounded-xl shadow-lg bg-stone-100 border border-slate-300 transition-all duration-300 min-h-[200px]">
      <div className="relative z-10 p-6 py-5 flex gap-6">
        {/* Left: Thumbnail */}
        <div className="shrink-0">
          <div className="w-32 h-40 overflow-hidden rounded-md bg-slate-100 shadow-md border border-slate-200 relative">
            <Image 
              src={thumbnailPath}
              alt={demo.title}
              fill
              className="object-cover"
              onError={(e) => {
                e.currentTarget.src = '/placeholder.jpg';
              }}
            />
          </div>
        </div>
        
        {/* Right: Content */}
        <div className="flex-1 mr-10">
          <h3 className="font-serif text-xl font-medium text-slate-800 mb-1.5">{demo.title}</h3>
          
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 mr-20 mb-3">
            {demo.metadata.date && (
              <div className="flex items-baseline gap-2">
                <span className="text-xs uppercase tracking-wide text-slate-500 font-medium">Date</span>
                <span className="text-sm text-slate-700">{demo.metadata.date}</span>
              </div>
            )}
            {demo.metadata.author && (
              <div className="flex items-baseline gap-2">
                <span className="text-xs uppercase tracking-wide text-slate-500 font-medium">Author</span>
                <span className="text-sm text-slate-700">{demo.metadata.author}</span>
              </div>
            )}
            {demo.metadata.documentType && (
              <div className="flex items-baseline gap-2">
                <span className="text-xs uppercase tracking-wide text-slate-500 font-medium">Type</span>
                <span className="text-sm text-slate-700">{demo.metadata.documentType}</span>
              </div>
            )}
            {demo.metadata.placeOfPublication && (
              <div className="flex items-baseline gap-2">
                <span className="text-xs uppercase tracking-wide text-slate-500 font-medium">Origin</span>
                <span className="text-sm text-slate-700">{demo.metadata.placeOfPublication}</span>
              </div>
            )}
          </div>
          
          {/* Summary */}
          {demo.metadata.summary && (
            <p className=" text-slate-600 mb-3 line-clamp-2 font-serif italic ">
              {demo.metadata.summary}
            </p>
          )}
          
          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.slice(0, 4).map((tag, idx) => (
                <span key={idx} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs border border-slate-200">
                  {tag}
                </span>
              ))}
              {tags.length > 4 && 
                <span className="text-xs text-slate-400 self-center">+{tags.length - 4} more</span>
              }
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
// --- Quick Start Component ---
const QuickStartSection = ({ 
  handleQuickDemo, 
  handleManhattanNarrative, 
  handleHighlightDemo, 
  handleQuickStartClick 
}: { 
  handleQuickDemo: (index: number, panel: ActivePanelType) => void;
  handleManhattanNarrative: () => void;
  handleHighlightDemo: (index: number, query: string) => void;
  handleQuickStartClick: (action: () => void) => void;
}) => {
  return (
    <div className="bg-gradient-to-r from-slate-50 to-white rounded-lg p-5 border border-slate-200/80 mt-4">
      <h5 className="text-base font-serif font-medium text-slate-800 mb-3 flex items-center gap-2">
        <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        Quick Features
      </h5>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Enhanced Quick Start Buttons */}
        <button 
          onClick={() => handleQuickStartClick(() => handleQuickDemo(0, 'roleplay'))}
          className="text-left bg-white hover:bg-indigo-50 text-sm font-medium text-slate-700 hover:text-indigo-700 rounded-md border border-slate-200 hover:border-indigo-200 p-3 transition-all duration-150 shadow-sm hover:shadow flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
            <span className="text-lg">💬</span>
          </div>
          <div>
            <span className="block font-medium">Simulate: Ancient Complaint</span>
            <span className="text-xs text-slate-500">Roleplay with a Sumerian merchant</span>
          </div>
        </button>
        
        <button 
          onClick={() => handleQuickStartClick(handleManhattanNarrative)}
          className="text-left bg-white hover:bg-indigo-50 text-sm font-medium text-slate-700 hover:text-indigo-700 rounded-md border border-slate-200 hover:border-indigo-200 p-3 transition-all duration-150 shadow-sm hover:shadow flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
            <span className="text-lg">🏙️</span>
          </div>
          <div>
            <span className="block font-medium">Alternate Perspective</span>
            <span className="text-xs text-slate-500">Manhattan Island narrates its history</span>
          </div>
        </button>
        
        <button 
          onClick={() => handleQuickStartClick(() => handleQuickDemo(8, 'roleplay'))}
          className="text-left bg-white hover:bg-indigo-50 text-sm font-medium text-slate-700 hover:text-indigo-700 rounded-md border border-slate-200 hover:border-indigo-200 p-3 transition-all duration-150 shadow-sm hover:shadow flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
            <span className="text-lg">🧪</span>
          </div>
          <div>
            <span className="block font-medium">Historical Interview</span>
            <span className="text-xs text-slate-500">Discuss cocaine with Sigmund Freud</span>
          </div>
        </button>
        
        <button 
          onClick={() => handleQuickStartClick(() => handleHighlightDemo(4, 'highlight ALL names for materia medica in this text that appear to be of Sub-Saharan origin'))}
          className="text-left bg-white hover:bg-indigo-50 text-sm font-medium text-slate-700 hover:text-indigo-700 rounded-md border border-slate-200 hover:border-indigo-200 p-3 transition-all duration-150 shadow-sm hover:shadow flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
            <span className="text-lg">✨</span>
          </div>
          <div>
            <span className="block font-medium">Interactive Highlight</span>
            <span className="text-xs text-slate-500">Find African terms in a colonial text</span>
          </div>
        </button>
      </div>
    </div>
  );
};

// --- Filter Component ---
const FilterBar = ({ 
  demoTexts,
  filterBy,
  setFilterBy
}: {
  demoTexts: DemoTextItem[];
  filterBy: { genre: string; era: string };
  setFilterBy: (filters: { genre: string; era: string }) => void;
}) => {
  // Extract unique genres
  const genres = Array.from(new Set(
    demoTexts
      .filter(demo => demo.metadata.genre)
      .map(demo => demo.metadata.genre)
  )).sort();
  
  // Define eras
  const eras = [
    { label: 'All Periods', value: '' },
    { label: 'Ancient World', value: 'ancient', range: ['-3000', '500'] },
    { label: 'Medieval', value: 'medieval', range: ['500', '1500'] },
    { label: 'Early Modern', value: 'early-modern', range: ['1500', '1800'] },
    { label: '19th Century', value: '19th', range: ['1800', '1900'] },
    { label: '20th Century', value: '20th', range: ['1900', '2000'] }
  ];

  return (
    <div className="flex items-center gap-3 ml-auto">
      <div className="relative">
        <select
          value={filterBy.genre}
          onChange={(e) => setFilterBy({ ...filterBy, genre: e.target.value })}
          className="appearance-none pl-3 pr-8 py-1 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-amber-400"
        >
          <option value="">All Genres</option>
          {genres.map((genre, idx) => (
            <option key={idx} value={genre}>
              {genre}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      
      <div className="relative">
        <select
          value={filterBy.era}
          onChange={(e) => setFilterBy({ ...filterBy, era: e.target.value })}
          className="appearance-none pl-3 pr-8 py-1 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-amber-400"
        >
          {eras.map((era, idx) => (
            <option key={idx} value={era.value}>
              {era.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
};

// --- Main DemoButtons Component ---
export default function DemoButtons({
  demoTexts,
  selectedDemo,
  loadDemoContent,
  handleQuickDemo,
  handleManhattanNarrative,
  handleHighlightDemo,
  showDemoOptions,
  setShowDemoOptions,
  buttonRef,
  dropdownRef,
}: DemoButtonsProps) {
  const [animateButton, setAnimateButton] = useState(false);
  const [selectedDetailDemo, setSelectedDetailDemo] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [filterBy, setFilterBy] = useState({ genre: '', era: '' });
  const [filteredDemoTexts, setFilteredDemoTexts] = useState<DemoTextItem[]>(demoTexts);
  
  // Items per page
  const ITEMS_PER_PAGE = 10;
  
  // Apply filters
  useEffect(() => {
    let filtered = [...demoTexts];
    
    // Filter by genre
    if (filterBy.genre) {
      filtered = filtered.filter(demo => 
        demo.metadata.genre && demo.metadata.genre === filterBy.genre
      );
    }
    
    // Filter by era
    if (filterBy.era) {
      const eraRanges = {
        'ancient': ['-3000', '500'],
        'medieval': ['500', '1500'],
        'early-modern': ['1500', '1800'],
        '19th': ['1800', '1900'],
        '20th': ['1900', '2000']
      };
      
      const range = eraRanges[filterBy.era as keyof typeof eraRanges];
      
      if (range) {
        filtered = filtered.filter(demo => {
          if (!demo.metadata.date) return false;
          
          // Extract year from date string
          const yearMatch = demo.metadata.date.match(/\d{3,4}/);
          if (!yearMatch) return false;
          
          const year = parseInt(yearMatch[0]);
          const [minYear, maxYear] = range.map(y => parseInt(y));
          
          return year >= minYear && year <= maxYear;
        });
      }
    }
    
    setFilteredDemoTexts(filtered);
    setCurrentPage(0); // Reset to first page when filtering
  }, [filterBy, demoTexts]);
  
  // Trigger button animation effect after delay
  useEffect(() => {
    const timer = setTimeout(() => setAnimateButton(true), 2500);
    return () => clearTimeout(timer);
  }, []);
  
  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showDemoOptions) return;
      
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextPage();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevPage();
      } else if (e.key === 'Escape') {
        setShowDemoOptions(false);
        setSelectedDetailDemo(null);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showDemoOptions, currentPage, setShowDemoOptions]);

  // Toggle modal visibility
  const toggleDemoOptions = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDemoOptions(!showDemoOptions);
    setCurrentPage(0); // Reset to first page when opening
  };

  // Handle selecting a demo item
  const handleDemoClick = (index: number) => {
    loadDemoContent(index);
    setShowDemoOptions(false);
  };

  // Handle clicking a quick start button
  const handleQuickStartClick = (action: () => void) => {
    action();
    setShowDemoOptions(false);
  };

  // Handle mouse enter for demo items
  const handleDemoMouseEnter = (index: number) => {
    setSelectedDetailDemo(index);
  };
  
  // Navigation functions for paging
  const totalPages = Math.ceil(filteredDemoTexts.length / ITEMS_PER_PAGE);
  
  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(prev => prev + 1);
    }
  };
  
  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    }
  };
  
  // Get current page items
  const getCurrentPageItems = () => {
    const startIdx = currentPage * ITEMS_PER_PAGE;
    const endIdx = startIdx + ITEMS_PER_PAGE;
    return filteredDemoTexts.slice(startIdx, endIdx);
  };

  // Get author's last name for thumbnails
  const getAuthorLastName = (author: string | undefined): string => {
    if (!author) return 'placeholder';
    
    const nameParts = author.split(' ');
    const lastName = nameParts[nameParts.length - 1].toLowerCase()
      .replace(/[,.;:'"]/g, '')
      .trim();
      
    return lastName;
  };

  const imagesToPreload = [
  // Demo background images
  '/demos/nanni.jpg',
  '/demos/freud.jpg',
  '/demos/mead.jpg',
  '/demos/woolf.jpg',
  '/demos/mun.jpg',
  '/demos/isla.jpg',
  '/demos/heckewelder.jpg',
  '/demos/semedo.jpg',
  '/demos/lincoln.jpg',
  '/demos/demons.jpg',
  '/demos/james.jpg',
  
  // Demo thumbnails
  '/demo-thumbnails/nannitablet.jpg',
  '/demo-thumbnails/coca.jpg',
  '/demo-thumbnails/meadnotes.jpg',
  '/demo-thumbnails/woolfletter.jpg',
  '/demo-thumbnails/munbook.jpg',
  '/demo-thumbnails/inquisition.jpg',
  '/demo-thumbnails/manhattan.jpg',
  '/demo-thumbnails/nitrous.jpg',
  '/demo-thumbnails/memorial.jpg',
  '/demo-thumbnails/gettysburg.jpg',
  '/demo-thumbnails/pelbartus.jpg',
];


  return (
    <>
        {/* Preload all images */}
    <ImagePreloader imagePaths={imagesToPreload} />
    
      {/* Trigger Button with Subtle Pulse Animation */}
      <button
        ref={buttonRef}
        onClick={toggleDemoOptions}
        className={`relative z-1 text-md text-amber-800 bg-amber-100/80 hover:bg-amber-200/90 hover:text-amber-900 border-2 border-amber-300 hover:border-amber-400 font-semibold flex items-center gap-1.5 px-4 py-3 rounded-full transition-all duration-300 shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-1 ${animateButton ? 'pulse-ring' : ''}`}
        aria-expanded={showDemoOptions}
        aria-controls="demo-modal-content"
      >
        <svg className="w-4 h-4 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <span>See how it works</span>
      </button>

      {/* Modal Overlay with Improved Animation */}
      {showDemoOptions && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[2000] p-4 animate-modal-fade-in"
          onClick={() => setShowDemoOptions(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="demo-modal-title"
        >
          {/* Modal Panel */}
          <div
            ref={dropdownRef}
            id="demo-modal-content"
            className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[82vh] flex flex-col overflow-hidden border border-slate-200/70 animate-modal-slide-in"
            onClick={e => e.stopPropagation()}
          >
            {/* Header with Filter Options */}
            <div className="flex items-center justify-between p-3 border-b border-slate-200 shrink-0 bg-gradient-to-r from-white to-slate-50">
              <div className="flex items-center gap-3">
                <h4 id="demo-modal-title" className="text-2xl font-serif font-bold text-slate-800 flex items-center gap-2">
                  <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span>Demonstration sources</span>
                </h4>
              </div>
              
              <div className="flex items-center gap-4">
                <FilterBar 
                  demoTexts={demoTexts}
                  filterBy={filterBy}
                  setFilterBy={setFilterBy}
                />
                
                <button 
                  onClick={() => setShowDemoOptions(false)} 
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
                  aria-label="Close examples"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          {/* Fixed-Height Detail Panel Area with Background Image */}
<div className="relative bg-white bg-stone-100 px-20 py-6 border-b border-slate-300 shadow-inner h-[320px] flex items-center justify-center">
  
  {/* Background behind detail panel*/}
  {selectedDetailDemo !== null && (
    <div className="absolute inset-0 z-0">
      <div className="absolute inset-0 bg-gradient-to-t from-stone-300/80 via-slate-500/20 to-slate-400/30 z-10"></div>
    </div>
  )}
  
  {/* Inset Shadow Effect */}
  <div className="absolute inset-0 shadow-[inset_0_2px_10px_rgba(0,0,0,0.15)] pointer-events-none z-20"></div>
  
  {/* Content Panel */}
  <div className="w-full relative shadow-md rounded-xl z-10 ">
    <DetailPanel demo={selectedDetailDemo !== null ? filteredDemoTexts[selectedDetailDemo] : null} />
    
    {/* Background Image in right side of panel */}
    {selectedDetailDemo !== null && (() => {
      const demo = filteredDemoTexts[selectedDetailDemo];
      if (!demo) return null;
      
      // Map to correct image based on title/content keywords
      let imagePath = '';
      
      if (demo.title.toLowerCase().includes('sumerian') || 
          demo.title.toLowerCase().includes('ea-nāṣir') ||
          demo.title.toLowerCase().includes('complaint')) {
        imagePath = '/demos/nanni.jpg';
      }
      else if (demo.title.toLowerCase().includes('freud') || 
               demo.title.toLowerCase().includes('coca') ||
               demo.title.toLowerCase().includes('cocaine')) {
        imagePath = '/demos/freud.jpg';
      }
      else if (demo.title.toLowerCase().includes('mead') || 
               demo.title.toLowerCase().includes('samoa')) {
        imagePath = '/demos/mead.jpg';
      }
      else if (demo.title.toLowerCase().includes('woolf') || 
               demo.title.toLowerCase().includes('letter') ||
               demo.metadata?.author?.toLowerCase().includes('woolf')) {
        imagePath = '/demos/woolf.jpg';
      }
      else if (demo.title.toLowerCase().includes('mun') || 
               demo.title.toLowerCase().includes('economics') ||
               demo.metadata?.author?.toLowerCase().includes('mun')) {
        imagePath = '/demos/mun.jpg';
      }
      else if (demo.title.toLowerCase().includes('peyote') || 
               demo.title.toLowerCase().includes('inquisition')) {
        imagePath = '/demos/isla.jpg';
      }
      else if (demo.title.toLowerCase().includes('manhattan') || 
               demo.title.toLowerCase().includes('delaware') ||
               demo.title.toLowerCase().includes('lenape') ||
               demo.metadata?.author?.toLowerCase().includes('heckewelder')) {
        imagePath = '/demos/heckewelder.jpg';
      }
      else if (demo.title.toLowerCase().includes('drug guide') || 
               demo.title.toLowerCase().includes('semedo') ||
               demo.title.toLowerCase().includes('18th century drug')) {
        imagePath = '/demos/semedo.jpg';
      }
      else if (demo.title.toLowerCase().includes('gettysburg') || 
               demo.title.toLowerCase().includes('lincoln') ||
               demo.metadata?.author?.toLowerCase().includes('lincoln')) {
        imagePath = '/demos/lincoln.jpg';
      }
      else if (demo.title.toLowerCase().includes('demons') || 
               demo.title.toLowerCase().includes('pelbartus')) {
        imagePath = '/demos/demons.jpg';
      }
      else if (demo.title.toLowerCase().includes('james') || 
               demo.title.toLowerCase().includes('nitrous') ||
               demo.metadata?.author?.toLowerCase().includes('james')) {
        imagePath = '/demos/james.jpg';
      }
      else {
        return null;
      }
      
      return (
        <div className="absolute saturate-90  rounded-xl top-2.5 bottom-0.5 right-0 w-3/5 z-5 overflow-hidden transition-opacity duration-500">
          <div className="absolute inset-0  bg-gradient-to-r from-stone-100 to-transparent z-6"></div>
          <Image 
            src={imagePath}
            alt=""
            fill
            className="object-cover object-center opacity-40 transition-opacity  duration-700"
            style={{ objectPosition: '10% center' }}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      );
    })()}
  </div>
</div>

            {/* Scrollable Content Area */}
            <div className="flex-1 border-t-1 border-stone-400/80 overflow-y-auto px-8 py-4 demo-panel">
              {/* Demo Item Grid with Improved Navigation */}
              <div className="relative px-3">
                {/* Paging Navigation - Previous Button with Better Spacing */}
                {currentPage > 0 && (
                  <button 
                    className="absolute right-5 top-1/2 -translate-y-1/2 -ml-8 w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-md border border-slate-200 text-slate-600 hover:text-amber-600 hover:border-amber-400 transition-all z-10"
                    onClick={(e) => { 
                      e.stopPropagation();
                      prevPage();
                    }}
                    aria-label="Previous page"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                )}
                
                {/* Grid of demo items */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 min-h-[400px]">
                  {filteredDemoTexts.length === 0 ? (
                    <div className="col-span-2 text-center py-10 text-slate-500">
                      No sources match your filter criteria
                    </div>
                  ) : (
                    getCurrentPageItems().map((demo, index) => {
                      const globalIndex = currentPage * ITEMS_PER_PAGE + index;
                      const authorLastName = getAuthorLastName(demo.metadata.author);
                      
                      return (
                        <div
                          key={globalIndex}
                          className="group relative"
                          onMouseEnter={() => handleDemoMouseEnter(globalIndex)}
                          onFocus={() => handleDemoMouseEnter(globalIndex)}
                        >
                          <button
                            onClick={() => handleDemoClick(globalIndex)}
                            className={`flex items-center rounded-lg border bg-white transition-all duration-300 w-full text-left overflow-hidden h-[70px] ${
                              selectedDemo === globalIndex 
                                ? 'ring-2 ring-amber-400 border-amber-300 shadow-md' 
                                : 'border-slate-200 shadow-sm hover:shadow hover:border-amber-400'
                            }`}
                            aria-label={`Load demo: ${demo.title}`}
                          >
                            <div className="flex items-center w-full">
                            {/* Emoji container instead of image thumbnails */}
<div className="flex items-center justify-center min-w-18 h-18 rounded-lg bg-slate-50 text-2xl transition-all duration-300 group-hover:bg-amber-200/70 group-hover:text-amber-600 overflow-hidden border-r border-slate-100"> 
  <span className="transition-all duration-300 group-hover:scale-130">
    {demo.emoji}
  </span>
</div>
                              
                              {/* Text Content */}
                              <div className="px-3 py-2 text min-w-0 flex-1">
                                <span className="block font-medium leading-tight text-slate-800 group-hover:text-amber-800 transition-colors text-sm truncate font-sans">
                                  {demo.title}
                                </span>
                                <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 group-hover:text-slate-600">
                                  {demo.description}
                                  </p>
                              </div>
                              
                              {/* Arrow Icon */}
                              <div className="mr-3 text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                </svg>
                              </div>
                            </div>
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
                
                {/* Paging Navigation - Next Button with Better Spacing */}
                {currentPage < totalPages - 1 && (
                  <button 
                    className="absolute right-0 top-1/2 -translate-y-1/2 -mr-7 w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-md border border-slate-200 text-slate-600 hover:text-amber-600 hover:border-amber-300 transition-all z-10"
                    onClick={(e) => { 
                      e.stopPropagation();
                      nextPage();
                    }}
                    aria-label="Next page"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )}
                
                {/* Improved Page Indicators */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-3 mb-2">
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <button
                        key={i}
                        className={`w-2 h-2 rounded-full transition-all ${
                          i === currentPage ? 'bg-amber-500 w-6' : 'bg-slate-300 hover:bg-slate-400'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentPage(i);
                        }}
                        aria-label={`Go to page ${i + 1}`}
                        aria-current={i === currentPage ? 'page' : undefined}
                      />
                    ))}
                  </div>
                )}
              </div>
         
              {/* Quick Start Section */}
              <QuickStartSection 
                handleQuickDemo={handleQuickDemo}
                handleManhattanNarrative={handleManhattanNarrative}
                handleHighlightDemo={handleHighlightDemo}
                handleQuickStartClick={handleQuickStartClick}
              />
            </div>
            
            {/* Footer with Instruction Text - Centered and Styled Better */}
            <div className="bg-gradient-to-r from-slate-100 to-slate-50 px-6 py-3 border-t border-slate-300 text-center">
              <p className="text-xs font-sans text-emerald-700 font-medium">
                <svg className="w-4 h-4 text-emerald-500 inline-block mr-1.5 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Click any source to begin exploring it from different perspectives
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

