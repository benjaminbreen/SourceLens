// components/ui/DocumentPortrait.tsx
// Enhanced version with better visual contrast between portrait and background
// Now properly uses LocationBackground component and LocationBackgroundUtils

'use client';

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import { useAppStore } from '@/lib/store';
import LocationBackground from './LocationBackground';
import DocumentPortraitModal from './DocumentPortraitModal';
import { extractCentury } from './LocationBackgroundUtils';

interface DocumentPortraitProps {
  sourceFile?: File | null;
  sourceType?: 'text' | 'pdf' | 'image' | 'audio' | null;  
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
  const actualThumbnailUrl = store.sourceThumbnailUrl;

  // Generate thumbnail URL based on file type or use stored URL
  const thumbnailUrl = actualSourceFile?.type?.startsWith('image/') 
    ? URL.createObjectURL(actualSourceFile)
    : (actualThumbnailUrl || actualMetadata?.thumbnailUrl);

  // State for modal visibility and thumbnail errors
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [thumbnailError, setThumbnailError] = useState(false);

  // Handle opening modal - define as a useCallback to prevent recreating on each render
  const handleOpenModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  // Calculate century based on date for color schemes
  const date = actualMetadata?.date || '';
  const century = extractCentury(date);
  
  // Get color scheme based on century
  const getColorScheme = () => {
   // [Color scheme function remains the same - no changes needed]
   // Keeping your existing color scheme function
  
   switch (century) {
    // Ancient (before 5th century BCE)
    case -2:
      return {
        gradient: "bg-gradient-to-b from-stone-100/10 to-stone-100/80",
        ring: "ring-stone-400",
        text: "text-stone-900",
        accent: "bg-stone-600",
        lightBg: "bg-stone-50",
        border: "border-[3px] border-stone-600",
        shadowColor: "shadow-stone-200/50"
      };
      
    // Antiquity (5th BCE to 5th CE)
    case -1:
      return {
        gradient: "bg-gradient-to-b from-amber-100/10 to-amber-100/80",
        ring: "ring-amber-400",
        text: "text-amber-900",
        accent: "bg-amber-600",
        lightBg: "bg-amber-50",
        border: "border-[3px] border-amber-700",
        shadowColor: "shadow-amber-200/50"
      };
      // Ancient (1st-5th century)
      case 1:
      case 2:
      case 3:
      case 4:
      case 5: 
        return {
          gradient: "bg-gradient-to-b from-violet-100/10 to-violet-100/80",
          ring: "ring-violet-200",
          text: "text-purple-900",
          accent: "bg-violet-600",
          lightBg: "bg-violet-50",
          border: "border-violet-200",
          shadowColor: "shadow-violet-200/50"
        };
        
      // Early Medieval (6th-10th century)
      case 6:
      case 7:
      case 8:
      case 9:
      case 10:
        return {
          gradient: "bg-gradient-to-b from-indigo-100/10 to-indigo-100/80",
          ring: "ring-indigo-200",
          text: "text-indigo-800",
          accent: "bg-indigo-600",
          lightBg: "bg-indigo-50",
          border: "border-indigo-200",
          shadowColor: "shadow-indigo-200/50"
        };
        
      // High Medieval (11th-13th century)
      case 11:
      case 12:
      case 13:
        return {
          gradient: "bg-gradient-to-b from-blue-100/10 to-blue-100/80",
          ring: "ring-blue-200",
          text: "text-blue-900",
          accent: "bg-blue-600",
          lightBg: "bg-blue-50",
          border: "border-blue-200",
          shadowColor: "shadow-blue-200/50"
        };
        
      // Late Medieval/Renaissance (14th-15th century)
      case 14:
      case 15:
        return {
          gradient: "bg-gradient-to-b from-teal-100/10 to-teal-100/80",
          ring: "ring-teal-200",
          text: "text-teal-900",
          accent: "bg-teal-600",
          lightBg: "bg-teal-50",
          border: "border-teal-200",
          shadowColor: "shadow-teal-200/50"
        };
        
      // Age of Discovery (16th century)
      case 16:
        return {
          gradient: "bg-gradient-to-b from-cyan-100/10 to-cyan-100/80",
          ring: "ring-cyan-300",
          text: "text-cyan-900",
          accent: "bg-cyan-600",
          lightBg: "bg-cyan-50",
          border: "border-cyan-200",
          shadowColor: "shadow-cyan-200/50"
        };
        
      // Baroque Era (17th century)
      case 17:
        return {
          gradient: "bg-gradient-to-b from-amber-100/10 to-amber-100/80",
          ring: "ring-amber-300",
          text: "text-amber-900",
          accent: "bg-amber-600",
          lightBg: "bg-amber-50",
          border: "border-amber-200",
          shadowColor: "shadow-amber-200/50"
        };
        
      // Enlightenment (18th century)
      case 18:
        return {
          gradient: "bg-gradient-to-b from-yellow-100/10 to-yellow-100/80",
          ring: "ring-yellow-300",
          text: "text-yellow-900",
          accent: "bg-yellow-600",
          lightBg: "bg-yellow-50",
          border: "border-yellow-200",
          shadowColor: "shadow-yellow-200/50"
        };
        
      // Industrial Revolution (19th century)
      case 19:
        return {
          gradient: "bg-gradient-to-b from-orange-100/10 to-orange-100/80",
          ring: "ring-orange-300",
          text: "text-orange-900",
          accent: "bg-orange-600",
          lightBg: "bg-orange-50",
          border: "border-orange-300",
          shadowColor: "shadow-orange-200/50"
        };
        
      // Modern Era (20th century)
      case 20:
        return {
          gradient: "bg-gradient-to-b from-red-100/10 to-red-100/80",
          ring: "ring-red-300",
          text: "text-red-900",
          accent: "bg-red-600",
          lightBg: "bg-red-50", 
          border: "border-red-200",
          shadowColor: "shadow-red-200/50"
        };
        
      // Contemporary (21st century onward)
      default:
        return {
          gradient: "bg-gradient-to-b from-fuchsia-100/10 to-fuchsia-100/80",
          ring: "ring-fuchsia-300",
          text: "text-fuchsia-900",
          accent: "bg-fuchsia-600",
          lightBg: "bg-fuchsia-50",
          border: "border-fuchsia-200",
          shadowColor: "shadow-fuchsia-200/50"
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
    // [Icon function remains the same - no changes needed]
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
    } else if (type.includes('journal') || type.includes('article')) {
      return (
        <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
      );
    } else {
      return (
        <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      );
    }
  };

  // Determine if we should display a thumbnail
  const shouldShowThumbnail = () => {
    if (thumbnailUrl && !thumbnailError) return true;
    if (actualSourceType === 'image' && !thumbnailError) return false;
    return false;
  };

  const authorNameForFile = actualMetadata?.author 
    ? actualMetadata.author.toLowerCase().replace(/\s+/g, '')
    : '';
  const portraitPath = `/portraits/${authorNameForFile}.jpg`;

  if (actualRoleplayMode && actualMetadata?.author) {
    // Roleplay mode with author portrait
    return (
      <>
        <div 
          className="cursor-pointer transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl rounded-2xl"
          onClick={handleOpenModal}
        >
          {/* Use the LocationBackground component correctly */}
          <LocationBackground
            date={actualMetadata?.date || ''}
            location={actualMetadata?.placeOfPublication || ''}
            opacity={0.85}
            className="relative overflow-hidden rounded-2xl border-4 border-double border-slate-400/70 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)]"
          >
            {/* Content container */}
            <div className="flex flex-col items-center px-4 py-5">
              {/* Author portrait with enhanced depth and contrast */}
              <div className={`group w-28 h-34 rounded-xl overflow-hidden relative 
                shadow-[0_0_25px_rgba(0,0,0,0.2),0_10px_10px_-5px_rgba(0,0,0,0.1)] 
                border-2 ${colorScheme.border} ring-2 ring-white/10 ring-offset-1
                transition-all duration-300 hover:shadow-2xl ${colorScheme.shadowColor}`}>
                
                {!portraitError ? (
                  <div className="w-full h-full relative">
                    <Image 
                      src={portraitPath} 
                      alt={actualMetadata.author} 
                      fill 
                      className="object-cover"
                      onError={() => setPortraitError(true)}
                    />
                    
                    {/* Inner lighting effects to enhance the portrait */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10"></div>
                    
                    {/* Inner shadow to make the portrait "pop" */}
                    <div className="absolute inset-0 shadow-[inset_0_0_10px_rgba(0,0,0,0.3)]"></div>
                    
                    {/* Highlight at top */}
                    <div className="absolute top-0 inset-x-0 h-1/4 bg-gradient-to-b from-white/10 to-transparent"></div>
                    
                    {/* Hover effect */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 
                      bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                  </div>
                ) : (
                  <div className="w-full h-full shadow-xl flex items-center justify-center 
                    bg-gradient-to-br from-gray-50 to-gray-100">
                    <span className="text-[80px] leading-none transform scale-[1.5] 
                      drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)] filter-shadow">
                      {actualMetadata.authorEmoji || '👤'}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Author name - elegant typography with backdrop blur for legibility */}
              <h3 className={`font-serif font-semibold text-lg text-center mt-4 mb-2 px-4 py-1
                rounded-full backdrop-blur-sm bg-slate-50/90 border ${colorScheme.border} 
                ${colorScheme.text} shadow-md`}>
                {actualMetadata.author}
              </h3>
              
              {/* Date with refined styling */}
              <div className={`px-3 py-0.5 mb-3 font-sans rounded-full 
                bg-white/80 text-slate-800 text-sm shadow-md border ${colorScheme.border}`}>
                {formatDate(actualMetadata.date)}
              </div>
              
              {/* Location with enhanced readability */}
              {actualMetadata.placeOfPublication && (
                <div className="mt-1 px-3 py-1 rounded-full bg-white/90 text-slate-700 
                  text-xs font-medium shadow-md flex items-center border border-slate-200">
                  <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="font-medium">{actualMetadata.placeOfPublication}</span>
                </div>
              )}
              
              {/* Character status with better readability */}
              {actualMetadata.characterStatus && (
                <p className="mt-3 text-sm text-center text-slate-700 italic max-w-[400px] 
                  bg-white/90 px-3 py-1.5 rounded-md shadow-sm border border-slate-200">
                  {actualMetadata.characterStatus}
                </p>
              )}
            </div>
          </LocationBackground>
        </div>
        
        {/* Modal component */}
        <DocumentPortraitModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          portraitUrl={thumbnailUrl}
          sourceFile={actualSourceFile}
          sourceType={actualSourceType}
          metadata={actualMetadata}
          portraitEmoji={actualMetadata?.documentEmoji || (portraitError ? '👤' : null)}
        />
      </>
    );
  } else {
    // Regular document mode with thumbnail support
    return (
      <>
        <div 
          className="cursor-pointer transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl rounded-xl"
          onClick={handleOpenModal}
        >
          <div className="relative rounded-xl overflow-hidden">
            {/* Subtle inset border/frame that sits around 10px in from edge */}
            <div className="absolute inset-0 z-20 pointer-events-none rounded-lg">
              <div className="absolute inset-[11px] rounded-lg border-2 border-gray-600/20 shadow-[inset_0_0_10px_rgba(0,0,0,0.1)]"></div>
            </div>
            
            {/* Use the LocationBackground component correctly */}
            <LocationBackground
              date={actualMetadata?.date || ''}
              location={actualMetadata?.placeOfPublication || ''}
              opacity={0.7}
              className="relative overflow-hidden rounded-lg border-4 shadow border-double border-slate-300/80 shadow-[0_10px_15px_-3px_rgba(0,0,0,0.07),0_4px_6px_-4px_rgba(0,0,0,0.1)]"
            >
              {/* Content container */}
              <div className="flex flex-col items-center p-4">
                {/* Document thumbnail with enhanced 3D effect */}
                <div className={`group w-24 h-24 mt-1 rounded-full overflow-hidden relative 
                  shadow-[0_0_20px_rgba(0,0,0,0.15),0_20px_10px_-5px_rgba(0,0,0,0.4)] 
                  border-2 ${colorScheme.border} ring-2 ring-white/80
                  transition-all duration-500 transform hover:scale-105 ${colorScheme.shadowColor}`}>
                  
                  {shouldShowThumbnail() ? (
                    <div className="w-full h-full relative">
                      <Image 
                        src={thumbnailUrl!}
                        alt={actualMetadata?.title || "Document"} 
                        fill 
                        className="object-cover"
                        onError={() => setThumbnailError(true)}
                      />
                      
                      {/* Enhanced lighting effects */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-black/10 to-transparent"></div>
                      <div className="absolute top-0 inset-x-0 h-1/4 bg-white/30"></div>
                      
                      {/* Inner shadow to make the image "pop" */}
                      <div className="absolute inset-0 shadow-[inset_0_0_8px_rgba(0,0,0,0.3)]"></div>
                      
                      {/* Hover overlay */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 
                        transition-opacity duration-300 bg-gradient-to-b from-black/10 via-transparent to-black/30"></div>
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center 
                      bg-gradient-to-br from-white to-slate-50">
                      <span className="text-7xl drop-shadow-[0_4px_4px_rgba(0,0,0,0.2)]">
                        {actualMetadata?.documentEmoji || '📄'}
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Title with artistic and distinctive styling */}
                <div className="relative my-2 z-20 p-1">
                  {/* Subtle glow effect behind title */}
                  <div className="absolute backdrop-blur -inset-1 bg-gradient-to-r from-transparent via-white/70 to-transparent 
                    blur-md opacity-70 rounded-lg"></div>
                  
                  {/* Title container with elegant styling */}
                  <h3 className={`relative font-serif text-center text-xl font-bold tracking-tight leading-tight
                    py-1.5 ${colorScheme.text} drop-shadow-[0_1px_1px_rgba(255,255,255,0.9)]`}>
                    {actualMetadata?.title || "Primary Source"}
                    
                    {/* Decorative underline with gradient */}
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-40 h-[2px] 
                      bg-gradient-to-r from-transparent via-current to-transparent opacity-80"></div>
                  </h3>
                </div>
                
                {/* Metadata pills with enhanced styling */}
                <div className="flex flex-col items-center gap-2 p-1">
                  {/* Date and author pill */}
                  <div className={`flex items-center text-slate-700 px-3 py-1.5 text-xs font-medium 
                    bg-white/90 backdrop-blur-sm rounded-full shadow-sm border border-slate-200`}>
                    {formatDate(actualMetadata?.date || "Unknown date")}
                    {actualMetadata?.author && (
                      <>
                        <span className="mx-1.5 text-slate-400">•</span>
                        <span className="font-medium">{actualMetadata.author}</span>
                      </>
                    )}
                  </div>
                  
                  {/* Location pill */}
                  {actualMetadata?.placeOfPublication && (
                    <div className="px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm 
                      text-slate-700 text-xs font-medium shadow-sm border border-slate-200 flex items-center">
                      <svg className="w-3 h-3 mr-1.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{actualMetadata.placeOfPublication}</span>
                    </div>
                  )}
                  
                  {/* Document type pill with custom colors */}
                  {(actualMetadata?.documentType || actualMetadata?.genre) && (
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full shadow-md 
                      ${colorScheme.lightBg} ${colorScheme.text} text-xs font-medium 
                      border ${colorScheme.border} backdrop-blur-sm`}>
                      {getDocumentTypeIcon()}
                      <span className="ml-1 font-medium">
                        {actualMetadata?.documentType && actualMetadata?.genre 
                          ? `${actualMetadata.documentType} • ${actualMetadata.genre}`
                          : actualMetadata?.documentType || actualMetadata?.genre}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </LocationBackground>
          </div>
        </div>
        
        {/* Modal component */}
        <DocumentPortraitModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          portraitUrl={thumbnailUrl}
          sourceFile={actualSourceFile}
          sourceType={actualSourceType}
          metadata={actualMetadata}
          portraitEmoji={actualMetadata?.documentEmoji || (thumbnailError ? '📄' : null)}
        />
      </>
    );
  }
}