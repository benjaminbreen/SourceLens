// lib/libraryContext.tsx
// Enhanced context provider for managing user library data across the application
// Now integrates with Supabase for persistent storage across devices

'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Metadata } from '@/lib/store';
import { useAuth } from '@/lib/auth/authContext';
import { uploadThumbnail } from '@/lib/storage/uploadThumbnail';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { usePathname } from 'next/navigation'; // <--- Import usePathname

const supabase = createClientComponentClient();

export async function getSourcesList() {
  const { data, error } = await supabase
    .from('sources')
    .select( // ⬅️ only columns the grid needs
      `id,
       metadata,
       dateAdded,
       lastAccessed,
       type,
       tags,
       category,
       thumbnailUrl`
    )
    .order('dateAdded', { ascending: false });

  if (error) throw error;
  return data;
}

// ────────────────────────────────────────────────────────────
//  Full source – fetch *once* per click
// ────────────────────────────────────────────────────────────
export async function getSourceWithContent(id: string) {
  const { data, error } = await supabase
    .from('sources')
    .select(
      `id,
       content,
       metadata,
       type,
       thumbnailUrl`
    )
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

// ────────────────────────────────────────────────────────────
//  Cheap note counts (≈ 1 kB instead of the whole table)
// ────────────────────────────────────────────────────────────
export async function getNoteCountsBySource(): Promise<Record<string, number>> {
  const { data, error } = await supabase
    .from('notes')
    .select('id, sourceId', { count: 'exact', head: false });
  if (error) throw error;

  const map: Record<string, number> = {};
  data.forEach(({ sourceId }) => (map[sourceId] = (map[sourceId] ?? 0) + 1));
  return map;
}

// Types
export interface Note {
  id: string;
  content: string;
  sourceId: string;
  sourceMetadata: Metadata;
  dateCreated: number;
  lastModified: number;
  tags: string[];
  userId: string;
   images?: NoteImage[]; 
   
}

export interface NoteImage {
  id: string;
  url: string;
  filename?: string;
}

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
  userId: string;
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
  userId: string;
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
  userId: string;
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
  userId: string;
  thumbnailUrl?: string | null;
}

// Context interface
interface LibraryContextType {
  // References
  references: SavedReference[];
  addReference: (reference: Omit<SavedReference, 'id' | 'dateAdded' | 'userId'>) => Promise<string>;
  deleteReference: (id: string) => Promise<void>;
  referenceExists: (citation: string) => boolean;
  updateReference: (id: string, updates: Partial<SavedReference>) => Promise<void>;
  
  // Notes
  notes: Note[];
  addNote: (note: Omit<Note, 'id' | 'dateCreated' | 'userId'>) => Promise<string>;
  updateNote: (id: string, updates: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;

  // Analyses
  analyses: SavedAnalysis[];
  addAnalysis: (analysis: Omit<SavedAnalysis, 'id' | 'dateAdded' | 'userId'>) => Promise<string>;
  deleteAnalysis: (id: string) => Promise<void>;
  updateAnalysis: (id: string, updates: Partial<SavedAnalysis>) => Promise<void>;
  
  // Sources
  sources: SavedSource[];
  addSource: (source: Omit<SavedSource, 'id' | 'dateAdded' | 'userId'>) => Promise<string>;
  deleteSource: (id: string) => Promise<void>;
  sourceExists: (content: string) => boolean;
  updateSource: (id: string, updates: Partial<SavedSource>) => Promise<void>;

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
  const pathname = usePathname(); // <--- Get the current path

  const [references, setReferences] = useState<SavedReference[]>([]);
  const [analyses, setAnalyses] = useState<SavedAnalysis[]>([]);
  const [sources, setSources] = useState<SavedSource[]>([]);
  const [drafts, setDrafts] = useState<SavedDraft[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Keep initial loading state

  // Load data from Supabase when user changes OR path changes (away from splash)
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user || !supabase) {
        // Clear data when no user is logged in
        console.log("No user/supabase client, clearing library data.");
        setReferences([]);
        setAnalyses([]);
        setSources([]);
        setDrafts([]);
        setNotes([]);
        setIsLoading(false); // Set loading false here too
        return;
      }

      // --- THE FIX: Check if we are on the splash page ---
      const isSplashPage = pathname === '/'; // Adjust if your splash page path is different
      if (isSplashPage) {
          console.log("On splash page, skipping full library fetch.");
          // We might still be "loading" auth, but not library data
          // Set library loading to false, but overall loading might depend on authLoading
          setIsLoading(authLoading);
          // Ensure arrays are empty if not fetched
          setReferences([]);
          setAnalyses([]);
          setSources([]);
          setDrafts([]);
          setNotes([]);
          return; // <-- Exit early, DO NOT fetch data
      }
      // --- End of FIX ---


      console.log("User authenticated and not on splash page, fetching library data...");
      setIsLoading(true); // Set loading true ONLY when actually fetching

      try {
        // Fetch references (using Promise.all for parallel fetching)
        const referencesPromise = supabase.from('references').select('*').eq('userId', user.id);
        // Fetch analyses
        const analysesPromise = supabase.from('analyses').select('*').eq('userId', user.id);
        // Fetch sources
        const sourcesPromise = supabase.from('sources').select('*').eq('userId', user.id);
        // Fetch notes
        const notesPromise = supabase.from('notes').select('*').eq('userId', user.id);
        // Fetch drafts
        const draftsPromise = supabase.from('drafts').select('*').eq('userId', user.id);

        const [
          { data: referencesData, error: referencesError },
          { data: analysesData, error: analysesError },
          { data: sourcesData, error: sourcesError },
          { data: notesData, error: notesError },
          { data: draftsData, error: draftsError }
        ] = await Promise.all([
          referencesPromise,
          analysesPromise,
          sourcesPromise,
          notesPromise,
          draftsPromise
        ]);

        if (referencesError) throw referencesError;
        setReferences(referencesData || []);

        if (analysesError) throw analysesError;
        setAnalyses(analysesData || []);

        if (sourcesError) throw sourcesError;
        setSources(sourcesData || []);

        if (notesError) {
            console.error('Error fetching notes:', notesError);
            setNotes([]); // Set empty array on error
        } else {
            console.log('Fetched notes:', notesData?.length || 0); // Log successful fetch count
            setNotes(notesData || []);
        }

        if (draftsError) throw draftsError;
        setDrafts(draftsData || []);

      } catch (err) {
        console.error('Error fetching user data:', err);
        // Optionally clear state on error or handle differently
        setReferences([]);
        setAnalyses([]);
        setSources([]);
        setDrafts([]);
        setNotes([]);
      } finally {
        setIsLoading(false);
        console.log("Library data fetch complete.");
      }
    };

    // Fetch data if auth is complete
    if (!authLoading) {
      fetchUserData();
    } else {
       // If auth is still loading, set library loading true
       setIsLoading(true);
    }
    // Dependency array includes pathname to re-evaluate when navigating
  }, [user, supabase, authLoading, pathname]);

  // Note functions
  const addNote = async (note: Omit<Note, 'id' | 'dateCreated' | 'userId'>): Promise<string> => {
    if (!user || !supabase) throw new Error('User not authenticated');
    
    // Create a new note with required fields
    const newNote: Note = {
      ...note,
      id: uuidv4(),
      dateCreated: Date.now(),
      lastModified: Date.now(),
      userId: user.id,
      // Ensure tags is an array
      tags: Array.isArray(note.tags) ? note.tags : [],
    };
    
    console.log('Adding new note:', JSON.stringify(newNote, null, 2));
    
    // Add to Supabase
    const { error } = await supabase
      .from('notes')
      .insert(newNote);
      
    if (error) {
      console.error('Supabase error adding note:', error);
      throw error;
    }
    
    // Update local state
    setNotes(prev => [...prev, newNote]);
    
    return newNote.id;
  };
  
  const updateNote = async (id: string, updates: Partial<Note>): Promise<void> => {
    if (!user || !supabase) throw new Error('User not authenticated');
    
    const updatedNote = {
      ...updates,
      lastModified: Date.now()
    };
    
    // Update in Supabase
    const { error } = await supabase
      .from('notes')
      .update(updatedNote)
      .eq('id', id)
      .eq('userId', user.id);
      
    if (error) throw error;
    
    // Update local state
    setNotes(prev => prev.map(note => 
      note.id === id ? { ...note, ...updatedNote } : note
    ));
  };
  
  const deleteNote = async (id: string): Promise<void> => {
    if (!user || !supabase) throw new Error('User not authenticated');
    
    // Delete from Supabase
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id)
      .eq('userId', user.id);
      
    if (error) throw error;
    
    // Update local state
    setNotes(prev => prev.filter(note => note.id !== id));
  };

  // References functions
  const addReference = async (reference: Omit<SavedReference, 'id' | 'dateAdded' | 'userId'>) => {
    if (!user || !supabase) throw new Error('User not authenticated');
    
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
    if (!user || !supabase) throw new Error('User not authenticated');
    
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

  // Update Reference
  const updateReference = async (id: string, updates: Partial<SavedReference>) => {
    if (!user || !supabase) throw new Error('User not authenticated');
    
    // Update in Supabase
    const { error } = await supabase
      .from('references')
      .update(updates)
      .eq('id', id)
      .eq('userId', user.id);
      
    if (error) throw error;
    
    // Update local state
    setReferences(prev => prev.map(ref => 
      ref.id === id ? { ...ref, ...updates } : ref
    ));
  };

  // Analyses functions
  const addAnalysis = async (analysis: Omit<SavedAnalysis, 'id' | 'dateAdded' | 'userId'>) => {
    if (!user || !supabase) throw new Error('User not authenticated');
    
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
    if (!user || !supabase) throw new Error('User not authenticated');
    
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

  // Update Analysis
  const updateAnalysis = async (id: string, updates: Partial<SavedAnalysis>) => {
    if (!user || !supabase) throw new Error('User not authenticated');
    
    // Update in Supabase
    const { error } = await supabase
      .from('analyses')
      .update(updates)
      .eq('id', id)
      .eq('userId', user.id);
      
    if (error) throw error;
    
    // Update local state
    setAnalyses(prev => prev.map(analysis => 
      analysis.id === id ? { ...analysis, ...updates } : analysis
    ));
  };

  // Sources functions
  const addSource = async (
  source: Omit<SavedSource, 'id' | 'dateAdded' | 'userId'>
): Promise<string> => {
  if (!user || !supabase) throw new Error('User not authenticated');

  // ── ①  Upload thumbnail when it’s a base‑64 data‑URL ─────────
  let finalThumb: string | null = source.thumbnailUrl ?? null;
  if (finalThumb?.startsWith('data:')) {
    finalThumb = await uploadThumbnail(supabase, user.id, finalThumb);
  }

  const newSource: SavedSource = {
    ...source,
    thumbnailUrl: source.thumbnailUrl ?? null,
    id: uuidv4(),
    dateAdded: Date.now(),
    userId: user.id
  };

  const { error } = await supabase.from('sources').insert(newSource);
  if (error) throw error;

  setSources(prev => [...prev, newSource]);
  return newSource.id;
};
  
  const deleteSource = async (id: string) => {
    if (!user || !supabase) throw new Error('User not authenticated');
    
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
  
  // Update Source
  const updateSource = async (
  id: string,
  updates: Partial<SavedSource>
): Promise<void> => {
  if (!user || !supabase) throw new Error('User not authenticated');

  let patch: Partial<SavedSource> = { ...updates, lastAccessed: Date.now() };

  // ── ②  If caller passed a fresh base‑64 thumbnail, store it ──
  if (patch.thumbnailUrl?.startsWith?.('data:')) {
    patch.thumbnailUrl = await uploadThumbnail(
      supabase,
      user.id,
      patch.thumbnailUrl
    );
  }

  const { error } = await supabase
    .from('sources')
    .update(patch)
    .eq('id', id)
    .eq('userId', user.id);

  if (error) throw error;

  setSources(prev =>
    prev.map(src => (src.id === id ? { ...src, ...patch } : src))
  );
};
  
  const sourceExists = (content: string) => {
    // Consider a source as existing if first 100 chars match
    const contentStart = content.substring(0, 100);
    return sources.some(source => source.content.substring(0, 100) === contentStart);
  };

  // Drafts functions
  const addDraft = async (draft: Omit<SavedDraft, 'id' | 'dateAdded' | 'userId'>) => {
    if (!user || !supabase) throw new Error('User not authenticated');
    
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
    if (!user || !supabase) throw new Error('User not authenticated');
    
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
    if (!user || !supabase) throw new Error('User not authenticated');
    
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

  // Export library data
  const exportLibrary = async () => {
    try {
      if (!user) throw new Error('User not authenticated');
      
      const libraryData = {
        references,
        analyses,
        sources,
        drafts,
        notes,
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
      if (!user || !supabase) throw new Error('User not authenticated');
      
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
      const userNotes = parsed.notes ? parsed.notes.map((note: any) => ({ ...note, userId: user.id })) : [];
      
      // Clear existing data for this user
      await supabase.from('references').delete().eq('userId', user.id);
      await supabase.from('analyses').delete().eq('userId', user.id);
      await supabase.from('sources').delete().eq('userId', user.id);
      await supabase.from('drafts').delete().eq('userId', user.id);
      await supabase.from('notes').delete().eq('userId', user.id);
      
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
      
      if (userNotes.length > 0) {
        const { error } = await supabase.from('notes').insert(userNotes);
        if (error) throw error;
      }
      
      // Update local state
      setReferences(userReferences);
      setAnalyses(userAnalyses);
      setSources(userSources);
      setDrafts(userDrafts);
      setNotes(userNotes);
      
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
    updateReference,
    
    // Notes
    notes,
    addNote,
    updateNote,
    deleteNote,
    
    // Analyses
    analyses,
    addAnalysis, 
    deleteAnalysis,
    updateAnalysis,

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
    updateSource,
    
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