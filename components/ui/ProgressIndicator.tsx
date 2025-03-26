// components/ui/ProgressIndicator.tsx
// An elegant, step-by-step progress indicator that shows detailed processing steps
// with smooth fade-in animations and status updates for various panel types including detailed analysis

'use client';

import React, { useState, useEffect } from 'react';

interface Step {
  id: string;
  label: string;
  status: 'waiting' | 'active' | 'completed' | 'error';
  details?: string;
}

interface ProgressIndicatorProps {
  isLoading: boolean;
  currentStep?: string;
  progressData?: Record<string, any>;
}

export default function ProgressIndicator({ 
  isLoading, 
  currentStep = '', 
  progressData = {}
}: ProgressIndicatorProps) {
  // Define standard analysis steps
  const standardSteps: Step[] = [
    { id: 'selecting-model', label: 'Talking to AI', status: 'waiting' },
    { id: 'analyzing-source', label: 'Analyzing source', status: 'waiting' },
    { id: 'building-prompt', label: 'Assembling pieces', status: 'waiting' },
    { id: 'sending-request', label: 'Sending request', status: 'waiting' },
    { id: 'receiving-response', label: 'Receiving response', status: 'waiting' },
    { id: 'processing-results', label: 'Processing results', status: 'waiting' }
  ];
  
  // Define detailed analysis steps
  const detailedSteps: Step[] = [
    { id: 'preparing-detailed', label: 'Preparing detailed analysis', status: 'waiting' },
    { id: 'contextual-analysis', label: 'Contextual analysis', status: 'waiting' },
    { id: 'author-analysis', label: 'Analyzing author perspective', status: 'waiting' },
    { id: 'themes-extraction', label: 'Extracting key themes', status: 'waiting' },
    { id: 'evidence-analysis', label: 'Examining evidence', status: 'waiting' },
    { id: 'significance-evaluation', label: 'Evaluating significance', status: 'waiting' },
    { id: 'reference-compilation', label: 'Compiling references', status: 'waiting' }
  ];
  
  // Define counter-narrative steps
  const counterSteps: Step[] = [
    { id: 'preparing-counter', label: 'Preparing counter-narrative', status: 'waiting' },
    { id: 'conventional-reading', label: 'Identifying conventional reading', status: 'waiting' },
    { id: 'alternative-perspectives', label: 'Exploring alternatives', status: 'waiting' },
    { id: 'counter-development', label: 'Developing counter-narrative', status: 'waiting' },
    { id: 'evidence-gathering', label: 'Gathering textual evidence', status: 'waiting' },
    { id: 'finalizing-counter', label: 'Finalizing counter-narrative', status: 'waiting' }
  ];
  
  // State
  const [steps, setSteps] = useState<Step[]>(standardSteps);
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processingType, setProcessingType] = useState<'standard' | 'detailed' | 'counter'>('standard');
  
  // Determine which set of steps to use based on the currentStep
  useEffect(() => {
    if (currentStep.includes('detailed') || currentStep.includes('detail')) {
      setProcessingType('detailed');
      setSteps(detailedSteps);
    } else if (currentStep.includes('counter')) {
      setProcessingType('counter');
      setSteps(counterSteps);
    } else {
      setProcessingType('standard');
      setSteps(standardSteps);
    }
  }, [currentStep]);
  
  // Update steps based on current processing step
  useEffect(() => {
    if (!isLoading) {
      // Reset all steps when not loading
      setSteps(prev => prev.map(step => ({ ...step, status: 'waiting' })));
      setProgress(0);
      return;
    }
    
    // Map the current step to one of our defined steps
    let currentStepIndex = -1;
    
    if (processingType === 'detailed') {
      // Handle detailed analysis flow
      if (currentStep.includes('preparing') || currentStep.includes('starting')) {
        currentStepIndex = 0;
      } else if (currentStep.includes('context')) {
        currentStepIndex = 1;
      } else if (currentStep.includes('author')) {
        currentStepIndex = 2;
      } else if (currentStep.includes('theme')) {
        currentStepIndex = 3;
      } else if (currentStep.includes('evidence')) {
        currentStepIndex = 4;
      } else if (currentStep.includes('significance')) {
        currentStepIndex = 5;
      } else if (currentStep.includes('reference')) {
        currentStepIndex = 6;
      } else {
        // If we can't match specifically, use a reasonable estimate based on time
        const timeElapsed = progressData.timeElapsed || 0;
        const totalTime = progressData.estimatedTime || 10000;
        currentStepIndex = Math.min(Math.floor((timeElapsed / totalTime) * steps.length), steps.length - 1);
      }
    } else if (processingType === 'counter') {
      // Handle counter narrative flow
      if (currentStep.includes('preparing') || currentStep.includes('starting')) {
        currentStepIndex = 0;
      } else if (currentStep.includes('conventional')) {
        currentStepIndex = 1;
      } else if (currentStep.includes('alternative')) {
        currentStepIndex = 2;
      } else if (currentStep.includes('develop')) {
        currentStepIndex = 3;
      } else if (currentStep.includes('evidence')) {
        currentStepIndex = 4;
      } else if (currentStep.includes('finaliz')) {
        currentStepIndex = 5;
      } else {
        // If we can't match specifically, use a reasonable estimate
        const timeElapsed = progressData.timeElapsed || 0;
        const totalTime = progressData.estimatedTime || 10000;
        currentStepIndex = Math.min(Math.floor((timeElapsed / totalTime) * steps.length), steps.length - 1);
      }
    } else {
      // Standard analysis flow
      if (currentStep.includes('model')) {
        currentStepIndex = 0;
      } else if (currentStep.includes('analyz') || currentStep.includes('initial')) {
        currentStepIndex = 1;
      } else if (currentStep.includes('prompt')) {
        currentStepIndex = 2;
      } else if (currentStep.includes('send') || currentStep.includes('OpenAI') || currentStep.includes('Claude')) {
        currentStepIndex = 3;
      } else if (currentStep.includes('receiv') || currentStep.includes('response')) {
        currentStepIndex = 4;
      } else if (currentStep.includes('process') || currentStep.includes('parse')) {
        currentStepIndex = 5;
      } else {
        // If we can't match, default to a reasonable step based on time
        const timeElapsed = progressData.timeElapsed || 0;
        const totalTime = progressData.estimatedTime || 10000;
        currentStepIndex = Math.min(Math.floor((timeElapsed / totalTime) * steps.length), steps.length - 1);
      }
    }
    
    // Default to progress based on time if we couldn't identify a specific step
    if (currentStepIndex < 0) {
      const timeProgress = progressData.timeElapsed ? 
        Math.min((progressData.timeElapsed / (progressData.estimatedTime || 10000)) * 100, 95) : 
        50;
      setProgress(timeProgress);
      
      // Based on progress, set a reasonable step index
      currentStepIndex = Math.min(Math.floor((timeProgress / 100) * steps.length), steps.length - 1);
    } else {
      // Calculate progress percentage based on step
      const newProgress = Math.round(((currentStepIndex + 1) / steps.length) * 100);
      setProgress(newProgress);
    }
    
    // Update steps status
    setSteps(prev => 
      prev.map((step, index) => ({
        ...step,
        status: 
          index < currentStepIndex ? 'completed' :
          index === currentStepIndex ? 'active' :
          'waiting'
      }))
    );
  }, [isLoading, currentStep, processingType, steps.length, progressData]);
  
  // If not loading, don't show anything
  if (!isLoading) {
    return null;
  }
  
  // Get user-friendly title based on processing type
  const getProgressTitle = () => {
    switch (processingType) {
      case 'detailed':
        return 'Creating Detailed Analysis';
      case 'counter':
        return 'Generating Counter-Narrative';
      default:
        return 'Processing Source';
    }
  };
  
  return (
    <div className="relative mb-4 bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
      {/* Progress bar - animates smoothly */}
      <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-500 transition-all duration-700 ease-out" 
           style={{ width: `${progress}%` }}></div>
      
      <div className="p-4 relative">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-md font-medium text-slate-800 flex items-center">
            <svg className="w-4 h-4 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            {getProgressTitle()}
          </h3>
          
          {/* Info button */}
          <button 
            onClick={() => setShowInfoPanel(!showInfoPanel)}
            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-50 rounded-full transition-colors"
            title="View technical details"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
        
        {/* Steps list - animate in from left */}
        <div className="flex flex-col space-y-1">
          {steps.map((step, index) => (
            <div 
              key={step.id}
              className={`flex items-center overflow-hidden transition-all duration-500 ease-out ${
                step.status === 'waiting' ? 'opacity-40' : 'opacity-100'
              } ${step.status === 'active' ? 'animate-in fade-in slide-in-from-left-3 duration-300' : ''}`}
              style={{ 
                maxHeight: step.status === 'waiting' && steps.indexOf(steps.find(s => s.status === 'active') || steps[0]) < index 
                  ? '0' 
                  : '2rem' 
              }}
            >
              {/* Step status indicator */}
              <div className={`flex-shrink-0 h-5 w-5 mr-2 rounded-full flex items-center justify-center
                ${step.status === 'waiting' ? 'bg-slate-200' : 
                  step.status === 'active' ? 'bg-indigo-100 border border-indigo-300' : 
                  step.status === 'completed' ? 'bg-indigo-500' : 'bg-red-500'}`}
              >
                {step.status === 'active' ? (
                  <div className="h-2 w-2 bg-indigo-600 rounded-full animate-pulse"></div>
                ) : step.status === 'completed' ? (
                  <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : null}
              </div>
              
              {/* Step label */}
              <span className={`text-sm ${
                step.status === 'active' ? 'font-medium text-indigo-700' : 
                step.status === 'completed' ? 'text-slate-600' : 'text-slate-500'
              }`}>
                {step.label}
              </span>
              
              {/* Spinning animation for active step */}
              {step.status === 'active' && (
                <div className="ml-auto">
                  <svg className="animate-spin h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Info panel - technical details */}
      {showInfoPanel && (
        <div className="border-t border-slate-200 bg-slate-900 text-white animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-3 font-mono text-xs overflow-auto max-h-48">
            <div className="grid grid-cols-2 gap-1">
              <div className="text-slate-400">MODEL:</div>
              <div className="text-green-400">{progressData.model || 'Not specified'}</div>
              
              <div className="text-slate-400">SOURCE LENGTH:</div>
              <div className="text-amber-400">{progressData.sourceLength || '0'} chars</div>
              
              {progressData.truncatedLength && (
                <>
                  <div className="text-slate-400">TRUNCATED TO:</div>
                  <div className="text-amber-400">{progressData.truncatedLength} chars</div>
                </>
              )}
              
              <div className="text-slate-400">PROVIDER:</div>
              <div className="text-blue-400">{progressData.provider || 'Not specified'}</div>
              
              <div className="text-slate-400">PROCESSING:</div>
              <div className="text-purple-400">{processingType}</div>
              
              <div className="text-slate-400">ELAPSED:</div>
              <div className="text-green-400">{progressData.timeElapsed || '0'}ms</div>
              
              {progressData.requestType && (
                <>
                  <div className="text-slate-400">REQUEST TYPE:</div>
                  <div className="text-purple-400">{progressData.requestType}</div>
                </>
              )}
            </div>
            
            {/* Show current status */}
            <div className="mt-3 pt-3 border-t border-slate-700 text-slate-300">
              <div className="flex items-center">
                <span className="animate-pulse mr-2 h-2 w-2 bg-green-400 rounded-full"></span>
                <span>STATUS: {currentStep || 'Processing...'}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}