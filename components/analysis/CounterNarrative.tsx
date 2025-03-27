// components/analysis/CounterNarrative.tsx
// Enhanced counter-narrative component with reliable lens initialization
// Displays conventional reading and alternative perspectives with distinct visual styles

import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import ReactMarkdown from 'react-markdown';
import Image from 'next/image';
import LensModal from './LensModal';

// Define the available lens types
export type LensType = 'voice' | 'place' | 'provenance';

export default function CounterNarrative() {
  // App state
  const { counterNarrative, isLoading, setLoading, metadata, sourceContent, llmModel } = useAppStore();
  
  // Component state - order is important for React Hooks
  const [activeLens, setActiveLens] = useState<LensType | null>(null);
  const [lensNarrative, setLensNarrative] = useState<string>('');
  const [lensInstructions, setLensInstructions] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);

  // Parse the counter-narrative into sections
  const conventionalMatch = counterNarrative ? counterNarrative.match(/## Conventional Reading\s+([\s\S]*?)(?=##|$)/) : null;
  const conventionalReading = conventionalMatch ? conventionalMatch[1].trim() : '';
  
  const alternativeMatch = counterNarrative ? counterNarrative.match(/## Alternative Perspectives\s+([\s\S]*?)(?=##|$)/) : null;
  const alternativePerspectives = alternativeMatch ? alternativeMatch[1].trim() : '';
  
  // Extract list items from Alternative Perspectives if they exist
  const listItems: string[] = [];
  if (alternativePerspectives) {
    const listMatches = alternativePerspectives.match(/\*\s+([\s\S]*?)(?=\*\s+|$)/g);
    if (listMatches) {
      listMatches.forEach(item => {
        // Clean up the list item markers
        const cleanItem = item.replace(/^\*\s+/, '').trim();
        if (cleanItem) {
          listItems.push(cleanItem);
        }
      });
    }
  }
  
  // Main content if no list items were found
  const mainContent = listItems.length === 0 ? alternativePerspectives : '';

  // Function to generate lens narrative - consistent with hooks
  const generateLensNarrative = async (lensType: LensType, instructions: string = '') => {
    if (isInitializing) return; // Prevent duplicate calls during initialization
    
    setLoading(true);
    try {
      const response = await fetch('/api/counter-narrative', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source: sourceContent,
          metadata,
          lensType,
          instructions,
          model: llmModel
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
      }
      
      const data = await response.json();
      setLensNarrative(data.narrative);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Lens narrative error:', error);
    } finally {
      setLoading(false);
      setIsInitializing(false);
    }
  };
  
  // Close modal handler
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };
  
  // Handle lens button click
  const handleLensClick = (lensType: LensType) => {
    setActiveLens(lensType);
    setLensInstructions('');
    generateLensNarrative(lensType);
  };
  
  // Special lens initialization effect - ALWAYS runs, but only acts when needed
  useEffect(() => {
  // Get any special lens request from store
  const specialLensRequest = useAppStore.getState().specialLensRequest;
  
  if (specialLensRequest && specialLensRequest.lensType) {
    // Mark as initializing to prevent duplicate calls
    setIsInitializing(true);
    
    // Set the active lens - add type assertion here
    const lensType = specialLensRequest.lensType as LensType;
    setActiveLens(lensType);
    
    // Set instructions if provided
    if (specialLensRequest.instructions) {
      setLensInstructions(specialLensRequest.instructions);
    }
    
    // Clear the request from store to prevent future triggers
    useAppStore.getState().setSpecialLensRequest(null);
    
    // Generate the narrative if instructions are provided
    if (specialLensRequest.instructions && lensType) {
      // Short delay to ensure component is fully mounted
      setTimeout(() => {
        generateLensNarrative(
          lensType, // Use the type-asserted variable
          specialLensRequest.instructions || ''
        );
      }, 300);
    } else {
      // Just open the modal without generating if no instructions
      setIsModalOpen(true);
      setIsInitializing(false);
    }
  }
}, [counterNarrative]); // Only run when counterNarrative changes

  // Placeholder when no counter-narrative is available
  if (!counterNarrative) {
    return (
      <div className="flex flex-col items-center justify-center py-4 text-center">
        <svg className="w-16 h-16 text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m-4 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
        <p className="text-slate-500 max-w-md">
          Click "Generate Counter-Narrative" in the tools panel to see an alternative interpretation of this source.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Conventional Reading section */}
      {conventionalReading && ( 
        <div className="bg-blue-100/50 rounded-lg border-b border-blue-200 shadow-md">
          <div className="border-b border-dashed border-slate-300 px-3 py-2 bg-slate-100 flex items-center">
            <svg className="w-5 h-5 mr-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="font-medium text-blue-900">Conventional Reading</h3>
          </div>
          <div className="p-3">
            <div className="prose font-medium prose-slate max-w-none text-slate-700 leading-relaxed">
              <p>{conventionalReading}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Alternative Perspectives section */}
      <div className="">
        <div className="border-b border-purple-200 px-5 py-2 mt-2 bg-gradient-to-r from-purple-100 to-slate-50">
          <h3 className="font-medium text-purple-900">Alternative Perspectives</h3>
        </div>
        <div className="p-4">
          {mainContent ? (
            <div className="prose prose-slate max-w-none text-slate-800 leading-relaxed text-lg">
              <ReactMarkdown>{mainContent}</ReactMarkdown>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Format the initial paragraph before the list */}
              {alternativePerspectives.split('*')[0].trim() && (
                <div className="leading-relaxed text-md italic">
                  <p>{alternativePerspectives.split('*')[0].trim()}</p>
                </div>
              )}
              
              {/* List items with beautiful styling */}
              <ul className="space-y-3">
                {listItems.map((item, index) => {
                  // Check for bolded section headers in the list item
                  const headingMatch = item.match(/\*\*(.*?)\*\*/);
                  const heading = headingMatch ? headingMatch[1] : null;
                  
                  // Remove the heading from the content if found
                  let content = item;
                  if (heading) {
                    content = content.replace(/\*\*(.*?)\*\*\s*:/, '').trim();
                  }
                  
                  return (
                    <li key={index} className="bg-slate-50 rounded-lg p-2 border border-slate-100 shadow-sm">
                      {heading && (
                        <h4 className="font-medium text-purple-800 mb-2">{heading}</h4>
                      )}
                      <div className="prose prose-sm prose-slate max-w-none">
                        <ReactMarkdown>{content}</ReactMarkdown>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </div>
      
      {/* Lens selection section */}
      <div className="relative py-1">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-slate-200"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="px-3 bg-white text-sm text-slate-600 rounded-full">
            Interpretive Lenses (select one below)
          </span>
        </div>
      </div>
      
      {/* Lens buttons */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <LensButton 
          title="Voice" 
          description="First-person perspective of someone mentioned but silenced"
          imageSrc="/voicelens.jpg" 
          onClick={() => handleLensClick('voice')}
          disabled={isLoading}
          data-lens="voice"
        />
        
        <LensButton 
          title="Place" 
          description="The landscape or location as a sentient observer"
          imageSrc="/placelens.jpg" 
          onClick={() => handleLensClick('place')}
          disabled={isLoading}
          data-lens="place"
        />
        
        <LensButton 
          title="Provenance" 
          description="How this source was created, preserved, and what was excluded"
          imageSrc="/provenancelens.jpg" 
          onClick={() => handleLensClick('provenance')}
          disabled={isLoading}
          data-lens="provenance"
        />
      </div>
      
      {/* Methodological notes */}
      <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
        <h3 className="text-sm font-medium text-slate-700 mb-2 flex items-center">
          <svg className="w-4 h-4 mr-1 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          About Counter-Narratives
        </h3>
        <p className="text-xs text-slate-600">
          Counter-narratives offer alternative interpretations that challenge conventional readings.
          They reveal hidden power dynamics, marginalized perspectives, and overlooked 
          dimensions of historical texts. This analysis attempts to read "against the grain" 
          to uncover possible meanings that might otherwise remain invisible. Try the interpretive
          lenses above to explore even more perspectives.
        </p>
      </div>
      
      {/* Modal for lens narratives */}
      {isModalOpen && activeLens && (
        <LensModal
          isOpen={isModalOpen}
          lensType={activeLens}
          onClose={handleCloseModal}
          instructions={lensInstructions}
        />
      )}
    </div>
  );
}

// Lens Button Component
interface LensButtonProps {
  title: string;
  description: string;
  imageSrc: string;
  onClick: () => void;
  disabled?: boolean;
  'data-lens'?: string;
}

function LensButton({ title, description, imageSrc, onClick, disabled = false, ...props }: LensButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="relative flex flex-col items-center group transition-all duration-300 transform hover:scale-[1.02] focus:scale-[1.02] hover:shadow-lg focus:shadow-lg focus:outline-none disabled:opacity-50 disabled:pointer-events-none"
      {...props}
    >
      <div className="rounded-xl overflow-hidden shadow-md border border-slate-200 bg-white w-full aspect-square relative">
        {/* Image overlay with gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/40 to-slate-900/0 z-10"></div>
        
        {/* Image */}
        <div className="relative h-full w-full">
          <Image
            src={imageSrc}
            alt={`${title} Lens`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-all duration-500 group-hover:scale-[1.05] group-focus:scale-[1.05]"
          />
        </div>
        
        {/* Content overlay */}
        <div className="absolute inset-x-0 bottom-0 p-4 z-20 text-white">
          <h3 className="font-bold text-lg">{title}</h3>
          <p className="text-xs text-white/90 mt-1 line-clamp-2">{description}</p>
        </div>
        
        {/* Disabled overlay */}
        {disabled && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-800/50 z-30">
            <div className="w-6 h-6 border-2 border-white/30 border-t-white/80 rounded-full animate-spin"></div>
          </div>
        )}
      </div>
      
      {/* Hover effect indicator at bottom */}
      <div className="h-1 bg-gradient-to-r from-indigo-400 to-purple-400 w-0 mt-1 rounded transition-all duration-300 group-hover:w-full group-focus:w-full"></div>
    </button>
  );
}