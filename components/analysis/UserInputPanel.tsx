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
    setRoleplayMode,
    detailedAnalysisLoaded,
    setDetailedAnalysisLoaded,
  } = useAppStore();
  
  const [showPerspectiveInput, setShowPerspectiveInput] = useState(false);
  const [perspectiveInput, setPerspectiveInput] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [isCardDropped, setIsCardDropped] = useState(false);
  const [cardText, setCardText] = useState('');
  const [analysisType, setAnalysisType] = useState<'basic' | 'detailed'>('basic');


  const handlePerspectiveSubmit = () => {
    setPerspective(perspectiveInput);
    setShowPerspectiveInput(false);
    // Don't trigger reanalysis here - let the analysis page handle it
  };

  const handlePerspectiveWithCardSubmit = () => {
    if (cardText) {
      // Add explanatory text for the LLM while preserving the card text for display
      const llmPerspective = `Here is a koan-like suggestion to encourage creativity, experimentation, and factually-grounded perspective-taking when considering this source: ${cardText}`;
      
      setPerspective(llmPerspective);
      setShowPerspectiveInput(false);
      setIsCardDropped(false);
      setPerspectiveInput('');
      setCardText('');
    }
  };
  
  // Handler for generating detailed analysis
  // Handler for generating detailed analysis
const handleDetailedAnalysis = async () => {
  if (isLoading || !initialAnalysis) return;
  
  // If detailed analysis is already loaded, just switch panels
  if (detailedAnalysisLoaded) {
    setActivePanel('detailed-analysis');
    return;
  }
  
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
        modelId: llmModel
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
    
    // Mark that detailed analysis has been loaded
    setDetailedAnalysisLoaded(true);
    
    // Switch to detailed-analysis panel to show the result
    setActivePanel('detailed-analysis');
    
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
            {isCardDropped ? (
              <div className="px-4 py-3 bg-amber-50 border border-amber-200 rounded-md">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-amber-800 mb-1">
                      **Creative strategy card enabled**
                    </p>
                    <p className="text-sm text-amber-700">{cardText}</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => {
                      setIsCardDropped(false);
                      setCardText('');
                    }}
                    className="text-amber-600 hover:text-amber-800 transition-colors"
                    aria-label="Remove card"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ) : (
              <div className="relative">
                <input
                  type="text"
                  className={`w-full p-2 border ${
                    isDragOver ? 'border-amber-400 bg-amber-50/30' : 'border-slate-200'
                  } rounded focus:border-amber-700 focus:ring-2 focus:ring-amber-700/20 transition-colors`}
                  placeholder="E.g., Marxist analysis, feminist reading..."
                  value={perspectiveInput}
                  onChange={(e) => setPerspectiveInput(e.target.value)}
                  onDrop={(e) => {
                    e.preventDefault();
                    const droppedText = e.dataTransfer.getData('text/plain');
                    if (droppedText) {
                      setIsCardDropped(true);
                      setCardText(droppedText);
                      setPerspectiveInput('');
                    }
                    setIsDragOver(false);
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    setIsDragOver(false);
                  }}
                />
                {isDragOver && (
                  <div className="absolute inset-0 flex items-center justify-center text-amber-600 pointer-events-none">
                    <span className="text-sm bg-amber-50 px-2 py-1 rounded shadow-sm">Drop card here</span>
                  </div>
                )}
              </div>
            )}
            <div className="flex space-x-2">
              <button
                onClick={isCardDropped ? handlePerspectiveWithCardSubmit : handlePerspectiveSubmit}
                className="px-3 py-1 bg-amber-700 text-white text-sm rounded"
                disabled={!isCardDropped && !perspectiveInput.trim()}
              >
                Apply
              </button>
              <button
                onClick={() => {
                  setShowPerspectiveInput(false);
                  setIsDragOver(false);
                  setIsCardDropped(false);
                  setCardText('');
                }}
                className="px-3 py-1 bg-slate-200 text-slate-700 text-sm rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div 
            onClick={() => setShowPerspectiveInput(true)}
            className={`p-2 border ${
              isDragOver ? 'border-amber-400 bg-amber-50/30' : 'border-slate-200'
            } rounded flex justify-between items-center cursor-pointer hover:bg-slate-50 transition-colors`}
            onDrop={(e) => {
              e.preventDefault();
              const droppedText = e.dataTransfer.getData('text/plain');
              if (droppedText) {
                setIsCardDropped(true);
                setCardText(droppedText);
                setShowPerspectiveInput(true);
              }
              setIsDragOver(false);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setIsDragOver(false);
            }}
          >
            <span className="text-sm">
              {perspective && !perspective.includes('koan-like suggestion') 
                ? perspective 
                : perspective && perspective.includes('koan-like suggestion')
                  ? '**Creative strategy card enabled**'
                  : 'Default (no specific perspective)'}
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
         activePanel === 'detailed-analysis'  // Changed this line
           ? 'bg-amber-700 text-white'
           : isLoading || !initialAnalysis
           ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
           : 'bg-slate-100 hover:bg-slate-200 text-slate-900'
       }`}
     >
       {detailedAnalysisLoaded && activePanel !== 'detailed-analysis'  // toggle detailed
         ? 'Show Detailed Analysis' 
         : 'Generate Detailed Analysis'}
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
  onClick={() => setActivePanel('extract-info')}
  disabled={isLoading || !initialAnalysis}
  className={`w-full text-left p-2 rounded ${
    activePanel === 'extract-info'
      ? 'bg-amber-700 text-white'
      : isLoading || !initialAnalysis
      ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
      : 'bg-slate-100 hover:bg-slate-200 text-slate-900'
  }`}
>
  Extract Information
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