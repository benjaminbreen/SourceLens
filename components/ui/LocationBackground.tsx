// components/ui/LocationBackground.tsx
// Enhanced version that uses the improved LocationBackgroundUtils
// Follows decade-first approach with better handling of cities and regions

'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { getPrioritizedImagePaths, extractCentury } from './LocationBackgroundUtils';

interface LocationBackgroundProps {
  date?: string;
  location?: string;
  opacity?: number;
  className?: string;
  children?: React.ReactNode;
  backgroundStyle?: 'light' | 'dark' | 'paper' | 'parchment'; 
}

export default function LocationBackground({
  date = '',
  location = '',
  opacity = 0.15,
  className = '',
  children,
  backgroundStyle = 'light'
}: LocationBackgroundProps) {
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  // Find the best matching background image
  useEffect(() => {
    if (!date && !location) {
      setBackgroundImage(null);
      return;
    }
    
    // Simple debug log function
    const debugLog = (message: string, data?: any) => {
      console.log(`[LocationBg] ${message}`, data || '');
    };
    
    // Check if an image exists at the given path
    const checkImageExists = async (path: string): Promise<boolean> => {
      try {
        const response = await fetch(path, { method: 'HEAD' });
        const exists = response.ok;
        debugLog(`Trying: ${path} - ${exists ? 'SUCCESS' : 'not found'}`);
        return exists;
      } catch (error) {
        debugLog(`Error checking image ${path}:`, error);
        return false;
      }
    };
    
    // Find the best image using prioritized paths
  const findBestImage = async () => {
  setImageError(false);
  
  debugLog('Finding background for:', { date, location });
  
  // Special handling for ancient and antiquity periods
  if (date) {
    const century = extractCentury(date);
    
    // Handle ancient period (before 1000 BCE)
    if (century === -2) {
      const ancientPath = '/locations/ancientgeneric.jpg';
      if (await checkImageExists(ancientPath)) {
        debugLog(`Using ancient period background: ${ancientPath}`);
        setBackgroundImage(ancientPath);
        return;
      }
    }
    
    // Handle antiquity period (0-1000 BCE)
    if (century === -1) {
      const antiquityPath = '/locations/antiquitygeneric.jpg';
      if (await checkImageExists(antiquityPath)) {
        debugLog(`Using antiquity period background: ${antiquityPath}`);
        setBackgroundImage(antiquityPath);
        return;
      }
    }
  }
  
  // Standard handling for CE dates
  const imagePaths = getPrioritizedImagePaths(date, location);
  debugLog('Image search order:', imagePaths);
  
  // Try each path in priority order
  for (const path of imagePaths) {
    if (await checkImageExists(path)) {
      debugLog(`SUCCESS! Using ${path}`);
      setBackgroundImage(path);
      return;
    }
  }
  
  // No image found
  debugLog('No suitable background image found');
  setBackgroundImage(null);
  setImageError(true);
};
    
    findBestImage();
  }, [date, location]);

  // Get texture background based on style
  const getTextureBg = () => {
    switch (backgroundStyle) {
      case 'paper':
        return 'bg-[url(/textures/paper.jpg)] bg-repeat';
      case 'parchment':
        return 'bg-[url(/textures/parchment.jpg)] bg-repeat';
      case 'dark':
        return 'bg-slate-800';
      default:
        return 'bg-slate-50';
    }
  };

  if (!backgroundImage || imageError) {
    // Return container with subtle texture background
    return (
      <div className={`relative ${getTextureBg()} ${className}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-slate-200/40 to-white/10 mix-blend-overlay"></div>
        <div className="relative z-10">{children}</div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Image Background with enhanced overlay effects */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('${backgroundImage}')`,
            opacity: opacity * 1.2, // Slightly increase opacity
          }}
        />
        
        {/* Multi-layer overlay for better depth and readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/95 via-slate-100/55 to-white/20"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-white/75 via-transparent to-amber-100/30"></div>
        
        {/* Subtle vignette effect */}
        <div className="absolute inset-0 shadow-[inset_0_0_50px_rgba(0,0,0,0.1)]"></div>
        
        {/* Texture overlay for depth */}
        <div className="absolute inset-0 bg-[url(/textures/noise.png)] opacity-50 mix-blend-overlay"></div>
      </div>
      
      {/* Subtle inner border to enhance depth */}
      <div className="absolute inset-[3px] ring-1 ring-inset ring-black/5 rounded-[inherit] pointer-events-none"></div>
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}