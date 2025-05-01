// components/ui/DocumentPortraitModal.tsx
// Modal component that displays an expanded view of document information with rich visuals
// Features dynamic background based on document era, source metadata display, and notes indicator
// Supports fullscreen image expansion for both document thumbnails and location backgrounds

'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useAppStore, Note } from '@/lib/store';
import { extractCentury, getPrioritizedImagePaths } from './LocationBackgroundUtils';
import { useLibraryStorage } from '@/lib/libraryStorageProvider';

interface DocumentPortraitModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceFile?: File | null;
  sourceType?: 'text' | 'pdf' | 'image' | 'audio' | null;  
  metadata?: any;
  portraitUrl?: string;
  portraitEmoji?: string | null;
  darkMode?: boolean;
  onAnalyze?: () => void;  // Added callback for analyze button
  onEdit?: (e?: React.MouseEvent) => void;  // Added callback for edit button
  notesCount?: number;
}

export default function DocumentPortraitModal({
  isOpen,
  onClose,
  sourceFile,
  sourceType,
  metadata,
  portraitUrl,
  portraitEmoji,
  darkMode = false,
  onAnalyze,
  onEdit
}: DocumentPortraitModalProps) {
  // Add state for image expansion and related UI controls
  const [isImageExpanded, setIsImageExpanded] = useState(false);
  const [headerBackgroundImage, setHeaderBackgroundImage] = useState<string | null>(null);
  const [isLocationImageExpanded, setIsLocationImageExpanded] = useState(false);
  const [sourceNotes, setSourceNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Get store data if props not provided
  const store = useAppStore();
  const { getItems } = useLibraryStorage();
  const actualSourceFile = sourceFile || store.sourceFile;
  const actualSourceType = sourceType || store.sourceType;
  const actualMetadata = metadata || store.metadata || {};
  const thumbnailUrl = portraitUrl || store.sourceThumbnailUrl;
  
  // For source identification (needed for notes)
  const sourceId = React.useMemo(() => {
    return actualMetadata?.title 
      ? `${actualMetadata.title}-${actualMetadata.author || 'unknown'}-${actualMetadata.date || 'undated'}`
      : '';
  }, [actualMetadata]);

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

  // Load notes associated with this source
  useEffect(() => {
    const loadNotes = async () => {
      if (!sourceId) return;

      try {
        setIsLoading(true);
        const allNotes = await getItems<Partial<Note>>('notes'); // more accurate type

        // Filter for valid notes
        function isValidNote(note: Partial<Note>): note is Note {
          return (
            typeof note.id === 'string' &&
            typeof note.content === 'string' &&
            typeof note.sourceId === 'string' &&
            typeof note.lastModified === 'number'
          );
        }

        const matchingNotes = allNotes.filter(note => {
          if (!note.sourceId || !note.sourceMetadata) return false;
          return (
            note.sourceId === sourceId ||
            (note.sourceMetadata.title === actualMetadata.title &&
             note.sourceMetadata.author === actualMetadata.author)
          );
        });

        const validNotes = matchingNotes.filter(isValidNote);
        setSourceNotes(validNotes);
      } catch (error) {
        console.error('Error loading notes for source:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) loadNotes();
  }, [isOpen, sourceId, getItems, actualMetadata]);


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
      const imagePaths = getPrioritizedImagePaths(date, location);
      
      for (const path of imagePaths) {
        try {
          const exists = await checkImageExists(path);
          if (exists) {
            setHeaderBackgroundImage(path);
            return;
          }
        } catch (error) {
          console.error(`Error checking image path ${path}:`, error);
        }
      }
      
      // No image found
      setHeaderBackgroundImage(null);
    };

    findBestImage();
  }, [actualMetadata]);

  // Handle keyboard and scroll behavior when modal is open
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isLocationImageExpanded) {
          setIsLocationImageExpanded(false);
        } else if (isImageExpanded) {
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
  }, [isOpen, onClose, isImageExpanded, isLocationImageExpanded]);

  // Close if clicking outside the modal content
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      if (isLocationImageExpanded) {
        setIsLocationImageExpanded(false);
      } else if (isImageExpanded) {
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

  // Toggle location image expansion
  const toggleLocationImageExpansion = () => {
    setIsLocationImageExpanded(!isLocationImageExpanded);
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
      className="fixed inset-0 z-5000 overflow-y-auto animate-in slide-in-from-top duration-300"
      aria-labelledby="document-portrait-modal"
      role="dialog"
      aria-modal="true"
    >
      {/* Expanded location image overlay */}
      {isLocationImageExpanded && headerBackgroundImage && (
        <div 
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-90 p-4"
          onClick={() => setIsLocationImageExpanded(false)}
        >
          <div className="relative w-full max-w-5xl overflow-hidden rounded-lg shadow-2xl flex flex-col ">
            <div className="relative h-[75vh] w-full bg-black ">
              <Image 
                src={headerBackgroundImage}
                alt={`${actualMetadata?.placeOfPublication || 'Location'}, ${formatDate(actualMetadata?.date || '')}`}
                fill
                className="object-contain"
                priority
                sizes="(max-width: 1280px) 100vw, 1280px"
              />
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/50 to-transparent text-white">
              <h3 className="text-xl font-bold text-white">
                {actualMetadata?.placeOfPublication || "Historical location"}, 
                {formatDate(actualMetadata?.date || '')}
              </h3>
              
              <p className="text-sm text-gray-300 italic mt-1">
                AI-generated historical representation
              </p>
            </div>
            
            {/* Close button */}
            <button 
              className="absolute top-2 right-2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
              onClick={() => setIsLocationImageExpanded(false)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Expanded document image overlay */}
      {isImageExpanded && thumbnailUrl && (
        <div 
          className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4 animate-in slide-in-from-top duration-300"
          onClick={() => setIsImageExpanded(false)}
        >
          <div className="max-w-7xl w-full h-full flex flex-col md:flex-row overflow-hidden">
            {/* Citation panel on the left */}
            <div className="md:w-1/4 bg-black/60 backdrop-blur-md p-4 rounded-lg md:mr-4 mb-4 md:mb-0 hidden md:block">
              <h3 className="text-xl font-semibold text-white mb-4 border-b border-white/20 pb-2">
                Source Information
              </h3>
              
              <pre className="text-gray-300 text-sm whitespace-pre-wrap font-mono mb-6">
                {getCitationText()}
              </pre>
              
              {/* Display full citation if available */}
              {actualMetadata?.fullCitation && (
                <div className="mt-4 p-3 bg-white/10 rounded-lg">
                  <h4 className="text-lg font-semibold text-white mb-2">
                    Citation
                  </h4>
                  
                  <p className="text-xs text-gray-300 italic font-mono">
                    {actualMetadata.fullCitation}
                  </p>
                </div>
              )}
              
              {/* Display viewing instructions */}
              <div className="absolute bottom-4 text-white/60 text-xs italic">
                Click image to close • ESC to exit
              </div>
            </div>
            
            {/* Image container */}
            <div className="flex-1 relative flex items-center justify-center">
              <Image 
                src={thumbnailUrl}
                alt={actualMetadata?.title || 'Document thumbnail'}
                className="object-contain max-h-[90vh] rounded-lg"
                width={1200}
                height={900}
                priority
                onClick={() => setIsImageExpanded(false)}
              />
              
              {/* Mobile citation overlay (only on small screens) */}
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-black/60 text-white text-center text-sm md:hidden">
                {actualMetadata?.title || ''} • {actualMetadata?.author || ''} • {formatDate(actualMetadata?.date || '')}
              </div>
              
              <button 
                className="absolute top-2 right-2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors md:hidden"
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
        className="fixed inset-0 bg-black/70 backdrop-blur-sm overflow-y-auto"
        onClick={handleBackdropClick}
      >
        <div 
          className={`relative w-11/12 max-w-5xl mx-auto my-8 rounded-xl shadow-2xl ${
            darkMode ? 'bg-slate-900 text-slate-200' : 'bg-white text-slate-800'
          } overflow-hidden`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with background image if available */}
          <div className="relative overflow-hidden h-32 sm:h-40">
            {/* Background image layer */}
            {headerBackgroundImage && (
              <div className="absolute inset-0">
                <Image 
                  src={headerBackgroundImage}
                  alt={`${actualMetadata?.placeOfPublication || 'Location'}, ${formatDate(actualMetadata?.date || '')}`}
                  fill
                  className="object-cover"
                  priority
                />
                
                {/* Gradient overlay that transitions more gradually */}
                <div className={`absolute inset-0 ${
                  darkMode 
                    ? 'bg-gradient-to-r from-slate-900/95 via-slate-900/70 to-slate-900/30'
                    : 'bg-gradient-to-r from-white/95 via-white/70 to-white/30'
                }`}></div>
              </div>
            )}


            
            {/* Header content */}
            <div className="relative z-10 h-full flex items-center justify-between px-6">
              <div className="flex items-center space-x-2">
                <div className={`text-2xl sm:text-3xl font-bold ${
                  darkMode ? 'text-white' : 'text-slate-700'
                } flex items-center`}>
                  {headerBackgroundImage && (
                    <span className="mr-2  text-indigo-400"></span>
                  )}
                  Source Details
                </div>
                
                {/* Document description phrase */}
                {actualMetadata && (
                  <div className={`hidden sm:flex items-center space-x-2 ${
                    darkMode ? 'text-slate-400' : 'text-slate-600'
                  } text-lg font-mono italic`}>
                    /
                    <span className="rounded-full px-3 ml-3 py-0.5 bg-slate-100/50 text-slate-800 ">
                      {getDocumentDescription(actualMetadata)}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                {/* Location image button */}
                {headerBackgroundImage && (
                  <button 
                    onClick={toggleLocationImageExpansion}
                    className={`p-2 rounded-lg ${
                      darkMode 
                        ? 'bg-slate-800/70 text-slate-300 hover:bg-slate-700' 
                        : 'bg-white/70 text-slate-600 hover:bg-white'
                    } shadow-sm transition-all group relative`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    
                    {/* Tooltip that appears on hover */}
                    <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      View full location image
                    </div>
                  </button>
                )}
                
                {/* Close button */}
                <button 
                  onClick={onClose}
                  className={`p-2 rounded-lg ${
                    darkMode 
                      ? 'bg-slate-800/70 text-slate-300 hover:bg-slate-700 hover:text-white' 
                      : 'bg-white/70 text-slate-600 hover:bg-white hover:text-slate-900' 
                  } shadow-sm transition-all`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className={darkMode ? 'border-t border-slate-800' : 'border-t border-slate-200'}></div>
          
          {/* Modal Body - Two Column Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-4">
            {/* Left Column - Visual */}
            <div className="flex flex-col items-center justify-start space-y-4">
              {/* Large Portrait/Image */}
              <div className="relative w-full max-w-xs h-100 flex items-center justify-center">
                {thumbnailUrl ? (
                  <div 
                    className={`relative w-full h-full rounded-lg overflow-hidden border-2 ${
                      darkMode ? 'border-slate-700 shadow-xl' : 'border-slate-200 shadow-lg'
                    } cursor-pointer group`}
                    onClick={toggleImageExpansion}
                  >
                    <Image 
                      src={thumbnailUrl}
                      alt={actualMetadata?.title || 'Document thumbnail'}
                      fill
                      className="object-cover"
                    />
                    
                    {/* Zoom icon overlay that appears on hover */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100">
                      <div className="bg-white/90 rounded-full p-2 transform scale-0 group-hover:scale-100 transition-all duration-200">
                        <svg className="w-5 h-5 text-slate-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                ) : (actualMetadata?.documentEmoji || portraitEmoji) ? (
                  <div className={`w-full h-full rounded-lg flex items-center justify-center text-6xl sm:text-7xl ${
                    darkMode ? 'bg-slate-800' : 'bg-slate-100'
                  }`}>
                    {actualMetadata?.documentEmoji || portraitEmoji || '📄'}
                  </div>
                ) : (
                  <div className={`w-full h-full rounded-lg flex items-center justify-center ${
                    darkMode ? 'bg-slate-800' : 'bg-slate-100'
                  }`}>
                    <svg className="w-16 h-16 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                )}
              </div>
              
              {/* Document Title & Author */}
              <h2 className={`text-xl font-bold text-center max-w-md ${
                darkMode ? 'text-slate-200' : 'text-slate-800'
              }`}>
                {actualMetadata?.title || "Untitled Document"}
              </h2>
              
              {actualMetadata?.author && (
                <p className={`text-lg ${
                  darkMode ? 'text-slate-400' : 'text-slate-600'
                } text-center`}>
                  by {actualMetadata.author}
                </p>
              )}
              
              {/* Publication Info */}
              <div className="flex flex-wrap justify-center gap-2">
                {actualMetadata?.date && (
                  <div className={`flex items-center px-3 py-1.5 rounded-full text-sm ${
                    darkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
                  }`}>
                    <svg className="w-4 h-4 mr-1.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {formatDate(actualMetadata.date)}
                  </div>
                )}
                
                {actualMetadata?.placeOfPublication && (
                  <div className={`flex items-center px-3 py-1.5 rounded-full text-sm ${
                    darkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
                  }`}>
                    <svg className="w-4 h-4 mr-1.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {actualMetadata.placeOfPublication}
                  </div>
                )}
              </div>
              
              {/* Notes indicator */}
              {sourceNotes.length > 0 && (
                <div className={`mt-2 px-4 py-2 rounded-lg ${
                  darkMode 
                    ? 'bg-indigo-900/20 border border-indigo-900/30' 
                    : 'bg-indigo-50 border border-indigo-100'
                }`}>
                  <div className="flex items-center">
                    <div className="relative mr-2">
                      <svg className={`w-5 h-5 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <div className={`absolute -top-1 -right-1 h-4 w-4 rounded-full flex items-center justify-center ${
                        darkMode ? 'bg-indigo-700 text-indigo-200' : 'bg-indigo-600 text-white'
                      } text-xs font-bold`}>
                        {sourceNotes.length}
                      </div>
                    </div>
                    <span className={`text-sm font-medium ${darkMode ? 'text-indigo-300' : 'text-indigo-700'}`}>
                      {sourceNotes.length} {sourceNotes.length === 1 ? 'note' : 'notes'} associated with this source
                    </span>
                  </div>
                  <p className={`text-xs mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    Notes will be available when analyzing this source
                  </p>
                </div>
              )}
              
              {/* Action buttons */}
              <div className="flex flex-wrap justify-center gap-2 w-full mt-2">
                {onAnalyze && (
                  <button
                    onClick={onAnalyze}
                    className={`flex-1 px-4 py-2 rounded-lg flex items-center justify-center ${
                      darkMode 
                        ? 'bg-indigo-700 hover:bg-indigo-600 text-white' 
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    } transition-colors text-sm font-medium`}
                  >
                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    Analyze Source
                  </button>
                )}
                
                {onEdit && (
                  <button
                    onClick={onEdit}
                    className={`flex-1 px-4 py-2 rounded-lg flex items-center justify-center ${
                      darkMode 
                        ? 'bg-slate-700 hover:bg-slate-600 text-slate-200' 
                        : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                    } transition-colors text-sm font-medium`}
                  >
<svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Edit Metadata
                  </button>
                )}
              </div>
            </div>
            
            {/* Right Column - Terminal-style Metadata */}
            <div className="w-full h-full overflow-y-auto">
              <div className={`font-mono text-sm ${
                darkMode ? 'bg-slate-900 text-slate-100' : 'bg-slate-700 text-white'
              } rounded-lg p-4 shadow-inner overflow-x-auto h-full max-h-[65vh]`}>
                {/* Terminal header */}
                <div className="flex items-center mb-3 text-slate-400 border-b border-slate-100 pb-2">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="font-bold">Metadata</span>
                  <span className="ml-auto text-xs opacity-60">SourceLens</span>
                </div>
                
                {/* ASCII terminal display start */}
                <div className="space-y-1">
                  <div className="pl-2 border-l-2 border-slate-700 mt-2">
                    <p className="text-yellow-300">┌─ Source Data ───────────────────┐</p>
                    <p><span className="text-blue-300">title:</span> {actualMetadata?.title || 'Untitled Document'}</p>
                    <p><span className="text-blue-300">author:</span> {actualMetadata?.author || 'Unknown'}</p>
                    <p><span className="text-blue-300">date:</span> {formatDate(actualMetadata?.date || '')}</p>
                    {actualMetadata?.genre && <p><span className="text-blue-300">genre:</span> {actualMetadata.genre}</p>}
                    {actualMetadata?.documentType && <p><span className="text-blue-300">type:</span> {actualMetadata.documentType}</p>}
                    {actualMetadata?.placeOfPublication && <p><span className="text-blue-300">location:</span> {actualMetadata.placeOfPublication}</p>}
                    
                    <p className="text-purple-300 mt-2">┌─ Technical Details ──────┐</p>
                    <p><span className="text-blue-300">source_type:</span> {actualSourceType || 'text'}</p>
                    <p><span className="text-blue-300">file_type:</span> {actualSourceFile?.type || 'N/A'}</p>
                    <p><span className="text-blue-300">file_size:</span> {actualSourceFile?.size ? `${Math.round(actualSourceFile.size / 1024)} KB` : 'N/A'}</p>
                    <p><span className="text-blue-300">content_size:</span> {contentSizeKB} KB</p>
                    <p><span className="text-blue-300">word_count:</span> ~{wordCount} words</p>
                    <p><span className="text-blue-300">chars:</span> {store.sourceContent?.length || 0} characters</p>
                    
                    {/* Notes info */}
                    {sourceNotes.length > 0 && (
                      <>
                        <p className="text-yellow-300 mt-2">┌─ Research Notes ───────────┐</p>
                        <p className="flex items-center">
                          <span className="text-blue-300">notes_count:</span> 
                          <span className="ml-2 px-2 py-0.5 bg-indigo-900/40 text-indigo-300 rounded text-xs flex items-center">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            {sourceNotes.length} {sourceNotes.length === 1 ? 'note' : 'notes'}
                          </span>
                        </p>
                        <p><span className="text-blue-300">last_modified:</span> {sourceNotes.length > 0 ? new Date(Math.max(...sourceNotes.map(n => n.lastModified))).toLocaleString() : 'N/A'}</p>
                      </>
                    )}
                    
                    {actualMetadata?.academicSubfield && (
                      <>
                        <p className="text-purple-300 mt-2">┌─ Research Context ──────────────────┐</p>
                        <p><span className="text-blue-300">field:</span> {actualMetadata.academicSubfield}</p>
                      </>
                    )}
                    
                    {actualMetadata?.tags && (
                      <>
                        <p className="text-purple-300 mt-2">┌─ Tags ──────────────────────────┐</p>
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
                        <p className="text-purple-300 mt-2">┌─ Citation ────────────────────────────────┐</p>
                        <div className="bg-slate-800 p-2 rounded border-l-2 border-yellow-500 text-slate-300 mt-1">
                          {actualMetadata.fullCitation}
                        </div>
                      </>
                    )}
                    
                    {/* Research Goals */}
                    {actualMetadata?.researchGoals && (
                      <>
                        <p className="text-purple-300 mt-3">┌─ Research Goals ────────────────────┐</p>
                        <div className="bg-slate-800 p-2 rounded border-l-2 border-green-500 text-slate-300 mt-1">
                          {actualMetadata.researchGoals}
                        </div>
                      </>
                    )}
                  </div>
                  <p className="text-green-400 mt-3"><span className="animate-pulse">█</span></p>
                </div>
                {/* ASCII terminal display end */}
              </div>
            </div>
          </div>
          
          {/* Footer with action buttons */}
          <div className={`p-4 border-t ${
            darkMode ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-slate-50'
          } flex justify-between`}>
            {/* Left side - stats */}
            <div className={`flex items-center ${darkMode ? 'text-slate-400' : 'text-slate-500'} text-xs`}>
              {sourceNotes.length > 0 && (
                <div className="flex items-center mr-4">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  {sourceNotes.length} notes
                </div>
              )}
              
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                {contentSizeKB} KB
              </div>
            </div>
            
            {/* Right side - close button */}
            <button
              onClick={onClose}
              className={`px-4 py-2 rounded-md ${
                darkMode 
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200' 
                  : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
              } text-sm font-medium transition-colors`}
            >
              Close
            </button>
          </div>
        </div>
      </div>

     
    </div>
  );
}

