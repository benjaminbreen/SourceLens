// lib/libraryContext.tsx
// Context provider for managing library functionality across the application
// Handles saving/loading references, analyses, and sources to localStorage

'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Metadata } from '@/lib/store';

// Storage keys
export const SAVED_REFERENCES_KEY = 'sourceLens_savedReferences';
export const SAVED_ANALYSES_KEY = 'sourceLens_savedAnalyses';
export const SAVED_SOURCES_KEY = 'sourceLens_savedSources';

// Types
export interface SavedReference {
  id: string;
  citation: string;
  url: string;
  type: 'book' | 'journal' | 'website' | 'other';
  relevance: string;
  sourceQuote: string;
  importance: number;
  dateAdded: number;
  sourceName?: string;
  sourceAuthor?: string;
  sourceDate?: string;
  reliability?: string;
}

export interface SavedAnalysis {
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

export interface SavedSource {
  id: string;
  content: string;
  metadata: Metadata;
  dateAdded: number;
  type: 'text' | 'pdf' | 'image';
  lastAccessed?: number;
  tags?: string[];
  category?: string;
}

// Context interface
interface LibraryContextType {
  // References
  references: SavedReference[];
  addReference: (reference: Omit<SavedReference, 'id' | 'dateAdded'>) => string;
  deleteReference: (id: string) => void;
  referenceExists: (citation: string) => boolean;
  
  // Analyses
  analyses: SavedAnalysis[];
  addAnalysis: (analysis: Omit<SavedAnalysis, 'id' | 'dateAdded'>) => string;
  deleteAnalysis: (id: string) => void;
  
  // Sources
  sources: SavedSource[];
  addSource: (source: Omit<SavedSource, 'id' | 'dateAdded'>) => string;
  deleteSource: (id: string) => void;
  sourceExists: (content: string) => boolean;
  
  // Import/Export
  exportLibrary: () => void;
  importLibrary: (data: string) => boolean;
}

// Create context
const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

// Provider component
export function LibraryProvider({ children }: { children: ReactNode }) {
  const [references, setReferences] = useState<SavedReference[]>([]);
  const [analyses, setAnalyses] = useState<SavedAnalysis[]>([]);
  const [sources, setSources] = useState<SavedSource[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    const loadFromLocalStorage = () => {
      try {
        // Load references
        const referencesJson = localStorage.getItem(SAVED_REFERENCES_KEY);
        if (referencesJson) {
          setReferences(JSON.parse(referencesJson));
        }
        
        // Load analyses
        const analysesJson = localStorage.getItem(SAVED_ANALYSES_KEY);
        if (analysesJson) {
          setAnalyses(JSON.parse(analysesJson));
        }
        
        // Load sources
        const sourcesJson = localStorage.getItem(SAVED_SOURCES_KEY);
        if (sourcesJson) {
          setSources(JSON.parse(sourcesJson));
        }
      } catch (error) {
        console.error('Error loading library data:', error);
      } finally {
        setIsInitialized(true);
      }
    };
    
    loadFromLocalStorage();
  }, []);

  // References functions
  const addReference = (reference: Omit<SavedReference, 'id' | 'dateAdded'>) => {
    const newReference: SavedReference = {
      ...reference,
      id: uuidv4(),
      dateAdded: Date.now()
    };
    
    const updatedReferences = [...references, newReference];
    setReferences(updatedReferences);
    localStorage.setItem(SAVED_REFERENCES_KEY, JSON.stringify(updatedReferences));
    return newReference.id;
  };
  
  const deleteReference = (id: string) => {
    const updatedReferences = references.filter(ref => ref.id !== id);
    setReferences(updatedReferences);
    localStorage.setItem(SAVED_REFERENCES_KEY, JSON.stringify(updatedReferences));
  };
  
  const referenceExists = (citation: string) => {
    return references.some(ref => ref.citation === citation);
  };

  // Analyses functions
  const addAnalysis = (analysis: Omit<SavedAnalysis, 'id' | 'dateAdded'>) => {
    const newAnalysis: SavedAnalysis = {
      ...analysis,
      id: uuidv4(),
      dateAdded: Date.now()
    };
    
    const updatedAnalyses = [...analyses, newAnalysis];
    setAnalyses(updatedAnalyses);
    localStorage.setItem(SAVED_ANALYSES_KEY, JSON.stringify(updatedAnalyses));
    return newAnalysis.id;
  };
  
  const deleteAnalysis = (id: string) => {
    const updatedAnalyses = analyses.filter(analysis => analysis.id !== id);
    setAnalyses(updatedAnalyses);
    localStorage.setItem(SAVED_ANALYSES_KEY, JSON.stringify(updatedAnalyses));
  };

  // Sources functions
  const addSource = (source: Omit<SavedSource, 'id' | 'dateAdded'>) => {
    const newSource: SavedSource = {
      ...source,
      id: uuidv4(),
      dateAdded: Date.now()
    };
    
    const updatedSources = [...sources, newSource];
    setSources(updatedSources);
    localStorage.setItem(SAVED_SOURCES_KEY, JSON.stringify(updatedSources));
    return newSource.id;
  };
  
  const deleteSource = (id: string) => {
    const updatedSources = sources.filter(source => source.id !== id);
    setSources(updatedSources);
    localStorage.setItem(SAVED_SOURCES_KEY, JSON.stringify(updatedSources));
  };
  
  const sourceExists = (content: string) => {
    // Consider a source as existing if first 100 chars match
    const contentStart = content.substring(0, 100);
    return sources.some(source => source.content.substring(0, 100) === contentStart);
  };

  // Export all library data as JSON
  const exportLibrary = () => {
    try {
      const libraryData = {
        references,
        analyses,
        sources,
        exportDate: new Date().toISOString(),
        version: '1.0'
      };
      
      const json = JSON.stringify(libraryData, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `sourceLens_library_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      return true;
    } catch (error) {
      console.error('Error exporting library:', error);
      return false;
    }
  };

  // Import library data from JSON
  const importLibrary = (data: string) => {
    try {
      const parsed = JSON.parse(data);
      
      // Basic validation
      if (!parsed.references || !parsed.analyses || !parsed.sources) {
        throw new Error('Invalid library data format');
      }
      
      // Update state and localStorage
      setReferences(parsed.references);
      localStorage.setItem(SAVED_REFERENCES_KEY, JSON.stringify(parsed.references));
      
      setAnalyses(parsed.analyses);
      localStorage.setItem(SAVED_ANALYSES_KEY, JSON.stringify(parsed.analyses));
      
      setSources(parsed.sources);
      localStorage.setItem(SAVED_SOURCES_KEY, JSON.stringify(parsed.sources));
      
      return true;
    } catch (error) {
      console.error('Error importing library:', error);
      return false;
    }
  };

  // Context value
  const value = {
    // References
    references,
    addReference,
    deleteReference,
    referenceExists,
    
    // Analyses
    analyses,
    addAnalysis, 
    deleteAnalysis,
    
    // Sources
    sources,
    addSource,
    deleteSource,
    sourceExists,
    
    // Import/Export
    exportLibrary,
    importLibrary
  };

  return (
    <LibraryContext.Provider value={value}>
      {children}
    </LibraryContext.Provider>
  );
}

// Custom hook to use the library context
export function useLibrary() {
  const context = useContext(LibraryContext);
  if (context === undefined) {
    throw new Error('useLibrary must be used within a LibraryProvider');
  }
  return context;
}