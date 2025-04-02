// components/ui/LocationBackground.tsx
// Component for dynamically selecting and displaying historical location backgrounds
// based on century and location for use in the roleplay feature

'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { extractCentury, normalizeLocation } from './LocationBackgroundUtils';

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
        <div className="absolute inset-0 bg-gradient-to-t from-amber to-white to-transparent" />

      </div>
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

// Export utility functions
export { extractCentury, normalizeLocation };