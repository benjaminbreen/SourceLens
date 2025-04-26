// components/library/SavedSourcesPanel.tsx
// Database-style panel for managing library sources with Supabase integration
// Features quick source loading, metadata editing, document preview, and advanced filtering

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore, Metadata, Note } from '@/lib/store';  // Added Note to imports
import { useLibraryStorage } from '@/lib/libraryStorageProvider';
import { useAuth } from '@/lib/auth/authContext';
import DocumentPortraitModal from '../ui/DocumentPortraitModal';
import Image from 'next/image';
import NotesSection from '../notes/NotesSection';

// Interface for saved source
interface SavedSource {
  id: string;
  content: string;
  metadata: Metadata;
  dateAdded: number;
  type: 'text' | 'pdf' | 'image';
  lastAccessed?: number;
  tags?: string[];
  category?: string;
  thumbnailUrl?: string;
  userId?: string;
}

export default function SavedSourcesPanel({ darkMode }: { darkMode: boolean }) {
  const router = useRouter();
  const { 
    setSourceContent, 
    setMetadata, 
    setLoading, 
    setActivePanel, 
    setSourceType,
    setSourceThumbnailUrl,
    setActiveNote,
  } = useAppStore();
  
  const { user } = useAuth();
  const { getItems, updateItem, deleteItem, saveItem, isPersistent, isLoading: storageLoading } = useLibraryStorage();
  
  const [sources, setSources] = useState<SavedSource[]>([]);
  const [sourceNotes, setSourceNotes] = useState<Record<string, Note[]>>({});
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'dateAdded' | 'lastAccessed' | 'name'>('dateAdded');
  const [displayMode, setDisplayMode] = useState<'grid' | 'table'>('grid');


  // State for document portrait modal
  const [portraitModalOpen, setPortraitModalOpen] = useState(false);
  const [portraitModalSource, setPortraitModalSource] = useState<SavedSource | null>(null);
  
  // State for metadata editing
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentEditSource, setCurrentEditSource] = useState<SavedSource | null>(null);
  const [editForm, setEditForm] = useState({
    author: '',
    title: '',
    date: '',
    category: '',
    tags: ''
  });
  
  // Load saved sources from storage provider on mount
  useEffect(() => {
    const loadSavedSources = async () => {
      try {
        setIsLoading(true);
        const savedSourcesData = await getItems<SavedSource>('sources');
        setSources(savedSourcesData);
        
        // Also load all notes to map them to sources
        loadAllNotes();
      } catch (error) {
        console.error('Error loading saved sources:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!storageLoading) {
      loadSavedSources();
    }
  }, [getItems, storageLoading]);

  // Load all notes and organize them by sourceId
  const loadAllNotes = async () => {
    try {
      const allNotes = await getItems<Note>('notes');
      
      // Create a map of sourceId -> notes array
      const notesMap: Record<string, Note[]> = {};
      
      allNotes.forEach(note => {
        if (note.sourceId) {
          if (!notesMap[note.sourceId]) {
            notesMap[note.sourceId] = [];
          }
          notesMap[note.sourceId].push(note);
        }
        
        // Also try to match by metadata if sourceId doesn't match directly
        if (note.sourceMetadata?.title && note.sourceMetadata?.author) {
          sources.forEach(source => {
            if (
              source.metadata?.title === note.sourceMetadata.title &&
              source.metadata?.author === note.sourceMetadata.author
            ) {
              if (!notesMap[source.id]) {
                notesMap[source.id] = [];
              }
              // Only add if not already added
              if (!notesMap[source.id].some(n => n.id === note.id)) {
                notesMap[source.id].push(note);
              }
            }
          });
        }
      });
      
      setSourceNotes(notesMap);
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  };

  // Get all unique categories
  const categories = useMemo(() => 
    ['all', ...new Set(sources.map(source => source.category || 'Uncategorized'))],
    [sources]
  );

  // Filter sources based on search and category
  const filteredSources = useMemo(() => sources.filter(source => {
    // Category filter
    if (categoryFilter !== 'all' && source.category !== categoryFilter) {
      return false;
    }
    
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        (source.metadata?.author || '').toLowerCase().includes(searchLower) ||
        (source.metadata?.date || '').toLowerCase().includes(searchLower) ||
        (source.metadata?.title || '').toLowerCase().includes(searchLower) ||
        (source.content && source.content.substring(0, 500).toLowerCase().includes(searchLower)) ||
        (Array.isArray(source.tags) && source.tags.some(tag => tag.toLowerCase().includes(searchLower)))
      );
    }
    
    return true;
  }), [sources, categoryFilter, searchTerm]);

  // Sort filtered sources
  const sortedSources = useMemo(() => 
    [...filteredSources].sort((a, b) => {
      switch (sortBy) {
        case 'dateAdded':
          return b.dateAdded - a.dateAdded;
        case 'lastAccessed':
          const aAccessed = a.lastAccessed || a.dateAdded;
          const bAccessed = b.lastAccessed || b.dateAdded;
          return bAccessed - aAccessed;
        case 'name': 
          return (a.metadata?.author || '').localeCompare(b.metadata?.author || '');
        default:
          return 0;
      }
    }), 
    [filteredSources, sortBy]
  );

  // Load source into the analysis page
  const handleLoadSource = async (source: SavedSource) => {
    setLoading(true);
    
    try {
      // Update the source's last accessed time
      const updatedSource = { ...source, lastAccessed: Date.now() };
      
      // Update in storage
      await updateItem<SavedSource>('sources', source.id, { lastAccessed: Date.now() });
      
      // Update local state
      setSources(prev => prev.map(s => s.id === source.id ? updatedSource : s));
      
      // Set the source content and metadata in the app store
      setSourceContent(source.content);
      setMetadata(source.metadata);
      setSourceType(source.type);
      
      // Set thumbnail URL if available
      if (source.thumbnailUrl) {
        setSourceThumbnailUrl(source.thumbnailUrl);
      }
      
      // Find associated notes and set the first one as active if it exists
      try {
        const sourceNotesArray = sourceNotes[source.id] || [];
        if (sourceNotesArray.length > 0) {
          // Set the first note as active
          setActiveNote(sourceNotesArray[0]);
        } else {
          // Clear any active note
          setActiveNote(null);
        }
      } catch (error) {
        console.error('Error loading notes for source:', error);
        setActiveNote(null);
      }
      
      setActivePanel('analysis');
      
      // Navigate to the analysis page
      router.push('/analysis');
    } catch (error) {
      console.error('Error updating source access time:', error);
      
      // Continue with navigation even if the update fails
      setSourceContent(source.content);
      setMetadata(source.metadata);
      setSourceType(source.type);
      if (source.thumbnailUrl) {
        setSourceThumbnailUrl(source.thumbnailUrl);
      }
      setActivePanel('analysis');
      router.push('/analysis');
    } finally {
      setLoading(false);
    }
  };

  // Handle opening the portrait modal
  const handleOpenPortraitModal = (source: SavedSource, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setPortraitModalSource(source);
    setPortraitModalOpen(true);
  };

  // Handle opening edit modal
  const handleOpenEditModal = (source: SavedSource, e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentEditSource(source);
    
    // Initialize form with current values
    setEditForm({
      author: source.metadata?.author || '',
      title: source.metadata?.title || '',
      date: source.metadata?.date || '',
      category: source.category || '',
      tags: Array.isArray(source.tags) ? source.tags.join(', ') : typeof source.tags === 'string' ? source.tags : ''
    });
    
    setEditModalOpen(true);
  };

  // Handle form field changes
  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Save edited source metadata
  const handleSaveEdit = async () => {
    if (!currentEditSource) return;
    
    try {
      // Process tags (convert comma-separated string to array)
      const processTags = (): string[] => {
        if (!editForm.tags) return [];
        return editForm.tags.split(',').map(tag => tag.trim()).filter(Boolean);
      };
      
      // Create updated source metadata
      const updates = {
        metadata: {
          ...currentEditSource.metadata,
          author: editForm.author,
          date: editForm.date,
          title: editForm.title,
        },
        category: editForm.category,
        tags: processTags()
      };
      
      // Update in storage
      await updateItem<SavedSource>('sources', currentEditSource.id, updates);
      
      // Update local state
      setSources(prev => prev.map(s => 
        s.id === currentEditSource.id 
          ? { ...s, ...updates, metadata: { ...s.metadata, ...updates.metadata } }
          : s
      ));
      
      // Close modal
      setEditModalOpen(false);
      setCurrentEditSource(null);
    } catch (error) {
      console.error('Error updating source metadata:', error);
      alert('Failed to update source. Please try again.');
    }
  };

  // Delete a saved source
  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    try {
      // Delete from storage
      await deleteItem('sources', id);
      
      // Update local state
      setSources(prev => prev.filter(source => source.id !== id));
      
      // Clear selection if deleted source was selected
      if (selectedSources.includes(id)) {
        setSelectedSources(prev => prev.filter(sourceId => sourceId !== id));
      }
      
      // Close edit modal if deleted source was being edited
      if (currentEditSource?.id === id) {
        setEditModalOpen(false);
        setCurrentEditSource(null);
      }
    } catch (error) {
      console.error('Error deleting source:', error);
      alert('Failed to delete source. Please try again.');
    }
  };

  // Handle bulk deletion
  const handleBulkDelete = async () => {
    if (selectedSources.length === 0) return;
    
    try {
      // Delete each selected source
      for (const id of selectedSources) {
        await deleteItem('sources', id);
      }
      
      // Update local state
      setSources(prev => prev.filter(source => !selectedSources.includes(source.id)));
      setSelectedSources([]);
    } catch (error) {
      console.error('Error deleting multiple sources:', error);
      alert('Failed to delete some sources. Please try again.');
    }
  };

  // Toggle source selection
  const toggleSourceSelection = (id: string, e: React.MouseEvent | React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    setSelectedSources(prev => 
      prev.includes(id) 
        ? prev.filter(sourceId => sourceId !== id) 
        : [...prev, id]
    );
  };

  // Check if source has notes
  const hasNotes = (sourceId: string): boolean => {
    return !!sourceNotes[sourceId] && sourceNotes[sourceId].length > 0;
  };

  // Get number of notes for source
  const getNotesCount = (sourceId: string): number => {
    return sourceNotes[sourceId]?.length || 0;
  };



  // Get icon for source type
  const getSourceTypeIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return (
          <svg className={`w-4 h-4 ${darkMode ? 'text-red-400' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        );
      case 'image':
        return (
          <svg className={`w-4 h-4 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case 'text':
      default:
        return (
          <svg className={`w-4 h-4 ${darkMode ? 'text-amber-400' : 'text-amber-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
    }
  };

  // Get notes icon with indicator
  const getNotesIcon = (sourceId: string) => {
    const count = getNotesCount(sourceId);
    return (
      <div className="relative">
        <svg className={`w-4 h-4 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        {count > 0 && (
          <div className={`absolute -top-1.5 -right-1.5 h-3.5 w-3.5 rounded-full flex items-center justify-center ${
            darkMode ? 'bg-indigo-700 text-indigo-200' : 'bg-indigo-600 text-white'
          } text-[0.6rem] font-bold`}>
            {count}
          </div>
        )}
      </div>
    );
  };

  // Format date for display
  const formatDate = (date: number): string => {
    return new Date(date).toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Truncate text to a certain length with ellipsis
  const truncateText = (text: string, maxLength: number) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).replace(/\s+\S*$/, '') + '...';
  };

  // Empty state when no sources
  if (sources.length === 0 && !isLoading) {
    return (
      <div className="bg-white rounded-lg  border-slate-200 overflow-hidden">
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <svg className="w-16 h-16 text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 className="text-lg font-medium text-slate-700 mb-1">No saved sources yet</h3>
          <p className="text-slate-500 max-w-md">
            Save source documents from the analysis page to build your library for quick access.
          </p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            Upload New Source
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="w-8 h-8 border-t-2 border-indigo-600 border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  // Main panel display
  return (
    <>
      <div className={`${darkMode ? 'bg-slate-900' : 'bg-white'} rounded-lg ${darkMode ? '' : ' border-slate-200'} overflow-hidden`}>
        {/* Header with controls */}
        <div className={`p-3 ${darkMode ? 'bg-slate-800 border-b border-slate-700' : 'bg-white border-b border-slate-200'}`}>
          <div className="flex flex-wrap justify-between items-center gap-3">
            <h2 className={`text-lg font-mono ${darkMode ? 'font-mono text-slate-200' : 'font-medium text-slate-800'} flex items-center`}>
              <svg className={`w-5 h-5 mr-2 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span className="mr-2">Sources</span>
              <span className={`text-xs ${darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'} px-2 py-0.5 rounded`}>
                {sources.length}
              </span>
              
              {/* Display storage type */}
              <span className={`ml-2 text-xs ${darkMode ? 'bg-indigo-800 text-indigo-200' : 'bg-indigo-100 text-indigo-800'} px-2 py-0.5 rounded-full`}>
                {isPersistent ? 'Cloud Storage' : 'Local Storage'}
              </span>
            </h2>
            
            <div className="flex flex-1 md:flex-none md:ml-4">
              {/* Search input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                  <svg className={`h-4 w-4 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search..."
                  className={`pl-8 p-1.5 w-full md:w-40 lg:w-60 ${
                    darkMode 
                      ? 'bg-slate-700 text-slate-200 placeholder-slate-400 border-slate-600' 
                      : 'bg-slate-100 text-slate-800 placeholder-slate-500 border-slate-200'
                  } text-sm rounded border focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Filter dropdown */}
              <div className="flex items-center">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className={`p-1.5 text-xs ${
                    darkMode 
                      ? 'bg-slate-700 text-slate-200 border-slate-600' 
                      : 'bg-white text-slate-800 border-slate-200'
                  } rounded border focus:outline-none focus:ring-1 focus:ring-indigo-500`}
                >
                  <option value="all">All Categories</option>
                  {categories
                    .filter(cat => cat !== 'all')
                    .map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))
                  }
                </select>
              </div>
              
              {/* Sort dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className={`p-1.5 text-xs ${
                  darkMode 
                    ? 'bg-slate-700 text-slate-200 border-slate-600' 
                    : 'bg-white text-slate-800 border-slate-200'
                } rounded border focus:outline-none focus:ring-1 focus:ring-indigo-500`}
              >
                <option value="dateAdded">Recently Added</option>
                <option value="lastAccessed">Recently Used</option>
                <option value="name">Author Name</option>
              </select>
              
              {/* View mode toggle */}
              <div className={`flex border overflow-hidden rounded ${darkMode ? 'border-slate-600' : 'border-slate-200'}`}>
                <button
                  onClick={() => setDisplayMode('table')}
                  className={`p-1.5 ${displayMode === 'table' 
                    ? darkMode ? 'bg-slate-700 text-slate-200' : 'bg-indigo-100 text-indigo-800'
                    : darkMode ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-white text-slate-500 hover:bg-slate-100'}`}
                  title="Table view"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </button>
                <button
                  onClick={() => setDisplayMode('grid')}
                  className={`p-1.5 ${displayMode === 'grid' 
                    ? darkMode ? 'bg-slate-700 text-slate-200' : 'bg-indigo-100 text-indigo-800'
                    : darkMode ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-white text-slate-500 hover:bg-slate-100'}`}
                  title="Grid view"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                  </svg>
                </button>
              </div>
              
            
              
              {/* Upload new button */}
              <button
                onClick={() => router.push('/')}
                className="px-3 py-1.5 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700 transition-colors flex items-center"
              >
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                New Source
              </button>
            </div>
          </div>
          
        {/* Toolbar */}
          <div className={`flex justify-between items-center mt-2 text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            <div className="flex items-center gap-2">
              {/* Bulk actions */}
              <button
                onClick={handleBulkDelete}
                disabled={selectedSources.length === 0}
                className={`py-1 px-2 rounded flex items-center gap-1 transition-colors ${
                  selectedSources.length > 0
                    ? darkMode ? 'text-red-400 hover:bg-red-900/30 hover:text-red-300' : 'text-red-600 hover:bg-red-50 hover:text-red-700'
                    : darkMode ? 'text-slate-500 cursor-not-allowed' : 'text-slate-400 cursor-not-allowed'
                }`}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete {selectedSources.length > 0 ? `${selectedSources.length}` : ''}
              </button>
            </div>
            
            <div className="font-[var(--font-geist-mono)]">
              {selectedSources.length > 0 
                ? `${selectedSources.length} selected` 
                : filteredSources.length !== sources.length
                  ? `${filteredSources.length}/${sources.length} sources`
                  : `${sources.length} sources`}
            </div>
          </div>
        </div>

        {/* Sources display - Table View */}
        {displayMode === 'table' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className={darkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-50 text-slate-600'}>
                <tr className="uppercase text-xs tracking-wider">
                  <th className="py-2 px-3 font-medium">
                    <input
                      type="checkbox"
                      checked={selectedSources.length > 0 && selectedSources.length === filteredSources.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedSources(filteredSources.map(s => s.id));
                        } else {
                          setSelectedSources([]);
                        }
                      }}
                      className={`h-3 w-3 rounded ${
                        darkMode ? 'border-slate-600 text-indigo-500 focus:ring-indigo-400' : 'border-slate-300 text-indigo-600 focus:ring-indigo-500'
                      }`}
                    />
                  </th>
                  <th className="py-2 px-3 font-medium">Type</th>
                  <th className="py-2 px-3 font-medium">Source</th>
                  <th className="py-2 px-3 font-medium hidden md:table-cell">Content Preview</th>
                  <th className="py-2 px-3 font-medium hidden lg:table-cell">Tags</th>
                  <th className="py-2 px-3 font-medium">Notes</th>
                  <th className="py-2 px-3 font-medium">Status</th>
                  <th className="py-2 px-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${darkMode ? 'divide-slate-700/50' : 'divide-slate-200'}`}>
                {sortedSources.length === 0 ? (
                  <tr>
                    <td colSpan={8} className={`py-8 text-center ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      No matching sources found. Try adjusting your search.
                    </td>
                  </tr>
                ) : (
                  sortedSources.map((source, index) => (
                    <tr 
                      key={source.id}
                      className={`${
                        darkMode
                          ? index % 2 === 0 ? 'bg-slate-800/50' : 'bg-slate-800/30'
                          : index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                      } hover:${darkMode ? 'bg-slate-700/50' : 'bg-slate-100/70'} transition-colors cursor-pointer group`}
                      onClick={() => handleOpenPortraitModal(source)}
                    >
                      <td className="py-2 px-3">
                        <input
                          type="checkbox"
                          checked={selectedSources.includes(source.id)}
                          onChange={(e) => toggleSourceSelection(source.id, e)}
                          className={`h-3 w-3 rounded ${
                            darkMode ? 'border-slate-600 text-indigo-500 focus:ring-indigo-400' : 'border-slate-300 text-indigo-600 focus:ring-indigo-500'
                          }`}
                        />
                      </td>
                      <td className="py-2 px-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="mr-1.5">
                            {getSourceTypeIcon(source.type)}
                          </span>
                          <span className={`text-xs font-[var(--font-geist-mono)] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                            {source.type}
                          </span>
                        </div>
                      </td>
                      <td className="py-2 px-3">
                        <div className="flex flex-col">
                          <div className={`font-medium ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                            {source.metadata?.title || source.metadata?.author || 'Untitled Source'}
                          </div>
                          <div className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'} flex items-center`}>
                            {source.metadata?.author && (
                              <span className="mr-1.5">{source.metadata.author}</span>
                            )}
                            {source.metadata?.date && (
                              <span>({source.metadata.date})</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-2 px-3 hidden md:table-cell">
                        <div className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'} max-w-xs overflow-hidden text-ellipsis`}>
                          {truncateText(source.content, 60)}
                        </div>
                      </td>
                      <td className="py-2 px-3 hidden lg:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {Array.isArray(source.tags) && source.tags.length > 0 ? 
                            source.tags.slice(0, 3).map((tag, idx) => (
                              <span 
                                key={idx}
                                className={`px-1.5 py-0.5 ${
                                  darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'
                                } rounded text-xs`}
                              >
                                {tag}
                              </span>
                            )) : (
                              <span className={darkMode ? 'text-slate-500' : 'text-slate-400'}>—</span>
                            )
                          }
                          {Array.isArray(source.tags) && source.tags.length > 3 && (
                            <span className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>+{source.tags.length - 3}</span>
                          )}
                        </div>
                      </td>
                      <td className="py-2 px-3 text-center">
                        <div className="flex items-center justify-center">
                          {getNotesCount(source.id) > 0 ? (
                            <div className={`flex items-center px-2 py-0.5 rounded text-xs ${
                              darkMode ? 'bg-indigo-900/30 text-indigo-300' : 'bg-indigo-100 text-indigo-700'
                            }`}>
                              <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              <span>{getNotesCount(source.id)}</span>
                            </div>
                          ) : (
                            <span className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                              —
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-2 px-3">
                        <div className="flex items-center">
                          {source.lastAccessed ? (
                            <div className="flex items-center text-xs">
                              <span className="h-1.5 w-1.5 bg-green-400 rounded-full mr-1.5"></span>
                              <span className={`font-[var(--font-geist-mono)] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                {new Date(source.lastAccessed).toLocaleDateString()}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center text-xs">
                              <span className="h-1.5 w-1.5 bg-slate-500 rounded-full mr-1.5"></span>
                              <span className={`font-[var(--font-geist-mono)] ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>never accessed</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-2 px-3">
                        <div className="flex space-x-1 opacity-80 group-hover:opacity-100">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLoadSource(source);
                            }}
                            className={`p-1 ${
                              darkMode ? 'text-indigo-400 hover:text-indigo-300 hover:bg-slate-700' : 'text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50'
                            } rounded transition-colors`}
                            title="Analyze source"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                          <button
                            onClick={(e) => handleOpenEditModal(source, e)}
                            className={`p-1 ${
                              darkMode ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                            } rounded transition-colors`}
                            title="Edit metadata"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={(e) => handleDelete(source.id, e)}
                            className={`p-1 ${
                              darkMode ? 'text-slate-400 hover:text-red-400 hover:bg-slate-700' : 'text-slate-500 hover:text-red-600 hover:bg-slate-100'
                            } rounded transition-colors`}
                            title="Delete source"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Sources display - Grid View */}
        {displayMode === 'grid' && (
          <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 p-3 ${darkMode ? 'bg-slate-900' : 'bg-slate-50/50'}`}>
            {sortedSources.length === 0 ? (
              <div className={`col-span-full py-8 text-center ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                No matching sources found. Try adjusting your search.
              </div>
            ) : (
              sortedSources.map((source) => (
                <div 
                  key={source.id}
                  className={`${
                    darkMode 
                      ? 'bg-slate-800 border border-slate-700 hover:bg-slate-700/80' 
                      : 'bg-white border border-slate-200 hover:bg-slate-50'
                  } rounded-md overflow-hidden transition-colors cursor-pointer group shadow-sm`}
                  onClick={() => handleOpenPortraitModal(source)}
                >
                  {/* Card header with checkbox and type */}
                  <div className={`flex items-center justify-between p-2 border-b ${darkMode ? 'border-slate-700/50' : 'border-slate-100'}`}>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedSources.includes(source.id)}
                        onChange={(e) => toggleSourceSelection(source.id, e)}
                        className={`h-3 w-3 mr-2 rounded ${
                          darkMode ? 'border-slate-600 text-indigo-500 focus:ring-indigo-400' : 'border-slate-300 text-indigo-600 focus:ring-indigo-500'
                        }`}
                      />
                      <div className={`flex items-center space-x-1.5 text-xs font-[var(--font-geist-mono)] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        {getSourceTypeIcon(source.type)}
                        <span>{source.type}</span>
                      </div>
                    </div>
                    <div className="text-xs font-mono text-slate-500">
                      {source.lastAccessed ? (
                        <div className="flex items-center">
                          <span className="h-1.5 w-1.5 bg-green-400 rounded-full mr-1"></span>
                          <span className={darkMode ? 'text-slate-400' : 'text-slate-500'}>
                            {new Date(source.lastAccessed).toLocaleDateString()}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <span className="h-1.5 w-1.5 bg-slate-500 rounded-full mr-1"></span>
                          <span>unread</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Card content */}
                  <div className="p-2">
                    {/* Thumbnail if available */}
                    {source.thumbnailUrl && (
                      <div className="w-full h-24 mb-2 relative rounded overflow-hidden">
                        <Image 
                          src={source.thumbnailUrl}
                          alt={source.metadata?.title || "Document thumbnail"}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}

                    <h3 className={`font-medium ${darkMode ? 'text-slate-200' : 'text-slate-800'} mb-1 truncate`}>
                      {source.metadata?.title || source.metadata?.author || 'Untitled Source'}
                    </h3>
                    {source.metadata?.author && (
                      <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'} mb-1`}>
                        {source.metadata.author} {source.metadata?.date && `(${source.metadata.date})`}
                      </p>
                    )}
                    <p className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-600'} line-clamp-2 mb-2`}>
                      {truncateText(source.content, 80)}
                    </p>
                    
                    {/* Tags */}
                    {Array.isArray(source.tags) && source.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {source.tags.slice(0, 2).map((tag, idx) => (
                          <span 
                            key={idx}
                            className={`px-1 py-0.5 ${
                              darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'
                            } rounded text-xs`}
                          >
                            {tag}
                          </span>
                        ))}
                        {source.tags.length > 2 && (
                          <span className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>+{source.tags.length - 2}</span>
                        )}
                      </div>
                    )}
                    
                    {/* Notes indicator */}
                    {getNotesCount(source.id) > 0 && (
                      <div className={`inline-flex items-center px-2 py-0.5 mb-2 rounded text-xs ${
                        darkMode ? 'bg-indigo-900/30 text-indigo-300' : 'bg-indigo-100 text-indigo-700'
                      }`}>
                        <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <span>{getNotesCount(source.id)} notes</span>
                      </div>
                    )}
                  </div>

                  {/* NotesSection for this source - conditionally rendered */}
                  {getNotesCount(source.id) > 0 && (
                    <div className="px-2 pb-2">
                      <NotesSection sourceId={source.id} darkMode={darkMode} />
                    </div>
                  )}
                  
                  {/* Card footer with actions */}
                  <div className={`flex border-t ${darkMode ? 'border-slate-700/50 divide-x divide-slate-700/50' : 'border-slate-100 divide-x divide-slate-200'}`}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLoadSource(source);
                      }}
                      className={`flex-1 p-1 ${
                        darkMode 
                          ? 'text-indigo-400 hover:text-indigo-300 hover:bg-slate-700' 
                          : 'text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50'
                      } text-xs flex items-center justify-center transition-colors`}
                    >
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      Analyze
                    </button>
                    <button
                      onClick={(e) => handleOpenEditModal(source, e)}
                      className={`flex-1 p-1 ${
                        darkMode 
                          ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700' 
                          : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                      } text-xs flex items-center justify-center transition-colors`}
                    >
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </button>
                    <button
                      onClick={(e) => handleDelete(source.id, e)}
                      className={`flex-1 p-1 ${
                        darkMode 
                          ? 'text-slate-400 hover:text-red-400 hover:bg-slate-700' 
                          : 'text-slate-500 hover:text-red-600 hover:bg-slate-100'
                      } text-xs flex items-center justify-center transition-colors`}
                    >
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Document Portrait Modal */}
      {portraitModalOpen && portraitModalSource && (
        <DocumentPortraitModal
          isOpen={portraitModalOpen}
          onClose={() => setPortraitModalOpen(false)}
          sourceFile={null}
          sourceType={portraitModalSource.type}
          metadata={portraitModalSource.metadata}
          portraitUrl={portraitModalSource.thumbnailUrl}
          portraitEmoji={portraitModalSource.metadata?.documentEmoji || '📄'}
          onAnalyze={() => handleLoadSource(portraitModalSource)}
          onEdit={(e) => {
            if (e) e.stopPropagation();
            setPortraitModalOpen(false);
            handleOpenEditModal(portraitModalSource, e as React.MouseEvent<Element, MouseEvent>);
          }}
          notesCount={getNotesCount(portraitModalSource.id)}
          darkMode={darkMode}
        />
      )}
      
      {/* Edit Source Metadata Modal */}
      {editModalOpen && currentEditSource && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`${
            darkMode ? 'bg-slate-900 border border-slate-700' : 'bg-white border border-slate-200'
          } rounded-lg shadow-xl max-w-md w-full overflow-hidden`}>
            <div className={`p-4 ${
              darkMode ? 'border-b border-slate-700 bg-slate-800' : 'border-b border-slate-200 bg-slate-50'
            } flex justify-between items-center`}>
              <h3 className={`font-bold text-lg ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>Edit Source Details</h3>
              <button 
                onClick={() => {
                  setEditModalOpen(false);
                  setCurrentEditSource(null);
                }}
                className={darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700'}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Edit form */}
            <div className="p-4 space-y-4">
              <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'} mb-1`}>
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={editForm.title}
                  onChange={handleEditFormChange}
                  className={`w-full p-2 ${
                    darkMode 
                      ? 'bg-slate-800 border border-slate-700 text-slate-200 placeholder-slate-500' 
                      : 'bg-white border border-slate-300 text-slate-800 placeholder-slate-400'
                  } rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500`}
                  placeholder="Document title"
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'} mb-1`}>
                  Author
                </label>
                <input
                  type="text"
                  name="author"
                  value={editForm.author}
                  onChange={handleEditFormChange}
                  className={`w-full p-2 ${
                    darkMode 
                      ? 'bg-slate-800 border border-slate-700 text-slate-200 placeholder-slate-500' 
                      : 'bg-white border border-slate-300 text-slate-800 placeholder-slate-400'
                  } rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500`}
                  placeholder="Author name"
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'} mb-1`}>
                  Date
                </label>
                <input
                  type="text"
                  name="date"
                  value={editForm.date}
                  onChange={handleEditFormChange}
                  className={`w-full p-2 ${
                    darkMode 
                      ? 'bg-slate-800 border border-slate-700 text-slate-200 placeholder-slate-500' 
                      : 'bg-white border border-slate-300 text-slate-800 placeholder-slate-400'
                  } rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500`}
                  placeholder="Publication date or year"
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'} mb-1`}>
                  Category
                </label>
                <input
                  type="text"
                  name="category"
                  value={editForm.category}
                  onChange={handleEditFormChange}
                  className={`w-full p-2 ${
                    darkMode 
                      ? 'bg-slate-800 border border-slate-700 text-slate-200 placeholder-slate-500' 
                      : 'bg-white border border-slate-300 text-slate-800 placeholder-slate-400'
                  } rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500`}
                  placeholder="e.g., Primary Source, Research Paper, etc."
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'} mb-1`}>
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  name="tags"
                  value={editForm.tags}
                  onChange={handleEditFormChange}
                  className={`w-full p-2 ${
                    darkMode 
                      ? 'bg-slate-800 border border-slate-700 text-slate-200 placeholder-slate-500' 
                      : 'bg-white border border-slate-300 text-slate-800 placeholder-slate-400'
                  } rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500`}
                  placeholder="e.g., history, revolution, primary source"
                />
                <p className={`mt-1 text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                  Separate tags with commas (e.g., "history, revolution, primary source")
                </p>
              </div>

              {/* Notes information */}
              {currentEditSource && getNotesCount(currentEditSource.id) > 0 && (
                <div className={`p-2 rounded ${
                  darkMode ? 'bg-indigo-900/20 border border-indigo-800/40' : 'bg-indigo-50 border border-indigo-100'
                }`}>
                  <div className={`flex items-center mb-1 ${
                    darkMode ? 'text-indigo-300' : 'text-indigo-700'
                  }`}>
                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span className="text-sm font-medium">Associated Notes</span>
                  </div>
                  <p className={`text-xs ${darkMode ? 'text-indigo-200' : 'text-indigo-600'}`}>
                    This source has {getNotesCount(currentEditSource.id)} note{getNotesCount(currentEditSource.id) !== 1 ? 's' : ''} attached.
                  </p>
                </div>
              )}

              {/* Storage type indicator */}
              <div className={`mt-2 text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'} p-2 ${
                darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-slate-50 border border-slate-200'
              } rounded`}>
                {isPersistent ? (
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1.5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                    </svg>
                    <span>This source is stored in your cloud library</span>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1.5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                    <span>This source is stored in your local browser storage</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className={`p-4 ${
              darkMode ? 'bg-slate-800 border-t border-slate-700' : 'bg-slate-50 border-t border-slate-200'
            } flex justify-end space-x-3`}>
              <button
                onClick={() => {
                  setEditModalOpen(false);
                  setCurrentEditSource(null);
                }}
                className={`px-4 py-2 ${
                  darkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
                } rounded transition-colors text-sm`}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors text-sm font-medium"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
