// components/translate/TranslationPanel.tsx
// Enhanced translation component with elegant UI, dark mode support and advanced annotation display
// Provides seamless experience for translating content with customizable parameters and visualization

'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useAppStore, TranslationOptions as TranslationOptionsType } from '@/lib/store';
import { SUPPORTED_LANGUAGES } from '@/lib/translation/languages';
import TranslationOptions from './TranslationOptions';
import ExpandedTranslationView from './ExpandedTranslationView';
import SaveToLibraryButton from '../library/SaveToLibraryButton';
import { motion, AnimatePresence } from 'framer-motion';

// Character threshold for showing expanded view option - adjust as needed
const EXPANDED_VIEW_THRESHOLD = 2000; 

interface TranslationPanelProps {
  darkMode: boolean;
}

export default function TranslationPanel({ darkMode }: TranslationPanelProps) {
  const { 
    sourceContent, 
    metadata,
    llmModel, 
    rawPrompt,
    rawResponse,
    isLoading, 
    setLoading,
    setRawPrompt,
    setRawResponse,
    translatedText,
    translationOptions,
    setTranslationOptions,
    setTranslatedText,
  } = useAppStore();

  const [showOptions, setShowOptions] = useState<boolean>(false);
  const [showExpandedView, setShowExpandedView] = useState(false);
  const [continuationIndex, setContinuationIndex] = useState<number>(0);
  const [fullTranslation, setFullTranslation] = useState<string>('');
  const [showContinueButton, setShowContinueButton] = useState<boolean>(false);
  const [processedText, setProcessedText] = useState<string>('');
  const [showAnnotationTooltip, setShowAnnotationTooltip] = useState<{show: boolean, text: string, x: number, y: number}>({
    show: false,
    text: '',
    x: 0,
    y: 0
  });
  
  // Reference to the translation text container for annotation tooltips
  const translationContainerRef = useRef<HTMLDivElement>(null);
  
  // Check if content is long enough to need expanded view
  const needsExpandedView = sourceContent?.length > EXPANDED_VIEW_THRESHOLD;

  // Process translated text to format annotations
  useEffect(() => {
    if (!translatedText) {
      setProcessedText('');
      return;
    }
    
    // For minimal explanations, just use the text as-is
    if (translationOptions.explanationLevel === 'minimal') {
      setProcessedText(translatedText);
      return;
    }
    
    // For moderate and extensive, format the annotations
    const processedLines = translatedText.split('\n').map(line => {
      // Find all annotations in square brackets and format them
      return line.replace(/\[(.*?)\]/g, (match, content) => {
        const uniqueId = `annotation-${Math.random().toString(36).substring(2, 9)}`;
        return `<span class="${darkMode ? 'annotation-dark' : 'annotation'}" data-annotation="${content}" id="${uniqueId}">${match}</span>`;
      });
    }).join('\n');
    
    setProcessedText(processedLines);
  }, [translatedText, translationOptions.explanationLevel, darkMode]);

  // Initialize fullTranslation whenever translatedText changes
  useEffect(() => {
    if (translatedText && !fullTranslation) {
      setFullTranslation(translatedText);
    } else if (translatedText && continuationIndex > 0) {
      // If we're continuing, append new content to existing translation
      setFullTranslation(prev => prev + "\n\n" + translatedText);
    }
    
    // Check if translation was likely truncated (indicating it hit token limits)
    const checkIfTruncated = () => {
      if (!translatedText) return false;
      
      // Signs that suggest truncation:
      const hasAbruptEnding = !translatedText.endsWith('.') && 
                             !translatedText.endsWith('!') && 
                             !translatedText.endsWith('?') &&
                             !translatedText.endsWith('"');
      
      const hasLongLastParagraph = translatedText.split('\n').slice(-1)[0]?.length > 100;
      
      return hasAbruptEnding && hasLongLastParagraph;
    };
    
    setShowContinueButton(!isLoading && checkIfTruncated());
  }, [translatedText, isLoading, continuationIndex, fullTranslation]);

  // Setup annotation tooltip event listeners
  useEffect(() => {
    if (!translationContainerRef.current) return;
    
    const handleAnnotationMouseEnter = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('annotation') || target.classList.contains('annotation-dark')) {
        const annotation = target.getAttribute('data-annotation');
        if (annotation) {
          const rect = target.getBoundingClientRect();
          const containerRect = translationContainerRef.current!.getBoundingClientRect();
          
          setShowAnnotationTooltip({
            show: true,
            text: annotation,
            x: rect.left + (rect.width / 2) - containerRect.left,
            y: rect.top - containerRect.top - 5
          });
        }
      }
    };

    const handleAnnotationMouseLeave = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('annotation') || target.classList.contains('annotation-dark')) {
        setShowAnnotationTooltip({show: false, text: '', x: 0, y: 0});
      }
    };
    
    const container = translationContainerRef.current;
    container.addEventListener('mouseover', handleAnnotationMouseEnter);
    container.addEventListener('mouseout', handleAnnotationMouseLeave);
    
    return () => {
      container.removeEventListener('mouseover', handleAnnotationMouseEnter);
      container.removeEventListener('mouseout', handleAnnotationMouseLeave);
    };
  }, [translationContainerRef.current]);

  useEffect(() => {
    // If there's source content and no translation yet, show options first
    if (sourceContent && !translatedText && !isLoading && !showOptions) {
      setShowOptions(true); // Show options modal first instead of translating immediately
    }
  }, [sourceContent, translatedText, isLoading, showOptions]);

  const handleTranslate = async (isContinuation = false) => {
    if (!sourceContent || isLoading) return;
    
    setLoading(true);
    try {
    // Extract the text for continuation if needed
    const textToTranslate = isContinuation 
      ? sourceContent.substring(Math.floor(sourceContent.length * continuationIndex / 4)) 
      : sourceContent;
      
    // Add continuation context if needed  
    const continuationContext = isContinuation 
      ? `This is a continuation of a previous translation. Start from where the previous translation left off. The previous translation ended with: "${fullTranslation.slice(-150)}"` 
      : '';
    
    // Add console.log to see what's being sent to the API
    console.log("Translation request:", {
      targetLanguage: translationOptions.targetLanguage,
      explanationLevel: translationOptions.explanationLevel
    });
    
    const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
        source: textToTranslate,
        metadata: metadata,
        targetLanguage: translationOptions.targetLanguage,  // Make sure this is correct
        translationScope: translationOptions.translationScope,
        explanationLevel: translationOptions.explanationLevel,
        literalToPoetic: translationOptions.literalToPoetic,
        preserveLineBreaks: translationOptions.preserveLineBreaks,
        includeAlternatives: translationOptions.includeAlternatives,
        modelId: llmModel,
        continuationContext: continuationContext,
        isContinuation: isContinuation,
        continuationIndex: continuationIndex
      }),
    });

    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`);
    }

    const data = await response.json();
    
    // Log response for debugging
    console.log("Translation response:", data);
    
    // Update the app store directly using standard actions
  setTranslatedText(data.translation);
    setFullTranslation(data.translation);
    
    // If continuing, increment the continuation index
    if (isContinuation) {
      setContinuationIndex(prev => prev + 1);
    }
    
    setRawPrompt(data.rawPrompt);
    setRawResponse(data.rawResponse);
    // Force reprocessing of the translated text
    setProcessedText('');
  } catch (error) {
    console.error("Translation error:", error);
  } finally {
    setLoading(false);
  }
};

  const handleOptionsSubmit = (options: TranslationOptionsType) => {
    // Update options in the store
    setTranslationOptions(options);
    setShowOptions(false);
    handleTranslate();
  };

  const handleContinueTranslation = () => {
    handleTranslate(true);
  };

  // Language name helper
  const getLanguageName = (code: string) => {
    return SUPPORTED_LANGUAGES.find(lang => lang.code === code)?.name || 'Unknown';
  };

  return (
    <div className="space-y-4">
      {/* Header with controls */}
      <div className="flex justify-between items-center mb-4">
        <motion.h3 
          className={`text-lg font-medium ${darkMode ? 'text-cyan-300' : 'text-cyan-900'} flex items-center gap-2 transition-colors duration-300`}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <svg 
            className={`w-5 h-5 ${darkMode ? 'text-cyan-400' : 'text-cyan-700'} transition-colors duration-300`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M9.5 14.5a18.022 18.022 0 01-1.5-5" />
          </svg>
          
          <span className="transition-all duration-300">
            Translation to {getLanguageName(translationOptions.targetLanguage)}
          </span>
          
          {translationOptions.explanationLevel !== 'minimal' && (
            <div 
              className={`ml-2 text-xs font-medium ${
                darkMode 
                  ? 'bg-cyan-900/50 text-cyan-300 border border-cyan-700/50' 
                  : 'bg-cyan-100 text-cyan-900 border border-cyan-200'
              } rounded-full px-2 py-0.5 transition-colors duration-300`}
            >
              {translationOptions.explanationLevel === 'moderate' 
                ? 'Brief notes' 
                : 'Detailed notes'}
            </div>
          )}
        </motion.h3>
        
        <div className="flex space-x-2">
          {/* Only show expanded view button if content is long enough */}
          {needsExpandedView && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowExpandedView(true)}
              className={`flex items-center px-3 py-1.5 text-sm rounded-md transition-colors duration-200 ${
                darkMode 
                  ? 'bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700'
                  : 'hover:bg-cyan-100 text-cyan-700'
              }`}
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
              Expanded View
            </motion.button>
          )}
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowOptions(true)}
            className={`flex items-center px-3 py-1.5 text-sm rounded-md transition-colors duration-200 ${
              darkMode 
                ? 'bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700'
                : 'hover:bg-cyan-100 text-cyan-700'
            }`}
          >
           <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Options
          </motion.button>
          
        <SaveToLibraryButton 
          type="analysis"
          data={{
            type: 'translate', // Change 'extract-info' to 'translate' for proper filtering
            title: `Translation to ${getLanguageName(translationOptions.targetLanguage)} ${metadata?.title ? `- ${metadata.title}` : ''}`,
            content: fullTranslation || translatedText,
            sourceName: metadata?.title || 'Untitled Source',
            sourceAuthor: metadata?.author || 'Unknown',
            sourceDate: metadata?.date || 'Unknown date',
            model: llmModel, // Add model information
            perspective: `Translation to ${getLanguageName(translationOptions.targetLanguage)}`, // Add perspective information
            // Add any tags you want to appear in the SavedAnalysisPanel
            tags: ['translation', translationOptions.targetLanguage]
          }}
          variant="secondary"
          size="sm"
        />
        
        </div>
      </div>
      
      {/* Translation Content Display */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center p-8"
          >
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 border-4 ${
                darkMode ? 'border-cyan-700 border-t-cyan-400' : 'border-cyan-200 border-t-cyan-600'
              } rounded-full animate-spin mb-4 transition-colors duration-300`}></div>
              <p className={`${darkMode ? 'text-slate-400' : 'text-slate-600'} transition-colors duration-300`}>
                {continuationIndex > 0 ? "Continuing translation..." : "Translating..."}
              </p>
            </div>
          </motion.div>
        ) : (fullTranslation || translatedText) ? (
          <motion.div 
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-2 relative"
          >
            <div 
              ref={translationContainerRef}
              className={`prose prose-sm max-w-none p-6 rounded-lg shadow-sm leading-relaxed ${
                darkMode 
                  ? 'bg-slate-800 text-slate-200 border border-slate-700' 
                  : 'bg-white text-slate-800 border border-slate-200'
              } transition-colors duration-300 font-['Lora',serif] relative`}
              style={{ 
                fontSize: `${translationOptions.fontSize}px`,
                // Add RTL support for both Arabic and Farsi
                direction: ['ar', 'fa'].includes(translationOptions.targetLanguage) ? 'rtl' : 'ltr'
              }}
            >
              {/* Annotation tooltip */}
              {showAnnotationTooltip.show && (
                <div 
                  className={`absolute py-2 px-3 rounded-lg max-w-xs z-10 text-sm animate-fade-in ${
                    darkMode 
                      ? 'bg-indigo-900 text-slate-200 border border-indigo-700 shadow-lg shadow-black/30' 
                      : 'bg-indigo-100 text-slate-700 border border-indigo-200 shadow-md'
                  } transition-colors duration-300`}
                  style={{ 
                    left: showAnnotationTooltip.x, 
                    bottom: `calc(100% - ${showAnnotationTooltip.y}px + 20px)`,
                    transform: 'translateX(-50%)'
                  }}
                >
                  <div className={`absolute bottom-0 left-1/2 w-2 h-2 -mb-1 rotate-45 ${
                    darkMode ? 'bg-indigo-900 border-r border-b border-indigo-700' : 'bg-indigo-100 border-r border-b border-indigo-200'
                  }`} style={{ transform: 'translateX(-50%)' }}></div>
                  {showAnnotationTooltip.text}
                </div>
              )}

              {translationOptions.explanationLevel === 'minimal' ? (
                // Simple display for minimal explanations
                (fullTranslation || translatedText).split('\n').map((paragraph, i) => (
                  <p key={i} className="mb-4">
                    {paragraph}
                  </p>
                ))
              ) : (
                // Display with hover annotations
                <div dangerouslySetInnerHTML={{ __html: fullTranslation || processedText }} />
              )}
            </div>
            
            {/* Continue Translation Button */}
            {showContinueButton && (
              <motion.div 
                className="flex justify-center mt-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <button
                  onClick={handleContinueTranslation}
                  className={`px-4 py-2 rounded-md transition-all duration-200 text-sm font-medium flex items-center ${
                    darkMode 
                      ? 'bg-cyan-800 hover:bg-cyan-700 text-white' 
                      : 'bg-cyan-600 hover:bg-cyan-700 text-white'
                  }`}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                  Continue Translation
                </button>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div 
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`flex items-center justify-center h-48 rounded-lg ${
              darkMode 
                ? 'border border-dashed border-slate-700 bg-slate-800/50' 
                : 'border border-dashed border-slate-300 bg-slate-50'
            } transition-colors duration-300`}
          >
            <div className="text-center p-4">
              <svg 
                className={`w-12 h-12 mx-auto mb-2 ${darkMode ? 'text-slate-600' : 'text-slate-400'} transition-colors duration-300`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M9.5 14.5a18.022 18.022 0 01-1.5-5" />
              </svg>
              <p className={`${darkMode ? 'text-slate-400' : 'text-slate-600'} transition-colors duration-300`}>
                Translation will appear here
              </p>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleTranslate()}
                className={`mt-3 px-4 py-2 rounded-md transition-colors duration-200 text-sm ${
                  darkMode 
                    ? 'bg-cyan-800 hover:bg-cyan-700 text-white' 
                    : 'bg-cyan-600 hover:bg-cyan-700 text-white'
                }`}
              >
                Translate Now
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Translation customization controls */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={`space-y-4 p-5 rounded-lg ${
          darkMode 
            ? 'bg-slate-800 border border-slate-700' 
            : 'bg-slate-50 border border-slate-200'
        } transition-colors duration-300`}
      >
        {/* Translation style slider */}
        <div className="space-y-2">
          <h4 className={`text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-600'} transition-colors duration-300`}>
            Translation Style
          </h4>
          <div className="flex items-center gap-2">
            <span className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'} transition-colors duration-300`}>
              Literal
            </span>
            <div className="relative flex-1 h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden transition-colors duration-300">
              <div
                className={`absolute top-0 h-full ${darkMode ? 'bg-cyan-600' : 'bg-cyan-500'} transition-all duration-300`}
                style={{ width: `${translationOptions.literalToPoetic * 100}%` }}
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
                className="absolute inset-0 opacity-0 w-full cursor-pointer"
              />
            </div>
            <span className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'} transition-colors duration-300`}>
              Poetic
            </span>
          </div>
        </div>
        
        {/* Font size slider */}
        <div className="space-y-2">
          <h4 className={`text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-600'} transition-colors duration-300`}>
            Font Size
          </h4>
          <div className="flex items-center gap-2">
            <span className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'} transition-colors duration-300`}>
              Small
            </span>
            <div className="relative flex-1 h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden transition-colors duration-300">
              <div
                className={`absolute top-0 h-full ${darkMode ? 'bg-cyan-600' : 'bg-cyan-500'} transition-all duration-300`}
                style={{ width: `${((translationOptions.fontSize - 12) / 12) * 100}%` }}
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
                className="absolute inset-0 opacity-0 w-full cursor-pointer"
              />
            </div>
            <span className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'} transition-colors duration-300`}>
              Large
            </span>
          </div>
        </div>
        
        {/* Checkboxes and dropdowns */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <h4 className={`text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-600'} transition-colors duration-300`}>
              Options
            </h4>
            
            <label className={`flex items-center gap-2 ${darkMode ? 'text-slate-300' : 'text-slate-600'} transition-colors duration-300`}>
              <input
                type="checkbox"
                checked={translationOptions.preserveLineBreaks}
                onChange={(e) => {
                  setTranslationOptions({
                    ...translationOptions,
                    preserveLineBreaks: e.target.checked
                  });
                }}
                className={`rounded ${
                  darkMode 
                    ? 'bg-slate-700 border-slate-600 text-cyan-500 focus:ring-cyan-600/30' 
                    : 'border-slate-300 text-cyan-600 focus:ring-cyan-500'
                } transition-colors duration-300`}
              />
              <span className="text-sm">Preserve Line Breaks</span>
            </label>
            
            <label className={`flex items-center gap-2 ${darkMode ? 'text-slate-300' : 'text-slate-600'} transition-colors duration-300`}>
              <input
                type="checkbox"
                checked={translationOptions.includeAlternatives}
                onChange={(e) => {
                  setTranslationOptions({
                    ...translationOptions,
                    includeAlternatives: e.target.checked
                  });
                }}
                className={`rounded ${
                  darkMode 
                    ? 'bg-slate-700 border-slate-600 text-cyan-500 focus:ring-cyan-600/30' 
                    : 'border-slate-300 text-cyan-600 focus:ring-cyan-500'
                } transition-colors duration-300`}
              />
              <span className="text-sm">Show Alternatives</span>
            </label>
          </div>
          
          <div className="space-y-3">
            <h4 className={`text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-600'} transition-colors duration-300`}>
              Annotations
            </h4>
            
            <div className={`${darkMode ? 'text-slate-300' : 'text-slate-600'} transition-colors duration-300`}>
              <select
                value={translationOptions.explanationLevel}
                onChange={(e) => {
                  setTranslationOptions({
                    ...translationOptions,
                    explanationLevel: e.target.value as any
                  });
                }}
                className={`w-full rounded text-sm py-1.5 ${
                  darkMode 
                    ? 'bg-slate-700 border-slate-600 text-slate-200 focus:ring-cyan-700' 
                    : 'border-slate-300 text-slate-700 focus:ring-cyan-500'
                } transition-colors duration-300`}
              >
                <option value="minimal">None</option>
                <option value="moderate">Brief notes</option>
                <option value="extensive">Detailed notes</option>
              </select>
              <p className="mt-1 text-xs opacity-80">
                {translationOptions.explanationLevel === 'minimal' 
                  ? 'No additional explanations'
                  : translationOptions.explanationLevel === 'moderate'
                    ? 'Brief explanatory notes in brackets'
                    : 'Detailed explanations with etymology'}
              </p>
            </div>
          </div>
        </div>
        
        <button
          onClick={() => handleTranslate()}
          className={`w-full py-2 rounded-md transition-all duration-200 text-sm font-medium ${
            darkMode 
              ? 'bg-cyan-800 hover:bg-cyan-700 text-white' 
              : 'bg-cyan-600 hover:bg-cyan-700 text-white'
          } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'transform hover:scale-[1.01] hover:shadow-md'}`}
          disabled={isLoading}
        >
          {isLoading ? "Translating..." : "Update Translation"}
        </button>
      </motion.div>

      {/* Only show original text section for long content */}
      {needsExpandedView && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
     className="mt-4 space-y-2"
        >
          <h4 className={`text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'} flex items-center gap-1.5 transition-colors duration-300`}>
            <svg className={`w-4 h-4 ${darkMode ? 'text-slate-400' : 'text-slate-500'} transition-colors duration-300`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Original Source Text
          </h4>
          <div className={`prose prose-sm max-w-none p-3 rounded-md shadow-inner leading-relaxed text-xs ${
            darkMode 
              ? 'bg-slate-800/60 text-slate-400 border border-slate-700' 
              : 'bg-slate-50 text-slate-600 border border-slate-200'
          } transition-colors duration-300 font-sans`}>
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
        </motion.div>
      )}
      
      {/* Translation options modal */}
      <AnimatePresence>
        {showOptions && (
          <TranslationOptions
            currentOptions={translationOptions}
            onClose={() => setShowOptions(false)}
            onSubmit={handleOptionsSubmit}
            isDarkMode={darkMode}
          />
        )}
      </AnimatePresence>
      
      {/* Expanded Translation View Modal - only initialize if needed */}
      <AnimatePresence>
        {showExpandedView && needsExpandedView && (
          <ExpandedTranslationView
            isOpen={showExpandedView}
            onClose={() => setShowExpandedView(false)}
            translatedText={fullTranslation || translatedText}
            originalText={sourceContent}
            targetLanguage={translationOptions.targetLanguage}
            isDarkMode={darkMode}
          />
        )}
      </AnimatePresence>
      
      {/* Custom CSS for annotation styling */}
     
    </div>
  );
}

          