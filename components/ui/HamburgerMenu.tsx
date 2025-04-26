// components/ui/HamburgerMenu.tsx
// Enhanced slide-in hamburger menu with dark mode support and recent sources
// Features improved mobile responsiveness, recent sources with drag support,
// and visual enhancements that match the app's design language

'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import AboutModal from './AboutModal';
import Image from 'next/image';
import AboutLogoModal from './AboutLogoModal';
import { useAppStore, Metadata } from '@/lib/store'; 
import { useLibrary, SavedSource } from '@/lib/libraryContext';
import { format, formatDistanceToNow } from 'date-fns';
import { DragHandleDots2Icon, ExternalLinkIcon } from '@radix-ui/react-icons';


export default function HamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showAboutLogoModal, setShowAboutLogoModal] = useState(false);
  const [recentSources, setRecentSources] = useState<SavedSource[]>([]);
  const [activeDragItem, setActiveDragItem] = useState<string | null>(null);
  const [isLoadingSources, setIsLoadingSources] = useState(true);
  
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const isDarkMode = useAppStore(state => state.isDarkMode);
  const { sources, isLoading: libraryLoading } = useLibrary();
  const { 
    setSourceContent, 
    setMetadata, 
    setSourceType, 
    setSourceThumbnailUrl,
    setLoading 
  } = useAppStore();

  interface MenuItem {
    label: string;
    href?: string;
    icon: React.ReactNode;
    onClick?: () => void;
    target?: string;
  }
  
  // Load recent sources when component mounts
  useEffect(() => {
    if (!libraryLoading && sources) {
      // Sort sources by lastAccessed time (most recent first)
      const sortedSources = [...sources].sort((a, b) => 
        (b.lastAccessed || b.dateAdded) - (a.lastAccessed || a.dateAdded)
      );
      setRecentSources(sortedSources.slice(0, 5));
      setIsLoadingSources(false);
    }
  }, [libraryLoading, sources]);
  
  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle escape key to close menu and modal
  useEffect(() => {
    function handleEscKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setShowAboutModal(false);
        setShowAboutLogoModal(false);
      }
    }
    
    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, []);

  // Handle body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Function to handle sharing
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'SourceLens',
        text: 'SourceLens - made by a historian for professionals who want to use AI in research wisely. Contra AI-induced brain rot, and pro augmented creativity.',
        url: window.location.href,
      })
      .then(() => console.log('Successful share'))
      .catch((error) => console.log('Error sharing:', error));
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(window.location.href)
        .then(() => {
          alert('Link copied to clipboard!');
        })
        .catch(err => {
          console.error('Failed to copy: ', err);
        });
    }
    setIsOpen(false);
  };
  
  // Handle drag start
  const handleDragStart = (source: SavedSource, e: React.DragEvent) => {
    e.dataTransfer.setData('application/sourceLens', JSON.stringify(source));
    e.dataTransfer.effectAllowed = 'copy';
    setActiveDragItem(source.id);
    
    // Set a drag image
    const dragImage = document.createElement('div');
    dragImage.className = `${isDarkMode ? 'bg-slate-800' : 'bg-white'} p-2 rounded shadow-lg border border-indigo-500`;
    dragImage.innerHTML = `<div class="text-sm font-medium">${source.metadata?.title || 'Untitled source'}</div>`;
    dragImage.style.position = 'absolute';
    dragImage.style.top = '-1000px';
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 0, 0);
    
    setTimeout(() => {
      document.body.removeChild(dragImage);
    }, 0);
  };
  
  // Handle drag end
  const handleDragEnd = () => {
    setActiveDragItem(null);
  };
  
  // Handle opening a source
  const handleOpenSource = async (source: SavedSource) => {
    setIsOpen(false);
    setLoading(true);
    
    try {
      // Set app state
      setSourceContent(source.content);
      setSourceType(source.type);
      setMetadata(source.metadata);
      
      // Set thumbnail URL if available
      if (source.thumbnailUrl) {
        setSourceThumbnailUrl(source.thumbnailUrl);
      }
      
      // Navigate to analysis page
      router.push('/analysis');
    } catch (error) {
      console.error('Error opening source:', error);
      setLoading(false);
      alert('Sorry, there was an error opening this source.');
    }
  };
  
  // Determine if we're in analysis page to enable the back button
  const isInAnalysisSubpage = pathname && pathname.includes('/analysis/');
  
  // Navigation group
  const navigationItems = [
    { 
      label: 'Home', 
      href: '/',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    { 
      label: 'Analysis Page', 
      href: '/analysis',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      )
    },
    { 
      label: 'Dashboard', 
      href: '/dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      )
    }
  ];

  // Library group
  const libraryItems = [
    { 
      label: 'Saved Sources', 
      href: '/library?tab=sources',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      )
    },
    { 
      label: 'Research Notes', 
      href: '/library?tab=notes',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      )
    },
    { 
      label: 'References', 
      href: '/library?tab=references',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    },
    { 
      label: 'Drafts', 
      href: '/library?tab=drafts',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
  ];

  // Actions group
  const actionItems = [
    { 
      label: 'Share', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
      ),
      onClick: handleShare
    }
  ];

  // Info group
  const infoItems = [
    { 
      label: 'About', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      onClick: () => {
        setShowAboutModal(true);
        setIsOpen(false);
      }
    },
    { 
      label: 'Documentation', 
      href: '#', 
      onClick: () => window.alert('Documentation coming soon!'),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    { 
      label: 'GitHub', 
      href: 'https://github.com/benjaminbreen/SourceLens/tree/main', 
      target: '_blank',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z" />
        </svg>
      )
    }
  ];

  // Account group
  const accountItems = [
    { 
      label: 'Sign Out', 
      href: '#',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      )
    }
  ];

  // Get source type icon
  const getSourceTypeIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return (
          <svg className={`w-4 h-4 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        );
      case 'image':
        return (
          <svg className={`w-4 h-4 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      default:
        return (
          <svg className={`w-4 h-4 ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
    }
  };

  // Helper function to render menu items with consistent styling and section-specific hover colors
  const renderMenuItem = (item: MenuItem, index: number, section: string = 'default') => {
    // Different hover colors based on section
    const hoverColorClasses = {
      default: isDarkMode 
        ? "hover:bg-slate-700 hover:text-white" 
        : "hover:bg-indigo-50 hover:text-indigo-700",
      library: isDarkMode 
        ? "hover:bg-slate-700/80 hover:text-indigo-300" 
        : "hover:bg-indigo-50/80 hover:text-indigo-600",
      actions: isDarkMode 
        ? "hover:bg-slate-700/80 hover:text-emerald-300" 
        : "hover:bg-emerald-50/80 hover:text-emerald-600",
      info: isDarkMode 
        ? "hover:bg-slate-700/80 hover:text-amber-300" 
        : "hover:bg-amber-50/80 hover:text-amber-600",
      account: isDarkMode 
        ? "hover:bg-slate-700 hover:text-white" 
        : "hover:bg-slate-100 hover:text-slate-800"
    };
    
    const hoverClass = hoverColorClasses[section as keyof typeof hoverColorClasses] || hoverColorClasses.default;
    
    // Background and text class based on dark mode
    const bgClass = isDarkMode 
      ? section === 'account' ? "bg-slate-800" : ""
      : section === 'account' ? "bg-slate-50" : "";
    
    const textClass = isDarkMode
      ? "text-slate-300"
      : "text-slate-700";
    
    return item.href && !item.onClick ? (
      <Link 
        key={index} 
        href={item.href}
        target={item.target}
        className={`flex items-center gap-3 px-4 py-2.5 text-md font-medium ${textClass} ${hoverClass} ${bgClass} transition-colors`}
        onClick={() => setIsOpen(false)}
      >
        <span className={`${
          section === 'library' ? isDarkMode ? 'text-indigo-400' : 'text-indigo-500' : 
          section === 'actions' ? isDarkMode ? 'text-emerald-400' : 'text-emerald-500' : 
          section === 'info' ? isDarkMode ? 'text-amber-400' : 'text-amber-500' : 
          section === 'account' ? isDarkMode ? 'text-slate-400' : 'text-slate-500' : 
          isDarkMode ? 'text-indigo-400' : 'text-indigo-500'
        }`}>{item.icon}</span>
        {item.label}
      </Link>
    ) : (
      <button 
        key={index} 
        onClick={item.onClick || (() => {
          if (item.href) {
            router.push(item.href);
          }
          setIsOpen(false);
        })}
        className={`flex items-center gap-3 px-4 py-2.5 text-md font-medium ${textClass} ${hoverClass} ${bgClass} transition-colors w-full text-left`}
      >
        <span className={`${
          section === 'library' ? isDarkMode ? 'text-indigo-400' : 'text-indigo-500' : 
          section === 'actions' ? isDarkMode ? 'text-emerald-400' : 'text-emerald-500' : 
          section === 'info' ? isDarkMode ? 'text-amber-400' : 'text-amber-500' : 
          section === 'account' ? isDarkMode ? 'text-slate-400' : 'text-slate-500' : 
          isDarkMode ? 'text-indigo-400' : 'text-indigo-500'
        }`}>{item.icon}</span>
        {item.label}
      </button>
    )
  };

  return (
    <div className="relative z-50" ref={menuRef}>
      {/* Hamburger button with improved dark mode support */}
      <button 
        className={`flex items-center justify-center w-12 h-12 rounded-full ${
          isDarkMode
            ? isOpen 
              ? 'bg-slate-700 text-white' 
              : 'bg-slate-800/40 text-white hover:bg-slate-700/60'
            : isOpen 
              ? 'bg-indigo-100 text-indigo-900' 
              : 'bg-white/20 text-white hover:bg-white/30'
        } backdrop-blur-md transition-all duration-250 focus:outline-none ring-0 focus:ring-3 ${
          isDarkMode ? 'focus:ring-indigo-500/30' : 'focus:ring-white/30'
        }`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
        aria-expanded={isOpen}
      >
        <div className="relative flex items-center justify-center w-6 h-6">
          {/* Top bar */}
          <span 
            className={`absolute h-0.5 w-6 ${isDarkMode ? 'bg-slate-200' : 'bg-white'} rounded-full transform transition-all duration-300 ease-in-out ${
              isOpen ? 'rotate-45 top-1/2' : 'rotate-0 top-[3px]'
            }`}
          ></span>
          
          {/* Middle bar */}
          <span 
            className={`absolute h-0.5 w-6 ${isDarkMode ? 'bg-slate-200' : 'bg-white'} rounded-full transition-all duration-200 top-1/2 -translate-y-1/2 ${
              isOpen ? 'opacity-0' : 'opacity-100'
            }`}
          ></span>
          
          {/* Bottom bar */}
          <span 
            className={`absolute h-0.5 w-6 ${isDarkMode ? 'bg-slate-200' : 'bg-white'} rounded-full transform transition-all duration-300 ease-in-out ${
              isOpen ? '-rotate-45 top-1/2' : 'rotate-0 bottom-[3px]'
            }`}
          ></span>
        </div>
      </button>
      
      {/* Slide-in menu and overlay */}
      {isOpen && (
        <>
          {/* Backdrop overlay with dark mode support */}
          <div 
            className={`fixed inset-0 ${
              isDarkMode ? 'bg-black/60' : 'bg-black/30'
            }  z-40 transition-opacity duration-300 ease-in-out`}
            onClick={() => setIsOpen(false)}
          ></div>
          
          {/* Slide-in panel container */}
          <div className="fixed inset-y-0 top-0 left-0 max-w-[320px] w-[90vw] z-50 flex">
            {/* Actual menu panel with dark mode support */}
            <div 
              className={`flex rounded-r-xl flex-col h-full w-full ${
                isDarkMode
                  ? 'bg-slate-900/98 text-slate-200'
                  : 'bg-white/98 text-slate-800'
              } backdrop-blur-md shadow-2xl overflow-y-auto animate-in slide-in-from-left duration-300`}
            >
              {/* Gradient line at top */}
              <div className="h-2 w-full bg-gradient-to-r from-amber-400 via-purple-400 to-indigo-400"></div>
              
              {/* Logo and app name section */}
              <div className={`flex items-center p-4 border-b ${
                isDarkMode ? 'border-slate-800' : 'border-slate-100'
              }`}>
                <button
                  onClick={() => setShowAboutLogoModal(true)}
                  className={`mr-3 transition-transform duration-300 rounded-full border-2 ${
                    isDarkMode
                      ? 'border-indigo-500/60 shadow-lg shadow-indigo-500/20 hover:border-indigo-400 hover:shadow-indigo-400/40'
                      : 'border-indigo-400 bg-gray-900/90 shadow shadow-indigo-500/20 hover:border-indigo-600 hover:shadow-indigo-500/40'
                  } hover:scale-110 hover:rotate-4 transition-all duration-300 focus:outline-none`}
                >
                  <div className="relative w-12 h-12 overflow-hidden transition-all duration-300">
                    <Image 
                      src="/sourcelenslogo.png" 
                      alt="SourceLens Logo"
                      fill
                      className="object-contain"
                      priority
                    />
                  </div>
                </button>

                <div>
                  <h2 className={`font-bold text-xl ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>SourceLens</h2>
                  <p className={`font-serif font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Research creatively.</p>
                  <p className={`text-xs italic ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>An AI source analysis tool for pro researchers</p>
                </div>
              </div>
              
                            {/* Recent sources section - New addition */}
              {recentSources.length > 0 && (
                <div className={`px-4 pt-4 pb-2 border-b ${
                  isDarkMode ? 'border-slate-800' : 'border-slate-100'
                }`}>
                  <h3 className={`text-xs font-semibold ${
                    isDarkMode ? 'text-slate-400' : 'text-slate-500'
                  } uppercase tracking-wider mb-3`}>
                    Recent Sources <span className="text-xs normal-case font-normal ml-1">(drag to use)</span>
                  </h3>
                  
                  <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                    {isLoadingSources ? (
                      <div className={`flex justify-center py-6 ${
                        isDarkMode ? 'text-slate-500' : 'text-slate-400'
                      }`}>
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </div>
                    ) : (
                      recentSources.map((source) => (
                        <div 
                          key={source.id}
                          className={`${
                            isDarkMode 
                              ? 'bg-slate-800 border border-slate-700 hover:bg-slate-700'
                              : 'bg-white border border-slate-200 hover:bg-slate-50'
                          } rounded-md p-2 ${
                            activeDragItem === source.id ? 'ring-2 ring-indigo-500 opacity-80' : ''
                          } transition-colors cursor-grab`}
                          draggable
                          onDragStart={(e) => handleDragStart(source, e)}
                          onDragEnd={handleDragEnd}
                          onClick={() => handleOpenSource(source)}
                        >
                          <div className="flex justify-between items-start gap-2">
                            <div className="flex items-start gap-2 min-w-0 flex-1">
                              <div className="mt-0.5">
                                {getSourceTypeIcon(source.type)}
                              </div>
                              <div className="min-w-0 flex-1">
                                <h4 className={`font-medium text-sm truncate ${
                                  isDarkMode ? 'text-slate-200' : 'text-slate-800'
                                }`}>
                                  {source.metadata?.title || 'Untitled document'}
                                </h4>
                                <p className={`text-xs truncate ${
                                  isDarkMode ? 'text-slate-400' : 'text-slate-500'
                                }`}>
                                  {source.metadata?.author && `${source.metadata.author}, `}
                                  {source.metadata?.date || 'Unknown date'}
                                </p>
                              </div>
                            </div>
                            <div className={`text-xs font-mono mt-0.5 ${
                              isDarkMode ? 'text-slate-500' : 'text-slate-400'
                            }`}>
                              <span className="drag-handle">
                                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M4 4H4.01M4 8H4.01M4 12H4.01M8 4H8.01M8 8H8.01M8 12H8.01M12 4H12.01M12 8H12.01M12 12H12.01" 
                                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </span>
                            </div>
                          </div>
                          <p className={`text-xs line-clamp-1 mt-1 ${
                            isDarkMode ? 'text-slate-400' : 'text-slate-600'
                          }`}>
                            {source.content.substring(0, 60)}...
                          </p>
                          <div className={`flex items-center justify-between mt-2 pt-1 border-t ${
                            isDarkMode ? 'border-slate-700' : 'border-slate-100'
                          }`}>
                            <span className={`text-xs ${
                              isDarkMode ? 'text-slate-500' : 'text-slate-400'
                            }`}>
                              {source.lastAccessed 
                                ? formatDistanceToNow(new Date(source.lastAccessed), { addSuffix: true })
                                : 'Never accessed'}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenSource(source);
                              }}
                              className={`p-1 rounded text-xs flex items-center gap-1 ${
                                isDarkMode
                                  ? 'text-indigo-400 hover:text-indigo-300 hover:bg-slate-700/70'
                                  : 'text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50/80'
                              }`}
                            >
                              <span>Open</span>
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  
                  <div className="mt-2 text-right">
                    <button 
                      onClick={() => {
                        router.push('/library?tab=sources');
                        setIsOpen(false);
                      }}
                      className={`text-xs ${
                        isDarkMode 
                          ? 'text-indigo-400 hover:text-indigo-300'
                          : 'text-indigo-600 hover:text-indigo-800'
                      } hover:underline inline-flex items-center gap-1`}
                    >
                      <span>View all sources</span>
                      <ExternalLinkIcon className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              )}
              
              {/* Navigation section */}
              <div className={`py-2 ${
                isDarkMode ? 'border-b border-slate-800' : 'border-b border-slate-100'
              }`}>
                {navigationItems.map((item, index) => renderMenuItem(item, index, 'default'))}
              </div>

              {/* Library section with header */}
              <div className={`pt-1 pb-2 ${
                isDarkMode ? 'border-b border-slate-800' : 'border-b border-slate-100'
              }`}>
                <div className="px-4 py-1">
                  <h3 className={`text-xs font-semibold ${
                    isDarkMode ? 'text-slate-400' : 'text-slate-500'
                  } uppercase tracking-wider`}>
                    Library
                  </h3>
                </div>
                {libraryItems.map((item, index) => renderMenuItem(item, index, 'library'))}
              </div>
              
              {/* Actions section */}
              <div className={`pt-1 pb-2 ${
                isDarkMode ? 'border-b border-slate-800' : 'border-b border-slate-100'
              }`}>
                <div className="px-4 py-1">
                  <h3 className={`text-xs font-semibold ${
                    isDarkMode ? 'text-slate-400' : 'text-slate-500'
                  } uppercase tracking-wider`}>
                    Actions
                  </h3>
                </div>
                {actionItems.map((item, index) => renderMenuItem(item, index, 'actions'))}
              </div>
              
              {/* Info section */}
              <div className={`pt-1 pb-2 ${
                isDarkMode ? 'border-b border-slate-800' : 'border-b border-slate-100'
              }`}>
                <div className="px-4 py-1">
                  <h3 className={`text-xs font-semibold ${
                    isDarkMode ? 'text-slate-400' : 'text-slate-500'
                  } uppercase tracking-wider`}>
                    Info
                  </h3>
                </div>
                {infoItems.map((item, index) => renderMenuItem(item, index, 'info'))}
              </div>
              
              {/* Push account to the bottom with flex spacer */}
              <div className="flex-grow"></div>
              
              {/* Dark mode toggle - New addition */}
              <div className={`px-4 py-3 ${
                isDarkMode ? 'border-t border-slate-800' : 'border-t border-slate-100'
              }`}>
                <button
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-md ${
                    isDarkMode
                      ? 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                      : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                  } transition-colors`}
                  onClick={() => {
                    useAppStore.getState().toggleDarkMode();
                  }}
                >
                  <span className="flex items-center gap-2 font-medium">
                    {isDarkMode ? (
                      <>
                        <svg className="w-4 h-4 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        Light Mode
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                        </svg>
                        Dark Mode
                      </>
                    )}
                  </span>
                  <div className={`relative w-10 h-5 rounded-full transition-colors ${
                    isDarkMode ? 'bg-indigo-600' : 'bg-slate-300'
                  }`}>
                    <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transform transition-transform ${
                      isDarkMode ? 'translate-x-5' : 'translate-x-0'
                    }`}></div>
                  </div>
                </button>
              </div>
              
              
              
              {/* App version info */}
              <div className={`${
                isDarkMode ? 'bg-slate-800 text-slate-500' : 'bg-slate-50 text-slate-400'
              } text-xs px-4 py-2 text-center border-t ${
                isDarkMode ? 'border-slate-700' : 'border-slate-200'
              }`}>
                SourceLens v1.0.0 • {new Date().getFullYear()}
              </div>
            </div>
          </div>
        </>
      )}
      
      {/* Modals */}
      <AboutModal 
        isOpen={showAboutModal}
        onClose={() => setShowAboutModal(false)}
        isDarkMode={isDarkMode}
      />

      <AboutLogoModal 
        isOpen={showAboutLogoModal} 
        onClose={() => setShowAboutLogoModal(false)} 
        darkMode={isDarkMode}
      />
    </div>
  );
}