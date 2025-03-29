// components/library/SavedDraftsPanel.tsx
// Panel for managing user-created draft documents
// Features draft uploads, summarization, and selection for context enhancement

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useLibrary, SavedDraft } from '@/lib/libraryContext';
import { useAppStore } from '@/lib/store';

export default function SavedDraftsPanel() {
  const router = useRouter();
  const { 
    drafts, 
    addDraft, 
    updateDraft, 
    deleteDraft,
    draftExists
  } = useLibrary();
  const { setLoading } = useAppStore();
  
  // Local state
  const [selectedDrafts, setSelectedDrafts] = useState<string[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'dateAdded' | 'lastEdited' | 'title'>('lastEdited');
  
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
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        );
      case 'review':
        return (
          <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'final':
        return (
          <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

  // Create or update draft with summary
  const processDraft = async (draft: Partial<SavedDraft> & {content: string, title: string}, isNew = true) => {
  try {
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
    
    // Add required properties for SafeDraft type
    const draftWithSummary: SavedDraft = {
      id: draft.id || crypto.randomUUID(), // Ensure ID exists
      dateAdded: draft.dateAdded || Date.now(), // Ensure dateAdded exists
      title: draft.title,
      content: draft.content,
      type: draft.type || 'text',
      status: draft.status || 'in-progress',
      tags: draft.tags || [],
      summary: summaryData.overallSummary,
      sections: summaryData.sections,
      wordCount: summaryData.wordCount
    };

    // Add or update the draft
    if (isNew) {
      addDraft(draftWithSummary);
    } else {
      updateDraft(draft.id!, draftWithSummary);
    }
    
    if (isNew) {
      setNewDraftTitle('');
      setNewDraftContent('');
      setNewDraftTags('');
      setShowAddModal(false);
    }
    
  } catch (error) {
    console.error('Draft processing error:', error);
    setUploadError(error instanceof Error ? error.message : 'Unknown error processing draft');
  } finally {
    setIsCreatingDraft(false);
  }
};

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
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
      const newDraft: Omit<SavedDraft, 'id' | 'dateAdded'> = {
        title: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
        content: fileContent,
        type: fileType,
        status: 'in-progress',
        tags: newDraftTags.split(',').map(tag => tag.trim()).filter(Boolean)
      };
      
await processDraft(newDraft as SavedDraft);
      
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
    if (!newDraftTitle || !newDraftContent) {
      setUploadError('Title and content are required');
      return;
    }
    
    if (draftExists(newDraftTitle)) {
      setUploadError('A draft with this title already exists');
      return;
    }
    
    // Create a draft object with correct variables
    const newDraft = {
      id: crypto.randomUUID(), // Generate temporary ID
      dateAdded: Date.now(),   // Add current timestamp
      title: newDraftTitle, // Fixed: use newDraftTitle instead of file.name
      content: newDraftContent, // Fixed: use newDraftContent instead of fileContent
      type: 'text', // Default type for manually created drafts
      status: newDraftStatus,
      tags: newDraftTags.split(',').map(tag => tag.trim()).filter(Boolean)
    } as SavedDraft;

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="w-10 h-10 border-t-2 border-teal-600 border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header with controls */}
      <div className="p-4 bg-gradient-to-r from-teal-50 to-emerald-50 border-b border-slate-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
          <h2 className="text-xl font-medium text-slate-800 flex items-center">
            <svg className="w-6 h-6 mr-2 text-teal-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Saved Drafts
            <span className="ml-2 text-sm font-normal text-slate-500">
              ({drafts.length})
            </span>
          </h2>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3 py-1.5 text-sm bg-teal-600 text-white rounded hover:bg-teal-700 transition-colors flex items-center"
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
              <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search drafts..."
              className="pl-10 p-2 border border-slate-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap sm:flex-nowrap gap-2">
            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="p-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
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
              className="p-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
            >
              <option value="lastEdited">Sort by Last Edited</option>
              <option value="dateAdded">Sort by Date Added</option>
              <option value="title">Sort by Title</option>
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
              disabled={selectedDrafts.length === 0}
              className={`p-1.5 rounded-md text-sm flex items-center gap-1 ${
                selectedDrafts.length > 0
                  ? 'text-red-600 hover:bg-red-50'
                  : 'text-slate-400 cursor-not-allowed'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete {selectedDrafts.length > 0 ? `(${selectedDrafts.length})` : ''}
            </button>
          </div>
          
          <div className="text-xs text-slate-500">
            {selectedDrafts.length > 0 
              ? `${selectedDrafts.length} selected` 
              : drafts.length > 0 
                ? `${filteredDrafts.length} of ${drafts.length} drafts`
                : 'No drafts saved yet'}
          </div>
        </div>
      </div>

      {/* Drafts list */}
      <div className="overflow-y-auto max-h-[calc(100vh-350px)]">
        {drafts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <svg className="w-16 h-16 text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <h3 className="text-lg font-medium text-slate-700 mb-1">No saved drafts yet</h3>
            <p className="text-slate-500 max-w-md">
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
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <svg className="w-12 h-12 text-slate-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 className="text-lg font-medium text-slate-700">No matching drafts</h3>
            <p className="text-slate-500">Try adjusting your search criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {sortedDrafts.map((draft) => (
              <div 
                key={draft.id}
                className={`rounded-lg border transition-colors h-full ${
                  selectedDrafts.includes(draft.id) 
                    ? 'border-teal-400 bg-teal-50/50' 
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
                      className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                    />
                  </div>
                  
                  {/* Draft details */}
                  <div 
                    className="flex-1 cursor-pointer"
                    onClick={() => setExpandedId(expandedId === draft.id ? null : draft.id)}
                  >
                    <h3 className="font-medium text-slate-800 mb-1 leading-tight line-clamp-2">
                      {draft.title}
                    </h3>
                    
                    {/* Word count and date */}
                    <div className="text-xs text-slate-500 mb-2 flex items-center">
                      <span>{draft.wordCount || 'Unknown'} words</span>
                      <span className="mx-1">•</span>
                      <span>
                        {draft.lastEdited 
                          ? `Last edited: ${new Date(draft.lastEdited).toLocaleDateString()}`
                          : `Added: ${new Date(draft.dateAdded).toLocaleDateString()}`
                        }
                      </span>
                    </div>
                    
                    {/* Content preview */}
                    <p className="text-sm text-slate-600 mb-2 line-clamp-3">
                      {truncateText(draft.content, 150)}
                    </p>
                    
                    {/* Tags if available */}
                    {draft.tags && draft.tags.length > 0 && (
                      <div className="mb-2 flex flex-wrap gap-1">
                        {draft.tags.map((tag, index) => (
                          <span 
                            key={index}
                            className="text-xs px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {/* Status label */}
                    <div className="mb-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        draft.status === 'in-progress' 
                          ? 'bg-blue-100 text-blue-800' 
                          : draft.status === 'review'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                      }`}>
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
                  <div className="flex justify-between mt-3 pt-3 border-t border-slate-100">
                    <button
                      onClick={() => handleViewSummary(draft)}
                      className="px-2 py-1 text-xs bg-teal-600 text-white rounded hover:bg-teal-700 transition-colors flex items-center"
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
                        className="p-1 text-slate-500 hover:text-slate-700 rounded hover:bg-slate-50"
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
                        className="p-1 text-red-500 hover:text-red-700 rounded hover:bg-red-50"
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
      
      {/* Empty state footer */}
      {drafts.length === 0 && (
        <div className="p-4 bg-slate-50 border-t border-slate-200 text-center">
          <p className="text-sm text-slate-500">
            Adding drafts will provide your existing sources with additional context during analysis.
          </p>
        </div>
      )}
      
      {/* Add draft modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-teal-50">
              <h3 className="font-bold text-lg text-teal-900">Add New Draft</h3>
              <button 
                onClick={() => {
                  setShowAddModal(false);
                  setNewDraftTitle('');
                  setNewDraftContent('');
                  setNewDraftTags('');
                  setUploadError(null);
                }}
                className="text-gray-500 hover:text-gray-800 text-2xl"
              >
                &times;
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Title field */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Draft Title*
                </label>
                <input
                  type="text"
                  value={newDraftTitle}
                  onChange={(e) => setNewDraftTitle(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  placeholder="Enter a title for your draft"
                  disabled={isCreatingDraft}
                />
              </div>
              
              {/* Content field */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Draft Content*
                </label>
                <textarea
                  value={newDraftContent}
                  onChange={(e) => setNewDraftContent(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 h-64"
                  placeholder="Enter or paste your draft content here"
                  disabled={isCreatingDraft}
                />
              </div>
              
              {/* Status selection */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Draft Status
                </label>
                <select
                  value={newDraftStatus}
                  onChange={(e) => setNewDraftStatus(e.target.value as any)}
                  className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  disabled={isCreatingDraft}
                >
                  <option value="in-progress">In Progress</option>
                  <option value="review">Review</option>
                  <option value="final">Final</option>
                </select>
              </div>
              
              {/* Tags field */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={newDraftTags}
                  onChange={(e) => setNewDraftTags(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  placeholder="research, article, history, etc."
                  disabled={isCreatingDraft}
                />
              </div>
              
              {/* File upload option */}
              <div className="mt-4">
                <div className="text-sm font-medium text-slate-700 mb-1">
                  Or Upload a File
                </div>
                <div className="border-2 border-dashed border-slate-300 rounded-md p-4 text-center">
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
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 transition-colors"
                    disabled={isCreatingDraft}
                  >
                    Choose File
                  </button>
                  <p className="text-xs text-slate-500 mt-2">
                    Supports .txt, .pdf, and .docx files (max 10MB)
                  </p>
                </div>
              </div>
              
              {/* Error message */}
              {uploadError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                  {uploadError}
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-gray-200 bg-slate-50 flex justify-end">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewDraftTitle('');
                  setNewDraftContent('');
                  setNewDraftTags('');
                  setUploadError(null);
                }}
                className="px-4 py-2 bg-slate-200 text-slate-800 rounded mr-2 hover:bg-slate-300 transition-colors"
                disabled={isCreatingDraft}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateDraft}
                disabled={isCreatingDraft || !newDraftTitle || !newDraftContent}
                className={`px-4 py-2 text-white rounded flex items-center ${
                  isCreatingDraft || !newDraftTitle || !newDraftContent
                    ? 'bg-slate-400 cursor-not-allowed'
                    : 'bg-teal-600 hover:bg-teal-700'
                }`}
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
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-teal-50">
              <h3 className="font-bold text-lg text-teal-900">
                {currentSummaryDraft.title}
              </h3>
              <button 
                onClick={() => {
                  setShowSummaryModal(false);
                  setCurrentSummaryDraft(null);
                }}
                className="text-gray-500 hover:text-gray-800 text-2xl"
              >
                &times;
              </button>
            </div>
            
            <div className="p-6">
              {summaryLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-12 h-12 border-t-2 border-teal-600 border-solid rounded-full animate-spin mb-4"></div>
                  <p className="text-slate-600">Generating summary...</p>
                </div>
              ) : (
                <>
                  {/* Draft info */}
                  <div className="mb-6 flex flex-wrap gap-x-4 gap-y-2 text-sm">
                    <div className="flex items-center text-slate-500">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Last edited: {new Date(currentSummaryDraft.lastEdited || currentSummaryDraft.dateAdded).toLocaleDateString()}
                    </div>
                    <div className="flex items-center text-slate-500">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                      </svg>
                      {currentSummaryDraft.wordCount?.toLocaleString() || 'Unknown'} words
                    </div>
                    <div className="flex items-center">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        currentSummaryDraft.status === 'in-progress' 
                          ? 'bg-blue-100 text-blue-800' 
                          : currentSummaryDraft.status === 'review'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                      }`}>
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
                    <h4 className="text-lg font-medium text-slate-800 mb-2 border-b border-slate-200 pb-1">
                      Overall Summary
                    </h4>
                    <p className="text-slate-700">
                      {currentSummaryDraft.summary || "No summary available. Click the 'Regenerate Summary' button to create one."}
                    </p>
                  </div>
                  
                  {/* Sectioned summary */}
                  {currentSummaryDraft.sections && currentSummaryDraft.sections.length > 0 && (
                    <div>
                      <h4 className="text-lg font-medium text-slate-800 mb-4 border-b border-slate-200 pb-1">
                        Sections
                      </h4>
                      <div className="space-y-4">
                        {currentSummaryDraft.sections.map((section, index) => (
                          <div key={section.id} className="border border-slate-200 rounded-lg overflow-hidden">
                            <div 
                              className="flex justify-between items-center p-3 bg-slate-50 border-b border-slate-200 cursor-pointer"
                              onClick={() => setExpandedId(expandedId === section.id ? null : section.id)}
                            >
                              <h5 className="font-medium text-slate-800">{section.title}</h5>
                              <svg 
                                className={`w-5 h-5 text-slate-500 transition-transform ${expandedId === section.id ? 'rotate-180' : ''}`} 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                            
                            {/* Section summary always visible */}
                            <div className="p-3 border-b border-slate-200 bg-white">
                              <p className="text-sm text-slate-700">{section.summary}</p>
                            </div>
                            
                            {/* Expandable full text */}
                            {expandedId === section.id && (
                              <div className="p-3 bg-slate-50 text-sm text-slate-600 max-h-60 overflow-y-auto">
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
            
            <div className="p-4 border-t border-gray-200 bg-slate-50 flex justify-between">
              <button
                onClick={() => {
                  // Handle regenerating summary
                  if (currentSummaryDraft) {
                    handleViewSummary(currentSummaryDraft);
                  }
                }}
                className="px-4 py-2 bg-teal-100 text-teal-800 border border-teal-200 rounded hover:bg-teal-200 transition-colors flex items-center"
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
                className="px-4 py-2 bg-slate-200 text-slate-800 rounded hover:bg-slate-300 transition-colors"
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