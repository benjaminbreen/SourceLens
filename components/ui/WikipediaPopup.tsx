// components/ui/WikipediaPopup.tsx
// A component that displays Wikipedia content in a popup when terms are clicked

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface WikipediaPopupProps {
  term: string;
  children: React.ReactNode;
}

export default function WikipediaPopup({ term, children }: WikipediaPopupProps) {
  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const linkRef = useRef<HTMLSpanElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

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

  // Calculate position for popup
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

  // Fetch Wikipedia content
  const fetchWikipediaContent = async () => {
    setLoading(true);
    setError(null);
    try {
      // Encode the term for URL
      const encodedTerm = encodeURIComponent(term);
      
      // Using Wikipedia's API to get a summary and extract
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
      setError('Unable to load content. Try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!showPopup) {
      if (!content && !loading) {
        fetchWikipediaContent();
      }
      setShowPopup(true);
    } else {
      setShowPopup(false);
    }
  };

  return (
    <>
      <span 
        ref={linkRef}
        onClick={handleClick}
        className="inline cursor-pointer text-blue-600 hover:text-blue-800 underline relative"
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
              zIndex: 50
            }}
            className="w-80 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden"
          >
            <div className="p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium text-slate-900 dark:text-white">{term}</h3>
                <button 
                  onClick={() => setShowPopup(false)}
                  className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="text-sm text-slate-700 dark:text-slate-300">
                {loading && (
                  <div className="flex justify-center py-4">
                    <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                )}
                
                {error && (
                  <div className="text-red-500">{error}</div>
                )}
                
                {!loading && !error && content && (
                  <>
                    <p className="mb-3">{content}</p>
                    <div className="text-right">
                      <a 
                        href={`https://en.wikipedia.org/wiki/${encodeURIComponent(term)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-700 text-xs"
                      >
                        Read more on Wikipedia →
                      </a>
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