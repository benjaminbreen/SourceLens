// lib/hooks/useSourcePossibilities.ts
import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { SourcePossibilities, emptySourcePossibilities } from '@/lib/types/sourcePossibilities';

export function useSourcePossibilities() {
  const { sourceContent } = useAppStore(); // Only depend on sourceContent, not metadata
  const [possibilities, setPossibilities] = useState<SourcePossibilities>(emptySourcePossibilities);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch possibilities when source content changes
  useEffect(() => {
    // Only fetch if we have sufficient content
    if (!sourceContent || sourceContent.length < 100) {
      console.log("Not fetching source possibilities - insufficient content", {
        contentLength: sourceContent?.length || 0
      });
      return;
    }
    
    // Create a hash based on the first 100 characters to use as a cache key
    const sourceHash = sourceContent.substring(0, 100).replace(/\s+/g, '').substring(0, 50);
    const storageKey = `source-possibilities-${sourceHash}`;
    const alreadyFetched = sessionStorage.getItem(storageKey);
    
    if (alreadyFetched) {
      try {
        const cached = JSON.parse(alreadyFetched);
        console.log("Using cached source possibilities");
        setPossibilities(cached);
        return;
      } catch (e) {
        // If parsing fails, continue with the fetch
        console.warn('Failed to parse cached possibilities, fetching fresh data');
      }
    }
    
    // Perform the fetch
    const fetchPossibilities = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        console.log("Fetching source possibilities for text length:", sourceContent.length);
        
        // Get a snippet of the source text (first 2000 chars) for context
        const sourceSnippet = sourceContent.substring(0, 2000);
        
        const response = await fetch('/api/source-possibilities', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sourceSnippet
          }),
        });
        
        if (!response.ok) {
          throw new Error(`API returned status ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Received API response for source possibilities");
        
        if (!data.possibilities) {
          throw new Error('Invalid API response format: missing possibilities');
        }
        
        // Update state with the possibilities
        setPossibilities(data.possibilities);
        
        // Cache the result for this session
        sessionStorage.setItem(storageKey, JSON.stringify(data.possibilities));
        
      } catch (err) {
        console.error('Error fetching source possibilities:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        // Don't update UI on error
      } finally {
        setIsLoading(false);
      }
    };
    
    // Execute the fetch in the background
    fetchPossibilities();
    
  }, [sourceContent]); // Only depend on sourceContent
  
  return { possibilities, isLoading, error };
}