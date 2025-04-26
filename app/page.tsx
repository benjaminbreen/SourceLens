'use client';

import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import HamburgerMenu from '@/components/ui/HamburgerMenu';
import AboutModal from '@/components/ui/AboutModal';
import FAQModal from '@/components/ui/FAQModal';
import { useAppStore, Metadata } from '@/lib/store';
import { demoTexts, demoExtractConfigs } from '@/lib/demoData';
import Footer from '@/components/ui/Footer';
import MetadataModal from '@/components/upload/MetadataModal';
import AccountButton from '@/components/auth/AccountButton';
import TopNavigation from '@/components/ui/TopNavigation';
import DemoButtons from '@/components/ui/DemoButtons';
import SourceUpload from '@/components/upload/SourceUpload';
import PrimaryActionButton from '@/components/ui/PrimaryActionButton';
import LensOptionsGrid from '@/components/ui/LensOptionsGrid';
import CosmicBackgroundFade from '@/components/ui/CosmicBackgroundFade';
import FeatureCarousel from '@/components/ui/FeatureCarousel';
import FeatureCardsBottom from '@/components/ui/FeatureCardsBottom';
import EnhancedDemoSection from '@/components/ui/EnhancedDemoSection';
import type { AppState } from '@/lib/store';
import { useTheme } from '@/components/theme/ThemeProvider';
import { DarkModeToggle } from '@/components/ui/DarkModeToggle';
import { Space_Grotesk } from 'next/font/google';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-space-grotesk',
});

// Main Page Export
export default function HomePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}

// Define the feature card data structure
interface FeatureCardData {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: {
    light: string;
    dark: string;
  };
  borderColor: {
    light: string;
    dark: string;
  };
  bgColor: {
    light: string;
    dark: string;
  };
  demoButtons: {
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
  }[];
  imageUrl?: string; // For animated GIF or static image
}

const MetadataAutoTimer = ({ onComplete, duration = 5, isDarkMode }: { onComplete: () => void, duration?: number, isDarkMode: boolean }) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [progress, setProgress] = useState(0);
  const isMountedRef = useRef(true);

  useEffect(() => {
    // Focus the parent element to enable Enter key capture
    const parentEl = document.getElementById('metadata-prompt-modal');
    if (parentEl) parentEl.focus();

    // Reset state on mount
    setTimeLeft(duration);
    setProgress(0);

    // Start countdown using a local variable for timeLeft to avoid stale state issues
    let currentTimeLeft = duration;
    const timer = setInterval(() => {
      if (isMountedRef.current) {
        currentTimeLeft -= 1;
        setTimeLeft(currentTimeLeft); // Update state for display

        const newProgress = ((duration - currentTimeLeft) / duration) * 100;
        setProgress(newProgress); // Update state for display

        if (currentTimeLeft <= 0) {
          clearInterval(timer);
          onComplete();
        }
      } else {
        clearInterval(timer); // Clear if unmounted
      }
    }, 1000);

    // Cleanup
    return () => {
      isMountedRef.current = false;
      clearInterval(timer);
    };

  }, [duration, onComplete]); // Keep dependencies minimal

  return (
    <div className="mb-3">
      <div className="flex justify-between items-center mb-1">
        <span className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Auto-applying in {timeLeft}s</span>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onComplete();
          }}
          className={`text-xs ${isDarkMode ? 'text-amber-500 hover:text-amber-400' : 'text-amber-700 hover:text-amber-900'} transition-colors`}
        >
          Apply now
        </button>
      </div>
      <div className={`w-full h-1 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'} rounded-full overflow-hidden`}>
        <div
          className="h-full bg-amber-500 transition-all duration-1000 ease-linear" // Use 1000ms for smoother progress
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
};

// Main Home Component
function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Destructure store values and functions
  const {
    setSourceContent,
    setMetadata,
    setLoading,
    isLoading,
    setActivePanel,
    setRoleplayMode,
    sourceThumbnailUrl,
    setSourceThumbnailUrl,
    setExtractInfoConfig,
    setDetailedAnalysis,
    setDetailedAnalysisLoaded,
    setHighlightedSegments,
    setHighlightQuery,
    setHighlightMode,
    setSpecialLensRequest,
    setCounterNarrative,
    llmModel,
    isDarkMode,
    toggleDarkMode,
  } = useAppStore();

  // State Management
  const [textInput, setTextInput] = useState('');
  const [metadata, setLocalMetadata] = useState<Metadata>({
    date: '',
    author: '',
    researchGoals: '',
    additionalInfo: '',
    title: '',
    summary: '',
    documentEmoji: '',
    documentType: '',
    genre: '',
    placeOfPublication: '',
    academicSubfield: '',
    tags: [],
    fullCitation: '',
    thumbnailUrl: null,
  });

  // UI state
  const [activeTab, setActiveTab] = useState('text');
  const [expandedFeature, setExpandedFeature] = useState<string | null>(null);
  const [formValid, setFormValid] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showFAQModal, setShowFAQModal] = useState(false);
  const [showMetadataModal, setShowMetadataModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(true);
  const [showSourceIndicator, setShowSourceIndicator] = useState(false);
  const [showCosmicBackground, setShowCosmicBackground] = useState(false);

  const [showCosmicBackgroundBottom, setShowCosmicBackgroundBottom] = useState(false);
const bottomSpaceRef = useRef<HTMLDivElement>(null);

  // Refs for feature cards and scrolling
  const featureCardsRef = useRef<HTMLDivElement>(null);
  const multiplesPerspectivesRef = useRef<HTMLDivElement>(null);
  const simulationModeRef = useRef<HTMLDivElement>(null);
  const counterNarrativeRef = useRef<HTMLDivElement>(null);
  const highlightTextRef = useRef<HTMLDivElement>(null);
  const extractionRef = useRef<HTMLDivElement>(null);
  const referencesRef = useRef<HTMLDivElement>(null);

  // Demo and options state
  const [showDemoOptions, setShowDemoOptions] = useState(false);
  const [selectedDemo, setSelectedDemo] = useState<number | null>(null);
  const [useAIVision, setUseAIVision] = useState(false);
  const [fields, setFields] = useState({
    visionModel: 'gemini-2.0-pro-exp-02-05'
  });

  // Metadata detection state
  const [disableMetadataDetection, setDisableMetadataDetection] = useState(false);
  const [detectedMetadata, setDetectedMetadata] = useState<any>(null);
  const [showMetadataPrompt, setShowMetadataPrompt] = useState(false);
  const [isExtractingMetadata, setIsExtractingMetadata] = useState(false);
  const [expandedFields, setExpandedFields] = useState({
    researchGoals: false
  });
  const [completedSteps, setCompletedSteps] = useState({
    source: false,
    metadata: false
  });

  // Refs
  const metadataExtractionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastExtractedTextRef = useRef<string>('');
  const demoButtonRef = useRef<HTMLButtonElement>(null);
  const demoDropdownRef = useRef<HTMLDivElement>(null);
  const [showDemoButtons, setShowDemoButtons] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setShowDemoButtons(true), 200); // 200ms delay
    return () => clearTimeout(timeout);
  }, []);

  // Progress tracking for workflow steps
  const stepRefs = {
    source: useRef<HTMLDivElement>(null),
    metadata: useRef<HTMLDivElement>(null),
    analyze: useRef<HTMLDivElement>(null)
  };



  // Handle scroll to feature from URL param
  useEffect(() => {
    const featureId = searchParams?.get('feature');
    if (featureId) {
      setTimeout(() => {
        const refs: Record<string, React.RefObject<HTMLDivElement>> = {
          'perspectives': multiplesPerspectivesRef,
          'simulation': simulationModeRef,
          'counter-narrative': counterNarrativeRef,
          'highlight': highlightTextRef,
          'extraction': extractionRef,
          'references': referencesRef
        };
        
        const ref = refs[featureId];
        if (ref?.current) {
          ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setExpandedFeature(featureId);
        }
      }, 500);
    }
  }, [searchParams]);

  useEffect(() => {
  const checkIfMobile = () => {
    setIsMobile(window.innerWidth < 768);
  };

  // Initial check
  checkIfMobile();

  // Add event listener
  window.addEventListener('resize', checkIfMobile);

  // Cleanup
  return () => window.removeEventListener('resize', checkIfMobile);
}, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clean up any object URLs when component unmounts
      const thumbnailUrl = useAppStore.getState().sourceThumbnailUrl;
      if (thumbnailUrl && thumbnailUrl.startsWith('blob:')) {
        URL.revokeObjectURL(thumbnailUrl);
      }

      // Clear any pending timers
      if (metadataExtractionTimerRef.current) {
        clearTimeout(metadataExtractionTimerRef.current);
      }
    };
  }, []);

  // Form validation
  useEffect(() => {
    setFormValid(
      textInput.trim().length > 0 &&
      metadata.date.trim().length > 0 &&
      metadata.author.trim().length > 0
    );
  }, [textInput, metadata]);

  // Track source completion
  useEffect(() => {
    // Check if text input has content or file was uploaded
    const sourceComplete = textInput.trim().length > 0;
    if (sourceComplete !== completedSteps.source) {
      setCompletedSteps(prev => ({ ...prev, source: sourceComplete }));
    }
  }, [textInput, completedSteps.source]);

  // Track metadata completion
  useEffect(() => {
    // Check if required metadata fields are filled
    const metadataComplete = 
      metadata.date?.trim().length > 0 && 
      metadata.author?.trim().length > 0;
    
    if (metadataComplete !== completedSteps.metadata) {
      setCompletedSteps(prev => ({ ...prev, metadata: metadataComplete }));
    }
  }, [metadata, completedSteps.metadata]);

  // Triggers the fade-out of the source success message
  useEffect(() => {
    if (completedSteps.source) {
      setShowSourceIndicator(true); // show it immediately

      const timer = setTimeout(() => {
        setShowSourceIndicator(false); // hide after 5s
      }, 5000);

      return () => clearTimeout(timer); // cleanup on unmount or re-trigger
    } else {
      setShowSourceIndicator(false); // hide immediately if source is removed
    }
  }, [completedSteps.source]);

  // Animation on mount
  useEffect(() => {
    // Start animation after slight delay for smoother appearance
    const animationTimer = setTimeout(() => {
      setAnimateIn(true);
    }, 1);

    return () => clearTimeout(animationTimer);
  }, []);

  // Check device size for responsive design
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkIfMobile();

    // Add event listener
    window.addEventListener('resize', checkIfMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Close demo dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if the click is outside the button AND outside the dropdown
      if (
        demoButtonRef.current && !demoButtonRef.current.contains(event.target as Node) &&
        demoDropdownRef.current && !demoDropdownRef.current.contains(event.target as Node)
      ) {
        setShowDemoOptions(false);
      }
    };

    if (showDemoOptions) {
      // Add listener with a slight delay to avoid immediate closure if click was on button
      const timeoutId = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 50);
      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showDemoOptions]);

  // Extract metadata - memoized with useCallback
  const extractMetadata = useCallback(async (text: string) => {
    // Skip extraction under these conditions
    if (disableMetadataDetection ||
        !text ||
        text.trim().length < 50 ||
        isExtractingMetadata ||
        text === lastExtractedTextRef.current) {
      return null;
    }

    // Update ref to prevent duplicate extraction
    lastExtractedTextRef.current = text;

    // Add a debounce to prevent excessive API calls
    if (metadataExtractionTimerRef.current) {
      clearTimeout(metadataExtractionTimerRef.current);
    }

    // Debounce extraction to avoid rapid successive calls
    return new Promise<any>(resolve => {
      metadataExtractionTimerRef.current = setTimeout(async () => {
        try {
          setIsExtractingMetadata(true);

          const response = await fetch('/api/extract-metadata', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text }),
          });

          if (!response.ok) {
            throw new Error(`Server responded with ${response.status}`);
          }

          const extractedData = await response.json();
          
          // Apply detected metadata directly instead of showing popup
          if (extractedData.date || extractedData.author || extractedData.title) {
            setLocalMetadata(prevMetadata => {
              const newMetadata: Metadata = { ...prevMetadata };
              
              // Only overwrite empty fields
              if (extractedData.date && !prevMetadata.date?.trim()) {
                newMetadata.date = extractedData.date;
              }
              
              if (extractedData.author && !prevMetadata.author?.trim()) {
                newMetadata.author = extractedData.author;
              }
              
              // Always use detected research value if provided
              if (extractedData.researchValue) {
                newMetadata.researchGoals = extractedData.researchValue;
              }
              
              // Add optional fields with null checks
              Object.entries({
                title: extractedData.title,
                summary: extractedData.summary,
                documentEmoji: extractedData.documentEmoji,
                placeOfPublication: extractedData.placeOfPublication,
                genre: extractedData.genre,
                documentType: extractedData.documentType,
                academicSubfield: extractedData.academicSubfield,
                fullCitation: extractedData.fullCitation,
                thumbnailUrl: extractedData.thumbnailUrl
              }).forEach(([key, value]) => {
                if (value && !(prevMetadata as any)[key]) {
                  (newMetadata as any)[key] = value;
                }
              });
              
              // Handle tags which might be array or string
              if (extractedData.tags && (!prevMetadata.tags || (Array.isArray(prevMetadata.tags) && prevMetadata.tags.length === 0))) {
                newMetadata.tags = Array.isArray(extractedData.tags)
                  ? extractedData.tags
                  : typeof extractedData.tags === 'string'
                    ? extractedData.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean)
                    : [];
              }
              
              // Show the metadata added indicator
              setShowSourceIndicator(true);
              setTimeout(() => setShowSourceIndicator(false), 3000);
              
              return newMetadata;
            });
          }
          
          resolve(extractedData);
        } catch (error) {
          console.error("Error extracting metadata:", error);
          resolve(null);
        } finally {
          setIsExtractingMetadata(false);
        }
      }, 800); // 800ms debounce
    });
  }, [disableMetadataDetection, isExtractingMetadata]);

  // Handle metadata modal save
  const handleSaveMetadata = useCallback((updatedMetadata: Metadata) => {
    setLocalMetadata(updatedMetadata);
  }, []);

  // Toggle demo options dropdown
  const toggleDemoOptions = useCallback((e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDemoOptions(prev => !prev);
  }, []);

  // Load demo content
  const loadDemoContent = useCallback((index: number) => {
    setDisableMetadataDetection(true);
    setSelectedDemo(index);
    
    // Set the demo text to both local state and app store
    const demoText = demoTexts[index].text;
    setTextInput(demoText);
    setSourceContent(demoText);
    
    // Update the metadata
    setLocalMetadata(demoTexts[index].metadata);

    // Set the thumbnail URL if present
    const demoThumbnailUrl = demoTexts[index].metadata.thumbnailUrl || null;
    setSourceThumbnailUrl(demoThumbnailUrl);
    
    // Set extract info configuration if applicable
    setExtractInfoConfig(demoExtractConfigs[index]);
    
    // Ensure we're on the text input tab when demo is loaded
    setActiveTab('text');
    
    // Hide the demo options after selection
    setTimeout(() => {
      setShowDemoOptions(false);
      
      // Re-enable metadata detection after a delay
      setTimeout(() => {
        setDisableMetadataDetection(false);
      }, 1000);
    }, 500);
  }, [setExtractInfoConfig, setSourceContent, setSourceThumbnailUrl]);

  // Handle quick demo for specific features
  const handleQuickDemo = useCallback((
    demoIndex: number, 
    targetPanel: AppState['activePanel']
  ) => {
    // Disable metadata detection temporarily
    setDisableMetadataDetection(true);
    
    // Load the demo content
    setSelectedDemo(demoIndex);
    
    // Make sure to update both local state and app store
    const demoText = demoTexts[demoIndex].text;
    setTextInput(demoText);
    setSourceContent(demoText);
    
    setLocalMetadata(demoTexts[demoIndex].metadata);

    // Get the thumbnail URL from the demo
    const demoThumbnailUrl = demoTexts[demoIndex].metadata.thumbnailUrl || null;
    setSourceThumbnailUrl(demoThumbnailUrl);
    
    // Ensure we're on the text tab
    setActiveTab('text');
    
    // Set any relevant extract info configuration
    if (demoExtractConfigs[demoIndex]) {
      setExtractInfoConfig(demoExtractConfigs[demoIndex]);
    }
    
    // Set the appropriate panel and any special modes
    setActivePanel(targetPanel);
    
    if (targetPanel === 'roleplay') {
      setRoleplayMode(true);
    }

    // IMPORTANT: If detailed analysis is requested, force detailed analysis to null
    // This will trigger the API call when the component mounts
    if (targetPanel === 'detailed-analysis') {
      setDetailedAnalysis(null);
      setDetailedAnalysisLoaded(false);
    }
    
    // Prepare the source content for analysis
    setSourceContent(demoText);
    setMetadata(demoTexts[demoIndex].metadata);
    setLoading(true);
    
    // Re-enable metadata detection after a delay
    setTimeout(() => {
      setDisableMetadataDetection(false);
    }, 1000);
    
    // Navigate to analysis page
    router.push('/analysis');
    
    // If going to roleplay, set up a pre-populated input after page load
    if (targetPanel === 'roleplay') {
      // Define the message we'll pre-populate
      let suggestedQuestion = "";
      
      // Set appropriate initial questions based on demo index
      switch(demoIndex) {
        case 0: // Ea-nasir complaint
          suggestedQuestion = "Tell me more about the inferior quality of the copper ingots.";
          break;
        case 5: // Freud's cocaine treatise
          suggestedQuestion = "Herr Doktor Freud, Guten Tag. Could you tell me more about your personal experiences with coca?";
          break;
        case 7: // Margaret Mead's notes
          suggestedQuestion = "Who are you, what time is it, and what are you seeing in this moment?";
          break;
        case 4: // Delaware oral tradition
          suggestedQuestion = "Imagine you are Manhattan Island, narrating your own history. Begin.";
          break;
        default:
          suggestedQuestion = "Could you tell me more about this document?";
      }
      
      // Wait for the page to load, then find and populate the input
      setTimeout(() => {
        const inputElement = document.querySelector('input[placeholder*="Ask"]') as HTMLInputElement;
        if (inputElement) {
          inputElement.value = suggestedQuestion;
          
          // Force React to recognize the change
          const event = new Event('input', { bubbles: true });
          inputElement.dispatchEvent(event);
          
          // Try to focus the input so it's ready for the user to press Enter
          inputElement.focus();
        }
      }, 3000);
    }
  }, [
    router, setActivePanel, setRoleplayMode, setSourceContent, setMetadata, setLoading, 
    setSourceThumbnailUrl, setExtractInfoConfig, setDetailedAnalysis, setDetailedAnalysisLoaded
  ]);

  // Handle Manhattan narrative special case
  const handleManhattanNarrative = useCallback(async () => {
    // This is the index of the Delaware oral tradition about Manhattan in your demoTexts array
    const manhattanDemoIndex = 5;
    
    // Disable metadata detection temporarily
    setDisableMetadataDetection(true);
    
    // Load the demo content
    setSelectedDemo(manhattanDemoIndex);
    setTextInput(demoTexts[manhattanDemoIndex].text);
    setLocalMetadata(demoTexts[manhattanDemoIndex].metadata);
    
    // Prepare the source content for analysis
    const sourceContent = demoTexts[manhattanDemoIndex].text;
    const metadata = demoTexts[manhattanDemoIndex].metadata;
    
    setSourceContent(sourceContent);
    setMetadata(metadata);
    setLoading(true);
    setActivePanel('counter');
    
    // Store special lens info
    setSpecialLensRequest({
      lensType: 'place',
      instructions: "Imagine you are Manhattan Island, insouciantly narrating your own history up to the 1960s. You really hate Robert Moses. Begin."
    });
    
    // Navigate to analysis page
    router.push('/analysis');
    
    // Give time for navigation to complete
    setTimeout(async () => {
      try {
        // Directly trigger counter narrative generation
        const response = await fetch('/api/counter-narrative', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            source: sourceContent,
            metadata: metadata,
            perspective: '',
            modelId: useAppStore.getState().llmModel
          }),
        });
        
        if (response.ok) {
          const data = await response.json();
          useAppStore.getState().setCounterNarrative(data.narrative);
          setDisableMetadataDetection(false);
        }
      } catch (error) {
        console.error("Error generating counter narrative:", error);
      }
    }, 300);
  }, [
    router, setActivePanel, setLoading, setMetadata, setSourceContent, 
    setSpecialLensRequest
  ]);

  // Handle highlight demo
  const handleHighlightDemo = useCallback((demoIndex: number, highlightQuery: string) => {
    // Disable metadata detection temporarily
    setDisableMetadataDetection(true);
    
    // Load the demo content
    setSelectedDemo(demoIndex);
    setTextInput(demoTexts[demoIndex].text);
    setLocalMetadata(demoTexts[demoIndex].metadata);
    
    // Set the appropriate panel and highlight mode
    setActivePanel('highlight');
    setHighlightMode(true);
    setHighlightQuery(highlightQuery);
    
    // Prepare the source content for analysis
    setSourceContent(demoTexts[demoIndex].text);
    setMetadata(demoTexts[demoIndex].metadata);
    setLoading(true);
    
    // Re-enable metadata detection after a delay
    setTimeout(() => {
      setDisableMetadataDetection(false);
    }, 1000);
    
    // Navigate to analysis page
    router.push('/analysis');
  }, [
    router, setActivePanel, setHighlightMode, setHighlightQuery, 
    setSourceContent, setMetadata, setLoading
  ]);

  // Toggle an expanded field
  const toggleExpandedField = useCallback((field: keyof typeof expandedFields) => {
    setExpandedFields(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  }, []);

  // Navigate to analysis with selected panel
  const navigateToAnalysis = useCallback((panel: 'analysis' | 'detailed-analysis' | 'extract-info' | 'references' | 'roleplay' | 'counter' | 'highlight' = 'analysis') => {
    if (!formValid) return;

    console.log(`Navigating to analysis with panel: ${panel}`);
    setSourceContent(textInput);
    setMetadata(metadata); // Update global metadata state
    setLoading(true);
    setActivePanel(panel);

    // Reset/Set specific modes based on the chosen panel
    setRoleplayMode(panel === 'roleplay');

    router.push('/analysis');
  }, [formValid, textInput, metadata, router, setSourceContent, setMetadata, setLoading, setActivePanel, setRoleplayMode]);

  // Feature card data with demo buttons
  const featureCards: FeatureCardData[] = [
    {
      id: 'perspectives',
      title: 'Multiple Perspectives',
      description: 'Analyze and organize sources to uncover layers of meaning that might otherwise remain hidden.',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: {
        light: 'text-amber-600',
        dark: 'text-indigo-400'
      },
      borderColor: {
        light: 'border-amber-100',
        dark: 'border-slate-800'
      },
      bgColor: {
        light: 'bg-amber-50',
        dark: 'bg-indigo-900/50'
      },
      imageUrl: '/screenshots/perspectives.jpg',
      demoButtons: [
        {
          label: 'List all demons in a 16th century treatise',
          icon: (
            <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          ),
          onClick: () => handleQuickDemo(1, 'extract-info')
        },
        {
          label: 'Extract drug names from a pharmacopeia',
          icon: ( <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10m-11.048-2.5A18.022 18.022 0 0110 8.6" />
</svg>
          ),
          onClick: () => handleQuickDemo(4, 'extract-info')
        }
      ]
    },
    {
      id: 'simulation',
      title: 'Simulation Mode',
      description: 'Engage in simulated conversations with the author of a source to better understand their worldview.',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.4994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
        </svg>
      ),
      color: {
        light: 'text-blue-600',
        dark: 'text-blue-400'
      },
      borderColor: {
        light: 'border-blue-100',
        dark: 'border-slate-800'
      },
      bgColor: {
        light: 'bg-blue-50',
        dark: 'bg-blue-900/50'
      },
      imageUrl: '/simulation.gif',
      demoButtons: [
        {
          label: 'Discuss Ea-nāṣir\'s insultingly bad copper',
          icon: (
            <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          ),
          onClick: () => handleQuickDemo(0, 'roleplay')
        },
        {
          label: 'Ask a young Freud about his passion for cocaine',
          icon: (
            <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
            </svg>
          ),
          onClick: () => handleQuickDemo(8, 'roleplay')
        }
      ]
    },
    {
      id: 'counter-narrative',
      title: 'Counter-Narratives',
      description: 'Develop alternative interpretations that surface overlooked aspects of your source.',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 7h12m0 0l-4-4m4 4l-4 4m-4 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      ),
      color: {
        light: 'text-purple-600',
        dark: 'text-purple-400'
      },
      borderColor: {
        light: 'border-purple-100',
        dark: 'border-slate-800'
      },
      bgColor: {
        light: 'bg-purple-50',
        dark: 'bg-purple-900/50'
      },
      imageUrl: '/counter-narrative.gif',
      demoButtons: [
        {
          label: 'Find African names in an 18th century drug guide',
          icon: (
            <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          ),
          onClick: () => handleHighlightDemo(4, 'highlight ALL names for materia medica in this text that appear to be of Sub-Saharan origin')
        },
        {
          label: 'What if Manhattan narrated its own history?',
          icon: (
            <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          ),
          onClick: handleManhattanNarrative
        }
      ]
    },
    {
      id: 'highlight',
      title: 'Text Highlighting',
      description: 'Identify and analyze specific passages in your source based on semantic meaning.',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      ),
      color: {
        light: 'text-yellow-600',
        dark: 'text-yellow-400'
      },
      borderColor: {
        light: 'border-yellow-100',
        dark: 'border-slate-800'
      },
      bgColor: {
        light: 'bg-yellow-50',
        dark: 'bg-yellow-900/50'
      },
      imageUrl: '/highlighting.gif',
      demoButtons: [
        {
          label: 'Find emotional language in Lincoln\'s Gettysburg Address',
          icon: (
            <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          ),
          onClick: () => handleHighlightDemo(2, 'highlight the most emotionally charged passages')
        },
        {
          label: 'Find scientific claims in an ancient text',
          icon: (
            <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          ),
          onClick: () => handleHighlightDemo(6, 'highlight all scientific or medical claims in this text')
        }
      ]
    },
    {
      id: 'extraction',
      title: 'Information Extraction',
      description: 'Extract structured data, lists, and tables from your source for detailed analysis.',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2M19 13l-4 4m0 0l-4-4m4 4V7" />
        </svg>
      ),
      color: {
        light: 'text-emerald-600',
        dark: 'text-emerald-400'
      },
      borderColor: {
        light: 'border-emerald-100',
        dark: 'border-slate-800'
      },
      bgColor: {
        light: 'bg-emerald-50',
        dark: 'bg-emerald-900/50'
      },
      imageUrl: '/screenshots/extractinfo.jpg',
      demoButtons: [
        {
          label: 'List all plants in a medical manual',
          icon: (
            <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2M19 13l-4 4m0 0l-4-4m4 4V7" />
            </svg>
          ),
          onClick: () => handleQuickDemo(7, 'extract-info')
        },
        {
          label: 'Create table of dates and events',
          icon: (
            <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          ),
          onClick: () => handleQuickDemo(3, 'extract-info')
        }
      ]
    },
    {
      id: 'references',
      title: 'Scholarly References',
      description: 'Discover relevant scholarly works, primary sources, and academic context for your document.',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      color: {
        light: 'text-rose-600',
        dark: 'text-rose-400'
      },
      borderColor: {
        light: 'border-rose-100',
        dark: 'border-slate-800'
      },
      bgColor: {
        light: 'bg-rose-50',
        dark: 'bg-rose-900/50'
      },
      imageUrl: '/screenshots/referencelight.jpg',
      demoButtons: [
        {
          label: 'Find scholarly sources for a medieval manuscript',
          icon: (
            <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          ),
          onClick: () => handleQuickDemo(1, 'references')
        },
        {
          label: 'Academic context for a historical document',
          icon: (
            <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
          ),
          onClick: () => handleQuickDemo(2, 'references')
        }
      ]
    }
  ];

useEffect(() => {
  if (formValid) {
    const scrollTimer = setTimeout(() => {
      const analyzeButton = document.getElementById('analyze-source-button');
      if (analyzeButton) {
        const rect = analyzeButton.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const offset = 800; // Adjust this value as needed

        // Scroll to the element's top position minus the offset
        window.scrollTo({
          top: rect.top + scrollTop - offset,
          behavior: 'smooth'
        });
      }
    }, 300);

    return () => clearTimeout(scrollTimer);
  }
}, [formValid]);

  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) return null; 

  return (
    <main className={`min-h-screen flex flex-col overflow-x-hidden overflow-y-auto ${
      isDarkMode 
        ? 'bg-gradient-to-b from-slate-900 to-slate-950/90 text-slate-100' 
        : 'bg-gradient-to-b from-white to-slate-200 text-slate-900'
    }`}>



      <TopNavigation isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />

      {/* Hero section with animation */}
      <div className="relative shadow-lg transition-all duration-500 ease-out overflow-hidden" 
          style={{ height: animateIn ? (isMobile ? '140px' : '180px') : '0px' }}>
        {/* Background with enhanced overlay */}
        <div className="absolute inset-0 z-0">
          <Image 
            src="/sourcelens.jpg" 
            alt="SourceLens Background" 
            fill 
            priority
            className="object-cover" 
          />

          {/* Improved gradient overlay with better contrast */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-slate-800/70 to-amber-900/80 backdrop-filter backdrop-brightness-74">
            <div className="absolute inset-0 opacity-20 mix-blend-overlay" 
                style={{ background: 'radial-gradient(circle at 30% 50%, rgba(255,255,255,0.6) 0%, transparent 80%)' }}></div>
          </div>
          {/* Better bottom gradient for text readability */}
          <div className="absolute bottom-0 left-0 w-full h-20 pointer-events-none" 
              style={{ background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.5))' }}></div>
        </div>
      </div>
     
      {/* Subtle gradient divider */}
      <div className="h-1 bg-gradient-to-r from-indigo-600 via-amber-500 to-purple-600 shadow-sm"></div>


<div className="flex-1 max-w-7xl mx-auto px-3 z-1 py-0 relative md:mt-14 w-full my-6 z-100">
  <EnhancedDemoSection 
    demoTexts={demoTexts}
    selectedDemo={selectedDemo}
    loadDemoContent={loadDemoContent}
    handleQuickDemo={handleQuickDemo}
    handleManhattanNarrative={handleManhattanNarrative}
    handleHighlightDemo={handleHighlightDemo}
    isDarkMode={isDarkMode}
  />
</div>
      {/* Main content grid with new workflow structure */}
      <div className="flex-1 max-w-7xl mx-auto px-3 z-1 py-0 relative md:mt-6">
        
        {/* "How it works" Demo Button - Positioned center top */}
 <div className="flex justify-center mt-10 mb-0">

         

        </div>

        

        {/* Main Content Layout - Side by side on larger screens */}
        <div className={`transition-all duration-700 delay-200 transform ${
          animateIn ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-12"> {/* Ensure we start with 1 column on mobile */}
            {/* Step 1: Source Input - Left column on larger screens */}
            <div 
              ref={stepRefs.source}
              className={`md:col-span-12 lg:col-span-7 ${  /* Full width on medium screens, 7/12 on large */
                isDarkMode 
                  ? 'bg-gradient-to-b from-slate-900 to-slate-900/90 border-slate-800' 
                  : 'bg-gradient-to-br from-stone-50/50 to-slate-100/60 border-slate-200'
              } rounded-xl shadow-lg border overflow-hidden hover:shadow-xl transition-all duration-300`}
            >
              <div className="p-6 relative">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 relative">
                  <h2 className={`text-xl font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-800'} flex items-center gap-2.5`}>
                    <span className={`flex items-center justify-center w-8 h-8 
                      ${completedSteps.source 
                        ? isDarkMode 
                          ? 'bg-gradient-to-br from-indigo-700 to-indigo-600 text-indigo-100' 
                          : 'bg-gradient-to-br from-amber-500 to-amber-600 text-white' 
                        : isDarkMode
                          ? 'bg-slate-800 text-amber-400 border border-amber-600'
                          : 'bg-white delay-1000 text-slate-900 border border-amber-400'
                      } 
                      rounded-full text-xl font-medium transition-all duration-200`}>
                      1
                    </span>
                    <span className={
                      isDarkMode 
                        ? 'text-slate-100' 
                        : 'bg-gradient-to-r from-slate-900 to-slate-800 bg-clip-text text-transparent'
                    }>
                      {completedSteps.metadata ? 'Source Uploaded' : 'Upload a Source'}
                    </span>
                  </h2>
                </div>

                {/* Source Upload Component */}
                <SourceUpload
                  onTextChange={(newText) => {
                    setTextInput(newText);
                    if (Math.abs(newText.length - (lastExtractedTextRef.current?.length || 0)) > 30 && !showMetadataPrompt) {
                      extractMetadata(newText);
                    }
                  }}
                  onMetadataDetected={(meta) => {
                    if (meta && (meta.date || meta.author || meta.title)) {
                      setDetectedMetadata(meta);
                      setShowMetadataPrompt(true);
                    }
                  }}
                  initialText={textInput}
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                  useAIVision={useAIVision}
                  onAIVisionChange={setUseAIVision}
                  visionModel={fields.visionModel}
                  onVisionModelChange={(model) => setFields({...fields, visionModel: model})}
                  disableMetadataDetection={disableMetadataDetection}
                  isDarkMode={isDarkMode}
                />
              </div>

              {/* Step Completion Indicator */}
              <div className="relative h-6 flex items-center">
                <div
                  className={`
                    absolute inset-0 flex items-center justify-center 
                    ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'} 
                    transition-opacity duration-700 ease-in-out
                    ${showSourceIndicator ? 'opacity-100' : 'opacity-0 pointer-events-none'}
                  `}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="font-medium">Source added!</span>
                </div>

                <div
                  className={`
                    absolute inset-0 flex items-center 
                    ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} 
                    transition-opacity duration-500 ease-in-out
                    ${showSourceIndicator ? 'opacity-0 pointer-events-none' : 'opacity-100'}
                  `}
                >
                </div>
              </div>
            </div>

            {/* Step 2: Metadata - Right column on larger screens */}
            <div 
                  ref={stepRefs.metadata}
                  className={`md:col-span-12 lg:col-span-5 ${  /* Full width on medium screens, 5/12 on large */
                    isDarkMode 
                      ? 'bg-slate-900 border-slate-800' 
                      : 'bg-gradient-to-tr from-slate-50/50 to-stone-100/60 border-slate-200'
                  } rounded-xl shadow-lg border ${
                    completedSteps.source 
                      ? '' 
                      : isDarkMode 
                        ? 'opacity-75' 
                        : 'border-slate-200/30 opacity-75'
                  } overflow-hidden hover:shadow-xl transition-all duration-300`}
                >
              {/* Metadata Header */}
              <div className="p-5 pb-0">
                <div className="flex justify-between items-start mb-2">
                  <h2 className={`text-xl font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-800'} flex items-center gap-2.5`}>
                    <span className={`flex items-center justify-center w-8 h-8 
                      ${completedSteps.metadata 
                        ? isDarkMode 
                          ? 'bg-gradient-to-br from-blue-700 to-indigo-600 text-blue-100' 
                          : 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white' 
                        : isDarkMode
                          ? 'bg-slate-800 text-blue-400 border border-blue-600'
                          : 'bg-white text-slate-900 border border-blue-400'
                      } 
                      rounded-full text-xl font-medium transition-all duration-200`}>
                      2
                    </span>
                    <span className={
                      isDarkMode 
                        ? 'text-slate-100' 
                        : 'bg-gradient-to-r from-slate-900 to-slate-800 bg-clip-text text-transparent'
                    }>
                      {completedSteps.metadata ? 'Metadata added' : 'Add Metadata'}
                    </span>
                  </h2>

                  {/* Document thumbnail that opens modal on click */}
                  <div
                    className="flex items-center justify-center h-14 w-14 shrink-0 ml-2 cursor-pointer"
                    onClick={() => setShowMetadataModal(true)}
                    title="Click to edit all metadata"
                  >
                    {isExtractingMetadata ? (
                      <div className={`text-xs ${isDarkMode ? 'text-amber-500' : 'text-amber-700'} flex flex-col items-center text-center`}>
                        <div className={`w-5 h-5 border-2 ${isDarkMode ? 'border-amber-500' : 'border-amber-600'} border-t-transparent rounded-full animate-spin mb-1`}></div>
                        Detecting metadata...
                      </div>
                    ) : (
                      (metadata?.thumbnailUrl || sourceThumbnailUrl) && (
                        <div className={`w-14 h-14 overflow-hidden rounded-lg border-2 ${
                          isDarkMode ? 'border-indigo-800' : 'border-amber-200'
                        } shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg`}>
                          <Image
                            src={metadata?.thumbnailUrl || sourceThumbnailUrl || '/placeholder.jpg'}
                            alt="Document preview"
                            width={56}
                            height={56}
                            className="object-cover w-full h-full"
                            onError={(e) => { e.currentTarget.src = '/placeholder.jpg'; }}
                          />
                        </div>
                      )
                    )}
                  </div>
                </div>


                <div className="space-y-4 opacity-100 transition-opacity duration-300">
                  {/* Date & Author on same row */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="w-full sm:w-1/2">
                      <label className={`block text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'} mb-1`}>
                        <span className="inline-flex items-center  gap-1">Date <span className="text-red-500 text-xs">*</span></span>
                      </label>
                      <input 
                        type="text" 
                        className={`w-full p-2 ${
                        isDarkMode 
                          ? 'bg-slate-700 border-slate-600 text-slate-200 focus:ring-amber-500 focus:border-amber-500' 
                          : 'border-1 shadow-inner bg-slate-100/60 border-slate-100 focus:ring-amber-400 focus:border-amber-400'
                      } rounded-md text-sm focus:outline-none focus:ring-2 transition-all`}
                        placeholder="Give best estimate if unsure"
                        value={metadata.date || ''}
                        onChange={(e) => setLocalMetadata({ ...metadata, date: e.target.value })}
                        required
                      />
                    </div>

                    <div className="w-full sm:w-1/2">
                      <label className={`block text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'} mb-1`}>
                        <span className="inline-flex items-center gap-1">Author <span className="text-red-500 text-xs">*</span></span>
                      </label>
                      <input 
                        type="text" 
                        className={`w-full p-2 ${
                          isDarkMode 
                            ? 'bg-slate-700 border-slate-600 text-slate-200 focus:ring-amber-500 focus:border-amber-500' 
                            : 'border-1 shadow-inner bg-slate-100/60 border-slate-100 focus:ring-amber-400 focus:border-amber-400'
                        } rounded-md text-sm focus:outline-none focus:ring-2 transition-all`}
                        placeholder="Who created it? (required)"
                        value={metadata.author || ''}
                        onChange={(e) => setLocalMetadata({ ...metadata, author: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  {/* Genre & Document Type on same row */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="w-full sm:w-1/2">
                      <label className={`block text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'} mb-1`}>Genre (Optional)</label>
                      <input 
                        type="text" 
                        className={`w-full p-2 ${
                          isDarkMode 
                            ? 'bg-slate-700 border-slate-600 text-slate-200 focus:ring-amber-500 focus:border-amber-500' 
                            : 'border-1 shadow-inner bg-slate-100/60 border-slate-100 focus:ring-amber-400 focus:border-amber-400'
                        } rounded-md text-sm focus:outline-none focus:ring-2 transition-all`}
                        placeholder="e.g. letter, report, oral history"
                        value={metadata.genre || ''}
                        onChange={(e) => setLocalMetadata({ ...metadata, genre: e.target.value })}
                      />
                    </div>

                    <div className="w-full sm:w-1/2">
                      <label className={`block text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'} mb-1`}>Document Type (Optional)</label>
                      <input 
                        type="text" 
                        className={`w-full p-2 ${
                          isDarkMode 
                            ? 'bg-slate-700 border-slate-600 text-slate-200 focus:ring-amber-500 focus:border-amber-500' 
                            : 'border-1 shadow-inner bg-slate-100/60 border-slate-100 focus:ring-amber-400 focus:border-amber-400'
                        } rounded-md text-sm focus:outline-none focus:ring-2 transition-all`}
                        placeholder="e.g. primary, secondary, image"
                        value={metadata.documentType || ''}
                        onChange={(e) => setLocalMetadata({ ...metadata, documentType: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Title */}
                  <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'} mb-1`}>Title (Optional)</label>
                    <input 
                      type="text" 
                      className={`w-full p-2 ${
                        isDarkMode 
                          ? 'bg-slate-700 border-slate-600 text-slate-200 focus:ring-amber-500 focus:border-amber-500' 
                          : 'border-1 shadow-inner bg-slate-100/60 border-slate-100 focus:ring-amber-400 focus:border-amber-400'
                      } rounded-md text-sm focus:outline-none focus:ring-2 transition-all`}
                      placeholder="Document title or name"
                      value={metadata.title || ''}
                      onChange={(e) => setLocalMetadata({ ...metadata, title: e.target.value })}
                    />
                  </div>

                  {/* Tags */}
                  <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'} mb-1`}>Tags (Optional)</label>
                    <input 
                      type="text" 
                      className={`w-full p-2 ${
                        isDarkMode 
                          ? 'bg-slate-700 border-slate-600 text-slate-200 focus:ring-amber-500 focus:border-amber-500' 
                          : 'border-1 shadow-inner bg-slate-100/60 border-slate-100 focus:ring-amber-400 focus:border-amber-400'
                      } rounded-md text-sm focus:outline-none focus:ring-2 transition-all`}
                      placeholder="Comma-separated keywords"
                      value={Array.isArray(metadata.tags) ? metadata.tags.join(', ') : metadata.tags || ''}
                      onChange={(e) => setLocalMetadata({ ...metadata, tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean) })}
                    />
                  </div>

                  {/* Unified click target for "Add more fields" */}
                  <div
                    onClick={() => setShowMetadataModal(true)}
                    className={`mt-2 mb-6 inline-flex items-center px-3 py-1.5 rounded-full ${
                      isDarkMode
                        ? 'border border-slate-600 bg-slate-700 text-slate-300 hover:bg-amber-900/50 hover:text-amber-300 hover:border-amber-700'
                        : 'border-1 shadow-inner bg-slate-100/60 border-slate-100 bg-slate-50 text-slate-600 hover:bg-amber-50 hover:text-amber-600 hover:border-amber-400'
                    } text-xs cursor-pointer transition-all duration-200`}
                  >
                    + Add more fields
                  </div>
                </div>
              </div>

              {/* Primary Action Button Section - Updated */}
              <div className={`px-6 py-5 mt-auto ${
                isDarkMode 
                  ? 'bg-gradient-to-b from-slate-800 to-slate-900 border-t border-slate-700/80'
                  : 'bg-gradient-to-b from-slate-100/60 to-slate-200/50 border-t border-slate-300/80'
              }`}>
                <div className="flex flex-col justify-between items-center gap-4">
                  {/* Primary Analyze Button with Number 3 */}
                 <PrimaryActionButton
                   id="analyze-source-button" // Add this ID
                   onClick={() => navigateToAnalysis('analysis')}
                   disabled={!formValid}
                   showNumber={true}
                   isActive={formValid}
                   isDarkMode={isDarkMode}
                 >
                   <span className="flex items-center justify-center text-base">
                     <svg className={`w-5 h-5 mr-2 ${formValid ? '' : 'opacity-70'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                     </svg>
                     Analyze Source
                   </span>
                 </PrimaryActionButton>
                  
                  {/* Status message centered below the button */}
                  <div className={`flex items-center justify-center w-full ${
                    formValid 
                      ? isDarkMode ? 'text-emerald-400' : 'text-emerald-900' 
                      : isDarkMode ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    <div className={`rounded-full mr-2 ${
                      formValid 
                        ? isDarkMode ? 'bg-emerald-600' : 'bg-emerald-500'
                        : isDarkMode ? 'bg-slate-600' : 'bg-slate-300'
                    }`}></div>
                    <p className="text-sm">
                      {formValid
                        ? 'Ready to begin. Click the button to proceed.'
                        : 'Please complete both required fields.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Expanded Advanced Options */}
      <div className="p-5 px-3 sm:px-5">
          <h3 className={`text-xl font-light mt-30 sm:mt-35 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'} mb-10 sm:mb-12`}>
            Or try out a specific Lens for analyzing your uploaded source:
          </h3>
          
          {/* Enhanced Lens Options Grid */}
          <LensOptionsGrid
            onSelectLens={(id) => navigateToAnalysis(id as any)}
            className="mt-2 mb-20"
            isDarkMode={isDarkMode}
          />
        </div>
      </div>
       


      </div>

      <FeatureCarousel   />
{/* Bottom cosmic background space with gradient fade */}
<div className="relative -mb-8 h-[400vh] md:h-[260vh]" ref={bottomSpaceRef}>
  {/* Cosmic background - positioned behind everything */}
  <div className="absolute inset-0">
    <CosmicBackgroundFade isDarkMode={isDarkMode} />
  </div>
  
  {/* Primary top gradient overlay for seamless transition - 
      Significantly shorter transition to dark in light mode */}
  <div 
    className="absolute top-0 inset-x-0 z-10 pointer-events-none"
    style={{ 
      height: '30vh',
      background: isDarkMode 
        ? 'linear-gradient(to bottom, rgba(15, 23, 42, 1) 0%, rgba(15, 23, 42, 0.95) 10%, rgba(15, 23, 42, 0.8) 40%, rgba(15, 23, 42, 0.4) 70%, transparent 100%)' 
        : 'linear-gradient(to bottom,  rgba(248, 250, 252, .96) 20%, rgba(30, 41, 59, 0.9) 65%, rgba(15, 23, 42, 0.8) 70%, rgba(15, 23, 42, 0.1) 90%)'
    }}
  ></div>
  
   <div className="relative z-20 flex flex-col items-center justify-start pt-[35vh] pb-[8vh] px-4">
  
  {/* Content layer */}
<div className="group relative z-20 h-full flex items-center justify-center p-10">
  <div className="relative max-w-3xl p-12 text-center -mt-30 ">
    {/* Rotating Shadow Layer */}
    <div className="absolute inset-0 rounded-full shadow-xl shadow-indigo-800 "></div>

    {/* Content Layer */}
    <div className="relative z-10 p-15 rounded-full bg-transparent backdrop-blur-sm hover:backdrop-blur-md transition-all duration-300">
      <h2 className={`${spaceGrotesk.className} rounded-full text-shadow-xs tracking-tight hover:rotate-1 hover:scale-106 transition-all duration-400 text-5xl mt-10 leading-[1.5] font-bold mb-6 py-10 text-white`}>
        Find new perspectives
      </h2>
      <p className="text-xl leading-[1.8] text-shadow-xs font-light text-slate-200">
        SourceLens allows professionals, students, and other curious people to find new perspectives on their textual sources. Its unique, AI-enabled tools are designed encourage creativity and critical thinking — augmented, rather than replaced, by machine intelligence.
      </p>
      <button 
        className="mt-14 px-6 py-3 mb-10 bg-indigo-600 hover:bg-indigo-800 hover:shadow-lg shadow-indigo-500/20 text-white hover:animate-[pulse-ring_5s_infinite] rounded-full font-medium transition-all transform hover:scale-105 hover:border-2 hover:border-indigo-400 duration-300 shadow-lg"
        onClick={() => router.push('/analysis')}
      >
        Try it now
      </button>
     </div>
 </div>
 </div>
    {/* Add FeatureCardsBottom inside content layer */}
    <div className="mt-40 mb-10">
      <FeatureCardsBottom />
    </div>
  </div>

</div>


     {/* Footer & Divider */}
        {/* Subtle gradient divider */}
      <div className="h-1 z-11 bg-gradient-to-r from-indigo-600/50 via-amber-500/50 to-indigo-600/50 shadow-sm"></div>

      <Footer isDarkMode={isDarkMode} />

      {/* Modals */}
      <AboutModal 
        isOpen={showAboutModal} 
        onClose={() => setShowAboutModal(false)} 
        isDarkMode={isDarkMode}
      />
      
      <FAQModal 
        isOpen={showFAQModal} 
        onClose={() => setShowFAQModal(false)} 
        
      />
      
      <MetadataModal 
        isOpen={showMetadataModal}
        onClose={() => setShowMetadataModal(false)}
        initialMetadata={metadata}
        onSave={handleSaveMetadata}
        
      />
    </main>
  );
}

