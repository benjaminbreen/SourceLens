// components/ui/HamburgerMenu.tsx
// Enhanced hamburger menu with smooth animations, backdrop blur, and improved positioning
'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import AboutModal from './AboutModal';

export default function HamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
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
  
  const menuItems = [
    { 
      label: 'Home', 
      href: '/',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
     { 
    label: 'Library', 
    href: '/library',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    )
  },
    { 
      label: 'About', 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    { 
      label: 'GitHub', 
      href: 'https://github.com', 
      target: '_blank',
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z" />
        </svg>
      )
    }
  ];

  return (
    <div className="relative" ref={menuRef}>
      {/* Hamburger button with improved hover and focus states */}
      <button 
        className="flex items-center justify-left w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 focus:bg-white/30 backdrop-blur-md transition-all duration-250 focus:outline-none ring-0 focus:ring-3 focus:ring-white/30"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
        aria-expanded={isOpen}
      >
        <div className="relative w-5 h-5">
          {/* Top bar */}
          <span 
            className={`absolute h-0.5 w-7 bg-white rounded-full transform transition-all duration-300 ease-in-out ${
              isOpen ? 'rotate-45 top-[9px]' : 'rotate-0 top-[5px]'
            }`}
          ></span>
          
          {/* Middle bar */}
          <span 
            className={`absolute h-0.5 w-7 bg-white rounded-full transition-all duration-200 top-[9px] ${
              isOpen ? 'opacity-0' : 'opacity-100'
            }`}
          ></span>
          
          {/* Bottom bar */}
          <span 
            className={`absolute h-0.5 w-7 bg-white rounded-full transform transition-all duration-300 ease-in-out ${
              isOpen ? '-rotate-45 top-[9px]' : 'rotate-0 top-[13px]'
            }`}
          ></span>
        </div>
      </button>
      
      {/* Fixed positioning for the menu to ensure it's above all content */}
      {isOpen && (
        <>
          {/* Overlay backdrop */}
          <div 
            className="fixed inset-0 bg-black/20"
            style={{ zIndex: 9998 }}
            onClick={() => setIsOpen(false)}
          ></div>
          
          {/* Menu dropdown */}
          <div 
            className="fixed right-5 top-25 w-56 py-0 rounded-lg shadow-2xl bg-white/95 backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-200"
            style={{ zIndex: 9999 }}
          >
            {/* Gradient line at top */}
            <div className="h-2 w-full bg-gradient-to-r from-amber-400 via-purple-400 to-indigo-400"></div>
            
            <div className="py-2">
              {menuItems.map((item, index) => (
                item.href ? (
                  <Link 
                    key={index} 
                    href={item.href}
                    target={item.target}
                    onClick={(e) => {
                      if (item.onClick) {
                        e.preventDefault();
                        item.onClick();
                      }
                      setIsOpen(false);
                    }}
                    className={`flex items-center gap-2 px-4 py-2 text-m font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors ${
                      index === 0 ? 'mt-1' : ''
                    }`}
                  >
                    <span className="text-indigo-500">{item.icon}</span>
                    {item.label}
                  </Link>
                ) : (
                  <button 
                    key={index} 
                    onClick={item.onClick}
                    className={`flex items-center gap-2 px-4 py-2 text-m font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors w-full text-left ${
                      index === 0 ? 'mt-1' : ''
                    }`}
                  >
                    <span className="text-indigo-500">{item.icon}</span>
                    {item.label}
                  </button>
                )
              ))}
            </div>
            
            {/* Optional divider and footer links */}
            <div className="border-t border-slate-100 mt-1 pt-1 pb-1">
              <a 
                href="#" 
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign Out
              </a>
            </div>
          </div>
        </>
      )}
      
      {/* About Modal */}
      <AboutModal 
        isOpen={showAboutModal}
        onClose={() => setShowAboutModal(false)}
      />
    </div>
  );
}