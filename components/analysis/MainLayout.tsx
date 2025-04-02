// components/analysis/MainLayout.tsx
// Main three-column layout for SourceLens analysis interface with improved header,
// logo + modal about the source painting, chat functionality, and better gradient design
// Updated to support references panel, roleplay, and counter-narrative modes

'use client';

import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import SourceDisplay from './SourceDisplay';
import AnalysisPanel from './AnalysisPanel';
import UserInputPanel from './UserInputPanel';
import HamburgerMenu from '../ui/HamburgerMenu';
import LLMTransparency from '../ui/LLMTransparency';
import MetadataModal from '../upload/MetadataModal';
import Image from 'next/image';
import ChatInput from '../chat/ChatInput';
import ConversationDisplay from '../chat/ConversationDisplay';
import RoleplayChat from '../roleplay/RoleplayChat';
import ReferencesDisplay from '../references/ReferencesDisplay';
import ReferencesExplanation from '../references/ReferencesExplanation';
import StrategyDeck from '../ui/StrategyDeck';
import Link from 'next/link';
import ChatContainer from '../chat/ChatContainer';
import SaveToLibraryButton from '../library/SaveToLibraryButton';
import ExtractInfoPanel from '../extract/ExtractInfoPanel';
import ExtractInfoExplanation from '../extract/ExtractInfoExplanation';
import ProgressIndicator from '../ui/ProgressIndicator';
import ExtractPanelToggle from '@/components/extract/ExtractPanelToggle';
import DocumentActions from '../ui/DocumentActions';
import InfoButton from '../ui/InfoButton';
import DocumentPortrait from '../ui/DocumentPortrait';
import HighlightPanel from '../highlight/HighlightPanel';
import HighlightExplanation from '../highlight/HighlightExplanation';
import SummaryButton from '../ui/SummaryButton';
import SummarizeText from '../text/SummarizeText';
import FullAnalysisModal from './FullAnalysisModal';
import AboutModal from '../ui/AboutModal';
import DraftContext from '../drafts/DraftContext';
import SlimFooter from '@/components/ui/SlimFooter';


export default function MainLayout() {
  const { 
    metadata,
    rawPrompt,
    rawResponse,
    isLoading,
    showMetadataModal,
    activePanel,
    roleplayMode,
    conversation,
    detailedAnalysis,
    sourceContent,
    sourceType,
    processingStep,
    processingData,
    llmModel, 
    perspective,
    sourceFile,
    setActivePanel,
  } = useAppStore();

  const [animateHeader, setAnimateHeader] = useState(false);
  const [showAboutLogoModal, setShowAboutLogoModal] = useState(false);
  const [chatExpanded, setChatExpanded] = useState(false);
  const [portraitError, setPortraitError] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState(18);
    const [isFullAnalysisModalOpen, setIsFullAnalysisModalOpen] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);

  const toggleDarkMode = () => {
  setDarkMode(!darkMode);
};
  
  // Add animation effect to header on load
  useEffect(() => {
    setAnimateHeader(true);
  }, []);

  // helper functions




const handleFontSizeChange = (newSize: number) => {
  setFontSize(newSize);
};

const extractYear = (dateStr: string): string => {
  // Try to match a 4-digit year
  const yearMatch = dateStr.match(/\b\d{4}\b/);
  if (yearMatch) {
    return yearMatch[0];
  }
  
  // If no 4-digit year found, just use the first number sequence
  const numMatch = dateStr.match(/\d+/);
  return numMatch ? numMatch[0] : dateStr;
};

const [showSummary, setShowSummary] = useState(false);



  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header with gradient background and sourcelensbar.jpg fade */}
<header className="relative py-2 overflow-hidden transition-all duration-700 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-lg">
  {/* Background image on right side */}
  <div className="absolute top-0 right-0 h-full w-3/4 z-0">
    <Image 
      src="/sourcelensbar.jpg" 
      alt="SourceLens Header" 
      fill 
      priority
      className="object-cover opacity-80" 
    />
  <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-800/90 to-indigo-900/10"></div>
  </div>

  
  
   {/* Header content container */}
  <div className="relative z-20 max-w-10xl mx-auto px-4 py-2 sm:px-6 lg:px-8">
    <div className="flex justify-between items-center">
      {/* Logo and title section */}
      <div className="flex items-center">
        <button 
          onClick={() => setShowAboutLogoModal(true)}
          className="transition-transform ml-6 hover:scale-110 focus:outline-none rounded-full shadow-lg shadow-indigo-500/30"
        >
          <Image 
            src="/sourcelenslogo.png" 
            alt="SourceLens Logo" 
            width={50} 
            height={50} 
            className="rounded-full border border-indigo-200/30" 
          />
        </button>
        
        <Link 
          href="/"
          className="group inline-block relative overflow-hidden p-2 ml-10"
        >
          <h1 className="text-2xl font-bold shadow-xl shadow-indigo-800/10 text-white">
            SourceLens
            <span className="absolute bottom-0 left-1 w-full h-0.5 bg-gradient-to-r from-indigo-400 via-white to-indigo-400 transform scale-x-0 origin-left transition-transform duration-300 ease-out group-hover:scale-x-90"></span>
          </h1>
        </Link>
      </div>
 

      {/* Navigation Links */}
      <div className="hidden md:flex items-center gap-4">
        {metadata?.date && (
          <a 
            href={`https://en.wikipedia.org/wiki/${extractYear(metadata.date)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full transition-colors duration-200 group"
          >
            {metadata.date}
            <span className="block max-w-0 group-hover:max-w-full transition-all duration-300 h-0.5 bg-indigo-400/60"></span>
          </a>
        )}
        
        {metadata?.date && metadata?.author && (
          <span className="text-white/40">•</span>
        )}
        
        {metadata?.author && (
          <a 
            href={`https://en.wikipedia.org/wiki/Special:Search?go=Go&search=${encodeURIComponent(metadata.author)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full transition-colors duration-200 group"
          >
            {metadata.author}
            <span className="block max-w-0 group-hover:max-w-full transition-all duration-300 h-0.5 bg-indigo-400/60"></span>
          </a>
        )}
        
        <StrategyDeck className="ml-2" />
      </div>
      
      {/* Right side controls */}
     <nav className="hidden md:flex items-center space-x-3">
        <Link 
          href="/" 
          className="px-3 py-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-md transition-colors text-sm font-medium flex items-center"
        >
          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Home
        </Link>
        
        <Link 
          href="/library" 
          className="px-3 py-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-md transition-colors text-sm font-medium flex items-center"
        >
          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
          </svg>
          Library
        </Link>
        
        <button 
          onClick={() => setShowAboutModal(true)}
          className="px-3 py-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-md transition-colors text-sm font-medium flex items-center"
        >
          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          About
        </button>
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm py-1.5 px-3 rounded-full">
            <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
            <span className="text-xs font-medium text-white/90">Processing...</span>
          </div>
        )}
      </nav>
        
        {/* Mobile menu button */}

        <HamburgerMenu />
    
    </div>
  </div>

  
  {/* Mobile metadata display */}
  <div className="md:hidden px-4 py-2 flex flex-wrap items-center gap-2 bg-indigo-800/80 border-t border-indigo-700/50">
    {metadata?.date && (
      <a 
        href={`https://en.wikipedia.org/wiki/${extractYear(metadata.date)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs font-medium bg-white/20 hover:bg-white/30 px-2 py-0.5 rounded-full backdrop-blur-sm"
      >
        {metadata.date}
      </a>
    )}
    
    {metadata?.author && (
      <a 
        href={`https://en.wikipedia.org/wiki/Special:Search?go=Go&search=${encodeURIComponent(metadata.author)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs font-medium bg-white/20 hover:bg-white/30 px-2 py-0.5 rounded-full backdrop-blur-sm"
      >
        {metadata.author}
      </a>
    )}
    
    <StrategyDeck className="scale-90" />
  </div>
  
  {/* Decorative highlight line below header */}

</header>
  <div className="h-1 bg-gradient-to-r from-amber-400 via-purple-400 to-indigo-900 opacity-100"></div>

      {/* Main content with three-panel layout */}
      <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
        {/* Left Panel - Tools */}
        <div className={`w-full ${roleplayMode ? 'md:w-1/4' : 'md:w-1/4'} overflow-y-auto bg-gradient-to-b from-slate-100 to-slate-50 border-b md:border-b-0 md:border-r border-slate-200`}>
          {/* Modular boxes in left panel */}
          <div className="p-3 grid grid-cols-1 gap-4">

            <div className="shadow-sm rounded-lg ">

<DocumentPortrait
  sourceFile={sourceFile}
  sourceType={sourceType}
  metadata={metadata}
  roleplayMode={roleplayMode}
  // Pass the error states:
  portraitError={portraitError}
  setPortraitError={setPortraitError}
/>

            </div>
            
          {/* Analysis Tools Box */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
              
              <UserInputPanel />
            </div>

            {/* LLM Transparency Box */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
              <h2 className="text-lg font-medium text-indigo-900 flex items-center mb-4">
                <svg className="w-5 h-5 mr-2 text-indigo-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                LLM Info
              </h2>
              <LLMTransparency rawPrompt={rawPrompt} rawResponse={rawResponse} />
            </div>
          </div>
        </div>
        

{/* Center Panel - Content changes based on mode */}
<div className={`w-full ${
  roleplayMode 
    ? 'md:w-3/4' // Wider when in roleplay mode
    : activePanel === 'references'
      ? 'md:w-2/3' // Wider when references is active
      : (detailedAnalysis && activePanel === 'detailed-analysis') || activePanel === 'counter'
        ? 'md:w-1/3' // Narrower when detailed analysis is shown or counter-narrative is active
        : 'md:w-3/5' // Normal width otherwise
  } transition-all duration-300 overflow-y-auto bg-white  `}>

  {activePanel === 'extract-info' ? (
    <div className="p-0">
      <div className="bg-white rounded-lg border border-slate-200 p-4 mb-4">
        <div className="flex justify-between items-center mb-4">
         
        </div>
        <ExtractInfoPanel />
      </div>
    </div>
  ) : roleplayMode ? (
    // Show Roleplay Chat when in roleplay mode
    <div className="p-5 h-full">
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 mb-4 h-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-amber-900 flex items-center">
            <svg className="w-5 h-5 mr-2 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
            </svg>
            Author Roleplay
          </h2>
          
          {/* Loading indicator - moved here and positioned to right */}
          {isLoading && (
            <div className="flex items-center text-amber-600 animate-pulse">
              <span className="mr-2 relative flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
              </span>
              <span className="text-md font-medium">Thinking...</span>
            </div>
          )}
        </div>
    
        <div className="h-[calc(100%-3rem)]">
          <RoleplayChat />
        </div>
      </div>
    </div>
  ) : activePanel === 'references' ? (
    // Show References panel when references is active
    <div className="p-4">
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 mb-4">
        <h2 className="text-lg font-medium text-indigo-900 flex items-center mb-4">
          <svg className="w-5 h-5 mr-2 text-indigo-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          Suggested References
        </h2>
        <ReferencesDisplay />
      </div>
    </div>
  ) : (
    // Show normal source view when not in roleplay mode or references mode
    <div className="p-4">
      
      {/* Chat Box */}
      <div className="bg-white rounded-xl p-0 mb-3">
        <div className="flex justify-between items-center mb-0">
          <h2 className="text-lg font-medium text-indigo-900 flex items-center">
          
          </h2>
          
          <div className="text-sm">
            {isLoading && (
              <span className="text-indigo-600 flex items-center">
                <svg className="animate-spin h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            )}
          </div>
        </div>
        
        {/* Using the ChatContainer component */}
        <ChatContainer />
      </div>
      
      {/* Source Box */}
      <div className="bg-slate-100/20  rounded-lg   p-4 mb-2">
       
<div className="flex justify-between  items-center mb-2">
  <h2 className="text-xl font-semibold  ml-2 rounded-lg  text-indigo-900 flex items-center">
   
    Primary Source

  </h2>
  
  <div className="flex items-center mr-2   -mt-2 space-x-5">
   
    {/* Document Actions Button */}
    <div className=" rounded-lg border-1 border-slate-200">
   <DocumentActions 
  darkMode={darkMode} 
  toggleDarkMode={toggleDarkMode}
  onFontSizeChange={handleFontSizeChange}
  currentFontSize={fontSize}
  onSummarizeComplete={() => {
    // This will be called when summarization is completed
    console.log("Summary completed");
  }}
/>
 </div>

  </div>
</div>
        <div className="bg-slate-200/70 p-1 rounded-lg border-1 border-slate-100">
         <SourceDisplay 
  darkMode={darkMode}
  toggleDarkMode={toggleDarkMode}
  fontSize={fontSize}
/>
        </div>
      </div>
      
      {/* Source metadata with expanded fields */}
      <div className="bg-white rounded-lg  border-slate-200 p-4">
        <h2 className="text-xl font-medium text-indigo-900 flex items-center mb-1">
          <svg className="w-5 ml-2 h-5 mr-2 text-indigo-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
          </svg>
          Source Details
        </h2>
        <div className="text-sm p-2 space-y-2text-slate-700">
          {/* Basic metadata */}
          <div className="grid border rounded-lg bg-slate-100/30  shadow-inner border-slate-200 p-3 grid-cols-1 md:grid-cols-2 gap-x-4 ">
            {metadata?.date && (
              <div className="flex">
                <span className="font-medium w-24">Date:</span>
                <span>{metadata.date}</span>
              </div>
            )}
            {metadata?.author && (
              <div className="flex">
                <span className="font-medium w-24">Author:</span>
                <span>{metadata.author}</span>
              </div>
            )}
            
            {/* New metadata fields - only shown if present */}
            {metadata?.placeOfPublication && (
              <div className="flex">
                <span className="font-medium w-24">Place:</span>
                <span>{metadata.placeOfPublication}</span>
              </div>
            )}
            {metadata?.genre && (
              <div className="flex">
                <span className="font-medium w-24">Genre:</span>
                <span>{metadata.genre}</span>
              </div>
            )}
            {metadata?.documentType && (
              <div className="flex">
                <span className="font-medium w-24">Type:</span>
                <span>{metadata.documentType}</span>
              </div>
            )}
            {metadata?.academicSubfield && (
              <div className="flex">
                <span className="font-medium w-24">Field:</span>
                <span>{metadata.academicSubfield}</span>
              </div>
            )}
          </div>
          
          {/* Tags displayed as pills if present */}
          {metadata?.tags && metadata.tags.length > 0 && (
            <div className="mt-3">
              <span className="font-medium  block mb-2">Tags:</span>
              <div className="flex flex-wrap gap-3">
                {Array.isArray(metadata.tags) 
                  ? metadata.tags.map((tag, index) => (
                    <span key={index} className="inline-block font-mono hover:shadow shadow-indigo-400/80 px-2 py-1 text-xs bg-indigo-100/40 text-slate-700 rounded">
                      {tag}
                    </span>
                  ))
                  : typeof metadata.tags === 'string' 
                    ? metadata.tags.split(',').map((tag, index) => (
                      <span key={index} className="inline-block  px-2 py-1 text-xs bg-slate-100 text-slate-700 rounded">
                        {tag.trim()}
                      </span>
                    ))
                    : null
                }
              </div>
            </div>
          )}
          
          {/* Full citation if available */}
          {metadata?.fullCitation && (
            <div className="flex flex-col mt-3">
              <span className="font-medium mb-1">Citation:</span>
              <p className="bg-slate-50 p-1 rounded text-slate-600 italic">{metadata.fullCitation}</p>
            </div>
          )}
          
          {/* Research goals */}
          {metadata?.researchGoals && (
            <div className="flex flex-col mt-3">
              <span className="font-medium mb-1">Research Goals:</span>
              <p className="bg-slate-50 p-1 rounded text-slate-600">{metadata.researchGoals}</p>
            </div>
          )}
          
          {/* Additional context */}
          {metadata?.additionalInfo && (
            <div className="flex flex-col mt-3">
              <span className="font-medium mb-1">Additional Context:</span>
              <p className="bg-slate-50 p-1 rounded text-slate-600">{metadata.additionalInfo}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )}

</div>


        
       {/* Right Panel - Analysis Results */}
<div className={`w-full ${
    activePanel === 'counter'
      ? 'md:w-2/3' // Much wider for counter-narrative
      : activePanel === 'extract-info'
        ? 'md:w-1/5' // Very narrow for extract-info
          : activePanel === 'roleplay'
        ? 'md:w-1/6' // Very narrow for roleplay
      : detailedAnalysis && activePanel === 'detailed-analysis'
        ? 'md:w-3/5' // Wider when detailed analysis is shown
        : 'md:w-1/3' // Normal width otherwise
    } transition-all duration-300 overflow-y-auto bg-gradient-to-b from-slate-100 to-slate-50 border-t md:border-t-0 md:border-l border-slate-200`}>
  <div className="p-4">


    {/* Analysis Box */}
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-3">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-indigo-900 flex items-center">
          <svg className="w-5 h-5 mr-2 text-indigo-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={
              activePanel === 'counter' 
                ? "M8 7h12m0 0l-4-4m4 4l-4 4m-4 6H4m0 0l4 4m-4-4l4-4" 
                : activePanel === 'roleplay'
                ? "M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
                : activePanel === 'references'
                ? "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                : "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            } />
          </svg>
        {activePanel === 'counter' 
          ? "Counter-Narratives" 
          : activePanel === 'roleplay' 
          ? "Analysis" 
          : activePanel === 'references'
          ? "References Information"
          : activePanel === 'highlight'
          ? "Text Highlighting"
          : "Analysis"}

        </h2>
        
       {/* Right side icons */}
                 <div className="flex items-center space-x-2"> {/* Container for right icons */}
                    {/* Button to open Full Analysis Modal */}
                    {activePanel === 'detailed-analysis' && detailedAnalysis && (
                      <button
                        onClick={() => setIsFullAnalysisModalOpen(true)}
                        title="View Full Analysis in Popup"
                        className="p-1.5 text-indigo-500 hover:text-indigo-700 hover:bg-indigo-100 rounded-full transition-colors"
                        aria-label="Open full analysis"
                      >
                         {/* Use External Link Icon */}
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                           <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                         </svg>
                      </button>
                    )}

                    {/* InfoButton */}
                    <InfoButton
                      sourceLength={sourceContent?.length || 0}
                      modelId={llmModel || 'Unknown model'}
                      provider={llmModel?.includes('gpt') ? 'OpenAI' : llmModel?.includes('claude') ? 'Anthropic' : 'Google'}
                      truncated={sourceContent ? sourceContent.length > 130000 : undefined} // Example threshold
                      wordCount={Math.round((sourceContent?.length || 0) / 6.5)} // Example word count calc
                      truncatedLength={processingData?.truncatedLength}
                      processingData={processingData || {}}
                      additionalInfo={{
                        perspective: perspective || 'Default',
                        activePanel: activePanel
                      }}
                    />
                 </div>
              </div>

   <div className="bg-slate-50 p-3 rounded-md border border-slate-100">
                   {/* AnalysisPanel or other content */}
                   {activePanel === 'references'
                      ? <ReferencesExplanation />
                      : <AnalysisPanel /> // This will render the updated detailed analysis
                   }
                </div>
              </div>

{/* Feature Button Grid - Responsive, consistently styled skinny action buttons */}
<div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-6">
  {/* Highlight Text Button */}
  <button
    onClick={() => setActivePanel('highlight')}
    className={`group flex items-center justify-center h-9 py-3 px-2 rounded-lg border transition-all duration-200 shadow-sm
      ${activePanel === 'highlight'
        ? 'bg-amber-50 text-amber-800 border-amber-300 shadow-amber-100/50'
        : 'bg-white text-slate-700 border-slate-200 hover:bg-amber-50/50 hover:text-amber-700 hover:border-amber-200 hover:shadow'
      }`}
  >
    <svg className={`w-4 h-4 mr-2 transition-colors duration-200 ${
      activePanel === 'highlight' ? 'text-amber-600' : 'text-slate-500 group-hover:text-amber-500'
    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
    <span className="text-sm font-medium">Highlight</span>
  </button>
  
  {/* View Summary Button */}
  <button
    onClick={() => setShowSummary(true)}
    className="group flex items-center justify-center h-9 px-1 py-3 rounded-lg bg-white border border-slate-200 text-slate-700 shadow-sm transition-all duration-200 hover:bg-indigo-50/50 hover:text-indigo-700 hover:border-indigo-200 hover:shadow"
  >
    <svg className="w-4 h-4 mr-2 text-slate-500 transition-colors duration-200 group-hover:text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
    <span className="text-sm font-medium">Summary</span>
  </button>
  
  {/* Add Research Context Button (using the updated component) */}
  <DraftContext 
    className="group flex items-center justify-center h-9 px-2 py-3 rounded-lg bg-white border border-slate-200 text-slate-700 shadow-sm transition-all duration-200 hover:bg-emerald-50/50 hover:text-emerald-700 hover:border-emerald-200 hover:shadow"
  >
    <svg className="w-4 h-4 mr-2 text-slate-500 transition-colors duration-200 group-hover:text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
    <span className="text-sm font-medium">Add Draft</span>
  </DraftContext>

</div>



{/* Modals */}
{showSummary && (
  <SummarizeText 
    onClose={() => setShowSummary(false)} 
  />
)}


          </div>
        </div>

      </div>

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
                className="relative inline transition-colors font-semibold text-amber-700 hover:text-amber-500 hover:font-medium cursor-help"
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

      {/* Metadata Modal */}
      {showMetadataModal && <MetadataModal />}

<div className="mt-3">
  <SlimFooter />
</div>

  {/* Render the new FullAnalysisModal */}
      {isFullAnalysisModalOpen && detailedAnalysis && (
        <FullAnalysisModal
          isOpen={isFullAnalysisModalOpen}
          onClose={() => setIsFullAnalysisModalOpen(false)}
          analysisContent={detailedAnalysis}
          metadata={metadata}
          perspective={perspective}
          llmModel={llmModel}
        />
      )}

        <AboutModal 
      isOpen={showAboutModal} 
      onClose={() => setShowAboutModal(false)} 
    />
    

    </div>

  );
}