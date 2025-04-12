// lib/libraryContext.tsx
// Enhanced context provider for managing user library data across the application
// Now integrates with Supabase for persistent storage across devices

'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Metadata } from '@/lib/store';
import { useAuth } from '@/lib/auth/authContext';



// Types
export interface SavedDraft {
  id: string;
  title: string;
  content: string;
  summary?: string;
  sections?: {
    id: string;
    title: string;
    summary: string;
    fullText: string;
  }[];
  dateAdded: number;
  lastEdited?: number;
  tags?: string[];
  status?: 'in-progress' | 'review' | 'final';
  type: 'text' | 'pdf' | 'docx';
  wordCount?: number;
  userId: string; // Add user ID for database records
}

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
  userId: string; // Add user ID for database records
}

export interface SavedAnalysis {
  id: string;
  type: 'detailed' | 'counter' | 'conversation' | 'roleplay' | 'initial' | 'extract-info';
  title: string;
  content: string;
  sourceName: string;
  sourceAuthor: string;
  sourceDate: string;
  dateAdded: number;
  tags?: string[];
  model?: string;
  perspective?: string;
  userId: string; // Add user ID for database records
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
  userId: string; // Add user ID for database records
}

// Context interface
interface LibraryContextType {
  // References
  references: SavedReference[];
  addReference: (reference: Omit<SavedReference, 'id' | 'dateAdded' | 'userId'>) => Promise<string>;
  deleteReference: (id: string) => Promise<void>;
  referenceExists: (citation: string) => boolean;
  
  // Analyses
  analyses: SavedAnalysis[];
  addAnalysis: (analysis: Omit<SavedAnalysis, 'id' | 'dateAdded' | 'userId'>) => Promise<string>;
  deleteAnalysis: (id: string) => Promise<void>;
  
  // Sources
  sources: SavedSource[];
  addSource: (source: Omit<SavedSource, 'id' | 'dateAdded' | 'userId'>) => Promise<string>;
  deleteSource: (id: string) => Promise<void>;
  sourceExists: (content: string) => boolean;

  // Drafts
  drafts: SavedDraft[];
  addDraft: (draft: Omit<SavedDraft, 'id' | 'dateAdded' | 'userId'>) => Promise<string>;
  updateDraft: (id: string, updates: Partial<SavedDraft>) => Promise<void>;
  deleteDraft: (id: string) => Promise<void>;
  draftExists: (title: string) => boolean;
  
  // Import/Export
  exportLibrary: () => Promise<boolean>;
  importLibrary: (data: string) => Promise<boolean>;
  
  // Loading state
  isLoading: boolean;
}

// Create context
const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

// Provider component
export function LibraryProvider({ children }: { children: React.ReactNode }) {
  const { user, supabase, isLoading: authLoading } = useAuth();
  
  const [references, setReferences] = useState<SavedReference[]>([]);
  const [analyses, setAnalyses] = useState<SavedAnalysis[]>([]);
  const [sources, setSources] = useState<SavedSource[]>([]);
  const [drafts, setDrafts] = useState<SavedDraft[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load data from Supabase when user changes
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        // Clear data when no user is logged in
        setReferences([]);
        setAnalyses([]);
        setSources([]);
        setDrafts([]);
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      
      try {
        // Fetch references
        const { data: referencesData, error: referencesError } = await supabase
          .from('references')
          .select('*')
          .eq('userId', user.id);
          
        if (referencesError) throw referencesError;
        setReferences(referencesData || []);
        
        // Fetch analyses
        const { data: analysesData, error: analysesError } = await supabase
          .from('analyses')
          .select('*')
          .eq('userId', user.id);
          
        if (analysesError) throw analysesError;
        setAnalyses(analysesData || []);
        
        // Fetch sources
        const { data: sourcesData, error: sourcesError } = await supabase
          .from('sources')
          .select('*')
          .eq('userId', user.id);
          
        if (sourcesError) throw sourcesError;
        setSources(sourcesData || []);
        
        // Fetch drafts
        const { data: draftsData, error: draftsError } = await supabase
          .from('drafts')
          .select('*')
          .eq('userId', user.id);
          
        if (draftsError) throw draftsError;
        setDrafts(draftsData || []);
        
        } catch (err: any) { // Add : any to access properties easily
        // Log the full error object and specific properties if they exist
        console.error('Error fetching user data (raw error object):', err);
        if (err) {
          console.error('Error details:', {
            message: err.message,
            details: err.details,
            hint: err.hint,
            code: err.code,
          });
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    // Only fetch data if auth is not loading
    if (!authLoading) {
      fetchUserData();
    }
  }, [user, supabase, authLoading]);

  // References functions
  const addReference = async (reference: Omit<SavedReference, 'id' | 'dateAdded' | 'userId'>) => {
    if (!user) throw new Error('User not authenticated');
    
    const newReference: SavedReference = {
      ...reference,
      id: uuidv4(),
      dateAdded: Date.now(),
      userId: user.id
    };
    
    // Add to Supabase
    const { error } = await supabase
      .from('references')
      .insert(newReference);
      
    if (error) throw error;
    
    // Update local state
    setReferences(prev => [...prev, newReference]);
    
    return newReference.id;
  };
  
  const deleteReference = async (id: string) => {
    if (!user) throw new Error('User not authenticated');
    
    // Delete from Supabase
    const { error } = await supabase
      .from('references')
      .delete()
      .eq('id', id)
      .eq('userId', user.id);
      
    if (error) throw error;
    
    // Update local state
    setReferences(prev => prev.filter(ref => ref.id !== id));
  };
  
  const referenceExists = (citation: string) => {
    return references.some(ref => ref.citation === citation);
  };

  // Analyses functions
  const addAnalysis = async (analysis: Omit<SavedAnalysis, 'id' | 'dateAdded' | 'userId'>) => {
    if (!user) throw new Error('User not authenticated');
    
    const newAnalysis: SavedAnalysis = {
      ...analysis,
      id: uuidv4(),
      dateAdded: Date.now(),
      userId: user.id
    };
    
    // Add to Supabase
    const { error } = await supabase
      .from('analyses')
      .insert(newAnalysis);
      
    if (error) throw error;
    
    // Update local state
    setAnalyses(prev => [...prev, newAnalysis]);
    
    return newAnalysis.id;
  };
  
  const deleteAnalysis = async (id: string) => {
    if (!user) throw new Error('User not authenticated');
    
    // Delete from Supabase
    const { error } = await supabase
      .from('analyses')
      .delete()
      .eq('id', id)
      .eq('userId', user.id);
      
    if (error) throw error;
    
    // Update local state
    setAnalyses(prev => prev.filter(analysis => analysis.id !== id));
  };

  // Drafts functions
  const addDraft = async (draft: Omit<SavedDraft, 'id' | 'dateAdded' | 'userId'>) => {
    if (!user) throw new Error('User not authenticated');
    
    const newDraft: SavedDraft = {
      ...draft,
      id: uuidv4(),
      dateAdded: Date.now(),
      userId: user.id
    };
    
    // Add to Supabase
    const { error } = await supabase
      .from('drafts')
      .insert(newDraft);
      
    if (error) throw error;
    
    // Update local state
    setDrafts(prev => [...prev, newDraft]);
    
    return newDraft.id;
  };
  
  const updateDraft = async (id: string, updates: Partial<SavedDraft>) => {
    if (!user) throw new Error('User not authenticated');
    
    const updatedDraft = {
      ...updates,
      lastEdited: Date.now()
    };
    
    // Update in Supabase
    const { error } = await supabase
      .from('drafts')
      .update(updatedDraft)
      .eq('id', id)
      .eq('userId', user.id);
      
    if (error) throw error;
    
    // Update local state
    setDrafts(prev => prev.map(draft => 
      draft.id === id ? { ...draft, ...updatedDraft } : draft
    ));
  };
  
  const deleteDraft = async (id: string) => {
    if (!user) throw new Error('User not authenticated');
    
    // Delete from Supabase
    const { error } = await supabase
      .from('drafts')
      .delete()
      .eq('id', id)
      .eq('userId', user.id);
      
    if (error) throw error;
    
    // Update local state
    setDrafts(prev => prev.filter(draft => draft.id !== id));
  };
  
  const draftExists = (title: string) => {
    return drafts.some(draft => draft.title.toLowerCase() === title.toLowerCase());
  };

  // Sources functions
  const addSource = async (source: Omit<SavedSource, 'id' | 'dateAdded' | 'userId'>) => {
    if (!user) throw new Error('User not authenticated');
    
    const newSource: SavedSource = {
      ...source,
      id: uuidv4(),
      dateAdded: Date.now(),
      userId: user.id
    };
    
    // Add to Supabase
    const { error } = await supabase
      .from('sources')
      .insert(newSource);
      
    if (error) throw error;
    
    // Update local state
    setSources(prev => [...prev, newSource]);
    
    return newSource.id;
  };
  
  const deleteSource = async (id: string) => {
    if (!user) throw new Error('User not authenticated');
    
    // Delete from Supabase
    const { error } = await supabase
      .from('sources')
      .delete()
      .eq('id', id)
      .eq('userId', user.id);
      
    if (error) throw error;
    
    // Update local state
    setSources(prev => prev.filter(source => source.id !== id));
  };
  
  const sourceExists = (content: string) => {
    // Consider a source as existing if first 100 chars match
    const contentStart = content.substring(0, 100);
    return sources.some(source => source.content.substring(0, 100) === contentStart);
  };

  // Export library data
  const exportLibrary = async () => {
    try {
      if (!user) throw new Error('User not authenticated');
      
      const libraryData = {
        references,
        analyses,
        sources,
        drafts,
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

  // Import library data
  const importLibrary = async (data: string) => {
    try {
      if (!user) throw new Error('User not authenticated');
      
      const parsed = JSON.parse(data);
      
      // Basic validation
      if (!parsed.references || !parsed.analyses || !parsed.sources || !parsed.drafts) {
        throw new Error('Invalid library data format');
      }
      
      // Add user ID to each item
      const userReferences = parsed.references.map((ref: any) => ({ ...ref, userId: user.id }));
      const userAnalyses = parsed.analyses.map((analysis: any) => ({ ...analysis, userId: user.id }));
      const userSources = parsed.sources.map((source: any) => ({ ...source, userId: user.id }));
      const userDrafts = parsed.drafts.map((draft: any) => ({ ...draft, userId: user.id }));
      
      // Clear existing data for this user
      await supabase.from('references').delete().eq('userId', user.id);
      await supabase.from('analyses').delete().eq('userId', user.id);
      await supabase.from('sources').delete().eq('userId', user.id);
      await supabase.from('drafts').delete().eq('userId', user.id);
      
      // Insert imported data
      if (userReferences.length > 0) {
        const { error } = await supabase.from('references').insert(userReferences);
        if (error) throw error;
      }
      
      if (userAnalyses.length > 0) {
        const { error } = await supabase.from('analyses').insert(userAnalyses);
        if (error) throw error;
      }
      
      if (userSources.length > 0) {
        const { error } = await supabase.from('sources').insert(userSources);
        if (error) throw error;
      }
      
      if (userDrafts.length > 0) {
        const { error } = await supabase.from('drafts').insert(userDrafts);
        if (error) throw error;
      }
      
      // Update local state
      setReferences(userReferences);
      setAnalyses(userAnalyses);
      setSources(userSources);
      setDrafts(userDrafts);
      
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

    // Drafts
    drafts,
    addDraft,
    updateDraft,
    deleteDraft,
    draftExists,
    
    // Sources
    sources,
    addSource,
    deleteSource,
    sourceExists,
    
    // Import/Export
    exportLibrary,
    importLibrary,
    
    // Loading state
    isLoading
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