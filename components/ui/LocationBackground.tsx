// components/ui/LocationBackground.tsx
// Component for dynamically selecting and displaying historical location backgrounds
// based on century and location for use in the roleplay feature

'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface LocationBackgroundProps {
  date?: string;
  location?: string;
  opacity?: number;
  className?: string;
  children?: React.ReactNode;
}

export default function LocationBackground({
  date = '',
  location = '',
  opacity = 0.15,
  className = '',
  children
}: LocationBackgroundProps) {
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  // Extract century from date

// Update the extractCentury function to handle BCE dates
const extractCentury = (dateStr: string): number => {
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

// Update the normalizeLocation function to focus on the last word (country)
const normalizeLocation = (locationStr: string): string => {
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

  // Find the best matching background image
  useEffect(() => {
    if (!date && !location) {
      setBackgroundImage(null);
      return;
    }
    
    const century = extractCentury(date);
    const normalizedLocation = normalizeLocation(location);
    
    console.log(`Looking for location background: century=${century}, location=${normalizedLocation}`);
    
    // Try specific century + location
    const specificImage = `/locations/${century}${normalizedLocation}.jpg`;
    
    // Fallbacks in order of preference
    const centuryGenericImage = `/locations/${century}generic.jpg`;
    const locationGenericImage = `/locations/generic${normalizedLocation}.jpg`;
    const defaultImage = '/locations/default.jpg';
    
    // Test if an image exists at the specific path
    const checkImageExists = async (path: string): Promise<boolean> => {
      try {
        const response = await fetch(path, { method: 'HEAD' });
        return response.ok;
      } catch (error) {
        return false;
      }
    };
    
    const findBestImage = async () => {
      setImageError(false);
      
      // Try specific century+location combination
      if (await checkImageExists(specificImage)) {
        setBackgroundImage(specificImage);
        return;
      }
      
      // Try century-only image
      if (await checkImageExists(centuryGenericImage)) {
        setBackgroundImage(centuryGenericImage);
        return;
      }
      
      // Try location-only image
      if (normalizedLocation && await checkImageExists(locationGenericImage)) {
        setBackgroundImage(locationGenericImage);
        return;
      }
      
      // Fallback to default
      if (await checkImageExists(defaultImage)) {
        setBackgroundImage(defaultImage);
        return;
      }
      
      // No image found
      setBackgroundImage(null);
      setImageError(true);
    };
    
    findBestImage();
  }, [date, location]);

  if (!backgroundImage || imageError) {
    // Return container with children but no background
    return (
      <div className={`relative ${className}`}>
        {children}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Background image with fade effect */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('${backgroundImage}')`,
            opacity: opacity,
          }}
        />
        
        {/* Gradient overlay fade effect */}
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/90 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-white/90 to-transparent" />
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}