// app/dashboard/page.tsx
// A comprehensive dashboard with personalized experience for signed-in users
// -------------------------------------------------------------
// ▸ At-a-glance activity statistics and usage metrics
// ▸ Quick-access to recent sources and research notes
// ▸ Streamlined file upload or text entry workflow
// ▸ AI-powered suggestions for next research steps
// ▸ Responsive design with dark mode support
// -------------------------------------------------------------

'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAppStore, Metadata } from '@/lib/store';
import { useLibrary } from '@/lib/libraryContext';
import { useAuth } from '@/lib/auth/authContext';
import { format, formatDistanceToNow } from 'date-fns';
import HamburgerMenu from '@/components/ui/HamburgerMenu';
import AccountButton from '@/components/auth/AccountButton';
import AccountPanel from '@/components/auth/AccountPanel';
import SuggestionModal from '@/components/ui/SuggestionModal';
import Link from 'next/link';

// Type for activity items
interface ActivityItem {
  id: string;
  type: 'source_added' | 'note_created' | 'analysis_completed';
  title: string;
  timestamp: number;
  metadata?: {
    sourceId?: string;
    noteId?: string;
    analysisType?: string;
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { 
    setSourceContent, 
    setActiveNote, 
    setSourceType, 
    setMetadata, 
    setSourceFile 
  } = useAppStore();
  
  const { 
    sources, 
    notes, 
    analyses,
    updateSource,
    updateNote,
    isLoading: libraryLoading 
  } = useLibrary();

  // Local state
  const [thinking, setThinking] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [textInputMode, setTextInputMode] = useState(false);
  const [sourceText, setSourceText] = useState('');
  const [sourceTitle, setSourceTitle] = useState('');
  const [researchGoals, setResearchGoals] = useState('');
  const [recentSources, setRecentSources] = useState<any[]>([]);
  const [recentNotes, setRecentNotes] = useState<any[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statsData, setStatsData] = useState({
    sourcesCount: 0,
    notesCount: 0,
    analysesCount: 0,
    lastActive: ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Dark mode and UI state
  const [darkMode, setDarkMode] = useState(false);
  const [accountPanelOpen, setAccountPanelOpen] = useState(false);
  const [suggestionModalOpen, setSuggestionModalOpen] = useState(false);
  const [suggestion, setSuggestion] = useState('');

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    // Persist dark mode preference
    localStorage.setItem('darkMode', (!darkMode).toString());
  };

  // Load dark mode preference
  useEffect(() => {
    const storedDarkMode = localStorage.getItem('darkMode');
    if (storedDarkMode !== null) {
      setDarkMode(storedDarkMode === 'true');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(prefersDark);
    }
  }, []);

  // Process library data when available
  useEffect(() => {
    if (!libraryLoading) {
      // Sort sources by lastAccessed (most recent first)
      const sortedSources = [...(sources || [])].sort((a, b) => 
        (b.lastAccessed || b.dateAdded) - (a.lastAccessed || a.dateAdded)
      );
      setRecentSources(sortedSources.slice(0, 5));
      
      // Sort notes by lastModified (most recent first)
      const sortedNotes = [...(notes || [])].sort((a, b) => 
        (b.lastModified) - (a.lastModified)
      );
      setRecentNotes(sortedNotes.slice(0, 5));
      
      // Generate activity feed from actual data
      const activityItems: ActivityItem[] = [];
      
      // Add source activities
      sortedSources.slice(0, 3).forEach((source, index) => {
        activityItems.push({
          id: `source-${source.id}`,
          type: 'source_added',
          title: `Added "${source.metadata?.title || 'Untitled document'}"`,
          timestamp: source.dateAdded,
          metadata: { sourceId: source.id }
        });
      });
      
      // Add note activities
      sortedNotes.slice(0, 3).forEach((note) => {
        activityItems.push({
          id: `note-${note.id}`,
          type: 'note_created',
          title: `Created note on "${note.sourceMetadata?.title || 'Untitled source'}"`,
          timestamp: note.dateCreated,
          metadata: { noteId: note.id }
        });
      });
      
      // Add analysis activities
      if (analyses?.length) {
        analyses.slice(0, 3).forEach((analysis) => {
          activityItems.push({
            id: `analysis-${analysis.id}`,
            type: 'analysis_completed',
            title: `Completed ${analysis.type} analysis of "${analysis.sourceName || 'document'}"`,
            timestamp: analysis.dateAdded,
          });
        });
      }
      
      // Sort all activities by timestamp (recent first) and limit
      setActivities(activityItems
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 8)
      );
      
      // Set stats
      setStatsData({
        sourcesCount: sources?.length || 0,
        notesCount: notes?.length || 0,
        analysesCount: analyses?.length || 0,
        lastActive: sources?.length ? formatDistanceToNow(new Date(sortedSources[0].dateAdded), { addSuffix: true }) : 'Never'
      });
      
      setIsLoading(false);
    }
  }, [libraryLoading, sources, notes, analyses]);

  // AI "next steps" helper
  const askNextSteps = async () => {
    try {
      setThinking(true);
      const res = await fetch('/api/next-steps', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          stats: statsData,
          recentSources: recentSources
            .map(s => `${s.metadata?.title || 'Untitled'} (${s.type}, ${s.metadata?.date || 'Unknown date'})`)
            .filter(Boolean),
         recentNotes: recentNotes
           .map(n => `${n.sourceMetadata?.title || 'Untitled'}: ${n.content?.substring(0, 100)}`)
           .filter(Boolean),

        })
      });
      
      if (!res.ok) {
        throw new Error('Failed to get suggestions');
      }
      
      const data = await res.json();
      setSuggestion(data.suggestion);
      setSuggestionModalOpen(true);
    } catch (error) {
      console.error('Error getting next steps:', error);
      // Fallback suggestion
      setSuggestion('Consider reviewing your recent sources to identify patterns or contradictions, then create notes to capture your insights.');
      setSuggestionModalOpen(true);
    } finally {
      setThinking(false);
    }
  };

  // File handler for upload
  const handleFile = useCallback(async (file: File) => {
    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append('file', file);
      
      // Forward to the same endpoint your splash page uses
      const res = await fetch('/api/upload', { 
        method: 'POST', 
        body: formData 
      });
      
      if (!res.ok) {
        throw new Error('Upload failed');
      }
      
      const data = await res.json();
      
      // Set file type
      const fileType = file.type.includes('pdf') 
        ? 'pdf' 
        : file.type.includes('image') 
          ? 'image' 
          : 'text';
      
      // Update app state
      setSourceContent(data.content);
      setSourceFile(file);
      setSourceType(fileType);
      
      if (data.metadata) {
        setMetadata(data.metadata);
      } else {
        // Create default metadata including the required researchGoals
        setMetadata({
          title: file.name || 'Untitled Document',
          author: 'Unknown',
          date: new Date().toLocaleDateString(),
          documentType: fileType,
          researchGoals: 'General analysis and understanding'
        });
      }
      
      // Navigate to analysis page
      router.push('/analysis');
    } catch (error) {
      console.error('Error handling file:', error);
      alert('Sorry, there was an error processing your file.');
      setIsLoading(false);
    }
  }, [router, setSourceContent, setSourceFile, setSourceType, setMetadata]);

  // Drag and drop handlers
  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!dragging) setDragging(true);
  };
  
  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
  };
  
  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  // Handle submission of text input
  const handleTextSubmit = async () => {
    if (!sourceText.trim()) return;
    
    try {
      setIsLoading(true);
      
      // Create metadata with required fields
      const metadata: Metadata = {
        title: sourceTitle || 'Untitled Document',
        author: 'Unknown',
        date: new Date().toLocaleDateString(),
        documentType: 'text',
        researchGoals: researchGoals || 'General analysis and understanding'
      };
      
      // Set app state
      setSourceContent(sourceText);
      setSourceType('text');
      setMetadata(metadata);
      
      // Navigate to analysis page
      router.push('/analysis');
    } catch (error) {
      console.error('Error handling text submission:', error);
      alert('Sorry, there was an error processing your text.');
      setIsLoading(false);
    }
  };

  // Handle opening a recent source
  const handleOpenSource = async (source: any) => {
    try {
      setIsLoading(true);
      
      // Update last accessed
      await updateSource(source.id, { lastAccessed: Date.now() });
      
      // Set app state
      setSourceContent(source.content);
      setSourceType(source.type);
      setMetadata(source.metadata);
      
      // Navigate to analysis page
      router.push('/analysis');
    } catch (error) {
      console.error('Error opening source:', error);
      alert('Sorry, there was an error opening this source.');
      setIsLoading(false);
    }
  };

  // Handle opening a note
  const handleOpenNote = async (note: any) => {
    try {
      setIsLoading(true);
      
      // Update last modified
      await updateNote(note.id, { lastModified: Date.now() });
      
      // Set active note
      setActiveNote(note);
      
      // Find the associated source if available
      const sourceId = note.sourceId;
      const sourceForNote = sources?.find(s => s.id === sourceId);
      
      if (sourceForNote) {
        // Use the actual source content if available
        setSourceContent(sourceForNote.content);
        setSourceType(sourceForNote.type);
        setMetadata(sourceForNote.metadata);
      } else if (note.sourceMetadata) {
        // Fallback to metadata only if source content not available
        setMetadata(note.sourceMetadata);
      }
      
      // Navigate to analysis page with note parameter
      router.push(`/analysis?note=${note.id}`);
    } catch (error) {
      console.error('Error opening note:', error);
      alert('Sorry, there was an error opening this note.');
      setIsLoading(false);
    }
  };

  // Card component for dashboard sections with improved styling
  const Card: React.FC<{
    title: string;
    children: React.ReactNode;
    href?: string;
    className?: string;
    iconSvg?: React.ReactNode;
    actionText?: string;
    onAction?: () => void;
  }> = ({ title, children, href, className = '', iconSvg, actionText, onAction }) => (
    <div
      className={`rounded-xl border shadow-sm ${
        darkMode 
          ? 'border-slate-700/80 bg-slate-800/80 text-slate-200' 
          : 'border-slate-200/80 bg-white text-slate-900'
      } p-5 relative ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold tracking-tight flex items-center gap-2">
          {iconSvg && <span className={darkMode ? 'text-indigo-400' : 'text-indigo-600'}>{iconSvg}</span>}
          {title}
        </h3>
        {(actionText && onAction) && (
          <button 
            onClick={onAction}
            className={`text-sm ${darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-700'} transition-colors`}
          >
            {actionText}
          </button>
        )}
      </div>
      {children}
      {href && (
        <div className="absolute inset-0 rounded-xl cursor-pointer" onClick={() => router.push(href)}></div>
      )}
    </div>
  );

  // Helper function to render source icon based on type
  const getSourceTypeIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        );
      case 'image':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
    }
  };

  // Apply theme classes based on dark mode
  const themeClasses = {
    background: darkMode ? 'bg-slate-900 text-slate-100' : 'bg-slate-50/10 text-slate-800',
    header: darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200',
    button: {
      primary: darkMode
        ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
        : 'bg-indigo-600 hover:bg-indigo-700 text-white',
      secondary: darkMode
        ? 'bg-slate-700 hover:bg-slate-600 text-slate-200 border-slate-600'
        : 'bg-white border border-slate-300 hover:border-slate-400 text-slate-700 hover:bg-slate-50'
    },
    input: darkMode
      ? 'bg-slate-700 border-slate-600 text-slate-200 placeholder-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
      : 'border border-slate-300 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500',
    accent: darkMode ? 'text-indigo-400' : 'text-indigo-600',
    muted: darkMode ? 'text-slate-400' : 'text-slate-600',
    border: darkMode ? 'border-slate-700' : 'border-slate-200',
    hover: darkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'
  };

  return (
    <div className={`min-h-screen ${themeClasses.background} flex flex-col transition-colors duration-200`}>
      {/* Enhanced header with user info */}
      <header className={`sticky top-0 z-30 flex items-center justify-between px-6 py-4 border-b ${themeClasses.header} transition-colors duration-200 backdrop-blur-sm bg-opacity-90`}>
        <div className="flex items-center gap-3">
          <div className="pl-2">
            <HamburgerMenu />
          </div>
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative w-10 h-10 overflow-hidden">
              <Image
                src="/sourcelenslogo.png"
                alt="SourceLens"
                fill
                className={`object-contain transition-transform group-hover:scale-110 ${!darkMode ? 'opacity-90 invert' : ''}`}
              />
            </div>
            <span className={`font-serif text-2xl ml-1 ${darkMode ? 'text-white' : 'text-slate-900'} group-hover:${themeClasses.accent} transition-colors`}>
              SourceLens
            </span>
          </Link>
        </div>
        
        <nav className="flex items-center gap-5 text-sm font-medium">
          <Link 
            href="/library"
            className={`hover:${themeClasses.accent} transition-colors hidden sm:block`}
          >
            Library
          </Link>
          <Link
            href="/analysis"
            className={`hover:${themeClasses.accent} transition-colors hidden sm:block`}
          >
            Analysis
          </Link>
          
          {/* Dark mode toggle */}
          <button 
            onClick={toggleDarkMode}
            className={`flex items-center justify-center w-8 h-8 rounded-full ${
              darkMode 
                ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            } transition-colors`}
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
          
          {/* User profile section */}
          <div className="flex items-center gap-2 ml-4 pl-4 border-l border-slate-200">
            <div
              onClick={() => setAccountPanelOpen(true)}
              className="cursor-pointer"
            >
              <AccountButton />
            </div>
          </div>
        </nav>
      </header>

      {/* Loading state for the entire dashboard */}
      {isLoading && (
        <div className={`fixed inset-0 flex items-center justify-center ${darkMode ? 'bg-slate-900/80' : 'bg-white/80'} z-50 backdrop-blur-sm`}>
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
            <p className={darkMode ? 'text-slate-300' : 'text-slate-600'}>Loading your dashboard...</p>
          </div>
        </div>
      )}

      {/* Main content with improved grid layout */}
      <main className="flex-1 px-6 py-8 w-full max-w-7xl mx-auto">
        {/* Welcome banner with personalization */}
        <div className={`mb-8 rounded-xl overflow-hidden relative ${darkMode ? 'bg-indigo-900/30' : 'bg-gradient-to-t from-slate-100/10 to-white'}`}>
          <div className="absolute inset-0 overflow-hidden opacity-10">
           
          </div>
          
          <div className="p-8 relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
            <div className="max-w-3xl">
              <h1 className={`text-2xl md:text-3xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
        Welcome back, {user?.user_metadata?.firstName || user?.email?.split('@')[0] || 'Researcher'}

              </h1>
              <p className={`${darkMode ? 'text-slate-200' : 'text-slate-800'} text-lg max-w-2xl leading-relaxed`}>
                Your research dashboard helps you quickly access sources, notes, and analyses. 
                Pick up where you left off or start something new.
              </p>
              
              <div className="flex flex-wrap gap-3 mt-5">
                <button
                  onClick={askNextSteps}
                  disabled={thinking}
                  className={`px-5 py-2.5 rounded-md ${themeClasses.button.primary}
                             text-sm font-medium transition-all disabled:opacity-50 flex items-center`}
                >
                  {thinking ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin mr-2"></div>
                      Thinking...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      AI Research Suggestions
                    </>
                  )}
                </button>
                <Link 
                  href="/library"
                  className={`px-5 py-2.5 rounded-md ${themeClasses.button.secondary}
                            text-sm font-medium transition-all flex items-center`}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  My Library
                </Link>
              </div>
            </div>
            
            {/* Stats summary */}
            <div className={`flex flex-wrap gap-3 bg-opacity-20 backdrop-blur-sm ${
              darkMode ? 'bg-slate-800/50' : 'bg-white/50'
            } rounded-xl p-3 border ${themeClasses.border}`}>
              <div className={`px-4 py-3 rounded-lg text-center min-w-[100px] ${
                darkMode ? 'bg-indigo-900/20 border border-indigo-900/30' : 'bg-slate-50/50 border border-slate-100'
              }`}>
                <p className={`text-3xl font-bold ${darkMode ? 'text-indigo-300' : 'text-indigo-700'}`}>
                  {statsData.sourcesCount}
                </p>
                <p className={`text-xs mt-1 ${darkMode ? 'text-indigo-200' : 'text-indigo-600'}`}>Sources</p>
              </div>
              
              <div className={`px-4 py-3 rounded-lg text-center min-w-[100px] ${
                darkMode ? 'bg-sky-900/20 border border-sky-900/30' : 'bg-slate-50/50 border border-slate-100'
              }`}>
                <p className={`text-3xl font-bold ${darkMode ? 'text-sky-300' : 'text-sky-700'}`}>
                  {statsData.notesCount}
                </p>
                <p className={`text-xs mt-1 ${darkMode ? 'text-sky-200' : 'text-sky-600'}`}>Notes</p>
              </div>
              
              <div className={`px-4 py-3 rounded-lg text-center min-w-[100px] ${
                darkMode ? 'bg-amber-900/20 border border-amber-900/30' : 'bg-slate-50/50 border border-slate-100'
              }`}>
                <p className={`text-3xl font-bold ${darkMode ? 'text-amber-300' : 'text-amber-700'}`}>
                  {statsData.analysesCount}
                </p>
                <p className={`text-xs mt-1 ${darkMode ? 'text-amber-200' : 'text-amber-600'}`}>Analyses</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main dashboard grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Start analysis card */}
          <Card 
            title="Start a new analysis"
            iconSvg={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            }
            className="lg:row-span-2"
          >
            <div className="space-y-4">
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setTextInputMode(false)}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                    !textInputMode 
                      ? darkMode 
                        ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-700/30'

                        : 'bg-indigo-100 text-indigo-800 borderbg- border-indigo-200'
                      : darkMode
                        ? 'bg-slate-700 text-slate-300 hover:bg-slate-600 border border-slate-600'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  Upload file
                </button>
                <button
                  onClick={() => setTextInputMode(true)}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                    textInputMode 
                      ? darkMode
                        ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-700/30'
                        : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                      : darkMode
                        ? 'bg-slate-700 text-slate-300 hover:bg-slate-600 border border-slate-600'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  Paste text
                </button>
              </div>
              
              {textInputMode ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Title (optional)"
                    value={sourceTitle}
                    onChange={(e) => setSourceTitle(e.target.value)}
                    className={`w-full p-2.5 rounded-md text-sm ${themeClasses.input}`}
                  />
                  <textarea
                    placeholder="Paste your text here..."
                    value={sourceText}
                    onChange={(e) => setSourceText(e.target.value)}
                    className={`w-full h-32 p-2.5 rounded-md text-sm resize-none ${themeClasses.input}`}
                  />
                  <div className="mb-1">
                    <label className={`block text-xs ${themeClasses.muted} mb-1`}>
                      Research goals (helps AI with analysis)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Understanding historical context"
                      value={researchGoals}
                      onChange={(e) => setResearchGoals(e.target.value)}
                      className={`w-full p-2.5 rounded-md text-sm ${themeClasses.input}`}
                    />
                  </div>
                  <button
                    onClick={handleTextSubmit}
                    disabled={!sourceText.trim()}
                    className={`w-full py-2.5 rounded-md ${themeClasses.button.primary}
                             text-sm font-medium transition-all disabled:opacity-50 flex items-center justify-center`}
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Start analysis
                  </button>
                </div>
              ) : (
                <div
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  onDrop={onDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex flex-col items-center justify-center h-[280px] rounded-lg border-2 border-dashed
                            transition-colors ${
                              dragging 
                                ? darkMode
                                  ? 'border-indigo-500 bg-indigo-900/20'
                                  : 'border-indigo-600 bg-indigo-50'
                                : darkMode
                                  ? 'border-slate-600 hover:border-slate-500'
                                  : 'border-slate-300 hover:border-slate-400'
                            } cursor-pointer`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFile(file);
                    }}
                    accept=".pdf,.txt,.docx,.jpg,.jpeg,.png"
                  />
                  <svg
                    className={`w-12 h-12 mb-4 ${dragging ? (darkMode ? 'text-indigo-300' : 'text-indigo-500') : (darkMode ? 'text-indigo-400' : 'text-indigo-600')}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3 3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <span className={`text-lg font-medium text-center max-w-xs select-none ${dragging ? (darkMode ? 'text-indigo-200' : 'text-indigo-700') : (darkMode ? 'text-slate-300' : 'text-slate-600')}`}>
                    {dragging ? 'Drop to analyze…' : 'Drag & drop or click to upload'}
                  </span>
                  <span className={`text-sm mt-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Supports PDF, TXT, DOCX, and images
                  </span>
                  
                  <div className="flex gap-2 mt-6">
                    <div className={`text-xs px-3 py-1 rounded-full ${darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                      PDF
                    </div>
                    <div className={`text-xs px-3 py-1 rounded-full ${darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                      DOCX
                    </div>
                    <div className={`text-xs px-3 py-1 rounded-full ${darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                      TXT
                    </div>
                    <div className={`text-xs px-3 py-1 rounded-full ${darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                      Images
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
          
          {/* Recent sources and notes */}
          <Card 
            title="Recent sources"
            iconSvg={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            }
            actionText={recentSources.length > 0 ? "View all" : undefined}
            onAction={recentSources.length > 0 ? () => router.push('/library?tab=sources') : undefined}
            className="lg:col-span-1"
          >
            {recentSources.length > 0 ? (
              <div className="space-y-3">
                {recentSources.slice(0, 3).map((source) => (
                  <div 
                    key={source.id}
                    onClick={() => handleOpenSource(source)}
                    className={`p-3 border rounded-lg cursor-pointer group transition-colors ${
                      darkMode 
                        ? 'border-slate-700 hover:bg-slate-700/50' 
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`${
                        darkMode 
                          ? 'bg-indigo-900/50 text-indigo-400' 
                          : 'bg-indigo-100 text-indigo-800'
                        } w-10 h-10 rounded-lg flex items-center justify-center shrink-0`}>
                        {getSourceTypeIcon(source.type)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className={`font-medium text-base truncate group-hover:${themeClasses.accent} transition-colors`}>
                          {source.metadata?.title || 'Untitled document'}
                        </h4>
                        <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'} truncate mt-1`}>
                          {source.metadata?.author || 'Unknown author'}
                          {source.metadata?.date && `, ${source.metadata.date}`}
                        </p>
                        <p className={`text-sm mt-1 ${darkMode ? 'text-slate-300' : 'text-slate-600'} line-clamp-1 leading-snug`}>
                          {source.content.substring(0, 100)}...
                        </p>
                      </div>
                      <div className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg className={`w-5 h-5 ${themeClasses.accent}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </div>
                    </div>
                  </div>
                ))}
                
                {recentSources.length > 3 && (
                  <div className="py-2 px-3 text-center">
                    <button
                      onClick={() => router.push('/library?tab=sources')}
                      className={`text-sm ${themeClasses.accent} hover:underline`}
                    >
                      View all {statsData.sourcesCount} sources →
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-10">
                <svg className={`w-12 h-12 mx-auto mb-4 ${darkMode ? 'text-slate-700' : 'text-slate-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <p className={`${darkMode ? 'text-slate-400' : 'text-slate-500'} text-base mb-5`}>
                  No sources yet
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className={`px-4 py-2 ${themeClasses.button.primary} rounded-md text-sm transition-colors`}
                >
                  Upload your first document
                </button>
              </div>
            )}
          </Card>
          
          <Card 
            title="Recent notes"
            iconSvg={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            }
            actionText={recentNotes.length > 0 ? "View all" : undefined}
            onAction={recentNotes.length > 0 ? () => router.push('/library?tab=notes') : undefined}
            className="lg:col-span-2"
          >
            {recentNotes.length > 0 ? (
              <div className={`divide-y ${darkMode ? 'divide-slate-700' : 'divide-slate-100'}`}>
                {recentNotes.map((note) => (
                  <div 
                    key={note.id}
                    onClick={() => handleOpenNote(note)}
                    className={`py-3 cursor-pointer hover:${darkMode ? 'bg-slate-700/50' : 'bg-slate-50'} px-3 rounded transition-colors group`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h4 className={`font-medium text-sm line-clamp-1 group-hover:${themeClasses.accent} transition-colors`}>
                        {note.sourceMetadata?.title 
                          ? `Note on: ${note.sourceMetadata.title}` 
                          : 'Note on untitled source'
                        }
                      </h4>
                      <span className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        {formatDistanceToNow(new Date(note.lastModified), { addSuffix: true })}
                      </span>
                    </div>
                    <p className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'} line-clamp-2 leading-relaxed`}>
                      {note.content}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <svg className={`w-12 h-12 mx-auto mb-4 ${darkMode ? 'text-slate-700' : 'text-slate-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <p className={`${darkMode ? 'text-slate-400' : 'text-slate-500'} text-base`}>
                  Notes you create will appear here
                </p>
              </div>
            )}
          </Card>
        </div>
        
        {/* Activity and features section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Activity feed */}
          <Card 
            title="Recent activity"
            iconSvg={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          >
            {activities.length > 0 ? (
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                      activity.type === 'source_added' 
                        ? darkMode ? 'bg-emerald-900/40 text-emerald-400' : 'bg-emerald-100 text-emerald-700' 
                        : activity.type === 'note_created'
                          ? darkMode ? 'bg-blue-900/40 text-blue-400' : 'bg-blue-100 text-blue-700'
                          : darkMode ? 'bg-purple-900/40 text-purple-400' : 'bg-purple-100 text-purple-700'
                    }`}>
                      {activity.type === 'source_added' ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      ) : activity.type === 'note_created' ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      )}
                    </div>
                    
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm font-medium ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                        {activity.title}
                      </p>
                      <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className={`${darkMode ? 'text-slate-400' : 'text-slate-500'} text-sm py-6 text-center`}>
                No activity recorded yet. Start analyzing documents to build your activity feed.
              </p>
            )}
          </Card>
          
          {/* Coming soon features */}
          <Card 
            title="Coming soon"
            iconSvg={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
            }
            className="lg:col-span-1"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`p-4 rounded-lg border ${themeClasses.border} transition-all hover:scale-[1.02] duration-200`}>
                <div className={`p-2 rounded-md w-10 h-10 flex items-center justify-center mb-3 ${
                  darkMode ? 'bg-indigo-900/30 text-indigo-400' : 'bg-indigo-100 text-indigo-700'
                }`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h4 className={`text-base font-medium mb-1 ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                  Sentiment analysis
                </h4>
                <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Visually annotate alterations in sentiment or theme in a source, while also extracting quantiative, structured data about sentiment, mood, tone and topic that can be fed back into an LLM or used as the basis for further research. 
                </p>
              </div>
              
              <div className={`p-4 rounded-lg border ${themeClasses.border} transition-all hover:scale-[1.02] duration-200`}>
                <div className={`p-2 rounded-md w-10 h-10 flex items-center justify-center mb-3 ${
                  darkMode ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                </div>
                <h4 className={`text-base font-medium mb-1 ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                  "Biography mode"
                </h4>
                <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Extract all references to people mentioned in a text, then save, tag, and organize them across sources. Potentially, an AI agent with web access could be capable of performing basic research into biographies and filling it in behind the scenes, potentially suggesting new connections between historical figures.
                </p>
              </div>
              
              <div className={`p-4 rounded-lg border ${themeClasses.border} transition-all hover:scale-[1.02] duration-200`}>
                <div className={`p-2 rounded-md w-10 h-10 flex items-center justify-center mb-3 ${
                  darkMode ? 'bg-amber-900/30 text-amber-400' : 'bg-amber-100 text-amber-700'
                }`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h4 className={`text-base font-medium mb-1 ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                  Improved suggestions
                </h4>
                <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  The AI suggestions button is a prototype. Theoretically, feeding an LLM a collection of dozens or hundreds of sources, along with notes, tags, and metadata, could be extremely powerful for getting custom feedback on a research project.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </main>

      {/* Enhanced footer */}
      <footer className={`mt-auto px-6 py-6 border-t ${themeClasses.border} transition-colors duration-200`}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <Image
              src="/sourcelenslogo.png"
              alt="SourceLens"
              width={24}
              height={24}
              className={`mr-2 ${!darkMode ? 'opacity-80 invert' : ''}`}
            />
            <span className={darkMode ? 'text-slate-300 font-medium' : 'text-slate-700 font-medium'}>
              SourceLens
            </span>
            <span className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-500'} ml-2`}>
              © {new Date().getFullYear()}
            </span>
          </div>
          
          <div className={`flex gap-6 text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            <a href="/privacy" className={`hover:${themeClasses.accent} transition-colors`}>Privacy</a>
            <a href="/terms" className={`hover:${themeClasses.accent} transition-colors`}>Terms</a>
            <a href="/contact" className={`hover:${themeClasses.accent} transition-colors`}>Contact</a>
            <a href="/help" className={`hover:${themeClasses.accent} transition-colors`}>Help</a>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {accountPanelOpen && (
        <AccountPanel 
          isOpen={accountPanelOpen} 
          onClose={() => setAccountPanelOpen(false)} 
        />
      )}

      {/* Suggestion Modal */}
      {suggestionModalOpen && (
        <SuggestionModal
          isOpen={suggestionModalOpen}
          onClose={() => setSuggestionModalOpen(false)}
          suggestion={suggestion}
          darkMode={darkMode}
        />
      )}
    </div>
  );
}