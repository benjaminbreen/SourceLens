// components/ui/TopNavigation.tsx
// Modern mega menu navigation with screenshot previews for unregistered users
// Features click-based menus, elegant transitions, dark/light mode support, and improved screenshot previews

'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { Inter, Roboto_Mono } from 'next/font/google';
import { motion, AnimatePresence } from 'framer-motion';
import AboutModal from './AboutModal';
import FAQModal from './FAQModal';
import AccountButton from '@/components/auth/AccountButton';
import AuthStatus from '@/components/auth/AuthStatus';
import { useAuth } from '@/lib/auth/authContext';
import { Space_Grotesk } from 'next/font/google';
import { useAppStore } from '@/lib/store'; // Import for dark mode
import AboutLogoModal from './AboutLogoModal';
import TermsModal from './TermsModal';
import ColophonModal from './ColophonModal';
import PrivacyModal from './PrivacyModal';


const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  weight: ['300', '400', '500', '600', '700',],
  variable: '--font-space-grotesk',
});

// Import fonts
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const mono = Roboto_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
});

type MegaMenuSection = {
  title: string;
  items: {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    href?: string;
    onClick?: () => void;
    screenshot?: string; // Path to screenshot relative to /public/screenshots/
    requiresAuth?: boolean; // Whether this feature requires authentication
  }[];
};

interface TopNavigationProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export default function TopNavigation({ isDarkMode, toggleDarkMode }: TopNavigationProps) {
  const [scrolled, setScrolled] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showAboutLogoModal, setShowAboutLogoModal] = useState(false);
  const [showFAQModal, setShowFAQModal] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSubmenuOpen, setMobileSubmenuOpen] = useState<string | null>(null);
  const { user } = useAuth();
  const pathname = usePathname();
  const megaMenuRef = useRef<HTMLDivElement>(null);
  const navRef      = useRef<HTMLDivElement>(null);
  const router = useRouter();
const [showTermsModal, setShowTermsModal] = useState(false);
const [showPrivacyModal, setShowPrivacyModal] = useState(false);
const [showColophonModal, setShowColophonModal] = useState(false);

  // State for screenshot preview
  const [previewItem, setPreviewItem] = useState<{
    id: string;
    screenshot: string;
    title: string;
    description: string;
  } | null>(null);
  
  // Handle scroll effects with smooth transitions
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      setScrolled(offset > 20);
    };
    
    // Initial check
    handleScroll();
    
    // Add event listener
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Close mega menu when clicking outside
 useEffect(() => {
   const handleClickOutside = (event: MouseEvent) => {
     const target = event.target as Node;
     if (
       megaMenuRef.current &&
       !megaMenuRef.current.contains(target) &&
       navRef.current &&
       !navRef.current.contains(target)
     ) {
       setActiveMenu(null);
       setPreviewItem(null);
     }
   };

   document.addEventListener('mousedown', handleClickOutside);
   return () => document.removeEventListener('mousedown', handleClickOutside);
 }, []);

  // Close mega menu on escape key
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActiveMenu(null);
        setMobileMenuOpen(false);
        setMobileSubmenuOpen(null);
        setPreviewItem(null);
      }
    };
    
    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [mobileMenuOpen]);



  // Mega menu structure for Analysis
  const analysisMenu: MegaMenuSection[] = [
    {
      title: 'Analysis Tools',
      items: [
        {
          id: 'textAnalysis',
          title: 'Text Analysis',
          description: 'Analyze documents with AI-powered insights',
          icon: (
            <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          ),
          href: '/docs?slug=features/analysis-tools/basic-analysis',
          screenshot: 'textanalysis.jpg',
          requiresAuth: false
        },
        {
          id: 'counterNarrative',
          title: 'Counter-Narrative',
          description: 'Explore alternative interpretations',
          icon: (
            <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m-4 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          ),
          href: '/docs?slug=features/counter-narrative#types-of-counter-narratives',
          screenshot: 'counternarrative.jpg',
          requiresAuth: false
        },
        {
          id: 'simulate',
          title: 'Simulation Mode',
          description: 'Engage with historical figures via AI simulation',
          icon: (
            <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
            </svg>
          ),
          href: '/docs?slug=features/simulation-mode#best-practices',
          screenshot: 'simulation.jpg',
          requiresAuth: false
        },
      ],
    },
    {
      title: 'Advanced Features',
      items: [
        {
          id: 'extractInfo',
          title: 'Extract Information',
          description: 'Pull structured data from unstructured sources',
          icon: (
            <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2M9 5V3m6 0v2" />
            </svg>
          ),
          href: '/docs?slug=features/analysis-tools/information-extraction#extraction-types',
          screenshot: 'extractinfo.jpg',
          requiresAuth: false
        },
        {
          id: 'highlight',
          title: 'Text Highlighting',
          description: 'Highlight key passages in your documents',
          icon: (
            <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          ),
          href: '/docs?slug=features/text-highlighting#highlight-criteria-examples',
          screenshot: 'highlight.jpg',
          requiresAuth: false
        },
        {
          id: 'connections',
          title: 'Connection Graph',
          description: 'Visualize relationships in your sources',
          icon: (
            <svg className="w-6 h-6 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
            </svg>
          ),
          href: '/docs?slug=advanced-usage/connection-visualization',
          screenshot: 'connections.jpg',
          requiresAuth: false
        },
      ],
    },
  ];

  // Mega menu structure for Library
  const libraryMenu: MegaMenuSection[] = [
    {
      title: 'Source Management',
      items: [
        {
          id: 'allSources',
          title: 'Saved Sources',
          description: 'Browse and manage your saved documents',
          icon: (
            <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          ),
          href: '/docs?slug=library-management/saved-sources',
          screenshot: 'savedsources.jpg',
          requiresAuth: false
        },
        {
          id: 'references',
          title: 'References',
          description: 'View and manage your citation collection',
          icon: (
            <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          ),
          href: '/docs?slug=library-management/references',
          screenshot: 'references.jpg',
          requiresAuth: false
        },
      ],
    },
    {
      title: 'Your Research',
      items: [
        {
          id: 'notes',
          title: 'Research Notes',
          description: 'Access your annotations and quick notes',
          icon: (
            <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          ),
          href: '/docs?slug=library-management/research-notes',
          screenshot: 'researchnotes.jpg',
          requiresAuth: false
        },
        {
          id: 'drafts',
          title: 'Research Drafts',
          description: 'Access and edit your working drafts',
          icon: (
            <svg className="w-6 h-6 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          ),
          href: '/docs?slug=library-management/research-drafts',
          screenshot: 'researchdrafts.jpg',
          requiresAuth: false
        },
        {
          id: 'analysisHistory',
          title: 'Analysis History',
          description: 'Review your previous analyses',
          icon: (
            <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          href: '/docs?slug=library-management/analysis-history',
          screenshot: 'analysishistory.jpg',
          requiresAuth: false
        },
      ],
    },
  ];

  // Mega menu structure for Resources
  const resourcesMenu: MegaMenuSection[] = [
    {
      title: 'Learn & Explore',
      items: [
        {
          id: 'beginners',
          title: 'Beginner\'s Guide',
          description: 'Get started with SourceLens fundamentals',
          icon: (
            <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          ),
          onClick: () => setShowFAQModal(true),
          screenshot: 'guide.jpg',
          requiresAuth: false
        },
        {
          id: 'documentation',
          title: 'Documentation',
          description: 'Full documentation of SourceLens features',
          icon: (
            <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
            </svg>
          ),
          href: '/docs',
          screenshot: 'docs.jpg',
          requiresAuth: false
        },
      ],
    },
    {
      title: 'About',
      items: [
        {
          id: 'about',
          title: 'About SourceLens',
          description: 'The rationale behind the app',
          icon: (
            <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          onClick: () => setShowAboutModal(true),
          screenshot: 'about.jpg',
          requiresAuth: false
        },
        {
          id: 'github',
          title: 'GitHub Repository',
          description: 'View source code',
          icon: (
            <svg className="w-6 h-6 text-slate-500" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z" />
            </svg>
          ),
          href: 'https://github.com/benjaminbreen/SourceLens',
          screenshot: 'github.jpg',
          requiresAuth: false
        },
      ],
    },
  ];

  // Handle item hover for preview
  const handleItemHover = (item: any) => {
    if (item.screenshot) {
      setPreviewItem({
        id: item.id,
        screenshot: item.screenshot,
        title: item.title,
        description: item.description
      });
    } else {
      setPreviewItem(null);
    }
  };

  // Handle click for menu item
  const handleItemClick = (item: any, e: React.MouseEvent) => {
    // If the item requires auth and user is not logged in, prevent navigation
    if (item.requiresAuth && !user) {
      e.preventDefault();
      // You could add code to show a sign-in modal or redirect to sign-in page here
      return;
    }
    
    // Otherwise proceed with normal click handling
    if (item.onClick) {
      item.onClick();
    } else if (item.href) {
      handleNavigation(item.href);
    }
    
    setActiveMenu(null);
    setPreviewItem(null);
  };

  // Get active menu content
  const getActiveMenuContent = () => {
    switch (activeMenu) {
      case 'analysis':
        return analysisMenu;
      case 'library':
        return libraryMenu;
      case 'resources':
        return resourcesMenu;
      default:
        return [];
    }
  };

  // Handle navigation with closing of menus
  const handleNavigation = (href: string) => {
    setActiveMenu(null);
    setPreviewItem(null);
    setMobileMenuOpen(false);
    router.push(href);
  };

  // Determine if a path is active
  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname?.startsWith(path);
  };

  const toggleMenu = (menuName: string) => {
  // Simple, explicit toggling logic
  if (activeMenu === menuName) {
    setActiveMenu(null);
  } else {
    setActiveMenu(menuName);
  }
  
  // Always clear preview when toggling menus
  setPreviewItem(null);
};


  return (
    <>
      {/* Desktop Navigation */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${inter.variable} ${mono.variable} font-sans ${
        isDarkMode
          ? scrolled
            ? 'bg-gray-900/90 border-b border-indigo-700/70 backdrop-blur-md shadow-lg py-2.5'
            : 'bg-gray-900/30 py-4 md:py-7'
          : scrolled
            ? 'bg-white/90 border-b-1 border-indigo-400/70 backdrop-blur-md shadow-lg py-0.5'
            : 'bg-transparent py-4 md:py-7'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex items-center justify-between">
            {/* Logo and Brand - more compact on mobile */}
                  <Link href="/" className="flex items-center group z-10">
                    <button
                      onClick={() => setShowAboutLogoModal(true)}
                      className={`mr-1 ml-8  md:mr-3 transition-transform duration-300 rounded-full ${
                        isDarkMode
                          ? 'border-1 border-indigo-500/100 shadow-lg shadow-indigo-400/20 hover:border-indigo-400 hover:shadow-indigo-500/50'
                          : 'bg-slate-800  hover:border-indigo-600 hover:shadow-indigo-500/90'
                      } hover:scale-115 hover:rotate-4 transition-all duration-300 focus:outline-none`}
                    >
                      <div className={`relative  overflow-hidden m-0 transition-all duration-300 ${
                        scrolled ? 'w-8 h-8 md:w-10 md:h-10 shadow-sm rounded-full shadow-indigo-300/15' : 'w-16 h-16 md:w-22 md:h-22 w-14 h-14 shadow-lg shadow-indigo-500/40 border-indigo-500/100 rounded-full hover:border-indigo-300 hover:shadow-indigo-400/90 shadow-xl hover:opacity-120'
                      }`}>
                        <Image 
                          src="/sourcelenslogo.png" 
                          alt="SourceLens Logo"
                          fill
                          className="object-contain"
                          priority
                        />
                      </div>
                    </button>

                    <div className="ml-2 flex flex-col">
                      <h1 className={`${spaceGrotesk.className} text-xl md:text-2xl tracking-tighter font-bold ${
                        isDarkMode
                          ? 'text-white text-shadow-lg'
                          : scrolled ? 'text-slate-800' : 'text-white text-shadow-sm'
                      } transition-all duration-300 leading-none ${
                        scrolled ? 'text-lg md:text-xl' : 'text-xl md:text-[28px]'
                      }`}>
                        SourceLens
                      </h1>
                      <motion.p 
                        initial={false}
                        animate={{
                          height: scrolled || window.innerWidth < 768 ? 0 : 'auto', // Hide on mobile or when scrolled
                          opacity: scrolled || window.innerWidth < 768 ? 0 : 1,
                          marginTop: scrolled || window.innerWidth < 768 ? 0 : '0.25rem',
                        }}
                        transition={{ duration: 0.3 }}
                        className={`${spaceGrotesk.className} hidden md:flex font-light flex-wrap tracking-tight gap-2 items-center mt-1 text-sm ${
                          isDarkMode ? 'text-white/90' : 'text-indigo-50'
                        }`}
                      >
                        Unique tools for thought
                      </motion.p>
                    </div>
                  </Link>

            {/* Main navigation - desktop only */}
    <nav
      ref={navRef}
      className="hidden md:flex items-center space-x-5 relative z-10 -ml-5"
    >
              <div 
                className={`relative transition-transform duration-300 ease-in-out ${
                  scrolled ? 'translate-y-0' : '-translate-x-3 translate-y-[13px]'
                }`}
              >
              <button
                onClick={() => toggleMenu('analysis')}
                className={`${spaceGrotesk.className} text-lg px-4 py-2 rounded-lg font-medium flex items-center transition-all duration-200 group ${
                  // Your existing className logic remains unchanged
                  activeMenu === 'analysis' || isActive('/analysis')
                    ? isDarkMode
                      ? 'text-white bg-indigo-900/40'
                      : 'text-indigo-900 bg-indigo-50/90 '
                    : isDarkMode
                      ? 'text-slate-50 hover:text-white hover:bg-indigo-900/30'
                      : scrolled
                        ? 'text-indigo-900 hover:text-indigo-900 hover:bg-indigo-50/70 '
                        : 'text-indigo-100 hover:text-indigo-900 hover:bg-indigo-50/70 rounded-lg '
                }`}
                aria-expanded={activeMenu === 'analysis'}
              >
                Analysis
                <svg
                  className={`ml-1.5 w-4 h-4 transition-transform duration-200 ${
                    activeMenu === 'analysis'
                      ? 'rotate-180'
                      : ''
                  } ${
                    isDarkMode
                      ? activeMenu === 'analysis' ? 'text-indigo-300' : 'text-slate-400 group-hover:text-white'
                      : activeMenu === 'analysis' ? 'text-slate-900' : 'text-indigo-400 group-hover:text-indigo-600'
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              </div>

              <div 
                className={`relative transition-transform duration-300 ease-in-out ${
                  scrolled ? 'translate-y-0' : 'translate-y-[13px]'
                }`}
              >
               <button
                 onClick={() => toggleMenu('library')}
                 className={`${spaceGrotesk.className} text-lg px-4 py-2 rounded-lg font-medium flex items-center transition-all duration-200 group ${
                   activeMenu === 'library' || isActive('/library')
                     ? isDarkMode
                       ? 'text-white bg-indigo-900/40'
                       : 'text-indigo-900 bg-indigo-50/90'
                     : isDarkMode
                       ? 'text-slate-50 hover:text-white hover:bg-indigo-900/30'
                       : scrolled
                         ? 'text-indigo-900 hover:text-indigo-900 hover:bg-indigo-50/70'
                         : 'text-indigo-100 hover:text-indigo-900 hover:bg-indigo-50/70'
                 }`}
                 aria-expanded={activeMenu === 'library'}
               >
                 Library
                 <svg
                   className={`ml-1.5 w-4 h-4 transition-transform duration-200 ${
                     activeMenu === 'library'
                       ? 'rotate-180'
                       : ''
                   } ${
                     isDarkMode
                       ? activeMenu === 'library' ? 'text-indigo-300' : 'text-slate-400 group-hover:text-white'
                       : activeMenu === 'library' ? 'text-indigo-500' : 'text-indigo-400 group-hover:text-indigo-600'
                   }`}
                   fill="none"
                   stroke="currentColor"
                   viewBox="0 0 24 24"
                 >
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                 </svg>
               </button>
              </div>

              <div 
                className={`relative transition-transform duration-300 ease-in-out ${
                  scrolled ? 'translate-y-0' : 'translate-y-[13px]'
                }`}
              >
               <button
                 onClick={() => {
                   if (activeMenu === 'resources') {
                     setActiveMenu(null);
                   } else {
                     setActiveMenu('resources');
                   }
                   setPreviewItem(null);
                 }}
                 className={`${spaceGrotesk.className} text-lg px-4 py-2 rounded-lg font-medium flex items-center transition-all duration-200 group ${
                   activeMenu === 'resources' || isActive('/resources')
                     ? isDarkMode
                       ? 'text-white bg-indigo-900/40'
                       : 'text-indigo-900 bg-indigo-50/90'
                     : isDarkMode
                       ? 'text-slate-50 hover:text-white hover:bg-indigo-900/30'
                       : scrolled
                         ? 'text-indigo-900 hover:text-indigo-900 hover:bg-indigo-50/70'
                         : 'text-indigo-100 hover:text-indigo-900 hover:bg-indigo-50/70'
                 }`}
                 aria-expanded={activeMenu === 'resources'}
               >
                 Resources
                  <svg
                    className={`ml-1.5 w-4 h-4 transition-transform duration-200 ${
                      activeMenu === 'resources'
                        ? 'rotate-180'
                        : ''
                    } ${
                      isDarkMode
                        ? activeMenu === 'resources' ? 'text-indigo-300' : 'text-slate-400 group-hover:text-white'
                        : activeMenu === 'resources' ? 'text-indigo-500' : 'text-indigo-400 group-hover:text-indigo-600'
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </nav>

            {/* Right side controls */}
            <div className="flex items-center space-x-3">

              {/* AuthStatus + backdrop: visible on md+ only */}
              <div className="hidden md:flex items-center space-x-2 bg-white/10 backdrop-blur-sm mb-1 py-1 px-1 rounded-full shadow-sm z-10 ml-4">
                <div className="invert">
                  <AuthStatus />
                </div>
                <AccountButton />
              </div>

              {/* Mobile-only Account Button or Sign Up link */}
             <div className="md:hidden flex items-center">
               {user ? (
                 <div className="scale-80">
                   <AccountButton />
                 </div>
               ) : (
                 <Link
                   href="/auth/signup"
                   className="text-sm font-medium px-3 py-1 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-md"
                 >
                   Sign Up
                 </Link>
               )}
             </div>

       


              
              {/* Mobile menu button */}
    <div className="md:hidden absolute left-2 top-0 z-50000">

               <button
                 onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                 className="rounded-lg p-1.5 text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                 aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
               >
                 <div className="w-6 h-6 relative flex justify-center items-center">
                   <span
                     className={`absolute h-0.5 w-5 bg-current transform transition-all duration-300 ${
                       mobileMenuOpen ? 'rotate-45' : '-translate-y-1.5'
                     }`}
                   ></span>
                   <span
                     className={`absolute h-0.5 w-5 bg-current transition-all duration-300 ${
                       mobileMenuOpen ? 'opacity-0' : 'opacity-100'
                     }`}
                   ></span>
                   <span
                     className={`absolute h-0.5 w-5 bg-current transform transition-all duration-300 ${
                       mobileMenuOpen ? '-rotate-45' : 'translate-y-1.5'
                     }`}
                   ></span>
                 </div>
               </button>
             </div>
            </div>
          </div>
        </div>

                {/* Mega Menu for Desktop - Updated version */}
        <AnimatePresence>
          {activeMenu && (
           <motion.div
             initial={{ opacity: 0, y: -10 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.2, ease: 'easeOut' }}
             className={`absolute left-0 w-full ${
               isDarkMode
                 ? 'bg-slate-900/95 border-b border-indigo-800/50'
                 : 'bg-slate-50/90 border-b border-t border-indigo-300 rounded-xl'
             } backdrop-blur-md shadow-xl
               animate-slide-in-top transition-all duration-300 z-[60]
               ${scrolled ? 'mt-1' : 'mt-4'}
             `}
             ref={megaMenuRef}
           >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Conditional Layout based on activeMenu */}
                {activeMenu === 'resources' ? (
                  // --- NEW LAYOUT FOR RESOURCES (No Screenshot Preview) ---
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Column 1: Learn & Explore */}
                    <div>
                      <h3 className={`text-sm mb-3 font-semibold uppercase tracking-wider ${
                        isDarkMode ? 'text-indigo-300' : 'text-indigo-900'
                      }`}>
                        Learn & Explore
                      </h3>
                      <div className="space-y-1">
                        {resourcesMenu.find(sec => sec.title === 'Learn & Explore')?.items.map((item) => (
                          <div key={item.id}>
                            <div
                              className={`group flex items-start p-3 rounded-lg transition-colors duration-200 ${
                                isDarkMode ? 'hover:bg-slate-800' : 'hover:opacity-120 hover:bg-slate-200/60'
                              } cursor-pointer`}
                              onClick={(e) => handleItemClick(item, e)}
                              // No hover preview handling needed here
                            >
                              <div className="flex-shrink-0">{item.icon}</div>
                              <div className="ml-4">
                                <p className={`text-base font-medium transition-colors duration-200 ${
                                  isDarkMode ? 'text-white group-hover:text-indigo-200' : 'text-indigo-900 group-hover:text-indigo-700'
                                }`}>
                                  {item.title}
                                </p>
                                <p className={`mt-1 text-sm transition-colors duration-200 ${
                                  isDarkMode ? 'text-slate-400 group-hover:text-slate-300' : 'text-slate-600 group-hover:text-slate-700'
                                }`}>
                                  {item.description}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Column 2: About */}
                    <div>
                      <h3 className={`text-sm mb-3 font-semibold uppercase tracking-wider ${
                        isDarkMode ? 'text-indigo-300' : 'text-indigo-900'
                      }`}>
                        About
                      </h3>
                      <div className="space-y-1">
                        {resourcesMenu.find(sec => sec.title === 'About')?.items.map((item) => (
                          <div key={item.id}>
                            <div
                              className={`group flex items-start p-3 rounded-lg transition-colors duration-200 ${
                                isDarkMode ? 'hover:bg-slate-800' : 'hover:opacity-120 hover:bg-slate-200/60'
                              } cursor-pointer`}
                              onClick={(e) => handleItemClick(item, e)}
                              // No hover preview handling needed here
                            >
                              <div className="flex-shrink-0">{item.icon}</div>
                              <div className="ml-4">
                                <p className={`text-base font-medium transition-colors duration-200 ${
                                  isDarkMode ? 'text-white group-hover:text-indigo-200' : 'text-indigo-900 group-hover:text-indigo-700'
                                }`}>
                                  {item.title}
                                </p>
                                <p className={`mt-1 text-sm transition-colors duration-200 ${
                                  isDarkMode ? 'text-slate-400 group-hover:text-slate-300' : 'text-slate-600 group-hover:text-slate-700'
                                }`}>
                                  {item.description}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Column 3: Legal & Help */}
                    {/* Column 3: Legal & Help */}
                    <div>
                      <h3 className={`text-sm mb-3 font-semibold uppercase tracking-wider ${
                        isDarkMode ? 'text-indigo-300' : 'text-indigo-900'
                      }`}>
                        Legal & Help
                      </h3>
                      <div className="space-y-1">
                        {/* Privacy Policy Modal Button */}
                        <div key="privacy">
                          <button
                            onClick={() => setShowPrivacyModal(true)}
                            className={`group flex items-start p-3 rounded-lg transition-colors duration-200 w-full text-left ${
                              isDarkMode ? 'hover:bg-slate-800' : 'hover:opacity-120 hover:bg-slate-200/60'
                            } cursor-pointer`}
                          >
                            <div className="flex-shrink-0">
                              <svg className="w-6 h-6 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              </svg>
                            </div>
                            <div className="ml-4">
                              <p className={`text-base font-medium transition-colors duration-200 ${
                                isDarkMode ? 'text-white group-hover:text-indigo-200' : 'text-indigo-900 group-hover:text-indigo-700'
                              }`}>
                                Privacy Policy
                              </p>
                              <p className={`mt-1 text-sm transition-colors duration-200 ${
                                isDarkMode ? 'text-slate-400 group-hover:text-slate-300' : 'text-slate-600 group-hover:text-slate-700'
                              }`}>
                                How your data is handled
                              </p>
                            </div>
                          </button>
                        </div>
                        {/* Terms of Service Modal Button */}
                        <div key="terms">
                          <button
                            onClick={() => setShowTermsModal(true)}
                            className={`group flex items-start p-3 rounded-lg transition-colors duration-200 w-full text-left ${
                              isDarkMode ? 'hover:bg-slate-800' : 'hover:opacity-120 hover:bg-slate-200/60'
                            } cursor-pointer`}
                          >
                            <div className="flex-shrink-0">
                              <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <div className="ml-4">
                              <p className={`text-base font-medium transition-colors duration-200 ${
                                isDarkMode ? 'text-white group-hover:text-indigo-200' : 'text-indigo-900 group-hover:text-indigo-700'
                              }`}>
                                Terms of Service
                              </p>
                              <p className={`mt-1 text-sm transition-colors duration-200 ${
                                isDarkMode ? 'text-slate-400 group-hover:text-slate-300' : 'text-slate-600 group-hover:text-slate-700'
                              }`}>
                                Rules for using SourceLens
                              </p>
                            </div>
                          </button>
                        </div>
                        {/* Colophon Modal Button - Replacing FAQ */}
                        <div key="colophon">
                          <button
                            onClick={() => setShowColophonModal(true)}
                            className={`group flex items-start p-3 rounded-lg transition-colors duration-200 w-full text-left ${
                              isDarkMode ? 'hover:bg-slate-800' : 'hover:opacity-120 hover:bg-slate-200/60'
                            } cursor-pointer`}
                          >
                            <div className="flex-shrink-0">
                              <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                              </svg>
                            </div>
                            <div className="ml-4">
                              <p className={`text-base font-medium transition-colors duration-200 ${
                                isDarkMode ? 'text-white group-hover:text-indigo-200' : 'text-indigo-900 group-hover:text-indigo-700'
                              }`}>
                                Colophon
                              </p>
                              <p className={`mt-1 text-sm transition-colors duration-200 ${
                                isDarkMode ? 'text-slate-400 group-hover:text-slate-300' : 'text-slate-600 group-hover:text-slate-700'
                              }`}>
                                Technical details & credits
                              </p>
                            </div>
                          </button>
                        </div>
                     
                      </div>
                    
                    </div>
                  </div>
                ) : (
                  // --- ORIGINAL LAYOUT FOR ANALYSIS & LIBRARY (With Screenshot Preview) ---
                  <div className="grid grid-cols-12 gap-8">
                    {/* Menu sections (8 columns wide) */}
                    <div className="col-span-12 lg:col-span-8">
                      <div className="grid md:grid-cols-2 gap-8">
                        {getActiveMenuContent().map((section, index) => (
                          <div key={index} className="space-y-5">
                            <h3 className={`text-sm mb-3 font-semibold uppercase tracking-wider ${
                              isDarkMode ? 'text-indigo-300' : 'text-indigo-900'
                            }`}>
                              {section.title}
                            </h3>
                            <div className="space-y-1">
                              {section.items.map((item) => (
                                <div key={item.id}>
                                  <div
                                    className={`group flex items-start p-3 rounded-lg transition-colors duration-200 ${
                                      isDarkMode ? 'hover:bg-slate-800' : 'hover:opacity-120 hover:bg-slate-200/60'
                                    } ${
                                      item.requiresAuth && !user ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
                                    }`}
                                    onMouseEnter={() => handleItemHover(item)}
                                    onMouseLeave={() => setPreviewItem(null)}
                                    onClick={(e) => handleItemClick(item, e)}
                                  >
                                    <div className="flex-shrink-0">{item.icon}</div>
                                    <div className="ml-4">
                                      <p className={`text-base font-medium transition-colors duration-200 ${
                                        isDarkMode ? 'text-white group-hover:text-indigo-200' : 'text-indigo-900 group-hover:text-indigo-700'
                                      }`}>
                                        {item.title}
                                      </p>
                                      <p className={`mt-1 text-sm transition-colors duration-200 ${
                                        isDarkMode ? 'text-slate-400 group-hover:text-slate-300' : 'text-slate-600 group-hover:text-slate-700'
                                      }`}>
                                        {item.description}
                                      </p>
                                    </div>
                                    {item.requiresAuth && !user && (
                                      <div className="ml-auto self-center">
                                        <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Preview section (4 columns wide) */}
                    <div className="hidden lg:block lg:col-span-4">
                      <AnimatePresence mode="wait">
                        {previewItem ? (
                          <motion.div
                            key={previewItem.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.1 }}
                            className={`h-full flex flex-col ${
                              isDarkMode ? 'bg-slate-800/50 border border-slate-700' : 'bg-stone-50/20 border border-indigo-200'
                            } rounded-lg p-3`}
                          >
                            <h3 className={`text-lg font-medium mb-3 ${
                              isDarkMode ? 'text-white' : 'text-indigo-900'
                            }`}>
                              {previewItem.title}
                            </h3>
                            <div className="relative flex-grow mt-1">
                              <div className={`absolute inset-0 rounded-md overflow-hidden ${
                                isDarkMode ? 'ring-1 ring-slate-600 shadow-lg' : 'ring-1 ring-indigo-200 shadow-md'
                              }`}>
                                <div className="relative h-full">
                                  <Image
                                    src={`/screenshots/${previewItem.screenshot}`}
                                    alt={`${previewItem.title} screenshot`}
                                    fill
                                    className="object-cover"
                                    priority // Keep priority if these are often shown first
                                  />
                                  <div className={`absolute inset-0 ${
                                    isDarkMode ? 'bg-gradient-to-t from-slate-950/40 to-transparent' : 'bg-gradient-to-t from-indigo-950/10 to-transparent'
                                  }`}></div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ) : (
                          <motion.div
                            key="default"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className={`h-full flex flex-col justify-center items-center ${
                              isDarkMode ? 'bg-slate-800/30 border border-slate-700/50' : 'bg-indigo-50/20 border border-indigo-100/50'
                            } rounded-lg p-6`}
                          >
                            <svg className={`w-12 h-12 mb-2 ${
                              isDarkMode ? 'text-slate-600' : 'text-indigo-200'
                            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            <p className={`text-sm text-center ${
                              isDarkMode ? 'text-slate-400' : 'text-slate-500'
                            }`}>
                              Hover over a feature to see a preview
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={`fixed inset-0 z-50 ${inter.variable} ${mono.variable} font-sans`}
          >
            {/* Background overlay */}
            <div 
              className={`absolute inset-0 px-4 ${
                isDarkMode ? 'bg-slate-900/80' : 'bg-white/80'
              } backdrop-blur-sm`} 
              onClick={() => setMobileMenuOpen(false)}
            ></div>
            
            {/* Mobile menu content */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className={`absolute top-0 left-0 bottom-0 w-full max-w-lg ${
                isDarkMode ? 'bg-slate-900/70' : 'bg-opacity-90'
              } shadow-xl overflow-y-auto`}
            >
              {/* Mobile menu header */}
              <div className={`flex px-8 items-center justify-between py-4 border-b-2 ${
                isDarkMode ? 'bg-slate-900/90 border-indigo-800' : 'bg-white border-2 rounded-br-lg rounded-bl-lg border-indigo-100'
              }`}>
                <Link href="/" onClick={() => setMobileMenuOpen(false)} className="flex ml-4 items-center">
                  <Image 
                    src="/sourcelenslogo.png" 
                    alt="SourceLens Logo" 
                    width={40} 
                    height={40}
                    className="bg-slate-900/90 rounded-full"
                  />
                  <span className={`${spaceGrotesk.className} text-lg px-3 font-bold tracking-tighter ${
                    isDarkMode ? 'text-white' : 'text-slate-900'
                  }`}>SourceLens</span>
                </Link>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className={`p-2 rounded-lg ${
                    isDarkMode ? 'text-slate-100 hover:text-white hover:bg-slate-800' : 'text-slate-700 hover:text-indigo-900 hover:bg-indigo-50/50'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Mobile menu navigation */}
              <div className="px-2 py-4">
                {/* Account info if signed in */}
                {user && (
                  <div className={`mx-2 mb-6 p-4 ${
                    isDarkMode ? 'bg-slate-800/40' : 'bg-indigo-50/50'
                  } rounded-lg`}>
                    <div className="flex items-center">
                      <div className={`w-10 h-10 rounded-full ${
                        isDarkMode ? 'bg-indigo-600/40' : 'bg-indigo-50'
                      } flex items-center justify-center ${
                        isDarkMode ? 'text-white' : 'text-indigo-900'
                      } font-medium`}>
                        {user.email?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div className="ml-3">
                        <p className={`text-sm font-medium ${
                          isDarkMode ? 'text-white' : 'text-indigo-900'
                        }`}>{user.email}</p>
                        <p className={`text-xs ${
                          isDarkMode ? 'text-slate-400' : 'text-slate-600'
                        }`}>Signed in</p>
                      </div>
                    </div>
                  </div>
                )}
              
                {/* Main navigation items */}
                <div className="space-y-1 mb-6">
                  <Link
                    href="/"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-4 py-3 rounded-lg text-base font-medium ${
                      pathname === '/'
                        ? isDarkMode ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-900'
                        : isDarkMode ? 'text-slate-300 hover:bg-slate-800 hover:text-white' : 'text-slate-700 hover:bg-indigo-50 hover:text-indigo-900'
                    }`}
                  >
                    Home
                  </Link>
                  
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between w-full px-5 py-5 rounded-lg text-base font-medium ${
                    pathname === '/dashboard'
                      ? isDarkMode
                        ? 'bg-slate-800 text-white'
                        : 'bg-indigo-50 text-indigo-900'
                      : isDarkMode
                        ? 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        : 'text-slate-700 hover:bg-indigo-50 hover:text-indigo-900'
                  }`}
                >
                  <span>Dashboard</span>
                  <svg
                    className={`w-5 h-5 ${
                      pathname === '/dashboard'
                        ? isDarkMode
                          ? 'text-indigo-300'
                          : 'text-indigo-500'
                        : isDarkMode
                          ? 'text-slate-400'
                          : 'text-slate-500'
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>

                  
                  <AnimatePresence>
                    {mobileSubmenuOpen === 'analysis' && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-1 pb-2 px-1">
                          {analysisMenu.map((section) => (
                            <div key={section.title} className="mb-3">
                              <h4 className={`px-4 text-xs font-semibold uppercase tracking-wider mb-2 ${
                                isDarkMode ? 'text-indigo-400' : 'text-indigo-700'
                              }`}>
                                {section.title}
                              </h4>
                              <div className="space-y-1">
                                {section.items.map((item) => (
                                  <div key={item.id}>
                                    {item.href ? (
                                      <Link
                                        href={item.href}
                                        onClick={() => {
                                          setMobileMenuOpen(false);
                                          setMobileSubmenuOpen(null);
                                        }}
                                        className={`flex items-center px-4 py-2 text-sm ${
                                          isDarkMode ? 'text-slate-300 hover:bg-slate-800 hover:text-white' : 'text-slate-700 hover:bg-indigo-50 hover:text-indigo-900'
                                        } rounded-md`}
                                      >
                                        <span className="mr-3">{item.icon}</span>
                                        <span>{item.title}</span>
                                      </Link>
                                    ) : (
                                      <button
                                        onClick={() => {
                                          item.onClick?.();
                                          setMobileMenuOpen(false);
                                          setMobileSubmenuOpen(null);
                                        }}
                                        className={`flex items-center w-full px-4 py-2 text-sm ${
                                          isDarkMode ? 'text-slate-300 hover:bg-slate-800 hover:text-white' : 'text-slate-700 hover:bg-indigo-50 hover:text-indigo-900'
                                        } rounded-md text-left`}
                                      >
                                        <span className="mr-3">{item.icon}</span>
                                        <span>{item.title}</span>
                                      </button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  <button
                    onClick={() => setMobileSubmenuOpen(mobileSubmenuOpen === 'library' ? null : 'library')}
                    className={`flex items-center justify-between w-full px-5 py-5 rounded-lg text-base font-medium ${
                      mobileSubmenuOpen === 'library' || pathname?.startsWith('/library')
                        ? isDarkMode ? 'bg-slate-800 text-white' : 'bg-indigo-50 text-indigo-900'
                        : isDarkMode ? 'text-slate-300 hover:bg-slate-800 hover:text-white' : 'text-slate-700 hover:bg-indigo-50 hover:text-indigo-900'
                    }`}
                  >
                    <span>Library</span>
                    <svg
                      className={`w-5 h-5 transition-transform duration-200 ${
                        mobileSubmenuOpen === 'library' ? 'rotate-180' : ''
                      } ${
                        isDarkMode ? mobileSubmenuOpen === 'library' ? 'text-indigo-300' : 'text-slate-400' : mobileSubmenuOpen === 'library' ? 'text-indigo-500' : 'text-slate-500'
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  <AnimatePresence>
                    {mobileSubmenuOpen === 'library' && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-1 pb-2 px-1">
                          {libraryMenu.map((section) => (
                            <div key={section.title} className="mb-3">
                              <h4 className={`px-4 text-xs font-semibold uppercase tracking-wider mb-2 ${
                                isDarkMode ? 'text-indigo-400' : 'text-indigo-700'
                              }`}>
                                {section.title}
                              </h4>
                              <div className="space-y-1">
                                {section.items.map((item) => (
                                  <Link
                                    key={item.id}
                                    href={item.href || '#'}
                                    onClick={() => {
                                      setMobileMenuOpen(false);
                                      setMobileSubmenuOpen(null);
                                    }}
                                    className={`flex items-center px-4 py-2 text-sm ${
                                      isDarkMode ? 'text-slate-300 hover:bg-slate-800 hover:text-white' : 'text-slate-700 hover:bg-indigo-50 hover:text-indigo-900'
                                    } rounded-md`}
                                  >
                                    <span className="mr-3">{item.icon}</span>
                                    <span>{item.title}</span>
                                  </Link>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  <button
                    onClick={() => setMobileSubmenuOpen(mobileSubmenuOpen === 'resources' ? null : 'resources')}
                    className={`flex items-center justify-between w-full px-4 py-3 rounded-lg text-base font-medium ${
                      mobileSubmenuOpen === 'resources' || pathname?.startsWith('/resources')
                        ? isDarkMode ? 'bg-slate-800 text-white' : 'bg-indigo-50 text-indigo-900'
                        : isDarkMode ? 'text-slate-300 hover:bg-slate-800 hover:text-white' : 'text-slate-700 hover:bg-indigo-50 hover:text-indigo-900'
                    }`}
                  >
                    <span>Resources</span>
                    <svg
                      className={`w-5 h-5 transition-transform duration-200 ${
                        mobileSubmenuOpen === 'resources' ? 'rotate-180' : ''
                      } ${
                        isDarkMode ? mobileSubmenuOpen === 'resources' ? 'text-indigo-300' : 'text-slate-400' : mobileSubmenuOpen === 'resources' ? 'text-indigo-500' : 'text-slate-500'
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  <AnimatePresence>
                    {mobileSubmenuOpen === 'resources' && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-1 pb-2 px-1">
                          {resourcesMenu.map((section) => (
                            <div key={section.title} className="mb-3">
                              <h4 className={`px-4 text-xs font-semibold uppercase tracking-wider mb-2 ${
                                isDarkMode ? 'text-indigo-400' : 'text-indigo-700'
                              }`}>
                                {section.title}
                              </h4>
                              <div className="space-y-1">
                                {section.items.map((item) => (
                                  <div key={item.id}>
                                    {item.href ? (
                                      <Link
                                        href={item.href}
                                        onClick={() => {
                                          setMobileMenuOpen(false);
                                          setMobileSubmenuOpen(null);
                                        }}
                                        className={`flex items-center px-4 py-2 text-sm ${
                                          isDarkMode ? 'text-slate-300 hover:bg-slate-800 hover:text-white' : 'text-slate-700 hover:bg-indigo-50 hover:text-indigo-900'
                                        } rounded-md`}
                                      >
                                        <span className="mr-3">{item.icon}</span>
                                        <span>{item.title}</span>
                                      </Link>
                                    ) : (
                                      <button
                                        onClick={() => {
                                          item.onClick?.();
                                          setMobileMenuOpen(false);
                                          setMobileSubmenuOpen(null);
                                        }}
                                        className={`flex items-center w-full px-4 py-2 text-sm ${
                                          isDarkMode ? 'text-slate-300 hover:bg-slate-800 hover:text-white' : 'text-slate-700 hover:bg-indigo-50 hover:text-indigo-900'
                                        } rounded-md text-left`}
                                      >
                                        <span className="mr-3">{item.icon}</span>
                                        <span>{item.title}</span>
                                      </button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
                {/* Mobile actions section */}
                <div className="mt-6 px-3">
                  <h4 className={`px-2 text-xs font-semibold uppercase tracking-wider mb-3 ${
                    isDarkMode ? 'text-indigo-400' : 'text-indigo-700'
                  }`}>
                    Account
                  </h4>
                  
                  {!user ? (
                    <div className="space-y-2">
                      <Link
                        href="/auth/signin"
                        onClick={() => setMobileMenuOpen(false)}
                        className={`block w-full px-4 py-2.5 text-center rounded-lg ${
                          isDarkMode ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-indigo-600 text-white hover:bg-indigo-700'
                        } font-medium transition-colors`}
                      >

                      Sign In
                      </Link>
                      <Link
                        href="/auth/signup"
                        onClick={() => setMobileMenuOpen(false)}
                        className={`block w-full px-4 py-2.5 text-center rounded-lg border ${
                          isDarkMode ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-indigo-200 text-indigo-700 hover:bg-indigo-50'
                        } font-medium transition-colors`}
                      >
                        Create Account
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Link
                        href="/account"
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center px-4 py-2 text-sm ${
                          isDarkMode ? 'text-slate-300 hover:bg-slate-800 hover:text-white' : 'text-slate-700 hover:bg-indigo-50 hover:text-indigo-900'
                        } rounded-md`}
                      >
                        <svg className={`w-5 h-5 mr-3 ${
                          isDarkMode ? 'text-slate-400' : 'text-indigo-400'
                        }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>Account Settings</span>
                      </Link>
                      
                      <button
                        onClick={() => {
                          // Handle sign out
                          setMobileMenuOpen(false);
                        }}
                        className={`flex items-center w-full px-4 py-2 text-sm ${
                          isDarkMode ? 'text-slate-300 hover:bg-slate-800 hover:text-white' : 'text-slate-700 hover:bg-indigo-50 hover:text-indigo-900'
                        } rounded-md text-left`}
                      >
                        <svg className={`w-5 h-5 mr-3 ${
                          isDarkMode ? 'text-slate-400' : 'text-indigo-400'
                        }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Footer info */}
              <div className={`mt-auto px-6 py-4 border-t ${
                isDarkMode ? 'border-slate-800' : 'border-indigo-100/50'
              }`}>
                <div className="flex items-center justify-between">
                  <p className={`text-xs ${
                    isDarkMode ? 'text-slate-500' : 'text-slate-500'
                  }`}>SourceLens v1.0.0</p>
                  <a
                    href="https://github.com/benjaminbreen/SourceLens"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-xs ${
                      isDarkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-800'
                    }`}
                  >
                    GitHub
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <AboutModal 
        isOpen={showAboutModal}
        onClose={() => setShowAboutModal(false)}
        isDarkMode={isDarkMode}
      />

      <FAQModal 
        isOpen={showFAQModal}
        onClose={() => setShowFAQModal(false)}
      />

      {showTermsModal && (
  <TermsModal
    isOpen={showTermsModal}
    onClose={() => setShowTermsModal(false)}
    isDarkMode={isDarkMode} 
  />
)}

{showPrivacyModal && (
  <PrivacyModal
    isOpen={showPrivacyModal}
    onClose={() => setShowPrivacyModal(false)}
    isDarkMode={isDarkMode} 
  />
)}

{showColophonModal && (
  <ColophonModal
    isOpen={showColophonModal}
    onClose={() => setShowColophonModal(false)}
    isDarkMode={isDarkMode} 
  />
)}

      
<AboutLogoModal isOpen={showAboutLogoModal} onClose={() => setShowAboutLogoModal(false)} />
    </>
  );
}