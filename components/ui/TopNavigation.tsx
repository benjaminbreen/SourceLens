// components/ui/TopNavigation.tsx
// Sophisticated header navigation with animated logo size, scroll effects, and proper account integration
// Provides responsive desktop navigation with working dropdown menus and auth status display

'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import AboutModal from './AboutModal';
import FAQModal from './FAQModal';
import HamburgerMenu from './HamburgerMenu';
import AccountButton from '@/components/auth/AccountButton';
import AuthStatus from '@/components/auth/AuthStatus';
import { useAuth } from '@/lib/auth/authContext';
import { Fraunces } from 'next/font/google';

const fraunces = Fraunces({
  subsets: ['latin'],
  display: 'swap',
  weight: '500',
  variable: '--font-fraunces',
});

export default function TopNavigation() {
  const [scrolled, setScrolled] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showFAQModal, setShowFAQModal] = useState(false);
 
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  
  const dropdownRefs = useRef<{ [key: string]: React.RefObject<HTMLDivElement> }>({
    about: useRef(null),
    guide: useRef(null),
    library: useRef(null),
  });

  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 5); // slight delay for smoother fade
    return () => clearTimeout(timer);
  }, []);

  // Check if mobile and handle scroll effects
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 60) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    // Initial checks
    checkIfMobile();
    handleScroll();
    
    // Add event listeners
    window.addEventListener('resize', checkIfMobile);
    window.addEventListener('scroll', handleScroll);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', checkIfMobile);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeDropdown) {
        const activeRef = dropdownRefs.current[activeDropdown];
        if (activeRef.current && !activeRef.current.contains(event.target as Node)) {
          setActiveDropdown(null);
        }
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeDropdown]);

  // Toggle dropdown visibility
  const toggleDropdown = (dropdown: string) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  // Handle sharing
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'SourceLens',
        text: 'SourceLens - made by a historian for professionals who want to use AI in research wisely. Contra AI-induced brain rot, and pro augmented creativity.',
        url: window.location.href,
      })
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
  };

  return (
    <>
      {/* Mobile navigation - only visible on small screens */}
      <div className={`md:hidden fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-slate-900/90 backdrop-blur-md shadow-md py-2' 
          : 'bg-transparent py-3'
      } animate-in fade-in slide-in-from-top-5 duration-100`}>
        <div className="px-4 flex justify-between items-center">
          {/* Left side: Hamburger menu */}
          <div className="flex items-center">
            <HamburgerMenu />
          </div>
          
          {/* Center: Logo and title/subtitle */}
          <div className="flex flex-col items-center">
            <div className="flex items-center">
             
              <Link href="/" className="flex items-center">
                <h1 className={`${fraunces.className} font-bold text-white transition-all duration-300 ${
                  scrolled ? 'text-xl' : 'text-3xl'
                }`}>
                  SourceLens 
                </h1>
              </Link>
            </div>
            
            {/* Subtitle - visible even on mobile, but smaller */}
            <div className={`transition-all duration-300 ${
              scrolled ? 'opacity-0 h-0 invisible' : 'opacity-100 h-auto visible mt-0.5'
            }`}>
              <p className="text-xs text-slate-300 font-sans max-w-[0px] truncate">
                A research tool for seeing sources askance
              </p>
            </div>
          </div>


          {/* Right side: Account button */}
          <div className="flex items-center">
  <AccountButton />
          </div>
        </div>
      </div>
      
  
      {/* Desktop navigation - hidden on mobile */}
<div className={`hidden md:block fixed top-0 left-0 right-0 z-10 transition-all duration-500 ${
  scrolled ? 'bg-slate-900/90 backdrop-blur-md shadow-md py-2' : 'bg-transparent py-6'
} ${animate ? 'animate-in duration-10' : 'opacity-0'}`}>

  <div className="max-w-7xl mx-auto sm:px-4 lg:px-6">
    <div className="flex items-center justify-between relative">

      {/* Left group: logo and nav menu */}
      <div className="flex items-center space-x-6 z-10">
        {/* Logo button */}
        <button

          className="mr-2 transition-transform duration-300 focus:outline-none z-10 ${scrolled ? '' : 'transform scale-125'}"
          aria-label="About SourceLens logo"
        >    
        </button>

         <div className="relative" ref={dropdownRefs.current.about}>
          <button 
            onClick={() => toggleDropdown('about')} 
            className={`px-3 py-2 rounded-lg text-sm font-medium text-white hover:bg-white/10 transition-colors flex items-center ${activeDropdown === 'about' ? 'bg-white/10' : ''}`}
            aria-expanded={activeDropdown === 'about'}
          >
            About
            <svg 
              className={`ml-1 w-4 h-4 transition-transform ${activeDropdown === 'about' ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

                {activeDropdown === 'about' && (
                  <div className="absolute mt-2 w-56 bg-white rounded-lg shadow-lg border border-slate-200 py-1 animate-in fade-in-50 slide-in-from-top-5 duration-100 z-50">
                    <button
                      onClick={() => {
                        setShowAboutModal(true);
                        setActiveDropdown(null);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                    >
                      <svg className="w-4 h-4 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      About SourceLens
                    </button>
                    <a 
                      href="https://github.com/benjaminbreen/SourceLens"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                    >
                      <svg className="w-4 h-4 mr-2 text-slate-600" fill="currentColor" viewBox="0 0 24 24">
                        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z" />
                      </svg>
                      GitHub Repository
                    </a>
                    <button
                      onClick={() => {
                        handleShare();
                        setActiveDropdown(null);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                    >
                      <svg className="w-4 h-4 mr-2 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                      Share
                    </button>
                  </div>
                )}
              </div>
 
              {/* Guide dropdown */}
              <div className="relative" ref={dropdownRefs.current.guide}>
                <button 
                  onClick={() => toggleDropdown('guide')} 
                  className={`px-3 py-2 rounded-lg text-sm font-medium text-white hover:bg-white/10 transition-colors flex items-center ${activeDropdown === 'guide' ? 'bg-white/10' : ''}`}
                  aria-expanded={activeDropdown === 'guide'}
                >
                  Guide
                  <svg 
                    className={`ml-1 w-4 h-4 transition-transform ${activeDropdown === 'guide' ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {activeDropdown === 'guide' && (
                  <div className="absolute mt-2 w-56 bg-white rounded-lg shadow-lg border border-slate-200 py-1 animate-in fade-in-50 slide-in-from-top-5 duration-200 z-40">
                    <button
                      onClick={() => {
                        setShowFAQModal(true);
                        setActiveDropdown(null);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                    >
                      <svg className="w-4 h-4 mr-2 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Beginner's Guide
                    </button>
                    <Link 
                      href="#"
                      className="flex items-center w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                      onClick={() => setActiveDropdown(null)}
                    >
                      <svg className="w-4 h-4 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Documentation
                    </Link>
                    <Link 
                      href="#"
                      className="flex items-center w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                      onClick={() => setActiveDropdown(null)}
                    >
                      <svg className="w-4 h-4 mr-2 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                      </svg>
                      Tutorials
                    </Link>
                  </div>
                )}
              </div>
              
              {/* Library dropdown */}
              <div className="relative" ref={dropdownRefs.current.library}>
                <button 
                  onClick={() => toggleDropdown('library')} 
                  className={`px-3 py-2 rounded-lg text-sm font-medium text-white hover:bg-white/10 transition-colors flex items-center ${activeDropdown === 'library' ? 'bg-white/10' : ''}`}
                  aria-expanded={activeDropdown === 'library'}
                >
                  Library
                  <svg 
                    className={`ml-1 w-4 h-4 transition-transform ${activeDropdown === 'library' ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {activeDropdown === 'library' && (
                  <div className="absolute mt-2 w-56 bg-white rounded-lg shadow-lg border border-slate-200 py-1 animate-in fade-in-50 slide-in-from-top-5 duration-200 z-40">
                    <Link 
                      href="/library?tab=my-sources"
                      className="flex items-center w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                      onClick={() => setActiveDropdown(null)}
                    >
                      <svg className="w-4 h-4 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      My Sources
                    </Link>
                    <Link 
                      href="/library?tab=favorites"
                      className="flex items-center w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                      onClick={() => setActiveDropdown(null)}
                    >
                      <svg className="w-4 h-4 mr-2 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                      Favorites
                    </Link>
                    <Link 
                      href="/library?tab=drafts"
                      className="flex items-center w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                      onClick={() => setActiveDropdown(null)}
                    >
                      <svg className="w-4 h-4 mr-2 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Drafts
                    </Link>
                  </div>
                )}
              </div>

      </div>

      {/* Main navigation items */}
      <nav className="flex items-center space-x-4 z-10">
       
       
             
              <div className="flex items-center space-x-3">
                 <AuthStatus />  <AccountButton />
        </div>
          
            </nav>
            </div>


      {/* Centered logo and slogan */}
     <div className={`absolute inset-x-0 flex flex-col items-center pointer-events-none transition-all duration-300 ${
  scrolled ? 'top-1/2 -translate-y-1/2' : 'top-[69%] -translate-y-1/2'
}`}>

        <Link href="/" className="flex items-center mt-5 justify-center pointer-events-auto">
          <h1 className={`font-serif font-bold text-white transition-all duration-300 ${
            scrolled ? 'text-2xl' : 'text-5xl'
          }`}

           style={{ 
              textShadow: '0 2px 12px rgba(0, 0, 0, 0.7)',
              letterSpacing: '-0.02em'
            }}
            >
            SourceLens
          </h1>
        </Link>
        <div className={`mt-3 transition-all duration-300 ${
          scrolled ? 'opacity-0 h-0 invisible' : 'opacity-100 h-auto visible'
        }`}>

          <p className="text-white/90 text-xl font-sans text-center font-light leading-relaxed pointer-events-auto">
            An AI-enabled research tool for cultivating creativity
          </p>
        </div>
      </div>
      </div>
        

   
  </div> {/* end max-w wrapper */}

      
      
      
      {/* About Modal */}
      <AboutModal 
        isOpen={showAboutModal}
        onClose={() => setShowAboutModal(false)}
      />
      
      {/* FAQ Modal */}
      <FAQModal 
        isOpen={showFAQModal}
        onClose={() => setShowFAQModal(false)}
      />
    </>
  );
}