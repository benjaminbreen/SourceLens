// components/analysis/MainLayout.tsx
// Main three-column layout with collapsible left sidebar and persistent mini navigation
// Refined with responsive design, panel sliding animations and global dark mode support

'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
import SlimFooter from '@/components/ui/SlimFooter';
import TranslationPanel from '../translate/TranslationPanel';
import SourceDetailsPanel from '../analysis/SourceDetailsPanel';
import AccountButton from '@/components/auth/AccountButton';
import AccountPanel from '@/components/auth/AccountPanel';
import AuthStatus from '@/components/auth/AuthStatus';
import { Lora } from 'next/font/google';
import ConnectionsGraph from '../connections/ConnectionsGraph';
import NodeDetailPanel from '../connections/NodeDetailPanel';
import { Network } from 'lucide-react';
import WikipediaPanel from '../ui/WikipediaPanel';
import ConnectionsLegend from '@/components/connections/ConnectionsLegend';
import { NodeNote, GraphNode } from '@/lib/store';
import NotesSidePanel from '../notes/NotesSidePanel';
import NotesButton from '../notes/NotesButton';
import SelectionTooltip from '../notes/SelectionTooltip';
import { Space_Grotesk } from 'next/font/google';
import MiniSidebar from '../ui/MiniSidebar';
import RightMiniToolbar from '../ui/RightMiniToolbar';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-space-grotesk',
});

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
    isNotePanelVisible,
    setNotePanelVisible,
  } = useAppStore();

  // UI state
  const [animateHeader, setAnimateHeader] = useState(false);
  const [showAboutLogoModal, setShowAboutLogoModal] = useState(false);
  const [chatExpanded, setChatExpanded] = useState(false);
  const [portraitError, setPortraitError] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState(18);
  const [isFullAnalysisModalOpen, setIsFullAnalysisModalOpen] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  
  // Sidebar state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const [rightSidebarExpanded, setRightSidebarExpanded] = useState(true);
const [rightSidebarHovered, setRightSidebarHovered] = useState(false);
  
  // Analysis panel state
  const [showAnalysisPanel, setShowAnalysisPanel] = useState(true);
  const [rightPanelExpanded, setRightPanelExpanded] = useState(true);
  
  // Connections state
  const [connectionData, setConnectionData] = useState(null);
  const [isLoadingConnections, setIsLoadingConnections] = useState(false);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [showNodeDetail, setShowNodeDetail] = useState(false);
  
  // Account and Wikipedia panel state
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [wikipediaPanelTitle, setWikipediaPanelTitle] = useState<string | null>(null);
  const [showWikipediaPanel, setShowWikipediaPanel] = useState(false);

const handleCollapseRightPanel = () => {
  setRightPanelExpanded(false);
};

const handleExpandRightPanel = () => {
  setRightPanelExpanded(true);
};

const handleHighlightActivation = () => {
  setActivePanel('highlight');
  setRightPanelExpanded(true);
};

const handleSummaryActivation = () => {
  setShowSummary(true);
};

const handleNotesActivation = () => {
  setNotePanelVisible(true);
};

  // Handle opening the Wikipedia panel
  const handleOpenWikipediaPanel = (title: string) => {
    setWikipediaPanelTitle(title);
    setShowWikipediaPanel(true);
  };
  
  // Toggle sidebar collapse
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };
  
  // Handle sidebar hover
  const handleSidebarHover = (isHovered: boolean) => {
    setSidebarHovered(isHovered);
  };
  
  // Source context for external components
  const sourceContext = useMemo(() => {
    return {
      date: metadata?.date || '',
      author: metadata?.author || '',
      title: metadata?.title || '',
      type: metadata?.documentType || 'document' 
    };
  }, [metadata]);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };
  
  // Handle analysis panel close with animation
  const handleCloseAnalysisPanel = () => {
    setShowAnalysisPanel(false);
  };
  
  // Handle showing analysis panel again
  const handleShowAnalysisPanel = () => {
    setShowAnalysisPanel(true);
  };
  
  // Add animation effect to header on load
  useEffect(() => {
    setAnimateHeader(true);
  }, []);

  // Font size handler
  const handleFontSizeChange = (newSize: number) => {
    setFontSize(newSize);
  };

  // Extract year from date string
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

  // Fetch connection data for graph
  const fetchConnectionData = async () => {
    if (!sourceContent || !metadata) return;
    
    setIsLoadingConnections(true);
    try {
      const response = await fetch('/api/connections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source: sourceContent,
          metadata: metadata,
          modelId: llmModel
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
      }
      
      const data = await response.json();
      setConnectionData(data);
    } catch (error) {
      console.error("Error fetching connections:", error);
    } finally {
      setIsLoadingConnections(false);
    }
  };

  // Node interaction handlers for connections graph
  const handleNodeClick = (node: GraphNode) => {
    setSelectedNode(node);
    setShowNodeDetail(true);
  };

  const handleExpandNode = async (node: GraphNode) => {
    console.log("Expanding connections for:", node);
    // to be implemented later
    return Promise.resolve();
  };

  const handleSaveNodeNote = (noteData: { nodeId: string; note: string }) => {
    console.log("Saving note for node:", noteData.nodeId, noteData.note);
    // tk implement later with supabase integration
  };

  // Fetch connections data when needed
  useEffect(() => {
    if (activePanel === 'connections' && !connectionData && !isLoadingConnections) {
      fetchConnectionData();
    }
  }, [activePanel, connectionData, isLoadingConnections, sourceContent, metadata, llmModel]);

  // Determine theme classes based on dark mode
  const themeClasses = {
    background: darkMode 
      ? 'bg-slate-900 text-slate-100' 
      : 'bg-slate-50 text-slate-900',
    header: darkMode
      ? 'from-slate-900 via-slate-800 to-slate-900'
      : 'from-slate-900 via-slate-800 to-slate-900', // Keep header dark even in light mode
    gradient: darkMode
      ? 'bg-gradient-to-r from-amber-500/80 via-purple-500/80 to-indigo-900/80'
      : 'bg-gradient-to-r from-amber-400 via-purple-400 to-indigo-900',
    panel: darkMode
      ? 'from-slate-800 to-slate-900 border-slate-700'
      : 'from-slate-50 to-white border-slate-200',
    card: darkMode
      ? 'bg-slate-800 border-slate-700 text-slate-200'
      : 'bg-white border-slate-200 text-slate-800',
    button: {
      primary: darkMode
        ? 'bg-indigo-700 hover:bg-indigo-600 text-white'
        : 'bg-indigo-600 hover:bg-indigo-700 text-white',
      secondary: darkMode
        ? 'bg-slate-700 hover:bg-slate-600 text-slate-200'
        : 'bg-slate-100 hover:bg-slate-200 text-slate-700',
      icon: darkMode
        ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'
        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
    }
  };

  return (
    <div className={`min-h-screen flex flex-col ${themeClasses.background} transition-colors duration-300`}>
      {/* Header with gradient background and sourcelensbar.jpg fade */}
      <header className={`relative bg-gradient-to-r ${themeClasses.header} text-white shadow-lg`}>
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
              <div className="ml-0">
                {/* Title and path */}
                <div className="flex flex-wrap gap-2 items-center">
                  <Link href="/" className="group inline-block relative overflow-hidden">
                    <h1 className={`${spaceGrotesk.className} text-2xl tracking-tighter font-bold shadow-sm text-white transition-all duration-300`}>
                      SourceLens
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-indigo-400 via-white to-indigo-400 transform scale-x-0 origin-left transition-transform duration-300 ease-out group-hover:scale-x-100"></span>
                    </h1>
                  </Link>

                  <span className="text-white/40">/</span>

                  <div className={`${spaceGrotesk.className} text-sm font-semibold text-white/80`}>
                    Analysis
                  </div>
                </div>

                {/* Metadata block */}
                <div className="flex flex-wrap gap-2 items-center mt-2 text-xs font-medium text-white/80">
                  {metadata?.date && (
                    <button 
                      onClick={() => handleOpenWikipediaPanel(metadata.date)}
                      className="text-sm font-medium bg-white/10 hover:bg-white/20 px-3 py-0.5 rounded-full transition-colors group"
                    >
                      {metadata.date}
                      <span className="block max-w-0 group-hover:max-w-full transition-all duration-300 h-0.5 bg-indigo-400/60"></span>
                    </button>
                  )}

                  {metadata?.date && metadata?.author && (
                    <span className="text-white/40">•</span>
                  )}

                  {metadata?.author && (
                    <button
                      onClick={() => handleOpenWikipediaPanel(metadata.author)}
                      className="text-sm font-medium bg-white/10 hover:bg-white/20 px-3 py-0.5 rounded-full transition-colors group"
                    >
                      {metadata.author}
                      <span className="block max-w-0 group-hover:max-w-full transition-all duration-300 h-0.5 bg-indigo-400/60"></span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Right side: Animated loading */}
            <div className="flex px-0 ml-38 opacity-50"></div>

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

                {/* Library Dropdown */}
                <div className="relative group">
                  <Link
                    href="/library"
                    className="px-3 py-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-md flex items-center transition-colors"
                  >
                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                    </svg>
                    Library
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </Link>
                  
                  {/* Dropdown Menu */}
                  <div className="absolute left-0 mt-1 w-56 bg-slate-800 rounded-lg shadow-lg border border-slate-700 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <Link 
                      href="/library?tab=references"
                      className="flex items-center w-full px-4 py-2 text-sm text-white hover:bg-slate-700 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-2 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Saved References
                    </Link>
                    <Link 
                      href="/library?tab=analysis"
                      className="flex items-center w-full px-4 py-2 text-sm text-white hover:bg-slate-700 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Analysis History
                    </Link>
                    <Link 
                      href="/library?tab=sources"
                      className="flex items-center w-full px-4 py-2 text-sm text-white hover:bg-slate-700 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      Saved Sources
                    </Link>
                    <Link 
                      href="/library?tab=notes"
                      className="flex items-center w-full px-4 py-2 text-sm text-white hover:bg-slate-700 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Research Notes
                    </Link>
                    <Link 
                      href="/library?tab=drafts"
                      className="flex items-center w-full px-4 py-2 text-sm text-white hover:bg-slate-700 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-2 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Research Drafts
                    </Link>
                  </div>
                </div>

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

      <div className={`h-1 ${themeClasses.gradient} opacity-100 transition-colors duration-300`}></div>

      {/* Main content with three-panel layout */}
      <div className="flex flex-1 gap-1 overflow-hidden flex-col p-1 md:flex-row relative">
        {/* Collapsible Sidebar Toggle Button - only visible when collapsed */}
        {sidebarCollapsed && !sidebarHovered && (
          <button 
            onClick={toggleSidebar}
            className={`absolute left-0 top-1/2 -translate-y-1/2 z-30 p-1.5 rounded-r-lg ${
              darkMode 
                ? 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700 border-l-0' 
                : 'bg-white text-slate-500 hover:text-slate-700 border border-slate-200 border-l-0'
            } transition-all shadow-md`}
            aria-label="Expand sidebar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
        
        {/* Left Sidebar Container */}
<div 
  className={`relative ${roleplayMode ? 'md:w-1/3' : 'md:w-1/4'} transition-all duration-300 ease-in-out`}
  onMouseEnter={() => handleSidebarHover(true)}
  onMouseLeave={() => handleSidebarHover(false)}
>
  {/* Mini Sidebar - Visible when collapsed */}
  {sidebarCollapsed && (
    <MiniSidebar 
      darkMode={darkMode} 
      activePanel={activePanel}
      setActivePanel={setActivePanel}
      onExpandSidebar={toggleSidebar}
      sidebarHovered={sidebarHovered}
    />
  )}
  
  {/* Full Sidebar - Visible when expanded or on hover when collapsed */}
  <div 
    className={`w-full h-full overflow-y-auto bg-gradient-to-b px-2 ${themeClasses.panel} border-b md:border-b-0 transition-all duration-300 ease-in-out ${
      sidebarCollapsed ? 'opacity-0 invisible' : 'opacity-100 visible'
    }`}
  >
    {/* Collapsible Sidebar Toggle Button - only visible when expanded */}
    <div className="absolute left-6.5 top-16 z-30">
      <button 
        onClick={toggleSidebar} 
        className={`p-2 rounded-md ${
          darkMode 
            ? 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700 hover:bg-slate-900' 
            : 'bg-white text-slate-500 shadow-sm hover:text-slate-700 hover:bg-gradient-to-b from-white to-slate-200/80 border border-slate-200 hover:border-slate-400/60 hover:shadow-inner hover:scale-105 transition-all duration-300 ease-in-out '
        }  transition-colors`}
        aria-label="Collapse sidebar"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
    </div>
    
    {/* Modular boxes in left panel */}
    <div className="p-3 pt-14 grid grid-cols-1 gap-4">

              <div className="shadow-sm rounded-xl">
                <DocumentPortrait
                  sourceFile={sourceFile}
                  sourceType={sourceType}
                  metadata={metadata}
                  roleplayMode={roleplayMode}
                  portraitError={portraitError}
                  setPortraitError={setPortraitError}
                  darkMode={darkMode}
                />
              </div>
              
              {/* Analysis Tools Box */}
              <div className="rounded-lg z-1 p-5">
                <UserInputPanel darkMode={darkMode} />
              </div>

              {/* LLM Transparency Box */}
              <div className={`${themeClasses.card} rounded-lg border z-1 p-4 transition-colors duration-300`}>
                <h2 className={`text-lg font-medium ${darkMode ? 'text-indigo-300' : 'text-indigo-900'} flex items-center mb-4 transition-colors duration-300`}>
                  <svg className={`w-5 h-5 mr-2 ${darkMode ? 'text-indigo-400' : 'text-indigo-700'} transition-colors duration-300`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  LLM Info
                </h2>
                <LLMTransparency rawPrompt={rawPrompt} rawResponse={rawResponse} />
              </div>
            </div>
          </div>
        </div>
        
        {/* Center Panel - Content changes based on mode */}
  <div className={`w-full ${
    activePanel === 'roleplay'
      ? 'md:w-full' // Full width when in roleplay mode
      : activePanel === 'references'
        ? rightPanelExpanded 
          ? 'md:w-2/3' // Wider when references is active and right panel expanded
          : 'md:w-[calc(100%-3.5rem)]' // Almost full width minus the mini toolbar width
        : (detailedAnalysis && activePanel === 'detailed-analysis') || activePanel === 'counter'
          ? showAnalysisPanel 
            ? rightPanelExpanded 
              ? 'md:w-1/3' // Narrower when detailed analysis is shown with both panels
              : 'md:w-[calc(100%-3.5rem-25%)]' // When right panel is collapsed but left is visible
            : rightPanelExpanded
              ? 'md:w-[calc(100%-25%)]' // When left panel is hidden but right is visible
              : 'md:w-[calc(100%-3.5rem)]' // When both panels are collapsed, just the mini toolbar
          : showAnalysisPanel
            ? rightPanelExpanded
              ? 'md:w-3/5' // Standard width with both panels
              : 'md:w-[calc(100%-3.5rem-25%)]' // When right panel is collapsed but left is visible
            : rightPanelExpanded
              ? 'md:w-[calc(100%-25%)]' // When left panel is hidden but right is visible
              : 'md:w-[calc(100%-3.5rem)]' // When both panels are collapsed, just the mini toolbar
    } transition-all duration-300 ease-in-out overflow-y-auto pr-0 ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
    
          {activePanel === 'extract-info' ? (
            <div className="p-0">
              <div className={`${themeClasses.card} rounded-lg p-4 mb-4 transition-colors duration-300`}>
                <div className="flex justify-between items-center mb-4"></div>
                <ExtractInfoPanel darkMode={darkMode} />
              </div>
            </div>
          ) : activePanel === 'translate' ? (
            <div className="p-0">
              <div className={`${themeClasses.card} rounded-lg p-4 mb-4 transition-colors duration-300`}>
                <div className="flex justify-between items-center mb-4">
                  {/* Content added by TranslationPanel component */}
                </div>
                <TranslationPanel darkMode={darkMode} />
              </div>
            </div>
          ) : activePanel === 'connections' ? (
            <div className="p-4">
              <div className={`${themeClasses.card} rounded-lg shadow-sm p-4 mb-4 transition-colors duration-300`}>
                <div className="flex justify-between items-center mb-4">
                  <h2 className={`text-lg font-medium ${darkMode ? 'text-violet-300' : 'text-violet-900'} flex items-center transition-colors duration-300`}>
                    <Network size={20} className={`mr-2 ${darkMode ? 'text-violet-400' : 'text-violet-700'} transition-colors duration-300`} />
                    Connection Graph
                  </h2>
                </div>
                
                <ConnectionsGraph
                  source={{ 
                    metadata: metadata || {},
                    content: sourceContent || "" 
                  }}
                  graphData={connectionData}
                  onNodeClick={handleNodeClick}
                  loading={isLoadingConnections}
                  darkMode={darkMode}
                />
              </div>
            </div>
          ) : activePanel === 'roleplay' ? (
            // Show Roleplay Chat directly with full width
            <RoleplayChat darkMode={darkMode} />
          ) : activePanel === 'references' ? (
            // Show References panel when references is active
            <div className="p-4">
              <div className={`${themeClasses.card} rounded-lg shadow-sm p-4 mb-4 transition-colors duration-300`}>
                <h2 className={`text-lg font-medium ${darkMode ? 'text-indigo-300' : 'text-indigo-900'} flex items-center mb-4 transition-colors duration-300`}>
                  <svg className={`w-5 h-5 mr-2 ${darkMode ? 'text-indigo-400' : 'text-indigo-700'} transition-colors duration-300`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Suggested References
                </h2>
                <ReferencesDisplay darkMode={darkMode} />
              </div>
            </div>
          ) : (
            // Show normal source view when not in roleplay mode or references mode
            <div className="p-4">
              {/* Chat Box */}
              <div className={`${themeClasses.card} rounded-xl p-0 px-5 mb-3 transition-colors duration-300`}>
                <div className="flex justify-between items-center mb-0">
                  <h2 className={`text-lg font-medium ${darkMode ? 'text-indigo-300' : 'text-indigo-900'} flex items-center transition-colors duration-300`}></h2>
                </div>
                
                {/* Using the ChatContainer component */}
                <ChatContainer darkMode={darkMode} />
              </div>
              
              {/* Source Box */}
              <div className={`${darkMode ? 'bg-slate-800/20' : 'bg-slate-100/20'} rounded-lg p-4 mb-2 transition-colors duration-300`}>
                <div className="flex justify-between items-center mb-2">
                  <h2 className={`text-xl font-semibold ml-2 rounded-lg ${darkMode ? 'text-indigo-300' : 'text-indigo-900'} flex items-center transition-colors duration-300`}>
                    Primary Source
                  </h2>
                  
                  <div className="flex items-center mr-2 -mt-2 space-x-5">
                    {/* Document Actions Button */}
                    <div className={`rounded-lg ${darkMode ? 'border-slate-700' : 'border-slate-200'} transition-colors duration-300`}>
                      <DocumentActions 
                        darkMode={darkMode} 
                        toggleDarkMode={toggleDarkMode}
                        onFontSizeChange={handleFontSizeChange}
                        currentFontSize={fontSize}
                        onSummarizeComplete={() => {
                          console.log("Summary completed");
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className={`${darkMode ? 'bg-slate-700/70' : 'bg-slate-200/70'} p-1 rounded-lg ${darkMode ? 'border-slate-600' : 'border-slate-100'} transition-colors duration-300`}>
                  <SourceDisplay 
                    darkMode={darkMode}
                    toggleDarkMode={toggleDarkMode}
                    fontSize={fontSize}
                  />
                </div>
              </div>
              
              {/* Source metadata box */}
              <div className={`rounded-xl overflow-hidden ${themeClasses.card} transition-colors duration-300`}>
                <SourceDetailsPanel metadata={metadata} darkMode={darkMode} />
              </div>
            </div>
          )}
        </div>

        {/* Right Analysis Panel */}
          <div className={`w-full ${
            !rightPanelExpanded ? 'md:w-0 md:overflow-hidden' : 
            activePanel === 'counter'
              ? 'md:w-2/3' 
              : activePanel === 'extract-info'
                ? 'md:w-1/5' 
                : activePanel === 'roleplay'
                  ? 'md:w-0 md:overflow-hidden'
                : detailedAnalysis && activePanel === 'detailed-analysis'
                  ? showAnalysisPanel 
                    ? 'md:w-3/5'
                    : 'md:w-0 md:overflow-hidden'
                  : showAnalysisPanel
                    ? 'md:w-1/4'
                    : 'md:w-0 md:overflow-hidden'
            } transition-all duration-300 ease-in-out overflow-y-auto z-20 ${darkMode ? 'bg-slate-800' : 'bg-white'} border-t md:border-t-0 ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}
          >
            <div className="p-4 relative">
              {/* Right Panel - Analysis Panel with Header */}
              <div className={`${themeClasses.card} rounded-lg p-3 transition-colors duration-300`}>
                <div className="flex justify-between items-center mb-2">
                  {/* Panel title with animation */}
                  <div className={`transition-transform duration-300 ${showAnalysisPanel ? 'translate-x-0' : 'translate-x-20 opacity-0'}`}>
                    <h2 className={`text-lg font-semibold ${darkMode ? 'text-slate-200' : 'text-slate-900'} transition-colors duration-300`}>
                      {activePanel === 'counter' 
                        ? "Counter-Narratives" 
                        : activePanel === 'references'
                        ? "References Information"
                        : activePanel === 'highlight'
                        ? "Text Highlighting"
                        : ""}
                    </h2>
                  </div>
                  
                  {/* Right side icons */}
                  <div className="flex items-center space-x-2 z-10">
                    {/* Add the collapse button here */}
                    <button 
                      onClick={handleCollapseRightPanel}
                      className={`p-1.5 rounded-full ${themeClasses.button.icon} transition-colors duration-300`}
                      aria-label="Collapse analysis panel"
                      title="Collapse analysis panel"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
              

                  {/* Dark mode toggle */}
                  <button
                    onClick={toggleDarkMode}
                    className={`p-1.5 rounded-full ${themeClasses.button.icon} transition-colors duration-300`}
                    aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                    title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                  >
                    {darkMode ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                      </svg>
                    )}
                  </button>


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
                    truncated={sourceContent ? sourceContent.length > 130000 : undefined}
                    wordCount={Math.round((sourceContent?.length || 0) / 6.5)}
                    truncatedLength={processingData?.truncatedLength}
                    processingData={processingData || {}}
                    darkMode={darkMode}
                    additionalInfo={{
                      perspective: perspective || 'Default',
                      activePanel: activePanel
                    }}
                  />
               
                </div>
                         {/* Always visible right mini toolbar */}
  <div className={`${rightPanelExpanded ? 'md:hidden' : 'md:block'}`}>
    <RightMiniToolbar
      darkMode={darkMode}
      onExpandRightPanel={handleExpandRightPanel}
      onHighlight={handleHighlightActivation}
      onSummary={handleSummaryActivation}
      onNotes={handleNotesActivation}
       onToggleDarkMode={toggleDarkMode}  
    />
              </div>
              </div>

              {/* Analysis content with slide animation */}
              <div className={`${darkMode ? 'bg-slate-800' : 'bg-slate-50'} p-3 rounded-lg border ${darkMode ? 'border-slate-700' : 'border-slate-100'} transition-colors duration-300 overflow-hidden`}>
                <div className={`transition-transform duration-300 ease-in-out ${showAnalysisPanel ? 'translate-x-0' : 'translate-x-150'}`}>
                  {activePanel === 'references' ? (
                    <ReferencesExplanation darkMode={darkMode} />
                  ) : (
                    <AnalysisPanel darkMode={darkMode} />
                  )}
                </div>
              </div>
            </div>

            {/* Feature Button Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4">
              {/* Highlight Text Button */}
              <button
                onClick={() => setActivePanel('highlight')}
                className={`group flex items-center justify-center h-10 rounded-lg border transition-all duration-200 ${
                  activePanel === 'highlight'
                    ? darkMode 
                      ? 'bg-amber-900/30 text-amber-300 border-amber-700 shadow-sm'
                      : 'bg-amber-50 text-amber-800 border-amber-300 shadow-sm'
                    : darkMode
                      ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-amber-900/20 hover:text-amber-300 hover:border-amber-800'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-amber-50/50 hover:text-amber-700 hover:border-amber-200 hover:shadow-sm'
                  }`}
              >
                <svg className={`w-4 h-4 mr-1.5 transition-colors duration-200 ${
                  activePanel === 'highlight' 
                    ? darkMode ? 'text-amber-400' : 'text-amber-600' 
                    : darkMode 
                      ? 'text-slate-400 group-hover:text-amber-400' 
                      : 'text-slate-500 group-hover:text-amber-500'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                <span className="text-sm font-medium truncate">Highlight</span>
              </button>
              
              {/* View Summary Button */}
              <button
                onClick={() => setShowSummary(true)}
                className={`group flex items-center justify-center h-10 rounded-lg border transition-all duration-200 ${
                  darkMode 
                    ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-indigo-900/20 hover:text-indigo-300 hover:border-indigo-800'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-indigo-50/50 hover:text-indigo-700 hover:border-indigo-200 hover:shadow-sm'
                }`}
              >
                <svg className={`w-4 h-4 mr-1.5 transition-colors duration-200 ${
                  darkMode
                    ? 'text-slate-400 group-hover:text-indigo-400'
                    : 'text-slate-500 group-hover:text-indigo-500'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                <span className="text-sm font-medium truncate">Summary</span>
              </button>

              <NotesButton />
            </div>
            
            <SelectionTooltip />
            <NotesSidePanel 
              isOpen={isNotePanelVisible}
              onClose={() => setNotePanelVisible(false)}
              darkMode={darkMode}
            />

            {/* Modals */}
            {showSummary && (
              <SummarizeText 
                onClose={() => setShowSummary(false)} 
                darkMode={darkMode}
              />
            )}
          </div>
        </div>
      </div>

      {/* About SourceLens Logo Modal */}
      {showAboutLogoModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-auto transition-colors duration-300`}>
            <div className={`p-4 border-b ${darkMode ? 'border-slate-700 bg-slate-800' : 'border-gray-200 bg-indigo-50'} flex justify-between items-center transition-colors duration-300`}>
              <h3 className={`font-bold text-xl ${darkMode ? 'text-white' : 'text-indigo-900'} transition-colors duration-300`}>About this logo</h3>
              <button 
                onClick={() => setShowAboutLogoModal(false)}
                className={`${darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-gray-500 hover:text-gray-800'} text-2xl transition-colors duration-300`}
              >
                &times;
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <h4 className={`text-lg font-semibold ${darkMode ? 'text-indigo-300' : 'text-indigo-800'} mb-2 transition-colors duration-300`}>Looking more closely</h4>
                  <p className={`${darkMode ? 'text-slate-300' : 'text-slate-700'} mb-3 transition-colors duration-300`}>
                    This image is a tiny detail from Hans Memling's "Diptych of Maarten van Nieuwenhove" (1487), 
                    currently housed in the Old St. John's Hospital in Bruges. This early Netherlandish diptych 
                    features an innovative technique: <span 
                      id="mirror-text" 
                      className={`relative inline transition-colors font-semibold ${darkMode ? 'text-amber-400 hover:text-amber-300' : 'text-amber-700 hover:text-amber-500'} hover:font-medium cursor-help transition-colors duration-300`}
                      onMouseEnter={() => document.getElementById('mirror-highlight')?.classList.remove('opacity-0')}
                      onMouseLeave={() => document.getElementById('mirror-highlight')?.classList.add('opacity-0')}
                    >a mirror that reflects the scene</span>, creating a unified space between two separate panels.
                  </p>
                  <p className={`${darkMode ? 'text-slate-300' : 'text-slate-700'} mb-3 transition-colors duration-300`}>
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
                  <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'} italic text-center transition-colors duration-300`}>
                    Diptych of Maarten van Nieuwenhove (1487) by Hans Memling
                  </p>
                </div>
              </div>
            </div>
            
            <div className={`p-4 border-t ${darkMode ? 'border-slate-700 bg-slate-800' : 'border-gray-200 bg-gray-50'} flex justify-end transition-colors duration-300`}>
              <button
                onClick={() => setShowAboutLogoModal(false)}
                className={`px-4 py-2 ${darkMode ? 'bg-indigo-700 hover:bg-indigo-600' : 'bg-indigo-600 hover:bg-indigo-700'} text-white rounded transition-colors duration-300`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6">
        <SlimFooter {...{ isDarkMode: darkMode }} />
      </div>

      {/* Render the FullAnalysisModal */}
    {isFullAnalysisModalOpen && detailedAnalysis && (
  <FullAnalysisModal
    isOpen={isFullAnalysisModalOpen}
    onClose={() => setIsFullAnalysisModalOpen(false)}
    analysisContent={detailedAnalysis}
    metadata={metadata}
    perspective={perspective}
    llmModel={llmModel}
    {...{ isDarkMode: darkMode }}
  />
)}

     <AboutModal 
     {...{ isOpen: showAboutModal, 
      onClose: () => setShowAboutModal(false), 
      isDarkMode: darkMode 
    }} 
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
          }}
        />
      )}

      {/* Node Detail Panel */}
      {showNodeDetail && selectedNode && (
        <NodeDetailPanel
          node={selectedNode}
          onClose={() => setShowNodeDetail(false)}
          onExpand={handleExpandNode}
          onSaveNote={(noteData) => handleSaveNodeNote(noteData)}
          isLoading={isLoadingConnections}
  isDarkMode={darkMode}
        />
      )}

      {isPanelOpen && (
        <div className="fixed inset-0 z-[10000]">
          <AccountPanel isOpen={isPanelOpen} onClose={() => setIsPanelOpen(false)} />
        </div>
      )}

      {showWikipediaPanel && wikipediaPanelTitle && (
        <WikipediaPanel
          title={wikipediaPanelTitle}
          onClose={() => setShowWikipediaPanel(false)}
          sourceContext={sourceContext}
        />
      )}
    </div>
  );
}

