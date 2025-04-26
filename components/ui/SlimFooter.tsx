// components/ui/AnalysisFooter.tsx
// Compact footer specifically for analysis pages with minimal content
// Provides essential links, copyright info, and maintains design cohesion with main footer
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import AboutModal from '@/components/ui/AboutModal';
import EasterEggTerminal from '@/components/ui/EasterEggTerminal';

  interface SlimFooterProps {
  isDarkMode: boolean;
}

export default function SlimFooter({ isDarkMode }: SlimFooterProps) {
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showEasterEggTerminal, setShowEasterEggTerminal] = useState(false);
  const currentYear = new Date().getFullYear();




  return (
    <>
      <footer className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-slate-300 py-4 px-6 relative">
        <div className="container mx-auto flex items-center justify-between">
          {/* Logo & Brief Description */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Image 
                src="/sourcelenslogo.png" 
                alt="SourceLens Logo" 
                width={40} 
                height={40} 
                className="mr-3"
              />
              <div>
                <h3 className="text-white font-semibold">SourceLens</h3>
                <p className="text-xs text-slate-400">
                  An experimental AI research assistant for historical analysis
                </p>
              </div>
            </div>
          </div>

          {/* Essential Navigation Links */}
          <div className="flex space-x-6 items-center">
            <Link href="/" className="text-slate-300 hover:text-white text-sm transition-colors">
              Home
            </Link>
            <Link href="/library" className="text-slate-300 hover:text-white text-sm transition-colors">
              Library
            </Link>
            <button 
              onClick={() => setShowAboutModal(true)}
              className="text-slate-300 hover:text-white text-sm transition-colors bg-transparent border-none p-0 cursor-pointer"
            >
              About
            </button>
            <Link href="/contact" className="text-slate-300 hover:text-white text-sm transition-colors">
              Contact
            </Link>
            <Link href="https://github.com/yourusername/sourceLens" target="_blank" rel="noopener noreferrer" className="text-slate-300 hover:text-white text-sm transition-colors">
              GitHub
            </Link>
          </div>

          {/* Copyright */}
          <div className="text-xs text-slate-500">
            © {currentYear} Benjamin Breen • Made in Santa Cruz
          </div>

          {/* Easter Egg Terminal Trigger */}
          <div 
            className="absolute right-4 bottom-6 cursor-pointer group"
            onClick={() => setShowEasterEggTerminal(!showEasterEggTerminal)}
          >
            <div className="bg-green-500 w-4 h-4 animate-pulse rounded-full opacity-50 group-hover:opacity-100 transition-all">
              <span className="text-xs text-green-900 absolute -top-5 opacity-0 group-hover:opacity-100 transition-opacity">
                SRC
              </span>
            </div>
          </div>
        </div>
      </footer>

     {showAboutModal && (
  <AboutModal
    isOpen={showAboutModal}
    onClose={() => setShowAboutModal(false)}
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