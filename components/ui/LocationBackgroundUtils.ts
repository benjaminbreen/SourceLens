// components/ui/LocationBackgroundUtils.ts
// Enhanced utility functions for background image selection
// Prioritizes decade-specific and century-specific location images with proper fallbacks

/**
 * Extracts century from a date string with support for BCE dates
 * @param dateStr Date string in various formats
 * @returns Century number (negative for BCE)
 */

export const extractCentury = (dateStr: string): number => {
  if (!dateStr) return 19; // Default to 19th century if no date
  
  // Check for BCE dates first
  const isBCE = dateStr.toLowerCase().includes('bc') || 
                dateStr.toLowerCase().includes('bce') || 
                dateStr.toLowerCase().includes('b.c') || 
                dateStr.toLowerCase().includes('b.c.e');
  
  // Extract year number
  const yearMatch = dateStr.match(/\b(\d+)\b/);
  if (yearMatch) {
    const year = parseInt(yearMatch[1], 10);
    
    // Handle BCE dates with improved logic
    if (isBCE) {
      console.log(`BCE date detected: ${year} BCE`);
      
      // Ancient period (earlier than 1000 BCE)
      if (year >= 1000) {
        console.log(`Classified as Ancient (-2)`);
        return -2; // Ancient (1000+ BCE)
      } else {
        console.log(`Classified as Antiquity (-1)`);
        return -1; // Antiquity (0-1000 BCE)
      }
    }
    
    // For CE dates, proceed with normal century calculation
    // Specifically look for 3-4 digit years that are likely years
    const ceYearMatch = dateStr.match(/\b(\d{3,4})\b/);
    if (ceYearMatch) {
      const ceYear = parseInt(ceYearMatch[1], 10);
      return Math.ceil(ceYear / 100);
    }
  }
  
  return 19; // Default to 19th century if we can't determine
};

/**
 * Extracts decade from a date string with enhanced pattern matching
 * @param dateStr Date string in various formats
 * @returns First three digits of year or empty string if not found
 */
export const extractDecade = (dateStr: string): string => {
  if (!dateStr) return '';
  
  // Match 4-digit years (e.g., 1947, 2023)
  const yearMatch = dateStr.match(/\b(1\d{3}|20\d{2})\b/);
  if (yearMatch) {
    // Extract first 3 digits (e.g., "194" from "1947")
    return yearMatch[1].substring(0, 3);
  }
  
  // Try to match text month + year format (e.g., "March 1947")
  const monthYearMatch = dateStr.match(/(?:[A-Za-z]+\s+)(1\d{3}|20\d{2})\b/);
  if (monthYearMatch) {
    return monthYearMatch[1].substring(0, 3);
  }
  
  // Try to match date formats like 03-15-1947
  const dateFormatMatch = dateStr.match(/\d{1,2}[-\/\.]\d{1,2}[-\/\.](1\d{3}|20\d{2})\b/);
  if (dateFormatMatch) {
    return dateFormatMatch[1].substring(0, 3);
  }
  
  return '';
};

/**
 * Normalizes location string to a standard format
 * @param locationStr Original location string
 * @returns Normalized location string
 */
export const normalizeLocation = (locationStr: string): string => {
  if (!locationStr) return '';
  
  // Convert to lowercase and remove extra whitespace
  let normalized = locationStr.toLowerCase().trim();
  
  // Map of location variations
  const locationMap: Record<string, string> = {
    // Countries
    'united states': 'us',
    'united states of america': 'us',
    'usa': 'us',
    'us': 'us',
    'america': 'us',
    'new spain': 'mexico',
    
    // United Kingdom
    'united kingdom': 'uk',
    'great britain': 'uk',
    'britain': 'uk',
    'england': 'uk',
    
    // Other countries
    'france': 'france',
    'germany': 'germany',
    'italy': 'italy',
    'spain': 'spain',
    'russia': 'russia',
    'china': 'china',
    'japan': 'japan',
        'austria': 'vienna',
          'austro-hungarian empire': 'vienna',

    
    // US States
    'california': 'california',
    'new york': 'newyork',
    'texas': 'texas',
    'florida': 'florida',
    
    // Cities
    'new york city': 'nyc',
    'los angeles': 'la',
    'chicago': 'chicago',
    'san francisco': 'sf',
    
    // Additional mappings can be added here
  };
  
  // Split by comma and take the last part (typically country or most specific location)
  const parts = normalized.split(',').map(part => part.trim());
  const lastPart = parts[parts.length - 1];
  
  // Check for exact matches first
  if (locationMap[lastPart]) {
    return locationMap[lastPart];
  }
  
  // Check for partial matches
  for (const [key, value] of Object.entries(locationMap)) {
    if (lastPart.includes(key)) {
      return value;
    }
  }
  
  // If no match found, return the last part
  return lastPart.replace(/\s+/g, '');
};

/**
 * Get prioritized list of background image paths
 * @param date Date string
 * @param location Location string
 * @returns Array of image paths to try, from most specific to most generic
 */
export const getPrioritizedImagePaths = (date: string, location: string): string[] => {
  const decade = extractDecade(date);
  const century = extractCentury(date);
  const normalizedLocation = normalizeLocation(location);
  
  const paths: string[] = [];
  
  // 1. Decade-specific paths (most specific)
  if (decade) {
    // Decade + specific location
    paths.push(`/locations/${decade}${normalizedLocation}.jpg`);
    
    // Decade generic
    paths.push(`/locations/${decade}generic.jpg`);
  }
  
  // 2. Century-specific paths
  // Specific location within century
  paths.push(`/locations/${century}${normalizedLocation}.jpg`);
  
  // Century generic
  paths.push(`/locations/${century}generic.jpg`);
  
  // 3. Location-only generic images
  paths.push(`/locations/generic${normalizedLocation}.jpg`);
  
  // 4. Final fallback
  paths.push('/locations/default.jpg');
  
  return paths;
};

/**
 * Check if an image exists by trying to fetch it
 * @param path Image path to check
 * @returns Promise resolving to boolean indicating image existence
 */
export const imageExists = async (path: string): Promise<boolean> => {
  try {
    const response = await fetch(path, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
};

/**
 * Find the first existing background image from a list of paths
 * @param paths Array of image paths to check
 * @returns Promise resolving to the first existing image path, or null if none exist
 */
export async function findFirstExistingImage(paths: string[]): Promise<string | null> {
  for (const path of paths) {
    if (await imageExists(path)) {
      console.log(`[LocationBg] Using background: ${path}`);
      return path;
    } else {
      console.log(`[LocationBg] Background not found: ${path}`);
    }
  }
  return null;
}