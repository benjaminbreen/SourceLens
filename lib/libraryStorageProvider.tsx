// lib/libraryStorageProvider.tsx
// Central storage provider for library items using Supabase
// Handles caching, fetching, saving, updating, and deleting library items
// Provides context for notes, sources, references, analyses, and drafts

'use client';

import React, { createContext, useContext, ReactNode, useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/lib/auth/authContext';
import { usePathname } from 'next/navigation';
import { Note, SavedSource, SavedReference, SavedAnalysis, SavedDraft } from '@/lib/libraryContext';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { uploadThumbnail } from '@/lib/storage/uploadThumbnail';
import { v4 as uuidv4 } from 'uuid';

// Storage keys for localStorage fallback
export const SAVED_REFERENCES_KEY = 'sourceLens_savedReferences';
export const SAVED_ANALYSES_KEY = 'sourceLens_savedAnalyses';
export const SAVED_SOURCES_KEY = 'sourceLens_savedSources';
export const SAVED_DRAFTS_KEY = 'sourceLens_savedDrafts';
export const SAVED_NOTES_KEY = 'sourceLens_savedNotes';

// Cache expiration in milliseconds (15 minutes)
const CACHE_EXPIRATION = 15 * 60 * 1000;

// Content block types for note formatting
export type ContentBlockType = 'source' | 'ai' | 'user' | 'default' | 'image';

// Helper types for partial data
type PartialNote = Omit<Note, 'content'>;
type PartialSource = Omit<SavedSource, 'content'> & { lastModified?: number };


// Cache data structure
interface CacheData<T> {
  data: T[];
  timestamp: number;
  type: 'list' | 'full' | 'filtered';
  sourceId?: string;
}

// Single item cache data
interface SingleCacheData<T> {
  data: T;
  timestamp: number;
  type: 'full';
}

// Tag information type
interface TagInfo {
  tag: string;
  count: number;
  collections: string[];
}

// Context interface
interface LibraryStorageContextType {
  isPersistent: boolean;
  getItems: <T>(key: string, forceRefresh?: boolean) => Promise<Partial<T>[]>;
  getFullItem: <T>(key: string, id: string) => Promise<T | null>;
  saveItem: <T extends { id?: string }>(key: string, item: T) => Promise<string>;
  updateItem: <T>(key: string, id: string, updates: Partial<T>) => Promise<void>;
  deleteItem: (key: string, id: string) => Promise<void>;
  getItemsBySourceId: <T>(key: string, sourceId: string, forceRefresh?: boolean) => Promise<Partial<T>[]>;
  getAllTags: () => Promise<TagInfo[]>;
  parseNoteContent: (content: string) => Array<{ type: string; content: string[] }>;
  formatContentBlock: (text: string, source: string, blockType: ContentBlockType) => string;
  prefetchNotesForView: () => Promise<void>;
  prefetchSourcesForView: () => Promise<void>;
  isLoading: boolean;
  clearCache: (key?: string) => void;
}

const LibraryStorageContext = createContext<LibraryStorageContextType | undefined>(undefined);

// Fallback auth hook when auth context isn't available
const useAuthWithFallback = () => {
  try {
    return useAuth();
  } catch (e) {
    return { user: null, supabase: null, isLoading: false };
  }
};

export function LibraryStorageProvider({ children }: { children: ReactNode }) {
  const { user, supabase, isLoading: authLoading } = useAuthWithFallback();
  const pathname = usePathname();
  const isPersistent = !!user && !!supabase;

  // State for list data with proper typing
  const [sourceList, setSourceList] = useState<PartialSource[]>([]);
  const [noteList, setNoteList] = useState<PartialNote[]>([]);
  const [referenceList, setReferenceList] = useState<SavedReference[]>([]);
  const [analysisList, setAnalysisList] = useState<SavedAnalysis[]>([]);
  const [draftList, setDraftList] = useState<SavedDraft[]>([]);

  // Cache and loading states
  const [cache, setCache] = useState<Record<string, CacheData<any> | SingleCacheData<any>>>({});
  const [isLoadingData, setIsLoadingData] = useState<Record<string, boolean>>({});
  const [isFetchingInitialList, setIsFetchingInitialList] = useState(false);

  // Clear cache for a specific key or all keys
  const clearCache = useCallback((key?: string) => {
    console.log(`Clearing cache ${key ? `for key: ${key}` : '(all)'}`);
    if (key) {
      setCache(prev => {
        const newCache = { ...prev };
        delete newCache[key];
        return newCache;
      });
    } else {
      setCache({});
    }
  }, []);

  // Generate cache keys
  const getCacheKey = (key: string, id?: string | null, type: 'list' | 'full' = 'list'): string => {
    if (type === 'full' && id) return `${key}:full:${id}`;
    if (type === 'list' && id) return `${key}:list:${id}`;
    return `${key}:list`;
  };

  // Check if cache is still valid
  const isCacheValid = (cacheKey: string): boolean => {
    const cacheData = cache[cacheKey];
    if (!cacheData) return false;
    const now = Date.now();
    return now - cacheData.timestamp < CACHE_EXPIRATION;
  };

  // --- Initial data fetching effect ---
  useEffect(() => {
    const fetchInitialListData = async () => {
      if (!isPersistent || authLoading) {
        console.log("Auth loading or not persistent, clearing lists.");
        setSourceList([]);
        setNoteList([]);
        setReferenceList([]);
        setAnalysisList([]);
        setDraftList([]);
        setIsFetchingInitialList(false);
        return;
      }

      const isSplashPage = pathname === '/';
      if (isSplashPage) {
        console.log("On splash page, skipping initial list fetch.");
        setSourceList([]);
        setNoteList([]);
        setReferenceList([]);
        setAnalysisList([]);
        setDraftList([]);
        setIsFetchingInitialList(false);
        return;
      }

      const sourcesCacheKey = getCacheKey('sources', null, 'list');
      const notesCacheKey = getCacheKey('notes', null, 'list');
      const referencesCacheKey = getCacheKey('references', null, 'list');
      const analysesCacheKey = getCacheKey('analyses', null, 'list');
      const draftsCacheKey = getCacheKey('drafts', null, 'list');

      // Check if we have valid cached data
      if (
        isCacheValid(sourcesCacheKey) &&
        isCacheValid(notesCacheKey) &&
        isCacheValid(referencesCacheKey) &&
        isCacheValid(analysesCacheKey) &&
        isCacheValid(draftsCacheKey)
      ) {
        console.log("Initial list data found in valid cache.");
        const sourcesCache = cache[sourcesCacheKey] as CacheData<PartialSource>;
        const notesCache = cache[notesCacheKey] as CacheData<PartialNote>;
        const referencesCache = cache[referencesCacheKey] as CacheData<SavedReference>;
        const analysesCache = cache[analysesCacheKey] as CacheData<SavedAnalysis>;
        const draftsCache = cache[draftsCacheKey] as CacheData<SavedDraft>;
        
        setSourceList(sourcesCache.data);
        setNoteList(notesCache.data);
        setReferenceList(referencesCache.data);
        setAnalysisList(analysesCache.data);
        setDraftList(draftsCache.data);
        setIsFetchingInitialList(false);
        return;
      }

      console.log("Fetching initial LIST data from Supabase...");
      setIsFetchingInitialList(true);

      try {
        const fetchPromises = [
          // Fetch source metadata
          supabase.from('sources').select('id, metadata, dateAdded, type, lastAccessed, tags, category, thumbnailUrl, userId')
            .eq('userId', user.id).order('dateAdded', { ascending: false }),
          // Fetch note metadata (NO content)
          supabase.from('notes').select('id, sourceId, sourceMetadata, dateCreated, lastModified, tags, userId')
            .eq('userId', user.id).order('lastModified', { ascending: false }),
          // Fetch other types
          supabase.from('references').select('*').eq('userId', user.id),
          supabase.from('analyses').select('*').eq('userId', user.id),
          supabase.from('drafts').select('*').eq('userId', user.id),
        ];

        const [
          { data: sourcesData, error: sourcesError },
          { data: notesData, error: notesError },
          { data: referencesData, error: referencesError },
          { data: analysesData, error: analysesError },
          { data: draftsData, error: draftsError }
        ] = await Promise.all(fetchPromises);

        // Handle sources
        if (sourcesError) throw sourcesError;
        const typedSourcesData = (sourcesData || []) as PartialSource[];
        setSourceList(typedSourcesData);
        setCache(prev => ({ 
          ...prev, 
          [sourcesCacheKey]: { 
            data: typedSourcesData, 
            timestamp: Date.now(), 
            type: 'list' 
          } 
        }));

        // Handle notes
        if (notesError) throw notesError;
        // Ensure note data matches expected structure
        const formattedNotes: PartialNote[] = (notesData || []).map(n => ({
          id: n.id,
          sourceId: n.sourceId,
          sourceMetadata: n.sourceMetadata,
          dateCreated: n.dateCreated,
          lastModified: n.lastModified,
          tags: n.tags || [],
          userId: n.userId
        }));
        setNoteList(formattedNotes);
        setCache(prev => ({ 
          ...prev, 
          [notesCacheKey]: { 
            data: formattedNotes, 
            timestamp: Date.now(), 
            type: 'list' 
          } 
        }));
        console.log(`Initial fetch got ${formattedNotes?.length || 0} note metadata entries.`);

        // Handle references
        if (referencesError) throw referencesError;
        const typedReferencesData = (referencesData || []) as SavedReference[];
        setReferenceList(typedReferencesData);
        setCache(prev => ({ 
          ...prev, 
          [referencesCacheKey]: { 
            data: typedReferencesData, 
            timestamp: Date.now(), 
            type: 'list' 
          } 
        }));

        // Handle analyses
        if (analysesError) throw analysesError;
        const typedAnalysesData = (analysesData || []) as SavedAnalysis[];
        setAnalysisList(typedAnalysesData);
        setCache(prev => ({ 
          ...prev, 
          [analysesCacheKey]: { 
            data: typedAnalysesData, 
            timestamp: Date.now(), 
            type: 'list' 
          } 
        }));

        // Handle drafts
        if (draftsError) throw draftsError;
        const typedDraftsData = (draftsData || []) as SavedDraft[];
        setDraftList(typedDraftsData);
        setCache(prev => ({ 
          ...prev, 
          [draftsCacheKey]: { 
            data: typedDraftsData, 
            timestamp: Date.now(), 
            type: 'list' 
          } 
        }));

      } catch (error) {
        console.error("Error fetching initial list data:", error);
        setSourceList([]);
        setNoteList([]);
        setReferenceList([]);
        setAnalysisList([]);
        setDraftList([]);
      } finally {
        setIsFetchingInitialList(false);
        console.log("Initial list data fetch complete.");
      }
    };

    fetchInitialListData();
  }, [user, supabase, authLoading, pathname, isPersistent]);

  // --- getItems: Returns LIST/METADATA by default ---
  const getItems = async <T,>(key: string, forceRefresh = false): Promise<Partial<T>[]> => {
    const cacheKey = getCacheKey(key, null, 'list');
    if (!forceRefresh && isCacheValid(cacheKey)) {
      const typedCache = cache[cacheKey] as CacheData<T>;
      return typedCache.data;
    }
    
    switch (key) {
      case 'sources': return sourceList as unknown as Partial<T>[];
      case 'notes': return noteList as unknown as Partial<T>[];
      case 'references': return referenceList as unknown as Partial<T>[];
      case 'analyses': return analysisList as unknown as Partial<T>[];
      case 'drafts': return draftList as unknown as Partial<T>[];
      default: 
        console.warn(`getItems called for unknown key: ${key}`); 
        return [];
    }
  };

  // --- getFullItem: Fetches a SINGLE item with full content ---
  async function getFullItem<T>(key: string, id: string): Promise<T | null> {
  if (!isPersistent) return null;

  const cacheKey = getCacheKey(key, id, 'full');
  if (isCacheValid(cacheKey)) {
    const singleCache = cache[cacheKey] as SingleCacheData<unknown>;
    const data = singleCache.data as T;

    // Optional runtime check using type coercion
    if ((data as any)?.id === id) {
      console.log(`Returning full item ${id} for key ${key} from cache.`);
      return data;
    }
  }

  if (isLoadingData[cacheKey]) {
    console.log(`Waiting for full item fetch: ${key} ${id}`);
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        if (!isLoadingData[cacheKey]) {
          clearInterval(interval);
          const singleCache = cache[cacheKey] as SingleCacheData<unknown>;
          resolve((singleCache?.data as T) || null);
        }
      }, 100);
    });
  }

  console.log(`Fetching full item ${id} for key ${key} from Supabase...`);
  setIsLoadingData(prev => ({ ...prev, [cacheKey]: true }));

  try {
    const tableName = key;

    // Check if id is a valid UUID and handle accordingly
    const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    let data = null;
    let error = null;

    if (isValidUUID) {
      const response = await supabase.from(tableName).select('*')
        .eq('userId', user.id).eq('id', id).maybeSingle();
      data = response.data;
      error = response.error;
    } else {
      if (key === 'sources') {
        console.log(`ID "${id}" is not a valid UUID. Trying to find source by title...`);

        const allSourcesResponse = await supabase.from('sources').select('*')
          .eq('userId', user.id);

        if (allSourcesResponse.error) {
          error = allSourcesResponse.error;
        } else {
          const allSources = allSourcesResponse.data || [];
          const matchingSource = allSources.find(source => {
            if (id.includes('-')) {
              const titlePart = id.split('-')[0].toLowerCase();
              const sourceTitle = source.metadata?.title?.toLowerCase() || '';
              return sourceTitle.includes(titlePart);
            }
            return false;
          });

          data = matchingSource || null;
        }
      } else if (key === 'notes') {
        const response = await supabase.from(tableName).select('*')
          .eq('userId', user.id).eq('id', id).maybeSingle();
        data = response.data;
        error = response.error;
      }
    }

    if (error) throw error;

    if (data) {
      setCache(prev => ({
        ...prev,
        [cacheKey]: {
          data: data as T,
          timestamp: Date.now(),
          type: 'full'
        }
      }));
    } else {
      console.log(`Full item ${id} for key ${key} not found.`);
      clearCache(cacheKey);
    }

    return data as T | null;
  } catch (error) {
    console.error(`Error fetching full item ${id} for ${key}:`, error);
    return null;
  } finally {
    setIsLoadingData(prev => {
      const ns = { ...prev };
      delete ns[cacheKey];
      return ns;
    });
  }
}


  // --- saveItem: Saves the FULL item ---
  const saveItem = async <T extends { id?: string }>(key: string, item: T): Promise<string> => {
    if (!isPersistent) return Promise.reject("Not persistent storage");

    const tableName = key;
    // Ensure all required base fields are present
    const baseItem = {
      id: item.id || uuidv4(),
      userId: user.id,
      lastModified: Date.now(),
    };

    // Add type-specific required fields and defaults
    let newItemPayload: any = { ...item, ...baseItem }; // Start with incoming item and base fields

    if (key === 'notes') {
      newItemPayload = {
        ...newItemPayload,
        dateCreated: (item as any).dateCreated || Date.now(),
        sourceId: (item as any).sourceId || 'unknown',
        sourceMetadata: (item as any).sourceMetadata || {},
        content: (item as any).content || '',
        tags: Array.isArray((item as any).tags) ? (item as any).tags : [],
      };
      // Remove dateAdded if it accidentally exists from old code
      delete newItemPayload.dateAdded;
    } else if (key === 'sources') {
      newItemPayload = {
        ...newItemPayload,
        dateAdded: (item as any).dateAdded || Date.now(),
        metadata: (item as any).metadata || {},
        content: (item as any).content || '',
        type: (item as any).type || 'text',
        tags: Array.isArray((item as any).tags) ? (item as any).tags : [],
      };
      // Handle thumbnail upload
      if (newItemPayload.thumbnailUrl && newItemPayload.thumbnailUrl.startsWith('data:')) {
        try {
          newItemPayload.thumbnailUrl = await uploadThumbnail(supabase, user.id, newItemPayload.thumbnailUrl);
        } catch (thumbError) {
          console.error("Thumbnail upload failed during save:", thumbError);
          newItemPayload.thumbnailUrl = null;
        }
      }
    } else if (key === 'references') {
      newItemPayload = {
        ...newItemPayload,
        citation: (item as any).citation || '',
        url: (item as any).url || '',
        type: (item as any).type || 'other',
        relevance: (item as any).relevance || '',
        reliability: (item as any).reliability || '',
        sourceQuote: (item as any).sourceQuote || '',
        importance: (item as any).importance || 3,
      };
    } else if (key === 'analyses') {
      newItemPayload = {
        ...newItemPayload,
        title: (item as any).title || 'Untitled Analysis',
        sourceName: (item as any).sourceName || '',
        sourceAuthor: (item as any).sourceAuthor || '',
        sourceDate: (item as any).sourceDate || '',
        content: (item as any).content || '',
        type: (item as any).type || 'basic',
        perspective: (item as any).perspective || '',
        model: (item as any).model || '',
        dateCreated: (item as any).dateCreated || Date.now(),
      };
    } else if (key === 'drafts') {
      newItemPayload = {
        ...newItemPayload,
        title: (item as any).title || 'Untitled Draft',
        content: (item as any).content || '',
        sections: (item as any).sections || [],
        sourceIds: Array.isArray((item as any).sourceIds) ? (item as any).sourceIds : [],
        dateCreated: (item as any).dateCreated || Date.now(),
      };
    }

    console.log(`Saving item to ${tableName}:`, newItemPayload);

    try {
      // Use upsert for simplicity, assuming 'id' is the primary key and conflict target
      const { data, error } = await supabase
        .from(tableName)
        .upsert(newItemPayload, { onConflict: 'id' })
        .select() // Select the upserted data
        .single();

      if (error) throw error;

      console.log(`Item saved successfully to ${tableName}:`, data);

      // --- Update internal list state and list cache ---
      const listCacheKey = getCacheKey(key, null, 'list');
      const partialItem = { ...newItemPayload }; // Start with the saved item
      if (key === 'sources' || key === 'notes') {
        delete (partialItem as any).content; // Remove content for list
      }

      const updateListState = () => {
        if (key === 'sources') {
          setSourceList(prevList => {
            const existingIndex = prevList.findIndex(i => i.id === newItemPayload.id);
            const list = [...prevList];
            if (existingIndex > -1) {
              list[existingIndex] = partialItem as PartialSource;
            } else {
              list.push(partialItem as PartialSource);
            }
            list.sort((a, b) => ((b.lastModified || 0) - (a.lastModified || 0)));
            return list;
          });
        } else if (key === 'notes') {
          setNoteList(prevList => {
            const existingIndex = prevList.findIndex(i => i.id === newItemPayload.id);
            const list = [...prevList];
            if (existingIndex > -1) {
              list[existingIndex] = partialItem as PartialNote;
            } else {
              list.push(partialItem as PartialNote);
            }
            list.sort((a, b) => ((b.lastModified || 0) - (a.lastModified || 0)));
            return list;
          });
        } else if (key === 'references') {
          setReferenceList(prevList => {
            const existingIndex = prevList.findIndex(i => i.id === newItemPayload.id);
            const list = [...prevList];
            if (existingIndex > -1) {
              list[existingIndex] = partialItem as SavedReference;
            } else {
              list.push(partialItem as SavedReference);
            }
            return list;
          });
        } else if (key === 'analyses') {
          setAnalysisList(prevList => {
            const existingIndex = prevList.findIndex(i => i.id === newItemPayload.id);
            const list = [...prevList];
            if (existingIndex > -1) {
              list[existingIndex] = partialItem as SavedAnalysis;
            } else {
              list.push(partialItem as SavedAnalysis);
            }
            return list;
          });
        } else if (key === 'drafts') {
          setDraftList(prevList => {
            const existingIndex = prevList.findIndex(i => i.id === newItemPayload.id);
            const list = [...prevList];
            if (existingIndex > -1) {
              list[existingIndex] = partialItem as SavedDraft;
            } else {
              list.push(partialItem as SavedDraft);
            }
            return list;
          });
        }
      };

      // Update the correct list state
      updateListState();

      // Update the list cache
      setTimeout(() => {
        setCache(prev => {
          let currentList: any[] = [];
          if (key === 'sources') currentList = sourceList;
          else if (key === 'notes') currentList = noteList;
          else if (key === 'references') currentList = referenceList;
          else if (key === 'analyses') currentList = analysisList;
          else if (key === 'drafts') currentList = draftList;
          
          return {
            ...prev,
            [listCacheKey]: { 
              data: currentList, 
              timestamp: Date.now(), 
              type: 'list' 
            }
          };
        });
      }, 0);

      // --- Update/Invalidate full item cache ---
      const fullItemCacheKey = getCacheKey(key, newItemPayload.id, 'full');
      setCache(prev => ({ 
        ...prev, 
        [fullItemCacheKey]: { 
          data: newItemPayload, 
          timestamp: Date.now(), 
          type: 'full' 
        } 
      }));

      // --- Invalidate relevant filtered caches ---
      if (key === 'notes') {
        const noteSourceId = (newItemPayload as unknown as Note).sourceId;
        if (noteSourceId) clearCache(getCacheKey('notes', noteSourceId, 'list'));
      }

      return newItemPayload.id;

    } catch (error) {
      console.error(`Failed save/upsert operation for ${key} with id ${newItemPayload.id}:`, error);
      // Attempt to parse Supabase error details if possible
      if (error && typeof error === 'object' && 'message' in error) {
        console.error("Supabase error message:", (error as any).message);
        if ('details' in error) console.error("Supabase error details:", (error as any).details);
        if ('hint' in error) console.error("Supabase error hint:", (error as any).hint);
      }
      throw error; // Re-throw error for upstream handling
    }
  };

  // --- updateItem: Handles partial updates ---
  const updateItem = async <T,>(key: string, id: string, updates: Partial<T>): Promise<void> => {
    if (!isPersistent) return Promise.reject("Not persistent storage");
    
    const tableName = key;
    const updatePayload = { ...updates, lastModified: Date.now() };

    // Handle source thumbnail update
    if (key === 'sources' && (updates as any).hasOwnProperty('thumbnailUrl')) {
      const thumbUrl = (updates as any).thumbnailUrl;
      if (thumbUrl && thumbUrl.startsWith('data:')) {
        try {
          (updatePayload as any).thumbnailUrl = await uploadThumbnail(supabase, user.id, thumbUrl);
        } catch (thumbError) { 
          console.error("Thumbnail update failed:", thumbError); 
          (updatePayload as any).thumbnailUrl = null;
        }
      }
    }

    console.log(`Updating item ${id} in ${tableName} with:`, updatePayload);
    
    try {
      const { error } = await supabase.from(tableName).update(updatePayload)
        .eq('userId', user.id).eq('id', id);
      
      if (error) throw error;
      
      console.log(`Item ${id} updated successfully in ${tableName}.`);

      // --- Update internal list state and list cache ---
      let itemForListUpdate: Partial<T> | null = null;
      const listCacheKey = getCacheKey(key, null, 'list');
      
      const updateListState = () => {
        if (key === 'sources') {
          setSourceList(prevList => 
            prevList.map(item => {
              if (item.id === id) {
                const updatedItem = { ...item, ...updatePayload } as PartialSource;
                delete (updatedItem as any).content;
                itemForListUpdate = updatedItem as unknown as Partial<T>;
                return updatedItem;
              } 
              return item;
            })
          );
        } else if (key === 'notes') {
          setNoteList(prevList => 
            prevList.map(item => {
              if (item.id === id) {
                const updatedItem = { ...item, ...updatePayload } as PartialNote;
                delete (updatedItem as any).content;
                itemForListUpdate = updatedItem as unknown as Partial<T>;
                return updatedItem;
              } 
              return item;
            })
          );
        } else if (key === 'references') {
          setReferenceList(prevList => 
            prevList.map(item => {
              if (item.id === id) {
                const updatedItem = { ...item, ...updatePayload } as SavedReference;
                itemForListUpdate = updatedItem as unknown as Partial<T>;
                return updatedItem;
              } 
              return item;
            })
          );
        } else if (key === 'analyses') {
          setAnalysisList(prevList => 
            prevList.map(item => {
              if (item.id === id) {
                const updatedItem = { ...item, ...updatePayload } as SavedAnalysis;
                itemForListUpdate = updatedItem as unknown as Partial<T>;
                return updatedItem;
              } 
              return item;
            })
          );
        } else if (key === 'drafts') {
          setDraftList(prevList => 
            prevList.map(item => {
              if (item.id === id) {
                const updatedItem = { ...item, ...updatePayload } as SavedDraft;
                itemForListUpdate = updatedItem as unknown as Partial<T>;
                return updatedItem;
              } 
              return item;
            })
          );
        }
      };

      // Update the correct list state
      updateListState();

      // Update list cache
      setTimeout(() => {
        setCache(prev => {
          let currentList: any[] = [];
          if (key === 'sources') currentList = sourceList;
          else if (key === 'notes') currentList = noteList;
          else if (key === 'references') currentList = referenceList;
          else if (key === 'analyses') currentList = analysisList;
          else if (key === 'drafts') currentList = draftList;
          
          return {
            ...prev,
            [listCacheKey]: { 
              data: currentList, 
              timestamp: Date.now(), 
              type: 'list' 
            }
          };
        });
      }, 0);

      // --- Invalidate/Update full item cache ---
      const fullItemCacheKey = getCacheKey(key, id, 'full');
      setCache(prev => {
        const newCache = { ...prev };
        const singleCache = newCache[fullItemCacheKey] as SingleCacheData<any>;
        if (singleCache) {
          newCache[fullItemCacheKey] = {
            data: { ...singleCache.data, ...updatePayload },
            timestamp: Date.now(),
            type: 'full'
          };
        }
        return newCache;
      });

      // --- Invalidate relevant filtered caches ---
      if (key === 'notes' && itemForListUpdate) {
        const noteSourceId = (itemForListUpdate as unknown as PartialNote).sourceId;
        if (noteSourceId) clearCache(getCacheKey('notes', noteSourceId, 'list'));
      }

    } catch (error) { 
      console.error(`Failed update for ${key} id ${id}:`, error); 
      throw error; 
    }
  };

  // --- deleteItem ---
  const deleteItem = async (key: string, id: string): Promise<void> => {
    if (!isPersistent) return Promise.reject("Not persistent storage");
    
    const tableName = key;
    console.log(`Deleting item ${id} from ${tableName}...`);
    
    try {
      // --- Get item data before deleting (for cache invalidation) ---
      let itemToDelete: any = null;
      const listCacheKey = getCacheKey(key, null, 'list');
      
      // Find from current state lists
      if (key === 'sources') {
        itemToDelete = sourceList.find(item => item.id === id);
      } else if (key === 'notes') {
        itemToDelete = noteList.find(item => item.id === id);
      } else if (key === 'references') {
        itemToDelete = referenceList.find(item => item.id === id);
      } else if (key === 'analyses') {
        itemToDelete = analysisList.find(item => item.id === id);
      } else if (key === 'drafts') {
        itemToDelete = draftList.find(item => item.id === id);
      }
      
      const noteSourceId = (key === 'notes' && itemToDelete) ? itemToDelete.sourceId : null;

      // --- Perform Deletion ---
      const { error } = await supabase.from(tableName).delete().eq('userId', user.id).eq('id', id);
      if (error) throw error;
      console.log(`Item ${id} deleted successfully from ${tableName}.`);

      // --- Update internal list state and list cache ---
      const updateListState = () => {
        if (key === 'sources') {
          setSourceList(prevList => prevList.filter(item => item.id !== id));
        } else if (key === 'notes') {
          setNoteList(prevList => prevList.filter(item => item.id !== id));
        } else if (key === 'references') {
          setReferenceList(prevList => prevList.filter(item => item.id !== id));
        } else if (key === 'analyses') {
          setAnalysisList(prevList => prevList.filter(item => item.id !== id));
        } else if (key === 'drafts') {
          setDraftList(prevList => prevList.filter(item => item.id !== id));
        }
      };

      // Update the state
      updateListState();

      // Update list cache
      setTimeout(() => {
        setCache(prev => {
          let currentList: any[] = [];
          if (key === 'sources') currentList = sourceList;
          else if (key === 'notes') currentList = noteList;
          else if (key === 'references') currentList = referenceList;
          else if (key === 'analyses') currentList = analysisList;
          else if (key === 'drafts') currentList = draftList;
          
          return {
            ...prev,
            [listCacheKey]: { 
              data: currentList.filter(item => item.id !== id), 
              timestamp: Date.now(), 
              type: 'list' 
            }
          };
        });
      }, 0);

      // --- Invalidate full item cache ---
      clearCache(getCacheKey(key, id, 'full'));
      
      // --- Invalidate relevant filtered caches ---
      if (key === 'notes' && noteSourceId) {
        clearCache(getCacheKey('notes', noteSourceId, 'list'));
      }

    } catch (error) { 
      console.error(`Failed delete for ${key} id ${id}:`, error); 
      throw error; 
    }
  };

  // --- getItemsBySourceId: Returns LIST/METADATA for a specific source ---
  const getItemsBySourceId = async <T,>(key: string, sourceId: string, forceRefresh = false): Promise<Partial<T>[]> => {
    if (key !== 'notes') {
      console.warn(`getItemsBySourceId only supports 'notes' currently, got: ${key}`);
      return [];
    }
    
    const cacheKey = getCacheKey(key, sourceId, 'list');
    if (!forceRefresh && isCacheValid(cacheKey)) {
      const typedCache = cache[cacheKey] as CacheData<T>;
      return typedCache.data;
    }
    
    if (isLoadingData[cacheKey]) {
      return new Promise((resolve) => {
        const interval = setInterval(() => {
          if (!isLoadingData[cacheKey]) {
            clearInterval(interval);
            const typedCache = cache[cacheKey] as CacheData<T>;
            resolve(typedCache?.data || []);
          }
        }, 100);
      });
    }
    
    console.log(`Fetching notes list for source ${sourceId} from Supabase...`);
    setIsLoadingData(prev => ({ ...prev, [cacheKey]: true }));
    
    try {
      let filteredNotes: PartialNote[] = [];
      
      if (isPersistent) {
        const { data, error } = await supabase.from('notes')
          .select('id, sourceId, sourceMetadata, dateCreated, lastModified, tags, userId')
          .eq('userId', user.id).eq('sourceId', sourceId);
        
        if (error) throw error;
        
        // Ensure data matches PartialNote structure
        filteredNotes = (data || []).map(n => ({
          id: n.id, 
          sourceId: n.sourceId, 
          sourceMetadata: n.sourceMetadata,
          dateCreated: n.dateCreated, 
          lastModified: n.lastModified, 
          tags: n.tags || [], 
          userId: n.userId
        }));
      }
      
      setCache(prev => ({ 
        ...prev, 
        [cacheKey]: { 
          data: filteredNotes, 
          timestamp: Date.now(), 
          type: 'list', 
          sourceId 
        } 
      }));
      
      return filteredNotes as unknown as Partial<T>[];
    } catch (error) { 
      console.error(`Error fetching notes for source ${sourceId}:`, error); 
      return []; 
    } finally { 
      setIsLoadingData(prev => { 
        const ns = { ...prev }; 
        delete ns[cacheKey]; 
        return ns; 
      }); 
    }
  };

  // --- getAllTags: Uses the list data ---
  const getAllTags = async (): Promise<TagInfo[]> => {
    const cacheKey = 'allTags';
    if (isCacheValid(cacheKey)) {
      const tagCache = cache[cacheKey] as CacheData<TagInfo>;
      return tagCache.data;
    }
    
    setIsLoadingData(prev => ({ ...prev, [cacheKey]: true }));
    console.log("Calculating all tags from list data...");
    
    try {
      // Combine all *list* states
      const allItems = [
        ...noteList.map(item => ({ ...item, type: 'notes' })),
        ...sourceList.map(item => ({ ...item, type: 'sources' })),
        ...analysisList.map(item => ({ ...item, type: 'analyses' })),
        ...draftList.map(item => ({ ...item, type: 'drafts' })),
        ...referenceList.map(item => ({ ...item, type: 'references' }))
      ];
      
      const tagMap = new Map<string, {count: number, collections: Set<string>}>();
      
      allItems.forEach((item: any) => {
        if (item.tags && Array.isArray(item.tags)) {
          item.tags.forEach((tag: string) => {
            if (!tagMap.has(tag)) {
              tagMap.set(tag, { count: 0, collections: new Set() });
            }
            const tagData = tagMap.get(tag)!;
            tagData.count++;
            tagData.collections.add(item.type);
          });
        }
      });
      
      const tagsArray: TagInfo[] = Array.from(tagMap.entries()).map(([tag, data]) => ({
        tag,
        count: data.count,
        collections: Array.from(data.collections)
      }));
      
      console.log("Tag calculation complete:", tagsArray.length);
      
      setCache(prev => ({ 
        ...prev, 
        [cacheKey]: { 
          data: tagsArray, 
          timestamp: Date.now(), 
          type: 'list' 
        } 
      }));
      
      return tagsArray;
    } finally { 
      setIsLoadingData(prev => { 
        const ns = { ...prev }; 
        delete ns[cacheKey]; 
        return ns; 
      }); 
    }
  };

  // --- Prefetching: Fetches LIST data ---
  const prefetchNotesForView = async (): Promise<void> => { 
    await getItems<PartialNote>('notes', true); 
  };
  
  const prefetchSourcesForView = async (): Promise<void> => { 
    await getItems<PartialSource>('sources', true); 
  };

  // --- parseNoteContent: Parse formatted note content into blocks ---
  const parseNoteContent = (content: string): Array<{ type: string; content: string[] }> => {
    if (!content) return [];
    
    const lines = content.split('\n');
    let currentBlock: { type: string; content: string[] } | null = null;
    const blocks: Array<{ type: string; content: string[] }> = [];
    
    lines.forEach((line) => {
      if (line.startsWith('<source-content>')) {
        if (currentBlock) blocks.push(currentBlock);
        currentBlock = { type: 'source', content: [] };
      } else if (line.startsWith('<ai-content>')) {
        if (currentBlock) blocks.push(currentBlock);
        currentBlock = { type: 'ai', content: [] };
      } else if (line.startsWith('<user-note>')) {
        if (currentBlock) blocks.push(currentBlock);
        currentBlock = { type: 'user', content: [] };
      } else if (line.startsWith('</source-content>') || line.startsWith('</ai-content>') || line.startsWith('</user-note>')) {
        // End of current block
        if (currentBlock) {
          blocks.push(currentBlock);
          currentBlock = null;
        }
      } else if (currentBlock) {
        currentBlock.content.push(line);
      } else if (line.trim()) {
        // If we have text outside a block, start a default block
        currentBlock = { type: 'default', content: [line] };
      }
    });
    
    if (currentBlock) blocks.push(currentBlock);
    return blocks;
  };

  // --- formatContentBlock: Format content for note blocks ---
  const formatContentBlock = (text: string, source: string, blockType: ContentBlockType = 'source'): string => {
    const now = new Date();
    const timeString = now.toLocaleString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    });
    
    switch (blockType) {
      case 'source':
        return `\n\n<source-content>\nTITLE: ${source}\nDATE: ${timeString}\nQUOTE:\n${text}\n</source-content>\n`;
      case 'ai':
        return `\n\n<ai-content>\nMODEL: ${source}\nDATE: ${timeString}\nCONTENT:\n${text}\n</ai-content>\n`;
      case 'user':
        return `\n\n<user-note>\nDATE: ${timeString}\nNOTE:\n${text}\n</user-note>\n`;
      case 'image':
        return `\n\n<image-content>\nTITLE: ${source}\nDATE: ${timeString}\nDESCRIPTION:\n${text}\n</image-content>\n`;
      default:
        return `\n\n${source.toUpperCase()}\n${timeString}\n\n${text}\n`;
    }
  };

  // Reset cache when user changes
  useEffect(() => { 
    clearCache(); 
  }, [user?.id, clearCache]);

  // Calculate overall loading state
  const overallIsLoading = authLoading || isFetchingInitialList || Object.keys(isLoadingData).length > 0;

  return (
    <LibraryStorageContext.Provider
      value={{
        isPersistent,
        saveItem,
        getItems,
        getFullItem,
        updateItem,
        deleteItem,
        getItemsBySourceId,
        getAllTags,
        parseNoteContent,
        formatContentBlock,
        prefetchNotesForView,
        prefetchSourcesForView,
        clearCache,
        isLoading: overallIsLoading,
      }}
    >
      {children}
    </LibraryStorageContext.Provider>
  );
}

export function useLibraryStorage() {
  const context = useContext(LibraryStorageContext);
  if (context === undefined) {
    throw new Error('useLibraryStorage must be used within a LibraryStorageProvider');
  }
  return context;
}
