// components/notes/NotesListPanel.tsx
// Enhanced panel for displaying notes in the library view with improved source linking
// - Handles both UUID-based and string-based source IDs
// - Provides fallback mechanisms for broken links between notes and sources
// - Efficiently loads notes and sources with proper error handling

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore, Metadata } from '@/lib/store';
import { useLibraryStorage } from '@/lib/libraryStorageProvider';
import { Note, SavedSource } from '@/lib/libraryContext';
import { useAuth } from '@/lib/auth/authContext';

// Define PartialNote type for list view efficiency
type PartialNote = Omit<Note, 'content'>;

interface NotesListPanelProps {
  darkMode?: boolean;
}

export default function NotesListPanel({ darkMode = false }: NotesListPanelProps) {
  const router = useRouter();
  const { user } = useAuth();
  const {
    setSourceContent,
    setMetadata,
    setActivePanel,
    setSourceType,
    setSourceThumbnailUrl,
    setNotePanelVisible,
    setActiveNote,
    setLoading,
  } = useAppStore();

  // Use storage hooks for efficient data access
  const { 
    getItems, 
    getFullItem, 
    deleteItem, 
    isPersistent, 
    isLoading: storageLoading,
    clearCache,
  } = useLibraryStorage();

  // State for notes list and UI
  const [notes, setNotes] = useState<PartialNote[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<PartialNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'modified' | 'created' | 'alphabetical'>('modified');
  const [viewNote, setViewNote] = useState<Note | null>(null);
  const [isLoadingFullNote, setIsLoadingFullNote] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  
  // New state for tracking source loading
  const [loadingSourceId, setLoadingSourceId] = useState<string | null>(null);
  const [sourcesCache, setSourcesCache] = useState<Record<string, SavedSource>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load notes list on mount
  useEffect(() => {
    const loadNotes = async () => {
      try {
        setIsLoading(true);
        // Fetch partial notes (metadata only)
        const partialNotesData = await getItems<PartialNote>('notes');
        const validNotes: PartialNote[] = Array.isArray(partialNotesData) 
  ? partialNotesData.filter((note): note is PartialNote => 
      note !== null && 
      typeof note === 'object' && 
      typeof note.id === 'string' && 
      note.id !== '')
  : [];
        
        console.log(`Loaded ${validNotes.length} notes metadata entries`);
        setNotes(validNotes);
        setFilteredNotes(validNotes);
      } catch (error) {
        console.error('Error loading notes list:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!storageLoading) {
      loadNotes();
    } else {
      setIsLoading(true);
    }
  }, [getItems, storageLoading]);

  // Update loading state based on storageLoading from provider
  useEffect(() => {
    setIsLoading(storageLoading);
  }, [storageLoading]);

  // Filter and sort notes when criteria change
  useEffect(() => {
    let result = [...notes];

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(note =>
        (note.sourceMetadata?.title && note.sourceMetadata.title.toLowerCase().includes(searchLower)) ||
        (note.sourceMetadata?.author && note.sourceMetadata.author.toLowerCase().includes(searchLower)) ||
        (Array.isArray(note.tags) && note.tags.some(tag => tag.toLowerCase().includes(searchLower)))
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'modified': return (b.lastModified || 0) - (a.lastModified || 0);
        case 'created': return (b.dateCreated || 0) - (a.dateCreated || 0);
        case 'alphabetical':
          const titleA = a.sourceMetadata?.title || '';
          const titleB = b.sourceMetadata?.title || '';
          return titleA.localeCompare(titleB);
        default: return 0;
      }
    });

    setFilteredNotes(result);
  }, [notes, searchTerm, sortBy]);

  // Format date for display
  const formatDate = (timestamp: number | undefined): string => {
    if (!timestamp) return 'N/A';
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      return date.toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      console.warn("Error formatting date:", timestamp, e);
      return 'Invalid Date';
    }
  };

  // Get time elapsed in human-readable format
  const getTimeElapsed = (timestamp: number | undefined): string => {
    if (!timestamp) return '-';
    try {
      const now = Date.now();
      const diff = now - timestamp;
      if (diff < 0 || isNaN(diff)) return '-';
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);
      const months = Math.floor(days / 30);
      const years = Math.floor(days / 365);

      if (years > 0) return `${years}y ago`;
      if (months > 0) return `${months}mo ago`;
      if (days > 0) return `${days}d ago`;
      if (hours > 0) return `${hours}h ago`;
      if (minutes > 0) return `${minutes}m ago`;
      return 'Just now';
    } catch(e) {
      console.warn("Error calculating time elapsed:", timestamp, e);
      return '-';
    }
  };

  // Fetches full note before opening modal
  const handleOpenNoteModal = async (noteId: string) => {
    if (!noteId) {
      console.error("handleOpenNoteModal called with invalid ID");
      return;
    }
    setIsLoadingFullNote(true);
    setViewNote(null);
    setErrorMessage(null);
    try {
      console.log(`Fetching full note content for ID: ${noteId}`);
      const fullNote = await getFullItem<Note>('notes', noteId);
      if (fullNote) {
        console.log(`Successfully fetched full note:`, fullNote);
        setViewNote(fullNote);
      } else {
        console.error(`Full note with ID ${noteId} not found.`);
        setErrorMessage("Could not load the full note details.");
      }
    } catch (error) {
      console.error("Error fetching full note:", error);
      setErrorMessage("Failed to load note details.");
    } finally {
      setIsLoadingFullNote(false);
    }
  };

  // View note's source in analysis page with improved source handling
  const handleViewSource = async (note: Note | PartialNote) => {
    setLoading(true);
    setViewNote(null);
    setErrorMessage(null);
    setLoadingSourceId(note.sourceId);
    
    try {
      // --- Step 1: Get the sourceId and validate it ---
      const sourceIdToFind = note?.sourceId;
      
      if (!sourceIdToFind || typeof sourceIdToFind !== 'string') {
        throw new Error(`Note (ID: ${note?.id || 'unknown'}) is missing a valid source document ID.`);
      }
      
      console.log(`Attempting to fetch source with ID: ${sourceIdToFind} for note ${note.id}`);
      
      // --- Step 2: Check if the source is already in our cache ---
      if (sourcesCache[sourceIdToFind]) {
        console.log("Using cached source:", sourcesCache[sourceIdToFind]);
        const cachedSource = sourcesCache[sourceIdToFind];
        
        // Validate cached content
        if (cachedSource.content !== undefined && cachedSource.content !== null) {
          navigateToSource(cachedSource, note);
          return;
        }
      }
      
      // --- Step 3: Try to fetch the source by exact ID first ---
      try {
        const source = await getFullItem<SavedSource>('sources', sourceIdToFind);
        
        if (source && source.content) {
          // Store in cache for future use
          setSourcesCache(prev => ({ ...prev, [sourceIdToFind]: source }));
          navigateToSource(source, note);
          return;
        }
      } catch (exactIdError) {
        console.log("Could not fetch by exact ID, trying fallback methods:", exactIdError);
        // Continue to fallback methods
      }
      
      // --- Step 4: Fallback: Try to find source by matching title ---
      if (note.sourceMetadata?.title) {
        console.log("Trying to find source by title match:", note.sourceMetadata.title);
        
        // Get all sources (just metadata)
        const allSources = await getItems<SavedSource>('sources');
        
        // Find by exact title match
        const matchingSource = allSources.find(source => 
          source.metadata?.title === note.sourceMetadata?.title
        );
        
        if (matchingSource?.id) {
          console.log("Found source with matching title:", matchingSource.id);
          
          // Get the full source with content
          const fullMatchingSource = await getFullItem<SavedSource>('sources', matchingSource.id);
          
          if (fullMatchingSource && fullMatchingSource.content) {
            // Cache it and navigate
            setSourcesCache(prev => ({ ...prev, [sourceIdToFind]: fullMatchingSource }));
            navigateToSource(fullMatchingSource, note);
            return;
          }
        }
      }
      
      // --- Step 5: If all else fails, try a partial title match ---
      if (note.sourceMetadata?.title) {
        console.log("Trying partial title match for:", note.sourceMetadata.title);
        
        const allSources = await getItems<SavedSource>('sources');
        const titleToMatch = note.sourceMetadata.title.toLowerCase();
        
        // Find by partial title match (first 10 chars)
        const partialMatch = allSources.find(source => {
          const sourceTitle = source.metadata?.title?.toLowerCase() || '';
          return sourceTitle.includes(titleToMatch.substring(0, 10));
        });
        
        if (partialMatch?.id) {
          console.log("Found source with partial title match:", partialMatch.id);
          
          const fullPartialMatch = await getFullItem<SavedSource>('sources', partialMatch.id);
          
          if (fullPartialMatch && fullPartialMatch.content) {
            setSourcesCache(prev => ({ ...prev, [sourceIdToFind]: fullPartialMatch }));
            navigateToSource(fullPartialMatch, note);
            return;
          }
        }
      }
      
      // If we got here, we couldn't find a matching source
      throw new Error(`Source document not found using any method (original ID: ${sourceIdToFind}).`);
      
    } catch (error) {
      console.error("Error in handleViewSource:", error);
      setErrorMessage(
        `Could not load the source for this note. ${error instanceof Error ? error.message : ''}\n\n` +
        `The note might be referencing a source that was deleted or is no longer available.`
      );
    } finally {
      setLoading(false);
      setLoadingSourceId(null);
    }
  };

  // Function to navigate to source with error handling
  const navigateToSource = (source: SavedSource, note: Note | PartialNote) => {
    console.log("Source found, setting state and navigating.", source);
    
    setSourceContent(source.content);
    setMetadata(source.metadata);
    setSourceType(source.type ?? 'text');
    setSourceThumbnailUrl(source.thumbnailUrl ?? null);
    
    // Set active note with async loading if needed
    if ('content' in note) {
      console.log("Setting active note from full note:", note);
      setActiveNote(note as Note);
      setNotePanelVisible(true);
    } else {
      // If we don't have the full note yet, fetch it
      console.log("Fetching full note for ID:", note.id);
      
      getFullItem<Note>('notes', note.id)
        .then(fullNote => {
          if (fullNote) {
            console.log("Setting active note from fetched note:", fullNote);
            setActiveNote(fullNote);
            setNotePanelVisible(true);
          } else {
            // If we can't get the full note, try to reconstruct it
            console.log("Could not fetch full note, creating placeholder");
            const placeholderNote: Note = {
              id: note.id,
              content: "Note content could not be loaded. Please try again.",
              sourceId: source.id, // Use the UUID we now have
              sourceMetadata: note.sourceMetadata || source.metadata,
              dateCreated: note.dateCreated || Date.now(),
              lastModified: note.lastModified || Date.now(),
              tags: note.tags || [],
              userId: note.userId || user?.id || ''
            };
            setActiveNote(placeholderNote);
            setNotePanelVisible(true);
          }
        })
        .catch(err => {
          console.error("Error fetching full note for navigation:", err);
          // Still navigate, but with an error message
          alert("Note content could not be loaded: " + (err?.message || "Unknown error"));
        });
    }
    
    setActivePanel('analysis');
    router.push('/analysis');
  };

  // Delete note handler
  const handleDeleteNote = async (noteId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (window.confirm('Are you sure you want to delete this note? This cannot be undone.')) {
      try {
        setIsDeleting(noteId);
        await deleteItem('notes', noteId);
        setNotes(prev => prev.filter(note => note.id !== noteId));
      } catch (error) {
        console.error('Error deleting note:', error);
        setErrorMessage('Failed to delete note. Please try again.');
      } finally {
        setIsDeleting(null);
      }
    }
  };

  // Get title from source metadata or use a fallback
  const getNoteTitle = (note: PartialNote): string => {
    return note.sourceMetadata?.title || 'Untitled Note';
  };

  // Generate tag color classes based on darkMode
  const getTagColorClasses = (index: number, darkMode: boolean): string => {
    const colors = [
      ['bg-indigo-100 text-indigo-800', 'bg-indigo-900/30 text-indigo-300'],
      ['bg-emerald-100 text-emerald-800', 'bg-emerald-900/30 text-emerald-300'],
      ['bg-amber-100 text-amber-800', 'bg-amber-900/30 text-amber-300'],
      ['bg-rose-100 text-rose-800', 'bg-rose-900/30 text-rose-300'],
      ['bg-cyan-100 text-cyan-800', 'bg-cyan-900/30 text-cyan-300'],
      ['bg-pink-100 text-pink-800', 'bg-pink-900/30 text-pink-300'],
      ['bg-lime-100 text-lime-800', 'bg-lime-900/30 text-lime-300'],
    ];
    const colorIndex = index % colors.length;
    return darkMode ? colors[colorIndex][1] : colors[colorIndex][0];
  };

  // Refresh notes data
  const refreshNotes = useCallback(async () => {
    setIsLoading(true);
    try {
      // Clear the cache first to ensure fresh data
      clearCache('notes');
     const freshNotes = await getItems<PartialNote>('notes', true);
setNotes(Array.isArray(freshNotes) 
  ? freshNotes.filter((note): note is PartialNote => 
      note !== null && 
      typeof note === 'object' && 
      typeof note.id === 'string' && 
      note.id !== '')
  : []);
    } catch (error) {
      console.error("Error refreshing notes:", error);
    } finally {
      setIsLoading(false);
    }
  }, [getItems, clearCache]);

  // Loading state UI
  if (isLoading) {
    return (
      <div className={`h-[400px] flex flex-col items-center justify-center ${darkMode ? 'bg-slate-800' : 'bg-slate-50'} rounded-lg`}>
        <div className="w-10 h-10 border-t-2 border-b-2 border-indigo-500 rounded-full animate-spin mb-4"></div>
        <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Loading notes...</p>
      </div>
    );
  }

  // Empty state UI
  if (notes.length === 0) {
    return (
      <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} shadow-sm rounded-lg border overflow-hidden`}>
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <svg className={`w-16 h-16 ${darkMode ? 'text-slate-600' : 'text-slate-300'} mb-4`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
          <h3 className={`text-lg font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'} mb-1`}>No notes yet</h3>
          <p className={`${darkMode ? 'text-slate-400' : 'text-slate-500'} max-w-md`}>Notes you create when analyzing sources will appear here.</p>
          <button onClick={() => router.push('/')} className={`mt-6 px-4 py-2 ${darkMode ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-indigo-600 hover:bg-indigo-700'} text-white rounded-md transition-colors shadow-sm flex items-center`}>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            Upload New Source
          </button>
        </div>
      </div>
    );
  }

  // Main Panel Render
  return (
    <>
      <div className={`${darkMode ? 'bg-slate-900' : 'bg-white'} rounded-lg shadow-sm ${darkMode ? 'border-slate-700' : 'border border-slate-200'} overflow-hidden`}>
        {/* Header with controls */}
        <div className={`p-3 ${darkMode ? 'bg-slate-800 border-b border-slate-700' : 'bg-white border-b border-slate-200'} sticky top-0 z-10 backdrop-blur-sm`}>
          <div className="flex flex-wrap justify-between items-center gap-3">
            {/* Header Title */}
            <h2 className={`text-lg ${darkMode ? 'text-slate-200' : 'text-slate-800'} flex items-center`}>
              <svg className={`w-5 h-5 mr-2 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              <span className="mr-2 font-medium">Research Notes</span>
              <span className={`text-xs ${darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'} px-2 py-0.5 rounded-full`}>{notes.length}</span>
              <span className={`ml-2 text-xs ${darkMode ? 'bg-indigo-800/50 text-indigo-200' : 'bg-indigo-100 text-indigo-800'} px-2 py-0.5 rounded-full`}>{isPersistent ? 'Cloud' : 'Local'}</span>
            </h2>
            
            {/* Refresh Button */}
            <button 
              onClick={refreshNotes}
              className={`p-1.5 rounded-full ${darkMode ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200'} transition-colors`}
              title="Refresh notes"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            
            {/* Search Input */}
            <div className="flex flex-1 md:flex-none md:ml-2">
              <div className="relative w-full md:w-auto">
                <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none"><svg className={`h-4 w-4 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg></div>
                <input type="text" placeholder="Search notes..." className={`pl-8 p-1.5 w-full md:w-52 lg:w-64 ${darkMode ? 'bg-slate-700 text-slate-200 placeholder-slate-400 border-slate-600 focus:border-indigo-500' : 'bg-slate-100 text-slate-800 placeholder-slate-500 border-slate-200 focus:border-indigo-500'} text-sm rounded border focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                {searchTerm && (<button className={`absolute inset-y-0 right-0 pr-2 flex items-center ${darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700'}`} onClick={() => setSearchTerm('')}><svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>)}
              </div>
            </div>
            
            {/* Sort Dropdown */}
            <div className="flex items-center space-x-2">
              <div className="relative">
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className={`p-1.5 text-xs ${darkMode ? 'bg-slate-700 text-slate-200 border-slate-600' : 'bg-white text-slate-800 border-slate-200'} rounded border focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors shadow-sm appearance-none pl-2 pr-8`}>
                  <option value="modified">Recently Modified</option>
                  <option value="created">Recently Created</option>
                  <option value="alphabetical">By Source Title</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2"><svg className={`w-4 h-4 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></div>
              </div>
            </div>
          </div>
        </div>

        {/* Notes Grid */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 ${darkMode ? 'bg-slate-900' : 'bg-slate-50/50'}`}>
          {filteredNotes.length === 0 ? (
            <div className={`col-span-full py-8 text-center ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              <svg className="w-12 h-12 mx-auto mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <p className="mb-2">No matching notes found.</p>
              <button onClick={() => setSearchTerm('')} className={`text-xs ${darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-700'} hover:underline`}>Clear search</button>
            </div>
          ) : (
            filteredNotes.map((note) => (
              <div
                key={note.id}
                onClick={() => handleOpenNoteModal(note.id)}
                className={`group ${darkMode ? 'bg-slate-800 border border-slate-700 hover:bg-slate-700/80 hover:border-slate-600' : 'bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300'} rounded-lg overflow-hidden cursor-pointer shadow-sm hover:shadow transition duration-200 transform hover:-translate-y-1 ${isDeleting === note.id || loadingSourceId === note.sourceId ? 'opacity-50 pointer-events-none' : ''}`}
              >
                {/* Note header */}
                <div className={`p-3 border-b ${darkMode ? 'border-slate-700/50' : 'border-slate-100'}`}>
                  <h3 className={`font-medium ${darkMode ? 'text-slate-200' : 'text-slate-800'} mb-1 line-clamp-1 group-hover:text-indigo-500 transition-colors duration-200`}>
                    {getNoteTitle(note)}
                  </h3>
                  <div className="flex items-center justify-between text-xs">
                    <div className={`${darkMode ? 'text-slate-400' : 'text-slate-500'} flex items-center`}><svg className="w-3 h-3 mr-1 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>{getTimeElapsed(note.lastModified)}</div>
                    {note.sourceMetadata?.author && (<div className={`${darkMode ? 'text-slate-400' : 'text-slate-500'} truncate max-w-[50%] flex items-center`}><svg className="w-3 h-3 mr-1 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>{note.sourceMetadata.author}</div>)}
                  </div>
                </div>

                {/* Placeholder/Metadata instead of content excerpt */}
                <div className={`px-3 pt-3 pb-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'} text-sm min-h-[40px]`}>
                  {note.sourceMetadata?.author ? (
                    <p className="line-clamp-1 text-xs italic">Source: {note.sourceMetadata.author}</p>
                  ) : (
                    <p className="italic text-xs">[Click to view note]</p>
                  )}
                </div>


                {/* Tags */}
                {note.tags && note.tags.length > 0 && (
                  <div className="px-3 pb-3 flex flex-wrap gap-1">
                    {note.tags.slice(0, 3).map((tag, idx) => (<span key={idx} className={`px-2 py-0.5 text-xs rounded-full ${getTagColorClasses(idx, darkMode)}`}>{tag}</span>))}
                    {note.tags.length > 3 && (<span className={`px-2 py-0.5 text-xs rounded-full ${darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-600'}`}>+{note.tags.length - 3}</span>)}
                  </div>
                )}

                {/* Footer with actions */}
                <div className={`flex border-t ${darkMode ? 'border-slate-700/50 divide-x divide-slate-700/50' : 'border-slate-100 divide-x divide-slate-100'}`}>
                 <button onClick={(e) => { e.stopPropagation(); handleViewSource(note); }} className={`flex-1 p-1.5 ${darkMode ? 'text-indigo-400 hover:text-indigo-300 hover:bg-slate-700/70' : 'text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50/80'} text-xs flex items-center justify-center transition-colors`}>
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    View Source
                  </button>
                  <div className={`h-full w-px ${darkMode ? 'bg-slate-700/50' : 'bg-slate-200'}`}></div>
                  <button onClick={(e) => handleDeleteNote(note.id, e)} className={`flex-1 p-1.5 ${darkMode ? 'text-slate-400 hover:text-red-400 hover:bg-slate-700/70' : 'text-slate-500 hover:text-red-600 hover:bg-slate-100'} text-xs flex items-center justify-center transition-colors`} disabled={isDeleting === note.id}>
                    {isDeleting === note.id ? ( <span className="flex items-center"><div className="w-3 h-3 border-t-2 border-r-2 border-red-400 rounded-full animate-spin mr-1"></div>Deleting...</span>)
                     : (<><svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>Delete</>)}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Note View Modal - Renders full note when viewNote is set */}
      {viewNote && !isLoadingFullNote && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-xl border shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col transform transition-all duration-300 ease-out`} onClick={(e) => e.stopPropagation()}>
            {/* Modal header */}
            <div className={`p-4 border-b ${darkMode ? 'border-slate-700 bg-slate-800/80' : 'border-slate-200 bg-slate-50/80'} sticky top-0 backdrop-blur-sm flex items-center justify-between`}>
               <div className="flex-1 min-w-0">
                 <h3 className={`font-medium ${darkMode ? 'text-slate-100' : 'text-slate-800'} text-lg truncate`}>{getNoteTitle(viewNote)}</h3>
                 <div className="flex flex-wrap items-center mt-1 gap-y-1">
                   <div className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'} flex items-center`}><svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>{formatDate(viewNote.lastModified)}</div>
                   {viewNote.sourceMetadata?.author && (<><span className="mx-2 text-slate-400">•</span><div className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'} truncate flex items-center`}><svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>{viewNote.sourceMetadata.author}</div></>)}
                   {viewNote.sourceMetadata?.date && (<><span className="mx-2 text-slate-400">•</span><div className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'} truncate flex items-center`}><svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>{viewNote.sourceMetadata.date}</div></>)}
                 </div>
               </div>
               <button onClick={() => setViewNote(null)} className={`${darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700'} ml-4 transition-colors focus:outline-none focus:ring-2 rounded-full focus:ring-indigo-500 p-1`} aria-label="Close"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            {/* Modal content */}
            <div className="flex-1 overflow-y-auto p-4">
              {viewNote.tags && viewNote.tags.length > 0 && ( <div className="mb-4 flex flex-wrap gap-1.5 items-center"><span className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'} mr-1`}>Tags:</span>{viewNote.tags.map((tag, idx) => (<span key={idx} className={`px-2 py-0.5 text-xs rounded-full ${getTagColorClasses(idx, darkMode)}`}>{tag}</span>))}</div> )}
              <div className={`prose ${darkMode ? 'prose-invert' : ''} max-w-none`}>
                <div className={`whitespace-pre-wrap ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  {/* Display full content */}
                  {viewNote.content || <span className="italic text-slate-500">[Note content is empty]</span>}
                </div>
              </div>
            </div>
            {/* Modal footer */}
            <div className={`p-4 border-t ${darkMode ? 'border-slate-700 bg-slate-800/90' : 'border-slate-200 bg-slate-50/90'} backdrop-blur-sm sticky bottom-0`}>
              <div className="flex justify-between">
                <button onClick={() => handleViewSource(viewNote)} className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'} flex items-center font-medium shadow-sm transition-colors`}>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                  View Source & Edit Note
                </button>
                <button onClick={() => setViewNote(null)} className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-slate-700 hover:bg-slate-600 text-slate-200' : 'bg-slate-200 hover:bg-slate-300 text-slate-800'} font-medium shadow-sm transition-colors`}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Loading indicator for full note fetch */}
      {isLoadingFullNote && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[51]">
          <div className="w-10 h-10 border-t-2 border-b-2 border-indigo-500 rounded-full animate-spin"></div>
        </div>
      )}
      
      {/* Error message modal */}
      {errorMessage && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-lg border shadow-xl w-full max-w-md p-6`}>
            <h3 className={`text-lg font-medium mb-3 ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
              <svg className="w-5 h-5 inline-block mr-2 -mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Error
            </h3>
            <p className={`mb-5 ${darkMode ? 'text-slate-300' : 'text-slate-600'} whitespace-pre-line`}>{errorMessage}</p>
            <div className="flex justify-end">
              <button 
                onClick={() => setErrorMessage(null)} 
                className={`px-4 py-2 rounded-md ${darkMode ? 'bg-slate-700 hover:bg-slate-600 text-slate-200' : 'bg-slate-200 hover:bg-slate-300 text-slate-800'} text-sm font-medium transition-colors`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}