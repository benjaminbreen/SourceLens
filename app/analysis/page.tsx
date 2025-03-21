// app/analysis/page.tsx
// Optimized to prevent duplicate analysis requests and unnecessary re-fetching

'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/analysis/MainLayout';
import RoleplayChat from '@/components/roleplay/RoleplayChat';
import { useAppStore } from '@/lib/store';

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
    setDetailedAnalysisLoaded
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
    
    // Check if model or perspective changed
    const isModelChange = prevModelRef.current !== llmModel;
    const isPerspectiveChange = prevPerspectiveRef.current !== perspective;
    
    // Update refs
    prevModelRef.current = llmModel;
    prevPerspectiveRef.current = perspective;
    
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
  }, [llmModel, perspective, sourceContent, metadata, initialAnalysis, activePanel, setDetailedAnalysis, setDetailedAnalysisLoaded]);
  
  
  // Handle the actual analysis fetching
  useEffect(() => {
    // If we shouldn't fetch or analysis is in progress, or we don't have required data, exit
    if (!shouldFetchAnalysis || analysisInProgressRef.current || !sourceContent || !metadata) {
      return;
    }
    
    const fetchAnalysis = async () => {
      // Set flags to prevent duplicate requests
      setShouldFetchAnalysis(false);
      analysisInProgressRef.current = true;
      setLoading(true);
      
      try {
        console.log('Fetching analysis...', { model: llmModel, perspective });
        
        // Try the initial-analysis endpoint
        try {
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
          
          if (!response.ok) {
            console.error('Error initial-analysis response:', response.status);
            throw new Error(`initial-analysis API returned status ${response.status}`);
          }
          
          const data = await response.json();
          console.log('Initial analysis received:', data);
          
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
        
        const fallbackData = await fallbackResponse.json();
        console.log('Fallback analysis received:', fallbackData);
        
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
        // Don't navigate away on error, just show error state
      } finally {
        analysisInProgressRef.current = false;
        setLoading(false);
      }
    };
    
    fetchAnalysis();
  }, [shouldFetchAnalysis, sourceContent, metadata, llmModel, perspective, setInitialAnalysis, setRawPrompt, setRawResponse]);
  
  // Track when detailed analysis is loaded from specific panel requests (not on model change)
  useEffect(() => {
    if (detailedAnalysis && !detailedAnalysisLoaded) {
      setDetailedAnalysisLoaded(true);
      console.log('Detailed analysis is now loaded and cached');
    }
  }, [detailedAnalysis, detailedAnalysisLoaded, setDetailedAnalysisLoaded]);
  
  // Redirect to home if no source content
  useEffect(() => {
    if (!sourceContent && !isLoading) {
      router.push('/');
    }
  }, [sourceContent, isLoading, router]);

  return <MainLayout />;
}