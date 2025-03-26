// components/analysis/LensModal.tsx
// Modal to display specialized interpretive lens counternarratives
// Uses a banner image that fades to background color with animated transitions
// Implements enhanced typography with custom formatting for italicized narrative and explanation sections

import React, { useEffect, useMemo } from 'react';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import { LensType } from './CounterNarrative';

interface LensModalProps {
  isOpen: boolean;
  lensType: LensType;
  content: string;
  onClose: () => void;
  sourceMetadata: any;
}

export default function LensModal({ isOpen, lensType, content, onClose, sourceMetadata }: LensModalProps) {
  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  
  // Handle clicking outside to close
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  
  // Press escape to close
  useEffect(() => {
    const handleEscKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    if (isOpen) {
      window.addEventListener('keydown', handleEscKeyPress);
    }
    
    return () => {
      window.removeEventListener('keydown', handleEscKeyPress);
    };
  }, [isOpen, onClose]);
  
  // Get lens-specific details
  const getLensDetails = () => {
    switch (lensType) {
      case 'voice':
        return {
          title: 'Silenced Voice',
          imageSrc: '/voicelens.jpg',
          description: 'First-person perspective of someone mentioned but not given voice in the source'
        };
      case 'place':
        return {
          title: 'Place as Witness',
          imageSrc: '/placelens.jpg',
          description: 'The landscape or structure as a sentient observer of events'
        };
      case 'provenance':
        return {
          title: 'Historical Provenance',
          imageSrc: '/provenancelens.jpg',
          description: 'The creation, preservation, and study of this source - and what was excluded'
        };
      default:
        return {
          title: 'Alternative Perspective',
          imageSrc: '/voicelens.jpg',
          description: 'An alternative interpretation of the source material'
        };
    }
  };
  
  const lensDetails = getLensDetails();
  
  // Process content to extract and format different sections
  const processedContent = useMemo(() => {
    if (!content) return { title: '', narrative: '', explanation: '' };
    
    // Extract title from content
    const titleMatch = content.match(/^# (.*)/m) || content.match(/^## (.*)/m);
    const title = titleMatch ? titleMatch[1] : lensDetails.title;
    
    // Extract narrative content (text in italics)
    let narrative = '';
    const italicMatches = content.match(/\*(.*?)\*/g) || [];
    
    if (italicMatches.length > 0) {
      // Combine all italic text, removing the asterisks
      narrative = italicMatches.map(match => match.replace(/^\*|\*$/g, '')).join('\n\n');
    } else {
      // If no italic text found, try to extract content between title and explanation
      const contentWithoutTitle = content.replace(/^#.*$/m, '').trim();
      const explanationMatch = contentWithoutTitle.match(/^#\s*Explanation/im);
      
      if (explanationMatch) {
        narrative = contentWithoutTitle.substring(0, explanationMatch.index).trim();
      } else {
        narrative = contentWithoutTitle;
      }
    }
    
    // Extract explanation section
    const explanationMatch = content.match(/(?:^|\n)#\s*Explanation\s*([\s\S]*?)(?:$|\n#)/i);
    const explanation = explanationMatch ? explanationMatch[1].trim() : '';
    
    return { title, narrative, explanation };
  }, [content, lensDetails.title]);
  
  if (!isOpen) return null;
  
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
        onClick={e => e.stopPropagation()}
      >
        {/* Banner image with gradient overlay that fades to white */}
        <div className="relative h-58 w-full">
          <Image
            src={lensDetails.imageSrc}
            alt={lensDetails.title}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-white"></div>
          
          {/* Title overlay */}
          <div className="absolute inset-x-0 bottom-0 p-6 text-center">
            <h2 className="text-4xl drop-shadow-md font-bold text-amber-100 leading-tight">
              {processedContent.title}
            </h2>
            <p className="text-2xl font-serif italic text-slate-100 mt-1">{lensDetails.description}</p>
            
            {/* Source metadata */}
            <div className="mt-2 flex items-center justify-center text-xs">
              {sourceMetadata?.author && (
                <span className="px-2 font-bold">{sourceMetadata.author}</span>
              )}
              {sourceMetadata?.date && (
                <>
                  <span className="h-1 w-1 rounded-full bg-slate-300 mx-1"></span>
                  <span className="px-2">{sourceMetadata.date}</span>
                </>
              )}
            </div>
          </div>
          
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 bg-black/30 text-white rounded-full p-1.5 hover:bg-black/50 transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 12rem)' }}>
          {/* Narrative section with enhanced typography */}
          {processedContent.narrative && (
            <div className="font-sans text-xl text-slate-800 leading-relaxed mb-6 italic">
              {processedContent.narrative.split('\n\n').map((paragraph, index) => (
                <p key={index} className="mb-6">{paragraph}</p>
              ))}
            </div>
          )}
          
          {/* Explanation section with special styling */}
          {processedContent.explanation && (
            <div className="bg-slate-100 border-l-4 border-amber-500 p-6 rounded-md shadow-sm">
              <h3 className="text-xl font-medium text-amber-900 mb-3">Explanation</h3>
              <div className="font-medium text-slate-800 leading-relaxed">
                {processedContent.explanation}
              </div>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="border-t border-slate-200 p-4 bg-slate-50 flex justify-between items-center">
          <div className="text-xs text-slate-500">
            Interpretive lens visualization • SourceLens
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}