// app/library/page.tsx
// Enhanced library page component for SourceLens with dark mode support
// Provides a centralized location for users to access saved references, analysis results,
// uploaded sources, research notes, and drafts with consistent styling as MainLayout

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import HamburgerMenu from '@/components/ui/HamburgerMenu';
import SavedReferencesPanel from '@/components/library/SavedReferencesPanel';
import SavedAnalysisPanel from '@/components/library/SavedAnalysisPanel';
import SavedSourcesPanel from '@/components/library/SavedSourcesPanel';
import SavedDraftsPanel from '@/components/library/SavedDraftsPanel';
import { useAppStore } from '@/lib/store';

import AccountButton from '@/components/auth/AccountButton';
import Link from 'next/link';
import NotesListPanel from '@/components/notes/NotesListPanel';
import SlimFooter from '@/components/ui/SlimFooter';
import AboutModal from '@/components/ui/AboutModal';
import { Space_Grotesk } from 'next/font/google';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  weight: ['300', '400', '500', '600', '700',],
  variable: '--font-space-grotesk',
});

export default function LibraryPage() {
  const router = useRouter();
  const { isLoading } = useAppStore();
  
  // UI state
  const [animateHeader, setAnimateHeader] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'references' | 'analysis' | 'sources' | 'drafts' | 'notes'>('references');
  const [showAboutModal, setShowAboutModal] = useState(false);
  

  // Add animation effect to header on load
  useEffect(() => {
    setAnimateHeader(true);
    
    // Check for saved dark mode preference
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
  }, []);

  // Handle URL parameters for active tab
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (tabParam && ['references', 'analysis', 'sources', 'drafts', 'notes'].includes(tabParam)) {
      setActiveTab(tabParam as any);
    }
  }, []);

  // Toggle dark mode and save preference
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', String(newDarkMode));
  };

  // Determine theme classes based on dark mode
  const themeClasses = {
    background: darkMode 
      ? 'bg-slate-900 text-slate-100' 
      : 'bg-slate-50 text-slate-900',
    header: 'from-slate-900 via-slate-800 to-slate-900', // Keep header dark in both modes
    gradient: darkMode
      ? 'bg-gradient-to-r from-amber-500/80 via-purple-500/80 to-indigo-900/80'
      : 'bg-gradient-to-r from-amber-400 via-purple-400 to-indigo-900',
    panel: darkMode
      ? 'from-slate-800 to-slate-900 border-slate-700'
      : 'from-slate-50 to-white border-slate-200',
    card: darkMode
      ? 'bg-slate-800 border-slate-700 text-slate-200'
      : 'bg-white border-slate-200 text-slate-800',
    tabs: darkMode
      ? 'bg-slate-800 border-slate-700'
      : 'bg-white border-slate-200',
    tab: {
      active: {
        references: darkMode ? 'border-amber-500 text-amber-400' : 'border-amber-700 text-amber-700',
        analysis: darkMode ? 'border-indigo-500 text-indigo-400' : 'border-indigo-700 text-indigo-700',
        sources: darkMode ? 'border-purple-500 text-purple-400' : 'border-purple-700 text-purple-700',
        notes: darkMode ? 'border-blue-500 text-blue-400' : 'border-blue-700 text-blue-700',
        drafts: darkMode ? 'border-teal-500 text-teal-400' : 'border-teal-700 text-teal-700'
      },
      inactive: darkMode
        ? 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-600'
        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
    },
    button: {
      primary: darkMode
        ? 'bg-indigo-700 hover:bg-indigo-600 text-white'
        : 'bg-indigo-600 hover:bg-indigo-700 text-white',
      secondary: darkMode
        ? 'bg-slate-700 hover:bg-slate-600 text-slate-200'
        : 'bg-slate-100 hover:bg-slate-200 text-slate-700',
      icon: darkMode
        ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'
        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
    },
    navLink: darkMode
      ? 'text-slate-300 hover:text-white hover:bg-white/10'
      : 'text-slate-300 hover:text-white hover:bg-white/10', // Keep header nav links the same
    dropdown: darkMode
      ? 'bg-slate-800 border-slate-700 shadow-lg'
      : 'bg-white border-slate-200 shadow-lg',
    dropdownItem: darkMode
      ? 'text-slate-300 hover:bg-slate-700'
      : 'text-slate-700 hover:bg-slate-100'
  };

  return (
    <div className={`min-h-screen flex flex-col ${themeClasses.background} transition-colors duration-300`}>
      {/* Header with gradient background and sourcelensbar.jpg fade */}
      <header className={`relative bg-gradient-to-r ${themeClasses.header} text-white overflow-hidden`}>
        {/* Background image and gradient overlay */}
        <div className="absolute top-0 right-0 h-full w-3/4 z-0">
          <Image 
            src="/sourcelensbar.jpg" 
            alt="SourceLens Header" 
            fill 
            priority 
            className="object-cover opacity-80" 
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-800/90 to-indigo-900/10"></div>
        </div>

        <div className="relative z-20 max-w-8xl mx-auto px-4 sm:px-6 lg:px-0 py-4 gap-2">
          <div className="px-6 flex items-center justify-between gap-4 flex-wrap w-full">
            {/* Far left: Hamburger menu */}
            <div className="flex items-center gap-3">
              <div className="pl-2 px-12">
                <HamburgerMenu />
              </div>

              {/* Logo and title */}
              <div className="flex flex-wrap gap-2 items-center">
    <Link href="/" className="group inline-block relative overflow-hidden">
      <h1 className={`${spaceGrotesk.className} text-2xl tracking-tighter font-bold shadow-sm text-white transition-all duration-300`}>
        SourceLens
        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-indigo-400 via-white to-indigo-400 transform scale-x-0 origin-left transition-transform duration-300 ease-out group-hover:scale-x-100"></span>
      </h1>
    </Link>

    <span className="text-white/40">/</span>

    <div className={`${spaceGrotesk.className} text-sm font-semibold text-white/80`}>
      Library
    </div>
  </div>

            </div>

            {/* Right side: nav, strategy, account, dark mode, loading */}
            <div className="flex items-center gap-3 ml-auto">
              <nav className="hidden md:flex items-center space-x-2 text-sm font-medium">
                <Link
                  href="/"
                  className={`px-3 py-1.5 ${themeClasses.navLink} rounded-md flex items-center transition-colors`}
                >
                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Home
                </Link>

                {/* Library Dropdown */}
              
                <button
                  onClick={() => setShowAboutModal(true)}
                  className={`px-3 py-1.5 ${themeClasses.navLink} rounded-md flex items-center transition-colors`}
                >
                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  About
                </button>
              </nav>
              
              {/* Dark mode toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {darkMode ? (
                  <svg className="w-5 h-5 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
              
             

              <div className="flex flex-col justify-center ml-4">
                <AccountButton />
              </div>

              {isLoading && (
                <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm py-1.5 px-3 rounded-full shadow-sm">
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                  <span className="text-xs font-medium text-white/90">Processing...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Decorative highlight line below header */}
      <div className={`h-1 ${themeClasses.gradient} opacity-100 transition-colors duration-300`}></div>
      
      {/* Navigation Tabs */}
      <div className={`${themeClasses.tabs} shadow-sm transition-colors duration-300`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap">
            <button
              onClick={() => {
                setActiveTab('references');
                router.push('/library?tab=references');
              }}
              className={`px-6 py-3 text-base font-medium border-b-2 transition-colors ${
                activeTab === 'references' 
                  ? themeClasses.tab.active.references 
                  : themeClasses.tab.inactive
              }`}
            >
              <div className="flex items-center">
                <svg className={`w-5 h-5 mr-2 ${activeTab === 'references' ? (darkMode ? 'text-amber-400' : 'text-amber-600') : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Saved References
              </div>
            </button>
            
            <button
              onClick={() => {
                setActiveTab('analysis');
                router.push('/library?tab=analysis');
              }}
              className={`px-6 py-3 text-base font-medium border-b-2 transition-colors ${
                activeTab === 'analysis' 
                  ? themeClasses.tab.active.analysis 
                  : themeClasses.tab.inactive
              }`}
            >
              <div className="flex items-center">
                <svg className={`w-5 h-5 mr-2 ${activeTab === 'analysis' ? (darkMode ? 'text-indigo-400' : 'text-indigo-600') : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Analysis History
              </div>
            </button>
            
            <button
              onClick={() => {
                setActiveTab('sources');
                router.push('/library?tab=sources');
              }}
              className={`px-6 py-3 text-base font-medium border-b-2 transition-colors ${
                activeTab === 'sources' 
                  ? themeClasses.tab.active.sources 
                  : themeClasses.tab.inactive
              }`}
            >
              <div className="flex items-center">
                <svg className={`w-5 h-5 mr-2 ${activeTab === 'sources' ? (darkMode ? 'text-purple-400' : 'text-purple-600') : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Saved Sources
              </div>
            </button>

            <button
              onClick={() => {
                setActiveTab('notes');
                router.push('/library?tab=notes');
              }}
              className={`px-6 py-3 text-base font-medium border-b-2 transition-colors ${
                activeTab === 'notes' 
                  ? themeClasses.tab.active.notes 
                  : themeClasses.tab.inactive
              }`}
            >
              <div className="flex items-center">
                <svg className={`w-5 h-5 mr-2 ${activeTab === 'notes' ? (darkMode ? 'text-blue-400' : 'text-blue-600') : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Research Notes
              </div>
            </button>
            
            <button
              onClick={() => {
                setActiveTab('drafts');
               router.push('/library?tab=drafts');
              }}
              className={`px-6 py-2 text-base font-medium border-b-2 transition-colors ${
                activeTab === 'drafts' 
                  ? themeClasses.tab.active.drafts 
                  : themeClasses.tab.inactive
              }`}
            >
              <div className="flex items-center">
                <svg className={`w-5 h-5 mr-2 ${activeTab === 'drafts' ? (darkMode ? 'text-teal-400' : 'text-teal-600') : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Research Drafts
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className={`flex-1 max-w-8xl mx-auto w-full px-8 py-4 transition-colors duration-300`}>
        {activeTab === 'references' && <SavedReferencesPanel darkMode={darkMode} />}
        {activeTab === 'analysis' && <SavedAnalysisPanel darkMode={darkMode} />}
        {activeTab === 'sources' && <SavedSourcesPanel darkMode={darkMode} />}
        {activeTab === 'drafts' && <SavedDraftsPanel darkMode={darkMode} />}
        {activeTab === 'notes' && <NotesListPanel darkMode={darkMode} />}
      </div>

      {/* About Modal */}
      {showAboutModal && (
        <AboutModal 
          isOpen={showAboutModal} 
          onClose={() => setShowAboutModal(false)}
          isDarkMode={darkMode}
        />
      )}

      {/* Footer */}
      <SlimFooter isDarkMode={darkMode} />
    </div>
  );
}