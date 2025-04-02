// components/ui/DocumentPortraitModal.tsx
// Modal component that displays an expanded version of the document portrait
// Shows larger image/emoji with document metadata in a terminal-style interface
// Features dynamic header background with location image that fades across the header

'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useAppStore } from '@/lib/store';
import { extractCentury, normalizeLocation } from './LocationBackgroundUtils';

interface DocumentPortraitModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceFile?: File | null;
  sourceType?: 'text' | 'pdf' | 'image' | 'audio' | null;  
  metadata?: any;
  portraitUrl?: string;
  portraitEmoji?: string | null;
}

export default function DocumentPortraitModal({
  isOpen,
  onClose,
  sourceFile,
  sourceType,
  metadata,
  portraitUrl,
  portraitEmoji
}: DocumentPortraitModalProps) {
  // Add state for image expansion
  const [isImageExpanded, setIsImageExpanded] = useState(false);
  const [headerBackgroundImage, setHeaderBackgroundImage] = useState<string | null>(null);
  
  // Get store data if props not provided
  const store = useAppStore();
  const actualSourceFile = sourceFile || store.sourceFile;
  const actualSourceType = sourceType || store.sourceType;
  const actualMetadata = metadata || store.metadata || {};
  const thumbnailUrl = portraitUrl || store.sourceThumbnailUrl;

  // Find best header background image based on date and location
  useEffect(() => {
    if (!actualMetadata) return;
    
    const date = actualMetadata.date || '';
    const location = actualMetadata.placeOfPublication || '';
    
    if (!date && !location) {
      setHeaderBackgroundImage(null);
      return;
    }
    
    const century = extractCentury(date);
    const normalizedLocation = normalizeLocation(location);
    
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
      // Try specific century+location combination
      if (await checkImageExists(specificImage)) {
        setHeaderBackgroundImage(specificImage);
        return;
      }
      
      // Try century-only image
      if (await checkImageExists(centuryGenericImage)) {
        setHeaderBackgroundImage(centuryGenericImage);
        return;
      }
      
      // Try location-only image
      if (normalizedLocation && await checkImageExists(locationGenericImage)) {
        setHeaderBackgroundImage(locationGenericImage);
        return;
      }
      
      // Fallback to default
      if (await checkImageExists(defaultImage)) {
        setHeaderBackgroundImage(defaultImage);
        return;
      }
      
      // No image found
      setHeaderBackgroundImage(null);
    };
    
    findBestImage();
  }, [actualMetadata]);

  // Close on escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isImageExpanded) {
          setIsImageExpanded(false);
        } else {
          onClose();
        }
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      // Prevent body scrolling
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose, isImageExpanded]);

  // Close if clicking outside the modal content
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      if (isImageExpanded) {
        setIsImageExpanded(false);
      } else {
        onClose();
      }
    }
  };

  // Toggle image expansion
  const toggleImageExpansion = () => {
    setIsImageExpanded(!isImageExpanded);
  };

  if (!isOpen) return null;

  // Calculate content size for display
  const contentSize = actualSourceFile?.size || (store.sourceContent?.length || 0);
  const contentSizeKB = Math.round(contentSize / 1024);
  const wordCount = Math.round((store.sourceContent?.length || 0) / 5);

  // Format date for display
  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'Unknown date';
    return dateStr;
  };

  // Generate citation text for expanded image view
  const getCitationText = () => {
    const parts = [];
    
    if (actualMetadata?.title) {
      parts.push(`Title: ${actualMetadata.title}`);
    }
    
    if (actualMetadata?.author) {
      parts.push(`Author: ${actualMetadata.author}`);
    }
    
    if (actualMetadata?.date) {
      parts.push(`Date: ${formatDate(actualMetadata.date)}`);
    }
    
    if (actualMetadata?.placeOfPublication) {
      parts.push(`Location: ${actualMetadata.placeOfPublication}`);
    }
    
    if (actualSourceFile?.name) {
      parts.push(`Filename: ${actualSourceFile.name}`);
    }
    
    return parts.join('\n');
  };

  // Generate a description of the document based on century and type
const getDocumentDescription = (metadata: any): string => {
  // Get century from the date
  let century = '';
  if (metadata.date) {
    // Extract year
    const yearMatch = metadata.date.match(/\b(\d{4})\b/);
    if (yearMatch) {
      const year = parseInt(yearMatch[1], 10);
      const centuryNum = Math.ceil(year / 100);
      
      // Convert to ordinal text
      const ordinal = centuryNum === 1 ? '1st' : 
                      centuryNum === 2 ? '2nd' : 
                      centuryNum === 3 ? '3rd' : 
                      `${centuryNum}th`;
      
      century = `${ordinal} century`;
    } else {
      // Try using the extract century function
      const centuryNum = extractCentury(metadata.date);
      if (centuryNum > 0) {
        const ordinal = centuryNum === 1 ? '1st' : 
                        centuryNum === 2 ? '2nd' : 
                        centuryNum === 3 ? '3rd' : 
                        `${centuryNum}th`;
        century = `${ordinal} century`;
      } else if (centuryNum === -1) {
        century = 'antiquity';
      } else if (centuryNum === -2) {
        century = 'ancient';
      }
    }
  }
  
  // Get document type
  let docType = metadata.documentType?.toLowerCase() || 
                metadata.genre?.toLowerCase() || 
                'document';
  
  // Simplify common document types for better display
  docType = docType.replace('article', 'article')
                  .replace('report', 'report')
                  .replace('manuscript', 'manuscript')
                  .replace('letter', 'letter')
                  .replace('correspondence', 'letter')
                  .replace('book', 'book')
                  .replace('essay', 'essay')
                  .replace('journal', 'journal')
                  .replace('diary', 'diary')
                  .replace('pamphlet', 'pamphlet');
  
  // Combine into a phrase
  if (century && docType) {
    return `a ${century} ${docType}`;
  } else if (century) {
    return `a ${century} document`;
  } else if (docType) {
    return `a ${docType}`;
  } else {
    return 'historical document';
  }
};

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 modal-fade-in"
      onClick={handleBackdropClick}
    >
      {/* Expanded image overlay */}
      {isImageExpanded && thumbnailUrl && (
        <div 
          className="fixed  inset-0 z-[60] flex items-center justify-center bg-black/90 animate-in fade-in duration-200"
          onClick={() => setIsImageExpanded(false)}
        >
          <div className="relative flex items-center max-w-[95vw] max-h-[90vh] transition-all duration-300 animate-in zoom-in-105 duration-200">
            {/* Citation panel on the left */}
            <div className="hidden md:block bg-black/80 p-4 rounded-l-md text-slate-300 font-mono text-xs max-w-xs max-h-[90vh] overflow-y-auto">
              <h3 className="text-sm text-white mb-2 border-b border-slate-700 pb-2">Source Information</h3>
              <pre className="whitespace-pre-wrap">{getCitationText()}</pre>
              
              {/* Display full citation if available */}
              {actualMetadata?.fullCitation && (
                <div className="mt-4 pt-4 border-t border-slate-700">
                  <h4 className="text-xs text-white mb-2">Citation</h4>
                  <pre className="whitespace-pre-wrap text-green-300 leading-relaxed opacity-90">
                    {actualMetadata.fullCitation}
                  </pre>
                </div>
              )}
              
              {/* Display viewing instructions */}
              <div className="mt-4 pt-4 border-t border-slate-700 text-slate-400">
                <p className="text-[10px] italic">Click image to close • ESC to exit</p>
              </div>
            </div>
            
            {/* Image container */}
            <div className="relative bg-black/40 rounded-md md:rounded-l-none shadow-2xl">
              <Image 
                src={thumbnailUrl}
                alt={actualMetadata?.title || "Document image"}
                width={1200}
                height={1200}
                className="object-contain max-h-[90vh] cursor-zoom-out"
                onClick={() => setIsImageExpanded(false)}
              />
              
              {/* Mobile citation overlay (only on small screens) */}
              <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-3 text-white font-mono text-xs backdrop-blur-sm md:hidden">
                {actualMetadata?.title || ''} • {actualMetadata?.author || ''} • {formatDate(actualMetadata?.date || '')}
              </div>
              
              <button 
                className="absolute top-4 right-4 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors"
                onClick={() => setIsImageExpanded(false)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      <div 
        className="bg-white border-2 border-slate-900 dark:bg-slate-800 rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden modal-slide-in"
        onClick={e => e.stopPropagation()}
      >

{/* Header with background image if available */}
<div className="relative overflow-hidden">
  {/* Background image layer */}
  {headerBackgroundImage && (
    <div className="absolute inset-0 w-full h-full">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url('${headerBackgroundImage}')` }}
      />
      {/* Gradient overlay that transitions more gradually */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-slate-800/40 to-transparent" />
    </div>
  )}
  
  {/* Header content */}
  <div className={`flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-700 relative z-10 ${
    headerBackgroundImage ? 'text-white' : 'bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100'
  }`}>
    <div className="flex items-center">
      <h2 className="text-xl font-semibold flex items-center">
        {headerBackgroundImage && (
          <span className="mr-2 w-1.5 h-6 bg-gradient-to-r from-amber-400 to-amber-200 rounded-full inline-block" />
        )}
      &nbsp;  Source Details
      </h2>
      
      {/* Document description phrase */}
      {actualMetadata && (
        <div className="ml-2 flex items-center">
          <span className={`mx-2 opacity-60 ${headerBackgroundImage ? 'text-white/70' : 'text-slate-400'}`}>/</span>
          <span className={`font-mono text-sm font-medium tracking ${headerBackgroundImage ? 'text-cyan-300' : 'text-slate-500'}`}>
              &nbsp; {getDocumentDescription(actualMetadata)}
          </span>
        </div>
      )}
    </div>
    
    <button 
      onClick={onClose}
      className={`rounded-full p-1.5 transition-colors ${
        headerBackgroundImage 
          ? 'text-white/90 hover:bg-white/20 hover:text-white' 
          : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
      }`}
      aria-label="Close"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
</div>

  {/* Divider */}
      <div className="h-1 mt-0 bg-gradient-to-r from-indigo-900 via-purple-400 to-amber-400 shadow-md"></div>

        
        {/* Modal Body - Two Column Layout */}
        <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-700">
          {/* Left Column - Visual */}
          <div className="w-full md:w-2/5 p-6 flex flex-col items-center">
            {/* Large Portrait/Image */}
            <div className={`w-48 h-60 md:w-86 md:h-100 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center overflow-hidden shadow-lg border-2 ${thumbnailUrl ? 'border-indigo-300 dark:border-indigo-700 hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors' : 'border-slate-300 dark:border-slate-700'} mb-6`}>
              {thumbnailUrl ? (
                <div 
                  className="w-full h-full relative cursor-zoom-in transition-transform hover:scale-105 duration-200"
                  onClick={toggleImageExpansion}
                  title="Click to expand image"
                >
                  <Image 
                    src={thumbnailUrl}
                    alt={actualMetadata?.title || "Document thumbnail"} 
                    fill 
                    className="object-contain"
                  />
                  {/* Zoom icon overlay that appears on hover */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200 bg-black/20">
                    <div className="bg-black/50 rounded-full p-2">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
                    </div>
                  </div>
                </div>
              ) : (actualMetadata?.documentEmoji || portraitEmoji) ? (
                <span className="text-[80px] md:text-[100px] leading-none">
                  {actualMetadata?.documentEmoji || portraitEmoji || '📄'}
                </span>
              ) : (
                <svg className="w-24 h-24 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              )}
            </div>
            
            {/* Document Title & Author */}
            <h1 className="text-2xl font-serif text-center font-bold text-slate-900 dark:text-slate-100 mb-2">
              {actualMetadata?.title || "Untitled Document"}
            </h1>
            {actualMetadata?.author && (
              <p className="text-lg text-center text-slate-700 dark:text-slate-300 mb-6">
                by <span className="font-medium">{actualMetadata.author}</span>
              </p>
            )}
            
            {/* Publication Info */}
            <div className="flex flex-wrap gap-3 justify-center mt-2">
              {actualMetadata?.date && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                  <svg className="w-4 h-4 mr-1 text-slate-500 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {formatDate(actualMetadata.date)}
                </span>
              )}
              
              {actualMetadata?.placeOfPublication && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                  <svg className="w-4 h-4 mr-1 text-slate-500 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {actualMetadata.placeOfPublication}
                </span>
              )}
            </div>
          </div>
          
          {/* Right Column - Terminal-style Metadata */}
          <div className="w-full md:w-3/5 p-6 overflow-y-auto max-h-[60vh] md:max-h-[70vh]">
            <div className="font-mono text-sm bg-slate-900 text-slate-100 rounded-lg p-4 shadow-inner overflow-x-auto">
              <div className="flex items-center mb-3 text-slate-400 border-b border-slate-700 pb-2">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="font-bold">source-metadata</span>
                <span className="ml-auto text-xs opacity-60">~ sourceLens</span>
              </div>
              
              {/* ASCII terminal display start */}
              <div className="space-y-1">
                <p><span className="text-green-400">$</span> <span className="text-yellow-300">document</span> <span className="text-cyan-300">--info</span></p>
                <div className="pl-2 border-l-2 border-slate-700 mt-2">
                  <p className="text-purple-300">┌─ Document Identity ───────────────────┐</p>
                  <p><span className="text-blue-300">title:</span> {actualMetadata?.title || 'Untitled Document'}</p>
                  <p><span className="text-blue-300">author:</span> {actualMetadata?.author || 'Unknown'}</p>
                  <p><span className="text-blue-300">date:</span> {formatDate(actualMetadata?.date || '')}</p>
                  {actualMetadata?.genre && <p><span className="text-blue-300">genre:</span> {actualMetadata.genre}</p>}
                  {actualMetadata?.documentType && <p><span className="text-blue-300">type:</span> {actualMetadata.documentType}</p>}
                  {actualMetadata?.placeOfPublication && <p><span className="text-blue-300">location:</span> {actualMetadata.placeOfPublication}</p>}
                  
                  <p className="text-purple-300 mt-3">┌─ Technical Details ──────────────────┐</p>
                  <p><span className="text-blue-300">source_type:</span> {actualSourceType || 'text'}</p>
                  <p><span className="text-blue-300">file_type:</span> {actualSourceFile?.type || 'N/A'}</p>
                  <p><span className="text-blue-300">file_size:</span> {actualSourceFile?.size ? `${Math.round(actualSourceFile.size / 1024)} KB` : 'N/A'}</p>
                  <p><span className="text-blue-300">content_size:</span> {contentSizeKB} KB</p>
                  <p><span className="text-blue-300">word_count:</span> ~{wordCount} words</p>
                  <p><span className="text-blue-300">chars:</span> {store.sourceContent?.length || 0} characters</p>
                  
                  {actualMetadata?.academicSubfield && (
                    <>
                      <p className="text-purple-300 mt-3">┌─ Research Context ──────────────────┐</p>
                      <p><span className="text-blue-300">field:</span> {actualMetadata.academicSubfield}</p>
                    </>
                  )}
                  
                  {actualMetadata?.tags && (
                    <>
                      <p className="text-purple-300 mt-3">┌─ Tags ───────────────────────────────┐</p>
                      <div className="pl-2">
                        {Array.isArray(actualMetadata.tags) 
                          ? actualMetadata.tags.map((tag: string, i: number) => (
                              <span key={i} className="inline-block mr-2 mb-1 px-1.5 bg-slate-800 text-cyan-300 rounded">
                                #{tag}
                              </span>
                            ))
                          : typeof actualMetadata.tags === 'string' 
                            ? actualMetadata.tags.split(',').map((tag: string, i: number) => (
                                <span key={i} className="inline-block mr-2 mb-1 px-1.5 bg-slate-800 text-cyan-300 rounded">
                                  #{tag.trim()}
                                </span>
                              ))
                            : <span>No tags available</span>
                        }
                      </div>
                    </>
                  )}
                  
                  {/* Citation */}
                  {actualMetadata?.fullCitation && (
                    <>
                      <p className="text-purple-300 mt-3">┌─ Citation ────────────────────────────┐</p>
                      <div className="bg-slate-800 p-2 rounded border-l-2 border-yellow-500 text-slate-300 mt-1">
                        {actualMetadata.fullCitation}
                      </div>
                    </>
                  )}
                  
                  {/* Research Goals */}
                  {actualMetadata?.researchGoals && (
                    <>
                      <p className="text-purple-300 mt-3">┌─ Research Goals ───────────────────┐</p>
                      <div className="bg-slate-800 p-2 rounded border-l-2 border-green-500 text-slate-300 mt-1">
                        {actualMetadata.researchGoals}
                      </div>
                    </>
                  )}
                </div>
                <p className="text-green-400 mt-3"> <span className="animate-pulse">█</span></p>
              </div>
              {/* ASCII terminal display end */}
            </div>
          </div>
        </div>
        
        {/* Footer with action buttons */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-md transition-colors text-sm font-medium"
          >
            Close
          </button>
        </div>
      </div>

      {/* Add animations for the modal */}
      <style jsx global>{`
        @keyframes modalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes modalSlideIn {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        .modal-fade-in {
          animation: modalFadeIn 0.3s ease-out forwards;
        }
        
        .modal-slide-in {
          animation: modalSlideIn 0.3s ease-out forwards;
        }
        
        .animate-in {
          animation-duration: 0.3s;
          animation-timing-function: ease-out;
          animation-fill-mode: forwards;
        }
        
        .fade-in {
          animation-name: modalFadeIn;
        }
        
        .zoom-in-105 {
          animation-name: zoomIn105;
        }
        
        @keyframes zoomIn105 {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}