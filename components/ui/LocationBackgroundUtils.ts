// components/ui/LocationBackgroundUtils.ts
// Utility functions extracted from LocationBackground component
// Provides century calculation and location normalization for use across components

// Extract century from date
export const extractCentury = (dateStr: string): number => {
  // Check for BCE dates first
  const isBCE = dateStr.toLowerCase().includes('bc') || 
                dateStr.toLowerCase().includes('bce') || 
                dateStr.toLowerCase().includes('b.c') || 
                dateStr.toLowerCase().includes('b.c.e');
  
  // Extract year number
  const yearMatch = dateStr.match(/\b(\d+)\b/);
  if (yearMatch) {
    const year = parseInt(yearMatch[1], 10);
    
    // Handle BCE dates
    if (isBCE) {
      if (year >= 1000) {
        return -2; // Ancient (1000+ BCE) - will use ancientgeneric.jpg
      } else {
        return -1; // Antiquity (0-1000 BCE) - will use antiquitygeneric.jpg
      }
    }
    
    // For CE dates, proceed with normal century calculation
    // Specifically look for 3-4 digit numbers that are likely years
    const ceYearMatch = dateStr.match(/\b(\d{3,4})\b/);
    if (ceYearMatch) {
      const ceYear = parseInt(ceYearMatch[1], 10);
      return Math.ceil(ceYear / 100);
    }
  }
  
  return 19; // Default to 19th century if we can't determine
};

// Normalize location to standard code
export const normalizeLocation = (locationStr: string): string => {
  if (!locationStr) return '';
  
  // Map of common location names to standardized codes
  const locationMap: Record<string, string> = {
    'united states': 'us',
    'usa': 'us',
    'america': 'us',
    'pennsylvania': 'us',
    'france': 'france',
    'paris': 'france',
    'england': 'uk',
    'britain': 'uk',
    'united kingdom': 'uk',
    'great britain': 'uk',
    'london': 'uk',
    'italy': 'italy',
    'rome': 'italy',
    'germany': 'germany',
    'berlin': 'germany',
    'spain': 'spain',
    'madrid': 'spain',
    'russia': 'russia',
    'mexico': 'mexico',
    'china': 'china',
    'japan': 'japan',
    'india': 'india',
    'egypt': 'egypt',
    'greece': 'greece',
    'athens': 'greece',
    'bali': 'bali',
    'indonesia': 'indonesia',
    'vienna': 'austria',
    'austria': 'austria'
  };
  
  // Split by commas first to get the country part (typically after the last comma)
  const parts = locationStr.toLowerCase().split(',');
  const lastPart = parts[parts.length - 1].trim();
  
  // Extract the last word from the last part (likely to be the country)
  const locationWords = lastPart.split(/\s+/);
  const lastWord = locationWords[locationWords.length - 1];
  
  // Check if the last word is in our location map
  if (locationMap[lastWord]) {
    return locationMap[lastWord];
  }
  
  // Check if the entire last part matches any locations in our map
  if (locationMap[lastPart]) {
    return locationMap[lastPart];
  }
  
  // Check for multi-word matches in the last part
  for (const key of Object.keys(locationMap)) {
    if (lastPart.includes(key)) {
      return locationMap[key];
    }
  }
  
  // If all else fails, return the last word as fallback
  return lastWord || '';
};