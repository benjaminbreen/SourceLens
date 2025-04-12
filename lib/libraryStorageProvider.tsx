// lib/libraryStorageProvider.tsx
// Provides a unified interface for library storage with Supabase when logged in
// and localStorage when logged out

import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '@/lib/auth/authContext';
import { useLibrary } from '@/lib/libraryContext';

// Add this new function right after the imports:
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

interface LibraryStorageContextType {
  // Indicates if storage is persistent (user is logged in)
  isPersistent: boolean;
  
  // Storage methods that work regardless of authentication state
  saveItem: <T>(key: string, item: T) => Promise<string>;
  getItems: <T>(key: string) => Promise<T[]>;
  updateItem: <T>(key: string, id: string, updates: Partial<T>) => Promise<void>;
  deleteItem: (key: string, id: string) => Promise<void>;
  
  // Loading state
  isLoading: boolean;
}

const LibraryStorageContext = createContext<LibraryStorageContextType | undefined>(undefined);

export function LibraryStorageProvider({ children }: { children: ReactNode }) {
   const { user, isLoading: authLoading } = useAuthWithFallback();
  const library = useLibrary();
  
  // Check if we have a persistent storage (user is logged in)
  const isPersistent = !!user;
  
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
        default:
          throw new Error(`Unknown storage key: ${key}`);
      }
    } else {
      // Save to localStorage
      const id = crypto.randomUUID();
      const newItem = { ...item, id, dateAdded: Date.now() };
      
      // Map storage key to localStorage key
      let storageKey;
      switch (key) {
        case 'references':
          storageKey = SAVED_REFERENCES_KEY;
          break;
        case 'analyses':
          storageKey = SAVED_ANALYSES_KEY;
          break;
        case 'sources':
          storageKey = SAVED_SOURCES_KEY;
          break;
        case 'drafts':
          storageKey = SAVED_DRAFTS_KEY;
          break;
        default:
          throw new Error(`Unknown storage key: ${key}`);
      }
      
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
        default:
          throw new Error(`Unknown storage key: ${key}`);
      }
    } else {
      // Get from localStorage
      let storageKey;
      switch (key) {
        case 'references':
          storageKey = SAVED_REFERENCES_KEY;
          break;
        case 'analyses':
          storageKey = SAVED_ANALYSES_KEY;
          break;
        case 'sources':
          storageKey = SAVED_SOURCES_KEY;
          break;
        case 'drafts':
          storageKey = SAVED_DRAFTS_KEY;
          break;
        default:
          throw new Error(`Unknown storage key: ${key}`);
      }
      
      return JSON.parse(localStorage.getItem(storageKey) || '[]') as T[];
    }
  };
  
  // Update an item
  const updateItem = async <T,>(key: string, id: string, updates: Partial<T>): Promise<void> => {
    if (isPersistent) {
      // Update in Supabase via library context
      switch (key) {
        case 'drafts':
          await library.updateDraft(id, updates as any);
          break;
        default:
          throw new Error(`Update not implemented for key: ${key}`);
      }
    } else {
      // Update in localStorage
      let storageKey;
      switch (key) {
        case 'references':
          storageKey = SAVED_REFERENCES_KEY;
          break;
        case 'analyses':
          storageKey = SAVED_ANALYSES_KEY;
          break;
        case 'sources':
          storageKey = SAVED_SOURCES_KEY;
          break;
        case 'drafts':
          storageKey = SAVED_DRAFTS_KEY;
          break;
        default:
          throw new Error(`Unknown storage key: ${key}`);
      }
      
      // Get existing items
      const items = JSON.parse(localStorage.getItem(storageKey) || '[]');
      
      // Find and update the item
      const updatedItems = items.map((item: any) => 
        item.id === id ? { ...item, ...updates, lastEdited: Date.now() } : item
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
        default:
          throw new Error(`Unknown storage key: ${key}`);
      }
    } else {
      // Delete from localStorage
      let storageKey;
      switch (key) {
        case 'references':
          storageKey = SAVED_REFERENCES_KEY;
          break;
        case 'analyses':
          storageKey = SAVED_ANALYSES_KEY;
          break;
        case 'sources':
          storageKey = SAVED_SOURCES_KEY;
          break;
        case 'drafts':
          storageKey = SAVED_DRAFTS_KEY;
          break;
        default:
          throw new Error(`Unknown storage key: ${key}`);
      }
      
      // Get existing items
      const items = JSON.parse(localStorage.getItem(storageKey) || '[]');
      
      // Filter out the item to delete
      const updatedItems = items.filter((item: any) => item.id !== id);
      
      // Save back to localStorage
      localStorage.setItem(storageKey, JSON.stringify(updatedItems));
    }
  };
  
  return (
    <LibraryStorageContext.Provider
      value={{
        isPersistent,
        saveItem,
        getItems,
        updateItem,
        deleteItem,
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