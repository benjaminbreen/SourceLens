// components/ui/AboutModal.tsx
// Enhanced modal component with tabbed interface, animations, and improved accessibility
// Displays information about SourceLens, its purpose, methodology, and future work

'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AboutModal({ isOpen, onClose }: AboutModalProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [indicatorStyle, setIndicatorStyle] = useState({});
  const [isClosing, setIsClosing] = useState(false);

  // Tab definitions
  const tabs = [
    { label: "The Project", id: "project" },
    { label: "Methodology", id: "methodology" },
    { label: "Case Studies", id: "case-studies" },
    { label: "Future Work", id: "future-work" }
  ];

  // Update indicator position when active tab changes
  useEffect(() => {
    if (isOpen) {
      const updateIndicator = () => {
        const tabElements = document.querySelectorAll('.tab-button');
        if (tabElements.length > activeTab) {
          const currentTab = tabElements[activeTab] as HTMLElement;
          setIndicatorStyle({
            width: `${currentTab.offsetWidth}px`,
            transform: `translateX(${currentTab.offsetLeft}px)`
          });
        }
      };
      
      // Small delay to ensure DOM is updated
      setTimeout(updateIndicator, 50);
      window.addEventListener('resize', updateIndicator);
      
      return () => window.removeEventListener('resize', updateIndicator);
    }
  }, [activeTab, isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = ''; // Re-enable scrolling when modal is closed
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
      className={`fixed inset-0 bg-black/70 rounded-xl backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-200 ${isClosing ? 'opacity-0' : 'opacity-100'}`}
      onClick={handleClose}
    >
      <div 
        className={`bg-slate-100 rounded-xl shadow-xl max-w-5xl w-full max-h-[80vh] overflow-hidden transition-transform duration-200 ${isClosing ? 'scale-95' : 'scale-100'}`}
        onClick={handleContentClick}
      >
        {/* Header with title */}
        <div className="bg-slate-800 text-white p-4 border-b border-slate-200  flex justify-between items-center">
          <h3 className="font-bold text-2xl">About SourceLens</h3>
          <button 
            onClick={handleClose}
            className="text-white/80  hover:text-white hover:rotate-90 transition-transform duration-300 rounded-full w-8 h-8 flex items-center justify-center"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Tab navigation */}
        <div className="bg-slate-800/94 font-mono  border-b-2 border-indigo-400  px-1 relative">
          <div className="flex">
            {tabs.map((tab, index) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(index)}
                className={`tab-button py-3 px-4  font-bold text-md relative transition-colors ${
                  activeTab === index 
                    ? 'text-indigo-300' 
                    : 'text-indigo-400 hover:text-white/90'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          
          {/* Animated indicator for active tab */}
          <div 
            className="absolute bottom-0 left-0 h-1 bg-amber-400 transition-all duration-300 ease-in-out"
            style={indicatorStyle}
          />
        </div>
        
        {/* Tab content container */}
        <div className="overflow-y-auto p-3 mt-1 max-h-[70vh]">
          {/* Project Tab */}
          {activeTab === 0 && (
            <div className="p-4 ml-1 ml-2 ">
              <div className="flex flex-col overflow-y-auto  md:flex-row gap-6 items-center md:items-start mb-4">
                <Image 
                  src="/sourcelenslogo.png" 
                  alt="SourceLens Logo" 
                  width={100} 
                  height={100} 
                  className="rounded-full shadow-lg "
                />
                <div>
                  <h3 className="text-3xl font-serif text-indigo-900 mb-2">Understanding sources from multiple perspectives</h3>
                  <p className="text-lg text-slate-700">
                    SourceLens is an experimental tool for anyone who works with textual sources. It offers multiple analytical lenses to examine texts, helping uncover layers of meaning that might otherwise remain hidden.
                  </p>
                  <p className="text-lg text-slate-700 mt-4">
                    Rather than seeing AI as <em>either</em> a disaster or an oracle, SourceLens treats it as an intellectual 
                    thought partner with unique capabilities but significant limitations. The goal is to help 
                    researchers see their materials in creative ways.
                  </p>
                </div>
              </div>
              
              <h4 className="text-lg font-medium text-indigo-800 mt-6 mb-3">What this is trying to do</h4>
          
            <p className="text-slate-700">
                I am a professional historian and have designed this tool to suit my own use cases and my own style of thinking and researching. However, I think LLM-augmented research is currently (and somewhat surprisingly) underrated among humanists like myself. So in building a tool I wanted to use, I also got interested in making it available more widely. I'm really curious what other people do with it. 
              </p>
              
              <h4 className="text-lg font-medium text-indigo-800 mt-6 mb-3">Who made this?</h4>
              <p className="text-slate-700">
                SourceLens was conceived and developed by me, Benjamin Breen, an Associate Professor of History at UC Santa Cruz.  You can find more about the rationale behind this project at my newsletter <a href="https://resobscura.substack.com" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 underline">Res Obscura</a>.
              </p>
              
              <p className="text-slate-700 mt-4">
                The project emerged from conversations with Pranav Anand and Zac Zimmer (both UCSC) on how AI tools can 
                assist historical research while encouraging a mindset of creativity and experimentation rather than 
                relying uncritically on AI-generated content.
              </p>
            </div>
          )}
          
          {/* Methodology Tab */}
          {activeTab === 1 && (
            <div className="p-6 space-y-6">
              <h3 className="text-xl font-medium text-indigo-900 mb-4">Methodological Approach</h3>
              
              <h4 className="text-lg font-medium text-indigo-800 mt-4 mb-3">Interpretive Lenses</h4>
              <p className="text-slate-700">
                SourceLens employs multiple "interpretive lenses" to analyze historical texts:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-slate-700 mt-3">
                <li><strong>Conventional Lens:</strong> Standard scholarly analysis of context, authorship, themes, and significance</li>
                <li><strong>Counter-Narrative Lens:</strong> Alternative readings that challenge orthodox interpretations</li>
                <li><strong>Silenced Voice Lens:</strong> First-person perspective from individuals mentioned but not given voice in the source</li>
                <li><strong>Place as Witness Lens:</strong> Perspective of locations or environments featured in the text</li>
                <li><strong>Provenance Lens:</strong> Exploration of how the source came to be created, preserved, and studied</li>
              </ul>
              
              <h4 className="text-lg font-medium text-indigo-800 mt-6 mb-3">Critical AI Engagement</h4>
              <p className="text-slate-700">
                SourceLens promotes critical engagement with AI by:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-slate-700 mt-3">
                <li>Exposing rather than hiding the AI's role in generating content</li>
                <li>Providing complete transparency into prompts and responses</li>
                <li>Encouraging skeptical evaluation of AI-generated insights</li>
                <li>Treating AI as a flawed collaborator rather than an authority</li>
                <li>Placing researcher judgment at the center of the interpretive process</li>
              </ul>
              
              <h4 className="text-lg font-medium text-indigo-800 mt-6 mb-3">Technical Architecture</h4>
              <p className="text-slate-700">
                The platform integrates several components:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-slate-700 mt-3">
                <li>Document processing pipeline (OCR, text extraction, cleaning)</li>
                <li>Integration with multiple LLM providers (OpenAI, Anthropic, Google)</li>
                <li>Local browser storage for maintaining research libraries</li>
                <li>React-based UI for interactive analysis</li>
              </ul>
            </div>
          )}
          
          {/* Case Studies Tab */}
          {activeTab === 2 && (
            <div className="p-6 space-y-6">
              <h3 className="text-xl font-medium text-indigo-900 mb-4">Research Case Studies</h3>
              
              
              <h4 className="text-lg font-medium text-indigo-800 mt-4 mb-3">Medical Texts</h4>
              <p className="text-slate-700">
                Analysis of early modern medical treatises identified language patterns revealing shifting attitudes 
                toward empirical observation versus classical authority.
              </p>
              
              <h4 className="text-lg font-medium text-indigo-800 mt-4 mb-3">Travel Narratives</h4>
              <p className="text-slate-700">
                The Place as Witness lens applied to 19th-century travel accounts is quite intersting. More to come here.
              </p>
              
              <h4 className="text-lg font-medium text-indigo-800 mt-4 mb-3">Personal Diaries</h4>
              <p className="text-slate-700">
                A study of Victorian-era personal diaries demonstrated how the counternarrative and simulation lenses could reconstruct 
                plausible perspectives of domestic servants mentioned but rarely described in their employers' accounts.
              </p>
              
              
            </div>
          )}
          
          {/* Future Work Tab */}
          {activeTab === 3 && (
            <div className="p-6 space-y-6">
              <h3 className="text-xl font-medium text-indigo-900 mb-4">Future Development</h3>
              
              <h4 className="text-lg font-medium text-indigo-800 mt-4 mb-3">Planned Features</h4>
              <p className="text-slate-700">
                I am working on several enhancements to SourceLens:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-slate-700 mt-3">
                <li><strong>Enhanced OCR:</strong> Improved text extraction for historical manuscripts and documents</li>
                <li><strong>Corpus Analysis:</strong> Tools for analyzing collections rather than individual documents</li>
                <li><strong>Material Culture Analysis:</strong> Support for analyzing non-textual images</li>
                <li><strong>Integration with Citation Managers:</strong> Export capabilities for Zotero and other tools</li>
              </ul>
              
              <h4 className="text-lg font-medium text-indigo-800 mt-6 mb-3">Research Directions</h4>
              <p className="text-slate-700">
                Future research with SourceLens will explore:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-slate-700 mt-3">
                <li>Comparative analysis of different AI models' interpretive tendencies</li>
                <li>Development of specialized prompt engineering for historical research</li>
                <li>Tools for detecting and correcting AI hallucinations in historical contexts</li>
                <li>Pedagogical applications for history education</li>
              </ul>
              
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 mt-6">
             
                <p className="text-slate-700 mt-4">
                  Contact <a href="mailto:bebreen@ucsc.edu" className="text-indigo-600 hover:text-indigo-800 underline">bebreen@ucsc.edu</a> to learn more about getting involved.
                </p>
              </div>
              
              <div className="border-t border-slate-200 pt-4 mt-6">
           
              </div>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-2 border-t border-gray-200 bg-gray-200 flex justify-end">
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}