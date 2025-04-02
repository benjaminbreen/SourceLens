// components/ui/DocumentPortrait.tsx
// Component for displaying a document preview with appropriate styling
// Shows location background images and century-specific styling with subtle effect in standard mode
// Enhanced visual design in roleplay mode with full background image

'use client';

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import { useAppStore } from '@/lib/store';
import LocationBackground from './LocationBackground';
import DocumentPortraitModal from './DocumentPortraitModal';

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

  // State for modal visibility
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [thumbnailError, setThumbnailError] = useState(false);

  // Handle opening modal - define as a useCallback to prevent recreating on each render
  const handleOpenModal = useCallback(() => {
    console.log('Opening modal'); // Debug log
    setIsModalOpen(true);
  }, []);

  // Calculate century based on date for color schemes
  const date = actualMetadata?.date || '';
  const year = parseInt(date.match(/\d+/)?.[0] || '2000', 10);
  const century = Math.floor(year / 100) + 1;
  
  // Get color scheme based on century
  const getColorScheme = () => {
    // Your existing color scheme logic
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
      // ... rest of your switch statement
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
    // Your existing icon logic
    if (!actualMetadata?.documentType) return null;
    
    const type = actualMetadata.documentType.toLowerCase();
    
    // Rest of your function
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
      return false;
    }
    
    return false;
  };

  // For debugging only
  console.log('DocumentPortrait state:', { isModalOpen, thumbnailUrl });

  const authorNameForFile = actualMetadata?.author 
    ? actualMetadata.author.toLowerCase().replace(/\s+/g, '')
    : '';
  const portraitPath = `/portraits/${authorNameForFile}.jpg`;

  if (actualRoleplayMode && actualMetadata?.author) {
    // Roleplay mode with author portrait
    return (
      <>
        <div 
          className="cursor-pointer transition-all duration-300 hover:shadow-xl"
          onClick={handleOpenModal}
        >
          <LocationBackground 
            date={actualMetadata?.date || ''} 
            location={actualMetadata?.placeOfPublication}
            opacity={0.8}
            className="flex flex-col items-center p-5 rounded-lg border-4 border-double border-slate-400 overflow-hidden shadow-sm"
          >
            {/* Your existing content */}
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
                    <span className="text-[80px] leading-none transform scale-[1.5] flex items-center justify-center">
                      {actualMetadata.authorEmoji || '👤'}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Rest of your component's content */}
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
        </div>
        
        {/* Modal component - make sure it's rendered outside LocationBackground */}
        <DocumentPortraitModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          portraitUrl={thumbnailUrl}
          sourceFile={actualSourceFile}
          sourceType={actualSourceType}
          metadata={actualMetadata}
          portraitEmoji={actualMetadata?.documentEmoji || (portraitError ? '📄' : null)}
        />
      </>
    );
  } else {
    // Regular document mode with thumbnail support
    return (
      <>
        <div 
          className="cursor-pointer transition-all duration-300 hover:shadow-xl" 
          onClick={handleOpenModal}
        >
          <LocationBackground 
            date={actualMetadata?.date || ''} 
            location={actualMetadata?.placeOfPublication}
            opacity={0.5}
            className="flex flex-col border-4 border-double border-slate-300 items-center p-3 rounded-lg overflow-hidden z-8 shadow-lg"
          >
            {/* Subtle vignette effect around the edges */}
            <div className="absolute rounded-lg inset-0.5 shadow-[inset_0_0_40px_rgba(0,0,0,0.15)] z-9"></div>
            
            {/* Content with higher z-index */}
            <div className="flex flex-col items-center">
              {/* Document thumbnail/emoji with enhanced styling */}
              <div className={`group w-25 h-25 mt-2 rounded-full bg-white flex items-center justify-center text-8xl mb-1 overflow-hidden shadow-lg border-3 ${colorScheme.border} transition-all duration-300 hover:shadow-2xl transform hover:scale-[1.05]`}>
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
                    <div className="hover:bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-40 group-hover:opacity-50 transition-all duration-500"></div>
                  </div>
                ) : (
                  // Emoji fallback
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-white to-gray-50">
                    {actualMetadata?.documentEmoji || '📄'}
                  </div>
                )}
                
                {/* Enhanced hover effect with stronger transition */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent opacity-0 hover:opacity-100 transition-all duration-500"></div>
              </div>
              
              {/* Document title with stronger color accent */}
              <h3 className={`font-medium text-center text-md relative mb-3`}>
                {actualMetadata?.title || "Primary Source"}
                <span className={`absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-16 h-0.5 ${colorScheme.accent} rounded-full shadow-lg opacity-70`}></span>
              </h3>
              
              {/* Enhanced metadata display with better spacing */}
              <div className="flex flex-col items-center gap-2 px-2">
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
                  <div className={`flex items-center gap-1.5 px-3 mb-2 py-1.5 mb-1 rounded-full shadow-lg ${colorScheme.lightBg} ${colorScheme.text} text-xs font-medium border ${colorScheme.border} shadow-sm backdrop-blur-sm`}>
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
        </div>
        
        {/* Modal component - make sure it's rendered outside LocationBackground */}
        <DocumentPortraitModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          portraitUrl={thumbnailUrl}
          sourceFile={actualSourceFile}
          sourceType={actualSourceType}
          metadata={actualMetadata}
          portraitEmoji={actualMetadata?.documentEmoji || (portraitError ? '📄' : null)}
        />
      </>
    );
  }
}