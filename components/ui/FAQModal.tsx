// components/ui/FAQModal.tsx
// Comprehensive beginner's guide modal with interactive sections, visual elements,
// and detailed step-by-step instructions for SourceLens users

'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface FAQModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FAQModal({ isOpen, onClose }: FAQModalProps) {
  const [activeSection, setActiveSection] = useState(0);
  const [isClosing, setIsClosing] = useState(false);
  
  // Handle escape key and body scrolling
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
      className={`fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-200 ${isClosing ? 'opacity-0' : 'opacity-100'}`}
      onClick={handleClose}
    >
      <div 
        className={`bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden transition-transform duration-200 ${isClosing ? 'scale-95' : 'scale-100'}`}
        onClick={handleContentClick}
      >
        {/* Header with decorative accent */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white p-5 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -right-4 -top-4 w-64 h-64 bg-white/30 rounded-full blur-2xl"></div>
            <div className="absolute left-1/4 -bottom-8 w-48 h-48 bg-white/20 rounded-full blur-xl"></div>
          </div>
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center">
              <Image 
                src="/sourcelenslogo.png" 
                alt="SourceLens Logo" 
                width={50} 
                height={50} 
                className="rounded-full shadow-lg border-2 border-white/30 mr-4"
              />
              <div>
                <h3 className="font-bold text-2xl">Beginner's Guide to SourceLens</h3>
                <p className="text-indigo-100 text-sm mt-1">Exploring multiple perspectives on historical texts</p>
              </div>
            </div>
            <button 
              onClick={handleClose}
              className="text-white/80 hover:text-white hover:bg-white/10 rounded-full w-10 h-10 flex items-center justify-center transition-colors"
              aria-label="Close modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Content with sidebar navigation */}
        <div className="flex flex-col md:flex-row h-[70vh]">
          {/* Sidebar navigation */}
          <div className="md:w-64 bg-slate-50 border-r border-slate-200 md:h-full overflow-y-auto shrink-0">
            <nav className="p-2">
              <ul className="space-y-1">
                {[
                  { label: "What is SourceLens?", icon: "info-circle" },
                  { label: "Getting Started", icon: "rocket" },
                  { label: "Source Analysis", icon: "magnifying-glass" },
                  { label: "Interpretive Lenses", icon: "eye" },
                  { label: "Advanced Features", icon: "beaker" },
                  { label: "Research Library", icon: "book" },
                  { label: "Quick Reference", icon: "lightbulb" }
                ].map((section, index) => (
                  <li key={index}>
                    <button
                      onClick={() => setActiveSection(index)}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center ${
                        activeSection === index 
                          ? 'bg-indigo-100 text-indigo-900 font-medium' 
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {getIcon(section.icon)}
                      <span className="ml-3">{section.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
          
          {/* Main content area */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* What is SourceLens? */}
            {activeSection === 0 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-serif text-indigo-900 mb-4 pb-2 border-b border-slate-200">What is SourceLens?</h2>
                
                <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
                  <div className="bg-indigo-50 rounded-xl p-5 flex items-center justify-center shrink-0">
                    <svg className="w-16 h-16 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-slate-700 leading-relaxed">
                      SourceLens is an innovative AI-powered research tool designed to help scholars, students, and researchers 
                      analyze historical texts through multiple interpretive perspectives. Rather than providing a single 
                      reading, SourceLens offers various analytical "lenses" that reveal different layers of meaning.
                    </p>
                    <p className="text-slate-700 leading-relaxed mt-4">
                      This tool doesn't replace critical thinking – it enhances it by suggesting alternative interpretations 
                      you might not have considered, identifying contextual elements that might be overlooked, and 
                      facilitating deeper engagement with primary sources.
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-5 mt-6">
                  <h3 className="text-lg font-medium text-slate-800 mb-3">Key Benefits</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-100">
                      <div className="flex items-center mb-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-2">
                          <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <h4 className="font-medium text-slate-800">Multiple Perspectives</h4>
                      </div>
                      <p className="text-slate-600 text-sm">Explore texts through conventional analysis, counter-narratives, silenced voices, and more.</p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-100">
                      <div className="flex items-center mb-2">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center mr-2">
                          <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <h4 className="font-medium text-slate-800">Time-Saving</h4>
                      </div>
                      <p className="text-slate-600 text-sm">Get comprehensive analysis in minutes instead of hours of manual research.</p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-100">
                      <div className="flex items-center mb-2">
                        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center mr-2">
                          <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <h4 className="font-medium text-slate-800">Transparent AI</h4>
                      </div>
                      <p className="text-slate-600 text-sm">See exactly how AI is used with full access to prompts and model information.</p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-100">
                      <div className="flex items-center mb-2">
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-2">
                          <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                        </div>
                        <h4 className="font-medium text-slate-800">Research Library</h4>
                      </div>
                      <p className="text-slate-600 text-sm">Save and organize your analyses, sources, and references for future use.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Getting Started */}
            {activeSection === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-serif text-indigo-900 mb-4 pb-2 border-b border-slate-200">Getting Started</h2>
                
                <div className="rounded-xl overflow-hidden border border-slate-200">
                  {/* Step 1 */}
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-5">
                    <div className="flex items-start">
                      <div className="w-10 h-10 rounded-full bg-blue-700 text-white flex items-center justify-center shrink-0 mr-4">
                        <span className="font-bold">1</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-blue-900">Input Your Source</h3>
                        <p className="text-slate-700 mt-2">
                          Begin with a historical text or document you want to analyze. You have several options for adding your source:
                        </p>
                        <ul className="mt-3 space-y-2">
                          <li className="flex items-start">
                            <svg className="w-5 h-5 text-blue-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-slate-700"><strong>Text Input:</strong> Paste text directly into the text field on the homepage.</span>
                          </li>
                          <li className="flex items-start">
                            <svg className="w-5 h-5 text-blue-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-slate-700"><strong>File Upload:</strong> Upload .txt, .pdf, .docx, or image files.</span>
                          </li>
                          <li className="flex items-start">
                            <svg className="w-5 h-5 text-blue-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-slate-700"><strong>Sample Texts:</strong> Try the "See how it works" option to load a sample historical document.</span>
                          </li>
                        </ul>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
                          <p className="text-sm text-blue-800 flex items-start">
                            <svg className="w-5 h-5 text-blue-500 mr-2 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>For best results, keep sources under 20,000 words.</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Step 2 */}
                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-5 border-t border-slate-200">
                    <div className="flex items-start">
                      <div className="w-10 h-10 rounded-full bg-purple-700 text-white flex items-center justify-center shrink-0 mr-4">
                        <span className="font-bold">2</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-purple-900">Add Source Information</h3>
                        <p className="text-slate-700 mt-2">
                          Metadata will be automatically extracted, but you can edit and expand it to improve analysis accuracy. The more context you give, the better the results will be:
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                          <div className="bg-white rounded-lg p-3 shadow-sm">
                            <h4 className="font-medium text-purple-900 text-sm">Document Date</h4>
                            <p className="text-sm text-slate-700 mt-1">When was the source created? (e.g., "1845", "Early 17th century")</p>
                          </div>
                          <div className="bg-white rounded-lg p-3 shadow-sm">
                            <h4 className="font-medium text-purple-900 text-sm">Author</h4>
                            <p className="text-sm text-slate-700 mt-1">Who wrote or created the document? Include full name if known.</p>
                          </div>
                          <div className="bg-white rounded-lg p-3 shadow-sm">
                            <h4 className="font-medium text-purple-900 text-sm">Research goals</h4>
                            <p className="text-sm text-slate-700 mt-1">What do you want to learn about or from this source?</p>
                          </div>
                         
                        </div>
                        
                      </div>
                    </div>
                  </div>
                  
                  {/* Step 3 */}
                  <div className="bg-gradient-to-r from-amber-50 to-amber-100 p-5 border-t border-slate-200">
                    <div className="flex items-start">
                      <div className="w-10 h-10 rounded-full bg-amber-700 text-white flex items-center justify-center shrink-0 mr-4">
                        <span className="font-bold">3</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-amber-900">Analyze</h3>
                        
    
                
                         <p className="text-slate-700 mt-2">
                            Once you've completed these steps, click "Analyze Source" to begin the analysis process. The page will redirect to the analysis interface when complete.
                          </p>
                     
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Source Analysis */}
            {activeSection === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-serif text-indigo-900 mb-4 pb-2 border-b border-slate-200">Source Analysis</h2>
                
                <p className="text-slate-700">
                  After processing your source, SourceLens presents a comprehensive analysis interface with three main panels:
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                  {/* Left Panel */}
                  <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 shadow-sm">
                    <div className="bg-slate-200 rounded-full w-16 h-7 text-xs font-medium text-slate-600 flex items-center justify-center mb-3">
                      Left Panel
                    </div>
                    <h3 className="text-lg font-medium text-slate-800 mb-3">Tools & Metadata</h3>
                    <p className="text-sm text-slate-700 mb-4">
                      Contains document information, analytical tools, and options to customize your analysis.
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-start">
                        <svg className="w-5 h-5 text-indigo-500 mr-2 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                        <span className="text-sm text-slate-700">Document portrait with metadata</span>
                      </div>
                      <div className="flex items-start">
                        <svg className="w-5 h-5 text-indigo-500 mr-2 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                        </svg>
                        <span className="text-sm text-slate-700">LLM model selection</span>
                      </div>
                      <div className="flex items-start">
                        <svg className="w-5 h-5 text-indigo-500 mr-2 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        <span className="text-sm text-slate-700">Perspective selector</span>
                      </div>
                      <div className="flex items-start">
                        <svg className="w-5 h-5 text-indigo-500 mr-2 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm text-slate-700">LLM transparency tools</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Center Panel */}
                  <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 shadow-sm">
                    <div className="bg-slate-200 rounded-full w-24 h-7 text-xs font-medium text-slate-600 flex items-center justify-center mb-3">
                      Center Panel
                    </div>
                    <h3 className="text-lg font-medium text-slate-800 mb-3">Primary Source & Chat</h3>
                    <p className="text-sm text-slate-700 mb-4">
                      Displays your source document and provides an interactive chat to ask specific questions.
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-start">
                        <svg className="w-5 h-5 text-indigo-500 mr-2 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                     

                     <span className="text-sm text-slate-700">Source document viewer</span>
                      </div>
                      <div className="flex items-start">
                        <svg className="w-5 h-5 text-indigo-500 mr-2 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                        <span className="text-sm text-slate-700">AI chat interface for questions</span>
                      </div>
                      <div className="flex items-start">
                        <svg className="w-5 h-5 text-indigo-500 mr-2 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        <span className="text-sm text-slate-700">Text highlighting tools</span>
                      </div>
                      <div className="flex items-start">
                        <svg className="w-5 h-5 text-indigo-500 mr-2 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                        </svg>
                        <span className="text-sm text-slate-700">Source metadata display</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Right Panel */}
                  <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 shadow-sm">
                    <div className="bg-slate-200 rounded-full w-20 h-7 text-xs font-medium text-slate-600 flex items-center justify-center mb-3">
                      Right Panel
                    </div>
                    <h3 className="text-lg font-medium text-slate-800 mb-3">Analysis Results</h3>
                    <p className="text-sm text-slate-700 mb-4">
                      Shows analysis results in different formats depending on the selected mode.
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-start">
                        <svg className="w-5 h-5 text-indigo-500 mr-2 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm text-slate-700">Basic analysis summary</span>
                      </div>
                      <div className="flex items-start">
                        <svg className="w-5 h-5 text-indigo-500 mr-2 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                        <span className="text-sm text-slate-700">Detailed analysis</span>
                      </div>
                      <div className="flex items-start">
                        <svg className="w-5 h-5 text-indigo-500 mr-2 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m-4 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                        <span className="text-sm text-slate-700">Counter-narratives</span>
                      </div>
                      <div className="flex items-start">
                        <svg className="w-5 h-5 text-indigo-500 mr-2 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <span className="text-sm text-slate-700">Scholarly references</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 bg-indigo-50 rounded-xl p-5 border border-indigo-100">
                  <h3 className="text-lg font-medium text-indigo-900 mb-3">Exploring the Analysis</h3>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <div className="w-7 h-7 rounded-full bg-indigo-200 flex items-center justify-center shrink-0 mr-3">
                        <span className="font-medium text-indigo-800">1</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-indigo-900">Initial Analysis</h4>
                        <p className="text-sm text-slate-700 mt-1">
                          The system starts with a brief summary and preliminary analysis, along with suggested follow-up questions
                          to explore. Click any question to add it to the conversation.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="w-7 h-7 rounded-full bg-indigo-200 flex items-center justify-center shrink-0 mr-3">
                        <span className="font-medium text-indigo-800">2</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-indigo-900">Detailed Analysis</h4>
                        <p className="text-sm text-slate-700 mt-1">
                          Click "Detailed Analysis" to generate an in-depth examination with sections on context, author perspective,
                          key themes, evidence & rhetoric, significance, and scholarly references.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="w-7 h-7 rounded-full bg-indigo-200 flex items-center justify-center shrink-0 mr-3">
                        <span className="font-medium text-indigo-800">3</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-indigo-900">Interactive Exploration</h4>
                        <p className="text-sm text-slate-700 mt-1">
                          Use the chat interface to ask specific questions about the source. The AI will respond based on the 
                          document and provide relevant insights tailored to your inquiry.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="w-7 h-7 rounded-full bg-indigo-200 flex items-center justify-center shrink-0 mr-3">
                        <span className="font-medium text-indigo-800">4</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-indigo-900">Save Your Work</h4>
                        <p className="text-sm text-slate-700 mt-1">
                          Use the "Save to Library" option to store your analyses, source documents, and references for future reference.
                          This creates a personal research database you can access anytime.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Interpretive Lenses */}
            {activeSection === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-serif text-indigo-900 mb-4 pb-2 border-b border-slate-200">Interpretive Lenses</h2>
                
                <p className="text-slate-700">
                  A key feature of SourceLens is the ability to analyze texts through multiple interpretive lenses, each offering
                  a different perspective on the source material:
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
                  {/* Conventional Lens */}
                  <div className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm flex flex-col h-full">
                    <div className="bg-purple-50 p-4 border-b border-purple-100">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                          <svg className="w-5 h-5 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-medium text-purple-900">Conventional Analysis</h3>
                      </div>
                    </div>
                    <div className="p-4 flex-grow">
                      <p className="text-slate-700 text-sm">
                        The standard scholarly examination of a text, including:
                      </p>
                      <ul className="list-disc pl-5 mt-2 space-y-1 text-sm text-slate-700">
                        <li>Historical context</li>
                        <li>Author perspective and biography</li>
                        <li>Key themes and arguments</li>
                        <li>Evidence analysis</li>
                        <li>Significance within broader historical narrative</li>
                      </ul>
                      <div className="mt-3 bg-purple-50 p-3 rounded-lg text-xs text-purple-800">
                        <strong>Example:</strong> A conventional analysis of the Gettysburg Address would examine Lincoln's rhetorical strategies, political context of the Civil War, and its significance in American political thought.
                      </div>
                    </div>
                  </div>
                  
                  {/* Counter-Narrative Lens */}
                  <div className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm flex flex-col h-full">
                    <div className="bg-amber-50 p-4 border-b border-amber-100">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mr-3">
                          <svg className="w-5 h-5 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m-4 6H4m0 0l4 4m-4-4l4-4" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-medium text-amber-900">Counter-Narrative</h3>
                      </div>
                    </div>
                    <div className="p-4 flex-grow">
                      <p className="text-slate-700 text-sm">
                        Challenges conventional readings by examining what's missing, marginalized, or taken for granted in the text.
                      </p>
                      <ul className="list-disc pl-5 mt-2 space-y-1 text-sm text-slate-700">
                        <li>Alternative interpretations</li>
                        <li>Power dynamics overlooked in traditional readings</li>
                        <li>Critique of author's unstated assumptions</li>
                        <li>Exploration of silenced perspectives</li>
                      </ul>
                      <div className="mt-3 bg-amber-50 p-3 rounded-lg text-xs text-amber-800">
                        <strong>Example:</strong> A counter-narrative of a colonial explorer's journal might highlight how indigenous perspectives are erased and examine how the document reinforces imperial ideology.
                      </div>
                    </div>
                  </div>
                  
                  {/* Silenced Voice Lens */}
                  <div className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm flex flex-col h-full">
                    <div className="bg-green-50 p-4 border-b border-green-100">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                          <svg className="w-5 h-5 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-medium text-green-900">Silenced Voice</h3>
                      </div>
                    </div>
                    <div className="p-4 flex-grow">
                      <p className="text-slate-700 text-sm">
                        Creates a first-person narrative from the perspective of someone mentioned in the source but not given their own voice.
                      </p>
                      <ul className="list-disc pl-5 mt-2 space-y-1 text-sm text-slate-700">
                        <li>Imaginative reconstruction of marginalized perspectives</li>
                        <li>Based on historical context and textual evidence</li>
                        <li>Reveals what conventional analysis might miss</li>
                        <li>Grounded in historical plausibility</li>
                      </ul>
                      <div className="mt-3 bg-green-50 p-3 rounded-lg text-xs text-green-800">
                        <strong>Example:</strong> A silenced voice interpretation of a plantation owner's diary might create a narrative from the perspective of an enslaved person mentioned only in passing in the original text.
                      </div>
                    </div>
                  </div>
                  
                  {/* Place as Witness Lens */}
                  <div className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm flex flex-col h-full">
                    <div className="bg-blue-50 p-4 border-b border-blue-100">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                          <svg className="w-5 h-5 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-medium text-blue-900">Place as Witness</h3>
                      </div>
                    </div>
                    <div className="p-4 flex-grow">
                      <p className="text-slate-700 text-sm">
                        Creates a narrative from the perspective of a location, landscape, or structure mentioned in the source.
                      </p>
                      <ul className="list-disc pl-5 mt-2 space-y-1 text-sm text-slate-700">
                        <li>Explores how physical spaces shape historical events</li>
                        <li>Considers the longer timeline of a place</li>
                        <li>Examines material reality and environmental factors</li>
                        <li>Reveals spatial dimensions of power and memory</li>
                      </ul>
                      <div className="mt-3 bg-blue-50 p-3 rounded-lg text-xs text-blue-800">
                        <strong>Example:</strong> A "place as witness" analysis of a battlefield account might narrate from the perspective of the landscape, revealing how geography influenced the battle and how the site has been remembered or forgotten.
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-indigo-50 rounded-xl p-5 border border-indigo-100 mt-6">
                  <h3 className="text-lg font-medium text-indigo-900 mb-2">Using Multiple Lenses Together</h3>
                  <p className="text-slate-700">
                    For the richest analytical experience, consider using multiple lenses on the same source. Each 
                    perspective reveals different aspects of the text, and the combination can provide a much more 
                    nuanced understanding than any single approach.
                  </p>
                  <p className="text-slate-700 mt-3">
                    You can access these different lenses through the navigation options in the analysis interface. 
                    Try comparing what each lens reveals about your source to develop a more comprehensive interpretation.
                  </p>
                </div>
              </div>
            )}
            
            {/* Advanced Features */}
            {activeSection === 4 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-serif text-indigo-900 mb-4 pb-2 border-b border-slate-200">Advanced Features</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Text Highlighting */}
                  <div className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                    <div className="bg-amber-50 p-4">
                      <h3 className="text-lg font-medium text-amber-900 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        Text Highlighting
                      </h3>
                    </div>
                    <div className="p-4">
                      <p className="text-slate-700 text-sm mb-3">
                        SourceLens can identify and highlight specific passages in your text based on criteria you define. 
                        This is useful for quickly finding relevant sections or visualizing patterns.
                      </p>
                      <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-700">
                        <strong className="text-amber-700">How to use it:</strong>
                        <ol className="list-decimal pl-5 mt-1 space-y-1">
                          <li>Click "Highlight" in the feature panel</li>
                          <li>Enter your criteria (e.g., "emotional language" or "references to women")</li>
                          <li>The AI will identify and highlight relevant passages</li>
                          <li>Color-coding indicates relevance strength</li>
                        </ol>
                      </div>
                    </div>
                  </div>
                  
                  {/* Extraction Tool */}
                  <div className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                    <div className="bg-purple-50 p-4">
                      <h3 className="text-lg font-medium text-purple-900 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                        </svg>
                        Information Extraction
                      </h3>
                    </div>
                    <div className="p-4">
                      <p className="text-slate-700 text-sm mb-3">
                        Extract structured information from your source, such as names, dates, locations, or custom fields.
                        Perfect for creating datasets from historical documents.
                      </p>
                      <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-700">
                        <strong className="text-purple-700">How to use it:</strong>
                        <ol className="list-decimal pl-5 mt-1 space-y-1">
                          <li>Select "Extract Info" from the feature menu</li>
                          <li>Specify what information you want to extract</li>
                          <li>Choose output format (list or table)</li>
                          <li>Results can be copied or saved to your library</li>
                        </ol>
                      </div>
                    </div>
                  </div>
                  
                  {/* Author Roleplay */}
                  <div className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                    <div className="bg-green-50 p-4">
                      <h3 className="text-lg font-medium text-green-900 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                        </svg>
                        Author Roleplay
                      </h3>
                    </div>
                    <div className="p-4">
                      <p className="text-slate-700 text-sm mb-3">
                        Engage in a simulated conversation with the author of your source. This experimental 
                        feature allows you to ask questions and explore the author's perspective in an interactive way.
                      </p>
                      <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-700">
                        <strong className="text-green-700">How to use it:</strong>
                        <ol className="list-decimal pl-5 mt-1 space-y-1">
                          <li>Select "Author Roleplay" in the navigation</li>
                          <li>Enter your questions in the chat interface</li>
                          <li>The AI responds as the author based on their work and historical context</li>
                          <li>Remember this is a simulation based on available information</li>
                        </ol>
                      </div>
                    </div>
                  </div>
                  
                  {/* LLM Transparency */}
                  <div className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                    <div className="bg-blue-50 p-4">
                      <h3 className="text-lg font-medium text-blue-900 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        LLM Transparency
                      </h3>
                    </div>
                    <div className="p-4">
                      <p className="text-slate-700 text-sm mb-3">
                        SourceLens provides complete transparency about how AI is used in analysis. You can view 
                        the exact prompts sent to the AI models and their raw responses.
                      </p>
                      <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-700">
                        <strong className="text-blue-700">How to use it:</strong>
                        <ol className="list-decimal pl-5 mt-1 space-y-1">
                          <li>Look for "View LLM Exchange" buttons in the interface</li>
                          <li>Click to see the underlying prompts and responses</li>
                          <li>Toggle between "Prompt" and "Response" tabs</li>
                          <li>This helps understand how the AI produces its analysis</li>
                        </ol>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-indigo-50 rounded-xl p-5 border border-indigo-100 mt-6">
                  <h3 className="text-lg font-medium text-indigo-900 mb-2 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Pro Tips
                  </h3>
                  <ul className="space-y-2 mt-3">
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-indigo-500 mr-2 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-slate-700"><strong>Compare Model Outputs:</strong> Try the same analysis with different AI models to see how their interpretations differ.</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-indigo-500 mr-2 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
         

         <span className="text-slate-700"><strong>Be Specific with Chat Questions:</strong> When using the chat feature, specific questions get more precise answers than general ones.</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-indigo-500 mr-2 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-slate-700"><strong>Combine with Traditional Research:</strong> Use SourceLens alongside traditional research methods for the most robust analysis.</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-indigo-500 mr-2 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-slate-700"><strong>Save References:</strong> Scholarly references generated during analysis can be saved to your library for citation in your research.</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}
            
            {/* Research Library */}
            {activeSection === 5 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-serif text-indigo-900 mb-4 pb-2 border-b border-slate-200">Research Library</h2>
                
                <p className="text-slate-700">
                  SourceLens includes a powerful research library feature that helps you organize and save your work.
                  All data is stored locally in your browser for privacy and convenience.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5">
                  <div className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                    <div className="bg-indigo-50 p-4 border-b border-indigo-100">
                      <h3 className="text-lg font-medium text-indigo-900 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Sources
                      </h3>
                    </div>
                    <div className="p-4">
                      <p className="text-slate-700 text-sm">
                        Save your source documents with all associated metadata for future reference and analysis.
                      </p>
                      <ul className="list-disc pl-5 mt-2 space-y-1 text-sm text-slate-600">
                        <li>Text, PDF, and image sources</li>
                        <li>Complete with metadata</li>
                        <li>Categorize with tags</li>
                        <li>Quick access for re-analysis</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                    <div className="bg-indigo-50 p-4 border-b border-indigo-100">
                      <h3 className="text-lg font-medium text-indigo-900 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                        Analyses
                      </h3>
                    </div>
                    <div className="p-4">
                      <p className="text-slate-700 text-sm">
                        Store different types of analyses for your sources to build a comprehensive research archive.
                      </p>
                      <ul className="list-disc pl-5 mt-2 space-y-1 text-sm text-slate-600">
                        <li>Detailed analyses</li>
                        <li>Counter-narratives</li>
                        <li>Conversation transcripts</li>
                        <li>Information extractions</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                    <div className="bg-indigo-50 p-4 border-b border-indigo-100">
                      <h3 className="text-lg font-medium text-indigo-900 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        References
                      </h3>
                    </div>
                    <div className="p-4">
                      <p className="text-slate-700 text-sm">
                        Collect scholarly references related to your research for use in academic writing.
                      </p>
                      <ul className="list-disc pl-5 mt-2 space-y-1 text-sm text-slate-600">
                        <li>Properly formatted citations</li>
                        <li>Links to source materials</li>
                        <li>Categorized by type</li>
                        <li>Relevance indicators</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 mt-6">
                  <h3 className="text-lg font-medium text-slate-800 mb-3">Managing Your Library</h3>
                  
                  <div className="space-y-3 mt-4">
                    <div className="flex items-start">
                      <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center shrink-0 mr-3">
                        <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-800">Saving Items</h4>
                        <p className="text-sm text-slate-700 mt-1">
                          Look for "Save to Library" buttons throughout the interface to add items to your collection. 
                          Each item includes metadata to help you organize your research.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center shrink-0 mr-3">
                        <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-800">Organizing with Tags</h4>
                        <p className="text-sm text-slate-700 mt-1">
                          Add tags to your library items to create a custom organization system. Search and filter 
                          by these tags to quickly find relevant materials for your research.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center shrink-0 mr-3">
                        <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-800">Export Options</h4>
                        <p className="text-sm text-slate-700 mt-1">
                          Export your library data as JSON for backup or to transfer between devices. This ensures 
                          your research is preserved and portable.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Quick Reference */}
            {activeSection === 6 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-serif text-indigo-900 mb-4 pb-2 border-b border-slate-200">Quick Reference</h2>
                
                <div className="bg-slate-50/50 rounded-xl p-5 border border-slate-200">
                  <h3 className="text-lg font-medium text-slate-800 mb-3">Key Terms</h3>
                  
                  <div className="space-y-3">
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <h4 className="font-medium text-indigo-900">Primary Source</h4>
                      <p className="text-sm text-slate-700 mt-1">
                        An original document or artifact created during the time period being studied. Examples include letters, speeches, diaries, and contemporary accounts.
                      </p>
                    </div>
                    
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <h4 className="font-medium text-indigo-900">Counter-Narrative</h4>
                      <p className="text-sm text-slate-700 mt-1">
                        An alternative interpretation that challenges conventional or dominant readings of a text, often by highlighting overlooked perspectives or assumptions.
                      </p>
                    </div>
                    
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <h4 className="font-medium text-indigo-900">Analytical Perspective</h4>
                      <p className="text-sm text-slate-700 mt-1">
                        A theoretical framework or lens through which a source is analyzed, such as feminist theory, Marxist analysis, or postcolonial theory.
                      </p>
                    </div>
                    
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <h4 className="font-medium text-indigo-900">LLM (Large Language Model)</h4>
                      <p className="text-sm text-slate-700 mt-1">
                        AI systems trained on vast amounts of text data that can generate human-like text and analyze content. SourceLens uses LLMs to power its analysis features.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
                  <div className="bg-slate-50/50 rounded-xl p-5 border border-slate-200">
                    <h3 className="text-lg font-medium text-slate-800 mb-3">Common Issues</h3>
                    
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <svg className="w-5 h-5 text-red-500 mr-2 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <div>
                          <h4 className="font-medium text-slate-800">Text Truncation</h4>
                          <p className="text-xs text-slate-700 mt-1">
                            For very long documents, content may be truncated. Split large documents into smaller parts for best results.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <svg className="w-5 h-5 text-red-500 mr-2 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <div>
                          <h4 className="font-medium text-slate-800">OCR Quality</h4>
                          <p className="text-xs text-slate-700 mt-1">
                            PDF and image OCR may be imperfect for handwritten or low-quality scans. Manual cleanup may be necessary.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <svg className="w-5 h-5 text-red-500 mr-2 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <div>
                          <h4 className="font-medium text-slate-800">AI Hallucinations</h4>
                          <p className="text-xs text-slate-700 mt-1">
                            LLMs can sometimes generate plausible-sounding but incorrect information. Always verify factual claims.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-slate-50/50 rounded-xl p-5 border border-slate-200">
                    <h3 className="text-lg font-medium text-slate-800 mb-3">Keyboard Shortcuts</h3>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-700">Navigate to Analysis</span>
                        <span className="text-xs bg-slate-200 px-2 py-1 rounded font-mono">Alt + 1</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-700">Navigate to Counter-Narrative</span>
                        <span className="text-xs bg-slate-200 px-2 py-1 rounded font-mono">Alt + 2</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-700">Navigate to Roleplay</span>
                        <span className="text-xs bg-slate-200 px-2 py-1 rounded font-mono">Alt + 3</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-700">Navigate to References</span>
                        <span className="text-xs bg-slate-200 px-2 py-1 rounded font-mono">Alt + 4</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-700">Toggle Dark Mode</span>
                        <span className="text-xs bg-slate-200 px-2 py-1 rounded font-mono">Alt + D</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-700">Focus on Chat Input</span>
                        <span className="text-xs bg-slate-200 px-2 py-1 rounded font-mono">Alt + C</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-indigo-50 rounded-xl p-5 border border-indigo-100 mt-5">
                  <h3 className="text-lg font-medium text-indigo-900 mb-3 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                    </svg>
                    Research Ethics & Best Practices
                  </h3>
                  
                  <ul className="space-y-2 mt-3">
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-indigo-500 mr-2 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-slate-700"><strong>Verify AI-Generated Insights:</strong> Always cross-check information against reliable scholarly sources.</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-indigo-500 mr-2 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-slate-700"><strong>Acknowledge AI Assistance:</strong> When using insights from SourceLens in your research, acknowledge the tool's role.</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-indigo-500 mr-2 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-slate-700"><strong>Respect Historical Context:</strong> Remember that AI may not fully capture the nuances of historical periods and cultures.</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-indigo-500 mr-2 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-slate-700"><strong>Maintain Critical Thinking:</strong> AI tools enhance research but don't replace scholarly judgment and expertise.</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-between items-center">
          <button 
            onClick={handleClose}
            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-300 transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleClose}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors text-sm font-medium"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper function to get icon based on name
function getIcon(iconName: string) {
  switch (iconName) {
    case 'info-circle':
      return (
        <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case 'rocket':
      return (
        <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      );
    case 'magnifying-glass':
      return (
        <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      );
    case 'eye':
      return (
        <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      );
    case 'beaker':
      return (
        <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      );
    case 'book':
      return (
        <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      );
    case 'lightbulb':
      return (
        <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      );
    default:
      return (
        <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
  }
}


