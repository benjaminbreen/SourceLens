// components/library/SavedDraftsPanel.tsx
// Panel for managing user-created draft documents
// Features draft uploads, summarization, and selection for context enhancement

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useLibrary, SavedDraft } from '@/lib/libraryContext';
import { useAppStore } from '@/lib/store';
import { useAuth } from '@/lib/auth/authContext';

interface SavedDraftsPanelProps {
  darkMode: boolean; // Accept darkMode as a required prop
}

export default function SavedDraftsPanel({ darkMode }: SavedDraftsPanelProps) {
  const router = useRouter();
  const { 
    drafts, 
    addDraft, 
    updateDraft, 
    deleteDraft,
    draftExists
  } = useLibrary();
  const { setLoading } = useAppStore();
  const { user } = useAuth();

  // Local state
  const [selectedDrafts, setSelectedDrafts] = useState<string[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'dateAdded' | 'lastEdited' | 'title'>('lastEdited');
  const [displayMode, setDisplayMode] = useState<'grid' | 'table'>('grid');
  
  // Draft upload/create state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDraftTitle, setNewDraftTitle] = useState('');
  const [newDraftContent, setNewDraftContent] = useState('');
  const [newDraftStatus, setNewDraftStatus] = useState<'in-progress' | 'review' | 'final'>('in-progress');
  const [newDraftTags, setNewDraftTags] = useState('');
  const [isCreatingDraft, setIsCreatingDraft] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  // Summary modal state
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [currentSummaryDraft, setCurrentSummaryDraft] = useState<SavedDraft | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  interface MenuItem {
    label: string;
    href?: string;
    icon: React.ReactNode;
    onClick?: () => void;
    target?: string;
  }
  
  // Load effect with simulation
  useEffect(() => {
    // Simulate loading for UI consistency
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  // Filter drafts based on search and status
  const filteredDrafts = drafts.filter(draft => {
    // Status filter
    if (statusFilter !== 'all' && draft.status !== statusFilter) {
      return false;
    }
    
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        draft.title.toLowerCase().includes(searchLower) ||
        (draft.content && draft.content.substring(0, 500).toLowerCase().includes(searchLower)) ||
        (draft.tags && draft.tags.some(tag => tag.toLowerCase().includes(searchLower)))
      );
    }
    
    return true;
  });

  // Sort filtered drafts
  const sortedDrafts = [...filteredDrafts].sort((a, b) => {
    switch (sortBy) {
      case 'dateAdded':
        return b.dateAdded - a.dateAdded;
      case 'lastEdited':
        const aEdited = a.lastEdited || a.dateAdded;
        const bEdited = b.lastEdited || b.dateAdded;
        return bEdited - aEdited;
      case 'title': 
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  // Handle bulk deletion
  const handleBulkDelete = () => {
    if (selectedDrafts.length === 0) return;
    
    selectedDrafts.forEach(id => {
      deleteDraft(id);
    });
    
    setSelectedDrafts([]);
    setExpandedId(null);
  };

  // Toggle draft selection
  const toggleDraftSelection = (id: string) => {
    setSelectedDrafts(prev => 
      prev.includes(id) 
        ? prev.filter(draftId => draftId !== id) 
        : [...prev, id]
    );
  };

  // Get icon for draft status
  const getDraftStatusIcon = (status?: string) => {
    switch (status) {
      case 'in-progress':
        return (
          <svg className={`w-5 h-5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        );
      case 'review':
        return (
          <svg className={`w-5 h-5 ${darkMode ? 'text-amber-400' : 'text-amber-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'final':
        return (
          <svg className={`w-5 h-5 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className={`w-5 h-5 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
    }
  };

  // Get badge color for draft status
  const getStatusBadgeClasses = (status?: string) => {
    switch (status) {
      case 'in-progress':
        return darkMode 
          ? 'bg-blue-900/30 text-blue-300 border border-blue-800/40' 
          : 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'review':
        return darkMode 
          ? 'bg-amber-900/30 text-amber-300 border border-amber-800/40' 
          : 'bg-amber-100 text-amber-800 border border-amber-200';
      case 'final':
        return darkMode 
          ? 'bg-emerald-900/30 text-emerald-300 border border-emerald-800/40' 
          : 'bg-emerald-100 text-emerald-800 border border-emerald-200';
      default:
        return darkMode 
          ? 'bg-slate-800 text-slate-300 border border-slate-700' 
          : 'bg-slate-100 text-slate-800 border border-slate-200';
    }
  };

  // Truncate text to a certain length with ellipsis
  const truncateText = (text: string, maxLength: number) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).replace(/\s+\S*$/, '') + '...';
  };

  // Create or update draft with summary
  const processDraft = async (draft: Omit<SavedDraft, 'id' | 'dateAdded' | 'userId'> & { id?: string, dateAdded?: number }) => {
    try {
      if (!user) {
        setUploadError('You must be logged in to create or update drafts.');
        return "";
      }

      setIsCreatingDraft(true);
      setUploadError(null);
      
      // Generate a summary for the draft
      const response = await fetch('/api/summarize-draft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ draft }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to generate summary');
      }
      
      const summaryData = await response.json();
      
      // Add required properties for SavedDraft type
      const draftWithSummary: Omit<SavedDraft, 'id' | 'dateAdded' | 'userId'> = {
        title: draft.title,
        content: draft.content,
        type: draft.type || 'text',
        status: draft.status || 'in-progress',
        tags: draft.tags || [],
        summary: summaryData.overallSummary,
        sections: summaryData.sections,
        wordCount: summaryData.wordCount,
      };

      // Add or update the draft
      let draftId = '';
      if (draft.id) {
        await updateDraft(draft.id, draftWithSummary);
        draftId = draft.id;
      } else {
        draftId = await addDraft(draftWithSummary);
      }
      
      if (!draft.id) {
        setNewDraftTitle('');
        setNewDraftContent('');
        setNewDraftTags('');
        setShowAddModal(false);
      }
      
      return draftId;
    } catch (error) {
      console.error('Draft processing error:', error);
      setUploadError(error instanceof Error ? error.message : 'Unknown error processing draft');
      return "";
    } finally {
      setIsCreatingDraft(false);
    }
  };

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!user) {
      setUploadError('You must be logged in to upload drafts.');
      return;
    }
    
    setUploadError(null);
    
    // Check file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File too large. Maximum size is 10MB.');
      return;
    }
    
    // Determine type
    const fileType = file.name.endsWith('.pdf') 
      ? 'pdf' 
      : file.name.endsWith('.docx') 
        ? 'docx' 
        : 'text';
    
    try {
      setIsCreatingDraft(true);
      
      // Read the file as text
      const fileContent = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            resolve(event.target.result as string);
          } else {
            reject(new Error('Failed to read file'));
          }
        };
        reader.onerror = () => reject(new Error('File read error'));
        reader.readAsText(file);
      });
      
      // Create a draft object
      const newDraft: Omit<SavedDraft, 'id' | 'dateAdded' | 'userId'> = {
        title: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
        content: fileContent,
        type: fileType,
        status: 'in-progress' as const,
        tags: newDraftTags.split(',').map(tag => tag.trim()).filter(Boolean),
      };
      
      await processDraft(newDraft);
      
    } catch (error) {
      console.error('File upload error:', error);
      setUploadError(error instanceof Error ? error.message : 'Unknown error uploading file');
    } finally {
      setIsCreatingDraft(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Handle manual draft creation
  const handleCreateDraft = async () => {
    if (!user) {
      setUploadError('You must be logged in to create drafts.');
      return;
    }

    if (!newDraftTitle || !newDraftContent) {
      setUploadError('Title and content are required');
      return;
    }
    
    if (draftExists(newDraftTitle)) {
      setUploadError('A draft with this title already exists');
      return;
    }
    
    // Create a draft object with correct types
    const newDraft: Omit<SavedDraft, 'id' | 'dateAdded' | 'userId'> = {
      title: newDraftTitle,
      content: newDraftContent,
      type: 'text' as const,
      status: newDraftStatus,
      tags: newDraftTags.split(',').map(tag => tag.trim()).filter(Boolean),
    };

    await processDraft(newDraft);
  };

  // Load draft summary
  const handleViewSummary = async (draft: SavedDraft) => {
    setCurrentSummaryDraft(draft);
    setShowSummaryModal(true);
    
    // If it already has a summary, no need to fetch
    if (draft.summary && draft.sections) {
      return;
    }
    
    try {
      setSummaryLoading(true);
      
      // Generate a summary
      const response = await fetch('/api/summarize-draft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ draft }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate summary');
      }
      
      const summaryData = await response.json();
      
      // Update the draft with summary data
      updateDraft(draft.id, {
        summary: summaryData.overallSummary,
        sections: summaryData.sections,
        wordCount: summaryData.wordCount
      });
      
      // Update the current summary draft
      setCurrentSummaryDraft({
        ...draft,
        summary: summaryData.overallSummary,
        sections: summaryData.sections,
        wordCount: summaryData.wordCount
      });
      
    } catch (error) {
      console.error('Summary generation error:', error);
    } finally {
      setSummaryLoading(false);
    }
  };

  // Format date for display
  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Check if it's today
    if (date.toDateString() === today.toDateString()) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // Check if it's yesterday
    if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // Otherwise return full date
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className={`w-10 h-10 border-t-2 ${darkMode ? 'border-teal-500' : 'border-teal-600'} border-solid rounded-full animate-spin`}></div>
      </div>
    );
  }

  return (
    <div className={`${darkMode ? 'bg-slate-800 text-slate-200' : 'bg-white text-slate-800'} rounded-lg ${darkMode ? 'border-slate-700' : 'border-slate-200'} overflow-hidden transition-colors duration-300`}>
      {/* Header with controls */}
      <div className={`p-4 ${darkMode ? 'bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-700' : 'bg-gradient-to-r from-teal-50 to-emerald-50 border-b border-slate-200'}`}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
          <h2 className={`text-xl font-medium ${darkMode ? 'text-slate-200' : 'text-slate-800'} flex items-center`}>
            <svg className={`w-6 h-6 mr-2 ${darkMode ? 'text-teal-400' : 'text-teal-700'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Saved Drafts
            <span className={`ml-2 text-sm font-normal ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              ({drafts.length})
            </span>
          </h2>
          
          <div className="flex items-center space-x-2">
            {/* Display modes */}
            <div className={`flex border overflow-hidden rounded ${darkMode ? 'border-slate-600' : 'border-slate-200'} mr-2`}>
              <button
                onClick={() => setDisplayMode('table')}
                className={`p-1.5 ${displayMode === 'table' 
                  ? darkMode ? 'bg-slate-700 text-slate-200' : 'bg-teal-100 text-teal-800'
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
                  ? darkMode ? 'bg-slate-700 text-slate-200' : 'bg-teal-100 text-teal-800'
                  : darkMode ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-white text-slate-500 hover:bg-slate-100'}`}
                title="Grid view"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                </svg>
              </button>
            </div>
          
            <button
              onClick={() => setShowAddModal(true)}
              className={`px-3 py-1.5 text-sm ${darkMode ? 'bg-teal-600 hover:bg-teal-700' : 'bg-teal-600 hover:bg-teal-700'} text-white rounded transition-colors flex items-center`}
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add New Draft
            </button>
          </div>
        </div>
        
        {/* Search and filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className={`h-5 w-5 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search drafts..."
              className={`pl-10 p-2 border ${darkMode ? 'bg-slate-700 border-slate-600 text-slate-200 placeholder-slate-400' : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400'} rounded-md w-full focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors duration-300`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap sm:flex-nowrap gap-2">
            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`p-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                darkMode ? 'bg-slate-700 border-slate-600 text-slate-200' : 'bg-white border-slate-300 text-slate-800'
              } transition-colors duration-300`}
            >
              <option value="all">All Statuses</option>
              <option value="in-progress">In Progress</option>
              <option value="review">Review</option>
              <option value="final">Final</option>
            </select>
            
            {/* Sort dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className={`p-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                darkMode ? 'bg-slate-700 border-slate-600 text-slate-200' : 'bg-white border-slate-300 text-slate-800'
              } transition-colors duration-300`}
            >
              <option value="lastEdited">Sort by Last Edited</option>
              <option value="dateAdded">Sort by Date Added</option>
              <option value="title">Sort by Title</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Action toolbar */}
      <div className={`border-b p-2 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} transition-colors duration-300`}>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkDelete}
              disabled={selectedDrafts.length === 0}
              className={`p-1.5 rounded-md text-sm flex items-center gap-1 ${
                selectedDrafts.length > 0
                  ? darkMode 
                    ? 'text-red-400 hover:bg-red-900/30' 
                    : 'text-red-600 hover:bg-red-50'
                  : darkMode 
                    ? 'text-slate-500 cursor-not-allowed' 
                    : 'text-slate-400 cursor-not-allowed'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete {selectedDrafts.length > 0 ? `(${selectedDrafts.length})` : ''}
            </button>
            
            {/* Export button - New feature */}
            {selectedDrafts.length > 0 && (
              <button
                className={`p-1.5 rounded-md text-sm flex items-center gap-1 ${
                  darkMode 
                    ? 'text-indigo-400 hover:bg-indigo-900/30' 
                    : 'text-indigo-600 hover:bg-indigo-50'
                }`}
                title="Export selected drafts"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />
                </svg>
                Export Selected
              </button>
            )}
          </div>
          
          <div className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            {selectedDrafts.length > 0 
              ? `${selectedDrafts.length} selected` 
              : drafts.length > 0 
                ? `${filteredDrafts.length} of ${drafts.length} drafts`
                : 'No drafts saved yet'}
          </div>
        </div>
      </div>

      {/* Table View */}
      {displayMode === 'table' && (
        <div className="overflow-x-auto">
          <table className={`w-full text-left text-sm ${darkMode ? 'text-slate-300' : 'text-slate-800'}`}>
            <thead className={darkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-50 text-slate-600'}>
              <tr className="uppercase text-xs tracking-wider">
                <th className="py-2 px-3 font-medium">
                  <input
                    type="checkbox"
                    checked={selectedDrafts.length > 0 && selectedDrafts.length === filteredDrafts.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedDrafts(filteredDrafts.map(d => d.id));
                      } else {
                        setSelectedDrafts([]);
                      }
                    }}
                    className={`h-4 w-4 rounded ${
                      darkMode ? 'border-slate-600 text-teal-500 focus:ring-teal-400' : 'border-slate-300 text-teal-600 focus:ring-teal-500'
                    }`}
                  />
                </th>
                <th className="py-2 px-3 font-medium">Status</th>
                <th className="py-2 px-3 font-medium">Title</th>
                <th className="py-2 px-3 font-medium hidden md:table-cell">Preview</th>
                <th className="py-2 px-3 font-medium hidden lg:table-cell">Tags</th>
                

                <th className="py-2 px-3 font-medium">Words</th>
                <th className="py-2 px-3 font-medium">Last Updated</th>
                <th className="py-2 px-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${darkMode ? 'divide-slate-700/50' : 'divide-slate-200'}`}>
              {filteredDrafts.length === 0 ? (
                <tr>
                  <td colSpan={8} className={`py-8 text-center ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    No matching drafts found. Try adjusting your search.
                  </td>
                </tr>
              ) : (
                sortedDrafts.map((draft, index) => (
                  <tr 
                    key={draft.id}
                    className={`${
                      darkMode
                        ? index % 2 === 0 ? 'bg-slate-800/50' : 'bg-slate-800/30'
                        : index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                    } hover:${darkMode ? 'bg-slate-700/50' : 'bg-teal-50/70'} transition-colors cursor-pointer group`}
                    onClick={() => setExpandedId(expandedId === draft.id ? null : draft.id)}
                  >
                    <td className="py-2 px-3">
                      <input
                        type="checkbox"
                        checked={selectedDrafts.includes(draft.id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          toggleDraftSelection(draft.id);
                        }}
                        className={`h-4 w-4 rounded ${
                          darkMode ? 'border-slate-600 text-teal-500 focus:ring-teal-400' : 'border-slate-300 text-teal-600 focus:ring-teal-500'
                        }`}
                      />
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="mr-1.5">
                          {getDraftStatusIcon(draft.status)}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusBadgeClasses(draft.status)}`}>
                          {draft.status === 'in-progress' 
                            ? 'In Progress' 
                            : draft.status === 'review'
                              ? 'Review'
                              : 'Final'
                          }
                        </span>
                      </div>
                    </td>
                    <td className="py-2 px-3">
                      <div className="font-medium line-clamp-1">
                        {draft.title}
                      </div>
                    </td>
                    <td className="py-2 px-3 hidden md:table-cell">
                      <div className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'} max-w-xs overflow-hidden text-ellipsis line-clamp-1`}>
                        {truncateText(draft.content, 80)}
                      </div>
                    </td>
                    <td className="py-2 px-3 hidden lg:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {draft.tags && draft.tags.length > 0 ? 
                          draft.tags.slice(0, 3).map((tag, idx) => (
                            <span 
                              key={idx}
                              className={`px-1.5 py-0.5 text-xs ${
                                darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'
                              } rounded transition-colors duration-300`}
                            >
                              {tag}
                            </span>
                          )) : (
                            <span className={darkMode ? 'text-slate-500' : 'text-slate-400'}>—</span>
                          )
                        }
                        {draft.tags && draft.tags.length > 3 && (
                          <span className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>+{draft.tags.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap">
                      <span className={`text-xs font-mono ${darkMode ? 'text-teal-400' : 'text-teal-600'}`}>
                        {draft.wordCount?.toLocaleString() || '—'}
                      </span>
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap">
                      <span className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        {formatDate(draft.lastEdited || draft.dateAdded)}
                      </span>
                    </td>
                    <td className="py-2 px-3">
                      <div className="flex space-x-1 opacity-80 group-hover:opacity-100">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewSummary(draft);
                          }}
                          className={`p-1 ${
                            darkMode ? 'text-teal-400 hover:text-teal-300 hover:bg-slate-700' : 'text-teal-600 hover:text-teal-800 hover:bg-teal-50'
                          } rounded transition-colors`}
                          title="View summary"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(draft.content);
                            alert('Draft content copied to clipboard!');
                          }}
                          className={`p-1 ${
                            darkMode ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                          } rounded transition-colors`}
                          title="Copy content"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm('Are you sure you want to delete this draft?')) {
                              deleteDraft(draft.id);
                            }
                          }}
                          className={`p-1 ${
                            darkMode ? 'text-slate-400 hover:text-red-400 hover:bg-slate-700' : 'text-slate-500 hover:text-red-600 hover:bg-slate-100'
                          } rounded transition-colors`}
                          title="Delete draft"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

      {/* Grid View */}
      {displayMode === 'grid' && (
        <div className={`${drafts.length === 0 ? '' : 'overflow-y-auto max-h-[calc(100vh-350px)]'}`}>
          {drafts.length === 0 ? (
            <div className={`flex flex-col items-center justify-center py-16 px-4 text-center ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              <svg className={`w-16 h-16 ${darkMode ? 'text-slate-600' : 'text-slate-300'} mb-4`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <h3 className={`text-lg font-medium ${darkMode ? 'text-slate-200' : 'text-slate-700'} mb-1`}>No saved drafts yet</h3>
              <p className={`${darkMode ? 'text-slate-400' : 'text-slate-500'} max-w-md`}>
                Add your research drafts to enhance your analysis with personalized context.
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
              >
                Add New Draft
              </button>
            </div>
          ) : filteredDrafts.length === 0 ? (
            <div className={`flex flex-col items-center justify-center py-16 px-4 text-center ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              <svg className={`w-12 h-12 ${darkMode ? 'text-slate-600' : 'text-slate-300'} mb-2`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h3 className={`text-lg font-medium ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>No matching drafts</h3>
              <p className={`${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Try adjusting your search criteria</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
              {sortedDrafts.map((draft) => (
                <div 
                  key={draft.id}
                  className={`rounded-lg border transition-colors h-full ${
                    selectedDrafts.includes(draft.id) 
                      ? darkMode 
                        ? 'border-teal-500 bg-teal-900/20' 
                        : 'border-teal-400 bg-teal-50/50' 
                      : darkMode 
                        ? 'border-slate-700 hover:border-teal-500/50 bg-slate-800/70' 
                        : 'border-slate-200 hover:border-teal-200 bg-white'
                  }`}
                >
                  <div className="p-4 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-3">
                      {/* Status icon */}
                      <div className="flex items-center">
                        {getDraftStatusIcon(draft.status)}
                      </div>
                      
                      {/* Checkbox for selection */}
                      <input
                        type="checkbox"
                        checked={selectedDrafts.includes(draft.id)}
                        onChange={() => toggleDraftSelection(draft.id)}
                        className={`h-4 w-4 rounded ${
                          darkMode ? 'border-slate-600 text-teal-500 focus:ring-teal-400' : 'border-slate-300 text-teal-600 focus:ring-teal-500'
                        }`}
                      />
                    </div>
                    
                    {/* Draft details */}
                    <div 
                      className="flex-1 cursor-pointer"
                      onClick={() => setExpandedId(expandedId === draft.id ? null : draft.id)}
                    >
                      <h3 className={`font-medium ${darkMode ? 'text-slate-200' : 'text-slate-800'} mb-1 leading-tight line-clamp-2`}>
                        {draft.title}
                      </h3>
                      
                      {/* Word count and date */}
                      <div className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'} mb-2 flex items-center`}>
                        <span>{draft.wordCount || 'Unknown'} words</span>
                        <span className="mx-1">•</span>
                        <span>
                          {draft.lastEdited 
                            ? `Last edited: ${formatDate(draft.lastEdited)}`
                            : `Added: ${formatDate(draft.dateAdded)}`
                          }
                        </span>
                      </div>
                      
                      {/* Content preview */}
                      <p className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'} mb-2 line-clamp-3`}>
                        {truncateText(draft.content, 150)}
                      </p>
                      
                      {/* Show summary preview if available */}
                      {draft.summary && (
                        <div className={`mb-2 p-2 rounded text-sm ${
                          darkMode ? 'bg-slate-700/50 text-slate-300' : 'bg-slate-50 text-slate-700'
                        }`}>
                          <div className={`text-xs font-medium mb-1 ${
                            darkMode ? 'text-slate-400' : 'text-slate-500'
                          }`}>SUMMARY:</div>
                          <p className="line-clamp-2">{truncateText(draft.summary, 120)}</p>
                        </div>
                      )}
                      
                      {/* Tags if available */}
                      {draft.tags && draft.tags.length > 0 && (
                        <div className="mb-2 flex flex-wrap gap-1">
                          {draft.tags.map((tag, index) => (
                            <span 
                              key={index}
                              className={`text-xs px-1.5 py-0.5 ${
                                darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'
                              } rounded transition-colors duration-300`}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      {/* Status label */}
                      <div className="mb-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusBadgeClasses(draft.status)}`}>
                          {draft.status === 'in-progress' 
                            ? 'In Progress' 
                            : draft.status === 'review'
                              ? 'Review'
                              : 'Final'
                          }
                        </span>
                      </div>
                    </div>
                    
                    {/* Action buttons */}
                    <div className={`flex justify-between mt-3 pt-3 border-t ${
                      darkMode ? 'border-slate-700' : 'border-slate-100'
                    }`}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewSummary(draft);
                        }}
                        className={`px-2 py-1 text-xs ${
                          darkMode ? 'bg-teal-600 hover:bg-teal-700' : 'bg-teal-600 hover:bg-teal-700'
                        } text-white rounded transition-colors flex items-center`}
                      >
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        View Summary
                      </button>
                      
                      <div className="flex space-x-1">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(draft.content);
                            alert('Draft content copied to clipboard!');
                          }}
                          className={`p-1 ${
                            darkMode ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                          } rounded transition-colors`}
                          title="Copy content"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm('Are you sure you want to delete this draft?')) {
                              deleteDraft(draft.id);
                            }
                          }}
                          className={`p-1 ${
                            darkMode ? 'text-slate-400 hover:text-red-400 hover:bg-slate-700' : 'text-slate-500 hover:text-red-700 hover:bg-red-50'
                          } rounded transition-colors`}
                          title="Delete draft"
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
      )}
      
      {/* Empty state footer */}
      {drafts.length === 0 && (
        <div className={`p-4 ${darkMode ? 'bg-slate-700 border-t border-slate-600' : 'bg-slate-50 border-t border-slate-200'} text-center transition-colors duration-300`}>
          <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Adding drafts will provide your existing sources with additional context during analysis.
          </p>
        </div>
      )}
      
      {/* Add draft modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`${darkMode ? 'bg-slate-800 text-slate-200' : 'bg-white text-slate-800'} rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto transition-colors duration-300`}>
            <div className={`p-4 border-b ${darkMode ? 'border-slate-700 bg-gradient-to-r from-slate-800 to-slate-900' : 'border-gray-200 bg-teal-50'}`}>
              <h3 className={`font-bold text-lg ${darkMode ? 'text-slate-200' : 'text-teal-900'}`}>Add New Draft</h3>
              <button 
                onClick={() => {
                  setShowAddModal(false);
                  setNewDraftTitle('');
                  setNewDraftContent('');
                  setNewDraftTags('');
                  setUploadError(null);
                }}
                className={`absolute top-4 right-4 ${darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-gray-500 hover:text-gray-800'} text-2xl`}
              >
                &times;
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Title field */}
              <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'} mb-1`}>
                  Draft Title*
                </label>
                <input
                  type="text"
                  value={newDraftTitle}
                  onChange={(e) => setNewDraftTitle(e.target.value)}
                  className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${
                    darkMode ? 'bg-slate-700 border-slate-600 text-slate-200 placeholder-slate-400' : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400'
                  } transition-colors duration-300`}
                  placeholder="Enter a title for your draft"
                  disabled={isCreatingDraft}
                />
              </div>
              
              {/* Content field */}
              <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'} mb-1`}>
                  Draft Content*
                </label>
                <textarea
                  value={newDraftContent}
                  onChange={(e) => setNewDraftContent(e.target.value)}
                  className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 h-64 ${
                    darkMode ? 'bg-slate-700 border-slate-600 text-slate-200 placeholder-slate-400' : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400'
                  } transition-colors duration-300`}
                  placeholder="Enter or paste your draft content here"
                  disabled={isCreatingDraft}
                />
              </div>
              
              {/* Status selection */}
              <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'} mb-1`}>
                  Draft Status
                </label>
                <select
                  value={newDraftStatus}
                  onChange={(e) => setNewDraftStatus(e.target.value as any)}
                  className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${
                    darkMode ? 'bg-slate-700 border-slate-600 text-slate-200' : 'bg-white border-slate-300 text-slate-800'
                  } transition-colors duration-300`}
                  disabled={isCreatingDraft}
                >
                  <option value="in-progress">In Progress</option>
                  <option value="review">Review</option>
                  <option value="final">Final</option>
                </select>
              </div>
              
              {/* Tags field */}
              <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'} mb-1`}>
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={newDraftTags}
                  onChange={(e) => setNewDraftTags(e.target.value)}
                  className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${
                    darkMode ? 'bg-slate-700 border-slate-600 text-slate-200 placeholder-slate-400' : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400'
                  } transition-colors duration-300`}
                  placeholder="research, article, history, etc."
                  disabled={isCreatingDraft}
                />
              </div>
              
              {/* File upload option */}
              <div className="mt-4">
                <div className={`text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'} mb-1`}>
                  Or Upload a File
                </div>
                <div className={`border-2 border-dashed rounded-md p-4 text-center ${
                  darkMode ? 'border-slate-600 hover:border-teal-500/70' : 'border-slate-300 hover:border-teal-500/70'
                } transition-colors duration-300`}>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                    accept=".txt,.pdf,.docx"
                    disabled={isCreatingDraft}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className={`px-4 py-2 ${
                      darkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    } rounded-md transition-colors`}
                    disabled={isCreatingDraft}
                  >
                    Choose File
                  </button>
                  <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'} mt-2`}>
                    Supports .txt, .pdf, and .docx files (max 10MB)
                  </p>
                </div>
              </div>
              
              {/* Error message */}
              {uploadError && (
                <div className={`${
                  darkMode ? 'bg-red-900/30 border border-red-800/40 text-red-300' : 'bg-red-50 border border-red-200 text-red-700'
                } px-4 py-3 rounded-md text-sm`}>
                  {uploadError}
                </div>
              )}
            </div>
            
            <div className={`p-4 border-t ${
              darkMode ? 'border-slate-700 bg-slate-800/50' : 'border-gray-200 bg-slate-50'
            } flex justify-end transition-colors duration-300`}>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewDraftTitle('');
                  setNewDraftContent('');
                  setNewDraftTags('');
                  setUploadError(null);
                }}
                className={`px-4 py-2 ${
                  darkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-200 text-slate-800 hover:bg-slate-300'
                } rounded mr-2 transition-colors`}
                disabled={isCreatingDraft}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateDraft}
                disabled={isCreatingDraft || !newDraftTitle || !newDraftContent}
                className={`px-4 py-2 text-white rounded flex items-center ${
                  isCreatingDraft || !newDraftTitle || !newDraftContent
                    ? darkMode ? 'bg-slate-600 cursor-not-allowed' : 'bg-slate-400 cursor-not-allowed'
                    : 'bg-teal-600 hover:bg-teal-700'
                } transition-colors duration-300`}
              >
                
                {isCreatingDraft && (
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {isCreatingDraft ? 'Processing...' : 'Create Draft'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Summary modal */}
      {showSummaryModal && currentSummaryDraft && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`${darkMode ? 'bg-slate-800 text-slate-200' : 'bg-white text-slate-800'} rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto transition-colors duration-300`}>
            <div className={`p-4 border-b flex justify-between items-center ${
              darkMode ? 'border-slate-700 bg-gradient-to-r from-slate-800 to-slate-900' : 'border-gray-200 bg-teal-50'
            }`}>
              <h3 className={`font-bold text-lg ${darkMode ? 'text-slate-200' : 'text-teal-900'}`}>
                {currentSummaryDraft.title}
              </h3>
              <button 
                onClick={() => {
                  setShowSummaryModal(false);
                  setCurrentSummaryDraft(null);
                }}
                className={`${darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-gray-500 hover:text-gray-800'} text-2xl`}
              >
                &times;
              </button>
            </div>
            
            <div className="p-6">
              {summaryLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className={`w-12 h-12 border-t-2 ${darkMode ? 'border-teal-500' : 'border-teal-600'} border-solid rounded-full animate-spin mb-4`}></div>
                  <p className={darkMode ? 'text-slate-300' : 'text-slate-600'}>Generating summary...</p>
                </div>
              ) : (
                <>
                  {/* Draft info */}
                  <div className="mb-6 flex flex-wrap gap-x-4 gap-y-2 text-sm">
                    <div className={`flex items-center ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Last edited: {formatDate(currentSummaryDraft.lastEdited || currentSummaryDraft.dateAdded)}
                    </div>
                    <div className={`flex items-center ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                      </svg>
                      {currentSummaryDraft.wordCount?.toLocaleString() || 'Unknown'} words
                    </div>
                    <div className="flex items-center">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusBadgeClasses(currentSummaryDraft.status)}`}>
                        {currentSummaryDraft.status === 'in-progress' 
                          ? 'In Progress' 
                          : currentSummaryDraft.status === 'review'
                            ? 'Review'
                            : 'Final'
                        }
                      </span>
                    </div>
                  </div>
                  
                  {/* Overall summary */}
                  <div className="mb-6">
                    <h4 className={`text-lg font-medium ${darkMode ? 'text-teal-400 border-b border-slate-700' : 'text-slate-800 border-b border-slate-200'} pb-1`}>
                      Overall Summary
                    </h4>
                    <p className={`mt-3 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      {currentSummaryDraft.summary || "No summary available. Click the 'Regenerate Summary' button to create one."}
                    </p>
                  </div>
                  
                  {/* Sectioned summary */}
                  {currentSummaryDraft.sections && currentSummaryDraft.sections.length > 0 && (
                    <div>
                      <h4 className={`text-lg font-medium ${darkMode ? 'text-teal-400 border-b border-slate-700' : 'text-slate-800 border-b border-slate-200'} pb-1 mb-4`}>
                        Sections
                      </h4>
                      <div className="space-y-4">
                        {currentSummaryDraft.sections.map((section, index) => (
                          <div key={section.id} className={`border rounded-lg overflow-hidden ${
                            darkMode ? 'border-slate-700' : 'border-slate-200'
                          }`}>
                            <div 
                              className={`flex justify-between items-center p-3 border-b cursor-pointer ${
                                darkMode ? 'bg-slate-700/50 border-slate-700' : 'bg-slate-50 border-slate-200'
                              }`}
                              onClick={() => setExpandedId(expandedId === section.id ? null : section.id)}
                            >
                              <h5 className={`font-medium ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>{section.title}</h5>
                              <svg 
                                className={`w-5 h-5 ${darkMode ? 'text-slate-400' : 'text-slate-500'} transition-transform ${expandedId === section.id ? 'rotate-180' : ''}`} 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                            
                            {/* Section summary always visible */}
                            <div className={`p-3 border-b ${
                              darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                            }`}>
                              <p className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{section.summary}</p>
                            </div>
                            
                            {/* Expandable full text */}
                            {expandedId === section.id && (
                              <div className={`p-3 text-sm max-h-60 overflow-y-auto ${
                                darkMode ? 'bg-slate-700/50 text-slate-300' : 'bg-slate-50 text-slate-600'
                              }`}>
                                {section.fullText}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
            
            <div className={`p-4 border-t flex justify-between ${
              darkMode ? 'border-slate-700 bg-slate-800/50' : 'border-gray-200 bg-slate-50'
            }`}>
              <button
                onClick={() => {
                  // Handle regenerating summary
                  if (currentSummaryDraft) {
                    handleViewSummary(currentSummaryDraft);
                  }
                }}
                className={`px-4 py-2 flex items-center ${
                  darkMode 
                    ? 'bg-teal-900/50 text-teal-300 border border-teal-800/50 hover:bg-teal-900/70' 
                    : 'bg-teal-100 text-teal-800 border border-teal-200 hover:bg-teal-200'
                } rounded transition-colors`}
                disabled={summaryLoading}
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Regenerate Summary
              </button>
              
              <button
                onClick={() => {
                  setShowSummaryModal(false);
                  setCurrentSummaryDraft(null);
                }}
                className={`px-4 py-2 ${
                  darkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-200 text-slate-800 hover:bg-slate-300'
                } rounded transition-colors`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

