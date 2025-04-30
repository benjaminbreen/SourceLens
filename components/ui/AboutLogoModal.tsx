// components/ui/AboutLogoModal.tsx
// A standalone modal component that displays information about the SourceLens logo
// Features close-on-outside-click, ESC key closing, and interactive image elements
// with hover effects to highlight details in the artwork

'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';

interface AboutLogoModalProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode?: boolean;
}

export default function AboutLogoModal({ isOpen, onClose, darkMode = false }: AboutLogoModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [showDetailImage, setShowDetailImage] = useState(false);
  
  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    
    // Handle ESC key to close
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscKey);
      // Prevent scrolling when modal is open
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-100  overflow-auto">
      {/* Backdrop with blur effect */}
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200 " />
      
      {/* Modal container */}
      <div className="flex min-h-full items-center rounded-xl justify-center p-4 z-1001">
        <div 
          ref={modalRef}
          className={`relative w-full max-w-5xl rounded-xl shadow-2xl transform transition-all animate-in zoom-in-95 duration-300 ${
            darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200'
          }`}
        >
          {/* Header */}
          <div className={`flex items-center justify-between rounded-tr-xl rounded-tl-xl px-6 py-4 border-b ${
            darkMode ? 'border-slate-700 bg-indigo-950/50' : 'border-slate-200 bg-indigo-50/90'
          }`}>
            <h2 className={`text-xl font-semibold ${
              darkMode ? 'text-indigo-300' : 'text-indigo-900'
            }`}>
              About this logo
            </h2>
            <button
              onClick={onClose}
              className={`rounded-full p-1.5 transition-colors ${
                darkMode 
                  ? 'text-slate-400 hover:text-white hover:bg-slate-700/50' 
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/70'
              }`}
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          {/* Content */}
          <div className={`p-6 space-y-5 ${
            darkMode ? 'text-slate-300' : 'text-slate-700'
          }`}>
            <div className="flex flex-col md:flex-row gap-6">
              {/* Text content */}
              <div className="flex-1 space-y-4">
                <h3 className={`text-xl font-medium ${
                  darkMode ? 'text-indigo-300' : 'text-indigo-800'
                }`}>
                  Looking more closely
                </h3>
                
               <p className="leading-relaxed">
                 This image is a tiny detail from Hans Memling's "Diptych of Maarten van Nieuwenhove" (1487), 
                 currently housed in the Old St. John's Hospital in Bruges. This early Netherlandish diptych 
                 features an innovative technique: {' '}
                 <span 
                   className={`relative inline-flex cursor-help font-medium transition-colors ${
                     darkMode 
                       ? 'text-amber-400 hover:text-amber-300' 
                       : 'text-amber-600 hover:text-amber-500'
                   }`}
                   onMouseEnter={() => {
                     document.getElementById('mirror-highlight')?.classList.remove('opacity-0');
                     setShowDetailImage(true);
                   }}
                   onMouseLeave={() => {
                     document.getElementById('mirror-highlight')?.classList.add('opacity-0');
                     setShowDetailImage(false);
                   }}
                 >
                   a mirror that reflects the scene
                 </span>, creating a unified space between two separate panels.
               </p>
                
                <p className="leading-relaxed">
                  Just as Memling's mirror offers a new perspective on the scene, SourceLens provides multiple viewpoints 
                  through which to examine historical texts. The convex mirror in the painting reveals what would otherwise 
                  remain hidden from view. SourceLens uncovers interpretations and contexts that might not be immediately 
                  apparent in historical sources.
                </p>
                
               
              </div>
              
              {/* Image container with dynamic detail view */}
              <div className="md:w-1/2 xl:w-3/5 flex flex-col">
                <div className="relative">
   
                  {/* Main image with both highlight circle and detail image overlay */}
                  <div className={`rounded-lg overflow-hidden shadow-md ${
                    darkMode ? 'ring-1 ring-slate-700' : 'ring-1 ring-slate-200'
                  }`}>
                    <Image 
                      src="/memling.jpg"
                      alt="Diptych of Maarten van Nieuwenhove by Hans Memling"
                      width={700}
                      height={400}
                      className="w-full h-auto object-cover"
                      priority
                    />
                    
                    {/* Mirror highlight circle */}
                    <div 
                      id="mirror-highlight"
                      className={`absolute rounded-full border-4 border-amber-500/70 bg-amber-400/20 w-20 h-20 top-[125px] left-[70px] opacity-0 transition-all duration-300 ease-in-out pointer-events-none ${
                        showDetailImage ? 'scale-110' : 'scale-100'
                      }`}
                      style={{
                        boxShadow: '0 0 30px 8px rgba(217, 119, 6, 0.3)',
                        transform: 'translate(-50%, -50%)'
                      }}
                    />
                    
                    {/* Detail image that appears on hover */}
                    <div 
                      className={`absolute top-0 right-0 bottom-0 w-1/2 transition-all duration-600 ${
                        showDetailImage ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      <div className="relative w-full h-full overflow-hidden">
                        <Image
                          src="/sourcelensdetail.jpg"
                          alt="Detail of the mirror in Memling's painting"
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                        <div className={`absolute inset-0 ${
                          darkMode 
                            ? 'bg-gradient-to-l from-transparent to-slate-900/80' 
                            : 'bg-gradient-to-l from-transparent to-white/80'
                        } transition-opacity duration-300`}></div>
                      </div>
                    </div>
                  </div>
                  
                  <p className={`text-xs ${
                    darkMode ? 'text-slate-400' : 'text-slate-500'
                  } italic text-center mt-2`}>
                    Diptych of Maarten van Nieuwenhove (1487) by Hans Memling
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className={`p-4 border-t ${
            darkMode ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-slate-50'
          } flex justify-end rounded-b-xl`}>
            <button
              onClick={onClose}
              className={`px-4 py-2 rounded-md shadow-sm font-medium transition-colors ${
                darkMode
                  ? 'bg-indigo-700 hover:bg-indigo-600 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}