// components/analysis/UserInputPanel.tsx
// Manages user controls for analysis tools, LLM model selection, perspective input, 
// and switches between different analysis modes. Uses the new centralized model configuration.

'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import ModelSelector from '@/components/ui/ModelSelector';
import { models } from '@/lib/models';

export default function UserInputPanel() {
  const { 
    activePanel,
    setActivePanel,
    perspective,
    setPerspective,
    initialAnalysis,
    isLoading,
    llmModel,
    sourceContent,
    metadata,
    setLoading,
    setDetailedAnalysis,
    setRawPrompt,
    setRawResponse,
    setCounterNarrative,
    setRoleplayMode
  } = useAppStore();
  
  const [showPerspectiveInput, setShowPerspectiveInput] = useState(false);
  const [perspectiveInput, setPerspectiveInput] = useState('');

  const handlePerspectiveSubmit = () => {
    setPerspective(perspectiveInput);
    setShowPerspectiveInput(false);
    // Don't trigger reanalysis here - let the analysis page handle it
  };
  
  // Handler for generating detailed analysis
  const handleDetailedAnalysis = async () => {
    if (isLoading || !initialAnalysis) return;
    
    setLoading(true);
    
    try {
      const response = await fetch('/api/detailed-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source: sourceContent,
          metadata: metadata,
          perspective: perspective,
          modelId: llmModel  // Updated to use modelId instead of model
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
      }
      
      const data = await response.json();
      
      // Set the detailed analysis
      setDetailedAnalysis(data.analysis);
      
      // Store raw data for transparency
      setRawPrompt(data.rawPrompt);
      setRawResponse(data.rawResponse);
      
      // Switch to analysis panel to show the result
      setActivePanel('analysis');
      
    } catch (error) {
      console.error("Detailed analysis error:", error);
      alert("Error generating detailed analysis. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  // Handler for generating counter-narrative
  const handleCounterNarrative = async () => {
    if (isLoading || !initialAnalysis) return;
    
    setLoading(true);
    
    try {
      const response = await fetch('/api/counter-narrative', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source: sourceContent,
          metadata: metadata,
          perspective: perspective,
          modelId: llmModel  // Updated to use modelId instead of model
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
      }
      
      const data = await response.json();
      
      // Store the counter-narrative
      if (data.narrative) {
        setCounterNarrative(data.narrative);
      }
      
      // Store raw data for transparency
      setRawPrompt(data.rawPrompt);
      setRawResponse(data.rawResponse);
      
      // Switch to counter-narrative panel to show the result
      setActivePanel('counter');
      
    } catch (error) {
      console.error("Counter-narrative error:", error);
      alert("Error generating counter-narrative. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  // Handler for beginning roleplay
  const handleBeginRoleplay = () => {
    if (isLoading || !initialAnalysis) return;
    
    // Clear any existing conversation
    useAppStore.getState().clearConversation();
    
    // Set roleplay mode true
    setRoleplayMode(true);
    
    // Switch to roleplay panel
    setActivePanel('roleplay');
  };

  // Handler for suggesting references
  const handleSuggestReferences = () => {
    if (isLoading || !initialAnalysis) return;
    
    // Switch to references panel
    setActivePanel('references');
  };

  return (
    <div className="space-y-4">
      {/* Analysis Perspective */}
      <div>
        <h3 className="font-medium mb-2">Analysis Perspective</h3>
        
        {showPerspectiveInput ? (
          <div className="space-y-2">
            <input
              type="text"
              className="w-full p-2 border border-slate-200 rounded focus:border-amber-700 focus:ring-2 focus:ring-amber-700/20"
              placeholder="E.g., Marxist analysis, feminist reading..."
              value={perspectiveInput}
              onChange={(e) => setPerspectiveInput(e.target.value)}
            />
            <div className="flex space-x-2">
              <button
                onClick={handlePerspectiveSubmit}
                className="px-3 py-1 bg-amber-700 text-white text-sm rounded"
                disabled={!perspectiveInput.trim()}
              >
                Apply
              </button>
              <button
                onClick={() => setShowPerspectiveInput(false)}
                className="px-3 py-1 bg-slate-200 text-slate-700 text-sm rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div 
            onClick={() => setShowPerspectiveInput(true)}
            className="p-2 border border-slate-200 rounded flex justify-between items-center cursor-pointer hover:bg-slate-50"
          >
            <span className="text-sm">
              {perspective ? perspective : 'Default (no specific perspective)'}
            </span>
            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </div>
        )}
      </div>
      
      {/* LLM Model Selection - now using the ModelSelector component */}
      <ModelSelector />
      
      {/* Analysis Tools */}
      <div className="space-y-1">
        <h3 className="font-medium mb-2">Analysis Tools</h3>
        
        <button
          onClick={() => setActivePanel('analysis')}
          className={`w-full text-left p-2 rounded ${
            activePanel === 'analysis' 
              ? 'bg-amber-700 text-white' 
              : 'bg-slate-100 hover:bg-slate-200 text-slate-900'
          }`}
        >
          Basic Analysis
        </button>
        
        <button
          onClick={handleDetailedAnalysis}
          disabled={isLoading || !initialAnalysis}
          className={`w-full text-left p-2 rounded ${
            isLoading || !initialAnalysis
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
              : 'bg-slate-100 hover:bg-slate-200 text-slate-900'
          }`}
        >
          Generate Detailed Analysis
        </button>
        
        <button
          onClick={handleCounterNarrative}
          disabled={isLoading || !initialAnalysis}
          className={`w-full text-left p-2 rounded ${
            activePanel === 'counter'
              ? 'bg-amber-700 text-white'
              : isLoading || !initialAnalysis
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
              : 'bg-slate-100 hover:bg-slate-200 text-slate-900'
          }`}
        >
          Generate Counter-Narrative
        </button>

        <button
  onClick={handleSuggestReferences}
  disabled={isLoading || !initialAnalysis}
  className={`w-full text-left p-2 rounded ${
    activePanel === 'references'
      ? 'bg-amber-700 text-white'
      : isLoading || !initialAnalysis
      ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
      : 'bg-slate-100 hover:bg-slate-200 text-slate-900'
  }`}
>
  Suggest References
</button>
        
        <button
          onClick={handleBeginRoleplay}
          disabled={isLoading || !initialAnalysis}
          className={`w-full text-left p-2 rounded ${
            activePanel === 'roleplay'
              ? 'bg-amber-700 text-white'
              : isLoading || !initialAnalysis
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
              : 'bg-slate-100 hover:bg-slate-200 text-slate-900'
          }`}
        >
          Begin Roleplay
        </button>
      </div>
      
      {/* Model Information Panel */}
      {llmModel && (
        <div className="mt-2 p-3 bg-slate-50 rounded-md border border-slate-200 text-xs">
          <h4 className="font-medium text-slate-700 mb-1">About Selected Model</h4>
          <p className="text-slate-600">{getModelDescription(llmModel)}</p>
        </div>
      )}
    </div>
  );
}

// Helper function to get a more detailed description for the current model
function getModelDescription(modelId: string): string {
  const model = models.find(m => m.id === modelId);
  
  if (!model) return "Unknown model selected";
  
  const descriptions: Record<string, string> = {
    'claude-haiku': "Claude 3.5 Haiku is Anthropic's fastest model, ideal for quick analyses and summaries with response times under a second. Best for initial analysis and roleplay.",
    'claude-sonnet': "Claude 3.7 Sonnet is Anthropic's most advanced model, offering deeper contextual understanding and more nuanced analysis. Recommended for detailed analysis and counter-narratives.",
    'gpt-4o-mini': "GPT-4o Mini offers a good balance of speed and accuracy, making it suitable for basic analysis and initial insights at a lower computational cost.",
    'gpt-4o': "GPT-4o is OpenAI's well-rounded model with excellent reasoning abilities and broad knowledge. Works well for all analysis types.",
    'gpt-4.5-preview': "GPT-4.5 Preview is OpenAI's cutting-edge model with enhanced reasoning and the most up-to-date capabilities. Ideal for complex counter-narrative generation.",
    'gemini-flash': "Gemini 2.0 Flash by Google offers fast, efficient processing with strong reasoning capabilities, particularly good at contextual understanding of historical documents.",
    'o3-mini': "O3 Mini is OpenAI's lightweight model optimized for speed and efficiency, best for quick initial analyses with straightforward texts."
  };
  
  return descriptions[model.id] || model.description || `${model.name} by ${model.provider === 'anthropic' ? 'Anthropic' : model.provider === 'openai' ? 'OpenAI' : 'Google'}`;
}