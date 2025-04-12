// components/ui/HamburgerMenu.tsx
// Slide-in hamburger menu that elegantly animates from the left side
// Organized into clear sections with responsive mobile support

'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import AboutModal from './AboutModal';
import Image from 'next/image';




export default function HamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
    const [showAboutLogoModal, setShowAboutLogoModal] = useState(false);


  interface MenuItem {
    label: string;
    href?: string;
    icon: React.ReactNode;
    onClick?: () => void;
    target?: string;
  }
  
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
      }
    }
    
    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, []);

  // Function to handle sharing
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'SourceLens',
        text: 'SourceLens - made by a historian for professionals who want to use AI in research wisely. Contra AI-induced brain rot, and pro augmened creatvity.',
        url: window.location.href,
      })
      .then(() => console.log('Successful share'))
      .catch((error) => console.log('Error sharing:', error));
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(window.location.href)
        .then(() => {
          window.alert('Link copied to clipboard!');
        })
        .catch(err => {
          console.error('Failed to copy: ', err);
        });
    }
    setIsOpen(false);
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
    }
  ];

  // Library group
  const libraryItems = [
    { 
      label: 'My Sources', 
      href: '/library?tab=my-sources',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      )
    },
    { 
      label: 'Favorites', 
      href: '/library?tab=favorites',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
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

  // Helper function to render menu items with consistent styling and section-specific hover colors
  const renderMenuItem = (item: MenuItem, index: number, section: string = 'default') => {
    // Different hover colors based on section
    const hoverColorClasses = {
      default: "hover:bg-indigo-50 hover:text-indigo-700",
      library: "hover:bg-indigo-50/80 hover:text-indigo-600",
      actions: "hover:bg-emerald-50/80 hover:text-emerald-600",
      info: "hover:bg-amber-50/80 hover:text-amber-600",
      account: "hover:bg-slate-100 hover:text-slate-800"
    };
    
    const hoverClass = hoverColorClasses[section as keyof typeof hoverColorClasses] || hoverColorClasses.default;
    
    // Background class - only for account section
    const bgClass = section === 'account' ? "bg-slate-50" : "";
    
    return item.href && !item.onClick ? (
      <Link 
        key={index} 
        href={item.href}
        target={item.target}
        className={`flex items-center gap-3 px-4 py-2.5 text-md font-medium text-slate-700 ${hoverClass} ${bgClass} transition-colors`}
        onClick={() => setIsOpen(false)}
      >
        <span className={`${
          section === 'library' ? 'text-indigo-500' : 
          section === 'actions' ? 'text-emerald-500' : 
          section === 'info' ? 'text-amber-500' : 
          section === 'account' ? 'text-slate-500' : 'text-indigo-500'
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
        className={`flex items-center gap-3 px-4 py-2.5 text-md font-medium text-slate-700 ${hoverClass} ${bgClass} transition-colors w-full text-left`}
      >
        <span className={`${
          section === 'library' ? 'text-indigo-500' : 
          section === 'actions' ? 'text-emerald-500' : 
          section === 'info' ? 'text-amber-500' : 
          section === 'account' ? 'text-slate-500' : 'text-indigo-500'
        }`}>{item.icon}</span>
        {item.label}
      </button>
    )
  };

  return (
    <div className="relative z-50" ref={menuRef}>
      {/* Hamburger button moved to upper left corner */}
      <button 
        className="flex items-center justify-center w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 focus:bg-white/30 backdrop-blur-md transition-all duration-250 focus:outline-none ring-0 focus:ring-3 focus:ring-white/30"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
        aria-expanded={isOpen}
      >
        <div className="relative flex items-center justify-center w-6 h-6">
          {/* Top bar */}
          <span 
            className={`absolute h-0.5 w-6 bg-white rounded-full transform transition-all duration-300 ease-in-out ${
              isOpen ? 'rotate-45 top-1/2' : 'rotate-0 top-[3px]'
            }`}
          ></span>
          
          {/* Middle bar */}
          <span 
            className={`absolute h-0.5 w-6 bg-white rounded-full transition-all duration-200 top-1/2 -translate-y-1/2 ${
              isOpen ? 'opacity-0' : 'opacity-100'
            }`}
          ></span>
          
          {/* Bottom bar */}
          <span 
            className={`absolute h-0.5 w-6 bg-white rounded-full transform transition-all duration-300 ease-in-out ${
              isOpen ? '-rotate-45 top-1/2' : 'rotate-0 bottom-[3px]'
            }`}
          ></span>
        </div>
      </button>
      
      {/* Slide-in menu and overlay */}
      {isOpen && (
        <>
          {/* Backdrop overlay */}
          <div 
            className="fixed inset-0 bg-black/10 backdrop-blur-[1px] z-40 transition-opacity duration-300 ease-in-out"
            onClick={() => setIsOpen(false)}
          ></div>
          
          {/* Slide-in panel container */}
          <div className="fixed  inset-y-0 top-0 left-0 max-w-[260px] w-[85vw] z-50 flex">
            {/* Actual menu panel */}
            <div 
              className="flex rounded-r-xl flex-col h-full w-full bg-white/98 backdrop-blur-md shadow-2xl overflow-y-auto animate-in slide-in-from-left duration-300"
            >
              {/* Gradient line at top */}
              <div className="h-2 w-full bg-gradient-to-r from-amber-400 via-purple-400 to-indigo-400"></div>
              
              {/* Logo and app name section */}
              <div className="flex items-center p-4 border-b border-slate-100">
               <button
  onClick={() => setShowAboutLogoModal(true)}
  className="mr-3 transition-transform duration-300 hover:scale-105 focus:outline-none"
>
  <div className="rounded-full shadow-md border border-indigo-500-50 hover:border-indigo-600/90 hover:scale-105 hover:shadow-indigo-500/60 hover:shadow-lg hover:rotate-4 transition-all duration-300 w-12 h-12 flex items-center justify-center overflow-hidden bg-white">
    <Image 
      src="/sourcelenslogo.png"
      alt="SourceLens Logo"
      width={48}
      height={48}
      className="object-contain"
    />
  </div>
</button>

                <div>
                  <h2 className="font-bold text-xl text-slate-800">SourceLens</h2>
                                    <p className="text font-serif font-medium text-slate-600">Research creatively.</p>

                                    <p className="text-xs italic text-slate-500">An AI source analysis tool for pro researchers and other curious people</p>
             
                </div>
              </div>
              
              {/* Navigation section */}
              <div className="py-2">
                {navigationItems.map((item, index) => renderMenuItem(item, index, 'default'))}
              </div>

              {/* Library section with header */}
              <div className="pt-1 pb-2 border-t border-slate-100">
                <div className="px-4 py-1">
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Library
                  </h3>
                </div>
                {libraryItems.map((item, index) => renderMenuItem(item, index, 'library'))}
              </div>
              
              {/* Actions section */}
              <div className="pt-1 pb-2 border-t border-slate-100">
                <div className="px-4 py-1">
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Actions
                  </h3>
                </div>
                {actionItems.map((item, index) => renderMenuItem(item, index, 'actions'))}
              </div>
              
              {/* Info section */}
              <div className="pt-1 pb-2 border-t border-slate-100">
                <div className="px-4 py-1">
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Info
                  </h3>
                </div>
                {infoItems.map((item, index) => renderMenuItem(item, index, 'info'))}
              </div>
              
              {/* Push account to the bottom with flex spacer */}
              <div className="flex-grow"></div>
              
              {/* Account section with darker styling */}
              <div className="mt-auto border-t-2 border-slate-200">
                <div className="bg-slate-50 py-2">
                  <div className="px-4 py-1">
                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Account
                    </h3>
                  </div>
                  {accountItems.map((item, index) => renderMenuItem(item, index, 'account'))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      
      {/* About Modal */}
      <AboutModal 
        isOpen={showAboutModal}
        onClose={() => setShowAboutModal(false)}
      />
 {/* About SourceLens Logo Modal */}
{showAboutLogoModal && (
  <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-auto">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-indigo-50">
        <h3 className="font-bold text-xl text-indigo-900">About this logo</h3>
        <button 
          onClick={() => setShowAboutLogoModal(false)}
          className="text-gray-500 hover:text-gray-800 text-2xl"
        >
          &times;
        </button>
      </div>
      
      <div className="p-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <h4 className="text-lg font-semibold text-indigo-800 mb-2">Looking more closely</h4>
            <p className="text-slate-700 mb-3">
              This image is a tiny detail from Hans Memling's "Diptych of Maarten van Nieuwenhove" (1487), 
              currently housed in the Old St. John's Hospital in Bruges. This early Netherlandish diptych 
              features an innovative technique: <span 
                id="mirror-text" 
                className="relative inline transition-colors font-medium text-amber-700 hover:text-amber-500 hover:font-medium cursor-help"
                onMouseEnter={() => document.getElementById('mirror-highlight')?.classList.remove('opacity-0')}
                onMouseLeave={() => document.getElementById('mirror-highlight')?.classList.add('opacity-0')}
              >a mirror that reflects the scene</span>, creating a unified space between two separate panels.
            </p>
            <p className="text-slate-700 mb-3">
              Just as Memling's mirror offers a new perspective on the scene, SourceLens provides multiple viewpoints 
              through which to examine historical texts. The convex mirror in the painting reveals what would otherwise 
              remain hidden from view. SourceLens uncovers interpretations and contexts that might not be 
              immediately apparent in sources.
            </p>
          </div>
          <div className="md:w-2/3 flex flex-col items-center relative">
            <div className="relative">
              <Image 
                src="/memling.jpg"
                alt="Diptych of Maarten van Nieuwenhove by Hans Memling"
                width={600}
                height={500}
                className="rounded-md shadow-md mb-2"
              />
              {/* Mirror highlight overlay */}
              <div 
                id="mirror-highlight"
                className="absolute rounded-full border-4 border-amber-500/70 bg-amber-400/20 w-16 h-16 top-[135px] left-[70px] opacity-0 transition-opacity duration-500 pointer-events-none"
                style={{
                  boxShadow: '0 0 20px 5px rgba(217, 119, 6, 0.25)',
                  transform: 'translate(-50%, -50%)'
                }}
              />
            </div>
            <p className="text-xs text-slate-500 italic text-center">
              Diptych of Maarten van Nieuwenhove (1487) by Hans Memling
            </p>
          </div>
        </div>
      </div>
      
      <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end">
        <button
          onClick={() => setShowAboutLogoModal(false)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}



    </div>


  );
}