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
}

export default function ModelSelector({ compact = false, className = '' }: ModelSelectorProps) {
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
    <div className={`space-y-1 ${className}`}>
      {/* Label shown only if not in compact mode */}
      {!compact && (
        <label className="block text-sm font-medium text-slate-700">
          LLM Model
        </label>
      )}

      {/* Dropdown container for better styling */}
      <div className="relative">
        <select
          value={llmModel}
          onChange={handleModelChange}
          aria-label="Select LLM model"
          className="
            w-full appearance-none rounded-md border border-slate-300 bg-white 
            py-2 px-3 text-sm text-slate-700 shadow-sm transition-colors
            focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500
            hover:cursor-pointer
          "
        >
          <optgroup label="Anthropic">
            {anthropicModels.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))}
          </optgroup>

          <optgroup label="OpenAI">
            {openaiModels.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))}
          </optgroup>

          <optgroup label="Google">
            {googleModels.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))}
          </optgroup>
        </select>

        {/* Custom down-arrow icon (SVG) in the right side of the select */}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Selected model description (hidden if compact) */}
      {!compact && llmModel && (
        <p className="mt-1 text-xs text-slate-500">{selectedModelDescription}</p>
      )}
    </div>
  );
}
