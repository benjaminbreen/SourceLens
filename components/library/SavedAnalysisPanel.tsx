// components/library/SavedAnalysisPanel.tsx
// Enhanced panel for managing saved analysis results with improved UI design
// Features intelligent search assistant, source-based filtering, and better organization

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { useAppStore, Metadata } from '@/lib/store';
import { useLibrary, SavedAnalysis } from '@/lib/libraryContext';
import { useAuth } from '@/lib/auth/authContext';
import Image from 'next/image';

// Component props definition
interface SavedAnalysisPanelProps {
  darkMode?: boolean; // Make darkMode optional with a default value
}

// Interface for search result
interface SearchResult {
  id: string;
  score: number;
  explanation: string;
}

// Enhanced source type with optional sourceId field
interface EnhancedSource {
  id: string;
  content: string;
  metadata: Metadata;
  type: 'text' | 'pdf' | 'image' | 'audio' | null;
  thumbnailUrl?: string | null;
  [key: string]: any; // Allow for additional properties
}

export default function SavedAnalysisPanel({ darkMode = false }: SavedAnalysisPanelProps) {
  const router = useRouter();
  const { 
    setSourceContent, 
    setMetadata, 
    setLoading, 
    setActivePanel, 
    setSourceType,
    setInitialAnalysis,
    setDetailedAnalysis,
    setRawPrompt,
    setRawResponse,
    setSourceThumbnailUrl,
  } = useAppStore();
  
  const { user } = useAuth();
  const { 
    analyses, 
    addAnalysis, 
    deleteAnalysis, 
    updateAnalysis, 
    isLoading: libraryLoading,
    sources: librarySources 
  } = useLibrary();
  
  // State
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedAnalyses, setSelectedAnalyses] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [displayMode, setDisplayMode] = useState<'grid' | 'table'>('grid');
  const [copyMessage, setCopyMessage] = useState<string | null>(null);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  
  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [authorFilter, setAuthorFilter] = useState('all');
  const [dateRangeFilter, setDateRangeFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'dateAdded' | 'sourceDate' | 'sourceAuthor'>('dateAdded');
  
  // LLM search assistant state
  const [assistantQuery, setAssistantQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[] | null>(null);
  
  // Metadata edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentEditAnalysis, setCurrentEditAnalysis] = useState<SavedAnalysis | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    perspective: '',
    tags: ''
  });

  // Update loading state based on library loading
  useEffect(() => {
    if (!libraryLoading) {
      setIsLoading(false);
    }
  }, [libraryLoading]);

  // Get unique authors, source types, and date ranges for filters
  const { authors, types, dateRanges } = useMemo(() => {
    const authorsSet = new Set<string>();
    const typesSet = new Set<string>();
    const dateMap = new Map<string, number>();
    
    analyses.forEach(analysis => {
      if (analysis.sourceAuthor) {
        authorsSet.add(analysis.sourceAuthor);
      }
      
      if (analysis.type) {
        typesSet.add(analysis.type);
      }
      
      // Extract century or decade from date string
      if (analysis.sourceDate) {
        const yearMatch = analysis.sourceDate.match(/\b(\d{4})\b/);
        const year = yearMatch ? parseInt(yearMatch[1], 10) : null;
        
        if (year) {
          const century = Math.floor(year / 100) + 1;
          const decade = Math.floor(year / 10) * 10;
          
          dateMap.set(`${century}th Century`, (dateMap.get(`${century}th Century`) || 0) + 1);
          dateMap.set(`${decade}s`, (dateMap.get(`${decade}s`) || 0) + 1);
        }
      }
    });
    
    // Convert dates to sorted array
    const dateRanges = Array.from(dateMap.entries())
      .sort((a, b) => {
        // Extract numeric part for sorting
        const numA = parseInt(a[0].match(/\d+/)?.[0] || '0', 10);
        const numB = parseInt(b[0].match(/\d+/)?.[0] || '0', 10);
        return numA - numB;
      })
      .map(([range, count]) => ({ range, count }));
    
    return {
      authors: Array.from(authorsSet).sort(),
      types: Array.from(typesSet),
      dateRanges
    };
  }, [analyses]);

  // Filter analyses based on current filters
  const filteredAnalyses = useMemo(() => {
    // If we have search results, only show those analyses
    if (searchResults && searchResults.length > 0) {
      const resultIds = searchResults.map(result => result.id);
      return analyses
        .filter(analysis => resultIds.includes(analysis.id))
        .sort((a, b) => {
          const scoreA = searchResults.find(r => r.id === a.id)?.score || 0;
          const scoreB = searchResults.find(r => r.id === b.id)?.score || 0;
          return scoreB - scoreA; // Sort by score descending
        });
    }
    
    // Otherwise apply regular filters
    return analyses.filter(analysis => {
      // Filter by analysis type
      if (typeFilter !== 'all' && analysis.type !== typeFilter) {
        return false;
      }
      
      // Filter by author
      if (authorFilter !== 'all' && analysis.sourceAuthor !== authorFilter) {
        return false;
      }
      
      // Filter by date range
      if (dateRangeFilter !== 'all' && analysis.sourceDate) {
        const yearMatch = analysis.sourceDate.match(/\b(\d{4})\b/);
        const year = yearMatch ? parseInt(yearMatch[1], 10) : null;
        
        if (year) {
          const century = Math.floor(year / 100) + 1;
          const decade = Math.floor(year / 10) * 10;
          
          if (dateRangeFilter.includes('Century') && !dateRangeFilter.includes(`${century}th`)) {
            return false;
          }
          
          if (dateRangeFilter.includes('s') && !dateRangeFilter.includes(`${decade}s`)) {
            return false;
          }
        } else {
          return false;
        }
      }
      
      // Filter by search term
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          analysis.title.toLowerCase().includes(searchLower) ||
          analysis.content.toLowerCase().includes(searchLower) ||
          analysis.sourceName.toLowerCase().includes(searchLower) ||
          analysis.sourceAuthor.toLowerCase().includes(searchLower) ||
          (analysis.sourceDate && analysis.sourceDate.toLowerCase().includes(searchLower)) ||
          (analysis.perspective && analysis.perspective.toLowerCase().includes(searchLower)) ||
          (analysis.tags && analysis.tags.some(tag => tag.toLowerCase().includes(searchLower)))
        );
      }
      
      return true;
    });
  }, [analyses, typeFilter, authorFilter, dateRangeFilter, searchTerm, searchResults]);

  // Sort filtered analyses
  const sortedAnalyses = useMemo(() => {
    return [...filteredAnalyses].sort((a, b) => {
      switch (sortBy) {
        case 'dateAdded':
          return b.dateAdded - a.dateAdded;
        case 'sourceDate':
          // Extract years for comparison
          const yearA = a.sourceDate ? parseInt(a.sourceDate.match(/\d{4}/)?.[0] || '0', 10) : 0;
          const yearB = b.sourceDate ? parseInt(b.sourceDate.match(/\d{4}/)?.[0] || '0', 10) : 0;
          return yearB - yearA;
        case 'sourceAuthor':
          return (a.sourceAuthor || '').localeCompare(b.sourceAuthor || '');
        default:
          return 0;
      }
    });
  }, [filteredAnalyses, sortBy]);

  // LLM search function
  const handleAssistantSearch = async () => {
    if (!assistantQuery.trim() || isSearching) return;
    
    setIsSearching(true);
    setSearchResults(null);
    
    try {
      // Call the API endpoint for analysis search
      const response = await fetch('/api/analysis-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          analyses: analyses, // Pass all analyses to the endpoint
          query: assistantQuery,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.results && Array.isArray(data.results)) {
        setSearchResults(data.results);
      } else {
        console.error("Invalid results format from API", data);
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error performing assisted search:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Clear search results
  const clearSearchResults = () => {
    setSearchResults(null);
    setAssistantQuery('');
  };

  // Delete a saved analysis
  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    // Prevent multiple simultaneous deletions
    if (actionInProgress) return;
    
    setActionInProgress(id);
    
    try {
      await deleteAnalysis(id);
      
      // Clear selection if deleted analysis was selected
      if (selectedAnalyses.includes(id)) {
        setSelectedAnalyses(prev => prev.filter(analysisId => analysisId !== id));
      }
      
      // Clear expanded state if deleted analysis was expanded
      if (expandedId === id) {
        setExpandedId(null);
      }
      
      // Clear search results if applicable
      if (searchResults && searchResults.some(result => result.id === id)) {
        setSearchResults(searchResults.filter(result => result.id !== id));
      }
      
      // Show success message
      setCopyMessage("Analysis deleted");
      setTimeout(() => setCopyMessage(null), 2000);
      
    } catch (error) {
      console.error('Error deleting analysis:', error);
      setCopyMessage("Failed to delete analysis");
      setTimeout(() => setCopyMessage(null), 2000);
    } finally {
      setActionInProgress(null);
    }
  };

  // Handle bulk deletion
  const handleBulkDelete = async () => {
    if (selectedAnalyses.length === 0 || actionInProgress) return;
    
    setActionInProgress('bulk');
    
    try {
      // Delete each selected analysis
      for (const id of selectedAnalyses) {
        await deleteAnalysis(id);
      }
      
      // Show success message
      setCopyMessage(`${selectedAnalyses.length} analyses deleted`);
      setTimeout(() => setCopyMessage(null), 2000);
      
      setSelectedAnalyses([]);
      
      // Clear search results if applicable
      if (searchResults) {
        setSearchResults(searchResults.filter(result => !selectedAnalyses.includes(result.id)));
      }
      
    } catch (error) {
      console.error('Error deleting multiple analyses:', error);
      setCopyMessage("Failed to delete some analyses");
      setTimeout(() => setCopyMessage(null), 2000);
    } finally {
      setActionInProgress(null);
    }
  };

  // Toggle analysis selection
  const toggleAnalysisSelection = (id: string, e: React.MouseEvent | React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    setSelectedAnalyses(prev => 
      prev.includes(id) 
        ? prev.filter(analysisId => analysisId !== id) 
        : [...prev, id]
    );
  };

  // Select all visible analyses
  const toggleSelectAll = () => {
    if (selectedAnalyses.length === filteredAnalyses.length) {
      setSelectedAnalyses([]);
    } else {
      setSelectedAnalyses(filteredAnalyses.map(a => a.id));
    }
  };

  // Copy analysis content to clipboard
  const copyToClipboard = (text: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
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
      : filteredAnalyses;
    
    if (analysesToExport.length === 0) return;
    
    const markdownContent = analysesToExport.map(analysis => {
      return `# ${analysis.title}
      
**Source:** ${analysis.sourceName} by ${analysis.sourceAuthor} (${analysis.sourceDate})
**Type:** ${getTypeDisplayName(analysis.type)}
**Date Added:** ${new Date(analysis.dateAdded).toLocaleDateString()}
${analysis.model ? `**Model Used:** ${analysis.model}` : ''}
${analysis.perspective ? `**Perspective:** ${analysis.perspective}` : ''}
${analysis.tags && analysis.tags.length > 0 ? `**Tags:** ${analysis.tags.join(', ')}` : ''}

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
    
    // Show confirmation
    setCopyMessage(`Exported ${analysesToExport.length} analyses`);
    setTimeout(() => setCopyMessage(null), 2000);
  };

  // Handle editing an analysis
  const handleOpenEditModal = (analysis: SavedAnalysis, e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentEditAnalysis(analysis);
    
    setEditForm({
      title: analysis.title || '',
      perspective: analysis.perspective || '',
      tags: analysis.tags ? analysis.tags.join(', ') : ''
    });
    
    setEditModalOpen(true);
  };

  // Handle form field changes
  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Save edited analysis
  const handleSaveEdit = async () => {
    if (!currentEditAnalysis || actionInProgress) return;
    
    setActionInProgress('edit');
    
    try {
      // Parse tags from comma-separated list
      const tags = editForm.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
      
      // Create updated analysis
      const updates: Partial<SavedAnalysis> = {
        title: editForm.title,
        perspective: editForm.perspective,
        tags: tags.length > 0 ? tags : undefined
      };
      
      // Update in storage
      await updateAnalysis(currentEditAnalysis.id, updates);
      
      // Show success message
      setCopyMessage("Analysis updated successfully");
      setTimeout(() => setCopyMessage(null), 2000);
      
      // Close modal
      setEditModalOpen(false);
      setCurrentEditAnalysis(null);
    } catch (error) {
      console.error('Error updating analysis:', error);
      setCopyMessage("Failed to update analysis");
      setTimeout(() => setCopyMessage(null), 2000);
    } finally {
      setActionInProgress(null);
    }
  };

  // Find the corresponding source for an analysis
  const findSourceForAnalysis = (analysis: SavedAnalysis): EnhancedSource | null => {
    // Check if sources are available
    if (!librarySources || !Array.isArray(librarySources) || librarySources.length === 0) {
      return null;
    }
    
    // First try to find by exact metadata match
    let source = librarySources.find(src => {
      if (!src || typeof src !== 'object' || !src.metadata) return false;
      
      const srcMeta = src.metadata;
      return (
        srcMeta.title === analysis.sourceName &&
        srcMeta.author === analysis.sourceAuthor &&
        srcMeta.date === analysis.sourceDate
      );
    });
    
    // If not found, try with partial metadata match
    if (!source) {
      source = librarySources.find(src => {
        if (!src || typeof src !== 'object' || !src.metadata) return false;
        
        const srcMeta = src.metadata;
        
        // Match by any two metadata fields
        let matchCount = 0;
        if (srcMeta.title === analysis.sourceName) matchCount++;
        if (srcMeta.author === analysis.sourceAuthor) matchCount++;
        if (srcMeta.date === analysis.sourceDate) matchCount++;
        
        return matchCount >= 2;
      });
    }
    
    return source as EnhancedSource | null;
  };

  // Restore analysis to original source
  const handleRestoreAnalysis = async (analysis: SavedAnalysis, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    // Prevent multiple simultaneous operations
    if (actionInProgress) return;
    
    setActionInProgress(analysis.id);
    setLoading(true);
    
    try {
      // First navigate to the analysis page
      router.push('/analysis');
      
      // Try to find the corresponding source
      const source = findSourceForAnalysis(analysis);
      
      if (source && typeof source.content === 'string') {
        // Found matching source - load it
        setSourceContent(source.content);
        
        // Safely set metadata
        if (source.metadata && typeof source.metadata === 'object') {
          setMetadata(source.metadata as Metadata);
        } else {
          // Fallback to creating metadata from analysis info
          setMetadata({
            author: analysis.sourceAuthor,
            date: analysis.sourceDate,
            title: analysis.sourceName,
            researchGoals: ''
          });
        }
        
        // Set source type if available
        if (source.type && ['text', 'pdf', 'image', 'audio'].includes(source.type)) {
          setSourceType(source.type as 'text' | 'pdf' | 'image' | 'audio' | null);
        } else {
          setSourceType('text'); // Default to text
        }
        
        // Set thumbnail URL if available
        if (source.thumbnailUrl) {
          setSourceThumbnailUrl(source.thumbnailUrl);
        }
      } else {
        // No source found, create metadata from analysis
        setMetadata({
          author: analysis.sourceAuthor,
          date: analysis.sourceDate,
          title: analysis.sourceName,
          researchGoals: ''
        });
        
        // Default to text source type
        setSourceType('text');
      }
      
      // Set appropriate panel and analysis content based on type
      switch (analysis.type) {
        case 'detailed':
          setDetailedAnalysis(analysis.content);
          setActivePanel('detailed-analysis');
          break;
        case 'counter':
          // You'd need to set counter narrative content here
          setActivePanel('counter');
          break;
        case 'extract-info':
          setActivePanel('extract-info');
          break;
        case 'initial':
          // Parse the content to set initialAnalysis properly
          try {
            const parsed = JSON.parse(analysis.content);
            setInitialAnalysis(parsed);
          } catch (e) {
            // If parsing fails, just set a simple object
            setInitialAnalysis({
              summary: analysis.content.substring(0, 200),
              analysis: analysis.content,
              followupQuestions: []
            });
          }
          setActivePanel('analysis');
          break;
        default:
          // For other types, just use initial analysis
          setInitialAnalysis({
            summary: analysis.title,
            analysis: analysis.content,
            followupQuestions: []
          });
          setActivePanel('analysis');
      }
      
      // Update access time
      try {
        await updateAnalysis(analysis.id, { dateAccessed: Date.now() } as Partial<SavedAnalysis>);
      } catch (error) {
        console.error('Error updating access time:', error);
        // Non-critical error, continue anyway
      }
      
    } catch (error) {
      console.error('Error restoring analysis:', error);
      setCopyMessage("Error restoring analysis");
      setTimeout(() => setCopyMessage(null), 2000);
    } finally {
      setLoading(false);
      setActionInProgress(null);
    }
  };

  // Get badge color based on analysis type
  const getTypeBadgeColor = (type: string, isDark = darkMode) => {
    const baseClasses = isDark ? 'text-opacity-90 border' : '';
    
    switch (type) {
      case 'detailed':
        return isDark 
          ? `${baseClasses} bg-indigo-900/30 text-indigo-300 border-indigo-700` 
          : 'bg-indigo-100 text-indigo-800';
      case 'counter':
        return isDark 
          ? `${baseClasses} bg-purple-900/30 text-purple-300 border-purple-700` 
          : 'bg-purple-100 text-purple-800';
      case 'conversation':
        return isDark 
          ? `${baseClasses} bg-green-900/30 text-green-300 border-green-700` 
          : 'bg-green-100 text-green-800';
      case 'roleplay':
        return isDark 
          ? `${baseClasses} bg-amber-900/30 text-amber-300 border-amber-700` 
          : 'bg-amber-100 text-amber-800';
      case 'initial':
        return isDark 
          ? `${baseClasses} bg-blue-900/30 text-blue-300 border-blue-700` 
          : 'bg-blue-100 text-blue-800';
      case 'extract-info':
        return isDark 
          ? `${baseClasses} bg-emerald-900/30 text-emerald-300 border-emerald-700` 
          : 'bg-emerald-100 text-emerald-800';
      default:
        return isDark 
          ? `${baseClasses} bg-slate-800 text-slate-300 border-slate-700` 
          : 'bg-slate-100 text-slate-800';
    }
  };

  // Get relevance indicator color based on score
  const getRelevanceColor = (score: number) => {
    if (score > 0.8) return darkMode ? 'bg-red-600' : 'bg-red-500';
    if (score > 0.6) return darkMode ? 'bg-orange-600' : 'bg-orange-500';
    if (score > 0.4) return darkMode ? 'bg-amber-600' : 'bg-amber-500';
    if (score > 0.2) return darkMode ? 'bg-green-600' : 'bg-green-500';
    return darkMode ? 'bg-blue-600' : 'bg-blue-500';
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
      case 'extract-info':
        return 'Extracted Data';
      default:
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  // Format date for display
  const formatDate = (date: number): string => {
    return new Date(date).toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Get time ago string
  const getTimeAgo = (timestamp: number): string => {
    const now = Date.now();
    const secondsAgo = Math.floor((now - timestamp) / 1000);
    
    if (secondsAgo < 60) return `${secondsAgo} seconds ago`;
    
    const minutesAgo = Math.floor(secondsAgo / 60);
    if (minutesAgo < 60) return `${minutesAgo} ${minutesAgo === 1 ? 'minute' : 'minutes'} ago`;
    
    const hoursAgo = Math.floor(minutesAgo / 60);
    if (hoursAgo < 24) return `${hoursAgo} ${hoursAgo === 1 ? 'hour' : 'hours'} ago`;
    
    const daysAgo = Math.floor(hoursAgo / 24);
    if (daysAgo < 30) return `${daysAgo} ${daysAgo === 1 ? 'day' : 'days'} ago`;
    
    const monthsAgo = Math.floor(daysAgo / 30);
    if (monthsAgo < 12) return `${monthsAgo} ${monthsAgo === 1 ? 'month' : 'months'} ago`;
    
    const yearsAgo = Math.floor(monthsAgo / 12);
    return `${yearsAgo} ${yearsAgo === 1 ? 'year' : 'years'} ago`;
  };

  // Truncate text to a certain length with ellipsis
  const truncateText = (text: string, maxLength: number) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).replace(/\s+\S*$/, '') + '...';
  };

  // Get icon for analysis type
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'detailed':
        return (
          <svg className={`w-4 h-4 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'counter':
        return (
          <svg className={`w-4 h-4 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m-4 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        );
      case 'conversation':
        return (
          <svg className={`w-4 h-4 ${darkMode ? 'text-green-400' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        );
      case 'roleplay':
        return (
          <svg className={`w-4 h-4 ${darkMode ? 'text-amber-400' : 'text-amber-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      case 'extract-info':
        return (
          <svg className={`w-4 h-4 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V

            8-4m4 4" />
          </svg>
        );
      case 'initial':
      default:
        return (
          <svg className={`w-4 h-4 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        );
    }
  };

  // Get tag styles based on index
  const getTagStyle = (index: number) => {
    const tagColors = [
      darkMode ? 'bg-indigo-800/40 text-indigo-300' : 'bg-indigo-100 text-indigo-800',
      darkMode ? 'bg-emerald-800/40 text-emerald-300' : 'bg-emerald-100 text-emerald-800',
      darkMode ? 'bg-amber-800/40 text-amber-300' : 'bg-amber-100 text-amber-800',
      darkMode ? 'bg-rose-800/40 text-rose-300' : 'bg-rose-100 text-rose-800',
      darkMode ? 'bg-violet-800/40 text-violet-300' : 'bg-violet-100 text-violet-800',
      darkMode ? 'bg-blue-800/40 text-blue-300' : 'bg-blue-100 text-blue-800',
    ];
    
    return tagColors[index % tagColors.length];
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={`flex flex-col items-center justify-center h-[400px] ${darkMode ? 'bg-slate-800' : 'bg-slate-50'} rounded-lg transition-colors duration-300`}>
        <div className="w-10 h-10 border-t-2 border-b-2 border-indigo-500 rounded-full animate-spin mb-4"></div>
        <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Loading your analysis history...</p>
      </div>
    );
  }

  // Empty state when no analyses
  if (analyses.length === 0) {
    return (
      <div className={`${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'} shadow-sm rounded-lg border overflow-hidden`}>
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <svg className="w-16 h-16 text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className={`text-lg font-medium ${darkMode ? 'text-slate-200' : 'text-slate-700'} mb-1`}>No saved analyses yet</h3>
          <p className={`${darkMode ? 'text-slate-400' : 'text-slate-500'} max-w-md`}>
            Save analysis results while working with sources to keep a record of your insights.
          </p>
          <button
            onClick={() => router.push('/analysis')}
            className={`mt-6 px-4 py-2 ${
              darkMode ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-indigo-600 hover:bg-indigo-700'
            } text-white rounded-md transition-colors shadow-sm flex items-center`}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Start Analyzing
          </button>
        </div>
      </div>
    );
  }

  // Main panel display
  return (
    <>
      <div className={`${darkMode ? 'bg-slate-900' : 'bg-white'} rounded-lg ${darkMode ? 'border border-slate-700' : 'border border-slate-200'} overflow-hidden shadow-md transition-colors duration-300`}>
        {/* Header with controls */}
        <div className={`p-4 ${darkMode ? 'bg-slate-800 border-b border-slate-700' : 'bg-slate-50 border-b border-slate-200'} transition-colors duration-300`}>
          <div className="flex flex-wrap justify-between items-center gap-3">
            <div className="flex items-center">
              <h2 className={`text-lg font-medium ${darkMode ? 'text-slate-200' : 'text-slate-800'} flex items-center`}>
                <svg className={`w-5 h-5 mr-2 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span className="mr-2">Analysis History</span>
                <span className={`text-xs ${darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'} px-2 py-0.5 rounded-full`}>
                  {analyses.length}
                </span>
              </h2>
            </div>
            
            {/* LLM Assistant Search Box */}
            <div className="relative flex-1 max-w-lg">
              <div className="flex">
                <input
                  type="text"
                  placeholder="Enhanced semantic search..."
                  className={`w-full p-2 pr-8 rounded-l ${
                    darkMode 
                      ? 'bg-slate-700 text-slate-200 placeholder-slate-400 border border-slate-600 border-r-0' 
                      : 'bg-white text-slate-800 placeholder-slate-500 border border-slate-200 border-r-0'
                  } text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors duration-200`}
                  value={assistantQuery}
                  onChange={(e) => setAssistantQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAssistantSearch()}
                  disabled={isSearching}
                />
                <button
                  onClick={handleAssistantSearch}
                  disabled={isSearching || !assistantQuery.trim()}
                  className={`flex items-center justify-center p-2 ${
                    isSearching 
                      ? darkMode 
                        ? 'bg-slate-600 cursor-not-allowed' 
                        : 'bg-slate-300 cursor-not-allowed'
                      : !assistantQuery.trim()
                        ? darkMode 
                          ? 'bg-slate-600 cursor-not-allowed' 
                          : 'bg-slate-300 cursor-not-allowed'
                        : darkMode 
                          ? 'bg-indigo-700 hover:bg-indigo-600' 
                          : 'bg-indigo-600 hover:bg-indigo-700'
                  } rounded-r text-white transition-colors duration-200`}
                >
                  {isSearching ? (
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  )}
                </button>
              </div>
              
              {/* Search tooltip - short guide on how to use semantic search */}
              <div className={`absolute -bottom-14 right-0 w-full opacity-0 transition-opacity duration-200 ${assistantQuery && !isSearching ? 'opacity-60 hover:opacity-100' : ''} pointer-events-auto z-10`}>
                <div className={`${darkMode ? 'bg-slate-700 text-slate-300' : 'bg-white text-slate-700'} p-2 text-xs rounded shadow-lg border ${darkMode ? 'border-slate-600' : 'border-slate-200'}`}>
                  <p>Try: "passages with historical context" or "analyses about democracy"</p>
                </div>
              </div>
              
              {/* Clear search results button */}
              {searchResults && (
                <button
                  onClick={clearSearchResults}
                  className={`absolute right-0 top-full mt-1 text-xs ${
                    darkMode ? 'text-slate-400 hover:text-slate-300' : 'text-slate-500 hover:text-slate-700'
                  } flex items-center transition-colors duration-200`}
                >
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Clear results
                </button>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Filter dropdowns row */}
              <div className="flex items-center space-x-2">
                {/* Author filter */}
                <select
                  value={authorFilter}
                  onChange={(e) => setAuthorFilter(e.target.value)}
                  className={`p-1.5 text-xs ${
                    darkMode 
                      ? 'bg-slate-700 text-slate-200 border-slate-600' 
                      : 'bg-white text-slate-800 border-slate-200'
                  } rounded border focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors duration-200`}
                >
                  <option value="all">All Authors</option>
                  {authors.map((author) => (
                    <option key={author} value={author}>
                      {author}
                    </option>
                  ))}
                </select>
                
                {/* Type filter */}
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className={`p-1.5 text-xs ${
                    darkMode 
                      ? 'bg-slate-700 text-slate-200 border-slate-600' 
                      : 'bg-white text-slate-800 border-slate-200'
                  } rounded border focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors duration-200`}
                >
                  <option value="all">All Types</option>
                  {types.map((type) => (
                    <option key={type} value={type}>
                      {getTypeDisplayName(type)}
                    </option>
                  ))}
                </select>
                
                {/* Date Range filter */}
                <select
                  value={dateRangeFilter}
                  onChange={(e) => setDateRangeFilter(e.target.value)}
                  className={`p-1.5 text-xs ${
                    darkMode 
                      ? 'bg-slate-700 text-slate-200 border-slate-600' 
                      : 'bg-white text-slate-800 border-slate-200'
                  } rounded border focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors duration-200`}
                >
                  <option value="all">All Dates</option>
                  {dateRanges.map(({ range, count }) => (
                    <option key={range} value={range}>
                      {range} ({count})
                    </option>
                  ))}
                </select>
                
                {/* Sort by */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className={`p-1.5 text-xs ${
                    darkMode 
                      ? 'bg-slate-700 text-slate-200 border-slate-600' 
                      : 'bg-white text-slate-800 border-slate-200'
                  } rounded border focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors duration-200`}
                >
                  <option value="dateAdded">Recently Added</option>
                  <option value="sourceDate">Source Date</option>
                  <option value="sourceAuthor">Author Name</option>
                </select>
              </div>
              
              {/* View mode toggle */}
              <div className={`flex border overflow-hidden rounded ${darkMode ? 'border-slate-600' : 'border-slate-200'} transition-colors duration-200`}>
                <button
                  onClick={() => setDisplayMode('table')}
                  className={`p-1.5 ${displayMode === 'table' 
                    ? darkMode ? 'bg-slate-700 text-slate-200' : 'bg-indigo-100 text-indigo-800'
                    : darkMode ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-white text-slate-500 hover:bg-slate-100'} transition-colors duration-200`}
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
                    : darkMode ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-white text-slate-500 hover:bg-slate-100'} transition-colors duration-200`}
                  title="Grid view"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                  </svg>
                </button>
              </div>
              
              {/* New analysis button */}
              <button
                onClick={() => router.push('/analysis')}
                className={`px-3 py-1.5 text-white text-xs rounded transition-all transform hover:scale-105 ${
                  darkMode ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-indigo-600 hover:bg-indigo-700'
                } shadow-md hover:shadow-lg flex items-center transition-colors duration-200`}
              >
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                New Analysis
              </button>
            </div>
          </div>
          
          {/* Toolbar */}
          <div className={`flex justify-between items-center mt-3 text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'} transition-colors duration-200`}>
            <div className="flex items-center gap-2">
              {/* Bulk actions */}
              <button
                onClick={handleBulkDelete}
               disabled={selectedAnalyses.length === 0 || !!actionInProgress}
                className={`py-1 px-2 rounded flex items-center gap-1 transition-colors ${
                  selectedAnalyses.length > 0 && !actionInProgress
                    ? darkMode ? 'text-red-400 hover:bg-red-900/30 hover:text-red-300' : 'text-red-600 hover:bg-red-50 hover:text-red-700'
                    : darkMode ? 'text-slate-500 cursor-not-allowed opacity-50' : 'text-slate-400 cursor-not-allowed opacity-50'
                } transition-colors duration-200`}
              >
                {actionInProgress === 'bulk' ? (
                  <>
                    <div className="w-3 h-3 border-t-2 border-r-2 border-current rounded-full animate-spin mr-1"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete {selectedAnalyses.length > 0 ? `(${selectedAnalyses.length})` : ''}
                  </>
                )}
              </button>
              
              <button
                onClick={exportAnalyses}
              disabled={analyses.length === 0 || !!actionInProgress}
                className={`py-1 px-2 rounded flex items-center gap-1 transition-colors ${
                  analyses.length > 0 && !actionInProgress
                    ? darkMode ? 'text-indigo-400 hover:bg-indigo-900/30 hover:text-indigo-300' : 'text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700'
                    : darkMode ? 'text-slate-500 cursor-not-allowed opacity-50' : 'text-slate-400 cursor-not-allowed opacity-50'
                } transition-colors duration-200`}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export {selectedAnalyses.length > 0 ? `(${selectedAnalyses.length})` : 'All'}
              </button>
              
              {/* Search status */}
              {searchResults && (
                <span className={`px-2 py-0.5 rounded ${darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-700'} transition-colors duration-200`}>
                  Found {searchResults.length} matching analyses
                </span>
              )}
            </div>
            
            <div className="font-mono">
              {selectedAnalyses.length > 0 
                ? `${selectedAnalyses.length} selected` 
                : filteredAnalyses.length !== analyses.length
                  ? `${filteredAnalyses.length}/${analyses.length} analyses`
                  : `${analyses.length} analyses`}
            </div>
          </div>
          
          {/* Search results notice */}
          {searchResults && (
            <div className={`mt-2 p-2 rounded-md ${
              darkMode ? 'bg-indigo-900/20 border border-indigo-800/30 text-indigo-300' : 'bg-indigo-50 border border-indigo-100 text-indigo-800'
            } transition-colors duration-200`}>
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium">Showing semantic search results for: "{assistantQuery}"</span>
              </div>
            </div>
          )}
        </div>

        {/* Analyses list - Table View */}
        {displayMode === 'table' && (
          <div className="overflow-x-auto">
            <table className={`w-full text-left text-sm ${darkMode ? 'text-slate-300' : 'text-slate-700'} transition-colors duration-200`}>
              <thead className={darkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-50 text-slate-600'}>
                <tr className="uppercase text-xs tracking-wider">
                  <th className="py-2 px-3 font-medium">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedAnalyses.length > 0 && selectedAnalyses.length === filteredAnalyses.length}
                        onChange={toggleSelectAll}
                        className={`h-3 w-3 rounded ${
                          darkMode ? 'border-slate-600 text-indigo-500 focus:ring-indigo-400' : 'border-slate-300 text-indigo-600 focus:ring-indigo-500'
                        } transition-colors duration-200`}
                      />
                      {selectedAnalyses.length > 0 && (
                        <span className="ml-2 text-xs">
                          {selectedAnalyses.length}/{filteredAnalyses.length}
                        </span>
                      )}
                    </div>
                  </th>
                  <th className="py-2 px-3 font-medium">Type</th>
                  <th className="py-2 px-3 font-medium">Title</th>
                  <th className="py-2 px-3 font-medium">Source</th>
                  <th className="py-2 px-3 font-medium hidden md:table-cell">Preview</th>
                  <th className="py-2 px-3 font-medium">Date Added</th>
                  <th className="py-2 px-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${darkMode ? 'divide-slate-700/50' : 'divide-slate-200'} transition-colors duration-200`}>
                {filteredAnalyses.length === 0 ? (
                  <tr>
                    <td colSpan={7} className={`py-8 text-center ${darkMode ? 'text-slate-400' : 'text-slate-500'} transition-colors duration-200`}>
                      No matching analyses found. Try adjusting your search.
                    </td>
                  </tr>
                ) : (
                  sortedAnalyses.map((analysis, index) => (
                    <tr 
                      key={analysis.id}
                      className={`${
                        darkMode
                          ? index % 2 === 0 ? 'bg-slate-800/50' : 'bg-slate-800/30'
                          : index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                      } hover:${darkMode ? 'bg-slate-700/50' : 'bg-slate-100/70'} transition-all duration-200 cursor-pointer group ${
                        actionInProgress === analysis.id ? 'opacity-50' : ''
                      }`}
                      onClick={() => setExpandedId(expandedId === analysis.id ? null : analysis.id)}
                    >
                      <td className="py-2 px-3">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedAnalyses.includes(analysis.id)}
                            onChange={(e) => toggleAnalysisSelection(analysis.id, e)}
                            disabled={actionInProgress === analysis.id}
                            className={`h-3 w-3 rounded ${
                              darkMode ? 'border-slate-600 text-indigo-500 focus:ring-indigo-400' : 'border-slate-300 text-indigo-600 focus:ring-indigo-500'
                            } transition-colors duration-200 ${actionInProgress === analysis.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                          />
                          
                          {/* Relevance indicator if in search results */}
                          {searchResults && searchResults.some(r => r.id === analysis.id) && (
                            <div 
                              className={`ml-2 h-2.5 w-2.5 rounded-full ${
                                getRelevanceColor(searchResults.find(r => r.id === analysis.id)?.score || 0)
                              }`}
                              title={`Relevance score: ${Math.round((searchResults.find(r => r.id === analysis.id)?.score || 0) * 100)}%`}
                            ></div>
                          )}
                        </div>
                      </td>
                      <td className="py-2 px-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="mr-1.5">
                            {getTypeIcon(analysis.type)}
                          </span>
                          <span className={`text-xs px-1.5 py-0.5 rounded ${getTypeBadgeColor(analysis.type)}`}>
                            {getTypeDisplayName(analysis.type)}
                          </span>
                        </div>
                      </td>
                      <td className="py-2 px-3">
                        <div className={`font-medium ${darkMode ? 'text-slate-200' : 'text-slate-800'} transition-colors duration-200`}>
                          {analysis.title || 'Untitled Analysis'}
                        </div>
                        
                        {/* Tags if available */}
                        {analysis.tags && analysis.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {analysis.tags.slice(0, 2).map((tag, idx) => (
                              <span 
                                key={idx} 
                                className={`px-1.5 py-0.5 text-[10px] rounded-full ${getTagStyle(idx)}`}
                              >
                                {tag}
                              </span>
                            ))}
                            {analysis.tags.length > 2 && (
                              <span className={`px-1.5 py-0.5 text-[10px] rounded-full ${
                                darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-600'
                              }`}>
                                +{analysis.tags.length - 2}
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="py-2 px-3">
                        <div className="flex flex-col">
                          <div className={`font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'} transition-colors duration-200`}>
                           {analysis.sourceName || 'Unknown Source'}
                          </div>
                          <div className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'} flex items-center transition-colors duration-200`}>
                            {analysis.sourceAuthor && (
                              <span className="mr-1.5">{analysis.sourceAuthor}</span>
                            )}
                            {analysis.sourceDate && (
                              <span>({analysis.sourceDate})</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-2 px-3 hidden md:table-cell">
                        <div className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'} max-w-xs overflow-hidden text-ellipsis transition-colors duration-200`}>
                          {truncateText(analysis.content, 80)}
                        </div>
                        
                        {/* Search explanation if available */}
                        {searchResults && searchResults.some(r => r.id === analysis.id) && (
                          <div className={`mt-1 text-xs italic ${darkMode ? 'text-indigo-400' : 'text-indigo-600'} transition-colors duration-200`}>
                            {searchResults.find(r => r.id === analysis.id)?.explanation}
                          </div>
                        )}
                      </td>
                      <td className="py-2 px-3 whitespace-nowrap">
                        <div className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'} transition-colors duration-200`}>
                          <div>{formatDate(analysis.dateAdded)}</div>
                          <div className="opacity-70">{getTimeAgo(analysis.dateAdded)}</div>
                        </div>
                      </td>
                      <td className="py-2 px-3">
                        <div className="flex space-x-1 opacity-80 group-hover:opacity-100">
                          <button
                            onClick={(e) => handleRestoreAnalysis(analysis, e)}
                            disabled={actionInProgress === analysis.id}
                            className={`p-1 ${
                              darkMode ? 'text-indigo-400 hover:text-indigo-300 hover:bg-slate-700' : 'text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50'
                            } rounded transition-colors duration-200 ${actionInProgress === analysis.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                            title="Open analysis"
                          >
                            {actionInProgress === analysis.id ? (
                              <div className="w-3.5 h-3.5 border-t-2 border-r-2 border-indigo-400 rounded-full animate-spin"></div>
                            ) : (
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            )}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(analysis.content, e);
                            }}
                            disabled={actionInProgress === analysis.id}
                            className={`p-1 ${
                              darkMode ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                            } rounded transition-colors duration-200 ${actionInProgress === analysis.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                            title="Copy content"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </button>
                          <button
                            onClick={(e) => handleOpenEditModal(analysis, e)}
                            disabled={actionInProgress === analysis.id}
                            className={`p-1 ${
                              darkMode ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                            } rounded transition-colors duration-200 ${actionInProgress === analysis.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                            title="Edit analysis"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={(e) => handleDelete(analysis.id, e)}
                            disabled={actionInProgress === analysis.id}
                            className={`p-1 ${
                              darkMode ? 'text-slate-400 hover:text-red-400 hover:bg-slate-700' : 'text-slate-500 hover:text-red-600 hover:bg-slate-100'
                            } rounded transition-colors duration-200 ${actionInProgress === analysis.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                            title="Delete analysis"
                          >
                            {actionInProgress === analysis.id && actionInProgress !== 'edit' ? (
                              <div className="w-3.5 h-3.5 border-t-2 border-r-2 border-red-400 rounded-full animate-spin"></div>
                            ) : (
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            )}
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

        {/* Analyses list - Grid View with improved design */}
        {displayMode === 'grid' && (
          <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 ${darkMode ? 'bg-slate-900' : 'bg-slate-50/50'} transition-colors duration-200`}>
            {filteredAnalyses.length === 0 ? (
              <div className={`col-span-full py-8 text-center ${darkMode ? 'text-slate-400' : 'text-slate-500'} transition-colors duration-200`}>
                <svg className="w-12 h-12 mx-auto mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p className="mb-2">No matching analyses found.</p>
                <button 
                  onClick={() => {
                    setSearchTerm('');
                    setAuthorFilter('all');
                    setTypeFilter('all');
                    setDateRangeFilter('all');
                    clearSearchResults();
                  }}
                  className={`text-xs ${darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-700'} hover:underline transition-colors duration-200`}
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              sortedAnalyses.map((analysis) => (
                <div 
                  key={analysis.id}
                  className={`${
                    darkMode 
                      ? selectedAnalyses.includes(analysis.id)
                        ? 'bg-slate-700 border border-indigo-600 ring-2 ring-indigo-500/30'
                        : 'bg-slate-800 border border-slate-700 hover:bg-slate-700/80 hover:border-slate-600' 
                      : selectedAnalyses.includes(analysis.id)
                        ? 'bg-indigo-50 border border-indigo-300 ring-2 ring-indigo-500/20'
                        : 'bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                  } rounded-lg overflow-hidden transition-all duration-150 cursor-pointer group shadow-md hover:shadow-lg transform hover:translate-y-[-2px] ${
                    actionInProgress === analysis.id ? 'opacity-60 pointer-events-none' : ''
                  }`}
                  onClick={() => setExpandedId(expandedId === analysis.id ? null : analysis.id)}
                >
                  {/* Card header with checkbox and type */}
                  <div className={`flex items-center justify-between p-3 border-b ${darkMode ? 'border-slate-700/50' : 'border-slate-100'} transition-colors duration-200`}>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedAnalyses.includes(analysis.id)}
                        onChange={(e) => toggleAnalysisSelection(analysis.id, e)}
                        disabled={actionInProgress === analysis.id}
                        className={`h-3 w-3 mr-2 rounded ${
                          darkMode ? 'border-slate-600 text-indigo-500 focus:ring-indigo-400' : 'border-slate-300 text-indigo-600 focus:ring-indigo-500'
                        } transition-colors duration-200 ${actionInProgress === analysis.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                      />
                      <div className="flex items-center">
                        {/* Relevance indicator for search results */}
                        {searchResults && searchResults.some(r => r.id === analysis.id) && (
                          <div 
                            className={`mr-2 h-2.5 w-2.5 rounded-full ${
                              getRelevanceColor(searchResults.find(r => r.id === analysis.id)?.score || 0)
                            }`}
                            title={`Relevance score: ${Math.round((searchResults.find(r => r.id === analysis.id)?.score || 0) * 100)}%`}
                          ></div>
                        )}
                        <span className={`inline-flex items-center space-x-1.5 px-2 py-0.5 rounded text-xs ${getTypeBadgeColor(analysis.type)} transition-colors duration-200`}>
                          {getTypeIcon(analysis.type)}
                          <span>{getTypeDisplayName(analysis.type)}</span>
                        </span>
                      </div>
                    </div>
                    
                    <div className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'} transition-colors duration-200`}>
                      {getTimeAgo(analysis.dateAdded)}
                    </div>
                  </div>
                  
                  {/* Card content */}
                  <div className="p-3">
                    <h3 className={`font-medium ${darkMode ? 'text-slate-200' : 'text-slate-800'} mb-1.5 truncate transition-colors duration-200`}>
                      {analysis.title || 'Untitled Analysis'}
                    </h3>
                    
                    <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'} mb-2 transition-colors duration-200`}>
                      {analysis.sourceName && (
                        <span className="font-medium">{analysis.sourceName}</span>
                      )}
                      {analysis.sourceAuthor && (
                        <span className="ml-1">
                          by {analysis.sourceAuthor}
                          {analysis.sourceDate && <span> ({analysis.sourceDate})</span>}
                        </span>
                      )}
                    </p>
                    
                    {/* Tags */}
                    {analysis.tags && analysis.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {analysis.tags.slice(0, 3).map((tag, idx) => (
                          <span 
                            key={idx} 
                            className={`px-1.5 py-0.5 text-[10px] rounded-full ${getTagStyle(idx)} transition-colors duration-200`}
                          >
                            {tag}
                          </span>
                        ))}
                        {analysis.tags.length > 3 && (
                          <span className={`px-1.5 py-0.5 text-[10px] rounded-full ${
                            darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-600'
                          } transition-colors duration-200`}>
                            +{analysis.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                    
                    {/* Perspective if available */}
                    {analysis.perspective && (
                      <div className={`mb-2 text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'} ${
                        darkMode ? 'bg-slate-700/30' : 'bg-slate-100/80'
                      } p-1.5 rounded transition-colors duration-200`}>
                        <span className="font-medium">Perspective:</span> {analysis.perspective}
                      </div>
                    )}
                    
                    {/* Content preview */}
                    <div className="mb-2">
                      <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'} line-clamp-3 transition-colors duration-200`}>
                        {expandedId === analysis.id ? analysis.content : truncateText(analysis.content, 150)}
                      </p>
                      {expandedId === analysis.id && (
                        <div className={`mt-2 text-xs rounded p-2 ${
                          darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-700'
                        } max-h-48 overflow-y-auto transition-colors duration-200`}>
                          <ReactMarkdown>
                            {analysis.content}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>
                    
                    {/* Search explanation */}
                    {searchResults && searchResults.some(r => r.id === analysis.id) && (
                      <div className={`mb-2 px-2 py-1 text-xs italic rounded ${
                        darkMode ? 'bg-indigo-900/20 text-indigo-300' : 'bg-indigo-50 text-indigo-700'
                      } transition-colors duration-200`}>
                        {searchResults.find(r => r.id === analysis.id)?.explanation}
                      </div>
                    )}
                    
                    {/* Model information */}
                    {analysis.model && (
                      <div className={`mb-2 text-xs ${darkMode ? 'text-slate-500' : 'text-slate-500'} transition-colors duration-200`}>
                        <span className="font-medium">Model:</span> {analysis.model}
                      </div>
                    )}
                  </div>
                  
                  {/* Card footer with actions */}
                  <div className={`flex border-t ${darkMode ? 'border-slate-700/50 divide-x divide-slate-700/50' : 'border-slate-100 divide-x divide-slate-200'} transition-colors duration-200`}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRestoreAnalysis(analysis, e);
                      }}
                      disabled={actionInProgress === analysis.id}
                      className={`flex-1 p-1.5 ${
                        darkMode 
                          ? 'text-indigo-400 hover:text-indigo-300 hover:bg-slate-700' 
                          : 'text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50'
                      } text-xs flex items-center justify-center transition-colors duration-200 ${
                        actionInProgress === analysis.id ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {actionInProgress === analysis.id ? (
                        <div className="w-3 h-3 border-t-2 border-r-2 border-current rounded-full animate-spin mr-1"></div>
                      ) : (
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      )}
                      Open
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(analysis.content, e);
                      }}
                      disabled={actionInProgress === analysis.id}
                      className={`flex-1 p-1.5 ${
                        darkMode 
                          ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700' 
                          : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                      } text-xs flex items-center justify-center transition-colors duration-200 ${
                        actionInProgress === analysis.id ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy
                    </button>
                    <button
                      onClick={(e) => handleOpenEditModal(analysis, e)}
                      disabled={actionInProgress === analysis.id}
                      className={`flex-1 p-1.5 ${
                        darkMode 
                          ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700' 
                          : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                      } text-xs flex items-center justify-center transition-colors duration-200 ${
                        actionInProgress === analysis.id ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </button>
                    <button
                      onClick={(e) => handleDelete(analysis.id, e)}
                      disabled={actionInProgress === analysis.id}
                      className={`flex-1 p-1.5 ${
                        darkMode 
                          ? 'text-slate-400 hover:text-red-400 hover:bg-slate-700' 
                          : 'text-slate-500 hover:text-red-600 hover:bg-slate-100'
                      } text-xs flex items-center justify-center transition-colors duration-200 ${
                        actionInProgress === analysis.id ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {actionInProgress === analysis.id && actionInProgress !== 'edit' ? (
                        <div className="w-3 h-3 border-t-2 border-r-2 border-red-400 rounded-full animate-spin mr-1"></div>
                      ) : (
                        <>
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Notification toast */}
      {copyMessage && (
        <div className="fixed top-16 right-4 z-50 animate-fade-in-down">
          <div className={`${
            darkMode ? 'bg-slate-800 text-white border border-slate-700' : 'bg-white text-slate-800 border border-slate-200'
          } px-4 py-2 rounded-md shadow-lg transition-colors duration-200 flex items-center`}>
            <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {copyMessage}
          </div>
        </div>
      )}

      {/* Edit Analysis Modal */}
      {editModalOpen && currentEditAnalysis && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div 
            className={`${
              darkMode ? 'bg-slate-900 border border-slate-700' : 'bg-white border border-slate-200'
            } rounded-lg shadow-xl max-w-md w-full overflow-hidden transition-colors duration-200`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`p-4 ${
              darkMode ? 'border-b border-slate-700 bg-slate-800' : 'border-b border-slate-200 bg-slate-50'
            } flex justify-between items-center transition-colors duration-200`}>
              <h3 className={`font-bold text-lg ${darkMode ? 'text-slate-200' : 'text-slate-800'} transition-colors duration-200`}>Edit Analysis Details</h3>
              <button 
                onClick={() => {
                  setEditModalOpen(false);
                  setCurrentEditAnalysis(null);
                }}
                className={`${darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700'} transition-colors duration-200`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Edit form */}
            <div className="p-4 space-y-4">
              <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'} mb-1 transition-colors duration-200`}>
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
                  } rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200`}
                  placeholder="Analysis title"
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'} mb-1 transition-colors duration-200`}>
                  Perspective
                </label>
                <input
                  type="text"
                  name="perspective"
                  value={editForm.perspective}
                  onChange={handleEditFormChange}
                  className={`w-full p-2 ${
                    darkMode 
                      ? 'bg-slate-800 border border-slate-700 text-slate-200 placeholder-slate-500' 
                      : 'bg-white border border-slate-300 text-slate-800 placeholder-slate-400'
                  } rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200`}
                  placeholder="Analysis perspective (optional)"
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'} mb-1 transition-colors duration-200`}>
                  Tags
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
                  } rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200`}
                  placeholder="Comma-separated tags (optional)"
                />
                <p className={`mt-1 text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'} transition-colors duration-200`}>
                  Separate tags with commas (e.g., "history, politics, economics")
                </p>
              </div>

              {/* Source Information Display (Read-only) */}
              <div className={`mt-2 ${
                darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-slate-50 border border-slate-200'
              } rounded-md p-3 transition-colors duration-200`}>
                <h4 className={`text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'} mb-2 transition-colors duration-200`}>Source Information</h4>
                <div className="space-y-1">
                  <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'} transition-colors duration-200`}>
                    <span className="font-medium">Title:</span> {currentEditAnalysis.sourceName}
                  </p>
                  <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'} transition-colors duration-200`}>
                    <span className="font-medium">Author:</span> {currentEditAnalysis.sourceAuthor}
                  </p>
                  <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'} transition-colors duration-200`}>
                    <span className="font-medium">Date:</span> {currentEditAnalysis.sourceDate}
                  </p>
                  <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'} transition-colors duration-200`}>
                    <span className="font-medium">Analysis Type:</span> {getTypeDisplayName(currentEditAnalysis.type)}
                  </p>
                  {currentEditAnalysis.model && (
                    <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'} transition-colors duration-200`}>
                      <span className="font-medium">Model:</span> {currentEditAnalysis.model}
                    </p>
                  )}
                </div>
              </div>
            </div>
            
           <div className={`p-4 ${
              darkMode ? 'bg-slate-800 border-t border-slate-700' : 'bg-slate-50 border-t border-slate-200'
            } flex justify-end space-x-3 transition-colors duration-200`}>
              <button
                onClick={() => {
                  setEditModalOpen(false);
                  setCurrentEditAnalysis(null);
                }}
                className={`px-4 py-2 ${
                  darkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
                } rounded transition-colors duration-200 text-sm`}
                disabled={actionInProgress === 'edit'}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className={`px-4 py-2 ${
                  darkMode ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-indigo-600 hover:bg-indigo-700'
                } text-white rounded transition-colors duration-200 text-sm font-medium`}
                disabled={actionInProgress === 'edit'}
              >
                {actionInProgress === 'edit' ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-t-2 border-r-2 border-white rounded-full animate-spin mr-2"></div>
                    Saving...
                  </div>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
