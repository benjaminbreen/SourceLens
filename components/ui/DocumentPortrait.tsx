// components/ui/DocumentPortrait.tsx
// Elegant document portrait with subtle location background integration
// Provides visual representation of source metadata with centered layout and refined aesthetics

'use client';

import React, { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { useAppStore } from '@/lib/store';
import LocationBackground from './LocationBackground';
import DocumentPortraitModal from './DocumentPortraitModal';
import { motion } from 'framer-motion';
import { Space_Grotesk } from 'next/font/google';
import { extractCentury, getPrioritizedImagePaths } from './LocationBackgroundUtils';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600'],
  variable: '--font-space-grotesk',
});

interface DocumentPortraitProps {
  sourceFile?: File | null;
  sourceType?: 'text' | 'pdf' | 'image' | 'audio' | null;  
  metadata?: any;
  roleplayMode?: boolean;
  portraitError?: boolean;
  setPortraitError?: (error: boolean) => void;
  darkMode?: boolean;
}

export default function DocumentPortrait({
  sourceFile,
  sourceType,
  metadata,
  roleplayMode,
  portraitError = false,
  setPortraitError = () => {},
  darkMode = false
}: DocumentPortraitProps) {
  // Get state from store if not provided via props
  const store = useAppStore();
  const actualSourceFile = sourceFile || store.sourceFile;
  const actualSourceType = sourceType || store.sourceType;
  const actualMetadata = metadata || store.metadata || {};
  const actualRoleplayMode = roleplayMode !== undefined ? roleplayMode : store.roleplayMode;
  const thumbnailUrl = store.sourceThumbnailUrl;
  const isDarkMode = darkMode || store.isDarkMode;

  // State for modals and image handling
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [headerBackgroundImage, setHeaderBackgroundImage] = useState<string | null>(null);
  
  // Add helper function to check if image exists
  const checkImageExists = async (path: string): Promise<boolean> => {
    try {
      const response = await fetch(path, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      console.error(`Error checking image path ${path}:`, error);
      return false;
    }
  };

  // Load background image based on document metadata - using the same logic as modal
  // Load background image based on document metadata
useEffect(() => {
  if (!actualMetadata) return;
  
  const date = actualMetadata.date || '';
  const location = actualMetadata.placeOfPublication || '';
  
  if (!date && !location) {
    setHeaderBackgroundImage(null);
    return;
  }
  
  const findBestImage = async () => {
    // Get a normalized location
    const normalizeLocation = (loc: string): string => {
      if (!loc) return '';
      
      // Convert to lowercase and remove spaces
      const normalized = loc.toLowerCase().trim().replace(/\s+/g, '');
      
      // Extract country/region from location (often after comma)
      const parts = normalized.split(',').map(part => part.trim());
      const lastPart = parts[parts.length - 1] || normalized;
      
      // Common location mappings
      const locationMap: Record<string, string> = {
        'unitedstates': 'us',
        'unitedstatesofamerica': 'us',
        'usa': 'us',
        'america': 'us',
        'unitedkingdom': 'uk',
        'greatbritain': 'uk',
        'england': 'uk',
        'britain': 'uk',
        'london': 'london',
        'paris': 'paris',
        'newyork': 'newyork',
        'newyorkcity': 'newyork',
        'nyc': 'newyork',
        'california': 'california',
        'vienna': 'vienna',
        'china': 'china',
        'japan': 'japan',
        'russia': 'russia',
        'indonesia': 'indonesia',
        'florida': 'florida',
        'washington': 'washington',
        'dc': 'dc',
        'bali': 'bali',
        'portugal': 'portugal',
      };
      
      // Check for matches
      for (const [key, value] of Object.entries(locationMap)) {
        if (normalized.includes(key)) {
          return value;
        }
      }
      
      // Return the last part if no match found
      return lastPart;
    };
    
    // Extract decade digits (first 3 digits of year)
    const extractDecade = (dateStr: string): string => {
      if (!dateStr) return '';
      
      // Try to match 4-digit years
      const yearMatch = dateStr.match(/\b(\d{3,4})\b/);
      if (yearMatch) {
        const year = yearMatch[1];
        // Return first 3 digits for decade
        if (year.length >= 3) {
          return year.substring(0, 3);
        }
      }
      
      return '';
    };
    
    // Get century number
    const getCentury = (dateStr: string): number => {
      // Using the extractCentury function from LocationBackgroundUtils
      const century = extractCentury(dateStr);
      return century;
    };
    
    const normalizedLocation = normalizeLocation(location);
    const decade = extractDecade(date);
    const century = getCentury(date);
    
    console.log(`Looking for images with: decade=${decade}, century=${century}, location=${normalizedLocation}`);
    
    // Build prioritized list of paths to try
    const paths: string[] = [];
    
    // 1. Most specific: exact decade + specific location
    if (decade && normalizedLocation) {
      paths.push(`/locations/${decade}${normalizedLocation}.jpg`);
    }
    
    // 2. Decade + parent region
    if (decade) {
      // Try to get parent region
      const regionMap: Record<string, string> = {
        // Cities to countries/regions
        'london': 'uk',
        'newyork': 'us',
        'california': 'us',
        'florida': 'us',
        'dc': 'us',
        'washington': 'us',
        'bali': 'indonesia',
        'paris': 'france',
        'vienna': 'austria',
      };
      
      const parentRegion = regionMap[normalizedLocation];
      if (parentRegion) {
        paths.push(`/locations/${decade}${parentRegion}.jpg`);
      }
      
      // 3. Decade generic
      paths.push(`/locations/${decade}generic.jpg`);
    }
    
    // 4. Century + location
    if (normalizedLocation) {
      paths.push(`/locations/${century}${normalizedLocation}.jpg`);
    }
    
    // 5. Century + parent region
    const regionMap: Record<string, string> = {
      // Cities to countries/regions
      'london': 'uk',
      'newyork': 'us',
      'california': 'us',
      'florida': 'us',
      'dc': 'us',
      'washington': 'us',
      'bali': 'indonesia',
      'paris': 'france',
      'vienna': 'austria',
    };
    
    const parentRegion = regionMap[normalizedLocation];
    if (parentRegion) {
      paths.push(`/locations/${century}${parentRegion}.jpg`);
    }
    
    // 6. Century generic
    paths.push(`/locations/${century}generic.jpg`);
    
    // 7. Global fallbacks
    if (century < 0) {
      // Ancient periods
      paths.push('/locations/ancientgeneric.jpg');
      paths.push('/locations/antiquitygeneric.jpg');
    } else if (century < 10) {
      // Early centuries
      paths.push('/locations/antiquitygeneric.jpg');
    }
    
    // 8. Final fallback
    paths.push('/locations/default.jpg');
    
    console.log('Trying image paths in order:', paths);
    
    // Try each path until we find one that exists
    for (const path of paths) {
      try {
        const exists = await checkImageExists(path);
        if (exists) {
          console.log(`Found existing image: ${path}`);
          setHeaderBackgroundImage(path);
          return;
        }
      } catch (error) {
        console.error(`Error checking image path ${path}:`, error);
      }
    }
    
    // No image found after trying all paths
    console.log('No valid background image found');
    setHeaderBackgroundImage(null);
  };

  findBestImage();
}, [actualMetadata]);

  // Handle opening document modal
  const handleOpenModal = () => {
    setIsModalOpen(true);
  };
  
  // Format date for display
  const formatDate = (dateStr: string): string => {
    if (!dateStr) return 'Unknown date';
    return dateStr;
  };

  // Should show thumbnail
  const shouldShowThumbnail = () => {
    return !!thumbnailUrl && !imageError;
  };

  // Get document type icon
  const getDocumentTypeIcon = () => {
    if (!actualMetadata?.documentType) return null;
    
    const type = actualMetadata.documentType.toLowerCase();
    const iconColor = isDarkMode ? "text-slate-300" : "text-slate-600";
    
    if (type.includes('letter') || type.includes('correspondence')) {
      return (
        <svg className={`w-4 h-4 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      );
    } else if (type.includes('book') || type.includes('treatise')) {
      return (
        <svg className={`w-4 h-4 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      );
    } else if (type.includes('speech') || type.includes('address')) {
      return (
        <svg className={`w-4 h-4 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      );
    }
    
    // Default document icon
    return (
      <svg className={`w-4 h-4 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    );
  };

  // Handle roleplay mode with author portrait
  if (actualRoleplayMode && actualMetadata?.author) {
    const authorNameForFile = actualMetadata.author.toLowerCase().replace(/\s+/g, '');
    const portraitPath = `/portraits/${authorNameForFile}.jpg`;

    return (
      <div 
        className="cursor-pointer transition-all duration-300 transform hover:scale-[1.01]"
        onClick={handleOpenModal}
      >
        <div className="relative overflow-hidden rounded-lg">
          {/* Background with location */}
          {headerBackgroundImage && (
            <div className="absolute inset-0 w-full h-full">
              <Image 
                src={headerBackgroundImage}
                alt="Location background"
                fill
                className="object-cover opacity-100"
                sizes="(max-width: 768px) 100vw, 350px"
              />
              <div className={`absolute inset-0 ${
                isDarkMode 
                  ? 'bg-gradient-to-b from-slate-900/95 via-slate-900/70 to-slate-900/95'
                  : 'bg-gradient-to-b from-white/30 via-white/2 to-slate-950/90'
              }`}></div>
            </div>
          )}
          
          {/* Content layer */}
          <div className={`relative p-5 flex flex-col items-center ${
            isDarkMode 
              ? headerBackgroundImage ? 'bg-slate-800/60' : 'bg-slate-800/80'
              : headerBackgroundImage ? 'bg-white/10' : 'bg-white/10'
          }  rounded-lg border border-slate-300 dark:border-slate-700 shadow-sm`}>
            {/* Author portrait */}
            <div className="mb-3 relative w-24 h-24 rounded-full overflow-hidden border-2 border-white shadow-md">
              {!portraitError ? (
                <Image 
                  src={portraitPath} 
                  alt={actualMetadata.author} 
                  fill 
                  className="object-cover"
                  onError={() => setPortraitError(true)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-100">
                  <span className="text-4xl">{actualMetadata.authorEmoji || '👤'}</span>
                </div>
              )}
            </div>
            
            {/* Author info */}
            <h3 className={`${spaceGrotesk.className} text-xl font-medium mb-1 ${
              isDarkMode ? 'text-white' : 'text-indigo-100'
            }`}>
              {actualMetadata.author}
            </h3>
            
            <div className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-300'}`}>
              {formatDate(actualMetadata.date)}
            </div>
            
            {/* Location if available */}
            {actualMetadata.placeOfPublication && (
              <div className={`mt-2 flex items-center text-xs ${
                isDarkMode ? 'text-slate-400' : 'text-slate-300/90'
              }`}>
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {actualMetadata.placeOfPublication}
              </div>
            )}
            
            {/* Character status if available */}
            {actualMetadata.characterStatus && (
              <p className={`mt-3 text-xs italic text-center max-w-xs ${
                isDarkMode ? 'text-slate-400' : 'text-slate-200'
              }`}>
                {actualMetadata.characterStatus}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Regular document mode with elegant design
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="cursor-pointer"
      onClick={handleOpenModal}
    >
      <div className={`relative overflow-hidden rounded-xl ${
        isDarkMode 
          ? 'shadow-[0_4px_20px_-2px_rgba(0,0,0,0.3)]' 
          : 'shadow-[0_4px_14px_-2px_rgba(0,0,0,0.1)]'
      } transition-all duration-300 transform hover:scale-[1.01] hover:shadow-lg`}>
        {/* Background image layer with gradient overlay */}
        {headerBackgroundImage && (
          <div className="absolute inset-0 w-full h-full">
            <Image 
              src={headerBackgroundImage}
              alt="Location background"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 350px"
              priority={false}
            />
            <div className={`absolute inset-0 ${
              isDarkMode 
                ? 'bg-gradient-to-br from-slate-900/95 via-slate-900/70 to-slate-800/60'
                : 'bg-gradient-to-br from-white/30 via-white/80 to-white/40'
            }`}></div>
          </div>
        )}
        
        {/* Content layer */}
        <div className={`relative px-2 py-5 flex flex-col items-center ${
          isDarkMode 
            ? headerBackgroundImage 
              ? 'bg-slate-800/60 ' 
              : 'bg-slate-800'
            : headerBackgroundImage 
              ? 'bg-white/73 ' 
              : 'bg-white'
        } border ${
          isDarkMode 
            ? 'border-slate-700' 
            : 'border-slate-300'
        } rounded-lg`}>
          {/* Document thumbnail */}
          <div className={`mb-3 relative h-26 w-26 rounded-full overflow-hidden border ${
            isDarkMode ? 'border-slate-600' : 'border-slate-400'
          } shadow-md`}>
            {shouldShowThumbnail() ? (
              <Image 
                src={thumbnailUrl!}
                alt={actualMetadata?.title || "Document thumbnail"}
                fill
                className="object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className={`w-full h-full flex items-center justify-center ${
                isDarkMode ? 'bg-slate-700' : 'bg-slate-100'
              }`}>
                <span className="text-2xl">
                  {actualMetadata?.documentEmoji || '📄'}
                </span>
              </div>
            )}
          </div>
          
          {/* Document title */}
          <h3 className={`${spaceGrotesk.className} text-xl text-center tracking-tighter font-medium mb-1 ${
            isDarkMode ? 'text-white' : 'text-slate-800'
          }`}>
            {actualMetadata?.title || "Primary Source"}
          </h3>
          
          {/* Author */}
          {actualMetadata?.author && (
            <div className={`text-base mb-2  ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              {actualMetadata.author}
            </div>
          )}
          
          {/* Date */}
          {actualMetadata?.date && (
            <div className={`text-sm mb-3 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              {formatDate(actualMetadata.date)}
            </div>
          )}
          
          {/* Location */}
          {actualMetadata?.placeOfPublication && (
            <div className={`flex items-center text-xs mb-3 background-blur px-4 py-1 border-1 border-slate-200/60 brightness-85 shadow-inner rounded-full ${
              isDarkMode 
                ? 'bg-slate-700/70 text-slate-300' 
                : 'bg-slate-100/30 text-slate-600'
            }`}>
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {actualMetadata.placeOfPublication}
            </div>
          )}
          
          {/* Document type and genre badges */}
          <div className="flex flex-wrap justify-center gap-2">
            {actualMetadata?.documentType && (
              <div className={`flex items-center text-xs px-2 py-1 rounded-full ${
                isDarkMode 
                  ? 'bg-indigo-900/30 text-indigo-300 border border-indigo-800/50' 
                  : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
              }`}>
                {getDocumentTypeIcon()}
                <span className="ml-1 truncate max-w-[100px]">
                  {actualMetadata.documentType}
                </span>
              </div>
            )}
            
            {actualMetadata?.genre && actualMetadata.genre !== actualMetadata.documentType && (
              <div className={`flex items-center text-xs px-2 py-1 rounded-full ${
                isDarkMode 
                  ? 'bg-purple-900/30 text-purple-300 border border-purple-800/50' 
                  : 'bg-purple-50 text-purple-700 border border-purple-200'
              }`}>
                <span className="truncate max-w-[100px]">
                  {actualMetadata.genre}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Link to DocumentPortraitModal */}
      {isModalOpen && (
        <DocumentPortraitModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          portraitUrl={thumbnailUrl || undefined}
          sourceFile={actualSourceFile}
          sourceType={actualSourceType}
          metadata={actualMetadata}
          portraitEmoji={actualMetadata?.documentEmoji || (imageError ? '📄' : null)}
          darkMode={isDarkMode}
        />
      )}
    </motion.div>
  );
}