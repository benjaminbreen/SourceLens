// components/translate/TranslationOptions.tsx
// Enhanced modal for selecting translation options with dark mode support
// Provides an elegant interface for language selection and translation parameters

'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TranslationOptions as TranslationOptionsType } from '@/lib/store';
import { SUPPORTED_LANGUAGES } from '@/lib/translation/languages';

interface TranslationOptionsProps {
  currentOptions: TranslationOptionsType;
  onClose: () => void;
  onSubmit: (options: TranslationOptionsType) => void;
  isDarkMode: boolean;
}

export default function TranslationOptions({
  currentOptions,
  onClose,
  onSubmit,
  isDarkMode
}: TranslationOptionsProps) {
  // Create a deep copy of currentOptions to ensure state changes are detected
  const [options, setOptions] = useState<TranslationOptionsType>({...currentOptions});
  
  // For highlighted language selection
  const [selectedLanguage, setSelectedLanguage] = useState<string>(currentOptions.targetLanguage);
  
  // Update local state when props change
  useEffect(() => {
    setOptions({...currentOptions});
    setSelectedLanguage(currentOptions.targetLanguage);
  }, [currentOptions]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Ensure the targetLanguage is set to the selected one
    const finalOptions = {
      ...options,
      targetLanguage: selectedLanguage
    };
    onSubmit(finalOptions);
  };
  
  const handleLanguageChange = (lang: string) => {
    setSelectedLanguage(lang);
    setOptions({
      ...options,
      targetLanguage: lang
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className={`w-full max-w-xl rounded-xl shadow-2xl overflow-hidden ${
            isDarkMode 
              ? 'bg-slate-900 border border-slate-700' 
              : 'bg-white border border-slate-200'
          } transition-colors duration-300`}
        >
          <div className={`flex justify-between items-center p-5 border-b ${
            isDarkMode ? 'border-slate-700' : 'border-slate-200'
          } transition-colors duration-300`}>
            <h3 className={`text-lg font-medium ${
              isDarkMode ? 'text-slate-200' : 'text-slate-800'
            } transition-colors duration-300`}>
              Translation Options
            </h3>
            <button
              onClick={onClose}
              className={`rounded-md p-1.5 hover:bg-opacity-80 transition-colors ${
                isDarkMode 
                  ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700' 
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-6">
              {/* Target Language Selection - Improved UI */}
              <div className="space-y-3">
                <label className={`block text-sm font-medium ${
                  isDarkMode ? 'text-slate-300' : 'text-slate-700'
                } transition-colors duration-300`}>
                  Target Language
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {SUPPORTED_LANGUAGES.map(lang => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => handleLanguageChange(lang.code)}
                      className={`flex items-center py-2 px-3 rounded-lg transition-all duration-200 ${
                        selectedLanguage === lang.code
                          ? isDarkMode
                            ? 'bg-cyan-800/70 text-cyan-100 border border-cyan-700 shadow-inner'
                            : 'bg-cyan-100 text-cyan-800 border border-cyan-300 shadow-inner'
                          : isDarkMode
                            ? 'border border-slate-700 hover:border-cyan-800 hover:bg-slate-800'
                            : 'border border-slate-200 hover:border-cyan-300 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-sm font-medium">{lang.name}</span>
                      {selectedLanguage === lang.code && (
                        <svg className={`w-4 h-4 ml-auto ${isDarkMode ? 'text-cyan-300' : 'text-cyan-600'}`} 
                          fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Translation Style - Literal to Poetic */}
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${
                  isDarkMode ? 'text-slate-300' : 'text-slate-700'
                } transition-colors duration-300`}>
                  Translation Style
                </label>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Literal
                    </span>
                    <div className="relative flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`absolute top-0 left-0 h-full ${
                          isDarkMode ? 'bg-cyan-600' : 'bg-cyan-500'
                        }`}
                        style={{ width: `${options.literalToPoetic * 100}%` }}
                      ></div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={options.literalToPoetic}
                        onChange={(e) => setOptions({
                          ...options,
                          literalToPoetic: parseFloat(e.target.value)
                        })}
                        className="absolute inset-0 opacity-0 w-full cursor-pointer"
                      />
                    </div>
                    <span className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Poetic
                    </span>
                  </div>
                  
                  {/* Style description based on selected value */}
                  <div className={`text-xs italic ${
                    isDarkMode ? 'text-slate-400' : 'text-slate-500'
                  } transition-colors duration-300`}>
                    {options.literalToPoetic <= 0.25 ? (
                      "Extremely literal and precise, prioritizing word-for-word accuracy"
                    ) : options.literalToPoetic <= 0.5 ? (
                      "Mostly literal while maintaining readability, staying close to the original"  
                    ) : options.literalToPoetic <= 0.75 ? (
                      "Balanced between accuracy and natural expression, with literary qualities"
                    ) : (
                      "Poetic and literary, capturing the spirit of the original with creative interpretation"
                    )}
                  </div>
                </div>
              </div>
              
              {/* Explanation Level */}
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${
                  isDarkMode ? 'text-slate-300' : 'text-slate-700'
                } transition-colors duration-300`}>
                  Explanations & Notes
                </label>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="explanation-minimal"
                      name="explanationLevel"
                      value="minimal"
                      checked={options.explanationLevel === 'minimal'}
                      onChange={() => setOptions({...options, explanationLevel: 'minimal'})}
                      className={`h-4 w-4 mr-2 ${
                        isDarkMode 
                          ? 'bg-slate-700 border-slate-600 text-cyan-500 focus:ring-cyan-600/50' 
                          : 'border-slate-300 text-cyan-600 focus:ring-cyan-500/50'
                      } transition-colors duration-300`}
                    />
                    <label 
                      htmlFor="explanation-minimal"
                      className={`text-sm ${
                        isDarkMode ? 'text-slate-300' : 'text-slate-700'
                      } cursor-pointer transition-colors duration-300`}
                    >
                      None
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="explanation-moderate"
                      name="explanationLevel"
                      value="moderate"
                      checked={options.explanationLevel === 'moderate'}
                      onChange={() => setOptions({...options, explanationLevel: 'moderate'})}
                      className={`h-4 w-4 mr-2 ${
                        isDarkMode 
                          ? 'bg-slate-700 border-slate-600 text-cyan-500 focus:ring-cyan-600/50' 
                          : 'border-slate-300 text-cyan-600 focus:ring-cyan-500/50'
                      } transition-colors duration-300`}
                    />
                    <label 
                      htmlFor="explanation-moderate"
                      className={`text-sm ${
                        isDarkMode ? 'text-slate-300' : 'text-slate-700'
                      } cursor-pointer transition-colors duration-300`}
                    >
                      Brief Notes
                      <span className={`ml-2 text-xs italic ${
                        isDarkMode ? 'text-slate-400' : 'text-slate-500'
                      }`}>
                        (explanations for key concepts and references)
                      </span>
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="explanation-extensive"
                      name="explanationLevel"
                      value="extensive"
                      checked={options.explanationLevel === 'extensive'}
                      onChange={() => setOptions({...options, explanationLevel: 'extensive'})}
                      className={`h-4 w-4 mr-2 ${
                        isDarkMode 
                          ? 'bg-slate-700 border-slate-600 text-cyan-500 focus:ring-cyan-600/50' 
                          : 'border-slate-300 text-cyan-600 focus:ring-cyan-500/50'
                      } transition-colors duration-300`}
                    />
                    <label 
                      htmlFor="explanation-extensive"
                      className={`text-sm ${
                        isDarkMode ? 'text-slate-300' : 'text-slate-700'
                      } cursor-pointer transition-colors duration-300`}
                    >
                      Detailed Notes
                      <span className={`ml-2 text-xs italic ${
                        isDarkMode ? 'text-slate-400' : 'text-slate-500'
                      }`}>
                        (comprehensive explanations with etymological details)
                      </span>
                    </label>
                  </div>
                  
                  {/* Example of how notes appear */}
                  {options.explanationLevel !== 'minimal' && (
                    <div className={`mt-2 p-2 rounded text-xs ${
                      isDarkMode 
                        ? 'bg-slate-800 border border-slate-700' 
                        : 'bg-slate-50 border border-slate-200'
                    }`}>
                      <span>Example: </span>
                      <span className={options.explanationLevel === 'moderate' ? 
                        (isDarkMode ? 'annotation-dark' : 'annotation') : 
                        (isDarkMode ? 'annotation-dark' : 'annotation')
                      }>
                        {options.explanationLevel === 'moderate' ? 
                          '[brief contextual note]' : 
                          '[detailed explanation with etymology]'
                        }
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Additional Options - Use toggle switches */}
              <div className="space-y-3">
                <label className={`block text-sm font-medium ${
                  isDarkMode ? 'text-slate-300' : 'text-slate-700'
                } transition-colors duration-300`}>
                  Additional Options
                </label>
                
                <div className="flex items-center justify-between">
                  <label className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    Preserve Line Breaks
                    <span className={`block text-xs italic ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      (maintain original paragraph structure)
                    </span>
                  </label>
                  
                  <button
                    type="button"
                    onClick={() => setOptions({...options, preserveLineBreaks: !options.preserveLineBreaks})}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      options.preserveLineBreaks 
                        ? (isDarkMode ? 'bg-cyan-600' : 'bg-cyan-500') 
                        : (isDarkMode ? 'bg-slate-700' : 'bg-slate-300')
                    }`}
                  >
                    <span 
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        options.preserveLineBreaks ? 'translate-x-6' : 'translate-x-1'
                      }`} 
                    />
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <label className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    Show Alternative Translations
                    <span className={`block text-xs italic ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      (for ambiguous terms and phrases)
                    </span>
                  </label>
                  
                  <button
                    type="button"
                    onClick={() => setOptions({...options, includeAlternatives: !options.includeAlternatives})}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      options.includeAlternatives 
                        ? (isDarkMode ? 'bg-cyan-600' : 'bg-cyan-500') 
                        : (isDarkMode ? 'bg-slate-700' : 'bg-slate-300')
                    }`}
                  >
                    <span 
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        options.includeAlternatives ? 'translate-x-6' : 'translate-x-1'
                      }`} 
                    />
                  </button>
                </div>
              </div>
            </div>
            
            <div className={`flex p-4 border-t ${
              isDarkMode ? 'border-slate-700' : 'border-slate-200'
            } transition-colors duration-300`}>
              <button
                type="button"
                onClick={onClose}
                className={`flex-1 py-2 mr-2 rounded-md ${
                  isDarkMode 
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700' 
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                } transition-colors duration-300`}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`flex-1 py-2 rounded-md ${
                  isDarkMode 
                    ? 'bg-cyan-700 hover:bg-cyan-600 text-white' 
                    : 'bg-cyan-600 hover:bg-cyan-700 text-white'
                } transition-colors duration-300`}
              >
                Apply & Translate
              </button>
            </div>
          </form>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}