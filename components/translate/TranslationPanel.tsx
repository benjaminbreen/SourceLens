// components/translate/TranslationPanel.tsx
// Displays translated source content with translation options and proper annotation display
// Includes sliders and toggles for customizing the translation approach

'use client';
import React, { useState, useEffect } from 'react';
import { useAppStore, TranslationOptions as TranslationOptionsType } from '@/lib/store';
import { SUPPORTED_LANGUAGES } from '@/pages/api/translate';
import TranslationOptions from './TranslationOptions';
import ExpandedTranslationView from './ExpandedTranslationView';
import SaveToLibraryButton from '../library/SaveToLibraryButton';

// Character threshold for showing expanded view option - adjust as needed
const EXPANDED_VIEW_THRESHOLD = 2000; 

export default function TranslationPanel() {
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
  } = useAppStore();

  const [showOptions, setShowOptions] = useState<boolean>(false);
  const [showExpandedView, setShowExpandedView] = useState(false);
  const [continuationIndex, setContinuationIndex] = useState<number>(0);
  const [fullTranslation, setFullTranslation] = useState<string>('');
  const [showContinueButton, setShowContinueButton] = useState<boolean>(false);
  const [processedText, setProcessedText] = useState<string>('');
  
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
    const lines = translatedText.split('\n');
    const processedLines = lines.map(line => {
      // Find all annotations in square brackets and format them
      return line.replace(/\[(.*?)\]/g, (match, content) => {
        return `<span class="font-mono text-red-600 bg-red-50 px-1 rounded">${match}</span>`;
      });
    });
    
    setProcessedText(processedLines.join('\n'));
  }, [translatedText, translationOptions.explanationLevel]);

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
      
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: textToTranslate,
          metadata: metadata,
          targetLanguage: translationOptions.targetLanguage,
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
      
      // Update the app store directly using standard actions
      useAppStore.setState({ translatedText: data.translation });
      
      // If continuing, increment the continuation index
      if (isContinuation) {
        setContinuationIndex(prev => prev + 1);
      }
      
      setRawPrompt(data.rawPrompt);
      setRawResponse(data.rawResponse);
    } catch (error) {
      console.error("Translation error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOptionsSubmit = (options: TranslationOptionsType) => {
    // Update options in the store
    useAppStore.setState({ translationOptions: options });
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
        <h3 className="text-lg font-medium text-cyan-900 flex items-center">
          <svg className="w-5 h-5 mr-2 text-cyan-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M9.5 14.5a18.022 18.022 0 01-1.5-5" />
          </svg>
          Translation to {getLanguageName(translationOptions.targetLanguage)}
          {translationOptions.explanationLevel !== 'minimal' && (
            <span className="ml-2 text-xs font-medium bg-cyan-100 text-cyan-900 rounded-full px-2 py-0.5">
              {translationOptions.explanationLevel === 'moderate' ? 'With brief explanations' : 'With detailed explanations'}
            </span>
          )}
        </h3>
        
        <div className="flex space-x-2">
          {/* Only show expanded view button if content is long enough */}
          {needsExpandedView && (
            <button
              onClick={() => setShowExpandedView(true)}
              className="flex items-center px-3 py-1.5 text-sm hover:bg-cyan-100 text-cyan-700 rounded-md transition-colors"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
              Expanded View
            </button>
          )}
          
          <button
            onClick={() => setShowOptions(true)}
            className="flex items-center px-3 py-1.5 text-sm hover:bg-cyan-100 text-cyan-700 rounded-md transition-colors"
          >
           <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Options
          </button>
          
          <SaveToLibraryButton 
            type="analysis"
            data={{
              type: 'extract-info',
              title: `Translation to ${getLanguageName(translationOptions.targetLanguage)} ${metadata?.author ? `- ${metadata.author}` : ''}`,
              content: fullTranslation || translatedText,
              sourceName: metadata?.title || 'Untitled Source',
              sourceAuthor: metadata?.author || 'Unknown',
              sourceDate: metadata?.date || 'Unknown date'
            }}
            variant="secondary"
            size="sm"
          />
        </div>
      </div>
      
      {/* Translation Content Display */}
      {isLoading ? (
        <div className="flex items-center justify-center p-8 animate-pulse">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 border-4 border-cyan-200 border-t-cyan-600 rounded-full animate-spin mb-4"></div>
            <p className="text-slate-600">
              {continuationIndex > 0 ? "Continuing translation..." : "Translating..."}
            </p>
          </div>
        </div>
      ) : (fullTranslation || translatedText) ? (
        <div className="space-y-2">
          <div 
            className="prose prose-sm max-w-none p-4 text-slate-800 bg-white border border-slate-200 rounded-lg shadow-sm leading-relaxed font-['Lora',serif]"
            style={{ fontSize: `${translationOptions.fontSize}px` }}
          >
            {translationOptions.explanationLevel === 'minimal' ? (
              // Simple display for minimal explanations
              (fullTranslation || translatedText).split('\n').map((paragraph, i) => (
                <p key={i} className="mb-4">
                  {paragraph}
                </p>
              ))
            ) : (
              // Display with formatted annotations for moderate/extensive explanations
              (fullTranslation || processedText).split('\n').map((paragraph, i) => (
                <p key={i} className="mb-4" dangerouslySetInnerHTML={{ 
                  __html: paragraph.replace(/\[(.*?)\]/g, (match, content) => {
                    return `<span class="font-mono text-red-600 bg-red-50 px-1 rounded border border-red-100">${match}</span>`;
                  })
                }} />
              ))
            )}
          </div>
          
          {/* Continue Translation Button */}
          {showContinueButton && (
            <div className="flex justify-center">
              <button
                onClick={handleContinueTranslation}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-md transition-colors text-sm font-medium flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
                Continue Translation
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-center h-48 border border-dashed border-slate-300 rounded-lg bg-slate-50">
          <div className="text-center p-4">
            <svg className="w-12 h-12 text-slate-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M9.5 14.5a18.022 18.022 0 01-1.5-5" />
            </svg>
            <p className="text-slate-600">Translation will appear here</p>
            <button 
              onClick={() => handleTranslate()}
              className="mt-3 px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 transition-colors text-sm"
            >
              Translate Now
            </button>
          </div>
        </div>
      )}
      
      {/* Translation customization controls */}
      <div className="space-y-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-600">Translation Style</span>
          <div className="flex items-center space-x-1 text-xs">
            <span className="text-slate-500">Literal</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={translationOptions.literalToPoetic}
              onChange={(e) => {
                // Update options in the store
                const store = useAppStore.getState();
                store.setTranslationOptions({
                  ...translationOptions,
                  literalToPoetic: parseFloat(e.target.value)
                });
              }}
              className="w-24 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-slate-500">Poetic</span>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-600">Font Size</span>
          <div className="flex items-center space-x-1 text-xs">
            <span className="text-slate-500">S</span>
            <input
              type="range"
              min="12"
              max="24"
              value={translationOptions.fontSize}
              onChange={(e) => {
                // Update options in the store
                const store = useAppStore.getState();
                store.setTranslationOptions({
                  ...translationOptions,
                  fontSize: parseInt(e.target.value)
                });
              }}
              className="w-24 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-slate-500">L</span>
          </div>
        </div>
        
        <div className="flex space-x-4 flex-wrap">
          <label className="flex items-center space-x-2 text-sm text-slate-600 mb-2">
            <input
              type="checkbox"
              checked={translationOptions.preserveLineBreaks}
              onChange={(e) => {
                // Update options in the store
                const store = useAppStore.getState();
                store.setTranslationOptions({
                  ...translationOptions,
                  preserveLineBreaks: e.target.checked
                });
              }}
              className="rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
            />
            <span>Preserve Line Breaks</span>
          </label>
          
          <label className="flex items-center space-x-2 text-sm text-slate-600 mb-2">
            <input
              type="checkbox"
              checked={translationOptions.includeAlternatives}
              onChange={(e) => {
                // Update options in the store
                const store = useAppStore.getState();
                store.setTranslationOptions({
                  ...translationOptions,
                  includeAlternatives: e.target.checked
                });
              }}
              className="rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
            />
            <span>Show Alternatives</span>
          </label>
          
          {/* Add a dropdown for explanation level */}
          <div className="flex items-center space-x-2 text-sm text-slate-600 mb-2">
            <span>Explanations:</span>
            <select
              value={translationOptions.explanationLevel}
              onChange={(e) => {
                // Update options in the store
                const store = useAppStore.getState();
                store.setTranslationOptions({
                  ...translationOptions,
                  explanationLevel: e.target.value
                });
              }}
              className="rounded border-slate-300 text-cyan-600 focus:ring-cyan-500 text-sm py-1"
            >
              <option value="minimal">None</option>
              <option value="moderate">Brief notes</option>
              <option value="extensive">Detailed notes</option>
            </select>
          </div>
        </div>
        
        <button
          onClick={() => handleTranslate()}
          className="w-full py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-md transition-colors text-sm font-medium"
          disabled={isLoading}
        >
          {isLoading ? "Translating..." : "Update Translation"}
        </button>
      </div>

      {/* Only show original text section for long content */}
      {needsExpandedView && (
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium text-slate-700 flex items-center">
            <svg className="w-4 h-4 mr-1.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Original Source Text
          </h4>
          <div className="prose prose-sm max-w-none p-3 text-slate-600 bg-slate-50 border border-slate-200 rounded-md shadow-inner leading-relaxed font-sans text-xs">
            {sourceContent.split('\n').map((paragraph, i) => (
              <p key={i} className="mb-3">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      )}
      
      {/* Translation options modal */}
      {showOptions && (
        <TranslationOptions
          currentOptions={translationOptions}
          onClose={() => setShowOptions(false)}
          onSubmit={handleOptionsSubmit}
        />
      )}
      
      {/* Expanded Translation View Modal - only initialize if needed */}
      {showExpandedView && needsExpandedView && (
        <ExpandedTranslationView
          isOpen={showExpandedView}
          onClose={() => setShowExpandedView(false)}
          translatedText={fullTranslation || translatedText}
          originalText={sourceContent}
          targetLanguage={translationOptions.targetLanguage}
        />
      )}
    </div>
  );
}