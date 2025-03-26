// components/analysis/UserInputPanel.tsx
// Manages user controls for analysis tools and perspective input.
// Also shows the "About Selected Model" section with provider logos.

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

  // Simple function to get a friendly model description
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

  // Handler for perspective input
  const handlePerspectiveSubmit = () => {
    setPerspective(perspectiveInput);
    setShowPerspectiveInput(false);
  };

  const handlePerspectiveWithCardSubmit = () => {
    if (cardText) {
      const llmPerspective = `Here is a koan-like suggestion for creativity and grounded analysis: ${cardText}`;
      setPerspective(llmPerspective);
      setShowPerspectiveInput(false);
      setIsCardDropped(false);
      setPerspectiveInput('');
      setCardText('');
    }
  };

  // Detailed Analysis
  const handleDetailedAnalysis = async () => {
    if (isLoading || !initialAnalysis) return;

    if (detailedAnalysisLoaded) {
      setActivePanel('detailed-analysis');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/detailed-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      setDetailedAnalysis(data.analysis);
      setRawPrompt(data.rawPrompt);
      setRawResponse(data.rawResponse);
      setDetailedAnalysisLoaded(true);
      setActivePanel('detailed-analysis');
    } catch (error) {
      console.error("Detailed analysis error:", error);
      alert(`Error generating detailed analysis: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Counter Narrative
  const handleCounterNarrative = async () => {
    if (isLoading || !initialAnalysis) return;

    setLoading(true);
    try {
      const response = await fetch('/api/counter-narrative', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      if (data.narrative) {
        setCounterNarrative(data.narrative);
      }
      setRawPrompt(data.rawPrompt);
      setRawResponse(data.rawResponse);
      setActivePanel('counter');
    } catch (error) {
      console.error("Counter-narrative error:", error);
      alert(`Error generating counter-narrative: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Roleplay
  const handleBeginRoleplay = () => {
    if (isLoading || !initialAnalysis) return;
    useAppStore.getState().clearConversation();
    setRoleplayMode(true);
    setActivePanel('roleplay');
  };

  // Suggest References
  const handleSuggestReferences = () => {
    if (isLoading || !initialAnalysis) return;
    setActivePanel('references');
  };

  return (
    <div className="space-y-6">
      {/* Analysis Perspective */}
      <div>
        <h3 className="font-medium mb-2 text-slate-800">Analysis Perspective</h3>
        {showPerspectiveInput ? (
          <div className="space-y-2">
            {isCardDropped ? (
              <div className="px-4 py-3 bg-amber-50 border border-amber-200 rounded-md flex items-start justify-between">
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
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="relative">
                <input
                  type="text"
                  className={`w-full p-2 border rounded focus:border-amber-700 focus:ring-2 focus:ring-amber-700/20 transition-colors ${
                    isDragOver ? 'border-amber-400 bg-amber-50/30' : 'border-slate-200'
                  }`}
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
                    <span className="text-sm bg-amber-50 px-2 py-1 rounded shadow-sm">
                      Drop card here
                    </span>
                  </div>
                )}
              </div>
            )}
            <div className="flex space-x-2">
              <button
                onClick={isCardDropped ? handlePerspectiveWithCardSubmit : handlePerspectiveSubmit}
                className="px-3 py-1 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-md transition-all disabled:bg-slate-300 disabled:cursor-not-allowed"
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
                className="px-3 py-1 text-sm font-medium text-slate-700 bg-slate-200 hover:bg-slate-300 rounded-md transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => setShowPerspectiveInput(true)}
            className={`p-2 border rounded flex justify-between items-center cursor-pointer hover:bg-slate-50 transition-colors ${
              isDragOver ? 'border-amber-400 bg-amber-50/30' : 'border-slate-200'
            }`}
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
            <span className="text-sm text-slate-700">
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

      {/* LLM Model Selection */}
      <ModelSelector />

      {/* Analysis Tools */}
      <div className="space-y-2">
        <h3 className="font-medium text-slate-800">Analysis Tools</h3>

        {/* Basic Analysis */}
        <button
          onClick={() => setActivePanel('analysis')}
          className={`block w-full px-4 py-2 rounded-md font-medium text-left transition-colors shadow-sm
            ${
              activePanel === 'analysis'
                ? 'bg-amber-600 text-white hover:bg-amber-700'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
        >
          Basic Analysis
        </button>

        {/* Detailed Analysis */}
        <button
          onClick={handleDetailedAnalysis}
          disabled={isLoading || !initialAnalysis}
          className={`block w-full px-4 py-2 rounded-md font-medium text-left transition-colors shadow-sm ${
            activePanel === 'detailed-analysis'
              ? 'bg-amber-600 text-white hover:bg-amber-700'
              : isLoading || !initialAnalysis
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          {detailedAnalysisLoaded && activePanel !== 'detailed-analysis'
            ? 'Show Detailed Analysis'
            : 'Generate Detailed Analysis'}
        </button>

        {/* Counter-Narrative */}
        <button
          onClick={handleCounterNarrative}
          disabled={isLoading || !initialAnalysis}
          className={`block w-full px-4 py-2 rounded-md font-medium text-left transition-colors shadow-sm ${
            activePanel === 'counter'
              ? 'bg-amber-600 text-white hover:bg-amber-700'
              : isLoading || !initialAnalysis
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          Generate Counter-Narrative
        </button>

        {/* Suggest References */}
        <button
          onClick={handleSuggestReferences}
          disabled={isLoading || !initialAnalysis}
          className={`block w-full px-4 py-2 rounded-md font-medium text-left transition-colors shadow-sm ${
            activePanel === 'references'
              ? 'bg-amber-600 text-white hover:bg-amber-700'
              : isLoading || !initialAnalysis
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          Suggest References
        </button>

        {/* Extract Information */}
        <button
          onClick={() => setActivePanel('extract-info')}
          disabled={isLoading || !initialAnalysis}
          className={`block w-full px-4 py-2 rounded-md font-medium text-left transition-colors shadow-sm ${
            activePanel === 'extract-info'
              ? 'bg-amber-600 text-white hover:bg-amber-700'
              : isLoading || !initialAnalysis
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          Extract Information
        </button>

        {/* Begin Roleplay */}
        <button
          onClick={handleBeginRoleplay}
          disabled={isLoading || !initialAnalysis}
          className={`block w-full px-4 py-2 rounded-md font-medium text-left transition-colors shadow-sm ${
            activePanel === 'roleplay'
              ? 'bg-amber-600 text-white hover:bg-amber-700'
              : isLoading || !initialAnalysis
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          Begin Roleplay
        </button>
      </div>

      {/* Model Info Panel with provider logo */}
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
    </div>
  );
}
