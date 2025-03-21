// app/library/page.tsx
// Library page component for SourceLens
// Provides a centralized location for users to access saved references, 
// analysis results, and uploaded sources for quick reuse

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import HamburgerMenu from '@/components/ui/HamburgerMenu';
import SavedReferencesPanel from '@/components/library/SavedReferencesPanel';
import SavedAnalysisPanel from '@/components/library/SavedAnalysisPanel';
import SavedSourcesPanel from '@/components/library/SavedSourcesPanel';
import { useAppStore } from '@/lib/store';

export default function LibraryPage() {
  const router = useRouter();
  const { isLoading } = useAppStore();
  
  const [animateHeader, setAnimateHeader] = useState(false);
  const [activeTab, setActiveTab] = useState<'references' | 'analysis' | 'sources'>('references');
  
  // Add animation effect to header on load
  useEffect(() => {
    setAnimateHeader(true);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header with gradient background similar to main app */}
      <header className={`relative overflow-hidden bg-gradient-to-r from-indigo-900 via-indigo-700 to-transparent text-white shadow-lg transition-all duration-700 ${animateHeader ? 'opacity-100' : 'opacity-10'}`}>
        {/* Background image on right side */}
        <div className="absolute top-0 right-0 h-full w-1/2 z-0">
          <Image 
            src="/sourcelensbar.jpg" 
            alt="SourceLens Header" 
            fill 
            priority
            className="object-cover object-left" 
          />
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-700/100 via-indigo-700/70 to-transparent"></div>
        </div>
        
       {/* Header content container */}
       <div className="max-w-9xl mx-auto p-4 relative z-10">
         <div className="flex justify-between items-center">
           <div className="flex items-center">
             {/* Logo with home link */}
             <div className="pl-10 pr-10 flex items-center">
               <button 
                 onClick={() => router.push('/')}
                 className="transition-transform hover:scale-105 focus:outline-none rounded-full drop-shadow-md cursor-pointer"
                 aria-label="Return to home page"
               >
                 <Image 
                   src="/sourcelenslogo.png" 
                   alt="SourceLens Logo" 
                   width={70} 
                   height={70} 
                   className="rounded-full border border-indigo-800/10 ring-1 ring-yellow-300/20"
                 />
               </button>
             </div>
              
              <div>
                {/* Title with subtle text shadow */}
                <h1 className="text-3xl font-bold tracking-wide drop-shadow-sm font-serif">Your Library</h1>
                
                <div className="flex items-center mt-1.5">
                  <span className="text-sm font-medium bg-white/20 px-3 py-0.5 rounded-full backdrop-blur-sm">
                    Saved items
                  </span>
                </div>
              </div>
            </div>
            
            {/* Right side controls */}
            <div className="flex items-center space-x-4">
              {/* Loading indicator */}
              {isLoading && (
                <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm py-1.5 px-4 rounded-full animate-pulse">
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                  <span className="text-sm font-medium">Loading...</span>
                </div>
              )}
              
              {/* Back to Home button */}
              <button 
                onClick={() => router.push('/')}
                className="flex items-center space-x-1 bg-white/10 hover:bg-white/20 backdrop-blur-sm py-1.5 px-4 rounded-full transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span className="text-sm font-medium">Home</span>
              </button>
              
              {/* Menu button */}
              <HamburgerMenu />
            </div>
          </div>
        </div>
        
        {/* Decorative highlight line below header */}
        <div className="h-1 bg-gradient-to-r from-amber-400 via-purple-400 to-indigo-400 opacity-80"></div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex">
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
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 max-w-7xl mx-auto w-full p-6">
        {activeTab === 'references' && <SavedReferencesPanel />}
        {activeTab === 'analysis' && <SavedAnalysisPanel />}
        {activeTab === 'sources' && <SavedSourcesPanel />}
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