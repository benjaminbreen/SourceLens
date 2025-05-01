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
  isDarkMode?: boolean;
  isMobile?: boolean;
}

// --- Enhanced Detail Panel Component ---
const DetailPanel = ({ demo, isDarkMode = false }: { demo: DemoTextItem | null, isDarkMode?: boolean }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  // Animation effect when demo changes
  useEffect(() => {
    setIsVisible(false);
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 10);
    return () => clearTimeout(timer);
  }, [demo]);
  
  if (!demo) {
    return (
      <div className={`relative overflow-hidden rounded-xl ${
        isDarkMode 
          ? 'bg-slate-800/80 border-slate-700 shadow-slate-900/40' 
          : 'bg-white border-slate-300 shadow-lg'
        } border transition-all duration-300 min-h-[200px]`}
      >
        <div className={`${
          isDarkMode 
            ? 'bg-gradient-to-b from-slate-800/30 to-slate-800/80' 
            : 'bg-gradient-to-b from-slate-50/30 to-slate-100/80'
          } absolute inset-0 transition-colors duration-300`}
        >
          {/* Inset Shadow Effect */}
          <div className="absolute inset-0 shadow-[inset_0_1px_8px_rgba(0,0,0,0.25)] pointer-events-none"></div>
        </div>
        <div className="p-6 py-5 mt-10 text-center relative z-10">
          <p className={`${
            isDarkMode ? 'text-slate-500' : 'text-slate-400'
            } text-2xl font-serif italic tracking-wide transition-colors duration-300`}
          >
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
    <div className={`relative overflow-hidden rounded-xl ${
      isDarkMode 
        ? 'bg-slate-800/80 border-slate-700 shadow-slate-900/40' 
        : 'bg-white border-slate-200/80 shadow-lg'
      } border transition-all duration-300 min-h-[200px]`}
    >
      <div className={`${
        isDarkMode 
          ? 'bg-gradient-to-b from-slate-800/10 to-slate-800/40' 
          : 'bg-gradient-to-b from-stone-50/10 to-stone-100/40'
        } absolute inset-0 transition-colors duration-300`}
      >
        {/* Inset Shadow Effect */}
        <div className="absolute inset-0 shadow-[inset_0_1px_8px_rgba(0,0,0,0.15)] pointer-events-none"></div>
      </div>
      <div className={`relative z-10 p-6 py-5 flex gap-6 transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}>
        {/* Left: Thumbnail */}
        <div className="shrink-0">
          <div className={`w-32 h-40 overflow-hidden rounded-md ${
            isDarkMode 
              ? 'bg-slate-700 border-slate-600' 
              : 'bg-slate-100 border-slate-200'
            } shadow-md border relative transition-colors duration-300`}
          >
            <Image 
              src={thumbnailPath}
              alt={demo.title}
              fill
              className={`object-cover ${isDarkMode ? 'opacity-90' : 'opacity-100'} transition-opacity duration-300`}
              onError={(e) => {
                e.currentTarget.src = '/placeholder.jpg';
              }}
            />
          </div>
        </div>
        
        {/* Right: Content */}
        <div className="flex-1 mr-10">
          <h3 className={`font-serif text-xl font-medium ${
            isDarkMode ? 'text-slate-100' : 'text-slate-800'
            } mb-1.5 transition-colors duration-300`}
          >
            {demo.title}
          </h3>
          
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 mr-20 mb-3">
            {demo.metadata.date && (
              <div className="flex items-baseline gap-2">
                <span className={`text-xs uppercase tracking-wide ${
                  isDarkMode ? 'text-slate-400' : 'text-slate-500'
                  } font-medium transition-colors duration-300`}
                >
                  Date
                </span>
                <span className={`text-sm ${
                  isDarkMode ? 'text-slate-300' : 'text-slate-700'
                  } transition-colors duration-300`}
                >
                  {demo.metadata.date}
                </span>
              </div>
            )}
            {demo.metadata.author && (
              <div className="flex items-baseline gap-2">
                <span className={`text-xs uppercase tracking-wide ${
                  isDarkMode ? 'text-slate-400' : 'text-slate-500'
                  } font-medium transition-colors duration-300`}
                >
                  Author
                </span>
                <span className={`text-sm ${
                  isDarkMode ? 'text-slate-300' : 'text-slate-700'
                  } transition-colors duration-300`}
                >
                  {demo.metadata.author}
                </span>
              </div>
            )}
            {demo.metadata.documentType && (
              <div className="flex items-baseline gap-2">
                <span className={`text-xs uppercase tracking-wide ${
                  isDarkMode ? 'text-slate-400' : 'text-slate-500'
                  } font-medium transition-colors duration-300`}
                >
                  Type
                </span>
                <span className={`text-sm ${
                  isDarkMode ? 'text-slate-300' : 'text-slate-700'
                  } transition-colors duration-300`}
                >
                  {demo.metadata.documentType}
                </span>
              </div>
            )}
            {demo.metadata.placeOfPublication && (
              <div className="flex items-baseline gap-2">
                <span className={`text-xs uppercase tracking-wide ${
                  isDarkMode ? 'text-slate-400' : 'text-slate-500'
                  } font-medium transition-colors duration-300`}
                >
                  Origin
                </span>
                <span className={`text-sm ${
                  isDarkMode ? 'text-slate-300' : 'text-slate-700'
                  } transition-colors duration-300`}
                >
                  {demo.metadata.placeOfPublication}
                </span>
              </div>
            )}
          </div>
          
          {/* Summary */}
          {demo.metadata.summary && (
            <p className={`${
              isDarkMode ? 'text-slate-400' : 'text-slate-600'
              } mb-3 line-clamp-2 font-serif italic transition-colors duration-300`}
            >
              {demo.metadata.summary}
            </p>
          )}
          
          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.slice(0, 4).map((tag, idx) => (
                <span 
                  key={idx} 
                  className={`px-2 py-0.5 ${
                    isDarkMode 
                      ? 'bg-slate-700 text-slate-300 border-slate-600' 
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                    } rounded-full text-xs border transition-colors duration-300`}
                >
                  {tag}
                </span>
              ))}
              {tags.length > 4 && 
                <span className={`text-xs ${
                  isDarkMode ? 'text-slate-500' : 'text-slate-400'
                  } self-center transition-colors duration-300`}
                >
                  +{tags.length - 4} more
                </span>
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
  handleQuickStartClick,
  isDarkMode = false 
}: { 
  handleQuickDemo: (index: number, panel: ActivePanelType) => void;
  handleManhattanNarrative: () => void;
  handleHighlightDemo: (index: number, query: string) => void;
  handleQuickStartClick: (action: () => void) => void;
  isDarkMode?: boolean;
}) => {
  return (
    <div className={`${
      isDarkMode 
        ? 'bg-gradient-to-r from-slate-800 to-slate-900 border-slate-700' 
        : 'bg-gradient-to-r from-slate-50 to-white border-slate-200/80'
      } rounded-lg p-5 border mt-4 transition-colors duration-300`}
    >
      <h5 className={`text-base font-serif font-medium ${
        isDarkMode ? 'text-slate-200' : 'text-slate-800'
        } mb-3 flex items-center gap-2 transition-colors duration-300`}
      >
        <svg className={`w-4 h-4 ${
          isDarkMode ? 'text-amber-500' : 'text-amber-600'
          } transition-colors duration-300`} fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        Quick Features
      </h5>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Enhanced Quick Start Buttons */}
        <button 
          onClick={() => handleQuickStartClick(() => handleQuickDemo(0, 'roleplay'))}
          className={`text-left ${
            isDarkMode 
              ? 'bg-slate-800 hover:bg-indigo-900/60 text-slate-300 hover:text-indigo-300 border-slate-700 hover:border-indigo-700' 
              : 'bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border-slate-200 hover:border-indigo-200'
            } text-sm font-medium rounded-md border p-3 transition-all duration-150 ${
              isDarkMode ? 'shadow-none hover:shadow-lg shadow-slate-900/30' : 'shadow-sm hover:shadow'
            } flex items-center gap-3`}
        >
          <div className={`w-10 h-10 rounded-full ${
            isDarkMode 
              ? 'bg-indigo-900/50 border-indigo-800/70' 
              : 'bg-indigo-50 border-indigo-100'
            } border flex items-center justify-center shrink-0 transition-colors duration-300`}
          >
            <span className="text-lg">💬</span>
          </div>
          <div>
            <span className="block font-medium">Simulate: Ancient Complaint</span>
            <span className={`text-xs ${
              isDarkMode ? 'text-slate-400' : 'text-slate-500'
              } transition-colors duration-300`}
            >
              Roleplay with a Sumerian merchant
            </span>
          </div>
        </button>
        
        <button 
          onClick={() => handleQuickStartClick(handleManhattanNarrative)}
          className={`text-left ${
            isDarkMode 
              ? 'bg-slate-800 hover:bg-indigo-900/60 text-slate-300 hover:text-indigo-300 border-slate-700 hover:border-indigo-700' 
              : 'bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border-slate-200 hover:border-indigo-200'
            } text-sm font-medium rounded-md border p-3 transition-all duration-150 ${
              isDarkMode ? 'shadow-none hover:shadow-lg shadow-slate-900/30' : 'shadow-sm hover:shadow'
            } flex items-center gap-3`}
        >
          <div className={`w-10 h-10 rounded-full ${
            isDarkMode 
              ? 'bg-indigo-900/50 border-indigo-800/70' 
              : 'bg-indigo-50 border-indigo-100'
            } border flex items-center justify-center shrink-0 transition-colors duration-300`}
          >
            <span className="text-lg">🏙️</span>
          </div>
          <div>
            <span className="block font-medium">Alternate Perspective</span>
            <span className={`text-xs ${
              isDarkMode ? 'text-slate-400' : 'text-slate-500'
              } transition-colors duration-300`}
            >
              Manhattan Island narrates its history
            </span>
          </div>
        </button>
        
        <button 
          onClick={() => handleQuickStartClick(() => handleQuickDemo(8, 'roleplay'))}
          className={`text-left ${
            isDarkMode 
              ? 'bg-slate-800 hover:bg-indigo-900/60 text-slate-300 hover:text-indigo-300 border-slate-700 hover:border-indigo-700' 
              : 'bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border-slate-200 hover:border-indigo-200'
            } text-sm font-medium rounded-md border p-3 transition-all duration-150 ${
              isDarkMode ? 'shadow-none hover:shadow-lg shadow-slate-900/30' : 'shadow-sm hover:shadow'
            } flex items-center gap-3`}
        >
          <div className={`w-10 h-10 rounded-full ${
            isDarkMode 
              ? 'bg-indigo-900/50 border-indigo-800/70' 
              : 'bg-indigo-50 border-indigo-100'
            } border flex items-center justify-center shrink-0 transition-colors duration-300`}
          >
            <span className="text-lg">🧪</span>
          </div>
          <div>
            <span className="block font-medium">Historical Interview</span>
            <span className={`text-xs ${
              isDarkMode ? 'text-slate-400' : 'text-slate-500'
              } transition-colors duration-300`}
            >
              Discuss cocaine with Sigmund Freud
            </span>
          </div>
        </button>
        
        <button 
          onClick={() => handleQuickStartClick(() => handleHighlightDemo(4, 'highlight ALL names for materia medica in this text that appear to be of Sub-Saharan origin'))}
          className={`text-left ${
            isDarkMode 
              ? 'bg-slate-800 hover:bg-indigo-900/60 text-slate-300 hover:text-indigo-300 border-slate-700 hover:border-indigo-700' 
              : 'bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border-slate-200 hover:border-indigo-200'
            } text-sm font-medium rounded-md border p-3 transition-all duration-150 ${
              isDarkMode ? 'shadow-none hover:shadow-lg shadow-slate-900/30' : 'shadow-sm hover:shadow'
            } flex items-center gap-3`}
        >
          <div className={`w-10 h-10 rounded-full ${
            isDarkMode 
              ? 'bg-indigo-900/50 border-indigo-800/70' 
              : 'bg-indigo-50 border-indigo-100'
            } border flex items-center justify-center shrink-0 transition-colors duration-300`}
          >
            <span className="text-lg">✨</span>
          </div>
          <div>
            <span className="block font-medium">Interactive Highlight</span>
            <span className={`text-xs ${
              isDarkMode ? 'text-slate-400' : 'text-slate-500'
              } transition-colors duration-300`}
            >
              Find African terms in a colonial text
            </span>
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
  setFilterBy,
  isDarkMode = false
}: {
  demoTexts: DemoTextItem[];
  filterBy: { genre: string; era: string };
  setFilterBy: (filters: { genre: string; era: string }) => void;
  isDarkMode?: boolean;
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
          className={`appearance-none pl-3 pr-8 py-1 text-sm font-medium ${
            isDarkMode 
              ? 'text-slate-300 bg-slate-800 border-slate-700 focus:ring-amber-500 focus:border-amber-500' 
              : 'text-slate-700 bg-white border-slate-200 focus:ring-amber-400 focus:border-amber-400'
            } border rounded-md shadow-sm focus:outline-none focus:ring-1 transition-colors duration-300`}
        >
          <option value="">All Genres</option>
          {genres.map((genre, idx) => (
            <option key={idx} value={genre}>
              {genre}
            </option>
          ))}
        </select>
        <div className={`pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 ${
          isDarkMode ? 'text-slate-500' : 'text-slate-400'
          } transition-colors duration-300`}
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      
      <div className="relative">
        <select
          value={filterBy.era}
          onChange={(e) => setFilterBy({ ...filterBy, era: e.target.value })}
          className={`appearance-none pl-3 pr-8 py-1 text-sm font-medium ${
            isDarkMode 
              ? 'text-slate-300 bg-slate-800 border-slate-700 focus:ring-amber-500 focus:border-amber-500' 
              : 'text-slate-700 bg-white border-slate-200 focus:ring-amber-400 focus:border-amber-400'
            } border rounded-md shadow-sm focus:outline-none focus:ring-1 transition-colors duration-300`}
        >
          {eras.map((era, idx) => (
            <option key={idx} value={era.value}>
              {era.label}
            </option>
          ))}
        </select>
        <div className={`pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 ${
          isDarkMode ? 'text-slate-500' : 'text-slate-400'
          } transition-colors duration-300`}
        >
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
  isDarkMode = false
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
  
    {/* Demo Button with improved hover effects */}
    <button
      ref={buttonRef}
      onClick={toggleDemoOptions}
      className={`relative z-1 text-md hover:scale-105 transform ${
        isDarkMode 
          ? 'text-indigo-100 bg-indigo-900/90 hover:bg-indigo-800/90 hover:text-indigo-100 border-indigo-700 hover:border-indigo-600' 
          : 'text-indigo-800 bg-indigo-50 hover:bg-indigo-50/50 hover:text-indigo-700 border-indigo-300 hover:border-indigo-400'
        } border-2 font-semibold flex items-center gap-1.5 px-4 py-3 rounded-full transition-all duration-300 ${
          isDarkMode ? 'shadow-lg shadow-black/20' : 'shadow-md hover:shadow-lg shadow-indigo-200/50 hover:shadow-indigo-200'
        }`}
      aria-expanded={showDemoOptions}
      aria-controls="demo-modal-content"
    >
      <svg className={`w-5 h-5 ${isDarkMode ? 'text-indigo-200' : 'text-indigo-700'} transition-colors duration-300`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
      <span>See how it works</span>
    </button>

      {/* Modal Overlay with Improved Animation */}
      {showDemoOptions && (
        <div
          className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in transition-colors duration-300"
          onClick={() => setShowDemoOptions(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="demo-modal-title"
        >
          {/* Modal Panel */}
          <div
            ref={dropdownRef}
            id="demo-modal-content"
            className={`${
              isDarkMode 
                ? 'bg-slate-900 border-slate-700 shadow-slate-900/80' 
                : 'bg-white border-slate-200/70 shadow-2xl'
              } rounded-xl shadow-2xl w-full max-w-5xl max-h-[82vh] flex flex-col overflow-hidden border animate-in fade-in transition-colors duration-300`}
            onClick={e => e.stopPropagation()}
          >
            {/* Header with Filter Options */}
            <div className={`flex items-center justify-between p-3 border-b ${
              isDarkMode ? 'border-slate-700 bg-gradient-to-r from-slate-900 to-slate-700' : 'border-slate-200 bg-gradient-to-r from-white to-slate-100'
              } transition-colors duration-300`}
            >
              <div className="flex items-center gap-3">
                <h4 id="demo-modal-title" className={`text-2xl font-serif font-bold ${
                  isDarkMode ? 'text-slate-100' : 'text-slate-800'
                  } flex items-center gap-2 transition-colors duration-300`}
                >
                  <svg className={`w-5 h-5 ${isDarkMode ? 'text-amber-500' : 'text-amber-600'} transition-colors duration-300`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  isDarkMode={isDarkMode}
                />
                
                <button 
                  onClick={() => setShowDemoOptions(false)} 
                  className={`${
                    isDarkMode 
                      ? 'text-slate-500 hover:text-slate-300 hover:bg-slate-800' 
                      : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                    } p-1.5 rounded-full transition-colors duration-300`}
                  aria-label="Close examples"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Detail Panel Area with Skeuomorphic Design */}
            <div className={`relative ${
              isDarkMode 
                ? 'bg-slate-800 border-b border-slate-700' 
                : 'bg-stone-200 border-b border-slate-300'
              } px-20 py-6 shadow-inner h-[320px] flex items-center justify-center transition-colors duration-300`}
            >
              {/* Inset Shadow Effect */}
              <div className="absolute inset-0 shadow-[inset_0_3px_10px_rgba(0,0,0,0.3)] pointer-events-none z-20"></div>
              
              {/* Content Panel with Animation */}
              <div className="w-full relative z-10">
                <DetailPanel demo={selectedDetailDemo !== null ? filteredDemoTexts[selectedDetailDemo] : null} isDarkMode={isDarkMode} />
              </div>
            </div>

            {/* Scrollable Content Area */}
            <div className={`flex-1 ${
              isDarkMode ? 'border-t-1 border-slate-700' : 'border-t-1 border-stone-400/80'
              } overflow-y-auto px-8 py-4 demo-panel ${
                isDarkMode ? 'bg-slate-900' : 'bg-white'
              } transition-colors duration-300`}
            >
              {/* Demo Item Grid with Improved Navigation */}
              <div className="relative px-3">
                {/* Paging Navigation - Previous Button with Better Spacing */}
                {currentPage > 0 && (
                  <button 
                    className={`absolute right-5 top-1/2 -translate-y-1/2 -ml-8 w-10 h-10 flex items-center justify-center rounded-full ${
                      isDarkMode 
                        ? 'bg-slate-800 shadow-lg border-slate-700 text-slate-400 hover:text-amber-400 hover:border-indigo-700' 
                        : 'bg-white shadow-md border-slate-200 text-slate-600 hover:text-amber-600 hover:border-amber-400'
                      } border transition-all z-10`}
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
                    <div className={`col-span-2 text-center py-10 ${
                      isDarkMode ? 'text-slate-400' : 'text-slate-500'
                      } transition-colors duration-300`}
                    >
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
                            className={`flex items-center rounded-lg border ${
                              isDarkMode 
                                ? selectedDemo === globalIndex 
                                  ? 'ring-2 ring-indigo-500 border-amber-700 bg-slate-800 shadow-lg' 
                                  : 'border-slate-700 bg-slate-800 shadow-sm hover:shadow hover:border-amber-700'
                                : selectedDemo === globalIndex 
                                  ? 'ring-2 ring-amber-400 border-amber-300 bg-white shadow-md' 
                                  : 'border-slate-200 bg-white shadow-sm hover:shadow hover:border-amber-400'
                              } transition-all duration-300 w-full text-left overflow-hidden h-[70px]`}
                            aria-label={`Load demo: ${demo.title}`}
                          >
                            <div className="flex items-center w-full">
                              {/* Emoji container */}
                              <div className={`flex items-center justify-center min-w-18 h-18 rounded-lg ${
                                isDarkMode 
                                  ? 'bg-slate-700 text-2xl group-hover:bg-amber-900/60 group-hover:text-amber-300' 
                                  : 'bg-slate-50 text-2xl group-hover:bg-amber-200/70 group-hover:text-amber-600'
                                } transition-all duration-300 border-r ${
                                  isDarkMode ? 'border-slate-700' : 'border-slate-100'
                                } overflow-hidden`}
                              > 
                                <span className="transition-all duration-300 group-hover:scale-130">
                                  {demo.emoji}
                                </span>
                              </div>
                              
                              {/* Text Content */}
                              <div className="px-3 py-2 text min-w-0 flex-1">
                                <span className={`block font-medium leading-tight ${
                                  isDarkMode 
                                    ? 'text-slate-200 group-hover:text-amber-300' 
                                    : 'text-slate-800 group-hover:text-amber-800'
                                  } transition-colors text-sm truncate font-sans`}
                                >
                                  {demo.title}
                                </span>
                                <p className={`text-xs ${
                                  isDarkMode 
                                    ? 'text-slate-400 group-hover:text-slate-300' 
                                    : 'text-slate-500 group-hover:text-slate-600'
                                  } mt-0.5 line-clamp-2 transition-colors`}
                                >
                                  {demo.description}
                                </p>
                              </div>
                              
                              {/* Arrow Icon */}
                              <div className={`mr-3 ${
                                isDarkMode ? 'text-amber-500' : 'text-amber-400'
                                } opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                              >
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
                    className={`absolute right-0 top-1/2 -translate-y-1/2 -mr-7 w-8 h-8 flex items-center justify-center rounded-full ${
                      isDarkMode 
                        ? 'bg-slate-800 shadow-lg border-slate-700 text-slate-400 hover:text-amber-400 hover:border-amber-700' 
                        : 'bg-white shadow-md border-slate-200 text-slate-600 hover:text-amber-600 hover:border-amber-300'
                      } border transition-all z-10`}
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
                          i === currentPage 
                            ? isDarkMode ? 'bg-amber-500 w-6' : 'bg-amber-500 w-6' 
                            : isDarkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-300 hover:bg-slate-400'
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
                isDarkMode={isDarkMode}
              />
            </div>
            
            {/* Footer with Instruction Text - Centered and Styled Better */}
            <div className={`${
              isDarkMode 
                ? 'bg-gradient-to-r from-slate-800 to-slate-900 border-t border-slate-700' 
                : 'bg-gradient-to-r from-slate-100 to-slate-50 border-t border-slate-300'
              } px-6 py-3 text-center transition-colors duration-300`}
            >
              <p className={`text-xs font-sans ${
                isDarkMode ? 'text-emerald-400 font-medium' : 'text-emerald-700 font-medium'
                } transition-colors duration-300`}
              >
                <svg className={`w-4 h-4 ${
                  isDarkMode ? 'text-emerald-400' : 'text-emerald-500'
                  } inline-block mr-1.5 mb-0.5 transition-colors duration-300`} fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
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