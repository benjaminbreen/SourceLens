// components/library/SavedSourcesPanel.tsx
// Panel for managing saved source documents that users have uploaded
// Features quick source loading, preview, metadata editing, and categorization

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { Metadata } from '@/lib/store';

// Local storage key for saved sources
const SAVED_SOURCES_KEY = 'sourceLens_savedSources';

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
}

export default function SavedSourcesPanel() {
  const router = useRouter();
  const { 
    setSourceContent, 
    setMetadata, 
    setLoading, 
    setActivePanel, 
    setSourceType
  } = useAppStore();
  
  const [sources, setSources] = useState<SavedSource[]>([]);
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentEditSource, setCurrentEditSource] = useState<SavedSource | null>(null);
  const [sortBy, setSortBy] = useState<'dateAdded' | 'lastAccessed' | 'name'>('dateAdded');
  
  // Load saved sources from localStorage on mount
  useEffect(() => {
    const loadSavedSources = () => {
      try {
        const savedSourcesJson = localStorage.getItem(SAVED_SOURCES_KEY);
        if (savedSourcesJson) {
          const savedSourceData = JSON.parse(savedSourcesJson);
          setSources(savedSourceData);
        }
      } catch (error) {
        console.error('Error loading saved sources:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Small delay to simulate loading for better UX
    const timer = setTimeout(() => {
      loadSavedSources();
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  // Get all unique categories
  const categories = ['all', ...new Set(sources.map(source => source.category || 'Uncategorized'))];

  // Filter sources based on search and category
  const filteredSources = sources.filter(source => {
    // Category filter
    if (categoryFilter !== 'all' && source.category !== categoryFilter) {
      return false;
    }
    
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        source.metadata.author.toLowerCase().includes(searchLower) ||
        source.metadata.date.toLowerCase().includes(searchLower) ||
        (source.content && source.content.substring(0, 500).toLowerCase().includes(searchLower)) ||
        (source.tags && source.tags.some(tag => tag.toLowerCase().includes(searchLower)))
      );
    }
    
    return true;
  });

  // Sort filtered sources
  const sortedSources = [...filteredSources].sort((a, b) => {
    switch (sortBy) {
      case 'dateAdded':
        return b.dateAdded - a.dateAdded;
      case 'lastAccessed':
        const aAccessed = a.lastAccessed || a.dateAdded;
        const bAccessed = b.lastAccessed || b.dateAdded;
        return bAccessed - aAccessed;
      case 'name': 
        return (a.metadata.author || '').localeCompare(b.metadata.author || '');
      default:
        return 0;
    }
  });

  // Load source into the analysis page
  const handleLoadSource = (source: SavedSource) => {
    setLoading(true);
    
    // Update the source's last accessed time
    const updatedSource = { ...source, lastAccessed: Date.now() };
    const updatedSources = sources.map(s => 
      s.id === source.id ? updatedSource : s
    );
    setSources(updatedSources);
    localStorage.setItem(SAVED_SOURCES_KEY, JSON.stringify(updatedSources));
    
    // Set the source content and metadata in the app store
    setSourceContent(source.content);
    setMetadata(source.metadata);
    setSourceType(source.type);
    setActivePanel('analysis');
    
    // Navigate to the analysis page
    router.push('/analysis');
  };

  // Delete a saved source
  const handleDelete = (id: string) => {
    const updatedSources = sources.filter(source => source.id !== id);
    setSources(updatedSources);
    localStorage.setItem(SAVED_SOURCES_KEY, JSON.stringify(updatedSources));
    
    // Clear selection if deleted source was selected
    if (selectedSources.includes(id)) {
      setSelectedSources(prev => prev.filter(sourceId => sourceId !== id));
    }
    
    // Close expanded view if deleted source was expanded
    if (expandedId === id) {
      setExpandedId(null);
    }
    
    // Close edit modal if deleted source was being edited
    if (currentEditSource?.id === id) {
      setShowEditModal(false);
      setCurrentEditSource(null);
    }
  };

  // Handle bulk deletion
  const handleBulkDelete = () => {
    if (selectedSources.length === 0) return;
    
    const updatedSources = sources.filter(source => !selectedSources.includes(source.id));
    setSources(updatedSources);
    localStorage.setItem(SAVED_SOURCES_KEY, JSON.stringify(updatedSources));
    setSelectedSources([]);
    setExpandedId(null);
  };

  // Toggle source selection
  const toggleSourceSelection = (id: string) => {
    setSelectedSources(prev => 
      prev.includes(id) 
        ? prev.filter(sourceId => sourceId !== id) 
        : [...prev, id]
    );
  };

  // Get icon for source type
  const getSourceTypeIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return (
          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          </svg>
        );
      case 'image':
        return (
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case 'text':
      default:
        return (
          <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
    }
  };

  // Truncate text to a certain length with ellipsis
  const truncateText = (text: string, maxLength: number) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).replace(/\s+\S*$/, '') + '...';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="w-10 h-10 border-t-2 border-purple-600 border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header with controls */}
      <div className="p-4 bg-slate-50 border-b border-slate-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
          <h2 className="text-xl font-medium text-slate-800 flex items-center">
            <svg className="w-6 h-6 mr-2 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Saved Sources
            <span className="ml-2 text-sm font-normal text-slate-500">
              ({sources.length})
            </span>
          </h2>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => router.push('/')}
              className="px-3 py-1.5 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Upload New Source
            </button>
          </div>
        </div>
        
        {/* Search and filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search sources..."
              className="pl-10 p-2 border border-slate-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap sm:flex-nowrap gap-2">
            {/* Category filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="p-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
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
            
            {/* Sort dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="p-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
            >
              <option value="dateAdded">Sort by Date Added</option>
              <option value="lastAccessed">Sort by Last Accessed</option>
              <option value="name">Sort by Author</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Action toolbar */}
      <div className="border-b border-slate-200 p-2 bg-white">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkDelete}
              disabled={selectedSources.length === 0}
              className={`p-1.5 rounded-md text-sm flex items-center gap-1 ${
                selectedSources.length > 0
                  ? 'text-red-600 hover:bg-red-50'
                  : 'text-slate-400 cursor-not-allowed'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete {selectedSources.length > 0 ? `(${selectedSources.length})` : ''}
            </button>
          </div>
          
          <div className="text-xs text-slate-500">
            {selectedSources.length > 0 
              ? `${selectedSources.length} selected` 
              : sources.length > 0 
                ? `${filteredSources.length} of ${sources.length} sources`
                : 'No sources saved yet'}
          </div>
        </div>
      </div>

      {/* Sources list */}
      <div className="overflow-y-auto max-h-[calc(100vh-350px)]">
        {sources.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <svg className="w-16 h-16 text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="text-lg font-medium text-slate-700 mb-1">No saved sources yet</h3>
            <p className="text-slate-500 max-w-md">
              Save source documents from the analysis page to build your library for quick access.
            </p>
            <button
              onClick={() => router.push('/')}
              className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              Upload New Source
            </button>
          </div>
        ) : filteredSources.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <svg className="w-12 h-12 text-slate-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 className="text-lg font-medium text-slate-700">No matching sources</h3>
            <p className="text-slate-500">Try adjusting your search criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {sortedSources.map((source) => (
              <div 
                key={source.id}
                className={`rounded-lg border transition-colors h-full ${
                  selectedSources.includes(source.id) 
                    ? 'border-purple-400 bg-purple-50/50' 
                    : 'border-slate-200 hover:border-purple-200 bg-white'
                }`}
              >
                <div className="p-4 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-3">
                    {/* Type icon */}
                    <div className="flex items-center">
                      {getSourceTypeIcon(source.type)}
                    </div>
                    
                    {/* Checkbox for selection */}
                    <input
                      type="checkbox"
                      checked={selectedSources.includes(source.id)}
                      onChange={() => toggleSourceSelection(source.id)}
                      className="h-4 w-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                    />
                  </div>
                  
                  {/* Source details */}
                  <div 
                    className="flex-1 cursor-pointer"
                    onClick={() => setExpandedId(expandedId === source.id ? null : source.id)}
                  >
                    <h3 className="font-medium text-slate-800 mb-1 leading-tight line-clamp-2">
                      {source.metadata.author ? `${source.metadata.author} (${source.metadata.date})` : 'Untitled Source'}
                    </h3>
                    
                    {/* Content preview */}
                    <p className="text-sm text-slate-600 mb-2 line-clamp-3">
                      {truncateText(source.content, 150)}
                    </p>
                    
                    {/* Tags if available */}
                    {source.tags && source.tags.length > 0 && (
                      <div className="mb-2 flex flex-wrap gap-1">
                        {source.tags.map((tag, index) => (
                          <span 
                            key={index}
                            className="text-xs px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {/* Category label */}
                    {source.category && (
                      <div className="mb-2">
                        <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full">
                          {source.category}
                        </span>
                      </div>
                    )}
                    
                    {/* Date added */}
                    <div className="mt-auto text-xs text-slate-400">
                      Added: {new Date(source.dateAdded).toLocaleDateString()}
                      {source.lastAccessed && (
                        <>
                          <span className="mx-1">•</span>
                          Last used: {new Date(source.lastAccessed).toLocaleDateString()}
                        </>
                      )}
                    </div>
                  </div>
                  
                  {/* Action buttons */}
                  <div className="flex justify-between mt-3 pt-3 border-t border-slate-100">
                    <button
                      onClick={() => handleLoadSource(source)}
                      className="px-2 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors flex items-center"
                    >
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      Load Source
                    </button>
                    
                    <div className="flex space-x-1">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentEditSource(source);
                          setShowEditModal(true);
                        }}
                        className="p-1 text-slate-500 hover:text-slate-700 rounded hover:bg-slate-50"
                        title="Edit metadata"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(source.id);
                        }}
                        className="p-1 text-red-500 hover:text-red-700 rounded hover:bg-red-50"
                        title="Delete source"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Empty state footer */}
      {sources.length === 0 && (
        <div className="p-4 bg-slate-50 border-t border-slate-200 text-center">
          <p className="text-sm text-slate-500">
            You can save sources while analyzing them. Look for the "Save to Library" button in the source panel.
          </p>
        </div>
      )}
      
      {/* Edit metadata modal */}
      {showEditModal && currentEditSource && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-auto">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-bold text-lg">Edit Source Details</h3>
              <button 
                onClick={() => {
                  setShowEditModal(false);
                  setCurrentEditSource(null);
                }}
                className="text-gray-500 hover:text-gray-800 text-2xl"
              >
                &times;
              </button>
            </div>
            
            {/* Edit form would go here */}
            <div className="p-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Source Name/Author
                </label>
                <input
                  type="text"
                  value={currentEditSource.metadata.author}
                  className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  // onChange handlers would be added here
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Date
                </label>
                <input
                  type="text"
                  value={currentEditSource.metadata.date}
                  className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  // onChange handlers would be added here
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  value={currentEditSource.category || ''}
                  className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  // onChange handlers would be added here
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={currentEditSource.tags?.join(', ') || ''}
                  className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  // onChange handlers would be added here
                />
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setCurrentEditSource(null);
                }}
                className="px-4 py-2 bg-slate-200 text-slate-800 rounded mr-2 hover:bg-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                // onClick handler would save the changes
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}