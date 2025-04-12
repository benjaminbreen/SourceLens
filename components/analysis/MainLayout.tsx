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
import TranslationPanel from '../translate/TranslationPanel';
import SourceDetailsPanel from '../analysis/SourceDetailsPanel';
import AccountButton from '@/components/auth/AccountButton';
import AuthStatus from '@/components/auth/AuthStatus';
import { Lora } from 'next/font/google';


export default function MainLayout() {
  const { 
    metadata,
    rawPrompt,
    rawResponse,
    isLoading,
    showMetadataModal,
    setShowMetadataModal,
    setMetadata,
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
<header className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-lg overflow-hidden">
  {/* Background image and gradient overlay */}
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


  <div className="relative z-20 max-w-8xl mx-auto px-4 sm:px-6 lg:px-0 py-4 gap-2">

    <div className="px-6 flex items-center justify-between gap-4 flex-wrap w-full">
  {/* Far left: Hamburger menu */}
  <div className="flex items-center gap-3">
    <div className="pl-2 px-12">
      <HamburgerMenu />
    </div>

    {/* Logo and title */}


    <div className="flex px-0 flex-col justify-center">
      <Link href="/" className="group inline-block relative overflow-hidden">
        <h1 className="font-serif text-2xl ml-1 font-bold text-white transition-all duration-300">
          SourceLens
          <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-indigo-400 via-white to-indigo-400 transform scale-x-0 origin-left transition-transform duration-300 ease-out group-hover:scale-x-42"></span>
        </h1>
      </Link>

      {/* Metadata links */}
      <div className="flex flex-wrap gap-2 items-center mt-2 text-xs font-medium text-white/80">
        {metadata?.date && (
          <a
            href={`https://en.wikipedia.org/wiki/${extractYear(metadata.date)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white/10 hover:bg-white/20 px-3 py-0.5 rounded-full transition-colors group"
          >
            {metadata.date}
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
            className="bg-white/10 hover:bg-white/20 px-3 py-0.5 rounded-full transition-colors group"
          >
            {metadata.author}
          </a>
        )}
      </div>


    </div>

  </div>


  {/* Right side: nav, strategy, account, loading */}

   <div className="flex px-0 ml-38 opacity-50">
     
        </div>

  <div className="flex items-center gap-3 ml-auto">
    {isLoading && (
      <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm py-1.5 px-3 rounded-full shadow-sm">
        <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
        <span className="text-xs font-medium text-white/90">Processing...</span>
      </div>
    )}
    
    <nav className="hidden md:flex items-center space-x-2 text-sm font-medium">
      <Link
        href="/"
        className="px-3 py-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-md flex items-center transition-colors"
      >
        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        Home
      </Link>

      <Link
        href="/library"
        className="px-3 py-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-md flex items-center transition-colors"
      >
        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
        </svg>
        Library
      </Link>

      <button
        onClick={() => setShowAboutModal(true)}
        className="px-3 py-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-md flex items-center transition-colors"
      >
        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        About
      </button>
    </nav>
<div className="flex px-0 flex-col justify-center ml-3">
    <StrategyDeck />
</div>

<div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm py-1.5 px-3 rounded-full shadow-sm justify-center ml-4">
    <AccountButton />
</div>





      </div>

    </div>
  
  </div>
</header>

  <div className="h-1 bg-gradient-to-r from-amber-400 via-purple-400 to-indigo-900 opacity-100"></div>

      {/* Main content with three-panel layout */}
      <div className="flex flex-1 gap-1 overflow-hidden flex-col p-1 md:flex-row">
        {/* Left Panel - Tools */}
        <div className={`w-full ${roleplayMode ? 'md:w-1/3' : 'md:w-1/4'} overflow-y-auto bg-gradient-to-b px-2 from-slate-50 to-white border-b md:border-b-0 md:border-r border-slate-200`}>
          {/* Modular boxes in left panel */}
          <div className="p-3 grid grid-cols-1 gap-4">

            <div className="shadow-sm rounded-xl ">

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
            <div className="rounded-lg z-1 p-5">
              
              <UserInputPanel />
            </div>

            {/* LLM Transparency Box */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 z-1 p-4">
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
  activePanel === 'roleplay'
    ? 'md:w-full' // Full width when in roleplay mode
    : activePanel === 'references'
      ? 'md:w-2/3' // Wider when references is active
      : (detailedAnalysis && activePanel === 'detailed-analysis') || activePanel === 'counter'
        ? 'md:w-1/3' // Narrower when detailed analysis is shown or counter-narrative is active
        : 'md:w-3/5' // Normal width otherwise
  } transition-all duration-300 overflow-y-auto bg-white`}>

  {activePanel === 'extract-info' ? (
    <div className="p-0">
      <div className="bg-white rounded-lg border border-slate-200 p-4 mb-4">
        <div className="flex justify-between items-center mb-4">
         
        </div>
        <ExtractInfoPanel />
      </div>
    </div>
  ) : activePanel === 'translate' ? (
    <div className="p-0">
      <div className="bg-white rounded-lg border border-slate-200 p-4 mb-4">
        <div className="flex justify-between items-center mb-4">
          {/* Content added by TranslationPanel component */}
        </div>
        <TranslationPanel />
      </div>
    </div>
  ) : activePanel === 'roleplay' ? (
    // Show Roleplay Chat directly with full width
    <RoleplayChat />
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
      <div className="bg-white rounded-xl p-0 px-5 mb-3">
        <div className="flex justify-between items-center mb-0">
          <h2 className="text-lg font-medium text-indigo-900 flex items-center">
          
          </h2>
        </div>
        
        {/* Using the ChatContainer component */}
        <ChatContainer />
      </div>
      
      {/* Source Box */}
      <div className="bg-slate-100/20 rounded-lg p-4 mb-2">
       
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
      
       {/* Source metadata box */}
                <div className={`rounded-xl overflow-hidden ${darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white '}`}>
                 
            
                  
            <SourceDetailsPanel 
  metadata={metadata} 
  darkMode={darkMode} 
/>    
          
           
           
                    
          
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
        ? 'md:w-0/1' // Very narrow for roleplay
      : detailedAnalysis && activePanel === 'detailed-analysis'
        ? 'md:w-3/5' // Wider when detailed analysis is shown
        : 'md:w-1/3' // Normal width otherwise
    } transition-all duration-300 overflow-y-auto bg-white border-t md:border-t-0 md:border-l border-slate-200`}>
  <div className="p-4">



     {/* Analysis Box */}
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-3">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-medium text-indigo-900 flex items-center">
         
        {activePanel === 'counter' 
          ? "Counter-Narratives" 
          : activePanel === 'references'
          ? "References Information"
          : activePanel === 'highlight'
          ? "Text Highlighting"
          : ""}

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
<div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4">
  {/* Highlight Text Button */}
  <button
    onClick={() => setActivePanel('highlight')}
    className={`group flex items-center justify-center h-10 rounded-lg border transition-all duration-200 ${
      activePanel === 'highlight'
        ? 'bg-amber-50 text-amber-800 border-amber-300 shadow-sm'
        : 'bg-white text-slate-700 border-slate-200 hover:bg-amber-50/50 hover:text-amber-700 hover:border-amber-200 hover:shadow-sm'
      }`}
  >
    <svg className={`w-4 h-4 mr-1.5 transition-colors duration-200 ${
      activePanel === 'highlight' ? 'text-amber-600' : 'text-slate-500 group-hover:text-amber-500'
    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
    <span className="text-sm font-medium truncate">Highlight</span>
  </button>
  
  {/* View Summary Button */}
  <button
    onClick={() => setShowSummary(true)}
    className="group flex items-center justify-center h-10 rounded-lg bg-white border border-slate-200 text-slate-700 transition-all duration-200 hover:bg-indigo-50/50 hover:text-indigo-700 hover:border-indigo-200 hover:shadow-sm"
  >
    <svg className="w-4 h-4 mr-1.5 text-slate-500 transition-colors duration-200 group-hover:text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
    <span className="text-sm font-medium truncate">Summary</span>
  </button>
  
  {/* Add Research Context Button (using the updated component) */}
  <DraftContext 
    className="group flex items-center justify-center h-10 rounded-lg bg-white border border-slate-200 text-slate-700 transition-all duration-200 hover:bg-emerald-50/50 hover:text-emerald-700 hover:border-emerald-200 hover:shadow-sm"
  >
    <svg className="w-4 h-4 mr-1.5 text-slate-500 transition-colors duration-200 group-hover:text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
    <span className="text-sm font-medium truncate">Draft</span>
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

     

<div className="mt-6">
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
   
    {showMetadataModal && (
  <MetadataModal 
    isOpen={showMetadataModal}
    onClose={() => setShowMetadataModal(false)}
    initialMetadata={metadata || {
      date: '',
      author: '',
      researchGoals: ''
    }}
    onSave={(updatedMetadata) => {
      setMetadata(updatedMetadata);
      // If you need to do something else after saving, add it here
    }}
  />
)}

    </div>

  );
}