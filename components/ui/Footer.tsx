// components/ui/Footer.tsx
// Comprehensive footer with improved layout, newsletter integration, and enhanced styling
// Provides a cleaner interface with proper spacing, better visual hierarchy, and complete link integration

'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Space_Grotesk } from 'next/font/google';
import AboutModal from './AboutModal';
import FAQModal from './FAQModal';
import TermsModal from './TermsModal';
import PrivacyModal from './PrivacyModal';
import ColophonModal from './ColophonModal';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-space-grotesk',
});

interface FooterProps {
  isDarkMode: boolean;
}

export default function Footer({ isDarkMode }: FooterProps) {
  const currentYear = new Date().getFullYear();
  
  // Modal state management
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showFAQModal, setShowFAQModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showColophonModal, setShowColophonModal] = useState(false);

  return (
    <footer className="relative py-12 mt-14">
      {/* Background image with overlay */}
      <div className="absolute inset-0 z-0">
        <Image 
          src="/splashbackground.jpg" 
          alt="Footer Background" 
          fill 
          className="object-cover" 
          priority={false}
        />
        {/* Enhanced gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/95 via-slate-800/95 to-slate-900/95"></div>
      </div>
      
      {/* Decorative top wave */}
      <div className="absolute top-0 left-0 right-0 transform -translate-y-full h-16 overflow-hidden z-10">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="absolute bottom-0 w-full h-auto text-slate-900 fill-current opacity-95">
          <path d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,133.3C672,139,768,181,864,181.3C960,181,1056,139,1152,122.7C1248,107,1344,117,1392,122.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>
      
      {/* Footer content - improved layout and styling */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* First row: Logo and sections with improved layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
          {/* Logo & About Section */}
          <div className="md:col-span-5 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start mb-6">
              <div className="relative w-16 h-16 overflow-hidden rounded-xl border border-indigo-400/30 shadow-lg shadow-indigo-500/10 transition-transform duration-300 hover:scale-105">
                <Image 
                  src="/sourcelenslogo.png" 
                  alt="SourceLens Logo" 
                  fill
                  className="object-cover" 
                />
              </div>
              <h2 className={`ml-4 ${spaceGrotesk.className} text-2xl tracking-tighter font-bold text-white`}>
                SourceLens
              </h2>
            </div>
            
            <div className="space-y-4">
              <p className="text-slate-300 text-md leading-relaxed">
                Built for scholars and professional researchers, SourceLens is an experiment in how AI models can <em>augment</em>, not replace, human curiosity and knowledge.
              </p>
              <p className="text-slate-300/80 text-sm leading-relaxed">
                SourceLens is an experimental, LLM-based research platform intended to help you see sources from different perspectives. It is based on a simple premise: rather than treating AI as either an all-powerful oracle or a disastrous mistake, what if we approached it as a naive, odd, but multi-talented research assistant?
              </p>
              
              {/* Social links with hover effects */}
              <div className="flex items-center justify-center md:justify-start space-x-4 pt-2">
                <a 
                  href="https://github.com/benjaminbreen/sourcelens" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-slate-300 hover:text-white transition-colors transform hover:scale-110 p-2"
                  aria-label="GitHub"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
          
          {/* Links Sections with improved styling */}
          <div className="md:col-span-7">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-8 gap-x-12">
              {/* Navigation */}
              <div className="text-center sm:text-left">
                <h3 className="text-white text-lg font-bold mb-4 pb-2 border-b border-indigo-500/20">Navigation</h3>
                <div className="space-y-3">
                  <Link href="/" className="flex items-center text-slate-300 hover:text-white text-sm transition-all hover:opacity-90 group">
                    <span className="text-indigo-400 mr-2 transition-transform duration-300 group-hover:opacity-100 opacity-80 text-sm">•</span> 
                    <span className="transition-all duration-200 group-hover:underline">Home</span>
                  </Link>
                  <Link href="/analysis" className="flex items-center text-slate-300 hover:text-white text-sm transition-all hover:opacity-90 group">
                    <span className="text-indigo-400 mr-2 transition-transform duration-300 group-hover:opacity-100 opacity-80 text-sm">•</span> 
                    <span className="transition-all duration-200 group-hover:underline">Analysis Dashboard</span>
                  </Link>
                  <Link href="/library" className="flex items-center text-slate-300 hover:text-white text-sm transition-all hover:opacity-90 group">
                    <span className="text-indigo-400 mr-2 transition-transform duration-300 group-hover:opacity-100 opacity-80 text-sm">•</span> 
                    <span className="transition-all duration-200 group-hover:underline">Library</span>
                  </Link>
                  <Link href="/docs" className="flex items-center text-slate-300 hover:text-white text-sm transition-all hover:opacity-90 group">
                    <span className="text-indigo-400 mr-2 transition-transform duration-300 group-hover:opacity-100 opacity-80 text-sm">•</span> 
                    <span className="transition-all duration-200 group-hover:underline">Documentation</span>
                  </Link>
                  <button 
                    onClick={() => setShowFAQModal(true)}
                    className="flex items-center text-slate-300 hover:text-white text-sm transition-all hover:opacity-90 group text-left w-full"
                  >
                    <span className="text-indigo-400 mr-2 transition-transform duration-300 group-hover:opacity-100 opacity-80 text-sm">•</span> 
                    <span className="transition-all duration-200 group-hover:underline">Beginner's Guide</span>
                  </button>
                </div>
              </div>
              
              {/* More Info */}
              <div className="text-center sm:text-left">
                <h3 className="text-white text-lg font-bold mb-4 pb-2 border-b border-indigo-500/20">More Info</h3>
                <div className="space-y-3">
                  <button 
                    onClick={() => setShowAboutModal(true)}
                    className="flex items-center text-slate-300 hover:text-white text-sm transition-all hover:opacity-90 group text-left w-full"
                  >
                    <span className="text-indigo-400 mr-2 transition-transform duration-300 group-hover:opacity-100 opacity-80 text-sm">•</span> 
                    <span className="transition-all duration-200 group-hover:underline">About SourceLens</span>
                  </button>
                  <button 
                    onClick={() => setShowPrivacyModal(true)}
                    className="flex items-center text-slate-300 hover:text-white text-sm transition-all hover:opacity-90 group text-left w-full"
                  >
                    <span className="text-indigo-400 mr-2 transition-transform duration-300 group-hover:opacity-100 opacity-80 text-sm">•</span> 
                    <span className="transition-all duration-200 group-hover:underline">Privacy Policy</span>
                  </button>
                  <button 
                    onClick={() => setShowTermsModal(true)}
                    className="flex items-center text-slate-300 hover:text-white text-sm transition-all hover:opacity-90 group text-left w-full"
                  >
                    <span className="text-indigo-400 mr-2 transition-transform duration-300 group-hover:opacity-100 opacity-80 text-sm">•</span> 
                    <span className="transition-all duration-200 group-hover:underline">Terms of Service</span>
                  </button>
                  <button 
                    onClick={() => setShowColophonModal(true)}
                    className="flex items-center text-slate-300 hover:text-white text-sm transition-all hover:opacity-90 group text-left w-full"
                  >
                    <span className="text-indigo-400 mr-2 transition-transform duration-300 group-hover:opacity-100 opacity-80 text-sm">•</span> 
                    <span className="transition-all duration-200 group-hover:underline">Colophon</span>
                  </button>
                </div>
              </div>
              
              {/* Contact */}
              <div className="text-center sm:text-left">
                <h3 className="text-white text-lg font-bold mb-4 pb-2 border-b border-indigo-500/20">Contact</h3>
                <a 
                  href="mailto:bebreen@ucsc.edu" 
                  className="flex items-center text-slate-300 hover:text-white text-sm transition-colors group"
                >
                  <div className="p-2 rounded-full bg-slate-800/50 group-hover:bg-indigo-900/50 transition-colors mr-3">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span className="group-hover:underline">bebreen@ucsc.edu</span>
                </a>
              </div>
            </div>
          </div>
        </div>
        
        {/* Newsletter section with improved styling and transparency */}
        <div className="mt-12 border-t border-indigo-500/10 pt-10">
          <div className="max-w-2xl mx-auto">
            <div className="rounded-xl overflow-hidden shadow-lg backdrop-blur-sm bg-gradient-to-r from-slate-800/40 to-indigo-900/30 border border-indigo-500/10">
              <div className="px-6 py-6 text-center">
                <h3 className="text-white font-semibold text-xl mb-2 flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  Stay Updated
                </h3>
                
                <p className="text-slate-300 text-sm mb-5">
                  Subscribe to receive occasional updates about new features and improvements
                </p>
                
                {/* Custom newsletter signup link instead of iframe */}
                <div className="max-w-md mx-auto mb-3">
                  <a 
                    href="https://sourcelens.substack.com" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block w-full py-3 px-6 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-colors"
                  >
                    Subscribe to our Newsletter
                  </a>
                </div>
                <p className="text-xs text-slate-400">
                  Opens Substack signup in a new window
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Copyright Section with improved styling */}
        <div className="mt-12 pt-6 border-t border-slate-700/30 text-center">
          <p className="text-slate-400 text-sm">
            © {currentYear} Benjamin Breen • Made in Santa Cruz, California
          </p>
          <p className="text-slate-500 text-xs mt-2 max-w-2xl mx-auto">
            SourceLens is designed exclusively for use with public domain historical sources and for academic research purposes.
          </p>
        </div>
      </div>

      {/* Render modals */}
      <AboutModal 
        isOpen={showAboutModal} 
        onClose={() => setShowAboutModal(false)} 
        isDarkMode={isDarkMode} 
      />
      <FAQModal 
        isOpen={showFAQModal} 
        onClose={() => setShowFAQModal(false)} 
      />
      <TermsModal 
        isOpen={showTermsModal} 
        onClose={() => setShowTermsModal(false)} 
        isDarkMode={isDarkMode} 
      />
      <PrivacyModal 
        isOpen={showPrivacyModal} 
        onClose={() => setShowPrivacyModal(false)} 
        isDarkMode={isDarkMode} 
      />
      <ColophonModal 
        isOpen={showColophonModal} 
        onClose={() => setShowColophonModal(false)} 
        isDarkMode={isDarkMode} 
      />
    </footer>
  );
}