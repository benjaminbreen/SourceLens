// components/ui/WikipediaHoverPopup.tsx
// A component that shows a Wikipedia preview on hover and can open a detailed panel on click

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface WikipediaHoverPopupProps {
  term: string;
  children: React.ReactNode;
  className?: string;
  onOpenPanel?: (title: string) => void;
}

export default function WikipediaHoverPopup({ 
  term, 
  children, 
  className = "", 
  onOpenPanel 
}: WikipediaHoverPopupProps) {
  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const linkRef = useRef<HTMLSpanElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const [hoverTimer, setHoverTimer] = useState<NodeJS.Timeout | null>(null);

  // Handle fetching Wikipedia content
  const fetchWikipediaContent = async () => {
    if (content) return; // Don't fetch if we already have content
    
    setLoading(true);
    setError(null);
    try {
      // Encode the term for URL
      const encodedTerm = encodeURIComponent(term);
      
      // Using Wikipedia's API to get a summary
      const response = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodedTerm}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch Wikipedia content');
      }
      
      const data = await response.json();
      setContent(data.extract);
    } catch (err) {
      console.error('Error fetching Wikipedia content:', err);
      setError('Unable to load content');
    } finally {
      setLoading(false);
    }
  };

  // Position the popup near the link
  useEffect(() => {
    if (showPopup && linkRef.current) {
      const rect = linkRef.current.getBoundingClientRect();
      const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      setPosition({
        x: rect.left + scrollLeft,
        y: rect.bottom + scrollTop + 10
      });
    }
  }, [showPopup]);

  // Close popup when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        popupRef.current && 
        !popupRef.current.contains(event.target as Node) &&
        linkRef.current && 
        !linkRef.current.contains(event.target as Node)
      ) {
        setShowPopup(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle hover events with delay
  const handleMouseEnter = () => {
    const timer = setTimeout(() => {
      fetchWikipediaContent();
      setShowPopup(true);
    }, 500); // 500ms delay before showing popup
    setHoverTimer(timer);
  };

  const handleMouseLeave = () => {
    if (hoverTimer) {
      clearTimeout(hoverTimer);
      setHoverTimer(null);
    }
    
    // Small delay before hiding to allow moving to popup
    setTimeout(() => {
      if (!popupRef.current?.matches(':hover')) {
        setShowPopup(false);
      }
    }, 300);
  };

  // Handle click to open panel if provided
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onOpenPanel) {
      onOpenPanel(term);
    }
  };

  return (
    <>
      <span 
        ref={linkRef}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`inline-block cursor-pointer ${className}`}
      >
        {children}
      </span>
      
      <AnimatePresence>
        {showPopup && (
          <motion.div
            ref={popupRef}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            style={{ 
              position: 'absolute', 
              left: `${position.x}px`, 
              top: `${position.y}px`,
              zIndex: 50,
              maxWidth: '300px'
            }}
            className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden"
            onMouseEnter={() => setShowPopup(true)}
            onMouseLeave={() => setShowPopup(false)}
          >
            <div className="p-3">
              <div className="text-sm text-slate-700 dark:text-slate-300">
                {loading && (
                  <div className="flex justify-center py-2">
                    <svg className="animate-spin h-4 w-4 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                )}
                
                {error && (
                  <div className="text-red-500 text-xs">{error}</div>
                )}
                
                {!loading && !error && content && (
                  <>
                    <p className="text-xs line-clamp-4">{content}</p>
                    <div className="text-right mt-1">
                      <span className="text-indigo-500 hover:text-indigo-700 text-xs cursor-pointer">
                        {onOpenPanel ? "Click to read more" : 
                          <a 
                            href={`https://en.wikipedia.org/wiki/${encodeURIComponent(term)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Read on Wikipedia →
                          </a>
                        }
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}