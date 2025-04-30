// components/ui/DocModal.tsx
// Unified modal component for documentation pages (Terms, Privacy, Colophon)
// Follows the design language of AboutModal with consistent styling and animations

'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Space_Grotesk } from 'next/font/google';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700'],
  variable: '--font-space-grotesk',
});

interface DocModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  slug: string;
  isDarkMode: boolean;
  children: React.ReactNode;
}

export default function DocModal({ isOpen, onClose, title, slug, isDarkMode, children }: DocModalProps) {
  const [isClosing, setIsClosing] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  
  // Update URL when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      window.history.pushState({ modal: true, slug }, '', `/docs/${slug}`);
    }
  }, [isOpen, slug]);

  // Handle escape key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    
    const handlePopState = () => {
      onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      window.addEventListener('popstate', handlePopState);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      window.removeEventListener('popstate', handlePopState);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // Handle modal closing with animation
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
      // Update URL when closing
      if (window.history.state?.modal) {
        window.history.back();
      }
    }, 200);
  };

  // Prevent click propagation on modal content
  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  if (!isOpen) return null;

  return (
    <div 
      className={`fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50000 p-4 transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`}
      onClick={handleClose}
      aria-modal="true"
      role="dialog"
      aria-label={title}
    >
      <div 
        ref={modalRef}
        className={`${isDarkMode ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900'} 
                    rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden 
                    transition-all duration-300 ${isClosing ? 'scale-95 opacity-80' : 'scale-100 opacity-100'}`}
        onClick={handleContentClick}
      >
        {/* Decorative header with gradient */}
        <div className={`relative h-16 overflow-hidden ${isDarkMode ? 'bg-slate-800' : 'bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900'}`}>
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 via-purple-500/20 to-amber-500/30"></div>
          
          {/* Logo and title */}
          <div className="relative z-10 h-full flex items-center justify-between px-6">
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10 overflow-hidden rounded-lg shadow-lg">
                <Image 
                  src="/sourcelenslogo.png" 
                  alt="SourceLens Logo" 
                  fill
                  className="object-cover" 
                  priority
                />
              </div>
              <h2 className={`${spaceGrotesk.className} text-xl font-semibold tracking-tighter text-white`}>
                {title}
              </h2>
            </div>
            
            {/* Close button */}
            <button 
              onClick={handleClose}
              className="text-white/80 hover:text-white hover:bg-white/10 rounded-full w-8 h-8 flex items-center justify-center transition-all duration-200"
              aria-label="Close modal"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Document content */}
        <div className={`overflow-y-auto ${isDarkMode ? 'bg-slate-900' : 'bg-white'} transition-colors duration-300`} style={{maxHeight: 'calc(90vh - 120px)'}}>
          <div className="p-6 md:p-8 space-y-6">
            {children}
          </div>
        </div>
        
        {/* Footer */}
        <div className={`p-4 border-t ${isDarkMode ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-slate-50'} flex justify-end`}>
          <button
            onClick={handleClose}
            className={`px-4 py-2 rounded-lg transition-colors font-medium ${
              isDarkMode
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}