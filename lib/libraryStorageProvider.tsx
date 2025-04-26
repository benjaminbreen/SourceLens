// lib/libraryStorageProvider.tsx
// Enhanced storage provider for managing library storage with Supabase (when logged in)
// and localStorage (when logged out), with improved note content handling and tag support

import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '@/lib/auth/authContext';
import { useLibrary } from '@/lib/libraryContext';

// Create a fallback for when no Auth context is available
const useAuthWithFallback = () => {
  try {
    return useAuth();
  } catch (e) {
    // Return default values if auth context is not available
    return {
      user: null,
      supabase: null,
      isLoading: false
    };
  }
};

// Storage keys for localStorage fallback
export const SAVED_REFERENCES_KEY = 'sourceLens_savedReferences';
export const SAVED_ANALYSES_KEY = 'sourceLens_savedAnalyses';
export const SAVED_SOURCES_KEY = 'sourceLens_savedSources';
export const SAVED_DRAFTS_KEY = 'sourceLens_savedDrafts';
export const SAVED_NOTES_KEY = 'sourceLens_savedNotes';

// Content block types
export type ContentBlockType = 'source' | 'ai' | 'user' | 'default' | 'image';

interface LibraryStorageContextType {
  // Indicates if storage is persistent (user is logged in)
  isPersistent: boolean;
  
  // Storage methods that work regardless of authentication state
  saveItem: <T>(key: string, item: T) => Promise<string>;
  getItems: <T>(key: string) => Promise<T[]>;
  updateItem: <T>(key: string, id: string, updates: Partial<T>) => Promise<void>;
  deleteItem: (key: string, id: string) => Promise<void>;
  
  // Notes-specific operations
  getItemsBySourceId: <T>(key: string, sourceId: string) => Promise<T[]>;
  
  // Tag operations
  getAllTags: () => Promise<{tag: string, count: number, collections: string[]}[]>;
  
  // Content parsing and formatting
  parseNoteContent: (content: string) => { type: string; content: string[] }[];
  formatContentBlock: (text: string, source: string, blockType: ContentBlockType) => string;
  
  // Loading state
  isLoading: boolean;
}

const LibraryStorageContext = createContext<LibraryStorageContextType | undefined>(undefined);

export function LibraryStorageProvider({ children }: { children: ReactNode }) {
  const { user, isLoading: authLoading } = useAuthWithFallback();
  const library = useLibrary();
  
  // Check if we have a persistent storage (user is logged in)
  const isPersistent = !!user;
  
  // Map key to localStorage key
  const getStorageKey = (key: string): string => {
    switch (key) {
      case 'references':
        return SAVED_REFERENCES_KEY;
      case 'analyses':
        return SAVED_ANALYSES_KEY;
      case 'sources':
        return SAVED_SOURCES_KEY;
      case 'drafts':
        return SAVED_DRAFTS_KEY;
      case 'notes':
        return SAVED_NOTES_KEY;
      default:
        throw new Error(`Unknown storage key: ${key}`);
    }
  };
  
  // Save an item (to Supabase if logged in, or localStorage if not)
  const saveItem = async <T,>(key: string, item: T): Promise<string> => {
    if (isPersistent) {
      // Map storage key to library function
      switch (key) {
        case 'references':
          return await library.addReference(item as any);
        case 'analyses':
          return await library.addAnalysis(item as any);
        case 'sources':
          return await library.addSource(item as any);
        case 'drafts':
          return await library.addDraft(item as any);
        case 'notes':
          return await library.addNote(item as any);
        default:
          throw new Error(`Unknown storage key: ${key}`);
      }
    } else {
      // Save to localStorage
      const id = crypto.randomUUID();
      const newItem = { ...item, id, dateAdded: Date.now() };
      
      // Get storage key
      const storageKey = getStorageKey(key);
      
      // Get existing items
      const existingItems = JSON.parse(localStorage.getItem(storageKey) || '[]');
      
      // Add new item
      existingItems.push(newItem);
      
      // Save back to localStorage
      localStorage.setItem(storageKey, JSON.stringify(existingItems));
      
      return id;
    }
  };
  
  // Get all items of a type
  const getItems = async <T,>(key: string): Promise<T[]> => {
    if (isPersistent) {
      // Get from library context (which gets from Supabase)
      switch (key) {
        case 'references':
          return library.references as unknown as T[];
        case 'analyses':
          return library.analyses as unknown as T[];
        case 'sources':
          return library.sources as unknown as T[];
        case 'drafts':
          return library.drafts as unknown as T[];
        case 'notes':
          return library.notes as unknown as T[];
        default:
          throw new Error(`Unknown storage key: ${key}`);
      }
    } else {
      // Get from localStorage
      const storageKey = getStorageKey(key);
      return JSON.parse(localStorage.getItem(storageKey) || '[]') as T[];
    }
  };
  
  // Get items by source ID (primarily for notes)
  const getItemsBySourceId = async <T,>(key: string, sourceId: string): Promise<T[]> => {
    const items = await getItems<any>(key);
    
    // Filter items by sourceId property
    const filtered = items.filter(item => {
      // Exact match by ID
      if (item.sourceId === sourceId) {
        return true;
      }
      
      // Match by metadata if available
      // This helps when sources are created with slightly different IDs
      // but have the same metadata (author/title/date)
      if (item.sourceMetadata && sourceId.includes('-')) {
        const [title, author, date] = sourceId.split('-');
        const metadata = item.sourceMetadata;
        
        if (metadata.title && metadata.title === title && 
            metadata.author && metadata.author === author &&
            metadata.date && metadata.date === date) {
          return true;
        }
      }
      
      return false;
    });
    
    // Return only the first or most recently modified item
    if (filtered.length > 1) {
      // Sort by lastModified in descending order (newest first)
      filtered.sort((a, b) => b.lastModified - a.lastModified);
      console.log(`Found ${filtered.length} notes for source ${sourceId}, using most recent`);
    }
    
    // Return as array with at most 1 item
    return filtered.length > 0 ? [filtered[0]] as unknown as T[] : [] as unknown as T[];
  };
  
  // Update an item
  const updateItem = async <T,>(key: string, id: string, updates: Partial<T>): Promise<void> => {
    if (isPersistent) {
      // Update in Supabase via library context
      switch (key) {
        case 'drafts':
          await library.updateDraft(id, updates as any);
          break;
        case 'notes':
          await library.updateNote(id, updates as any);
          break;
        case 'sources':
          if (library.updateSource) {
            await library.updateSource(id, updates as any);
          } else {
            console.warn('Source updating not implemented in library context');
          }
          break;
        case 'references':
          if (library.updateReference) {
            await library.updateReference(id, updates as any);
          } else {
            console.warn('Reference updating not implemented in library context');
          }
          break;
        case 'analyses':
          if (library.updateAnalysis) {
            await library.updateAnalysis(id, updates as any);
          } else {
            console.warn('Analysis updating not implemented in library context');
          }
          break;
        default:
          throw new Error(`Update not implemented for key: ${key}`);
      }
    } else {
      // Update in localStorage
      const storageKey = getStorageKey(key);
      
      // Get existing items
      const items = JSON.parse(localStorage.getItem(storageKey) || '[]');
      
      // Find and update the item
      const updatedItems = items.map((item: any) => 
        item.id === id ? { ...item, ...updates, lastModified: Date.now() } : item
      );
      
      // Save back to localStorage
      localStorage.setItem(storageKey, JSON.stringify(updatedItems));
    }
  };
  
  // Delete an item
  const deleteItem = async (key: string, id: string): Promise<void> => {
    if (isPersistent) {
      // Delete from Supabase via library context
      switch (key) {
        case 'references':
          await library.deleteReference(id);
          break;
        case 'analyses':
          await library.deleteAnalysis(id);
          break;
        case 'sources':
          await library.deleteSource(id);
          break;
        case 'drafts':
          await library.deleteDraft(id);
          break;
        case 'notes':
          await library.deleteNote(id);
          break;
        default:
          throw new Error(`Unknown storage key: ${key}`);
      }
    } else {
      // Delete from localStorage
      const storageKey = getStorageKey(key);
      
      // Get existing items
      const items = JSON.parse(localStorage.getItem(storageKey) || '[]');
      
      // Filter out the item to delete
      const updatedItems = items.filter((item: any) => item.id !== id);
      
      // Save back to localStorage
      localStorage.setItem(storageKey, JSON.stringify(updatedItems));
    }
  };
  
  // Get all unique tags across all collections
  const getAllTags = async (): Promise<{tag: string, count: number, collections: string[]}[]> => {
    // Initialize tag map
    const tagMap = new Map<string, {count: number, collections: Set<string>}>();
    
    // Collect tags from all collections
    const collectTagsFromItems = async <T extends {tags?: string[]}>(key: string) => {
      const items = await getItems<T>(key);
      
      items.forEach(item => {
        if (item.tags && Array.isArray(item.tags)) {
          item.tags.forEach(tag => {
            if (!tagMap.has(tag)) {
              tagMap.set(tag, { count: 0, collections: new Set() });
            }
            
            const tagData = tagMap.get(tag)!;
            tagData.count++;
            tagData.collections.add(key);
          });
        }
      });
    };
    
    // Process each collection
    await collectTagsFromItems('notes');
    await collectTagsFromItems('sources');
    await collectTagsFromItems('analyses');
    await collectTagsFromItems('drafts');
    
    // Convert Map to array
    return Array.from(tagMap.entries()).map(([tag, data]) => ({
      tag,
      count: data.count,
      collections: Array.from(data.collections)
    }));
  };
  
  // Parse note content to identify and group content blocks
  const parseNoteContent = (content: string) => {
    if (!content) return [];
    
    const lines = content.split('\n');
    let currentBlock: { type: string; content: string[] } | null = null;
    const blocks: { type: string; content: string[] }[] = [];
    
    // Process lines to identify and group content blocks
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
      } else if (line.startsWith('</source-content>') || 
                line.startsWith('</ai-content>') || 
                line.startsWith('</user-note>')) {
        if (currentBlock) {
          blocks.push(currentBlock);
          currentBlock = null;
        }
      } else if (line.match(/^<img-ref\s+id=/)) {
        // Handle image references
        if (currentBlock) {
          blocks.push(currentBlock);
          currentBlock = null;
        }
        
        const idMatch = line.match(/id="([^"]+)"/);
        const id = idMatch ? idMatch[1] : '';
        
        blocks.push({ type: 'image', content: [id] });
      } else {
        // Add line to current block or create a default block
        if (currentBlock) {
          currentBlock.content.push(line);
        } else {
          if (blocks.length === 0 || blocks[blocks.length - 1].type !== 'default') {
            blocks.push({ type: 'default', content: [line] });
          } else {
            blocks[blocks.length - 1].content.push(line);
          }
        }
      }
    });
    
    // Add the last block if it exists
    if (currentBlock) {
      blocks.push(currentBlock);
    }
    
    return blocks;
  };
  
  // Format a content block for insertion into the note
  const formatContentBlock = (text: string, source: string, blockType: ContentBlockType = 'source') => {
    // Format current time
    const now = new Date();
    const timeString = now.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    
    // Format based on block type
    let blockStart = '';
    
    switch (blockType) {
      case 'source':
        blockStart = `<source-content>\nTITLE: ${source}\nDATE: ${timeString}\nQUOTE:`;
        return `\n\n${blockStart}\n${text}\n</source-content>\n`;
      
      case 'ai':
        blockStart = `<ai-content>\nMODEL: ${source}\nDATE: ${timeString}\nCONTENT:`;
        return `\n\n${blockStart}\n${text}\n</ai-content>\n`;
      
      case 'user':
        blockStart = `<user-note>\nDATE: ${timeString}\nNOTE:`;
        return `\n\n${blockStart}\n${text}\n</user-note>\n`;
      
      default:
        return `\n\n${source.toUpperCase()}\n${timeString}\n\n${text}\n`;
    }
  };
  
  // Extract potential tags from text content
  const extractPotentialTags = (content: string): string[] => {
    // Match hashtags pattern
    const hashtagRegex = /#([a-zA-Z0-9_]+)/g;
    const hashMatches = content.match(hashtagRegex) || [];
    
    // Get unique tags without the # symbol
    const uniqueTags = new Set(
      hashMatches.map(tag => tag.substring(1).toLowerCase())
    );
    
    return Array.from(uniqueTags);
  };
  
  return (
    <LibraryStorageContext.Provider
      value={{
        isPersistent,
        saveItem,
        getItems,
        updateItem,
        deleteItem,
        getItemsBySourceId,
        getAllTags,
        parseNoteContent,
        formatContentBlock,
        isLoading: library.isLoading || authLoading
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