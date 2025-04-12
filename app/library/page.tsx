// app/library/page.tsx
// Library page component for SourceLens
// Provides a centralized location for users to access saved references, 
// analysis results, uploaded sources, and research drafts

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
import StrategyDeck from '@/components/ui/StrategyDeck';
import AccountButton from '@/components/auth/AccountButton';
import Link from 'next/link';

export default function LibraryPage() {
  const router = useRouter();
  const { isLoading } = useAppStore();
  
  const [animateHeader, setAnimateHeader] = useState(false);
  const [activeTab, setActiveTab] = useState<'references' | 'analysis' | 'sources' | 'drafts'>('references');
  
  // Add animation effect to header on load
  useEffect(() => {
    setAnimateHeader(true);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (tabParam && ['references', 'analysis', 'sources', 'drafts'].includes(tabParam)) {
      setActiveTab(tabParam as any);
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header with gradient background and sourcelensbar.jpg fade */}
      <header className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-lg overflow-hidden">
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
              <div className="flex px-0 flex-col justify-center ml-2">
                <Link href="/" className="group inline-block relative overflow-hidden">
                  <h1 className="text-2xl font-bold text-white shadow shadow-indigo-800/10">
                    SourceLens
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-indigo-400 via-white to-indigo-400 transform scale-x-0 origin-left transition-transform duration-300 ease-out group-hover:scale-x-100"></span>
                  </h1>
                </Link>

                {/* Library title */}
                <div className="flex flex-wrap gap-2 items-center mt-1 text-sm font-medium text-white/80">
                  <span className="bg-white/10 px-3 py-1 rounded-full">
                    Your Library
                  </span>
                </div>
              </div>
            </div>

            {/* Right side: nav, strategy, account, loading */}
            <div className="flex items-center gap-3 ml-auto">
              <nav className="hidden md:flex items-center space-x-2 text-sm font-medium">
                <Link
                  href="/"
                  className="px-3 py-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-md flex items-center transition-colors"
                >
                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Home
                </Link>

                <Link
                  href="/analysis"
                  className="px-3 py-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-md flex items-center transition-colors"
                >
                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Analysis
                </Link>

                <button
                  onClick={() => {}}
                  className="px-3 py-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-md flex items-center transition-colors"
                >
                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  About
                </button>
              </nav>
              
              <div className="flex px-0 flex-col justify-center ml-3">
                <StrategyDeck />
              </div>

              <div className="flex px-0 flex-col justify-center ml-4">
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
      <div className="h-1 bg-gradient-to-r from-amber-400 via-purple-400 to-indigo-900 opacity-100"></div>

      {/* Rest of your existing code remains the same */}
      
      {/* Navigation Tabs */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap">
            <button
              onClick={() => setActiveTab('references')}
              className={`px-6 py-4 text-base font-medium border-b-2 transition-colors ${
                activeTab === 'references' 
                  ? 'border-amber-700 text-amber-700' 
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Saved References
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('analysis')}
              className={`px-6 py-4 text-base font-medium border-b-2 transition-colors ${
                activeTab === 'analysis' 
                  ? 'border-indigo-700 text-indigo-700' 
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Analysis History
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('sources')}
              className={`px-6 py-4 text-base font-medium border-b-2 transition-colors ${
                activeTab === 'sources' 
                  ? 'border-purple-700 text-purple-700' 
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Saved Sources
              </div>
            </button>
            
            {/* Add new Drafts tab */}
            <button
              onClick={() => setActiveTab('drafts')}
              className={`px-6 py-4 text-base font-medium border-b-2 transition-colors ${
                activeTab === 'drafts' 
                  ? 'border-teal-700 text-teal-700' 
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Research Drafts
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 max-w-7xl mx-auto w-full p-6">
        {activeTab === 'references' && <SavedReferencesPanel />}
        {activeTab === 'analysis' && <SavedAnalysisPanel />}
        {activeTab === 'sources' && <SavedSourcesPanel />}
        {activeTab === 'drafts' && <SavedDraftsPanel />}
      </div>

      {/* Footer with subtle gradient */}
      <footer className="bg-gradient-to-r from-slate-800 to-slate-900 text-white py-6">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-slate-300 text-sm">
                SourceLens Library • <span className="text-slate-400">Organized Research</span>
              </p>
            </div>
            <div className="flex space-x-4">
              <button 
                onClick={() => router.push('/')}
                className="text-slate-300 hover:text-white text-sm transition-colors"
              >
                Home
              </button>
              <button 
                onClick={() => router.push('/analysis')}
                className="text-slate-300 hover:text-white text-sm transition-colors"
              >
                Analysis
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}