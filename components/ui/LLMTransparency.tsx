// components/ui/LLMTransparency.tsx
'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { getModelById, LEGACY_MODEL_MAPPING } from '@/lib/models';
import { models } from '@/lib/models';

// LLM Transparency component that provides visibility into AI exchanges
// Shows model description and allows viewing of complete prompts and responses
export default function LLMTransparency({ 
  rawPrompt, 
  rawResponse 
}: { 
  rawPrompt: string | null;
  rawResponse: string | null;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('response'); // 'response' or 'prompt'
  const { llmModel } = useAppStore();
  
  if (!rawResponse && !rawPrompt) return null;
  
  // Get the effective model ID (handling legacy IDs)
  const effectiveModelId = LEGACY_MODEL_MAPPING[llmModel] || llmModel;
  
  // Get model information safely
  let modelName = "Unknown Model";
  let modelProvider = "";
  let modelDescription = "Click below to see the raw LLM output.";
  
  try {
    const modelConfig = getModelById(effectiveModelId);
    modelName = modelConfig.name;
    modelProvider = modelConfig.provider === 'anthropic' ? 'Anthropic' : 
                    modelConfig.provider === 'openai' ? 'OpenAI' : 'Google';
    
  } catch (error) {
    console.error("Error getting model info:", error);
  }

  function getModelDescription(modelId: string): string {
    const model = models.find((m) => m.id === modelId);
    if (!model) return 'Unknown model selected';

    const descriptions: Record<string, string> = {
      'claude-haiku':
        "Claude 3.5 Haiku is Anthropic's fastest model, ideal for quick analyses with sub-second response times.",
      'claude-sonnet':
        "Claude 3.7 Sonnet is Anthropic's most advanced model, providing nuanced analysis for in-depth tasks.",
      'gpt-4o-mini':
        'GPT-4o Mini balances speed and accuracy, ideal for basic analysis at a lower cost.',
      'gpt-4o':
        "GPT-4o is well-rounded with excellent reasoning. It works well across diverse analysis types.",
      'gpt-4.5-preview':
        "GPT-4.5 Preview is cutting-edge, recommended for complex counter-narratives and thorough analyses.",
      'gemini-flash':
        "Gemini 2.0 Flash by Google is speedy and strong in context handling, great for historical documents.",
      'gemini-flash-lite':
        "Gemini 2.0 Flash Lite is a faster, budget-friendly variant of Flash 2.0 with solid reasoning.",
      'o3-mini':
        "O3 Mini is a lightweight OpenAI model for quick initial analyses with simpler texts.",
      'gemini-2.0-pro-exp-02-05':
        "Google's newest experimental model, offering top-tier reasoning and context handling.",
    };

    return (
      descriptions[model.id] ||
      model.description ||
      `${model.name} by ${
        model.provider === 'anthropic'
          ? 'Anthropic'
          : model.provider === 'openai'
          ? 'OpenAI'
          : 'Google'
      }`
    );
  }

  // Helper to choose the correct logo image from public folder
  function getModelLogo(modelId: string): string {
    if (modelId.includes('claude')) return '/anthropic.png';
    if (modelId.includes('gpt') || modelId.includes('o3')) return '/openai.png';
    if (modelId.includes('gemini')) return '/gemini.png';
    // fallback
    return '/anthropic.png';
  }

  
  
  return (
    <>
      {/* Model description */}
      <p className="text-sm italic text-slate-600 mb-2">
        {modelDescription}
      </p>
      
      <button
        onClick={() => setIsOpen(true)}
        className="w-full mt-2 px-4 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
      >
        See what the AI sees
      </button>

        {llmModel && (
        <div className="mt-4 p-3 bg-slate-50 rounded-md border border-slate-200 text-xs flex items-start space-x-2">
          <img
            src={getModelLogo(llmModel)}
            alt="Provider Logo"
            className="w-8 h-8 mt-0.5"
          />
          <div>
            <h4 className="font-medium text-slate-700 mb-1">About Selected Model</h4>
            <p className="text-slate-600">{getModelDescription(llmModel)}</p>
          </div>
        </div>
      )}
      
      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <div>
                <h3 className="font-bold text-lg">Raw LLM Exchange</h3>
                <p className="text-xs text-gray-500 mt-1">Using {modelName} by {modelProvider}</p>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-800 text-2xl"
              >
                &times;
              </button>
            </div>
            
            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              <button
                className={`px-4 py-2 font-medium text-sm ${
                  activeTab === 'prompt' 
                    ? 'bg-white border-b-2 border-primary-500 text-primary-600' 
                    : 'bg-gray-50 text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('prompt')}
              >
                Prompt Sent
              </button>
              <button
                className={`px-4 py-2 font-medium text-sm ${
                  activeTab === 'response' 
                    ? 'bg-white border-b-2 border-primary-500 text-primary-600' 
                    : 'bg-gray-50 text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('response')}
              >
                Response Received
              </button>
            </div>
            
            {/* Content */}
            <div className="flex-1 overflow-auto p-4">
              {activeTab === 'prompt' ? (
                <div className="mb-2 text-sm text-gray-500">
                  <div className="bg-blue-50 p-3 mb-3 rounded-lg border border-blue-100">
                    <p className="font-medium text-blue-800">Prompt sent to {modelName} ({modelProvider})</p>
                  </div>
                  <pre className="bg-gray-100 p-4 rounded whitespace-pre-wrap text-sm font-mono overflow-auto max-h-[70vh] border border-gray-300">
                    {rawPrompt || 'No prompt data available'}
                  </pre>
                </div>
              ) : (
                <div className="mb-2 text-sm text-gray-500">
                  <div className="bg-green-50 p-3 mb-3 rounded-lg border border-green-100">
                    <p className="font-medium text-green-800">Response from {modelName} ({modelProvider})</p>
                  </div>
                  <pre className="bg-gray-100 p-4 rounded whitespace-pre-wrap text-sm font-mono overflow-auto max-h-[70vh] border border-gray-300">
                    {rawResponse || 'No response data available'}
                  </pre>
                </div>
              )}
            </div>
            
            {/* Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-gray-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
