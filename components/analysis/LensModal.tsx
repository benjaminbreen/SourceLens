// components/analysis/LensModal.tsx
// Handles display of interpretive lens narratives with rich visual presentation
// Uses enhanced visual styling with background images specific to this component

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import { useAppStore } from '@/lib/store';

// Define the available lens types
export type LensType = 'voice' | 'place' | 'provenance';

// Icon components for better visual hierarchy
const CloseIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;
const GenerateIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
const LoadingSpinner = () => <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;

interface LensModalProps {
  isOpen: boolean;
  lensType: LensType;
  onClose: () => void;
  instructions?: string; // Add this line
  content?: string; // Make this optional if it's not always passed
  sourceMetadata?: any; // Make this optional if it's not always passed
}

// Lens descriptions
const lensInfo = {
  voice: { title: 'Silenced Voice', imageSrc: '/voicelens.jpg', description: 'Adopt the first-person perspective of someone mentioned (or implied) but not given voice in the source.' },
  place: { title: 'Place as Witness', imageSrc: '/placelens.jpg', description: 'Narrate from the perspective of the landscape, location, or structure as a sentient observer.' },
  provenance: { title: 'Historical Provenance', imageSrc: '/provenancelens.jpg', description: 'Explore how the source was created, preserved, studied, and what might have been excluded.' },
};

// Helper function to normalize location for background images
const normalizeLocation = (locationStr?: string): string => {
  if (!locationStr) return '';
  
  const locationMap: Record<string, string> = {
    'united states': 'us',
    'usa': 'us',
    'america': 'us',
    'france': 'france',
    'paris': 'france',
    'england': 'uk',
    'britain': 'uk',
    'united kingdom': 'uk',
    'italy': 'italy',
    'rome': 'italy',
    'germany': 'germany',
    'spain': 'spain',
    'russia': 'russia',
    'china': 'china',
    'japan': 'japan',
    'india': 'india',
    'egypt': 'egypt',
    'greece': 'greece',
  };
  
  // Extract location from string
  const parts = locationStr.toLowerCase().split(',');
  const lastPart = parts[parts.length - 1].trim();
  
  for (const key of Object.keys(locationMap)) {
    if (lastPart.includes(key)) {
      return locationMap[key];
    }
  }
  
  return lastPart;
};

// Helper function to extract century from date
const extractCentury = (dateStr: string): number => {
  // Check for BCE dates
  const isBCE = dateStr.toLowerCase().includes('bc') || 
                dateStr.toLowerCase().includes('bce');
  
  // Extract year number
  const yearMatch = dateStr.match(/\b(\d+)\b/);
  if (yearMatch) {
    const year = parseInt(yearMatch[1], 10);
    
    // Handle BCE dates
    if (isBCE) {
      if (year >= 1000) return -2; // Ancient (1000+ BCE)
      else return -1; // Antiquity (0-1000 BCE)
    }
    
    // For CE dates, get century
    const ceYearMatch = dateStr.match(/\b(\d{3,4})\b/);
    if (ceYearMatch) {
      return Math.ceil(parseInt(ceYearMatch[1], 10) / 100);
    }
  }
  
  return 19; // Default to 19th century
};

export default function LensModal({ isOpen, lensType, content, instructions = '', onClose, sourceMetadata }: LensModalProps) {
  // Initialize with the passed instructions
  const [localInstructions, setLocalInstructions] = useState(instructions);
  
  const { sourceContent, metadata, llmModel, setLoading: setGlobalLoading } = useAppStore();

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedNarrative, setGeneratedNarrative] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  const lensDetails = lensInfo[lensType];

  // Find appropriate background image based on metadata
  useEffect(() => {
    if (!metadata || !isOpen) return;
    
    let location = '';
    let century = 19;
    
    // For place lens, try to extract from title if we have generated narrative
    if (lensType === 'place' && generatedNarrative) {
      const titleMatch = generatedNarrative.match(/# The Witness of ([^:]+)/i);
      if (titleMatch && titleMatch[1]) {
        location = normalizeLocation(titleMatch[1]);
      }
    }
    
    // If no location from title, use metadata
    if (!location && metadata.placeOfPublication) {
      location = normalizeLocation(metadata.placeOfPublication);
    }
    
    // Get century from metadata date
    if (metadata.date) {
      century = extractCentury(metadata.date);
    }
    
    console.log(`Looking for background: century=${century}, location=${location}`);
    
    // Try several image paths in order of preference
    const testImagePaths = [
      `/locations/${century}${location}.jpg`,
      `/locations/${century}generic.jpg`,
      `/locations/generic${location}.jpg`,
      `/locations/default.jpg`,
      lensDetails.imageSrc, // Fallback to lens-specific image
    ];
    
    // Check each image path in sequence
    const testImage = async (paths: string[]) => {
      for (const path of paths) {
        try {
          // Simple check if image exists
          const res = await fetch(path, { method: 'HEAD' });
          if (res.ok) {
            setBackgroundImage(path);
            setImageError(false);
            return;
          }
        } catch (err) {
          // Continue to next path
        }
      }
      // If we get here, no images worked
      setImageError(true);
      setBackgroundImage(lensDetails.imageSrc);
    };
    
    testImage(testImagePaths);
  }, [metadata, lensType, isOpen, generatedNarrative, lensDetails.imageSrc]);

  // Reset state when modal opens or lensType changes
  useEffect(() => {
    if (isOpen) {
      // Only update instructions from prop if they're not empty
      if (instructions) {
        setLocalInstructions(instructions);
      }
      setGeneratedNarrative(content || null);
      setIsGenerating(false);
      setError(null);
      setImageError(false);
    }
  }, [isOpen, lensType, instructions, content]);

  // Body scroll lock
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  // Generate Narrative Function
  const handleGenerate = useCallback(async () => {
    if (!sourceContent || !metadata || isGenerating) return;

    setIsGenerating(true);
    setGlobalLoading(true);
    setError(null);
    setGeneratedNarrative(null);
    
    try {
      const response = await fetch('/api/counter-narrative', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: sourceContent,
          metadata,
          lensType,
          instructions: localInstructions.trim(), // Use localInstructions here
          modelId: llmModel
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API Error: ${response.status}`);
      }

      const data = await response.json();
      setGeneratedNarrative(data.narrative || 'No narrative generated.');

    } catch (err) {
      console.error('Lens narrative generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate narrative.');
    } finally {
      setIsGenerating(false);
      setGlobalLoading(false);
    }
  }, [sourceContent, metadata, lensType, localInstructions, llmModel, isGenerating, setGlobalLoading]);

  // Parse Generated Content
// Parse Generated Content
const processedContent = useMemo(() => {
  if (!generatedNarrative) return { title: '', narrative: '', explanation: '' };

  const titleMatch = generatedNarrative.match(/^# (.*?)(?:\n|$)/m) || generatedNarrative.match(/^## (.*?)(?:\n|$)/m);
  const title = titleMatch ? titleMatch[1].trim() : lensDetails.title;

  // Process the main content
  let mainContent = generatedNarrative;
  let narrative = '';
  let explanation = '';
  
  // Remove title if found
  if (titleMatch && titleMatch.index !== undefined) {
    mainContent = mainContent.substring(titleMatch.index + titleMatch[0].length).trim();
  }
  
  // First look for the styled "EXPLANATION" section
  const styledExplanationMatch = mainContent.match(/EXPLANATION\s+([\s\S]*?)(?:$|(?:\n#))/i);
  
  // Then look for the # Explanation marker
  const hashExplanationMatch = mainContent.match(/(?:^|\n)# Explanation\s+([\s\S]*?)(?:$|(?:\n#))/i);
  
  if (styledExplanationMatch && styledExplanationMatch.index !== undefined) {
    // Find the previous paragraph break before the styled explanation
    const beforeStyledExplanation = mainContent.substring(0, styledExplanationMatch.index);
    const lastParagraphBreak = beforeStyledExplanation.lastIndexOf('\n\n');
    
    // Set narrative to everything before the last paragraph break
    narrative = beforeStyledExplanation.substring(0, lastParagraphBreak > 0 ? lastParagraphBreak : beforeStyledExplanation.length).trim();
    
    // Use the styled explanation text
    explanation = styledExplanationMatch[1].trim();
  } else if (hashExplanationMatch && hashExplanationMatch.index !== undefined) {
    // Use the # Explanation format
    narrative = mainContent.substring(0, hashExplanationMatch.index).trim();
    explanation = hashExplanationMatch[1].trim();
  } else {
    // If no explanation marker, assume all content is narrative
    narrative = mainContent;
  }
  
  return { title, narrative, explanation };
}, [generatedNarrative, lensDetails.title]);



  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="lens-modal-title"
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
        onClick={e => e.stopPropagation()}
      >
        {/* Header with background image */}
        {generatedNarrative ? (
          // Results view header with background
          <div className="relative h-56 border-b border-slate-200 dark:border-slate-700">
            {/* Background image with enhanced styling */}
            <div className="absolute inset-0 bg-cover bg-center scale-110" 
                 style={{ 
                   backgroundImage: `url('${backgroundImage || lensDetails.imageSrc}')`,
                   filter: 'brightness(1.1) contrast(.6)'
                 }}>
            </div>
            
            {/* Gradient overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-transparent"></div>
            
            {/* Content overlay */}
            <div className="relative h-full z-10 p-6 flex flex-col justify-between">
              <div className="flex justify-between">
                <div className="flex-grow">
                  <h2 id="lens-modal-title" className="text-2xl font-bold text-white drop-shadow-md mb-2">
                    {processedContent.title}
                  </h2>
                  <p className="text-slate-100 italic text-shadow">
                    {lensDetails.description}
                  </p>
                </div>
                <button onClick={onClose} className="text-white hover:bg-white/20 rounded-full p-1.5 transition-colors self-start" aria-label="Close">
                  <CloseIcon />
                </button>
              </div>
              
              {/* Source metadata */}
              {metadata && (
                <div className="flex mt-auto text-sm text-white/90 space-x-2 bg-black/30 self-start px-3 py-1 rounded-full">
                  {metadata.author && <span>{metadata.author}</span>}
                  {metadata.author && metadata.date && <span>•</span>}
                  {metadata.date && <span>{metadata.date}</span>}
                </div>
              )}
            </div>
          </div>
        ) : (
          // Input view header (simpler)
          <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
            <h2 id="lens-modal-title" className="text-lg font-semibold text-slate-800 dark:text-slate-100 flex items-center">
              <div className="w-6 h-6 rounded-full mr-2 bg-cover bg-center" style={{ backgroundImage: `url(${lensDetails.imageSrc})` }}></div>
              Interpretive Lens: {lensDetails.title}
            </h2>
            <button onClick={onClose} className="text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full p-1.5 transition-colors" aria-label="Close">
              <CloseIcon />
            </button>
          </div>
        )}

        {/* Content Area (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {!generatedNarrative ? (
            // Input Step
            <>
              <div className="space-y-1">
                <h3 className="font-medium text-slate-700 dark:text-slate-300">Lens Description:</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 italic">{lensDetails.description}</p>
              </div>
              <div className="space-y-1">
                <label htmlFor="lens-instructions" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Specific Focus (Optional):
                </label>
                <textarea
                  id="lens-instructions"
                  rows={3}
                  value={localInstructions}
                  onChange={(e) => setLocalInstructions(e.target.value)}
                  placeholder={`e.g., imagine you are an archive...`}
                  className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm"
                  disabled={isGenerating}
                />
                <p className="text-xs text-slate-500 dark:text-slate-400">Provide specific guidance for the AI, or leave blank for a general interpretation.</p>
              </div>
              {error && (
                <p className="text-sm text-red-600 dark:text-red-400">Error: {error}</p>
              )}
            </>
          ) : (
            // Display Step - Carefully preserve all content
            <>
              {/* Narrative - using pre-wrapped text to preserve line breaks and formatting */}
            
{processedContent.narrative && (
  <div className="font text-lg text-slate-800 dark:text-slate-200 leading-relaxed italic space-y-4">
    {processedContent.narrative.split(/\n\n+/).map((paragraph, index) => {

       if (paragraph.trim().startsWith('# Explanation')) {
        return null;
      }
      // Check if paragraph starts with markdown header (##)
      if (paragraph.trim().startsWith('#')) {
        const headerText = paragraph.trim().replace(/^##\s+/, '');
        return (
          <div key={index} className="mt-6 mb-2">
            <h3 className="text-xl font-bold text-amber-800 dark:text-amber-300 not-italic">
              {headerText}
            </h3>
          </div>
        );
      }
      return <p key={index} className="whitespace-pre-wrap">{paragraph}</p>;
    })}
  </div>
)}
              
              {/* Explanation */}
            {processedContent.explanation && (
  <div className="bg-slate-100 dark:bg-slate-700/50 border-l-4 border-amber-500 dark:border-amber-400 p-4 rounded-r-md mt-6">
    <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-300 mb-2 uppercase tracking-wide">Explanation</h4>
    <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
      {processedContent.explanation}
    </div>
  </div>
)}
              
              {error && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-4">Error: {error}</p>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-800/50 flex justify-end items-center space-x-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors">
            {generatedNarrative ? 'Close' : 'Cancel'}
          </button>
          {!generatedNarrative && (
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !sourceContent}
              className={`px-5 py-2 text-sm font-semibold text-white rounded-md transition-colors flex items-center space-x-2 ${isGenerating || !sourceContent ? 'bg-slate-400 dark:bg-slate-600 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600'}`}
            >
              {isGenerating ? <LoadingSpinner /> : <GenerateIcon />}
              <span>{isGenerating ? 'Generating...' : 'Generate Narrative'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}