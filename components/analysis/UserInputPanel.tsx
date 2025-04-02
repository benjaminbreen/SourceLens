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
    <div className="space-y-4">
      {/* Analysis Perspective */}
      <div>
        <h3 className="font-semibold text-lg mb-2 ml-1 text-indigo-900">Analysis Perspective</h3>
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
                  placeholder=""
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
                className="px-3 py-1 text-sm font-medium text-slate-700 bg-amber-200 hover:bg-amber-300 rounded-md transition-all"
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


 {/* Analysis Tools */}
<div className="space-y-2">
  <h3 className="font-semibold text-lg text-indigo-900">Analysis Tools</h3>
  
  {/* Basic Analysis */}
  <button
    onClick={() => setActivePanel('analysis')}
    className={`flex items-center w-full shadow-sm px-4 py-2.5 rounded-md font-medium text-left transition-all duration-200 ${
      activePanel === 'analysis'
        ? 'bg-slate-100 border-l-4 border-indigo-400 pl-3'
        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-l-4 border-transparent pl-3'
    }`}
  >
    <svg 
      className={`w-5 h-5 mr-3 flex-shrink-0 text-indigo-600 ${
        activePanel === 'analysis' ? 'text-indigo-600' : 'hover:text-indigo-700 transition-colors'
      }`} 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
    <span className={activePanel === 'analysis' ? 'text-indigo-800' : 'text-slate-700'}>Basic Analysis</span>
  </button>
  
  {/* Detailed Analysis */}
  <button
    onClick={handleDetailedAnalysis}
    disabled={isLoading || !initialAnalysis}
    className={`flex items-center w-full px-4 py-2.5 shadow-sm rounded-md font-medium text-left transition-all duration-200 ${
      activePanel === 'detailed-analysis'
        ? 'bg-slate-100 border-l-4 border-amber-400 pl-3'
        : isLoading || !initialAnalysis
        ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-l-4 border-transparent pl-3'
        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-l-4 border-transparent pl-3'
    }`}
  >
    <svg 
      className={`w-5 h-5 mr-3 flex-shrink-0 text-amber-600 ${
        activePanel === 'detailed-analysis' 
          ? 'text-amber-600' 
          : isLoading || !initialAnalysis 
          ? 'text-slate-400' 
          : 'hover:text-amber-700 transition-colors'
      }`} 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
    <span className={
      activePanel === 'detailed-analysis' 
        ? 'text-amber-800' 
        : isLoading || !initialAnalysis 
        ? 'text-slate-400' 
        : 'text-slate-700'
    }>
      {detailedAnalysisLoaded && activePanel !== 'detailed-analysis'
        ? 'Show Detailed Analysis'
        : 'Detailed Analysis'}
    </span>
  </button>
  
  {/* Extract Information */}
  <button
    onClick={() => setActivePanel('extract-info')}
    disabled={isLoading || !initialAnalysis}
    className={`flex items-center w-full px-4 py-2.5 shadow-sm rounded-md font-medium text-left transition-all duration-200 ${
      activePanel === 'extract-info'
        ? 'bg-slate-100 border-l-4 border-emerald-400 pl-3'
        : isLoading || !initialAnalysis
        ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-l-4 border-transparent pl-3'
        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-l-4 border-transparent pl-3'
    }`}
  >
    <svg 
      className={`w-5 h-5 mr-3 flex-shrink-0 text-emerald-600 ${
        activePanel === 'extract-info' 
          ? 'text-emerald-600' 
          : isLoading || !initialAnalysis 
          ? 'text-slate-400' 
          : 'hover:text-emerald-700 transition-colors'
      }`} 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2M19 13l-4 4m0 0l-4-4m4 4V7" />
    </svg>
    <span className={
      activePanel === 'extract-info' 
        ? 'text-emerald-800' 
        : isLoading || !initialAnalysis 
        ? 'text-slate-400' 
        : 'text-slate-700'
    }>
      Extract Information
    </span>
  </button>
  
  {/* Suggest References */}
  <button
    onClick={handleSuggestReferences}
    disabled={isLoading || !initialAnalysis}
    className={`flex items-center w-full px-4 py-2.5 rounded-md shadow-sm font-medium text-left transition-all duration-200 ${
      activePanel === 'references'
        ? 'bg-slate-100 shadow-sm border-l-4 border-amber-500 pl-3 '
        : isLoading || !initialAnalysis
        ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-l-4 border-transparent pl-3'
        : 'bg-slate-100 text-slate-700  hover:bg-slate-200 border-l-4 border-transparent pl-3'
    }`}
  >
    <svg 
      className={`w-5 h-5 mr-3 flex-shrink-0 text-amber-700 ${
        activePanel === 'references' 
          ? 'text-amber-700' 
          : isLoading || !initialAnalysis 
          ? 'text-slate-400' 
          : 'hover:text-amber-800 transition-colors'
      }`} 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
    <span className={
      activePanel === 'references' 
        ? 'text-amber-800 ' 
        : isLoading || !initialAnalysis 
        ? 'text-slate-400' 
        : 'text-slate-700'
    }>
      Suggest References
    </span>
  </button>
  
  {/* Begin Roleplay */}
  <button
    onClick={handleBeginRoleplay}
    disabled={isLoading || !initialAnalysis}
    className={`flex items-center w-full px-4 py-2.5 shadow-sm rounded-md font-medium text-left transition-all duration-200 ${
      activePanel === 'roleplay'
        ? 'bg-slate-100 border-l-4 border-blue-400 pl-3'
        : isLoading || !initialAnalysis
        ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-l-4 border-transparent pl-3'
        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-l-4 border-transparent pl-3'
    }`}
  >
    <svg 
      className={`w-5 h-5 mr-3 flex-shrink-0 text-blue-600 ${
        activePanel === 'roleplay' 
          ? 'text-blue-600' 
          : isLoading || !initialAnalysis 
          ? 'text-slate-400' 
          : 'hover:text-blue-700 transition-colors'
      }`} 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
    </svg>
    <span className={
      activePanel === 'roleplay' 
        ? 'text-blue-800' 
        : isLoading || !initialAnalysis 
        ? 'text-slate-400' 
        : 'text-slate-700'
    }>
      Simulation Mode
    </span>
  </button>
  
  {/* Counter-Narrative */}
  <button
    onClick={handleCounterNarrative}
    disabled={isLoading || !initialAnalysis}
    className={`flex items-center w-full px-4 py-2.5 shadow-sm rounded-md font-medium text-left transition-all duration-200 ${
      activePanel === 'counter'
        ? 'bg-slate-100 border-l-4 border-purple-400 pl-3'
        : isLoading || !initialAnalysis
        ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-l-4 border-transparent pl-3'
        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-l-4 border-transparent pl-3'
    }`}
  >
    <svg 
      className={`w-5 h-5 mr-3 flex-shrink-0 text-purple-600 ${
        activePanel === 'counter' 
          ? 'text-purple-600' 
          : isLoading || !initialAnalysis 
          ? 'text-slate-400' 
          : 'hover:text-purple-700 transition-colors'
      }`} 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m-4 6H4m0 0l4 4m-4-4l4-4" />
    </svg>
    <span className={
      activePanel === 'counter' 
        ? 'text-purple-800' 
        : isLoading || !initialAnalysis 
        ? 'text-slate-400' 
        : 'text-slate-700'
    }>
      Counter-Narrative
    </span>
  </button>
  
  {/* Text Highlighting */}
  <button
    onClick={() => setActivePanel('highlight')}
    disabled={isLoading || !initialAnalysis}
    className={`flex items-center w-full px-4 py-2.5 shadow-sm rounded-md font-medium text-left transition-all duration-200 ${
      activePanel === 'highlight'
        ? 'bg-slate-100 border-l-4 border-yellow-400 pl-3'
        : isLoading || !initialAnalysis
        ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-l-4 border-transparent pl-3'
        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:shadow-md border-l-4 border-transparent pl-3'
    }`}
  >
    <svg 
      className={`w-5 h-5 mr-3 flex-shrink-0 text-yellow-500 ${
        activePanel === 'highlight' 
          ? 'text-yellow-500' 
          : isLoading || !initialAnalysis 
          ? 'text-slate-400' 
          : 'hover:text-yellow-600 transition-colors'
      }`} 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
    <span className={
      activePanel === 'highlight' 
        ? 'text-yellow-700' 
        : isLoading || !initialAnalysis 
        ? 'text-slate-400' 
        : 'text-slate-700'
    }>
      Text Highlighting
    </span>
  </button>
</div>

   {/* LLM Model Selection */}
      <ModelSelector />


     
    
    </div>
  );
}
