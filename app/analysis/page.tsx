// app/analysis/page.tsx
// Optimized to prevent duplicate analysis requests and unnecessary re-fetching
// Now with detailed processing step tracking and status updates for multiple analysis types

'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/analysis/MainLayout';
import { useAppStore } from '@/lib/store';

// Define window augmentation for our timing variables
declare global {
  interface Window {
    _sourceAnalysisStartTime?: number;
    _detailedAnalysisStartTime?: number;
    _counterNarrativeStartTime?: number;
  }
}

export default function AnalysisPage() {
  const router = useRouter();
  const { 
    sourceContent, 
    metadata, 
    initialAnalysis, 
    setInitialAnalysis,
    detailedAnalysis,
    setDetailedAnalysis,
    isLoading,
    setLoading,
    llmModel,
    perspective,
    setRawPrompt,
    setRawResponse,
    activePanel,
    roleplayMode,
    setRoleplayMode,
    detailedAnalysisLoaded,
    setDetailedAnalysisLoaded,
    setProcessingStep,
    setProcessingData
  } = useAppStore();
  
  // Track state to control when to fetch analysis
  const [shouldFetchAnalysis, setShouldFetchAnalysis] = useState(false);
  const prevModelRef = useRef(llmModel);
  const prevPerspectiveRef = useRef(perspective);
  const isFirstRenderRef = useRef(true);
  const analysisInProgressRef = useRef(false);
  
  // Set roleplay mode when panel changes to roleplay
  useEffect(() => {
    if (activePanel === 'roleplay' && !roleplayMode) {
      setRoleplayMode(true);
    } else if (activePanel !== 'roleplay' && roleplayMode) {
      setRoleplayMode(false);
    }
  }, [activePanel, roleplayMode, setRoleplayMode]);
  
  // Initial setup and detect changes that should trigger reanalysis
  useEffect(() => {
    // Skip the first render as this runs on component mount
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      
      // IMPORTANT: Only fetch initial analysis if we're not directly accessing references or roleplay
      if (!initialAnalysis && sourceContent && metadata && !analysisInProgressRef.current && 
          activePanel !== 'references' && activePanel !== 'roleplay') {
        console.log('First render, starting initial analysis');
        setShouldFetchAnalysis(true);
      }
      return;
    }
    
    // Store current values for comparison
    const currentModel = llmModel;
    const currentPerspective = perspective;
    
    // Log model change for debugging
    if (prevModelRef.current !== currentModel) {
      console.log(`Model changed from "${prevModelRef.current}" to "${currentModel}"`);
    }
    
    // Check if model or perspective changed
    const isModelChange = prevModelRef.current !== currentModel;
    const isPerspectiveChange = prevPerspectiveRef.current !== perspective;
    
    // Update refs
    prevModelRef.current = currentModel;
    prevPerspectiveRef.current = currentPerspective;
    
    // If model or perspective changed and we have source content, trigger reanalysis
    // But only if we're not in references or roleplay mode
    if ((isModelChange || isPerspectiveChange) && sourceContent && metadata) {
      console.log(`Setting up reanalysis due to ${isModelChange ? 'model' : 'perspective'} change`);
      // Clear current analysis
      setInitialAnalysis(null);
      // Also clear detailed analysis and reset the loaded flag
      setDetailedAnalysis(null);
      setDetailedAnalysisLoaded(false);
      // Flag that we should fetch new analysis
      setShouldFetchAnalysis(true);
    }
  }, [llmModel, perspective, sourceContent, metadata, initialAnalysis, activePanel, setDetailedAnalysis, setDetailedAnalysisLoaded, setInitialAnalysis]);
  
  // Function to simulate and track detailed analysis steps
  const simulateDetailedAnalysisProgress = () => {
    // Initialize start time if not already set
    window._detailedAnalysisStartTime = Date.now();
    
    // Define detailed analysis steps
    const detailedSteps = [
      'preparing-detailed',
      'contextual-analysis',
      'author-analysis',
      'themes-extraction',
      'evidence-analysis',
      'significance-evaluation',
      'reference-compilation'
    ];
    
    // Estimated time for each step (adjust as needed)
    const stepDurations = [1000, 1500, 1500, 1500, 1500, 1000, 1000]; // in ms
    let currentStepIndex = 0;
    
    // Create interval to update steps
    const intervalId = setInterval(() => {
      if (currentStepIndex < detailedSteps.length) {
        // Update current processing step
        setProcessingStep(detailedSteps[currentStepIndex]);
        
        // Update processing data
        setProcessingData({
          model: llmModel,
          sourceLength: sourceContent?.length || 0,
          provider: llmModel?.includes('gpt') ? 'openai' : 'anthropic',
         timeElapsed: Date.now() - (window._detailedAnalysisStartTime || Date.now()),
          estimatedTime: stepDurations.reduce((a, b) => a + b, 0),
          step: currentStepIndex + 1,
          totalSteps: detailedSteps.length,
          requestType: 'detailed-analysis'
        });
        
        // Move to next step
        currentStepIndex++;
      } else {
        // All steps completed, clear interval
        clearInterval(intervalId);
      }
    }, 1500); // Update every 1.5 seconds
    
    // Return the interval ID so it can be cleared if analysis completes early
    return intervalId;
  };
  
  // Handle the actual analysis fetching
  useEffect(() => {
    // If we shouldn't fetch or analysis is in progress, or we don't have required data, exit
    if (!shouldFetchAnalysis || analysisInProgressRef.current || !sourceContent || !metadata) {
      return;
    }

    // Store start time for performance tracking
    window._sourceAnalysisStartTime = Date.now();
    
    const fetchAnalysis = async () => {
      // Set flags to prevent duplicate requests
      setShouldFetchAnalysis(false);
      analysisInProgressRef.current = true;
      setLoading(true);
      
      // Initialize processing tracking with empty values first
      setProcessingStep('selecting-model');
      setProcessingData({
        startTime: Date.now(),
        model: llmModel,
        sourceLength: sourceContent.length
      });
      
      try {
        console.log('Fetching analysis...', { model: llmModel, perspective });
        
        // Update processing step
        setProcessingStep('analyzing-source');
        
        // Try the initial-analysis endpoint
        try {
          // Update processing step
          setProcessingStep('building-prompt');
          
          const response = await fetch('/api/initial-analysis', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              source: sourceContent,
              metadata,
              perspective,
              model: llmModel
            }),
          });
          
          // Update processing step
          setProcessingStep('sending-request');
          
          if (!response.ok) {
            console.error('Error initial-analysis response:', response.status);
            throw new Error(`initial-analysis API returned status ${response.status}`);
          }
          
          // Update processing step
          setProcessingStep('receiving-response');
          
          const data = await response.json();
          console.log('Initial analysis received:', data);
          
          // Update processing data
          setProcessingData({
            truncatedLength: data.contentLength || sourceContent.length,
            provider: llmModel.includes('gpt') ? 'openai' : 'anthropic',
            time: Date.now() - (window._sourceAnalysisStartTime || Date.now())
          });
          
          // Update processing step
          setProcessingStep('processing-results');
          
          // Set the initial analysis
          setInitialAnalysis(data.analysis);
          setRawPrompt(data.rawPrompt);
          setRawResponse(data.rawResponse);
          
          return; // Exit if successful
        } catch (initialError) {
          console.error('Error with initial-analysis endpoint, trying fallback:', initialError);
          // Continue to fallback
        }
        
        // Fallback to the regular analysis endpoint
        setProcessingStep('trying-fallback-endpoint');
        
        const fallbackResponse = await fetch('/api/analysis', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            source: sourceContent,
            metadata,
            perspective,
            model: llmModel,
          }),
        });
        
        if (!fallbackResponse.ok) {
          console.error('Error fallback response:', fallbackResponse.status);
          throw new Error(`Fallback API returned status ${fallbackResponse.status}`);
        }
        
        // Update processing step
        setProcessingStep('processing-fallback-response');
        
        const fallbackData = await fallbackResponse.json();
        console.log('Fallback analysis received:', fallbackData);
        
        // Update processing data
        setProcessingData({
          provider: llmModel.includes('gpt') ? 'openai' : 'anthropic',
          time: Date.now() - (window._sourceAnalysisStartTime || Date.now()),
          usingFallback: true
        });
        
        // Extract analysis from fallback
        const analysisData = fallbackData.analysis || {};
        
        // Set the initial analysis
        setInitialAnalysis({
          summary: analysisData.summary || 'Analysis complete.',
          analysis: analysisData.analysis || 'See the detailed results.',
          followupQuestions: analysisData.followupQuestions || [
            'What is the historical context of this document?',
            'What are the key themes in this text?',
            'How does this text relate to the author\'s other works?'
          ]
        });
        
        setRawPrompt(fallbackData.rawPrompt);
        setRawResponse(fallbackData.rawResponse);
        
      } catch (error) {
        console.error('All analysis attempts failed:', error);
        // Update processing step
        setProcessingStep('analysis-failed');
        // Don't navigate away on error, just show error state
      } finally {
        analysisInProgressRef.current = false;
        setLoading(false);
      }
    };
    
    fetchAnalysis();
  }, [shouldFetchAnalysis, sourceContent, metadata, llmModel, perspective, setInitialAnalysis, setRawPrompt, setRawResponse, setProcessingStep, setProcessingData]);
  
  // Track when detailed analysis is loaded from specific panel requests (not on model change)
  useEffect(() => {
    if (detailedAnalysis && !detailedAnalysisLoaded) {
      setDetailedAnalysisLoaded(true);
      console.log('Detailed analysis is now loaded and cached');
    }
  }, [detailedAnalysis, detailedAnalysisLoaded, setDetailedAnalysisLoaded]);
  
  // Track the detailed analysis progress when panel changes to detailed-analysis
  useEffect(() => {
    let progressIntervalId: NodeJS.Timeout | null = null;
    
    if (activePanel === 'detailed-analysis' && isLoading && !detailedAnalysis) {
      // Initialize timing data
      window._detailedAnalysisStartTime = Date.now();
      
      // Start the progress simulation
      progressIntervalId = simulateDetailedAnalysisProgress();
    }
    
    // Clean up on unmount or when analysis completes
    return () => {
      if (progressIntervalId) {
        clearInterval(progressIntervalId);
      }
    };
  }, [activePanel, isLoading, detailedAnalysis]);
  
  // Redirect to home if no source content
  useEffect(() => {
    if (!sourceContent && !isLoading) {
      router.push('/');
    }
  }, [sourceContent, isLoading, router]);

  return <MainLayout />;
}