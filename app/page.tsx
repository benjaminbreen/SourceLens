// app/page.tsx
// Landing page for SourceLens - provides text and file upload options,
// metadata collection, and navigation to the analysis interface.
// Features a responsive layout with demo options, metadata detection,
// and multiple interactive components for user engagement.

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import HamburgerMenu from '@/components/ui/HamburgerMenu';
import AboutModal from '@/components/ui/AboutModal';
import FAQModal from '@/components/ui/FAQModal';
import { useAppStore, Metadata } from '@/lib/store';
import AnalysisFooter from '../components/ui/AnalysisFooter';
import SourceUpload from '@/components/upload/SourceUpload';
import { demoTexts, demoExtractConfigs } from '@/lib/demoData';
import Footer from '@/components/ui/Footer';
import MetadataModal from '@/components/upload/MetadataModal';

// ----- Separate Component for Metadata Auto Timer -----
// Fix setState in render issue by redesigning component
const MetadataAutoTimer = ({ onComplete, duration = 5 }: { onComplete: () => void, duration?: number }) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [progress, setProgress] = useState(0);
  
  // Use a ref to track whether component is mounted
  const isMountedRef = useRef(true);
  
  useEffect(() => {
    // Focus the parent element to enable Enter key capture
    const parentEl = document.getElementById('metadata-prompt-modal');
    if (parentEl) parentEl.focus();
    
    // Reset state on mount
    setTimeLeft(duration);
    setProgress(0);
    
    // Start countdown
    const timer = setInterval(() => {
      // Only update state if component is still mounted
      if (isMountedRef.current) {
        setTimeLeft(prev => {
          const newTime = prev - 1;
          if (newTime <= 0) {
            clearInterval(timer);
            onComplete();
            return 0;
          }
          return newTime;
        });
        
        // Calculate progress separately to avoid setState during render
        setProgress(((duration - timeLeft + 1) / duration) * 100);
      }
    }, 1000);
    
    // Cleanup
    return () => {
      isMountedRef.current = false;
      clearInterval(timer);
    };
  }, [duration, onComplete, timeLeft]);
  
  return (
    <div className="mb-3">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-slate-500">Auto-applying in {timeLeft}s</span>
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onComplete();
          }}
          className="text-xs text-amber-700 hover:text-amber-900 transition-colors"
        >
          Apply now
        </button>
      </div>
      <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-amber-500 transition-all duration-300 ease-linear"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
};

// ----- Feature Demo Card Component -----
// Extracted for better organization and reusability
const FeatureCard = ({ 
  title, 
  icon, 
  isExpanded, 
  onToggle, 
  color,
  children 
}: { 
  title: string, 
  icon: React.ReactNode, 
  isExpanded: boolean, 
  onToggle: () => void, 
  color: string,
  children: React.ReactNode 
}) => {
  // Color scheme mapping based on theme
  const colorSchemes = {
    amber: {
      border: 'border-amber-100',
      ring: 'ring-amber-300',
      iconBg: 'bg-amber-50',
      iconText: 'text-amber-600',
      iconHoverBg: 'group-hover:bg-amber-100',
      iconHoverText: 'group-hover:text-amber-700',
      dropdownBg: 'bg-amber-50',
      gradientFrom: 'from-amber-200',
      gradientVia: 'via-amber-400',
      gradientTo: 'to-amber-200'
    },
    blue: {
      border: 'border-blue-100',
      ring: 'ring-blue-300',
      iconBg: 'bg-blue-50',
      iconText: 'text-blue-600',
      iconHoverBg: 'group-hover:bg-blue-100',
      iconHoverText: 'group-hover:text-blue-700',
      dropdownBg: 'bg-blue-50',
      gradientFrom: 'from-blue-200',
      gradientVia: 'via-blue-400',
      gradientTo: 'to-blue-200'
    },
    purple: {
      border: 'border-purple-100',
      ring: 'ring-purple-300',
      iconBg: 'bg-purple-50',
      iconText: 'text-purple-600',
      iconHoverBg: 'group-hover:bg-purple-100',
      iconHoverText: 'group-hover:text-purple-700',
      dropdownBg: 'bg-purple-50',
      gradientFrom: 'from-purple-200',
      gradientVia: 'via-purple-400',
      gradientTo: 'to-purple-200'
    }
  };
  
  const scheme = colorSchemes[color as keyof typeof colorSchemes] || colorSchemes.amber;
  
  return (
    <div 
      className={`flex-1 bg-white border ${scheme.border} rounded-xl shadow-md hover:shadow-lg 
        transition-all duration-300 overflow-hidden group ${isExpanded ? `ring-1 ${scheme.ring}` : ''}`}
    >
      <div 
        className="p-4 cursor-pointer flex items-center justify-between"
        onClick={onToggle}
      >
        <div className="flex items-center">
          <div className={`w-9 h-9 mr-3 ${scheme.iconBg} ${scheme.iconText} rounded-lg flex items-center 
            justify-center transition-all duration-300 ${scheme.iconHoverBg} ${scheme.iconHoverText}`}>
            {icon}
          </div>
          <h3 className="font-medium text-slate-800 text-base">{title}</h3>
        </div>
        
        <div className={`p-1 rounded-full transition-colors duration-300 ${isExpanded ? scheme.dropdownBg : ''}`}>
          <svg 
            className={`w-4 h-4 ${scheme.iconText} transition-transform duration-300 ${
              isExpanded ? 'rotate-180' : ''
            }`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      
      <div 
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? 'max-h-48' : 'max-h-0'
        }`}
      >
        <div className="px-4 pb-4 pt-0">
          <div className="h-px bg-slate-100 w-full mb-3"></div>
          {children}
        </div>
      </div>
      
      <div className={`h-0.5 bg-gradient-to-r ${scheme.gradientFrom} ${scheme.gradientVia} ${scheme.gradientTo} 
        transition-all duration-500 ${isExpanded ? 'opacity-100' : 'opacity-0'}`}></div>
    </div>
  );
};

// ----- Main Home Component -----
export default function Home() {
  const router = useRouter();
  
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
    setSpecialLensRequest
  } = useAppStore();
  
  // ----- State Management -----
  // Form and content state
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
    fullCitation: ''
  });
  
  // UI state
  const [activeTab, setActiveTab] = useState('text');
  const [expandedFeature, setExpandedFeature] = useState<number | null>(null);
  const [formValid, setFormValid] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showFAQModal, setShowFAQModal] = useState(false);
  const [showMetadataModal, setShowMetadataModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Demo and options state
  const [showDemoOptions, setShowDemoOptions] = useState(false);
  const [selectedDemo, setSelectedDemo] = useState<number | null>(null);
  const [useAIVision, setUseAIVision] = useState(false);
  const [fields, setFields] = useState({
    visionModel: 'gemini-2.0-pro-exp-02-05' // Default to Gemini
  });
  
  // Metadata detection state
  const [disableMetadataDetection, setDisableMetadataDetection] = useState(false);
  const [detectedMetadata, setDetectedMetadata] = useState<any>(null);
  const [showMetadataPrompt, setShowMetadataPrompt] = useState(false);
  const [isExtractingMetadata, setIsExtractingMetadata] = useState(false);
  const [expandedFields, setExpandedFields] = useState({
    additionalInfo: false,
    researchGoals: false 
  });
  
  // Use refs to track async operations and prevent duplicate calls
  const metadataExtractionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastExtractedTextRef = useRef<string>('');
  
  // ----- Effects and Handlers -----
  
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
  
  // Animation on mount
  useEffect(() => {
    // Start animation after slight delay for smoother appearance
    const animationTimer = setTimeout(() => {
      setAnimateIn(true);
    }, 50);
    
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
      if (showDemoOptions) {
        setShowDemoOptions(false);
      }
    };
    
    // Add listener with a slight delay to avoid immediate closure
    const timeoutId = setTimeout(() => {
      if (showDemoOptions) {
        document.addEventListener('click', handleClickOutside);
      }
    }, 100);
    
    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showDemoOptions]);

  // ----- Metadata Functions -----
  
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
          
          const metadata = await response.json();
          
          // Add timestamp to track when this metadata was detected
          metadata._timestamp = Date.now();
          
          // Only show prompt if we have meaningful metadata
          if (metadata.date || metadata.author || metadata.title) {
            setDetectedMetadata(metadata);
            setShowMetadataPrompt(true);
          }
          
          resolve(metadata);
        } catch (error) {
          console.error("Error extracting metadata:", error);
          resolve(null);
        } finally {
          setIsExtractingMetadata(false);
        }
      }, 800); // 800ms debounce
    });
  }, [disableMetadataDetection, isExtractingMetadata]);
  
  // Apply detected metadata
  const applyDetectedMetadata = useCallback(() => {
    if (!detectedMetadata) return;
    
    setLocalMetadata(prevMetadata => {
      const newMetadata = { ...prevMetadata };
      
      // Only overwrite empty fields unless the value is significantly better
      if (detectedMetadata.date && (!prevMetadata.date.trim() || detectedMetadata.date.length > prevMetadata.date.length + 2)) {
        newMetadata.date = detectedMetadata.date;
      }
      
      if (detectedMetadata.author && (!prevMetadata.author.trim() || detectedMetadata.author.length > prevMetadata.author.length + 3)) {
        newMetadata.author = detectedMetadata.author;
      }
      
      // Always use detected research value if provided
      if (detectedMetadata.researchValue) {
        newMetadata.researchGoals = detectedMetadata.researchValue;
      }
      
      // Add optional fields with null checks
      Object.entries({
        title: detectedMetadata.title,
        summary: detectedMetadata.summary,
        documentEmoji: detectedMetadata.documentEmoji,
        placeOfPublication: detectedMetadata.placeOfPublication,
        genre: detectedMetadata.genre,
        documentType: detectedMetadata.documentType,
        academicSubfield: detectedMetadata.academicSubfield,
        fullCitation: detectedMetadata.fullCitation
      }).forEach(([key, value]) => {
        if (value) {
          (newMetadata as any)[key] = value;
        }
      });
      
      // Handle tags which might be array or string
      if (detectedMetadata.tags) {
        newMetadata.tags = Array.isArray(detectedMetadata.tags) 
          ? detectedMetadata.tags 
          : typeof detectedMetadata.tags === 'string'
            ? detectedMetadata.tags.split(',').map((tag: string) => tag.trim())
            : [];
      }
      
      return newMetadata;
    });
    
    // Hide the prompt after applying
    setShowMetadataPrompt(false);
  }, [detectedMetadata]);

  // Handle metadata modal save
  const handleSaveMetadata = useCallback((updatedMetadata: Metadata) => {
    setLocalMetadata(updatedMetadata);
  }, []);
  
  // ----- Demo/Example Functions -----
  
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
    targetPanel: 'roleplay' | 'detailed-analysis' | 'counter' | 'references' | 'extract-info' | 'highlight'
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


  // --- Main UI ---
  return (
    <main className="min-h-screen flex flex-col bg-slate-100/50 overflow-x-hidden overflow-y-auto">
      {/* Hero section with background image, gradient overlay and animation */}
      <div className="relative shadow-2xl transition-all duration-1000 ease-out overflow-hidden" 
    style={{ height: animateIn ? (isMobile ? '320px' : '235px') : '0px' }}>
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
        
        {/* Header controls with improved positioning */}
        <div className="fixed top-0 right-0 left-0 z-50 flex justify-between p-6">
          <div className="flex items-center">
            <span className="text-white/90 text-sm bg-white/10 backdrop-blur-sm py-1.5 px-3 rounded-full">
              BETA
            </span>
          </div>

          {/* Menu button with consistent styling */}
          <div className="backdrop-blur-sm rounded-full hover:bg-white/10 transition-all duration-300">
            <HamburgerMenu />
          </div>
        </div>

        {/* Improved hero content with better typography */}
        <div className="relative z-10 max-w-4xl mx-auto px-1 flex flex-col justify-center items-center text-center pt-2"
        style={{ paddingTop: '40px' }}>

          <h1 
            className={`font-serif font-bold text-white mb-2 transition-all duration-1000 transform ${
              isMobile ? 'text-4xl' : 'md:text-6xl'
            } ${
              animateIn ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}
            style={{ 
              textShadow: '0 2px 12px rgba(0, 0, 0, 0.7)',
              letterSpacing: '-0.02em'
            }}
          >
            SourceLens
          </h1>

          <p 
            className={`${isMobile ? 'text-lg' : 'text-xl md:text-2xl'} text-white/95 max-w-2xl transition-all duration-1000 delay-200 transform font-light leading-relaxed ${
              animateIn ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}
            style={{ textShadow: '0 3px 12px rgba(0,0,0,0.9)' }}
          >
            Illuminate historical primary sources through multiple perspectives
          </p>
          
          {/* Enhanced buttons with consistent styling */}
          <div className={`flex gap-4 mt-3 transition-all duration-1000 delay-300 transform ${
            animateIn ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            <button
              onClick={() => setShowAboutModal(true)}
              className="px-3 py-2 bg-blue-300/20 backdrop-blur-sm text-white text-sm font-medium border-2 border-white/20 rounded-lg shadow-lg hover:bg-blue-600/40 hover:border-white/30 transition-all duration-300"
            >
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                About
              </span>
            </button>
            
            <button
              onClick={() => setShowFAQModal(true)}
              className="px-4 py-2 bg-amber-400/20 backdrop-blur-sm text-white text-sm font-medium border-2 border-amber-500/30 rounded-lg shadow-lg hover:bg-amber-600/40 hover:border-amber-500/40 transition-all duration-300"
            >
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Beginner&apos;s Guide
              </span>
            </button>
            
            <button
              onClick={() => router.push('/library')}
              className="px-4 py-2 bg-purple-400/20 backdrop-blur-sm text-white text-sm font-medium border-2 border-white/20 rounded-lg shadow-lg hover:bg-purple-600/40 hover:border-white/30 transition-all duration-300"
            >
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Library
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Replaced gradient divider with more subtle version */}
      <div className="h-1 bg-gradient-to-r from-slate-200 via-amber-300 to-slate-300 shadow-sm"></div>

      {/* Main content - Enhanced UI */}
      <div className="flex-1 max-w-7xl mx-auto px-3 py-3 -mt-0 relative z-10">
        
        {/* Feature cards section */}
        <div className={`flex mt-2 flex-col md:flex-row items-start gap-4 transition-all duration-700 transform ${
          animateIn ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          
          {/* Multiple Perspectives - Refined Amber theme */}
          <div 
            className={`flex-1 bg-white border border-amber-100 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 group ${
              expandedFeature === 0 ? 'ring-1 ring-amber-300' : ''
            }`}
          >
            <div 
              className="p-4 cursor-pointer flex items-center justify-between"
              onClick={() => setExpandedFeature(expandedFeature === 0 ? null : 0)}
            >
              <div className="flex items-center">
                <div className="w-9 h-9 mr-3 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:bg-amber-100 group-hover:text-amber-700">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-medium text-slate-800 text-base">Multiple Perspectives</h3>
              </div>
              
              <div className={`p-1 rounded-full transition-colors duration-300 ${expandedFeature === 0 ? 'bg-amber-50' : ''}`}>
                <svg 
                  className={`w-4 h-4 text-amber-500 transition-transform duration-300 ${
                    expandedFeature === 0 ? 'rotate-180' : ''
                  }`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            
            <div 
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                expandedFeature === 0 ? 'max-h-48' : 'max-h-0'
              }`}
            >
              <div className="px-4 pb-4 pt-0">
                <div className="h-px bg-slate-100 w-full mb-3"></div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Analyze and organize data in sources to uncover layers of meaning and interpretation that might otherwise remain hidden.
                </p>

                {/* multiple perspectives example demos */}
                <div className="mt-4 flex flex-wrap gap-2 justify-start">
                  <button
                    className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-full bg-slate-100 text-slate-700 hover:bg-amber-50 hover:text-amber-700 transition-colors"
                    onClick={() => handleQuickDemo(1, 'extract-info')} // Index 1 is the Pelbartus de Themeswar demon treatise
                  >
                    <svg className="w-3.5 h-3.5 mr-1 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    List all demons in a 16th century treatise
                  </button>
                  <button
                    className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-full bg-slate-100 text-slate-700 hover:bg-amber-50 hover:text-amber-700 transition-colors"
                    onClick={() => {/* Implement language detection */}}
                  >
                    <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10m-11.048-2.5A18.022 18.022 0 0110 8.6" />
                    </svg>
                    Extract drug names from a pharmacopeia
                  </button>
                </div>
              </div>
            </div>
            
            <div className={`h-0.5 bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 transition-all duration-500 ${expandedFeature === 0 ? 'opacity-100' : 'opacity-0'}`}></div>
          </div>

          {/* Author Roleplay - Refined Blue theme */}
          <div 
            className={`flex-1 bg-white border border-blue-100 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group ${
              expandedFeature === 1 ? 'ring-1 ring-blue-300' : ''
            }`}
          >
            <div 
              className="p-4 cursor-pointer flex items-center justify-between"
              onClick={() => setExpandedFeature(expandedFeature === 1 ? null : 1)}
            >
              <div className="flex items-center">
                <div className="w-9 h-9 mr-3 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:bg-blue-100 group-hover:text-blue-700">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                  </svg>
                </div>
                <h3 className="font-medium text-slate-800 text-base">Simulation Mode</h3>
              </div>
              
              <div className={`p-1 rounded-full transition-colors duration-300 ${expandedFeature === 1 ? 'bg-blue-50' : ''}`}>
                <svg 
                  className={`w-4 h-4 text-blue-500 transition-transform duration-300 ${
                    expandedFeature === 1 ? 'rotate-180' : ''
                  }`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            
            <div 
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                expandedFeature === 1 ? 'max-h-48' : 'max-h-0'
              }`}
            >
              <div className="px-4 pb-4 pt-0">
                <div className="h-px bg-slate-100 w-full mb-3"></div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Engage in simulated conversations with historical figures based on their writings and contexts to gain deeper insights into their worldview.
                </p>
                <div className="mt-4 flex flex-wrap gap-2 justify-start">
                  <button
                    className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-full bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                    onClick={() => handleQuickDemo(0, 'roleplay')} // Index 0 is the Ea-nasir complaint demo
                  >
                    <svg className="w-3.5 h-3.5 mr-1 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    Discuss Ea-nāṣir&apos;s insultingly bad copper
                  </button>
                  <button
                    className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-full bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                    onClick={() => handleQuickDemo(8, 'roleplay')} // Index 5 is the Freud's cocaine treatise
                  >
                    <svg className="w-3.5 h-3.5 mr-1 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                    </svg>
                    Ask a young Freud about his passion for cocaine
                  </button>
                </div>
              </div>
            </div>
            
            <div className={`h-0.5 bg-gradient-to-r from-blue-200 via-blue-400 to-blue-200 transition-all duration-500 ${expandedFeature === 1 ? 'opacity-100' : 'opacity-0'}`}></div>
          </div>
          
          {/* Counter-Narratives - Refined Purple theme */}
          <div 
            className={`flex-1 bg-white border border-purple-100 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group ${
              expandedFeature === 2 ? 'ring-1 ring-purple-300' : ''
            }`}
          >
            <div 
              className="p-4 cursor-pointer flex items-center justify-between"
              onClick={() => setExpandedFeature(expandedFeature === 2 ? null : 2)}
            >
              <div className="flex items-center">
                <div className="w-9 h-9 mr-3 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:bg-purple-100 group-hover:text-purple-700">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 7h12m0 0l-4-4m4 4l-4 4m-4 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
                <h3 className="font-medium text-slate-800 text-base">Counter-Narratives</h3>
              </div>
              
              <div className={`p-1 rounded-full transition-colors duration-300 ${expandedFeature === 2 ? 'bg-purple-50' : ''}`}>
                <svg 
                  className={`w-4 h-4 text-purple-500 transition-transform duration-300 ${
                    expandedFeature === 2 ? 'rotate-180' : ''
                  }`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            
            <div 
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                expandedFeature === 2 ? 'max-h-48' : 'max-h-0'
              }`}
            >
              <div className="px-4 pb-4 pt-0">
                <div className="h-px bg-slate-100 w-full mb-3"></div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Discover alternative interpretations that challenge conventional views and surface overlooked aspects of history.
                </p>
                <div className="mt-4 flex flex-wrap gap-2 justify-start">
                  <button
                    className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-full bg-slate-100 text-slate-700 hover:bg-purple-50 hover:text-purple-700 transition-colors"
                    onClick={() => handleHighlightDemo(4, 'highlight ALL names for materia medica in this text that appear to be of Sub-Saharan origin')}
                  >
                    <svg className="w-3.5 h-3.5 mr-1 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Find African names in an 18th century drug guide
                  </button>
                  <button
                    className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-full bg-slate-100 text-slate-700 hover:bg-purple-50 hover:text-purple-700 transition-colors"
                    onClick={handleManhattanNarrative}
                  >
                    <svg className="w-3.5 h-3.5 mr-1 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    What if Manhattan narrated its own history?
                  </button>
                </div>
              </div>
            </div>
            
            {/* top gradient divider */}
            <div className={`h-0.5 bg-gradient-to-r from-purple-200 via-purple-400 to-purple-200 transition-all duration-500 ${expandedFeature === 2 ? 'opacity-100' : 'opacity-0'}`}></div>
          </div>
        </div>
              
        {/* Input and metadata form */}
        <div className="grid grid-cols-1 md:grid-cols-14 py-3 gap-4 mt-2">
          {/* Source input section with enhanced styling */}
          <div 
            className={`md:col-span-7 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-slate-200/80 ${
              animateIn ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}
          >
            <div className="p-5">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-2 relative">
                <h2 className="text-xl font-semibold text-slate-800 flex items-center">
                  1. Input Your Source
                </h2>
                
                {/* Demo button and dropdown section */}
                <div className="relative ">
                  {/* Demo options button */}
                  <button 
                    id="demo-options-button"
                    onClick={(e) => toggleDemoOptions(e)}
                    className="cursor-pointer text-amber-700 hover:text-amber-800 text-sm font-medium flex items-center gap-1 px-4 py-1 rounded-full border border-amber-200 bg-amber-50 hover:bg-amber-100 transition-all duration-300 shadow-md hover:shadow-lg"
                    aria-expanded={showDemoOptions}
                    aria-controls="demo-dropdown"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    See how it works
                  </button>

                  {/* Backdrop overlay when dropdown is open */}
               {showDemoOptions && (
                 <div 
                   className="fixed inset-0 bg-black/10 z-[100]  transition-opacity duration-300 rounded-xl"
                   onClick={() => setShowDemoOptions(false)}
                   aria-hidden="true"
                 />
               )}

                  {/* Demo options dropdown */}
                  {showDemoOptions && (
                    <div 
                      id="demo-dropdown"
                      className=" sm:absolute top-full right-0 mt-3 bg-white/94 backdrop-blur-md rounded-lg shadow-2xl border-1 border-stone-300 p-3  sm:z-100 z-100 w-[80vw] sm:w-[460px] max-h-[40vh] sm:max-h-[520px] overflow-y-auto"
                      style={{
                        animation: 'dropdownAppear 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                        transformOrigin: 'top right',
                        maxWidth: '500px'
                      }}
                    >
                    
                      
                      {/* Custom keyframes for dropdown animations */}
                      <style jsx>{`
                        @keyframes dropdownAppear {
                          0% { opacity: 0; transform: scale(0.95) translateY(-10px); }
                          50% { opacity: 1; }
                          100% { opacity: 1; transform: scale(1) translateY(0); }
                        }
                        
                        @keyframes itemsAppear {
                          0% { opacity: 0; transform: translateY(8px); }
                          100% { opacity: 1; transform: translateY(0); }
                        }
                        
                        .demo-item {
                          animation: itemsAppear 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                          opacity: 0;
                        }
                        
                        .demo-item:nth-child(1) { animation-delay: 0.05s; }
                        .demo-item:nth-child(2) { animation-delay: 0.1s; }
                        .demo-item:nth-child(3) { animation-delay: 0.15s; }
                        .demo-item:nth-child(4) { animation-delay: 0.2s; }
                        .demo-item:nth-child(5) { animation-delay: 0.23s; }
                        .demo-item:nth-child(6) { animation-delay: 0.28s; }
                        .demo-item:nth-child(7) { animation-delay: 0.32s; }
                        
                        @keyframes fadeRotateIn {
                          0% { opacity: 0; transform: rotate(-90deg); }
                          100% { opacity: 1; transform: rotate(0); }
                        }
                        
                        .close-btn-animate {
                          animation: fadeRotateIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
                          animation-delay: 0.2s;
                          opacity: 0;
                        }
                        
                        .footer-animate {
                          animation: itemsAppear 0.3s ease forwards;
                          animation-delay: 0.3s;
                          opacity: 0;
                        }
                      `}</style>
                      
                      <div className="flex items-center justify-between mb-1 pb-1 border-b border-slate-100">
                        <h4 className="text-base font-semibold text-slate-800">Choose an example</h4>
                        <button 
                          onClick={() => setShowDemoOptions(false)}
                          className="text-slate-400 hover:text-slate-700 transition-colors p-0 rounded-full hover:bg-slate-200 close-btn-animate"
                          aria-label="Close dropdown"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>

                      {/* Demo object rendering */}
                      <div className="flex flex-col gap-2 px-2">
                        {demoTexts.map((demo, index) => (
                          <div key={index} className="relative group demo-item">
                            <button
                              onClick={() => {
                                loadDemoContent(index);
                                setShowDemoOptions(false);
                              }}
                              className={`flex items-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-all duration-300 hover:shadow-md ${
                                selectedDemo === index ? 'ring-4 ring-amber-500 shadow-amber-100/50' : 'shadow-sm'
                              } w-full text-left group overflow-hidden`}
                            >
                              <div className="flex items-center w-full">
                                {/* Emoji container for demos */}
                                <div className="flex items-center justify-center min-w-14 h-14 bg-slate-50 text-2xl transition-all duration-300 group-hover:bg-amber-200/70 group-hover:text-amber-600 overflow-hidden"> 
                                  <span className="transition-all duration-300 group-hover:scale-130 group-hover:ring-amber-900 ">
                                    {demo.emoji}
                                  </span>
                                </div>
                                
                                {/* Content area for demo */}
                                <div className="px-3 py-2.5 text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">
                                  <span className="block tracking-tight">{demo.title}</span>
                                  <p className="text-xs tracking-tight text-slate-500 mt-0.5 line-clamp-1 group-hover:text-slate-600 transition-all">
                                    {demo.description || "Explore this historical text"}
                                  </p>
                                </div>
                                
                                {/* Arrow indicator for demos */}
                                <div className="ml-auto pr-3 text-amber-500 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                  </svg>
                                </div>
                              </div>
                              
                              <div className="absolute inset-0 pointer-events-none rounded-lg border border-transparent group-hover:border-amber-400/90 transition-all duration-300"></div>
                              
                              {/* Subtle gradient effect that appears on hover */}
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-900/0 to-amber-200/0 group-hover:via-amber-200/20 group-hover:to-amber-100/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                            </button>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-3 pt-2 border-t border-slate-100 text-xs text-center text-slate-500 footer-animate">
                        You can also upload your own document. Try it!
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Source Upload Component */}
            
              <SourceUpload
                onTextChange={setTextInput}
                onMetadataDetected={metadata => {
                  setDetectedMetadata(metadata);
                  setShowMetadataPrompt(true);
                }}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                useAIVision={useAIVision}
                onAIVisionChange={setUseAIVision}
                visionModel={fields.visionModel}
                onVisionModelChange={(model) => setFields({...fields, visionModel: model})}
                disableMetadataDetection={disableMetadataDetection}
              />
            </div>
          </div>
            
          {/* Metadata form section */}
          <div 
            className={`md:col-span-7 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-slate-200 overflow-hidden transition-all duration-700 delay-200 transform ${
              animateIn ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}
          >
            <div className="p-5">
              <div className="flex justify-between items-center mt-1 mb-1 z-1">
                <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-3 z-1">
                  <svg className="w-5 h-5 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  2. Add Metadata
                </h2>
                
                {/* Metadata detection indicator */}
                {isExtractingMetadata ? (
                  <div className="text-xs text-amber-700 flex items-center">
                    <div className="w-3 h-3 border-2 border-amber-700 border-t-transparent rounded-full animate-spin mr-1"></div>
                    Detecting metadata...
                  </div>
                ) : (
                  /* Add the thumbnail on the right side when not showing extraction status */
                  (metadata?.thumbnailUrl || sourceThumbnailUrl) && (
                    <div 
                       className="absolute right-4 w-14 h-14 overflow-hidden rounded-full border-2 border-amber-300 shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl group"
                       title="Document thumbnail"
                     >
                      <Image 
                        src={metadata?.thumbnailUrl || sourceThumbnailUrl || '/placeholder.jpg'}
                        alt="Document preview"
                        width={62}
                        height={62}
                        className="object-cover rounded-full"
                      />
                      {/* Add a subtle gradient overlay on hover */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      {/* Add a subtle ring glow effect */}
                      <div className="absolute -inset-0.5 bg-gradient-to-tr from-amber-300/10 to-amber-500/20 rounded-full opacity-0 group-hover:opacity-40 blur-sm transition-opacity duration-300"></div>
                      
                      {/* Inner shadow for depth */}
                      <div className="absolute inset-0 shadow-inner ring-2 ring-inset ring-white/0"></div>
                    </div>
                  )
                )}
              </div>
              
 {/* Metadata detection overlay */}
 {showMetadataPrompt && detectedMetadata && (
   <div className="absolute inset-0 z-10 flex items-center justify-center animate-in fade-in duration-300">
     <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-[2px]" onClick={() => setShowMetadataPrompt(false)}></div>
     <div 
       className="relative bg-white/95 border-2 border-amber-200 rounded-lg shadow-xl max-w-md w-full p-4 mx-4 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
       onKeyDown={(e) => {
         if (e.key === 'Enter') {
           applyDetectedMetadata();
           setShowMetadataPrompt(false);
         }
       }}
       tabIndex={0} // Make div focusable to capture Enter key
       id="metadata-prompt-modal" // Add an ID for more reliable selection
     >
       <div className="flex justify-between items-start mb-2">
         <h3 className="text-sm font-semibold text-amber-900 flex items-center">
           <span className="inline-flex items-center justify-center w-5 h-5 mr-2 bg-amber-100 rounded-full">
             <svg className="w-3.5 h-3.5 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
             </svg>
           </span>
           Metadata Detected
         </h3>
         <button 
           onClick={() => setShowMetadataPrompt(false)}
           className="text-slate-400 hover:text-slate-700 transition-colors rounded-full hover:bg-slate-100 p-1"
         >
           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
           </svg>
         </button>
       </div>
       
       <div className="bg-amber-50/70 rounded-md p-3 mb-3 border border-amber-100">
         <p className="text-xs text-amber-800 font-medium mb-1">SourceLens detected the following data:</p>
         <div className="space-y-1 text-xs">
           {detectedMetadata.title && (
             <div className="flex">
               <span className="font-medium w-14 text-amber-700">Title:</span>
               <span className="text-slate-700">{detectedMetadata.title}</span>
             </div>
           )}
           {detectedMetadata.author && (
             <div className="flex">
               <span className="font-medium w-14 text-amber-700">Author:</span>
               <span className="text-slate-700">{detectedMetadata.author}</span>
             </div>
           )}
           {detectedMetadata.date && (
             <div className="flex">
               <span className="font-medium w-14 text-amber-700">Date:</span>
               <span className="text-slate-700">{detectedMetadata.date}</span>
             </div>
           )}
           {detectedMetadata.documentType && (
             <div className="flex">
               <span className="font-medium w-14 text-amber-700">Type:</span>
               <span className="text-slate-700">{detectedMetadata.documentType}</span>
             </div>
           )}
         </div>
       </div>
       
       <MetadataAutoTimer 
         onComplete={() => {
           applyDetectedMetadata();
           setShowMetadataPrompt(false);
         }}
         duration={5}
       />
       
       <div className="flex space-x-3">
         <button
           onClick={() => setShowMetadataPrompt(false)}
           className="flex-1 py-1.5 bg-slate-100 text-slate-700 text-xs font-medium rounded hover:bg-slate-200 transition-colors"
         >
           Ignore
         </button>
         <button
           onClick={() => {
             applyDetectedMetadata();
             setShowMetadataPrompt(false);
           }}
           className="flex-1 py-1.5 bg-amber-600 text-white text-xs font-medium rounded hover:bg-amber-700 transition-colors"
         >
           Apply Metadata
         </button>
       </div>
     </div>
   </div>
 )}
              
              <div className="space-y-2 p-2">
                {/* Required fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Date input */}
                  <div className="group">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      <span className="flex items-center justify-between w-full">
                        <span className="inline-flex items-center gap-1">
                          Date <span className="text-red-500">*</span>
                        </span>
                        <span className="text-xs text-slate-400 mr-2 hidden group-focus-within:inline">
                          Can be approximate
                        </span>
                      </span>
                    </label>
                    <input
                      type="text"
                      className="w-full p-2 border border-slate-300 rounded-md focus-visible:ring-2 focus-visible:ring-amber-700/50 focus-visible:border-amber-700/70 transition-colors"
                      placeholder="When created? (required)"
                      value={metadata.date}
                      onChange={(e) => setLocalMetadata({ ...metadata, date: e.target.value })}
                    />
                  </div>
                  
                  {/* Author input */}
                  <div className="group">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      <span className="flex items-center justify-between w-full">
                        <span className="inline-flex items-center gap-1">
                          Author <span className="text-red-500">*</span>
                        </span>
                        <span className="text-xs text-slate-400 mr-2 hidden group-focus-within:inline">
                          If unsure, just type &quot;unknown&quot;
                        </span>
                      </span>
                    </label>
                    <input
                      type="text"
                      className="w-full p-2 border border-slate-300 rounded-md focus-visible:ring-2 focus-visible:ring-amber-700/50 focus-visible:border-amber-700/70 transition-colors"
                      placeholder="Who created it? (required)"
                      value={metadata.author}
                      onChange={(e) => setLocalMetadata({ ...metadata, author: e.target.value })}
                    />
                  </div>
                </div>
                
                {/* Title input */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Title (Optional)
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border border-slate-300 rounded-md focus-visible:ring-2 focus-visible:ring-amber-700/50 focus-visible:border-amber-700/70 transition-colors"
                    placeholder="Title or name of document"
                    value={metadata.title || ''}
                    onChange={(e) => setLocalMetadata({...metadata, title: e.target.value})}
                  />
                </div>
                
                {/* Document Type & Tags */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Document Type */}
                  <div>
                   
                   <label className="block text-sm font-medium text-slate-700 mb-1">
                      Document Type (Optional)
                    </label>
                    <input
                      type="text"
                      className="w-full p-2 border border-slate-300 rounded-md focus-visible:ring-2 focus-visible:ring-amber-700/50 focus-visible:border-amber-700/70 transition-colors"
                      placeholder="Letter, Article, etc."
                      value={metadata.documentType || ''}
                      onChange={(e) => setLocalMetadata({...metadata, documentType: e.target.value})}
                    />
                  </div>
                  
                  {/* Tags */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Tags (Optional)
                    </label>
                    <input
                      type="text"
                      className="w-full p-2 border border-slate-300 rounded-md focus-visible:ring-2 focus-visible:ring-amber-700/50 focus-visible:border-amber-700/70 transition-colors"
                      placeholder="Comma-separated tags"
                      value={Array.isArray(metadata.tags) ? metadata.tags.join(', ') : metadata.tags || ''}
                      onChange={(e) => setLocalMetadata({
                        ...metadata, 
                        tags: e.target.value.split(',').map(tag => tag.trim())
                      })}
                    />
                  </div>
                </div>
                
                <div className="mt-3">
                  {/* Research Goals input */}
                  <div 
                    onClick={() => setExpandedFields({...expandedFields, researchGoals: !expandedFields.researchGoals})} 
                    className="flex items-center justify-between cursor-pointer p-2 hover:bg-slate-50 rounded-md transition-colors"
                  >
                    <span className="text-sm font-medium text-slate-700 flex items-center">
                      Research Goals (Optional)
                    </span>
                    <svg 
                      className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${
                        expandedFields.researchGoals ? 'rotate-180' : ''
                      }`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div> 
                  
                  <div className={`overflow-hidden transition-all duration-200 ease-in-out ${
                    expandedFields.researchGoals ? 'max-h-26' : 'max-h-0'
                  }`}>
                    <textarea
                      className="w-full p-2 mt-2 border border-slate-300 rounded-md focus-visible:ring-2 focus-visible:ring-amber-700/50 focus-visible:border-amber-700/70 transition-colors resize-none"
                      rows={2}
                      placeholder="What are you trying to learn?"
                      value={metadata.researchGoals}
                      onChange={(e) => setLocalMetadata({...metadata, researchGoals: e.target.value})}
                    ></textarea>
                  </div>

                  {/* Metadata modal button */}
                  <div 
  className="flex items-center justify-between cursor-pointer p-2 hover:bg-slate-50 rounded-md transition-colors"
>
  <span className="text-sm font-medium text-slate-700 flex items-center">
    Add more fields
  </span>
  <div className="flex items-center gap-2">
    <button
      onClick={() => setShowMetadataModal(true)}
      className="text-xs text-amber-600 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 px-2 py-1 rounded-md transition-colors"
      type="button"
    >
      Edit All Metadata
    </button>
    
  </div>
</div>
                  
                  <div className={`overflow-hidden transition-all duration-200 ease-in-out ${
                    expandedFields.additionalInfo ? 'max-h-36' : 'max-h-0'
                  }`}>
                    <textarea
                      className="w-full p-2 mt-2 border border-slate-300 rounded-md focus-visible:ring-2 focus-visible:ring-amber-700/50 focus-visible:border-amber-700/70 transition-colors resize-none"
                      rows={2}
                      placeholder="Any other context that might help?"
                      value={metadata.additionalInfo}
                      onChange={(e) => setLocalMetadata({...metadata, additionalInfo: e.target.value})}
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="px-6 py-5 bg-slate-50 border-t border-slate-200">
  {!formValid ? (
    <p className="mt-0 text-xs text-slate-500 text-center">
      Please fill in all required fields and provide source text
    </p>
  ) : (
    <p className="mt-0 text-xs text-emerald-600 text-center">
      Source uploaded successfully! Click Analyze Source to begin
    </p>
  )}
</div>
          </div>
        </div>


       {/* Analysis Footer */}
<div 
  className={`max-w-7xl mx-auto w-full py-1 px-2 rounded-xl transition-opacity duration-500 ${
    animateIn ? 'opacity-100' : 'opacity-0'
  }`}
>
  <AnalysisFooter 
    formValid={formValid} 
    textInput={textInput} 
    metadata={metadata} 
  />
</div>
      </div>
      
      {/* Divider for footer */}
      <div className="h-3 mt-0 bg-gradient-to-r from-indigo-400 via-purple-400 to-amber-400 shadow-md"></div>
      
      <Footer />

      {/* Modal components */}
      <AboutModal 
        isOpen={showAboutModal} 
        onClose={() => setShowAboutModal(false)} 
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


