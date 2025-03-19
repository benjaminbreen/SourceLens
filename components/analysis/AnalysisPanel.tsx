// components/analysis/AnalysisPanel.tsx
// Component for displaying different types of analysis results
// Includes summary, detailed analysis, follow-up questions, and more

'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';

export default function AnalysisPanel() {
  const { 
    initialAnalysis, 
    detailedAnalysis,
    counterNarrative,
    activePanel,
    isLoading,
    addMessage
  } = useAppStore();
  
  const [selectedQuestion, setSelectedQuestion] = useState<number | null>(null);

  // Function to handle asking a follow-up question
  const handleAskQuestion = (question: string) => {
    if (question.trim()) {
      addMessage({
        role: 'user',
        content: question
      });
    }
  };

  if (isLoading && !initialAnalysis) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center">
        <div className="w-12 h-12 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin mb-4"></div>
        <p className="text-slate-600">Analyzing your source...</p>
      </div>
    );
  }

  if (!initialAnalysis) {
    return (
      <div className="h-full flex items-center justify-center p-8 text-center">
        <div className="text-slate-500">
          <svg className="w-12 h-12 mx-auto mb-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <p>
            Waiting for analysis to begin...
          </p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activePanel) {
      case 'counter':
        return (
          <div>
            <h3 className="text-lg font-medium text-slate-800 mb-3 pb-2 border-b border-slate-100">Counter-Narrative</h3>
            {counterNarrative ? (
              <div className="prose prose-slate max-w-none">
                {counterNarrative.split('\n').map((paragraph, idx) => (
                  <p key={idx} className="mb-3">{paragraph}</p>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 italic">
                Click "Generate Counter-Narrative" in the tools panel to see an alternative interpretation of this source.
              </p>
            )}
          </div>
        );
      case 'roleplay':
        return (
          <div>
            <h3 className="text-lg font-medium text-slate-800 mb-3 pb-2 border-b border-slate-100">Author Perspective</h3>
            <p className="text-slate-500 italic">
              Click "Begin Roleplay" in the tools panel to simulate a conversation with the author.
            </p>
          </div>
        );
      case 'analysis':
      default:
        return (
          <div>
            <div className="mb-5">
              <h3 className="text-lg font-medium text-slate-800 mb-3 pb-2 border-b border-slate-100">Summary</h3>
              <p className="text-slate-700">{initialAnalysis.summary}</p>
            </div>
            
            <div className="mb-5">
              <h3 className="text-lg font-medium text-slate-800 mb-3 pb-2 border-b border-slate-100">Preliminary Analysis</h3>
              <p className="text-slate-700">{initialAnalysis.analysis}</p>
            </div>
            
            {detailedAnalysis && (
              <div className="mb-5">
                <h3 className="text-lg font-medium text-slate-800 mb-3 pb-2 border-b border-slate-100">Detailed Analysis</h3>
                <div className="prose prose-slate max-w-none">
                  {detailedAnalysis.split('\n').map((paragraph, idx) => (
                    <p key={idx} className="mb-3">{paragraph}</p>
                  ))}
                </div>
              </div>
            )}
            
            <div>
              <h3 className="text-lg font-medium text-slate-800 mb-3 pb-2 border-b border-slate-100">Follow-up Questions</h3>
              <p className="text-sm text-slate-500 mb-3">
                Click a question to ask it in the conversation:
              </p>
              <div className="space-y-2">
                {initialAnalysis.followupQuestions.map((question, idx) => (
                  <div 
                    key={idx}
                    className={`p-3 border rounded-md cursor-pointer transition-colors ${
                      selectedQuestion === idx 
                        ? 'bg-indigo-50 border-indigo-300 shadow-sm' 
                        : 'hover:bg-slate-50 border-slate-200'
                    }`}
                    onClick={() => {
                      setSelectedQuestion(idx);
                      handleAskQuestion(question);
                    }}
                  >
                    <p className="text-slate-700">{question}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div>
      {renderContent()}
    </div>
  );
}