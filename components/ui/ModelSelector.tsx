// components/ui/ModelSelector.tsx
// A more polished and professional-looking dropdown for selecting an LLM model.
// Maintains the original functionality (grouping by provider, compact mode, etc.).

'use client';

import React from 'react';
import { models } from '@/lib/models';
import { useAppStore } from '@/lib/store';

interface ModelSelectorProps {
  compact?: boolean; // Show compact version with fewer details
  className?: string; // Additional CSS classes
   darkMode?: boolean; // Add dark mode support
}

export default function ModelSelector({ compact = false, className = '', darkMode = false }: ModelSelectorProps) {
  const { llmModel, setLLMModel } = useAppStore();

  // Group models by provider
  const anthropicModels = models.filter((m) => m.provider === 'anthropic');
  const openaiModels = models.filter((m) => m.provider === 'openai');
  const googleModels = models.filter((m) => m.provider === 'google');

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newModelId = e.target.value;
    console.log(`ModelSelector: Selected model changed to "${newModelId}"`);
    setLLMModel(newModelId);
  };

  // Safely look up the model's description
  const selectedModelDescription =
    models.find((m) => m.id === llmModel)?.description || 'Select a model';

   return (
    <div className={`${className}`}>
      {!compact && <h3 className={`font-medium mb-2 ${darkMode ? 'text-indigo-300' : 'text-indigo-900'} transition-colors duration-200`}>LLM Model</h3>}
      
      <select
        value={llmModel}
        onChange={handleModelChange}
        className={`w-full p-2 rounded focus:ring-2 transition-colors duration-200 ${
          darkMode 
            ? 'border-slate-700 bg-slate-800/30 text-slate-300 focus:border-indigo-500 focus:ring-indigo-500/20' 
            : 'border-slate-200 focus:border-amber-700 focus:ring-amber-700/20 text-slate-700'
        } border`}
        aria-label="Select LLM model"
      >
        <optgroup label="Anthropic" className={darkMode ? 'bg-slate-800 text-slate-300' : ''}>
          {anthropicModels.map(model => (
            <option key={model.id} value={model.id} className={darkMode ? 'bg-slate-800' : ''}>
              {model.name}
            </option>
          ))}
        </optgroup>
        
        <optgroup label="OpenAI" className={darkMode ? 'bg-slate-800 text-slate-300' : ''}>
          {openaiModels.map(model => (
            <option key={model.id} value={model.id} className={darkMode ? 'bg-slate-800' : ''}>
              {model.name}
            </option>
          ))}
        </optgroup>
        
        <optgroup label="Google" className={darkMode ? 'bg-slate-800 text-slate-300' : ''}>
          {googleModels.map(model => (
            <option key={model.id} value={model.id} className={darkMode ? 'bg-slate-800' : ''}>
              {model.name}
            </option>
          ))}
        </optgroup>
      </select>
      
      {!compact && llmModel && (
        <p className={`mt-1 text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'} transition-colors duration-200`}>
          {/* Safely handle the case where the model might not be found */}
          {models.find(m => m.id === llmModel)?.description || "Select a model"}
        </p>
      )}
    </div>
  );
}
