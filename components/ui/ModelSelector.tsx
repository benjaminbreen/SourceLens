// components/ui/ModelSelector.tsx
'use client';

import React from 'react';
import { models, getModelById } from '@/lib/models';
import { useAppStore } from '@/lib/store';

interface ModelSelectorProps {
  compact?: boolean; // Show compact version with fewer details
  className?: string; // Additional CSS classes
}

export default function ModelSelector({ compact = false, className = '' }: ModelSelectorProps) {
  const { llmModel, setLLMModel } = useAppStore();
  
  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    // Just pass the selected model ID directly to the store
    const modelId = e.target.value;
    setLLMModel(modelId);
  };
  
  // Group models by provider for better organization
  const anthropicModels = models.filter(model => model.provider === 'anthropic');
  const openaiModels = models.filter(model => model.provider === 'openai');
  const googleModels = models.filter(model => model.provider === 'google');
  
  return (
    <div className={`${className}`}>
      {!compact && <h3 className="font-medium mb-2">LLM Model</h3>}
      
      <select
        value={llmModel}
        onChange={handleModelChange}
        className="w-full p-2 border border-slate-200 rounded focus:border-amber-700 focus:ring-2 focus:ring-amber-700/20"
        aria-label="Select LLM model"
      >
        <optgroup label="Anthropic">
          {anthropicModels.map(model => (
            <option key={model.id} value={model.id}>
              {model.name}
            </option>
          ))}
        </optgroup>
        
        <optgroup label="OpenAI">
          {openaiModels.map(model => (
            <option key={model.id} value={model.id}>
              {model.name}
            </option>
          ))}
        </optgroup>
        
        <optgroup label="Google">
          {googleModels.map(model => (
            <option key={model.id} value={model.id}>
              {model.name}
            </option>
          ))}
        </optgroup>
      </select>
      
      {!compact && llmModel && (
        <p className="mt-1 text-xs text-slate-500">
          {/* Safely handle the case where the model might not be found */}
          {models.find(m => m.id === llmModel)?.description || "Select a model"}
        </p>
      )}
    </div>
  );
}