// components/ui/InfoButton.tsx
// Update the component to properly get model information from processingData

import React, { useState } from 'react';

interface InfoButtonProps {
  sourceLength: number;
  modelId?: string;
  provider?: string;
  truncated?: boolean;
  wordCount?: number;
  truncatedLength?: number;
  processingData?: Record<string, any>;
  additionalInfo?: Record<string, any>;
}

export default function InfoButton({
  sourceLength,
  modelId = 'Unknown model',
  provider = 'Unknown',
  truncated = false,
  wordCount,
  truncatedLength,
  processingData = {},
  additionalInfo = {}
}: InfoButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Get actual model from processingData if available
  const actualModelId = processingData?.model || modelId;
  const actualProvider = processingData?.provider || provider;
  
  // Calculate word count if not provided
  const estimatedWordCount = wordCount || Math.round(sourceLength / 6.5);
  
  // Format numbers with commas
  const formatNumber = (num: number): string => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  
  const getProviderName = (id: string | undefined) => {
    if (!id) return 'Unknown';
    if (typeof id === 'string') {
      if (id.includes('gpt')) return 'OpenAI';
      if (id.includes('claude')) return 'Anthropic';
      if (id.includes('gemini')) return 'Google';
    }
    return actualProvider || 'Unknown';
  };
  
  return (
    <>
      {/* Info button */}
      <button
        onClick={() => setIsOpen(true)}
        className="text-slate-400 hover:text-indigo-600 transition-colors p-1 rounded-full hover:bg-slate-100"
        title="Source Info"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>
      
      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center p-4 border-b border-slate-200">
              <h3 className="font-medium text-lg text-slate-800">Source Information</h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-5">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-slate-500 mb-1">Source Size</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 p-3 rounded border border-slate-200">
                      <p className="text-xs text-slate-500">Characters</p>
                      <p className="text-lg font-medium text-slate-800">{formatNumber(sourceLength)}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded border border-slate-200">
                      <p className="text-xs text-slate-500">Words (approx.)</p>
                      <p className="text-lg font-medium text-slate-800">{formatNumber(estimatedWordCount)}</p>
                    </div>
                  </div>
                </div>
                
                {truncated && (
                  <div className="bg-amber-50 p-3 rounded border border-amber-200">
                    <p className="text-sm font-medium text-amber-800 mb-1">Source Truncated</p>
                    <p className="text-xs text-amber-700">
                      This source was truncated to {truncatedLength ? formatNumber(truncatedLength) : '20,000'} words for analysis.
                    </p>
                  </div>
                )}
                
                <div>
                  <h4 className="text-sm font-medium text-slate-500 mb-1">Model Information</h4>
                  <div className="bg-slate-50 p-3 rounded border border-slate-200">
                    <div className="flex justify-between mb-1">
                      <p className="text-xs text-slate-500">Model</p>
                      <p className="text-xs font-medium text-slate-800">{actualModelId}</p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-xs text-slate-500">Provider</p>
                      <p className="text-xs font-medium text-slate-800">{getProviderName(actualModelId)}</p>
                    </div>
                  </div>
                </div>
                
                {/* Additional info if provided */}
                {Object.keys(additionalInfo).length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-slate-500 mb-1">Additional Details</h4>
                    <div className="bg-slate-50 p-3 rounded border border-slate-200">
                      {Object.entries(additionalInfo).map(([key, value]) => (
                        <div key={key} className="flex justify-between mb-1">
                          <p className="text-xs text-slate-500">{key.charAt(0).toUpperCase() + key.slice(1)}</p>
                          <p className="text-xs font-medium text-slate-800">{String(value)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded transition-colors"
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