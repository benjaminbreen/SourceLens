// components/ui/LLMTransparency.tsx
'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { getModelById, LEGACY_MODEL_MAPPING } from '@/lib/models';

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
