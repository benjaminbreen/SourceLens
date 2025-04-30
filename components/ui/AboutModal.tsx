// components/ui/AboutModal.tsx
// Streamlined modal component with tabbed interface showcasing SourceLens purpose and future work
// Features responsive design, smooth animations, and consistent styling with the main application

'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Space_Grotesk } from 'next/font/google';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700'],
  variable: '--font-space-grotesk',
});

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
}

export default function AboutModal({ isOpen, onClose, isDarkMode }: AboutModalProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [isClosing, setIsClosing] = useState(false);
  const tabsRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({
    left: '0px',
    width: '0px',
  });

  // Simplified tabs array
  const tabs = [
    { label: "About", id: "about" },
    { label: "Future Work", id: "future-work" },
    { label: "Contact", id: "contact" }
  ];

  // Update tab indicator position and width
  useEffect(() => {
    if (isOpen && tabsRef.current) {
      const updateIndicator = () => {
        const tabButtons = tabsRef.current?.querySelectorAll('.tab-button');
        if (tabButtons && tabButtons.length > activeTab) {
          const activeTabElement = tabButtons[activeTab] as HTMLElement;
          setIndicatorStyle({
            left: `${activeTabElement.offsetLeft}px`,
            width: `${activeTabElement.offsetWidth}px`,
          });
        }
      };
      
      updateIndicator();
      window.addEventListener('resize', updateIndicator);
      
      return () => window.removeEventListener('resize', updateIndicator);
    }
  }, [activeTab, isOpen]);

  // Handle escape key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle modal closing with animation
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
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
      aria-label="About SourceLens"
    >
      <div 
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
                SourceLens
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
        
        {/* Tab navigation */}
        <div 
          ref={tabsRef}
          className={`${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'} border-b ${isDarkMode ? 'border-slate-700' : 'border-slate-200'} relative`}
        >
          <div className="flex">
            {tabs.map((tab, index) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(index)}
                className={`tab-button py-3 px-6 font-medium text-sm transition-colors 
                            ${activeTab === index 
                              ? (isDarkMode ? 'text-amber-400' : 'text-indigo-700') 
                              : (isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-800')
                            }`}
                aria-selected={activeTab === index}
                role="tab"
              >
                {tab.label}
              </button>
            ))}
          </div>
          
          {/* Animated tab indicator */}
          <div 
            className={`absolute bottom-0 h-0.5 transition-all duration-300 ease-in-out ${isDarkMode ? 'bg-amber-500' : 'bg-indigo-600'}`}
            style={{
              left: indicatorStyle.left,
              width: indicatorStyle.width,
            }}
          />
        </div>
        
        {/* Tab content */}
        <div className={`overflow-y-auto ${isDarkMode ? 'bg-slate-900' : 'bg-white'} transition-colors duration-300`} style={{maxHeight: 'calc(90vh - 120px)'}}>
          {/* About Tab */}
          {activeTab === 0 && (
            <div className="p-6 md:p-8 space-y-6">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="md:max-w-xs flex-shrink-0 pt-2">
                  <div className="relative aspect-square w-full max-w-[180px] rounded-xl overflow-hidden shadow-md mx-auto md:mx-0">
                    <Image 
                      src="/sourcelensbar.jpg" 
                      alt="SourceLens Banner" 
                      fill
                      className="object-cover" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className={`${spaceGrotesk.className} text-white text-lg font-semibold tracking-tight`}>
                        Understanding primary sources
                      </h3>
                    </div>
                  </div>
                </div>
                
                <div className="flex-grow space-y-4">
                  <h3 className={`${spaceGrotesk.className} text-2xl font-semibold ${isDarkMode ? 'text-indigo-300' : 'text-indigo-900'}`}>
                    Exploring texts through multiple perspectives
                  </h3>
                  
                  <p className={`${isDarkMode ? 'text-slate-300' : 'text-slate-700'} text-base leading-relaxed`}>
                    SourceLens is an experimental tool for researchers who work with textual sources. It offers multiple analytical lenses to examine texts, helping uncover layers of meaning that might otherwise remain hidden.
                  </p>
                  
                  <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-indigo-50 border border-indigo-100'}`}>
                    <p className={`${isDarkMode ? 'text-slate-300' : 'text-slate-700'} text-base italic`}>
                      Rather than seeing AI as <em>either</em> a disaster or an oracle, SourceLens treats it as an intellectual 
                      thought partner with unique capabilities but significant limitations. The goal is to help 
                      researchers see their materials in creative ways.
                    </p>
                  </div>
                  
                  <h4 className={`text-lg font-medium mt-6 ${isDarkMode ? 'text-amber-400' : 'text-indigo-800'}`}>
                    Who made this?
                  </h4>
                  
                  <p className={`${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    SourceLens was conceived and developed by Benjamin Breen, an Associate Professor of History at UC Santa Cruz. 
                    You can find more about the rationale behind this project at his newsletter 
                    <a href="https://resobscura.substack.com" target="_blank" rel="noopener noreferrer" 
                       className={`ml-1 ${isDarkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-800'} underline`}>
                      Res Obscura
                    </a>.
                  </p>
                  
                  <p className={`${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    The project emerged from conversations with Pranav Anand and Zac Zimmer (both UCSC) on how AI tools can 
                    assist historical research while encouraging a mindset of creativity and experimentation rather than 
                    relying uncritically on AI-generated content.
                  </p>


                </div>

              </div>
              
  <h4 className={`text-lg mx-auto font-medium mb-4 ${isDarkMode ? 'text-amber-400' : 'text-indigo-800'}`}>
    Stay updated with SourceLens
  </h4>

  <div className="newsletter-container max-w-md mx-auto">
    <iframe 
      src="https://sourcelens.substack.com/embed" 
      width="100%" 
      height="150" 
      className={`border ${isDarkMode ? 'border-slate-700' : 'border-slate-200'} rounded-lg overflow-hidden bg-white`}
      style={{ maxWidth: "100%" }}
      frameBorder="0" 
      scrolling="no"
      title="Subscribe to SourceLens newsletter"
    />
    <p className={`text-xs mt-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
      Occasional updates about new features and improvements.
    </p>
  </div>
  
  
            </div>

          )}
          
          {/* Future Work Tab */}
          {activeTab === 1 && (
            <div className="p-6 md:p-8 space-y-6">
              <h3 className={`${spaceGrotesk.className} text-2xl font-semibold ${isDarkMode ? 'text-indigo-300' : 'text-indigo-900'} mb-4`}>
                Looking ahead
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className={`p-5 rounded-xl ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200'} shadow-sm`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-indigo-900/50' : 'bg-indigo-100'}`}>
                      <svg className={`w-5 h-5 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <h4 className={`text-lg font-medium ${isDarkMode ? 'text-amber-400' : 'text-indigo-800'}`}>
                      Planned Features
                    </h4>
                  </div>
                  
                  <ul className={`space-y-2.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    <li className="flex items-start gap-2">
                      <svg className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isDarkMode ? 'text-amber-500' : 'text-indigo-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span><strong className="font-medium">Enhanced OCR</strong>: Improved text extraction for historical manuscripts and documents</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isDarkMode ? 'text-amber-500' : 'text-indigo-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span><strong className="font-medium">Corpus Analysis</strong>: Tools for analyzing collections rather than individual documents</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isDarkMode ? 'text-amber-500' : 'text-indigo-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span><strong className="font-medium">Material Culture Analysis</strong>: Support for analyzing non-textual artifacts</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isDarkMode ? 'text-amber-500' : 'text-indigo-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span><strong className="font-medium">Integration with Citation Managers</strong>: Export capabilities for Zotero and other tools</span>
                    </li>
                  </ul>
                </div>
                
                <div className={`p-5 rounded-xl ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200'} shadow-sm`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-amber-900/50' : 'bg-amber-100'}`}>
                      <svg className={`w-5 h-5 ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <h4 className={`text-lg font-medium ${isDarkMode ? 'text-amber-400' : 'text-indigo-800'}`}>
                      Research Directions
                    </h4>
                  </div>
                  
                  <ul className={`space-y-2.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    <li className="flex items-start gap-2">
                      <svg className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isDarkMode ? 'text-amber-500' : 'text-amber-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Comparative analysis of different AI models' interpretive tendencies</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isDarkMode ? 'text-amber-500' : 'text-amber-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Development of specialized prompt engineering for historical research</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isDarkMode ? 'text-amber-500' : 'text-amber-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Tools for detecting and correcting AI hallucinations in historical contexts</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isDarkMode ? 'text-amber-500' : 'text-amber-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Pedagogical applications for history education</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className={`p-5 rounded-xl mt-8 ${isDarkMode ? 'bg-indigo-900/30 border border-indigo-900/20' : 'bg-indigo-50 border border-indigo-100'}`}>
                <p className={`${isDarkMode ? 'text-slate-300' : 'text-slate-700'} text-sm`}>
                  SourceLens is an evolving project. If you'd like to contribute or have suggestions for improvement, please get in touch via the contact information in the next tab.
                </p>
              </div>
            </div>
          )}
          
          {/* Contact Tab */}
          {activeTab === 2 && (
            <div className="p-6 md:p-8 space-y-6">
              <h3 className={`${spaceGrotesk.className} text-2xl font-semibold ${isDarkMode ? 'text-indigo-300' : 'text-indigo-900'} mb-4`}>
                Get in touch
              </h3>
              
              <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200'} shadow-sm max-w-2xl mx-auto`}>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-indigo-900/50' : 'bg-indigo-100'}`}>
                        <svg className={`w-5 h-5 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <h4 className={`text-lg font-medium ${isDarkMode ? 'text-amber-400' : 'text-indigo-800'}`}>
                        Email
                      </h4>
                    </div>
                    
                    <a 
                      href="mailto:bebreen@ucsc.edu" 
                      className={`flex items-center gap-2 p-3 rounded-lg mt-2 ${
                        isDarkMode 
                          ? 'bg-slate-700/50 hover:bg-slate-700 text-slate-300' 
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      } transition-colors`}
                    >
                      <span className="text-sm">bebreen@ucsc.edu</span>
                      <svg className="w-4 h-4 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-amber-900/50' : 'bg-amber-100'}`}>
                        <svg className={`w-5 h-5 ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h4 className={`text-lg font-medium ${isDarkMode ? 'text-amber-400' : 'text-indigo-800'}`}>
                        On the web
                      </h4>
                    </div>
                    
                    <a 
                      href="https://resobscura.substack.com" 
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center gap-2 p-3 rounded-lg mt-2 ${
                        isDarkMode 
                          ? 'bg-slate-700/50 hover:bg-slate-700 text-slate-300' 
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      } transition-colors`}
                    >
                      <span className="text-sm">Res Obscura Newsletter</span>
                      <svg className="w-4 h-4 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                </div>
                
                <div className={`mt-6 p-4 rounded-lg ${isDarkMode ? 'bg-slate-700' : 'bg-slate-50'}`}>
                  <p className={`${isDarkMode ? 'text-slate-300' : 'text-slate-700'} text-sm`}>
                    Interested in contributing to this project or have suggestions for improvement? Please reach out via email. I'm particularly interested in collaborations with historians, researchers, and developers who are exploring the intersection of AI and historical research methods.
                  </p>
                </div>
              </div>
            </div>
          )}
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