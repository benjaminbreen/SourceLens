// components/translate/TranslationPanel.tsx
// Streamlined translation component with advanced language selection, expandable views, and
// improved annotation system with responsive layout and enhanced typography

'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '@/lib/store';
import ReactMarkdown from 'react-markdown';
import SaveToLibraryButton from '../library/SaveToLibraryButton';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

// List of all supported languages
const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', primary: true },
  { code: 'es', name: 'Spanish', primary: true },
  { code: 'fr', name: 'French', primary: true },
  { code: 'de', name: 'German', primary: true },
  { code: 'it', name: 'Italian', primary: true },
  { code: 'zh', name: 'Chinese', primary: true },
  { code: 'ja', name: 'Japanese', primary: true },
  { code: 'ru', name: 'Russian', primary: true },
  { code: 'ar', name: 'Arabic', primary: true },
  { code: 'fa', name: 'Farsi', primary: true },
  { code: 'eme', name: 'Early Modern English', primary: false },
  { code: 'emoji', name: 'Emoji/ASCII', primary: false },
  { code: 'llmese', name: 'LLMese', primary: false },
];

// Character threshold for showing expanded view option
const EXPANDED_VIEW_THRESHOLD = 2000;

// Custom styles for annotations and tooltips
const customStyles = `
  /* Annotation styles */
  .annotation {
    position: relative;
    color: #4338ca;
    background-color: rgba(79, 70, 229, 0.1);
    border-radius: 0.25rem;
    padding: 0 0.25rem;
    margin: 0 0.1rem;
    cursor: help;
    border-bottom: 1px dotted #4338ca;
    transition: all 0.2s;
  }
  
  .annotation-dark {
    position: relative;
    color: #818cf8;
    background-color: rgba(99, 102, 241, 0.15);
    border-radius: 0.25rem;
    padding: 0 0.25rem;
    margin: 0 0.1rem;
    cursor: help;
    border-bottom: 1px dotted #818cf8;
    transition: all 0.2s;
  }
  
  .annotation:hover, .annotation-dark:hover {
    background-color: rgba(79, 70, 229, 0.2);
  }
  
  /* Tooltip styling */
  .annotation-tooltip {
    position: absolute;
    z-index: 50;
    max-width: 24rem;
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
    font-family: system-ui, sans-serif;
    font-size: 0.875rem;
    line-height: 1.4;
    pointer-events: none;
    transition: all 0.1s;
    transform: translateY(-0.5rem);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  }
  
  .tooltip-arrow {
    position: absolute;
    width: 0.75rem;
    height: 0.75rem;
    transform: rotate(45deg);
    bottom: -0.25rem;
    left: calc(50% - 0.375rem);
  }

  
  /* Tooltip styling */
  .annotation-tooltip {
    position: absolute;
    z-index: 50;
    max-width: 24rem;
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
    font-family: system-ui, sans-serif;
    font-size: 0.875rem;
    line-height: 1.4;
    pointer-events: none;
    transition: all 0.1s;
    transform: translateY(-0.5rem);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  }
  
  .tooltip-arrow {
    position: absolute;
    width: 0.75rem;
    height: 0.75rem;
    transform: rotate(45deg);
    bottom: -0.25rem;
    left: calc(50% - 0.375rem);
  }
  
  /* RTL text support */
  .rtl-text {
    direction: rtl;
    text-align: right;
  }
  
  /* Serif font for translation */
  .translation-text {
    font-family: 'Lora', 'Georgia', serif;
    line-height: 1.7;
  }
  
  /* Prose styling */
  .translation-prose p {
    margin-bottom: 1.25em;
  }
  
  .translation-prose h1, 
  .translation-prose h2, 
  .translation-prose h3, 
  .translation-prose h4 {
    margin-top: 1.5em;
    margin-bottom: 0.5em;
    font-weight: 600;
  }
  
  .translation-prose blockquote {
    border-left: 3px solid #e2e8f0;
    padding-left: 1rem;
    margin-left: 0;
    font-style: italic;
  }
  
  .translation-prose ul, 
  .translation-prose ol {
    padding-left: 1.5rem;
    margin-bottom: 1.25em;
  }
  
  .translation-prose li {
    margin-bottom: 0.5em;
  }
  
  .translation-prose a {
    color: #3182ce;
    text-decoration: underline;
  }
  
  /* Animation */
  @keyframes shimmer {
    0% { background-position: -1000px 0; }
    100% { background-position: 1000px 0; }
  }
  
  .loading-skeleton {
    background: linear-gradient(to right, #f0f0f0 8%, #e0e0e0 18%, #f0f0f0 33%);
    background-size: 1000px 100%;
    animation: shimmer 2s infinite linear;
  }
`;

interface TranslationPanelProps {
  darkMode: boolean;
}

export default function TranslationPanel({ darkMode }: TranslationPanelProps) {
  // Get state from Zustand store
  const { 
    sourceContent, 
    metadata,
    llmModel, 
    setRawPrompt,
    setRawResponse,
    setTranslationOptions,
    translationOptions,
    setTranslatedText,
    translatedText: storeTranslatedText,
  } = useAppStore();

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [isOptionsPanelOpen, setIsOptionsPanelOpen] = useState(true); // Start with options panel open
  const [showMoreLanguages, setShowMoreLanguages] = useState(false);
  const [showExpandedView, setShowExpandedView] = useState(false);
  const [selectedExplanationLevel, setSelectedExplanationLevel] = useState(translationOptions.explanationLevel);
  const [translationText, setTranslationText] = useState<string>('');
  const [cachedTranslations, setCachedTranslations] = useState<Record<string, string>>({});
  const [selectedLanguage, setSelectedLanguage] = useState<string>(translationOptions.targetLanguage);
  const [pendingLanguage, setPendingLanguage] = useState<string | null>(null);
  const [activeTooltip, setActiveTooltip] = useState<{
    show: boolean;
    text: string;
    explanation: string; 
    x: number;
    y: number;
  }>({
    show: false,
    text: '',
    explanation: '',
    x: 0,
    y: 0
  });
  
  // Refs for tooltip handling
  const contentRef = useRef<HTMLDivElement>(null);
  const sliderStyleRef = useRef({ thumbSize: 16 });
  
  // Check if content is large enough for expanded view option
  const needsExpandedView = sourceContent?.length > EXPANDED_VIEW_THRESHOLD;
  
  // Monitor annotation elements and add tooltip handlers
  useEffect(() => {
    if (!contentRef.current) return;
    
    const container = contentRef.current;
    
    // Function to handle mouseover on annotations
    const handleAnnotationMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      if (target.classList.contains('annotation') || target.classList.contains('annotation-dark')) {
        // Get the annotation explanation only
        const explanation = target.getAttribute('data-explanation') || '';
        const text = target.textContent || '';
        
        if (text) {
          // Calculate position for tooltip
          const rect = target.getBoundingClientRect();
          const containerRect = container.getBoundingClientRect();
          
          setActiveTooltip({
            show: true,
            text: text, // We still store the text but don't display it
            explanation: explanation,
            x: rect.left + (rect.width / 2) - containerRect.left,
            y: rect.top - containerRect.top
          });
        }
      }
    };
    
    // Function to handle mouseout from annotations
    const handleAnnotationMouseOut = () => {
      setActiveTooltip({
        show: false,
        text: '',
        explanation: '',
        x: 0,
        y: 0
      });
    };
    
    // Add event listeners
    container.addEventListener('mouseover', handleAnnotationMouseOver);
    container.addEventListener('mouseout', handleAnnotationMouseOut);
    
    // Clean up
    return () => {
      container.removeEventListener('mouseover', handleAnnotationMouseOver);
      container.removeEventListener('mouseout', handleAnnotationMouseOut);
    };
  }, [translationText, darkMode]);
  
  // Prepare the processed content with annotations
  const processedContent = React.useMemo(() => {
    if (!translationText) return '';
    
    // For minimal explanations, just return the raw text
    if (selectedExplanationLevel === 'minimal') return translationText;
    
    // For moderate and extensive, process the annotations
    let processedText = translationText;
    
    // Instead of just finding and replacing all bracketed text, we need to
    // wrap terms IN the text with their annotations
    const bracketedTerms: {original: string; term: string; explanation: string}[] = [];
    
    // First pass: collect all bracketed terms
    const bracketPattern = /\[(.*?)\]/g;
    let match;
    while ((match = bracketPattern.exec(processedText)) !== null) {
      const fullMatch = match[0]; // The entire [term: explanation]
      const innerContent = match[1]; // Just the "term: explanation" part
      
      let term, explanation;
      if (innerContent.includes(':')) {
        const parts = innerContent.split(':');
        term = parts[0].trim();
        explanation = parts.slice(1).join(':').trim();
      } else {
        term = innerContent;
        explanation = innerContent;
      }
      
      bracketedTerms.push({
        original: fullMatch,
        term,
        explanation
      });
    }
    
    // Second pass: replace the text without disturbing the original content
    // We need to do this from end to start to avoid messing up string positions
    bracketedTerms.sort((a, b) => {
      return processedText.lastIndexOf(a.original) - processedText.lastIndexOf(b.original);
    });
    
    // Replace each term in the text
    for (const {original, term, explanation} of bracketedTerms) {
      const index = processedText.lastIndexOf(original);
      if (index !== -1) {
        // Generate a unique ID for this annotation
        const annotationId = `annotation-${Math.random().toString(36).substring(2, 10)}`;
        
        // Create annotated span HTML
        const annotatedSpan = `<span class="${darkMode ? 'annotation-dark' : 'annotation'}" 
          id="${annotationId}" 
          data-explanation="${explanation}">${term}</span>`;
        
        // Replace the original bracketed text with just the term wrapped in an annotation span
        processedText = 
          processedText.substring(0, index) + 
          annotatedSpan + 
          processedText.substring(index + original.length);
      }
    }
    
    return processedText;
  }, [translationText, selectedExplanationLevel, darkMode]);
  
  // Handle language selection
  const handleLanguageSelect = async (languageCode: string) => {
    // Already translating or same language - do nothing
    if (isLoading) return;
    
    // Update UI immediately to show the selected language
    setSelectedLanguage(languageCode);
    setPendingLanguage(languageCode);
    
    // Check if we have a cached translation
    if (cachedTranslations[languageCode]) {
      setTranslationText(cachedTranslations[languageCode]);
      setTranslatedText(cachedTranslations[languageCode]);
      setPendingLanguage(null);
      return;
    }
    
    // No cached translation, so we need to fetch one
    setIsLoading(true);
    
    try {
      // Update options in store (important for other components that need this info)
      setTranslationOptions({
        ...translationOptions,
        targetLanguage: languageCode,
        explanationLevel: selectedExplanationLevel
      });
      
      // Make the API request
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source: sourceContent,
          metadata: metadata,
          targetLanguage: languageCode,
          explanationLevel: selectedExplanationLevel,
          literalToPoetic: translationOptions.literalToPoetic,
          preserveLineBreaks: translationOptions.preserveLineBreaks,
          includeAlternatives: translationOptions.includeAlternatives,
          modelId: llmModel,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Translation request failed: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Store the raw request/response for transparency
      setRawPrompt(data.rawPrompt || null);
      setRawResponse(data.rawResponse || null);
      
      // Update the cache and display the translation
      const newTranslation = data.translation || '';
      setCachedTranslations(prev => ({
        ...prev,
        [languageCode]: newTranslation
      }));
      
      setTranslationText(newTranslation);
      setTranslatedText(newTranslation);
      
    } catch (error) {
      console.error('Translation error:', error);
    } finally {
      setIsLoading(false);
      setPendingLanguage(null);
    }
  };
  
  // Handle explanation level change
  const handleExplanationLevelChange = (level: string) => {
    setSelectedExplanationLevel(level as 'minimal' | 'moderate' | 'extensive');
    
    // If we have a translation, update the options and refetch
    if (translationText) {
      setTranslationOptions({
        ...translationOptions,
        explanationLevel: level as 'minimal' | 'moderate' | 'extensive'
      });
      
      // Clear the cache for this language to force refetch
      setCachedTranslations(prev => {
        const newCache = {...prev};
        delete newCache[selectedLanguage];
        return newCache;
      });
      
      // Refetch with the new explanation level
      handleLanguageSelect(selectedLanguage);
    }
  };
  
  // Effect to sync store translatedText with local state
  useEffect(() => {
    if (storeTranslatedText && storeTranslatedText !== translationText) {
      setTranslationText(storeTranslatedText);
    }
  }, [storeTranslatedText]);
  
  // Update UI when TranslationOptions change
  useEffect(() => {
    if (translationOptions.targetLanguage !== selectedLanguage) {
      setSelectedLanguage(translationOptions.targetLanguage);
    }
    
    if (translationOptions.explanationLevel !== selectedExplanationLevel) {
      setSelectedExplanationLevel(translationOptions.explanationLevel);
    }
  }, [translationOptions]);
  
  // Get language display name
  const getLanguageDisplayName = (code: string) => {
    return SUPPORTED_LANGUAGES.find(lang => lang.code === code)?.name || code;
  };
  
  // Is the current language RTL?
  const isRTL = ['ar', 'fa'].includes(selectedLanguage);

  // Filter primary languages (for main display) and secondary languages (for dropdown)
  const primaryLanguages = SUPPORTED_LANGUAGES.filter(lang => lang.primary);
  const secondaryLanguages = SUPPORTED_LANGUAGES.filter(lang => !lang.primary);
  
  return (
    <div className="space-y-5">
      {/* Custom styles for annotations and tooltips */}
      <style>{customStyles}</style>
      
      {/* Header section with title and controls */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <svg 
            className={`w-5 h-5 ${darkMode ? 'text-cyan-400' : 'text-cyan-700'}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M9.5 14.5a18.022 18.022 0 01-1.5-5" />
          </svg>
          
          <h3 className={`text-lg font-medium ${darkMode ? 'text-cyan-300' : 'text-cyan-900'}`}>
            Translation to {getLanguageDisplayName(selectedLanguage)}
          </h3>
          
          {selectedExplanationLevel !== 'minimal' && (
            <div 
              className={`ml-2 text-xs font-medium ${
                darkMode 
                  ? 'bg-cyan-900/50 text-cyan-300 border border-cyan-700/50' 
                  : 'bg-cyan-100 text-cyan-900 border border-cyan-200'
              } rounded-full px-2 py-0.5`}
            >
              {selectedExplanationLevel === 'moderate' 
                ? 'Brief notes' 
                : 'Detailed notes'}
            </div>
          )}
          
          {isLoading && (
            <div className="ml-2 flex items-center">
              <div className={`w-3 h-3 rounded-full animate-pulse ${darkMode ? 'bg-cyan-400' : 'bg-cyan-600'}`}></div>
            </div>
          )}
        </div>
        
        <div className="flex space-x-2">
          {/* Expanded view button only for long content */}
          {needsExpandedView && translationText && (
            <button
              onClick={() => setShowExpandedView(true)}
              className={`flex items-center px-3 py-1.5 text-sm rounded-md ${
                darkMode 
                  ? 'bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700'
                  : 'hover:bg-cyan-100 text-cyan-700'
              }`}
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
              Expanded View
            </button>
          )}
          
          {/* Options button */}
          <button
            onClick={() => setIsOptionsPanelOpen(!isOptionsPanelOpen)}
            className={`flex items-center px-3 py-1.5 text-sm rounded-md ${
              darkMode 
                ? 'bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700'
                : 'hover:bg-cyan-100 text-cyan-700'
            }`}
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {isOptionsPanelOpen ? 'Hide Options' : 'Options'}
          </button>
          
          {/* Save button */}
          {translationText && (
            <SaveToLibraryButton 
              type="analysis"
              data={{
                type: 'translate',
                title: `Translation to ${getLanguageDisplayName(selectedLanguage)} ${metadata?.title ? `- ${metadata.title}` : ''}`,
                content: translationText,
                sourceName: metadata?.title || 'Untitled Source',
                sourceAuthor: metadata?.author || 'Unknown',
                sourceDate: metadata?.date || 'Unknown date',
                model: llmModel,
                perspective: `Translation to ${getLanguageDisplayName(selectedLanguage)}`,
                tags: ['translation', selectedLanguage]
              }}
              variant="primary"
              size="sm"
            />
          )}
        </div>
      </div>

      {/* Options panel (slide-down panel with languages and settings) */}
      <AnimatePresence>
        {isOptionsPanelOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-4"
          >
            <div className={`space-y-5 p-5 rounded-lg ${
              darkMode 
                ? 'bg-slate-800 border border-slate-700' 
                : 'bg-slate-50 border border-slate-200'
            }`}>
              {/* Language selector grid - Main row for primary languages */}
              <div className="mb-2">
                <div className="flex flex-wrap gap-2 mb-2">
                  {primaryLanguages.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageSelect(lang.code)}
                      disabled={isLoading}
                      className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                        selectedLanguage === lang.code
                          ? darkMode
                            ? 'bg-cyan-800 text-white font-medium border border-cyan-700'
                            : 'bg-cyan-100 text-cyan-800 font-medium border border-cyan-200'
                          : darkMode
                            ? 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700'
                            : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {lang.name}
                      {pendingLanguage === lang.code && (
                        <span className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                      )}
                    </button>
                  ))}
                  
                  {/* "More languages" toggle button */}
                  <button
                    onClick={() => setShowMoreLanguages(!showMoreLanguages)}
                    className={`px-3 py-1.5 text-sm rounded-lg flex items-center ${
                      darkMode
                        ? 'bg-slate-700 text-slate-300 border border-slate-600 hover:bg-slate-600'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {showMoreLanguages ? 'Less' : 'More languages'}
                    <svg 
                      className={`ml-1 w-4 h-4 transition-transform ${showMoreLanguages ? 'rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
                
                {/* Secondary languages (shown when "More languages" is clicked) */}
                <AnimatePresence>
                  {showMoreLanguages && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="flex flex-wrap gap-2 pt-2 border-t border-dashed mt-2 border-slate-300 dark:border-slate-600">
                        {secondaryLanguages.map(lang => (
                          <button
                            key={lang.code}
                            onClick={() => handleLanguageSelect(lang.code)}
                            disabled={isLoading}
                            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                              selectedLanguage === lang.code
                                ? darkMode
                                  ? 'bg-cyan-800 text-white font-medium border border-cyan-700'
                                  : 'bg-cyan-100 text-cyan-800 font-medium border border-cyan-200'
                                : darkMode
                                  ? 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700'
                                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            {lang.name}
                            {pendingLanguage === lang.code && (
                              <span className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                            )}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              {/* Translation Options */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  {/* Translation style slider */}
                  <div className="space-y-2">
                    <h4 className={`text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                      Translation Style
                    </h4>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        Literal
                      </span>
                      <div className="relative flex-1 h-6 flex items-center">
                        <div className={`absolute h-2 left-0 right-0 rounded-full ${darkMode ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
                        <div
                          className={`absolute h-2 left-0 rounded-full ${darkMode ? 'bg-cyan-600' : 'bg-cyan-500'}`}
                          style={{ width: `${translationOptions.literalToPoetic * 100}%` }}
                        ></div>
                        <div 
                          className={`absolute w-4 h-4 rounded-full shadow-md transform -translate-x-1/2 z-10 cursor-pointer border-2 ${
                            darkMode ? 'bg-cyan-500 border-cyan-600' : 'bg-white border-cyan-500'
                          }`}
                          style={{ left: `${translationOptions.literalToPoetic * 100}%` }}
                        ></div>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={translationOptions.literalToPoetic}
                          onChange={(e) => {
                            setTranslationOptions({
                              ...translationOptions,
                              literalToPoetic: parseFloat(e.target.value)
                            });
                          }}
                          className="absolute inset-0 opacity-0 w-full cursor-pointer z-20"
                        />
                      </div>
                      <span className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        Poetic
                      </span>
                    </div>
                  </div>
                  
                  {/* Font size slider */}
                  <div className="space-y-2 mt-4">
                    <h4 className={`text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                      Font Size
                    </h4>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        Small
                      </span>
                      <div className="relative flex-1 h-6 flex items-center">
                        <div className={`absolute h-2 left-0 right-0 rounded-full ${darkMode ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
                        <div
                          className={`absolute h-2 left-0 rounded-full ${darkMode ? 'bg-cyan-600' : 'bg-cyan-500'}`}
                          style={{ width: `${((translationOptions.fontSize - 12) / 12) * 100}%` }}
                        ></div>
                        <div 
                          className={`absolute w-4 h-4 rounded-full shadow-md transform -translate-x-1/2 z-10 cursor-pointer border-2 ${
                            darkMode ? 'bg-cyan-500 border-cyan-600' : 'bg-white border-cyan-500'
                          }`}
                          style={{ left: `${((translationOptions.fontSize - 12) / 12) * 100}%` }}
                        ></div>
                        <input
                          type="range"
                          min="12"
                          max="24"
                          value={translationOptions.fontSize}
                          onChange={(e) => {
                            setTranslationOptions({
                              ...translationOptions,
                              fontSize: parseInt(e.target.value)
                            });
                          }}
                          className="absolute inset-0 opacity-0 w-full cursor-pointer z-20"
                        />
                      </div>
                      <span className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        Large
                      </span>
                    </div>
                  </div>
                  
                  {/* Format Options */}
                  <div className="space-y-3 mt-4">
                    <h4 className={`text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                      Format Options
                    </h4>
                    
                    <div className="flex items-center justify-between">
                      <label className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                        Preserve Line Breaks
                      </label>
                      <button
                        type="button"
                        onClick={() => setTranslationOptions({
                          ...translationOptions,
                          preserveLineBreaks: !translationOptions.preserveLineBreaks
                        })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          translationOptions.preserveLineBreaks 
                            ? (darkMode ? 'bg-cyan-600' : 'bg-cyan-500') 
                            : (darkMode ? 'bg-slate-700' : 'bg-slate-300')
                        }`}
                      >
                        <span 
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            translationOptions.preserveLineBreaks ? 'translate-x-6' : 'translate-x-1'
                          }`} 
                        />
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <label className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                        Show Alternatives
                      </label>
                      <button
                        type="button"
                        onClick={() => setTranslationOptions({
                          ...translationOptions,
                          includeAlternatives: !translationOptions.includeAlternatives
                        })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          translationOptions.includeAlternatives 
                            ? (darkMode ? 'bg-cyan-600' : 'bg-cyan-500') 
                            : (darkMode ? 'bg-slate-700' : 'bg-slate-300')
                        }`}
                      >
                        <span 
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            translationOptions.includeAlternatives ? 'translate-x-6' : 'translate-x-1'
                          }`} 
                        />
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Explanation level selector */}
                <div className="space-y-3">
                  <h4 className={`text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                    Annotation Level
                  </h4>
                  
                  <div className="flex flex-col gap-3">
                    {/* No annotations */}
                    <label className={`flex items-center p-3 rounded-lg transition-colors ${
                          selectedExplanationLevel === 'minimal'
                            ? darkMode
                              ? 'bg-slate-700 text-white ring-2 ring-cyan-500'
                              : 'bg-white text-slate-800 shadow-sm border border-slate-200 ring-2 ring-cyan-500'
                            : darkMode
                              ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                              : 'bg-slate-100 text-slate-700 hover:bg-white border border-slate-200'
                        }`}
                      >
                        <input
                          type="radio"
                          name="explanationLevel"
                          value="minimal"
                          checked={selectedExplanationLevel === 'minimal'}
                          onChange={() => handleExplanationLevelChange('minimal')}
                          className="sr-only"
                        />
                        <div className="flex-1">
                          <div className="font-medium">No Annotations</div>
                          <div className="text-xs mt-1 opacity-80">Clean translation without explanatory notes</div>
                        </div>
                        {selectedExplanationLevel === 'minimal' && (
                          <svg className={`w-5 h-5 ${darkMode ? 'text-cyan-400' : 'text-cyan-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </label>
                      
                      {/* Brief notes */}
                      <label className={`flex items-center p-3 rounded-lg transition-colors ${
                          selectedExplanationLevel === 'moderate'
                            ? darkMode
                              ? 'bg-slate-700 text-white ring-2 ring-cyan-500'
                              : 'bg-white text-slate-800 shadow-sm border border-slate-200 ring-2 ring-cyan-500'
                            : darkMode
                              ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                              : 'bg-slate-100 text-slate-700 hover:bg-white border border-slate-200'
                        }`}
                      >
                        <input
                          type="radio"
                          name="explanationLevel"
                          value="moderate"
                          checked={selectedExplanationLevel === 'moderate'}
                          onChange={() => handleExplanationLevelChange('moderate')}
                          className="sr-only"
                        />
                        <div className="flex-1">
                          <div className="font-medium">Brief Notes</div>
                          <div className="text-xs mt-1 opacity-80">Explanations for key concepts and references</div>
                        </div>
                        {selectedExplanationLevel === 'moderate' && (
                          <svg className={`w-5 h-5 ${darkMode ? 'text-cyan-400' : 'text-cyan-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </label>
                      
                      {/* Detailed notes */}
                      <label className={`flex items-center p-3 rounded-lg transition-colors ${
                          selectedExplanationLevel === 'extensive'
                            ? darkMode
                              ? 'bg-slate-700 text-white ring-2 ring-cyan-500'
                              : 'bg-white text-slate-800 shadow-sm border border-slate-200 ring-2 ring-cyan-500'
                            : darkMode
                              ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                              : 'bg-slate-100 text-slate-700 hover:bg-white border border-slate-200'
                        }`}
                      >
                        <input
                          type="radio"
                          name="explanationLevel"
                          value="extensive"
                          checked={selectedExplanationLevel === 'extensive'}
                          onChange={() => handleExplanationLevelChange('extensive')}
                          className="sr-only"
                        />
                        <div className="flex-1">
                          <div className="font-medium">Detailed Notes</div>
                          <div className="text-xs mt-1 opacity-80">Comprehensive explanations with etymological details</div>
                        </div>
                        {selectedExplanationLevel === 'extensive' && (
                          <svg className={`w-5 h-5 ${darkMode ? 'text-cyan-400' : 'text-cyan-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </label>
                    
                    {/* Example annotation */}
                    {selectedExplanationLevel !== 'minimal' && (
                      <div className={`mt-2 p-3 rounded-lg bg-opacity-10 border text-sm ${
                        darkMode 
                          ? 'bg-slate-700 border-slate-600' 
                          : 'bg-slate-100 border-slate-200'
                      }`}>
                        <div className="font-medium mb-1">Example:</div>
                        <div className={`${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                          Text with <span className={darkMode ? 'annotation-dark' : 'annotation'} data-explanation="This is how annotations will appear in the translation">
                            [annotated terms]
                          </span> that provide more information.
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Update button */}
              <button
                onClick={() => {
                  // Clear cache for current language to force a refresh
                  setCachedTranslations(prev => {
                    const newCache = {...prev};
                    delete newCache[selectedLanguage];
                    return newCache;
                  });
                  
                  // Refetch translation with current options
                  handleLanguageSelect(selectedLanguage);
                }}
                className={`w-full py-2 rounded-md font-medium ${
                  darkMode 
                    ? 'bg-cyan-800 hover:bg-cyan-700 text-white' 
                    : 'bg-cyan-600 hover:bg-cyan-700 text-white'
                } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={isLoading}
              >
                {isLoading ? "Translating..." : "Update Translation"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Translation content area */}
      <div 
        ref={contentRef}
        className={`relative rounded-lg shadow-sm transition-colors ${
          darkMode 
            ? 'bg-slate-800 border border-slate-700' 
            : 'bg-white border border-slate-200'
        }`}
      >
        {/* Annotation tooltip */}
       {activeTooltip.show && (
         <div 
           className={`annotation-tooltip ${
             darkMode ? 'bg-indigo-900 text-white' : 'bg-indigo-100 text-indigo-900'
           }`}
           style={{
             left: activeTooltip.x + 'px',
             top: (activeTooltip.y - 10) + 'px',
             transform: 'translate(-50%, -100%)'
           }}
         >
           <div className={`tooltip-arrow ${
             darkMode ? 'bg-indigo-900' : 'bg-indigo-100'
           }`}></div>
           
           <div className="font-medium">
             {activeTooltip.explanation}
           </div>
         </div>
       )}
        
        {/* Translation content */}
        {/* Empty state with Start button that works */}
        {!translationText ? (
          <div className="p-8 flex flex-col items-center justify-center text-center h-64">
            <svg 
              className={`w-12 h-12 mb-3 ${darkMode ? 'text-slate-600' : 'text-slate-300'}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M9.5 14.5a18.022 18.022 0 01-1.5-5" />
            </svg>
            <p className={`${darkMode ? 'text-slate-400' : 'text-slate-500'} mb-4`}>
              Select a language to translate this document
            </p>
            <button
              onClick={() => handleLanguageSelect(selectedLanguage || 'en')}
              className={`px-4 py-2 rounded-md font-medium ${
                darkMode 
                  ? 'bg-cyan-800 hover:bg-cyan-700 text-white' 
                  : 'bg-cyan-600 hover:bg-cyan-700 text-white'
              }`}
              disabled={isLoading}
            >
              {isLoading ? "Translating..." : `Start with ${getLanguageDisplayName(selectedLanguage || 'en')}`}
            </button>
          </div>
        ) : (
          // Translation content
          <div 
            className={`p-6 relative transition-colors duration-300 ${
              isRTL ? 'rtl-text' : ''
            }`}
          >
            {/* Loading overlay */}
            {isLoading && (
              <div className="absolute inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center rounded-lg z-10">
                <div className={`px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 ${
                  darkMode ? 'bg-slate-800' : 'bg-white'
                }`}>
                  <div className={`w-5 h-5 border-2 rounded-full animate-spin ${
                    darkMode ? 'border-cyan-600 border-t-cyan-300' : 'border-cyan-300 border-t-cyan-600'
                  }`}></div>
                  <span className={darkMode ? 'text-slate-300' : 'text-slate-700'}>
                    Translating...
                  </span>
                </div>
              </div>
            )}
            
            <div 
              className={`translation-prose translation-text text-base leading-relaxed ${
                darkMode ? 'text-slate-200' : 'text-slate-800'
              }`}
              style={{ fontSize: `${translationOptions.fontSize}px` }}
            >
              {/* If using minimal explanation level, render as React Markdown */}
              {selectedExplanationLevel === 'minimal' ? (
                <ReactMarkdown>
                  {translationText}
                </ReactMarkdown>
              ) : (
                // Otherwise use HTML with processed annotations
                <div dangerouslySetInnerHTML={{ __html: processedContent }} />
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Expanded View Modal */}
      {showExpandedView && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowExpandedView(false)}
        >
          <div 
            className={`max-w-6xl w-full max-h-[90vh] rounded-xl shadow-2xl overflow-hidden ${
              darkMode ? 'bg-slate-900' : 'bg-white'
            }`}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className={`flex items-center justify-between p-4 border-b ${
              darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
            }`}>
              <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                Translation to {getLanguageDisplayName(selectedLanguage)}
              </h3>
              <button
                onClick={() => setShowExpandedView(false)}
                className={`p-2 rounded-full ${
                  darkMode ? 'text-slate-400 hover:text-white hover:bg-slate-700' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Content */}
            <div className="flex flex-col md:flex-row h-[80vh]">
              {/* Translation Panel - 2/3 width on desktop */}
              <div className={`flex-grow md:w-2/3 overflow-auto p-6 ${
                darkMode ? 'bg-slate-900' : 'bg-white'
              }`}>
                <div 
                  className={`translation-prose translation-text ${
                    darkMode ? 'text-slate-200' : 'text-slate-800'
                  }`}
                  style={{ fontSize: `${translationOptions.fontSize}px` }}
                >
                  {selectedExplanationLevel === 'minimal' ? (
                    <ReactMarkdown>
                      {translationText}
                    </ReactMarkdown>
                  ) : (
                    <div dangerouslySetInnerHTML={{ __html: processedContent }} />
                  )}
                </div>
              </div>
              
              {/* Original Text Panel - 1/3 width on desktop */}
              <div className={`md:w-1/3 overflow-auto p-4 border-t md:border-t-0 md:border-l ${
                darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
              }`}>
                <h4 className={`text-sm uppercase font-medium mb-3 ${
                  darkMode ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  Original Text
                </h4>
                <div className={`prose prose-sm max-w-none leading-relaxed ${
                  darkMode ? 'text-slate-300' : 'text-slate-700'
                }`}>
                  <ReactMarkdown>
                    {sourceContent}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
            
            {/* Footer */}
            <div className={`flex items-center justify-between p-4 border-t ${
              darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Translated with {llmModel.split('-').slice(0, 2).join('-')}
              </div>
              <SaveToLibraryButton 
                type="analysis"
                data={{
                  type: 'translate',
                  title: `Translation to ${getLanguageDisplayName(selectedLanguage)} ${metadata?.title ? `- ${metadata.title}` : ''}`,
                  content: translationText,
                  sourceName: metadata?.title || 'Untitled Source',
                  sourceAuthor: metadata?.author || 'Unknown',
                  sourceDate: metadata?.date || 'Unknown date',
                  model: llmModel,
                  perspective: `Translation to ${getLanguageDisplayName(selectedLanguage)}`,
                  tags: ['translation', selectedLanguage]
                }}
                variant="primary"
                size="sm"
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Original text preview (only for long documents) */}
      {needsExpandedView && translationText && !showExpandedView && (
        <div className="mt-4 space-y-2">
          <h4 className={`text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'} flex items-center gap-1.5`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Original Source Text
          </h4>
          <div className={`prose prose-sm max-w-none p-3 rounded-md shadow-inner leading-relaxed text-xs ${
            darkMode 
              ? 'bg-slate-800/60 text-slate-400 border border-slate-700' 
              : 'bg-slate-50 text-slate-600 border border-slate-200'
          }`}>
            {sourceContent.split('\n').slice(0, 10).map((paragraph, i) => (
              <p key={i} className="mb-3">
                {paragraph}
              </p>
            ))}
            {sourceContent.split('\n').length > 10 && (
              <p className="italic text-center">
                <span className={darkMode ? 'text-slate-500' : 'text-slate-400'}>
                  ... {sourceContent.split('\n').length - 10} more paragraphs
                </span>
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
