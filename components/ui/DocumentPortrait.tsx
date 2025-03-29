// components/ui/DocumentPortrait.tsx
// Component for displaying a document preview with appropriate styling
// Shows location background images and century-specific styling with subtle effect in standard mode
// Enhanced visual design in roleplay mode with full background image

'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useAppStore } from '@/lib/store';
import LocationBackground from './LocationBackground';

interface DocumentPortraitProps {
  sourceFile?: File | null;
  sourceType?: 'text' | 'pdf' | 'image' | null;
  metadata?: any;
  roleplayMode?: boolean;
  portraitError?: boolean;
  setPortraitError?: (error: boolean) => void;
}

export default function DocumentPortrait({
  sourceFile,
  sourceType,
  metadata,
  roleplayMode,
  portraitError = false,
  setPortraitError = () => {}
}: DocumentPortraitProps) {
  // If props aren't provided, get them from the store
  const store = useAppStore();
  const actualSourceFile = sourceFile || store.sourceFile;
  const actualSourceType = sourceType || store.sourceType;
  const actualMetadata = metadata || store.metadata || {};
  const actualRoleplayMode = roleplayMode !== undefined ? roleplayMode : store.roleplayMode;
  const thumbnailUrl = store.sourceThumbnailUrl; // Get thumbnail URL from store

    // State for image loading error
  const [thumbnailError, setThumbnailError] = useState(false);

  // Calculate century based on date for color schemes
  const date = actualMetadata?.date || '';
  const year = parseInt(date.match(/\d+/)?.[0] || '2000', 10);
  const century = Math.floor(year / 100) + 1;
  
  // Get color scheme based on century
  const getColorScheme = () => {
    switch (century) {
      case 1:
      case 2:
      case 3:
      case 4:
      case 5: // Ancient (1st-5th century)
        return {
          gradient: "bg-gradient-to-b from-violet-100/10 to-violet-100/80",
          ring: "ring-violet-200",
          text: "text-purple-900",
          accent: "bg-violet-600",
          lightBg: "bg-violet-50",
          border: "border-violet-200"
        };
      case 6:
      case 7:
      case 8:
      case 9:
      case 10: // Medieval (6th-10th century)
        return {
          gradient: "bg-gradient-to-b from-indigo-100/10 to-indigo-100/80",
          ring: "ring-indigo-200",
          text: "text-indigo-700",
          accent: "bg-indigo-600",
          lightBg: "bg-indigo-50",
          border: "border-indigo-200"
        };
      case 11:
      case 12:
      case 13: // High Medieval (11th-13th century)
        return {
          gradient: "bg-gradient-to-b from-blue-100/10 to-blue-100/80",
          ring: "ring-blue-200",
          text: "text-blue-700",
          accent: "bg-blue-600",
          lightBg: "bg-blue-50",
          border: "border-blue-200"
        };
      case 14:
      case 15: // Late Medieval/Early Renaissance (14th-15th century)
        return {
          gradient: "bg-gradient-to-b from-sky-100/10 to-sky-100/80",
          ring: "ring-sky-200",
          text: "text-sky-700",
          accent: "bg-sky-600",
          lightBg: "bg-sky-50",
          border: "border-sky-200"
        };
      case 16: // Renaissance (16th century)
        return {
          gradient: "bg-gradient-to-b from-cyan-100/10 to-cyan-100/80",
          ring: "ring-cyan-200",
          text: "text-cyan-700",
          accent: "bg-cyan-600",
          lightBg: "bg-cyan-50",
          border: "border-cyan-200"
        };
      case 17: // Early Modern (17th century)
        return {
          gradient: "bg-gradient-to-b from-sky-100/10 to-teal-100/80",
          ring: "ring-sky-400",
          text: "text-sky-800",
          accent: "bg-sky-400",
          lightBg: "bg-sky-50",
          border: "border-sky-600"
        };
      case 18: // Enlightenment (18th century)
        return {
          gradient: "bg-gradient-to-b from-emerald-100/10 to-emerald-100/80",
          ring: "ring-emerald-200",
          text: "text-emerald-800",
          accent: "bg-emerald-600",
          lightBg: "bg-emerald-50",
          border: "border-emerald-200"
        };
      case 19: // Industrial Revolution (19th century)
        return {
          gradient: "bg-gradient-to-b from-amber-950/50 to-amber-200/50",
          ring: "ring-amber-200",
          text: "text-amber-700",
          accent: "bg-amber-600",
          lightBg: "bg-amber-50",
          border: "border-amber-200"
        };
      case 20: // Modern (20th century)
        return {
          gradient: "bg-gradient-to-t from-orange-100/80 to-orange-900/60",
          ring: "ring-orange-200",
          text: "text-orange-800/80",
          accent: "bg-orange-500",
          lightBg: "bg-orange-50",
          border: "border-orange-900/50"
        };
      default: // Contemporary (21st century onward)
        return {
          gradient: "bg-gradient-to-b from-rose-100/10 to-rose-100/80",
          ring: "ring-rose-200",
          text: "text-rose-700",
          accent: "bg-rose-600",
          lightBg: "bg-rose-50",
          border: "border-rose-200"
        };
    }
  };
  
  const colorScheme = getColorScheme();
  
  // Format date for display
  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'Unknown date';
    return dateStr;
  };
  
  // Determine document type icon
  const getDocumentTypeIcon = () => {
    if (!actualMetadata?.documentType) return null;
    
    const type = actualMetadata.documentType.toLowerCase();
    
    if (type.includes('letter') || type.includes('correspondence')) {
      return (
        <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      );
    } else if (type.includes('book') || type.includes('treatise')) {
      return (
        <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      );
    } else if (type.includes('speech') || type.includes('address')) {
      return (
        <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      );
    } else if (type.includes('manuscript') || type.includes('document')) {
      return (
        <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    } else if (type.includes('journal') || type.includes('article')) {
      return (
        <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
      );
    } else if (type.includes('legal') || type.includes('edict') || type.includes('decree')) {
      return (
        <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
        </svg>
      );
    }
    // Default document icon
    return (
      <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    );
  };

// Determine if we should display a thumbnail
  const shouldShowThumbnail = () => {
    // Check if there's a thumbnail URL in the store and it hasn't errored
    if (thumbnailUrl && !thumbnailError) return true;
    
    // Check if the source is an image type but no thumbnail was generated
    if (actualSourceType === 'image' && !thumbnailError) {
      // This could be enhanced to generate a thumbnail on the fly if needed
      return false;
    }
    
    return false;
  };

  if (actualRoleplayMode && actualMetadata?.author) {
    // Roleplay mode with author portrait
    const authorNameForFile = actualMetadata.author.toLowerCase().replace(/\s+/g, '');
    const portraitPath = `/portraits/${authorNameForFile}.jpg`;

    return (
      <LocationBackground 
        date={actualMetadata?.date || ''} 
        location={actualMetadata?.placeOfPublication}
        opacity={0.8}
        className="flex flex-col items-center p-5 rounded-lg border-4 border-double border-slate-400 overflow-hidden shadow-sm"
      >
        {/* Content goes here with z-index already handled by LocationBackground */}
        <div className="flex flex-col items-center">
          {/* Author portrait or emoji */}
          <div className={`group w-30 h-30 rounded-xl bg-white flex items-center justify-center text-8xl mb-3 overflow-hidden relative shadow-xl border-2 ${colorScheme.border} transition-all duration-300 hover:shadow-lg transform hover:scale-[1.03]`}>
           
          {!portraitError ? (
  <div className="w-full h-full relative">
    <Image 
      src={portraitPath} 
      alt={actualMetadata.author} 
      fill 
      className="object-cover"
      onError={() => setPortraitError(true)}
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
  </div>
) : (
  <div className="w-full h-full shadow-xl flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
    <span className="text-[80px]  leading-none transform scale-[1.5] flex items-center justify-center">
      {actualMetadata.authorEmoji || '👤'}
    </span>
  </div>
)}
          </div>
          
          {/* Author name - add more style */}
          <h3 className={`font-semibold font-serif rounded-full backdrop-blur-sm px-3 text-center text-lg py-0 mb-3 bg-slate-100/90 text-md border-2 ${colorScheme.border} shadow-xl`}>
            <span className={`${colorScheme.text}`}>
              {actualMetadata.author}
            </span>
          </h3>
          
          {/* Date with more styling */}
          <div className={`px-3 py-0 mb-2 font-sans rounded-full text-slate-800 bg-slate-300/40 text-md border-2 ${colorScheme.border} shadow-xl`}>
            {formatDate(actualMetadata.date)}
          </div>
          
          {/* Show location if available */}
          {actualMetadata.placeOfPublication && (
            <div className="mt-1 px-3 py-1 rounded-full bg-white/80 text-slate-700 text-xs font-medium shadow-lg flex items-center border border-slate-300">
           <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {actualMetadata.placeOfPublication}
            </div>
          )}
          
          {/* Character status if available */}
          {actualMetadata.characterStatus && (
            <p className="mt-2 text-sm text-center text-slate-700 italic max-w-[400px] bg-white/60 px-2 py-1 rounded-md">
              {actualMetadata.characterStatus}
            </p>
          )}
        </div>
      </LocationBackground>
    );
  } else {
    // Regular document mode with thumbnail support
    return (
      <LocationBackground 
        date={actualMetadata?.date || ''} 
        location={actualMetadata?.placeOfPublication}
        opacity={0.5}
        className="flex flex-col border-4 border-double border-slate-300 items-center p-3 rounded-lg overflow-hidden z-8 shadow-lg"
      >
        {/* Subtle vignette effect around the edges */}
        <div className="absolute rounded-lg inset-0 shadow-[inset_0_0_30px_rgba(0,0,0,0.05)] z-9"></div>
        
        {/* Content with higher z-index */}
        <div className="flex flex-col items-center">
          {/* Document thumbnail/emoji with enhanced styling */}
          <div className={`group w-25 h-25 rounded-full bg-white flex items-center justify-center text-8xl mb-2 overflow-hidden shadow-xl border-2 ${colorScheme.border} transition-all duration-300 hover:shadow-2xl transform hover:scale-[1.05]`}>
            {shouldShowThumbnail() ? (
              // Thumbnail image
              <div className="w-full h-full relative">
                <Image 
                  src={thumbnailUrl!}
                  alt={actualMetadata?.title || "Document thumbnail"} 
                  fill 
                  className="object-cover"
                  onError={() => setThumbnailError(true)}
                />
                {/* Overlay on hover effect */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
              </div>
            ) : (
              // Emoji fallback
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-white to-gray-50">
                {actualMetadata?.documentEmoji || '📄'}
              </div>
            )}
            
            {/* Enhanced hover effect with stronger transition */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
          </div>
          
          {/* Document title with stronger color accent */}
          <h3 className={`font-medium text-center text-lg relative mb-3`}>
            {actualMetadata?.title || "Primary Source"}
            <span className={`absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-16 h-0.5 ${colorScheme.accent} rounded-full shadow-lg opacity-70`}></span>
          </h3>
          
          {/* Enhanced metadata display with better spacing */}
          <div className="flex flex-col items-center gap-2.5">
            {/* Date with enhanced styling and slightly larger text */}
            <div className={`flex items-center text-slate-700 px-3 py-1.5 text-xs font-medium bg-white/80 backdrop-blur-sm rounded-full shadow-sm border border-slate-100`}>
              {formatDate(actualMetadata?.date || "Unknown date")}
              {actualMetadata?.author && (
                <>
                  <span className="mx-1.5 text-slate-400">•</span>
                  <span>{actualMetadata.author}</span>
                </>
              )}
            </div>
            
            {/* Location if available - with enhanced styling */}
            {actualMetadata?.placeOfPublication && (
              <div className="px-3 py-1.5 rounded-full bg-white/80 backdrop-blur-sm text-slate-700 text-xs font-medium shadow-sm border border-slate-100 flex items-center">
                <svg className="w-3 h-3 mr-1.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {actualMetadata.placeOfPublication}
              </div>
            )}
            
            {/* Document type and genre badge with improved styling */}
            {(actualMetadata?.documentType || actualMetadata?.genre) && (
              <div className={`flex items-center gap-1.5 px-3 py-1.5 mb-1 rounded-full shadow-lg ${colorScheme.lightBg} ${colorScheme.text} text-xs font-medium border ${colorScheme.border} shadow-sm backdrop-blur-sm`}>
                {getDocumentTypeIcon()}
                <span className="ml-1">
                  {actualMetadata?.documentType && actualMetadata?.genre 
                    ? `${actualMetadata.documentType} • ${actualMetadata.genre}`
                    : actualMetadata?.documentType || actualMetadata?.genre}
                </span>
              </div>
            )}
          </div>
        </div>
      </LocationBackground>
    );
  }
}