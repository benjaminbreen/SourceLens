// components/translate/TranslationOptions.tsx
// Modal component for selecting detailed translation options
// Includes language selection, scope controls, and explanation level options

'use client';
import React, { useState, useEffect } from 'react';
import { SUPPORTED_LANGUAGES } from '@/pages/api/translate';

interface TranslationOptionsProps {
  currentOptions: {
    targetLanguage: string;
    translationScope: string;
    explanationLevel: string;
    literalToPoetic: number;
    preserveLineBreaks: boolean;
    includeAlternatives: boolean;
    fontSize: number; // Add this line to match store type
  };
  onClose: () => void;
  onSubmit: (options: {
    targetLanguage: string;
    translationScope: string;
    explanationLevel: string;
    literalToPoetic: number;
    preserveLineBreaks: boolean;
    includeAlternatives: boolean;
    fontSize: number;
  }) => void;
}


export default function TranslationOptions({
  currentOptions,
  onClose,
  onSubmit
}: TranslationOptionsProps) {
  const [options, setOptions] = useState<TranslationOptionsProps['currentOptions']>(currentOptions);



  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(options);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-auto animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
        onClick={e => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-bold text-lg text-cyan-900">Translation Options</h3>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-800 text-2xl"
            >
              &times;
            </button>
          </div>
          
          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Target Language */}
            <div className="space-y-2">
              <label htmlFor="targetLanguage" className="block text-sm font-medium text-slate-700">
                Target Language
              </label>
              <select
                id="targetLanguage"
                value={options.targetLanguage}
                onChange={(e) => setOptions({...options, targetLanguage: e.target.value})}
                className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              >
                {SUPPORTED_LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code}>{lang.name}</option>
                ))}
              </select>
            </div>
            
            {/* Translation Scope */}
            <div className="space-y-2">
              <label htmlFor="translationScope" className="block text-sm font-medium text-slate-700">
                What to Translate
              </label>
              <textarea
                id="translationScope"
                value={options.translationScope === 'all' ? '' : options.translationScope || ''}
                onChange={(e) => setOptions({
                  ...options,
                  translationScope: e.target.value.trim() === '' ? 'all' : e.target.value
                })}
                placeholder="Leave blank to translate everything, or specify 'first paragraph', 'pages 5-8', etc."
                className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-sm"
                rows={3}
              />
              <p className="text-xs text-slate-500">
                Leave blank to translate the entire text, or specify which parts to focus on.
              </p>
            </div>
            
            {/* Explanation Level */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Explanation Level
              </label>
              <div className="space-y-1">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="explanationLevel"
                    value="minimal"
                    checked={options.explanationLevel === 'minimal'}
                    onChange={() => setOptions({...options, explanationLevel: 'minimal'})}
                    className="border-slate-300 text-cyan-600 focus:ring-cyan-500"
                  />
                  <span className="text-sm text-slate-700">Minimal - No explanatory notes</span>
                </label>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="explanationLevel"
                    value="moderate"
                    checked={options.explanationLevel === 'moderate'}
                    onChange={() => setOptions({...options, explanationLevel: 'moderate'})}
                    className="border-slate-300 text-cyan-600 focus:ring-cyan-500"
                  />
                  <span className="text-sm text-slate-700">Moderate - Brief explanations for cultural concepts</span>
                </label>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="explanationLevel"
                    value="extensive"
                    checked={options.explanationLevel === 'extensive'}
                    onChange={() => setOptions({...options, explanationLevel: 'extensive'})}
                    className="border-slate-300 text-cyan-600 focus:ring-cyan-500"
                  />
                  <span className="text-sm text-slate-700">Extensive - Detailed explanations and context</span>
                </label>
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 rounded-md transition-colors"
            >
              Apply Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}