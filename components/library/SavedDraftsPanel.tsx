// components/library/SavedDraftsPanel.tsx
// Streamlined draft management panel with efficient summarization
// Features draft creation, retrieval, filtering, and minimalist UI design

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useLibrary, SavedDraft } from '@/lib/libraryContext';
import { useAppStore } from '@/lib/store';
import { useAuth } from '@/lib/auth/authContext';
import Link from 'next/link';
import { useLibraryStorage } from '@/lib/libraryStorageProvider';

interface SavedDraftsPanelProps {
  darkMode?: boolean;
}

export default function SavedDraftsPanel({ darkMode = false }: SavedDraftsPanelProps) {
  const router = useRouter();
  const { drafts, addDraft, updateDraft, deleteDraft, draftExists } = useLibrary();
  const { user } = useAuth();

  // Core state
  const [selectedDrafts, setSelectedDrafts] = useState<string[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'dateAdded' | 'lastEdited' | 'title'>('lastEdited');
  const [displayMode, setDisplayMode] = useState<'grid' | 'table'>('grid');
  const { getFullItem } = useLibraryStorage();
  
  // Draft creation state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDraftTitle, setNewDraftTitle] = useState('');
  const [newDraftContent, setNewDraftContent] = useState('');
  const [newDraftStatus, setNewDraftStatus] = useState<'in-progress' | 'review' | 'final'>('in-progress');
  const [newDraftTags, setNewDraftTags] = useState('');
  const [isCreatingDraft, setIsCreatingDraft] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  // Summary state
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [currentSummaryDraft, setCurrentSummaryDraft] = useState<SavedDraft | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [processingSummaries, setProcessingSummaries] = useState<Set<string>>(new Set());

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  // Filter drafts
  const filteredDrafts = drafts.filter(draft => {
    // Status filtering
    if (statusFilter !== 'all' && draft.status !== statusFilter) {
      return false;
    }
    
    // Search filtering
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        draft.title.toLowerCase().includes(searchLower) ||
        (draft.summary?.toLowerCase().includes(searchLower)) ||
        (draft.tags && draft.tags.some(tag => tag.toLowerCase().includes(searchLower)))
      );
    }
    
    return true;
  });

  // Sort drafts
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

  // Core handlers
  const handleBulkDelete = () => {
    if (selectedDrafts.length === 0) return;
    
    if (confirm(`Delete ${selectedDrafts.length} selected draft${selectedDrafts.length > 1 ? 's' : ''}?`)) {
      selectedDrafts.forEach(id => deleteDraft(id));
      setSelectedDrafts([]);
      setExpandedId(null);
    }
  };

 const toggleDraftSelection = (
  id: string,
  e?: React.MouseEvent | React.ChangeEvent<HTMLInputElement>
) => {
    if (e) {
      e.stopPropagation();
    }
    
    setSelectedDrafts(prev => 
      prev.includes(id) 
        ? prev.filter(draftId => draftId !== id) 
        : [...prev, id]
    );
  };

  const toggleSectionExpand = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  // UI helper functions
  const truncateText = (text: string, maxLength: number): string => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).replace(/\s+\S*$/, '') + '...';
  };

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // UI elements
  const getStatusIcon = (status?: string) => {
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

  const getStatusBadge = (status?: string) => {
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
  // --- Draft CRUD operations ---

    // Function to trigger summary generation (can be called after add/update)
    const generateSummary = async (draftId: string, draftInfo: { id: string; title: string; content: string }) => {
      // Prevent generation if ID is missing
      if (!draftId) {
          console.error("generateSummary called without a valid draftId.");
          return;
      }

      // Add to processing set to prevent duplicates
      setProcessingSummaries(prev => new Set(prev).add(draftId));
      console.log(`generateSummary: Starting for draft ${draftId}`);

      try {
        const response = await fetch('/api/summarize-draft', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            draft: draftInfo, // Send only necessary info
            modelId: 'gemini-flash-lite' // Or use a configurable model
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({})); // Try to get error details
          throw new Error(`Summary API error: ${response.status} - ${errorData.message || 'Unknown API error'}`);
        }

        const summaryData = await response.json();
        console.log(`generateSummary: Received summary data for ${draftId}`, summaryData);

        // Prepare updates for the draft in the database
        const updates: Partial<SavedDraft> = {
          summary: summaryData.overallSummary,
          sections: summaryData.sections, // This now includes fullText from the API
          wordCount: summaryData.wordCount,
          // Update lastEdited since the summary/sections were updated
          lastEdited: Date.now()
        };

        // Update the draft in Supabase and local state via useLibrary hook
        await updateDraft(draftId, updates);
        console.log(`generateSummary: Updated draft ${draftId} with summary data.`);

        // If this draft is currently being viewed in the summary modal, update that state too
        if (currentSummaryDraft?.id === draftId) {
          setCurrentSummaryDraft(prev => prev ? { ...prev, ...updates } : null);
          // Auto-expand first section if available
          if (summaryData.sections && summaryData.sections.length > 0) {
            setExpandedSections([summaryData.sections[0].id]);
          }
        }

      } catch (error) {
        console.error(`generateSummary: Error for draft ${draftId}:`, error);
        try {
          // Attempt to update the draft with an error message for the summary
          await updateDraft(draftId, {
            summary: 'Error: Summary generation failed.',
            sections: [], // Clear sections on error
            lastEdited: Date.now()
          });
        } catch (updateError) {
          console.error(`generateSummary: Failed to update draft ${draftId} with error status:`, updateError);
        }
      } finally {
        // Remove from processing set
        setProcessingSummaries(prev => {
          const newSet = new Set(prev);
          newSet.delete(draftId);
          return newSet;
        });
         // Ensure loading spinner in modal stops if this was the draft being viewed
         if (currentSummaryDraft?.id === draftId) {
             setSummaryLoading(false);
         }
      }
    };

    // Create a new draft manually
    const createDraft = async () => {
      if (!user) {
        setUploadError('You must be logged in to create drafts.');
        return;
      }
      if (!newDraftTitle || !newDraftContent) {
        setUploadError('Title and content are required.');
        return;
      }
      if (draftExists(newDraftTitle)) {
        setUploadError('A draft with this title already exists.');
        return;
      }

      setIsCreatingDraft(true);
      setUploadError(null);

      try {
        const wordCount = newDraftContent.split(/\s+/).filter(Boolean).length;

        // 1. Add the draft with basic info (including FULL content) FIRST
        // Set summary to a placeholder indicating generation is pending
        const draftDataForAdd: Omit<SavedDraft, 'id' | 'dateAdded' | 'userId'> = {
          title: newDraftTitle,
          content: newDraftContent,
          type: 'text', // Assuming manual creation is always text
          status: newDraftStatus,
          tags: newDraftTags.split(',').map(tag => tag.trim()).filter(Boolean),
          summary: 'Processing summary & sections...', // Placeholder
          sections: [], // Start with empty sections
          wordCount,
          // lastEdited will be set by addDraft/updateDraft
        };

        const draftId = await addDraft(draftDataForAdd);
        console.log(`Draft created with ID: ${draftId}. Triggering summary generation.`);

        // 2. Trigger summary/section generation asynchronously
        // Pass only necessary info to the generation function
        generateSummary(draftId, {
            id: draftId,
            title: newDraftTitle,
            content: newDraftContent // API needs content to generate summary/sections
        });

        // 3. Reset form and close modal immediately
        setNewDraftTitle('');
        setNewDraftContent('');
        setNewDraftTags('');
        setNewDraftStatus('in-progress'); // Reset status too
        setShowAddModal(false);

      } catch (error) {
        console.error('Draft creation process error:', error);
        setUploadError(error instanceof Error ? error.message : 'Unknown error creating draft');
      } finally {
        setIsCreatingDraft(false);
      }
    };

    // Upload a file as a new draft
    const uploadFileAsDraft = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (!user) {
        setUploadError('You must be logged in to upload drafts.');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setUploadError('File too large. Maximum size is 10MB.');
        return;
      }

      setIsCreatingDraft(true);
      setUploadError(null);

      try {
        // Read file content
        const fileContent = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (event) => event.target?.result ? resolve(event.target.result as string) : reject(new Error('Failed to read file'));
          reader.onerror = () => reject(new Error('File read error'));
          reader.readAsText(file);
        });

        const fileType = (file.name.endsWith('.pdf') ? 'pdf' : file.name.endsWith('.docx') ? 'docx' : 'text') as 'pdf' | 'docx' | 'text';
        const wordCount = fileContent.split(/\s+/).filter(Boolean).length;
        const draftTitle = file.name.replace(/\.[^/.]+$/, ""); // Use filename as title

        // Check if draft with this title already exists
         if (draftExists(draftTitle)) {
             setUploadError(`A draft named "${draftTitle}" already exists. Please rename the file or delete the existing draft.`);
             setIsCreatingDraft(false);
              if (fileInputRef.current) fileInputRef.current.value = ''; // Reset file input
             return;
         }


        // 1. Add draft with full content and placeholder summary
        const draftDataForAdd: Omit<SavedDraft, 'id' | 'dateAdded' | 'userId'> = {
          title: draftTitle,
          content: fileContent,
          type: fileType,
          status: 'in-progress', // Default status
          tags: [], // Start with no tags for upload
          summary: 'Processing summary & sections...', // Placeholder
          sections: [],
          wordCount,
        };

        const draftId = await addDraft(draftDataForAdd);
         console.log(`Draft uploaded with ID: ${draftId}. Triggering summary generation.`);


        // 2. Trigger summary generation asynchronously
        generateSummary(draftId, {
            id: draftId,
            title: draftTitle,
            content: fileContent
        });

        // 3. Close modal if open (though upload might not be from modal)
         setShowAddModal(false);


      } catch (error) {
        console.error('File upload error:', error);
        setUploadError(error instanceof Error ? error.message : 'Unknown error uploading file');
      } finally {
        setIsCreatingDraft(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = ''; // Reset file input value
        }
      }
    };

    // View draft summary modal (handles fetching/regeneration)
    const viewDraftSummary = async (draft: SavedDraft) => {
        if (!draft || !draft.id) {
            console.error("viewDraftSummary called with invalid draft object");
            return;
        }

        setCurrentSummaryDraft(draft); // Set the draft to be viewed
        setShowSummaryModal(true);    // Open the modal
        setExpandedSections([]);      // Collapse all sections initially

        const needsGeneration = !draft.summary || draft.summary.includes('Generating') || !draft.sections || draft.sections.length === 0;
        const isAlreadyProcessing = processingSummaries.has(draft.id);

        console.log(`viewDraftSummary for ${draft.id}: Needs generation? ${needsGeneration}, Already processing? ${isAlreadyProcessing}`);

        // 1. If summary/sections exist and are valid, just display them
        if (!needsGeneration) {
            console.log(`Displaying existing summary/sections for draft ${draft.id}`);
            if (draft.sections && draft.sections.length > 0) {
                setExpandedSections([draft.sections[0].id]); // Expand first section
            }
            setSummaryLoading(false); // Ensure loading is off
            return;
        }

        // 2. If already processing, show spinner but don't restart
        if (isAlreadyProcessing) {
            console.log(`Summary generation already in progress for draft ${draft.id}`);
            setSummaryLoading(true);
            return;
        }

        // 3. Otherwise, trigger generation
        console.log(`Triggering summary generation for draft ${draft.id}`);
        setSummaryLoading(true);
        // Fetch full content first if needed (shouldn't be, draft object has it)
        // Ensure the draft object passed has content
       if (!draft.content) {
         console.error("Draft object passed to viewDraftSummary is missing content!");
         const fullDraft = await getFullItem<SavedDraft>('drafts', draft.id);

             if(fullDraft?.content) {
                 await generateSummary(draft.id, { id: draft.id, title: fullDraft.title, content: fullDraft.content });
             } else {
                 alert("Could not retrieve draft content to generate summary.");
                 setSummaryLoading(false);
                 setCurrentSummaryDraft(prev => prev ? {...prev, summary: "Error: Content missing"} : null);
             }
        } else {
            await generateSummary(draft.id, { id: draft.id, title: draft.title, content: draft.content });
            // setSummaryLoading(false) is handled within generateSummary's finally block
        }
    };


  // Expanded draft content view
  const openDraftEditor = (draftId: string) => {
    router.push(`/draft?id=${draftId}`);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className={`w-10 h-10 border-t-2 ${darkMode ? 'border-teal-500' : 'border-teal-600'} border-solid rounded-full animate-spin`}></div>
      </div>
    );
  }

  return (
    <div className={`${darkMode ? 'bg-slate-800 text-slate-200' : 'bg-white text-slate-800'} rounded-lg ${darkMode ? 'border-slate-700' : 'border-slate-200'} overflow-hidden`}>
      {/* Header */}
      <div className={`p-4 border-b ${darkMode ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-slate-50/50'}`}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
          <h2 className={`text-xl font-medium ${darkMode ? 'text-slate-200' : 'text-slate-800'} flex items-center`}>
            <svg className={`w-5 h-5 mr-2 ${darkMode ? 'text-teal-400' : 'text-teal-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Research Drafts
            <span className={`ml-2 text-sm font-normal ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              ({drafts.length})
            </span>
          </h2>
          
          <div className="flex items-center space-x-2">
            {/* Display mode toggle */}
            <div className={`flex border rounded overflow-hidden ${darkMode ? 'border-slate-600' : 'border-slate-200'}`}>
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
            
            {/* Add draft button */}
            <button
              onClick={() => setShowAddModal(true)}
              className={`px-3 py-1.5 text-sm flex items-center ${darkMode ? 'bg-teal-600 hover:bg-teal-700' : 'bg-teal-600 hover:bg-teal-700'} text-white rounded`}
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              New Draft
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
              className={`pl-10 p-2 border rounded-md w-full ${
                darkMode 
                  ? 'bg-slate-700 border-slate-600 text-slate-200 placeholder-slate-400 focus:ring-teal-500 focus:border-teal-500' 
                  : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400 focus:ring-teal-500 focus:border-teal-500'
              }`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap sm:flex-nowrap gap-2">
            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`p-2 border rounded-md text-sm ${
                darkMode ? 'bg-slate-700 border-slate-600 text-slate-200' : 'bg-white border-slate-300 text-slate-800'
              } focus:ring-teal-500 focus:border-teal-500`}
            >
              <option value="all">All Statuses</option>
              <option value="in-progress">In Progress</option>
              <option value="review">Review</option>
              <option value="final">Final</option>
            </select>
            
            {/* Sort dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'dateAdded' | 'lastEdited' | 'title')}
              className={`p-2 border rounded-md text-sm ${
                darkMode ? 'bg-slate-700 border-slate-600 text-slate-200' : 'bg-white border-slate-300 text-slate-800'
              } focus:ring-teal-500 focus:border-teal-500`}
            >
              <option value="lastEdited">Sort by Last Edited</option>
              <option value="dateAdded">Sort by Date Added</option>
              <option value="title">Sort by Title</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Action bar */}
      <div className={`px-4 py-2 border-b ${darkMode ? 'border-slate-700 bg-slate-800/80' : 'border-slate-200 bg-white'}`}>
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
            
            {/* Button to edit draft in new interface */}
            {selectedDrafts.length === 1 && (
              <button
                onClick={() => openDraftEditor(selectedDrafts[0])}
                className={`p-1.5 rounded-md text-sm flex items-center gap-1 ${
                  darkMode 
                    ? 'text-indigo-400 hover:bg-indigo-900/30' 
                    : 'text-indigo-600 hover:bg-indigo-50'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Draft
              </button>
            )}
            
            {/* Export button (for multiple selected drafts) */}
            {selectedDrafts.length > 0 && (
              <button
                className={`p-1.5 rounded-md text-sm flex items-center gap-1 ${
                  darkMode 
                    ? 'text-teal-400 hover:bg-teal-900/30' 
                    : 'text-teal-600 hover:bg-teal-50'
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
              : filteredDrafts.length > 0 
                ? `${filteredDrafts.length} of ${drafts.length} drafts`
                : 'No drafts saved yet'}
          </div>
        </div>
      </div>
      
      {/* Content area */}
      {drafts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <svg className={`w-16 h-16 ${darkMode ? 'text-slate-700' : 'text-slate-300'} mb-4`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          <h3 className={`text-lg font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'} mb-2`}>No drafts yet</h3>
          <p className={`${darkMode ? 'text-slate-400' : 'text-slate-500'} max-w-md mb-4`}>
            Create research drafts to enhance your analysis with personal context.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 transition-colors"
          >
            Create Your First Draft
          </button>
        </div>
      ) : filteredDrafts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <svg className={`w-12 h-12 ${darkMode ? 'text-slate-700' : 'text-slate-300'} mb-2`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h3 className={`text-lg font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'} mb-1`}>No matching drafts</h3>
          <p className={`${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Try adjusting your search or filters</p>
        </div>
      ) : (
        <>
          {/* Table View */}
          {displayMode === 'table' && (
            <div className="overflow-x-auto">
              <table className={`w-full ${darkMode ? 'text-slate-300' : 'text-slate-800'}`}>
                <thead className={darkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-50 text-slate-600'}>
                  <tr className="text-xs uppercase tracking-wider">
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
                          darkMode ? 'bg-slate-700 border-slate-600 text-teal-500 focus:ring-teal-500' : 'border-slate-300 text-teal-600 focus:ring-teal-500'
                        }`}
                      />
                    </th>
                    <th className="py-2 px-3 font-medium">Status</th>
                    <th className="py-2 px-3 font-medium">Title</th>
                    <th className="py-2 px-3 font-medium hidden md:table-cell">Summary</th>
                    <th className="py-2 px-3 font-medium hidden lg:table-cell">Tags</th>
                    <th className="py-2 px-3 font-medium">Words</th>
                    <th className="py-2 px-3 font-medium">Updated</th>
                    <th className="py-2 px-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${darkMode ? 'divide-slate-700' : 'divide-slate-200'}`}>
                  {sortedDrafts.map((draft, index) => (
                    <tr 
                      key={draft.id}
                      className={`${
                        darkMode
                          ? index % 2 === 0 ? 'bg-slate-800/50' : 'bg-slate-800/30'
                          : index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                      } hover:${darkMode ? 'bg-slate-700/50' : 'bg-teal-50/70'} transition-colors cursor-pointer`}
                      onClick={() => viewDraftSummary(draft)}
                    >
                      <td className="py-2 px-3">
                        <input
                          type="checkbox"
                          checked={selectedDrafts.includes(draft.id)}
                          onChange={(e) => toggleDraftSelection(draft.id, e)}
                          className={`h-4 w-4 rounded ${
                            darkMode ? 'bg-slate-700 border-slate-600 text-teal-500 focus:ring-teal-500' : 'border-slate-300 text-teal-600 focus:ring-teal-500'
                          }`}
                        />
                      </td>
                      <td className="py-2 px-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="mr-1.5">
                            {getStatusIcon(draft.status)}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusBadge(draft.status)}`}>
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
                        <div className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'} max-w-xs line-clamp-1`}>
                          {processingSummaries.has(draft.id) 
                            ? 'Generating summary...' 
                            : draft.summary 
                              ? truncateText(draft.summary, 80)
                              : 'No summary available'}
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
                                } rounded`}
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
                        <div className="flex space-x-1">
                          {/* Edit button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openDraftEditor(draft.id);
                            }}
                            className={`p-1.5 rounded ${
                              darkMode ? 'text-indigo-400 hover:bg-slate-700' : 'text-indigo-600 hover:bg-slate-100'
                            }`}
                            title="Edit draft"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          
                          {/* Copy button */}
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              navigator.clipboard.writeText(draft.content);
                              // Simple toast/alert
                              const toast = document.createElement('div');
                              toast.className = `fixed bottom-4 right-4 px-4 py-2 rounded ${
                                darkMode ? 'bg-slate-700 text-slate-200' : 'bg-slate-800 text-white'
                              } shadow-lg z-50`;
                              toast.textContent = 'Draft content copied to clipboard';
                              document.body.appendChild(toast);
                              setTimeout(() => document.body.removeChild(toast), 2000);
                            }}
                            className={`p-1.5 rounded ${
                              darkMode ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-500 hover:bg-slate-100'
                            }`}
                            title="Copy content"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </button>
                          
                          {/* Delete button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm('Are you sure you want to delete this draft?')) {
                                deleteDraft(draft.id);
                              }
                            }}
                            className={`p-1.5 rounded ${
                              darkMode ? 'text-slate-400 hover:text-red-400 hover:bg-slate-700' : 'text-slate-500 hover:text-red-600 hover:bg-slate-100'
                            }`}
                            title="Delete draft"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Grid View */}
          {displayMode === 'grid' && (
            <div className="overflow-y-auto max-h-[calc(100vh-350px)] p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedDrafts.map((draft) => (
                  <div 
                    key={draft.id}
                    className={`rounded-lg transition-all duration-200 h-full ${
                      selectedDrafts.includes(draft.id) 
                        ? darkMode 
                          ? 'border-2 border-teal-500 bg-teal-900/20' 
                          : 'border-2 border-teal-500 bg-teal-50/70' 
                        : darkMode 
                          ? 'border border-slate-700 hover:border-teal-500/30 bg-slate-800/90 hover:bg-slate-800/70' 
                          : 'border border-slate-200 hover:border-teal-300 bg-white hover:bg-teal-50/30'
                    }`}
                  >
                    <div className="p-4 flex flex-col h-full">
                      <div className="flex justify-between items-start mb-2">
                        {/* Status icon */}
                        <div className="flex items-center">
                          {getStatusIcon(draft.status)}
                        </div>
                        
                        {/* Checkbox for selection */}
                        <input
                          type="checkbox"
                          checked={selectedDrafts.includes(draft.id)}
                          onChange={(e) => toggleDraftSelection(draft.id, e)}
                          className={`h-4 w-4 rounded ${
                            darkMode ? 'bg-slate-700 border-slate-600 text-teal-500 focus:ring-teal-500' : 'border-slate-300 text-teal-600 focus:ring-teal-500'
                          }`}
                        />
                      </div>
                      
                      {/* Draft content */}
                      <div 
                        className="flex-1 cursor-pointer mb-3"
                        onClick={() => viewDraftSummary(draft)}
                      >
                        <h3 className={`font-medium ${darkMode ? 'text-slate-200' : 'text-slate-800'} leading-tight line-clamp-2 mb-1`}>
                          {draft.title}
                        </h3>
                        
                        {/* Word count and date */}
                        <div className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'} mb-2 flex items-center`}>
                          <span className="font-mono">{draft.wordCount?.toLocaleString() || '0'} words</span>
                          <span className="mx-1.5">•</span>
                          <span>
                            {draft.lastEdited 
                              ? `Updated ${formatDate(draft.lastEdited).toLowerCase()}`
                              : `Added ${formatDate(draft.dateAdded).toLowerCase()}`
                            }
                          </span>
                        </div>
                        
                        {/* Summary if available */}
                        <div className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'} mb-3 line-clamp-3`}>
                          {processingSummaries.has(draft.id) ? (
                            <div className="flex items-center text-xs italic">
                              <svg className="animate-spin h-3 w-3 mr-1.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Generating summary...
                            </div>
                          ) : draft.summary ? (
                            truncateText(draft.summary, 150)
                          ) : (
                            <span className="text-xs italic">Summary not available. Click to generate.</span>
                          )}
                        </div>
                        
                        {/* Tags if available */}
                        {draft.tags && draft.tags.length > 0 && (
                          <div className="mb-2 flex flex-wrap gap-1">
                            {draft.tags.map((tag, index) => (
                              <span 
                                key={index}
                                className={`text-xs px-1.5 py-0.5 ${
                                  darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'
                                } rounded`}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        
                        {/* Status badge */}
                        <div className="mb-2 mt-auto">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusBadge(draft.status)}`}>
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
                      <div className={`pt-2 mt-auto flex justify-between border-t ${
                        darkMode ? 'border-slate-700' : 'border-slate-100'
                      }`}>
                        <button
                          onClick={() => openDraftEditor(draft.id)}
                          className={`px-2 py-1 text-xs rounded flex items-center ${
                            darkMode ? 'bg-indigo-800/70 hover:bg-indigo-700 text-indigo-200' : 'bg-indigo-100 hover:bg-indigo-200 text-indigo-700'
                          }`}
                        >
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                          Edit
                        </button>
                        
                        <div className="flex space-x-1">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              navigator.clipboard.writeText(draft.content);
                              const toast = document.createElement('div');
                              toast.className = `fixed bottom-4 right-4 px-4 py-2 rounded ${
                                darkMode ? 'bg-slate-700 text-slate-200' : 'bg-slate-800 text-white'
                              } shadow-lg z-50`;
                              toast.textContent = 'Draft content copied';
                              document.body.appendChild(toast);
                              setTimeout(() => document.body.removeChild(toast), 2000);
                            }}
                            className={`p-1.5 rounded ${
                              darkMode ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                            }`}
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
                            className={`p-1.5 rounded ${
                              darkMode ? 'text-slate-400 hover:text-red-400 hover:bg-slate-700' : 'text-slate-500 hover:text-red-600 hover:bg-slate-100'
                            }`}
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
            </div>
          )}
        </>
      )}
      
      {/* Add Draft Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className={`max-w-2xl w-full m-4 rounded-lg shadow-xl overflow-hidden ${darkMode ? 'bg-slate-800 text-slate-200' : 'bg-white text-slate-800'}`}>
            <div className={`p-4 border-b ${darkMode ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-slate-50'}`}>
              <div className="flex justify-between items-center">
                <h3 className={`font-semibold text-lg ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                  Add New Draft
                </h3>
                <button 
                  onClick={() => {
                    setShowAddModal(false);
                    setNewDraftTitle('');
                    setNewDraftContent('');
                    setNewDraftTags('');
                    setUploadError(null);
                  }}
                  className={`${darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-gray-500 hover:text-gray-800'}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
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
                  className={`w-full p-2 border rounded-md ${
                    darkMode ? 'bg-slate-700 border-slate-600 text-slate-200 placeholder-slate-400' : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400'
                  } focus:ring-teal-500 focus:border-teal-500`}
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
                  className={`w-full p-2 border rounded-md h-48 ${
                    darkMode ? 'bg-slate-700 border-slate-600 text-slate-200 placeholder-slate-400' : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400'
                  } focus:ring-teal-500 focus:border-teal-500`}
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
                  onChange={(e) => setNewDraftStatus(e.target.value as 'in-progress' | 'review' | 'final')}
                  className={`w-full p-2 border rounded-md ${
                    darkMode ? 'bg-slate-700 border-slate-600 text-slate-200' : 'bg-white border-slate-300 text-slate-800'
                  } focus:ring-teal-500 focus:border-teal-500`}
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
                  className={`w-full p-2 border rounded-md ${
                    darkMode ? 'bg-slate-700 border-slate-600 text-slate-200 placeholder-slate-400' : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400'
                  } focus:ring-teal-500 focus:border-teal-500`}
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
                  darkMode ? 'border-slate-600 hover:border-teal-500/50' : 'border-slate-300 hover:border-teal-500/50'
                } transition-colors`}>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={uploadFileAsDraft}
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
              darkMode ? 'border-slate-700 bg-slate-800/80' : 'border-slate-200 bg-slate-50'
            } flex justify-end`}>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewDraftTitle('');
                  setNewDraftContent('');
                  setNewDraftTags('');
                  setUploadError(null);
                }}
                className={`px-4 py-2 mr-2 ${
                  darkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-200 text-slate-800 hover:bg-slate-300'
                } rounded transition-colors`}
                disabled={isCreatingDraft}
              >
                Cancel
              </button>
              <button
                onClick={createDraft}
                disabled={isCreatingDraft || !newDraftTitle || !newDraftContent}
                className={`px-4 py-2 text-white rounded flex items-center ${
                  isCreatingDraft || !newDraftTitle || !newDraftContent
                    ? darkMode ? 'bg-slate-600 cursor-not-allowed' : 'bg-slate-400 cursor-not-allowed'
                    : 'bg-teal-600 hover:bg-teal-700'
                } transition-colors`}
              >
                {isCreatingDraft && (
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {isCreatingDraft ? 'Creating...' : 'Create Draft'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Summary Modal */}
      {showSummaryModal && currentSummaryDraft && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className={`max-w-4xl w-full m-4 rounded-lg shadow-xl overflow-hidden max-h-[90vh] flex flex-col ${darkMode ? 'bg-slate-800 text-slate-200' : 'bg-white text-slate-800'}`}>
            <div className={`p-4 border-b ${darkMode ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-slate-50'}`}>
              <div className="flex justify-between items-center">
                <h3 className={`font-semibold text-lg ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                  {currentSummaryDraft.title}
                </h3>
                <button 
                  onClick={() => {
                    setShowSummaryModal(false);
                    setCurrentSummaryDraft(null);
                  }}
                  className={`${darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-gray-500 hover:text-gray-800'}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              {/* Loading spinner */}
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
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusBadge(currentSummaryDraft.status)}`}>
                        {currentSummaryDraft.status === 'in-progress' 
                          ? 'In Progress' 
                          : currentSummaryDraft.status === 'review'
                            ? 'Review'
                            : 'Final'
                        }
                      </span>
                    </div>
                  </div>
                  
                  {/* Draft actions */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    <button
                      onClick={() => openDraftEditor(currentSummaryDraft.id)}
                      className={`px-3 py-1.5 text-sm rounded flex items-center ${
                        darkMode ? 'bg-indigo-700 hover:bg-indigo-600 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      }`}
                    >
                      <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      Edit in Draft Editor
                    </button>
                    
                    <button
                      onClick={() => {
                        // Regenerate summary
                        generateSummary(currentSummaryDraft.id, {
                          id: currentSummaryDraft.id,
                          title: currentSummaryDraft.title,
                          content: currentSummaryDraft.content
                        });
                        setSummaryLoading(true);
                      }}
                      className={`px-3 py-1.5 text-sm rounded flex items-center ${
                        darkMode ? 'bg-teal-700 hover:bg-teal-600 text-white' : 'bg-teal-600 hover:bg-teal-700 text-white'
                      }`}
                      disabled={summaryLoading || processingSummaries.has(currentSummaryDraft.id)}
                    >
                      <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Regenerate Summary
                    </button>
                  </div>
                  
                  {/* Overall summary */}
                  <div className="mb-6">
                    <h4 className={`text-lg font-medium ${darkMode ? 'text-teal-400 border-b border-slate-700' : 'text-teal-700 border-b border-slate-200'} pb-2 mb-3`}>
                      Overall Summary
                    </h4>
                    <p className={`${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      {processingSummaries.has(currentSummaryDraft.id) 
                        ? (
                          <div className="flex items-center">
                            <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Generating summary...
                          </div>
                        ) 
                        : currentSummaryDraft.summary 
                          ? currentSummaryDraft.summary
                          : "No summary available. Click the 'Regenerate Summary' button to create one."
                      }
                    </p>
                  </div>
                  
                  {/* Section summaries */}
                  {currentSummaryDraft.sections && currentSummaryDraft.sections.length > 0 && (
                    <div>
                      <div className="flex justify-between items-center">
                        <h4 className={`text-lg font-medium ${darkMode ? 'text-teal-400 border-b border-slate-700' : 'text-teal-700 border-b border-slate-200'} pb-2 mb-3`}>
                          Document Sections
                        </h4>
                        <button 
                          onClick={() => {
                            if (expandedSections.length === currentSummaryDraft.sections!.length) {
                              setExpandedSections([]);
                            } else {
                              setExpandedSections(currentSummaryDraft.sections!.map(s => s.id));
                            }
                          }}
                          className={`text-xs px-2 py-0.5 rounded ${
                            darkMode ? 'text-slate-300 bg-slate-700 hover:bg-slate-600' : 'text-slate-700 bg-slate-100 hover:bg-slate-200'
                          }`}
                        >
                          {expandedSections.length === currentSummaryDraft.sections!.length ? 'Collapse All' : 'Expand All'}
                        </button>
                      </div>
                      
                      <div className="space-y-3">
                        {currentSummaryDraft.sections.map((section) => (
                          <div key={section.id} className={`rounded-lg overflow-hidden border ${
                            darkMode ? 'border-slate-700' : 'border-slate-200'
                          }`}>
                            {/* Section header */}
                            <div 
                              className={`flex justify-between items-center p-3 cursor-pointer ${
                                darkMode ? 'bg-slate-700/50' : 'bg-slate-50'
                              }`}
                              onClick={() => toggleSectionExpand(section.id)}
                            >
                              <h5 className={`font-medium ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                                {section.title}
                              </h5>
                              <svg 
                                className={`w-5 h-5 transition-transform duration-300 ${
                                  expandedSections.includes(section.id) ? 'rotate-180' : ''
                                } ${darkMode ? 'text-slate-400' : 'text-slate-500'}`} 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                            
                            {/* Section summary */}
                            <div className={`border-t px-3 py-2 ${
                              darkMode ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-white'
                            }`}>
                              <div className={`text-sm font-medium mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                Summary:
                              </div>
                              <p className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                                {section.summary}
                              </p>
                            </div>
                            
                            {/* View in Editor button - replaces the full text section */}
                            {expandedSections.includes(section.id) && (
                              <div className={`px-3 py-3 border-t text-sm ${
                                darkMode ? 'border-slate-700 bg-slate-700/30 text-slate-300' : 'border-slate-200 bg-slate-50 text-slate-600'
                              }`}>
                                <Link
                                  href={`/draft?id=${currentSummaryDraft.id}&section=${section.id}`}
                                  className={`inline-flex items-center px-3 py-1.5 text-xs rounded ${
                                    darkMode ? 'bg-indigo-700 hover:bg-indigo-600 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                  }`}
                                >
                                  <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                  </svg>
                                  View Section in Draft Editor
                                </Link>
                                <p className="mt-2 text-xs italic">
                                  Section full text is available in the Draft Editor
                                </p>
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
            
            <div className={`p-4 border-t ${darkMode ? 'border-slate-700 bg-slate-800/80' : 'border-slate-200 bg-slate-50'} flex justify-between`}>
              <div>
                <Link
                  href={`/draft?id=${currentSummaryDraft.id}`}
                  className={`px-4 py-2 ${
                    darkMode ? 'bg-indigo-700 hover:bg-indigo-600' : 'bg-indigo-600 hover:bg-indigo-700'
                  } text-white rounded flex items-center`}
                >
                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Open in Editor
                </Link>
              </div>
              <button
                onClick={() => {
                  setShowSummaryModal(false);
                  setCurrentSummaryDraft(null);
                }}
                className={`px-4 py-2 ${
                  darkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-200 text-slate-800 hover:bg-slate-300'
                } rounded`}
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




