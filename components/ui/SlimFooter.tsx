// components/ui/SlimFooter.tsx
// Compact footer with responsive design for analysis and library pages
// Provides essential links, documentation access, and maintains design cohesion across devices

'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import AboutModal from '@/components/ui/AboutModal';
import TermsModal from '@/components/ui/TermsModal';
import PrivacyModal from '@/components/ui/PrivacyModal';
import ColophonModal from '@/components/ui/ColophonModal';
import EasterEggTerminal from '@/components/ui/EasterEggTerminal';

interface SlimFooterProps {
  isDarkMode: boolean;
}

export default function SlimFooter({ isDarkMode }: SlimFooterProps) {
  // Modal states
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showColophonModal, setShowColophonModal] = useState(false);
  const [showEasterEggTerminal, setShowEasterEggTerminal] = useState(false);
  
  const currentYear = new Date().getFullYear();

  return (
    <>
      <footer className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-slate-300 py-4 px-4 md:px-6 relative">
        <div className="container mx-auto">
          {/* Desktop layout */}
          <div className="hidden md:flex md:flex-row md:items-center md:justify-between">
            {/* Logo & Brief Description */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Image 
                  src="/sourcelenslogo.png" 
                  alt="SourceLens Logo" 
                  width={36} 
                  height={36} 
                  className="mr-3"
                />
                <div>
                  <h3 className="text-white font-semibold text-sm">SourceLens</h3>
                  <p className="text-xs text-slate-400">
                    AI research assistant for historical analysis
                  </p>
                </div>
              </div>
            </div>
            
            {/* Main navigation links - centered */}
            <div className="flex space-x-6 items-center">
              <Link href="/" className="text-slate-300 hover:text-white text-sm transition-colors">
                Home
              </Link>
              <Link href="/library" className="text-slate-300 hover:text-white text-sm transition-colors">
                Library
              </Link>
              <Link href="/dashboard" className="text-slate-300 hover:text-white text-sm transition-colors">
                Dashboard
              </Link>
              <Link href="/docs" className="text-slate-300 hover:text-white text-sm transition-colors">
                Documentation
              </Link>
              <button 
                onClick={() => setShowAboutModal(true)}
                className="text-slate-300 hover:text-white text-sm transition-colors bg-transparent border-none p-0 cursor-pointer"
              >
                About
              </button>
            </div>
            
            {/* Legal & info links - smaller text */}
            <div className="flex flex-col items-end">
              <div className="text-xs text-slate-500 mb-1">
                © {currentYear} Benjamin Breen • Made in Santa Cruz
              </div>
              <div className="flex space-x-4">
                <button 
                  onClick={() => setShowTermsModal(true)}
                  className="text-slate-500 hover:text-slate-300 text-xs transition-colors bg-transparent border-none p-0 cursor-pointer"
                >
                  Terms
                </button>
                <button 
                  onClick={() => setShowPrivacyModal(true)}
                  className="text-slate-500 hover:text-slate-300 text-xs transition-colors bg-transparent border-none p-0 cursor-pointer"
                >
                  Privacy
                </button>
                <button 
                  onClick={() => setShowColophonModal(true)}
                  className="text-slate-500 hover:text-slate-300 text-xs transition-colors bg-transparent border-none p-0 cursor-pointer"
                >
                  Colophon
                </button>
              </div>
            </div>
          </div>
          
          {/* Mobile layout */}
          <div className="md:hidden flex flex-col space-y-4">
            {/* Top section with logo and copyright */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Image 
                  src="/sourcelenslogo.png" 
                  alt="SourceLens Logo" 
                  width={32} 
                  height={32} 
                  className="mr-2"
                />
                <h3 className="text-white font-semibold text-sm">SourceLens</h3>
              </div>
              <div className="text-xs text-slate-500">
                © {currentYear} Made in Santa Cruz
              </div>
            </div>
            
            {/* Main navigation links - in a grid */}
            <div className="grid grid-cols-2 gap-3">
              <Link href="/" className="text-slate-300 hover:text-white text-sm transition-colors">
                Home
              </Link>
              <Link href="/library" className="text-slate-300 hover:text-white text-sm transition-colors">
                Library
              </Link>
              <Link href="/dashboard" className="text-slate-300 hover:text-white text-sm transition-colors">
                Dashboard
              </Link>
              <Link href="/docs" className="text-slate-300 hover:text-white text-sm transition-colors">
                Documentation
              </Link>
              <button 
                onClick={() => setShowAboutModal(true)}
                className="text-slate-300 hover:text-white text-sm transition-colors bg-transparent border-none p-0 cursor-pointer text-left"
              >
                About
              </button>
              <div className="flex space-x-3 col-span-2 mt-1 pt-1 border-t border-slate-700">
                <button 
                  onClick={() => setShowTermsModal(true)}
                  className="text-slate-500 hover:text-slate-300 text-xs transition-colors bg-transparent border-none p-0 cursor-pointer"
                >
                  Terms
                </button>
                <button 
                  onClick={() => setShowPrivacyModal(true)}
                  className="text-slate-500 hover:text-slate-300 text-xs transition-colors bg-transparent border-none p-0 cursor-pointer"
                >
                  Privacy
                </button>
                <button 
                  onClick={() => setShowColophonModal(true)}
                  className="text-slate-500 hover:text-slate-300 text-xs transition-colors bg-transparent border-none p-0 cursor-pointer"
                >
                  Colophon
                </button>
              </div>
            </div>
          </div>
          
          {/* Easter Egg Terminal Trigger - for both layouts */}
          <div 
            className="absolute right-4 bottom-6 cursor-pointer group"
            onClick={() => setShowEasterEggTerminal(!showEasterEggTerminal)}
          >
            <div className="bg-green-500 w-3 h-3 animate-pulse rounded-full opacity-50 group-hover:opacity-100 transition-all">
              <span className="text-xs text-green-900 absolute -top-5 opacity-0 group-hover:opacity-100 transition-opacity">
                SRC
              </span>
            </div>
          </div>
        </div>
      </footer>
      
      {/* Modals */}
      {showAboutModal && (
        <AboutModal
          isOpen={showAboutModal}
          onClose={() => setShowAboutModal(false)}
          isDarkMode={isDarkMode} 
        />
      )}
      
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
      
      {/* Easter Egg Terminal */}
      {showEasterEggTerminal && (
        <div className="fixed bottom-20 right-4 z-50">
          <EasterEggTerminal onClose={() => setShowEasterEggTerminal(false)} />
        </div>
      )}
    </>
  );
}