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

export default function MainLayout() {
  const { 
    metadata,
    rawPrompt,
    rawResponse,
    isLoading,
    showMetadataModal,
    activePanel,
    roleplayMode,
    conversation
  } = useAppStore();

  const [animateHeader, setAnimateHeader] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [chatExpanded, setChatExpanded] = useState(false);
  const [portraitError, setPortraitError] = useState(false);
  
  // Add animation effect to header on load
  useEffect(() => {
    setAnimateHeader(true);
  }, []);

 // Determine what to show in portrait box based on mode
  // This code should be integrated into MainLayout.tsx, replacing the existing renderPortrait function
  // Determine what to show in portrait box based on mode
  const renderPortrait = () => {
    // Calculate century based on date, regardless of mode
    const date = metadata?.date || '';
    const year = parseInt(date.match(/\d+/)?.[0] || '2000', 10);
    const century = Math.floor(year / 100) + 1;
    
    // Get color scheme based on century
    const getColorScheme = () => {
      switch (century) {
        case 1:
        case 2:
        case 3:
        case 4:
        case 5: // Ancient (1st-5th century)
          return {
            gradient: "bg-gradient-to-br from-white to-violet-100",
            ring: "ring-violet-200",
            text: "text-violet-700"
          };
        case 6:
        case 7:
        case 8:
        case 9:
        case 10: // Medieval (6th-10th century)
          return {
            gradient: "bg-gradient-to-br from-white to-indigo-100",
            ring: "ring-indigo-200",
            text: "text-indigo-700"
          };
        case 11:
        case 12:
        case 13: // High Medieval (11th-13th century)
          return {
            gradient: "bg-gradient-to-br from-white to-blue-100",
            ring: "ring-blue-200",
            text: "text-blue-700"
          };
        case 14:
        case 15: // Late Medieval/Early Renaissance (14th-15th century)
          return {
            gradient: "bg-gradient-to-br from-white to-sky-100",
            ring: "ring-sky-200",
            text: "text-sky-700"
          };
        case 16: // Renaissance (16th century)
          return {
            gradient: "bg-gradient-to-br from-white to-cyan-100",
            ring: "ring-cyan-200",
            text: "text-cyan-700"
          };
        case 17: // Early Modern (17th century)
          return {
            gradient: "bg-gradient-to-br from-white to-teal-100",
            ring: "ring-teal-200",
            text: "text-teal-700"
          };
        case 18: // Enlightenment (18th century)
          return {
            gradient: "bg-gradient-to-br from-white to-emerald-100",
            ring: "ring-emerald-200",
            text: "text-emerald-700"
          };
        case 19: // Industrial Revolution (19th century)
          return {
            gradient: "bg-gradient-to-br from-white to-amber-100",
            ring: "ring-amber-200",
            text: "text-amber-700"
          };
        case 20: // Modern (20th century)
          return {
            gradient: "bg-gradient-to-br from-white to-orange-100",
            ring: "ring-orange-200",
            text: "text-orange-700"
          };
        default: // Contemporary (21st century onward)
          return {
            gradient: "bg-gradient-to-br from-white to-rose-100",
            ring: "ring-rose-200",
            text: "text-rose-700"
          };
      }
    };
    
    const colorScheme = getColorScheme();
    
    if (roleplayMode && metadata?.author) {
      // Roleplay mode with author portrait
      const authorNameForFile = metadata.author.toLowerCase().replace(/\s+/g, '');
      const portraitPath = `/portraits/${authorNameForFile}.jpg`;
      
      return (
        <div className={`flex flex-col items-center p-5 rounded-xl ${colorScheme.gradient}`}>
          {/* For portrait or emoji */}
          <div className={`w-24 h-24 rounded-full bg-white flex items-center justify-center text-5xl mb-2 overflow-hidden relative shadow-sm border border-slate-100 ${colorScheme.ring}`}>
            {!portraitError ? (
              <div className="w-full h-full relative">
                <Image 
                  src={portraitPath} 
                  alt={metadata.author} 
                  fill 
                  className="object-cover"
                  onError={() => setPortraitError(true)}
                />
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                {metadata.authorEmoji || '👤'}
              </div>
            )}
          </div>
          <h3 className={`font-medium text-center ${colorScheme.text}`}>{metadata.author}</h3>
          
          {/* Show character status instead of birth/death years */}
          {metadata.characterStatus ? (
            <p className="text-sm text-center text-slate-500 italic mt-1 max-w-[400px]">
              {metadata.characterStatus}
            </p>
          ) : (
            <p className="text-xs text-center text-slate-500">{metadata.date}</p>
          )}
        </div>
      );
    } else {
      // Regular document mode
      return (
        <div className={`flex flex-col items-center p-5 rounded-xl ${colorScheme.gradient}`}>
          <div className={`w-25 h-25 rounded-full bg-white flex items-center justify-center text-8xl mb-2 overflow-hidden shadow-xl border border-slate-100 ${colorScheme.ring}`}>
            {metadata?.documentEmoji || '📄'}
          </div>
          <h3 className={`font-medium text-center ${colorScheme.text}`}>
            {metadata?.title || "Primary Source"}
          </h3>
          <div className="flex flex-col items-center gap-1">
            <p className="text-xs text-center text-slate-500">
              {metadata?.date || "Unknown date"}
              {metadata?.author && ` • ${metadata.author}`}
            </p>
            {metadata?.summary && (
              <p className="text-xs text-center text-slate-600 italic max-w-64">
                {metadata.summary}
              </p>
            )}
          </div>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header with gradient background and sourcelensbar.jpg fade */}
      <header className={`relative overflow-hidden bg-gradient-to-r from-indigo-900 via-indigo-700 to-transparent text-white shadow-lg transition-all duration-700 ${animateHeader ? 'opacity-100' : 'opacity-10'}`}>
        {/* Background image on right side */}
        <div className="absolute top-0 right-0 h-full w-1/2 z-0">
          <Image 
            src="/sourcelensbar.jpg" 
            alt="SourceLens Header" 
            fill 
            priority
            className="object-cover object-left" 
          />
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-700/100 via-indigo-700/70 to-transparent"></div>
        </div>
        
        {/* Header content container */}
        <div className="max-w-9xl mx-auto p-4 relative z-10">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              {/* Logo that opens the modal */}
              <div className="pl-10 pr-10 flex items-center">
                <button 
                  onClick={() => setShowAboutModal(true)}
                  className="transition-transform hover:scale-104 focus:outline-none rounded-full glow-effect drop-shadow-effect"
                >
                  <Image 
                    src="/sourcelenslogo.png" 
                    alt="SourceLens Logo" 
                    width={70} 
                    height={70} 
                    className="rounded-full border border-indigo-800/10 ring-1 ring-yellow-300/20"
                  />
                </button>
              </div>
              
              <div>
                {/* Title with subtle text shadow */}
                <h1 className="text-3xl font-bold tracking-wide drop-shadow-sm font-serif">SourceLens</h1>
                
                {/* Source metadata row */}
                <div className="flex items-center mt-1.5">
                  {metadata?.date && (
                    <span className="text-sm font-medium bg-white/20 px-3 py-0.5 rounded-full backdrop-blur-sm">
                      {metadata.date}
                    </span>
                  )}
                  
                  {metadata?.date && metadata?.author && (
                    <span className="mx-2 text-white/50">•</span>
                  )}
                  
                  {metadata?.author && (
                    <span className="text-sm font-medium bg-white/20 px-3 py-0.5 rounded-full backdrop-blur-sm">
                      {metadata.author}
                    </span>
                  )}
       <span className="mx-2 text-white/50">•</span>
                    <StrategyDeck className="ml-1 " />
                </div>
              </div>
            </div>
            
            {/* Right side controls */}
            <div className="flex items-center space-x-4">
              {/* Loading indicator */}
              {isLoading && (
                <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm py-1.5 px-4 rounded-full animate-pulse">
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                  <span className="text-sm font-medium">Processing...</span>
                </div>
              )}
              
              {/* Menu button */}
              <HamburgerMenu />
            </div>
          </div>
        </div>
        
        {/* Decorative highlight line below header */}
        <div className="h-1 bg-gradient-to-r from-amber-400 via-purple-400 to-indigo-400 opacity-80"></div>
      </header>

      {/* Main content with three-panel layout */}
      <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
        {/* Left Panel - Tools */}
        <div className="w-full md:w-1/4 overflow-y-auto bg-gradient-to-b from-slate-100 to-slate-50 border-b md:border-b-0 md:border-r border-slate-200">
          {/* Modular boxes in left panel */}
          <div className="p-4 grid grid-cols-1 gap-4">

            {/* Portrait Box */}
            <div className="shadow-sm rounded-lg ">
              {renderPortrait()}
            </div>
            
            {/* Analysis Tools Box */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
              <h2 className="text-lg font-medium text-indigo-900 flex items-center mb-4">
                <svg className="w-5 h-5 mr-2 text-indigo-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                Analysis Tools
              </h2>
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
        <div className="w-full md:w-3/5 overflow-y-auto bg-white shadow-inner">
          {roleplayMode ? (
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
            // Show References Display when in references mode
            <div className="p-5 h-full">
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 mb-4 h-full">
                <div className="h-full">
                  <ReferencesDisplay />
                </div>
              </div>
            </div>
          ) : (
            // Show normal source view when not in roleplay mode
            <div className="p-4">
              {/* Chat Box */}
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 mb-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium text-indigo-900 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-indigo-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Source Conversation
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
                
                {/* Conversation History */}
                <div className="bg-slate-50 rounded-md border border-slate-100 mb-4">
                  <ConversationDisplay />
                </div>
                
                {/* Chat Input */}
                <ChatInput />
              </div>
              
              {/* Source Box */}
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 mb-4">
                <h2 className="text-lg font-medium text-indigo-900 flex items-center mb-4">
                  <svg className="w-5 h-5 mr-2 text-indigo-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Primary Source
                </h2>
                <div className="font-serif bg-slate-50 p-4 rounded-md border border-slate-100">
                  <SourceDisplay />
                </div>
              </div>
              
              {/* Optional second box for source metadata */}
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
                <h2 className="text-lg font-medium text-indigo-900 flex items-center mb-4">
                  <svg className="w-5 h-5 mr-2 text-indigo-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                  </svg>
                  Source Details
                </h2>
                <div className="text-sm space-y-2 text-slate-700">
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
                  {metadata?.researchGoals && (
                    <div className="flex flex-col">
                      <span className="font-medium mb-1">Research Goals:</span>
                      <p className="bg-slate-50 p-2 rounded text-slate-600">{metadata.researchGoals}</p>
                    </div>
                  )}
                  {metadata?.additionalInfo && (
                    <div className="flex flex-col">
                      <span className="font-medium mb-1">Additional Context:</span>
                      <p className="bg-slate-50 p-2 rounded text-slate-600">{metadata.additionalInfo}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Right Panel - Analysis Results */}
        <div className="w-full md:w-1/3 overflow-y-auto bg-gradient-to-b from-slate-100 to-slate-50 border-t md:border-t-0 md:border-l border-slate-200">
          <div className="p-4">
            {/* Analysis Box */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
              <h2 className="text-lg font-medium text-indigo-900 flex items-center mb-4">
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
                  ? "Counter-Narrative" 
                  : activePanel === 'roleplay' 
                  ? "Analysis" 
                  : activePanel === 'references'
                  ? "References Information"
                  : "Analysis"}
              </h2>
              <div className="bg-slate-50 p-4 rounded-md border border-slate-100">
                {activePanel === 'references' 
                  ? <ReferencesExplanation />
                  : <AnalysisPanel />
                }
              </div>
            </div>
            
            {/* Box for follow-up questions or conversation history */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 mt-4">
              <h2 className="text-lg font-medium text-indigo-900 flex items-center mb-4">
                <svg className="w-5 h-5 mr-2 text-indigo-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Previous questions
              </h2>
              <div className="text-sm text-slate-600">
                {conversation.length > 0 ? (
                  <div className="space-y-2">
                    {conversation.filter(msg => msg.role === 'user').slice(-3).map((msg, idx) => (
                      <div key={idx} className="bg-slate-50 p-2 rounded border border-slate-100">
                        <p className="italic text-xs mb-1">Your question:</p>
                        <p>{msg.content}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="italic text-center">Selected questions will appear here</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* About SourceLens Logo Modal */}
      {showAboutModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-indigo-50">
              <h3 className="font-bold text-xl text-indigo-900">About this logo</h3>
              <button 
                onClick={() => setShowAboutModal(false)}
                className="text-gray-500 hover:text-gray-800 text-2xl"
              >
                &times;
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-indigo-800 mb-2">The Inspiration</h4>
                  <p className="text-slate-700 mb-3">
                    This image is a tiny detail from Hans Memling's masterpiece, the "Diptych of Maarten van Nieuwenhove" (1487), 
                    currently housed in the Old St. John's Hospital in Bruges. This early Netherlandish devotional diptych 
                    features an innovative technique: a mirror that reflects the scene, creating a unified space between two separate panels.
                  </p>
                  <p className="text-slate-700 mb-3">
                    Just as Memling's mirror offers a new perspective on the scene, SourceLens provides multiple viewpoints 
                    through which to examine historical texts. The convex mirror in the painting reveals what would otherwise 
                    remain hidden from view—similarly, our application uncovers interpretations and contexts that might not be 
                    immediately apparent in primary sources.
                  </p>
                  <p className="text-slate-700">
                    The diptych also represents a conversation across time and space—between the Virgin Mary and Maarten van Nieuwenhove—much like 
                    how SourceLens facilitates a dialogue between modern researchers and historical figures through its roleplay feature.
                  </p>
                </div>
                <div className="md:w-1/2 flex flex-col items-center">
                  <Image 
                    src="/memling.jpg"
                    alt="Diptych of Maarten van Nieuwenhove by Hans Memling"
                    width={400}
                    height={300}
                    className="rounded-md shadow-md mb-2"
                  />
                  <p className="text-xs text-slate-500 italic text-center">
                    Diptych of Maarten van Nieuwenhove (1487) by Hans Memling
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end">
              <button
                onClick={() => setShowAboutModal(false)}
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
    </div>
  );
}