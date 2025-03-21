// components/library/SavedReferencesPanel.tsx
// Panel for displaying and managing saved scholarly references
// Features sortable list, grouping by source, and export functionality

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import ReactMarkdown from 'react-markdown';

// Local storage key for saved references
const SAVED_REFERENCES_KEY = 'sourceLens_savedReferences';

// Interface for saved reference with additional metadata
interface SavedReference {
  id: string;
  citation: string;
  url: string;
  type: 'book' | 'journal' | 'website' | 'other';
  relevance: string;
  sourceQuote: string;
  importance: number;
  dateAdded: number;
  sourceName?: string; // Name of the source it belongs to
  sourceAuthor?: string; // Author of the source it belongs to
}

export default function SavedReferencesPanel() {
  const router = useRouter();
  const [references, setReferences] = useState<SavedReference[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'dateAdded' | 'importance' | 'type'>('dateAdded');
  const [groupBy, setGroupBy] = useState<'none' | 'source' | 'type'>('none');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReferences, setSelectedReferences] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);

  // Load saved references from localStorage on component mount
  useEffect(() => {
    const loadSavedReferences = () => {
      try {
        const savedReferencesJson = localStorage.getItem(SAVED_REFERENCES_KEY);
        if (savedReferencesJson) {
          const savedRefs = JSON.parse(savedReferencesJson);
          setReferences(savedRefs);
        }
      } catch (error) {
        console.error('Error loading saved references:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Small delay to simulate loading for better UX
    const timer = setTimeout(() => {
      loadSavedReferences();
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  // Filter references based on search term
  const filteredReferences = references.filter(ref => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      ref.citation.toLowerCase().includes(searchLower) ||
      ref.sourceName?.toLowerCase().includes(searchLower) ||
      ref.sourceAuthor?.toLowerCase().includes(searchLower) ||
      ref.type.toLowerCase().includes(searchLower)
    );
  });

  // Sort references based on sort criteria
  const sortedReferences = [...filteredReferences].sort((a, b) => {
    switch (sortBy) {
      case 'dateAdded':
        return b.dateAdded - a.dateAdded;
      case 'importance':
        return b.importance - a.importance;
      case 'type':
        return a.type.localeCompare(b.type);
      default:
        return 0;
    }
  });

  // Group references if grouping is enabled
  const groupedReferences = () => {
    if (groupBy === 'none') {
      return { 'All References': sortedReferences };
    }

    return sortedReferences.reduce((groups, reference) => {
      const key = groupBy === 'source' 
        ? (reference.sourceName || 'Unknown Source')
        : reference.type.charAt(0).toUpperCase() + reference.type.slice(1);
      
      if (!groups[key]) {
        groups[key] = [];
      }
      
      groups[key].push(reference);
      return groups;
    }, {} as Record<string, SavedReference[]>);
  };

  // Handle reference deletion
  const handleDelete = (id: string) => {
    const updatedReferences = references.filter(ref => ref.id !== id);
    setReferences(updatedReferences);
    localStorage.setItem(SAVED_REFERENCES_KEY, JSON.stringify(updatedReferences));
    
    // Clear selection if deleted reference was selected
    if (selectedReferences.includes(id)) {
      setSelectedReferences(prev => prev.filter(refId => refId !== id));
    }
    
    // Close expanded view if deleted reference was expanded
    if (expandedId === id) {
      setExpandedId(null);
    }
  };

  // Handle bulk deletion
  const handleBulkDelete = () => {
    if (selectedReferences.length === 0) return;
    
    const updatedReferences = references.filter(ref => !selectedReferences.includes(ref.id));
    setReferences(updatedReferences);
    localStorage.setItem(SAVED_REFERENCES_KEY, JSON.stringify(updatedReferences));
    setSelectedReferences([]);
    setExpandedId(null);
  };

  // Toggle reference selection
  const toggleReferenceSelection = (id: string) => {
    setSelectedReferences(prev => 
      prev.includes(id) 
        ? prev.filter(refId => refId !== id) 
        : [...prev, id]
    );
  };

  // Copy citation to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopyMessage("Citation copied!");
        setTimeout(() => setCopyMessage(null), 2000);
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
        setCopyMessage("Failed to copy");
        setTimeout(() => setCopyMessage(null), 2000);
      });
  };

  // Export selected references as BibTeX
  const exportBibTeX = () => {
    const refsToExport = selectedReferences.length > 0
      ? references.filter(ref => selectedReferences.includes(ref.id))
      : references;
    
    if (refsToExport.length === 0) return;
    
    // Simple BibTeX conversion (would need more sophistication in a real app)
    const bibTexContent = refsToExport.map(ref => {
      // Extract author and year for the key
      const authorMatch = ref.citation.match(/^([^,]+)/);
      const yearMatch = ref.citation.match(/\b(19|20)\d{2}\b/);
      
      const author = authorMatch ? authorMatch[0].trim().replace(/\s+/g, '') : 'Unknown';
      const year = yearMatch ? yearMatch[0] : 'YYYY';
      
      const key = `${author}${year}`;
      
      // Very simplified BibTeX conversion
      return `@${ref.type}{${key},
  title = {${ref.citation.includes('"') ? ref.citation.split('"')[1] : 'Untitled'}},
  author = {${authorMatch ? authorMatch[0].trim() : 'Unknown Author'}},
  year = {${year}},
  note = {Exported from SourceLens Library}
}`;
    }).join('\n\n');
    
    // Create blob and download
    const blob = new Blob([bibTexContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sourceLens_references.bib';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Get color for reference type
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'book':
        return 'bg-indigo-500';
      case 'journal':
        return 'bg-amber-500';
      case 'website':
        return 'bg-emerald-500';
      case 'other':
      default:
        return 'bg-slate-500';
    }
  };

  // Process citation text for markdown display
  const processCitation = (citation: string = '') => {
    return citation
      .replace(/\*(.*?)\*/g, "_$1_")
      .replace(/"/g, '"')
      .replace(/"/g, '"');
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="w-10 h-10 border-t-2 border-amber-600 border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header with controls */}
      <div className="p-4 bg-slate-50 border-b border-slate-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
          <h2 className="text-xl font-medium text-slate-800 flex items-center">
            <svg className="w-6 h-6 mr-2 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Saved References
            <span className="ml-2 text-sm font-normal text-slate-500">
              ({references.length})
            </span>
          </h2>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => router.push('/analysis')}
              className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              Find More References
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
              placeholder="Search references..."
              className="pl-10 p-2 border border-slate-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap sm:flex-nowrap gap-2">
            {/* Sort dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="p-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white"
            >
              <option value="dateAdded">Sort by Date Added</option>
              <option value="importance">Sort by Importance</option>
              <option value="type">Sort by Type</option>
            </select>
            
            {/* Group dropdown */}
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value as any)}
              className="p-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white"
            >
              <option value="none">No Grouping</option>
              <option value="source">Group by Source</option>
              <option value="type">Group by Type</option>
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
              disabled={selectedReferences.length === 0}
              className={`p-1.5 rounded-md text-sm flex items-center gap-1 ${
                selectedReferences.length > 0
                  ? 'text-red-600 hover:bg-red-50'
                  : 'text-slate-400 cursor-not-allowed'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete {selectedReferences.length > 0 ? `(${selectedReferences.length})` : ''}
            </button>
            
            <button
              onClick={exportBibTeX}
              disabled={references.length === 0}
              className={`p-1.5 rounded-md text-sm flex items-center gap-1 ${
                references.length > 0
                  ? 'text-indigo-600 hover:bg-indigo-50'
                  : 'text-slate-400 cursor-not-allowed'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export {selectedReferences.length > 0 ? `(${selectedReferences.length})` : 'All'}
            </button>
          </div>
          
          <div className="text-xs text-slate-500">
            {selectedReferences.length > 0 
              ? `${selectedReferences.length} selected` 
              : references.length > 0 
                ? `${filteredReferences.length} of ${references.length} references`
                : 'No references saved yet'}
          </div>
        </div>
      </div>

      {/* References list */}
      <div className="overflow-y-auto max-h-[calc(100vh-350px)]">
        {copyMessage && (
          <div className="fixed top-16 right-4 bg-slate-800 text-white px-4 py-2 rounded-md shadow-lg z-50 animate-fade-in-out">
            {copyMessage}
          </div>
        )}
        
        {references.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <svg className="w-16 h-16 text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h3 className="text-lg font-medium text-slate-700 mb-1">No saved references yet</h3>
            <p className="text-slate-500 max-w-md">
              Save references from the References panel while analyzing sources to build your library.
            </p>
            <button
              onClick={() => router.push('/analysis')}
              className="mt-4 px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors"
            >
              Go to Analysis
            </button>
          </div>
        ) : filteredReferences.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <svg className="w-12 h-12 text-slate-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 className="text-lg font-medium text-slate-700">No matching references</h3>
            <p className="text-slate-500">Try adjusting your search criteria</p>
          </div>
        ) : (
          <div className="p-4">
            {Object.entries(groupedReferences()).map(([groupName, groupRefs]) => (
              <div key={groupName} className="mb-6 last:mb-0">
                {groupBy !== 'none' && (
                  <h3 className="text-md font-medium text-slate-700 mb-3 flex items-center">
                    {groupName}
                    <span className="ml-2 text-sm font-normal text-slate-500">
                      ({groupRefs.length})
                    </span>
                  </h3>
                )}
                
                <div className="space-y-2">
                  {groupRefs.map((reference) => (
                    <div 
                      key={reference.id}
                      className={`bg-white rounded-lg border transition-colors ${
                        selectedReferences.includes(reference.id) 
                          ? 'border-amber-400 bg-amber-50/50' 
                          : 'border-slate-200 hover:border-amber-200'
                      }`}
                    >
                      <div className="p-3">
                        <div className="flex items-start">
                          {/* Checkbox for selection */}
                          <div className="mr-3 pt-1">
                            <input
                              type="checkbox"
                              checked={selectedReferences.includes(reference.id)}
                              onChange={() => toggleReferenceSelection(reference.id)}
                              className="h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                            />
                          </div>
                          
                          {/* Type indicator */}
                          <div className="mr-2 mt-1">
                            <span 
                              className={`inline-block w-3 h-3 rounded-full ${getTypeColor(reference.type)}`}
                              title={reference.type.charAt(0).toUpperCase() + reference.type.slice(1)}
                            ></span>
                          </div>
                          
                          {/* Citation content */}
                          <div 
                            className="flex-1 cursor-pointer"
                            onClick={() => setExpandedId(expandedId === reference.id ? null : reference.id)}
                          >
                            <div className="text-sm text-slate-800 prose prose-sm max-w-none">
                              <ReactMarkdown>{processCitation(reference.citation)}</ReactMarkdown>
                            </div>
                            
                            {/* Source info if available */}
                            {reference.sourceName && (
                              <div className="text-xs text-slate-500 mt-1">
                                From: {reference.sourceName}
                                {reference.sourceAuthor && <> by {reference.sourceAuthor}</>}
                              </div>
                            )}
                          </div>
                          
                          {/* Action buttons */}
                          <div className="flex items-center ml-2 space-x-1">
                            <button
                              onClick={() => copyToClipboard(reference.citation)}
                              className="p-1 text-amber-600 hover:text-amber-800 rounded hover:bg-amber-50"
                              title="Copy citation"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            </button>
                            
                            <a
                              href={reference.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 text-indigo-600 hover:text-indigo-800 rounded hover:bg-indigo-50"
                              title="Open reference source"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                            
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(reference.id);
                              }}
                              className="p-1 text-red-500 hover:text-red-700 rounded hover:bg-red-50"
                              title="Delete reference"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        
                        {/* Expanded details */}
                        {expandedId === reference.id && (
                          <div className="mt-3 pl-10 border-t border-slate-100 pt-3">
                            {/* Relevance section */}
                            <div className="mb-3">
                              <h4 className="text-xs font-medium text-slate-500 mb-1">RELEVANCE:</h4>
                              <p className="text-sm text-slate-700">{reference.relevance}</p>
                            </div>
                            
                            {/* Source quote section */}
                            {reference.sourceQuote && (
                              <div>
                                <h4 className="text-xs font-medium text-slate-500 mb-1">SOURCE EXCERPT:</h4>
                                <blockquote className="text-sm italic border-l-4 border-amber-300 pl-3 py-1 bg-amber-50/50">
                                  "{reference.sourceQuote}"
                                </blockquote>
                              </div>
                            )}
                            
                            {/* Date added info */}
                            <div className="mt-3 text-xs text-slate-400">
                              Added {new Date(reference.dateAdded).toLocaleDateString()}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Empty state footer */}
      {references.length === 0 && (
        <div className="p-4 bg-slate-50 border-t border-slate-200 text-center">
          <p className="text-sm text-slate-500">
            You can save references while analyzing sources. Look for the "Save to Library" button in the References panel.
          </p>
        </div>
      )}
    </div>
  );
}