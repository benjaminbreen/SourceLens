// components/library/SavedAnalysisPanel.tsx
// Panel for displaying and managing saved analysis results and conversation history
// Features filtering by analysis type, source, and date

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { useAppStore } from '@/lib/store';

// Local storage key for saved analyses
const SAVED_ANALYSES_KEY = 'sourceLens_savedAnalyses';

// Interface for saved analysis item
interface SavedAnalysis {
  id: string;
  type: 'detailed' | 'counter' | 'conversation' | 'roleplay' | 'initial';
  title: string;
  content: string;
  sourceName: string;
  sourceAuthor: string;
  sourceDate: string;
  dateAdded: number;
  tags?: string[];
  model?: string;
  perspective?: string;
}

export default function SavedAnalysisPanel() {
  const router = useRouter();
  const [analyses, setAnalyses] = useState<SavedAnalysis[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    type: 'all',
    searchTerm: '',
  });
  const [selectedAnalyses, setSelectedAnalyses] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);

  // Load saved analyses from localStorage on mount
  useEffect(() => {
    const loadSavedAnalyses = () => {
      try {
        const savedAnalysesJson = localStorage.getItem(SAVED_ANALYSES_KEY);
        if (savedAnalysesJson) {
          const savedAnalysisData = JSON.parse(savedAnalysesJson);
          setAnalyses(savedAnalysisData);
        }
      } catch (error) {
        console.error('Error loading saved analyses:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Small delay to simulate loading for better UX
    const timer = setTimeout(() => {
      loadSavedAnalyses();
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  // Filter analyses based on current filters
  const filteredAnalyses = analyses.filter(analysis => {
    // Filter by type
    if (filters.type !== 'all' && analysis.type !== filters.type) {
      return false;
    }
    
    // Filter by search term
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      return (
        analysis.title.toLowerCase().includes(searchLower) ||
        analysis.content.toLowerCase().includes(searchLower) ||
        analysis.sourceName.toLowerCase().includes(searchLower) ||
        analysis.sourceAuthor.toLowerCase().includes(searchLower) ||
        (analysis.tags && analysis.tags.some(tag => tag.toLowerCase().includes(searchLower)))
      );
    }
    
    return true;
  });

  // Sort analyses by date added (newest first)
  const sortedAnalyses = [...filteredAnalyses].sort((a, b) => b.dateAdded - a.dateAdded);

  // Delete a saved analysis
  const handleDelete = (id: string) => {
    const updatedAnalyses = analyses.filter(analysis => analysis.id !== id);
    setAnalyses(updatedAnalyses);
    localStorage.setItem(SAVED_ANALYSES_KEY, JSON.stringify(updatedAnalyses));
    
    // Clear selection if deleted analysis was selected
    if (selectedAnalyses.includes(id)) {
      setSelectedAnalyses(prev => prev.filter(analysisId => analysisId !== id));
    }
    
    // Close expanded view if deleted analysis was expanded
    if (expandedId === id) {
      setExpandedId(null);
    }
  };

  // Delete all selected analyses
  const handleBulkDelete = () => {
    if (selectedAnalyses.length === 0) return;
    
    const updatedAnalyses = analyses.filter(analysis => !selectedAnalyses.includes(analysis.id));
    setAnalyses(updatedAnalyses);
    localStorage.setItem(SAVED_ANALYSES_KEY, JSON.stringify(updatedAnalyses));
    setSelectedAnalyses([]);
    setExpandedId(null);
  };

  // Toggle analysis selection
  const toggleAnalysisSelection = (id: string) => {
    setSelectedAnalyses(prev => 
      prev.includes(id) 
        ? prev.filter(analysisId => analysisId !== id) 
        : [...prev, id]
    );
  };

  // Copy analysis content to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopyMessage("Analysis copied to clipboard!");
        setTimeout(() => setCopyMessage(null), 2000);
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
        setCopyMessage("Failed to copy");
        setTimeout(() => setCopyMessage(null), 2000);
      });
  };

  // Export selected analyses as markdown
  const exportAnalyses = () => {
    const analysesToExport = selectedAnalyses.length > 0
      ? analyses.filter(analysis => selectedAnalyses.includes(analysis.id))
      : analyses;
    
    if (analysesToExport.length === 0) return;
    
    const markdownContent = analysesToExport.map(analysis => {
      return `# ${analysis.title}
      
**Source:** ${analysis.sourceName} by ${analysis.sourceAuthor} (${analysis.sourceDate})
**Type:** ${analysis.type}
**Date Added:** ${new Date(analysis.dateAdded).toLocaleDateString()}
${analysis.model ? `**Model Used:** ${analysis.model}` : ''}
${analysis.perspective ? `**Perspective:** ${analysis.perspective}` : ''}

${analysis.content}

---`;
    }).join('\n\n');
    
    // Create blob and download
    const blob = new Blob([markdownContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sourceLens_analyses.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Get badge color based on analysis type
  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'detailed':
        return 'bg-indigo-100 text-indigo-800';
      case 'counter':
        return 'bg-purple-100 text-purple-800';
      case 'conversation':
        return 'bg-green-100 text-green-800';
      case 'roleplay':
        return 'bg-amber-100 text-amber-800';
      case 'initial':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  // Get a more readable name for analysis type
  const getTypeDisplayName = (type: string) => {
    switch (type) {
      case 'detailed':
        return 'Detailed Analysis';
      case 'counter':
        return 'Counter-Narrative';
      case 'conversation':
        return 'Conversation';
      case 'roleplay':
        return 'Author Roleplay';
      case 'initial':
        return 'Initial Analysis';
      default:
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  // Truncate text to a certain length with ellipsis
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="w-10 h-10 border-t-2 border-indigo-600 border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header with controls */}
      <div className="p-4 bg-slate-50 border-b border-slate-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
          <h2 className="text-xl font-medium text-slate-800 flex items-center">
            <svg className="w-6 h-6 mr-2 text-indigo-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Analysis History
            <span className="ml-2 text-sm font-normal text-slate-500">
              ({analyses.length})
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
              New Analysis
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
              placeholder="Search analysis content..."
              className="pl-10 p-2 border border-slate-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              value={filters.searchTerm}
              onChange={(e) => setFilters({...filters, searchTerm: e.target.value})}
            />
          </div>
          
          <div className="flex space-x-2">
            {/* Type filter */}
            <select
              value={filters.type}
              onChange={(e) => setFilters({...filters, type: e.target.value})}
              className="p-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
            >
              <option value="all">All Types</option>
              <option value="detailed">Detailed Analysis</option>
              <option value="counter">Counter-Narratives</option>
              <option value="conversation">Conversations</option>
              <option value="roleplay">Author Roleplay</option>
              <option value="initial">Initial Analysis</option>
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
              disabled={selectedAnalyses.length === 0}
              className={`p-1.5 rounded-md text-sm flex items-center gap-1 ${
                selectedAnalyses.length > 0
                  ? 'text-red-600 hover:bg-red-50'
                  : 'text-slate-400 cursor-not-allowed'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete {selectedAnalyses.length > 0 ? `(${selectedAnalyses.length})` : ''}
            </button>
            
            <button
              onClick={exportAnalyses}
              disabled={analyses.length === 0}
              className={`p-1.5 rounded-md text-sm flex items-center gap-1 ${
                analyses.length > 0
                  ? 'text-indigo-600 hover:bg-indigo-50'
                  : 'text-slate-400 cursor-not-allowed'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export {selectedAnalyses.length > 0 ? `(${selectedAnalyses.length})` : 'All'}
            </button>
          </div>
          
          <div className="text-xs text-slate-500">
            {selectedAnalyses.length > 0 
              ? `${selectedAnalyses.length} selected` 
              : analyses.length > 0 
                ? `${filteredAnalyses.length} of ${analyses.length} analyses`
                : 'No analyses saved yet'}
          </div>
        </div>
      </div>

      {/* Analyses list */}
      <div className="overflow-y-auto max-h-[calc(100vh-350px)]">
        {copyMessage && (
          <div className="fixed top-16 right-4 bg-slate-800 text-white px-4 py-2 rounded-md shadow-lg z-50 animate-fade-in-out">
            {copyMessage}
          </div>
        )}
        
        {analyses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <svg className="w-16 h-16 text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="text-lg font-medium text-slate-700 mb-1">No saved analyses yet</h3>
            <p className="text-slate-500 max-w-md">
              Save analysis results while working with sources to keep a record of your insights.
            </p>
            <button
              onClick={() => router.push('/analysis')}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Start Analyzing
            </button>
          </div>
        ) : filteredAnalyses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <svg className="w-12 h-12 text-slate-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 className="text-lg font-medium text-slate-700">No matching analyses</h3>
            <p className="text-slate-500">Try adjusting your search criteria</p>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {sortedAnalyses.map((analysis) => (
              <div 
                key={analysis.id}
                className={`bg-white rounded-lg border transition-colors ${
                  selectedAnalyses.includes(analysis.id) 
                    ? 'border-indigo-400 bg-indigo-50/50' 
                    : 'border-slate-200 hover:border-indigo-200'
                }`}
              >
                <div className="p-4">
                  <div className="flex items-start">
                    {/* Checkbox for selection */}
                    <div className="mr-3 pt-0.5">
                      <input
                        type="checkbox"
                        checked={selectedAnalyses.includes(analysis.id)}
                        onChange={() => toggleAnalysisSelection(analysis.id)}
                        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </div>
                    
                    {/* Analysis content */}
                    <div 
                      className="flex-1 cursor-pointer"
                      onClick={() => setExpandedId(expandedId === analysis.id ? null : analysis.id)}
                    >
                      {/* Title and type */}
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="text-lg font-medium text-slate-800">{analysis.title}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getTypeBadgeColor(analysis.type)}`}>
                          {getTypeDisplayName(analysis.type)}
                        </span>
                      </div>
                      
                      {/* Source info */}
                      <div className="text-sm text-slate-500 mb-2">
                        Source: {analysis.sourceName} by {analysis.sourceAuthor} ({analysis.sourceDate})
                      </div>
                      
                      {/* Preview content */}
                      <div className="text-sm text-slate-700">
                        {!expandedId || expandedId !== analysis.id 
                          ? truncateText(analysis.content, 160)
                          : (
                            <div className="prose prose-sm max-w-none">
                              <ReactMarkdown>{analysis.content}</ReactMarkdown>
                            </div>
                          )
                        }
                      </div>
                      
                      {/* Tags if available */}
                      {analysis.tags && analysis.tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {analysis.tags.map((tag, index) => (
                            <span 
                              key={index}
                              className="text-xs px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      {/* Date and model info */}
                      <div className="mt-2 flex items-center text-xs text-slate-400">
                        <span>{new Date(analysis.dateAdded).toLocaleDateString()}</span>
                        {analysis.model && (
                          <>
                            <span className="mx-1">•</span>
                            <span>Model: {analysis.model}</span>
                          </>
                        )}
                        {analysis.perspective && (
                          <>
                            <span className="mx-1">•</span>
                            <span>Perspective: {analysis.perspective}</span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    {/* Action buttons */}
                    <div className="flex items-center ml-2 space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(analysis.content);
                        }}
                        className="p-1 text-indigo-600 hover:text-indigo-800 rounded hover:bg-indigo-50"
                        title="Copy content"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(analysis.id);
                        }}
                        className="p-1 text-red-500 hover:text-red-700 rounded hover:bg-red-50"
                        title="Delete analysis"
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
      {analyses.length === 0 && (
        <div className="p-4 bg-slate-50 border-t border-slate-200 text-center">
          <p className="text-sm text-slate-500">
            You can save analyses while working with sources. Look for the "Save to Library" button in the Analysis panels.
          </p>
        </div>
      )}
    </div>
  );
}