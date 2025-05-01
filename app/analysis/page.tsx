// app/analysis/page.tsx
// Enhanced with proper URL parameter handling for note and source sharing
// Prevents unwanted redirects and infinite update loops
// With full TypeScript type safety

'use client';

import React, { useEffect, useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import MainLayout from '@/components/analysis/MainLayout';
import { useAppStore, type Note, type SavedSource } from '@/lib/store';
import { useLibraryStorage } from '@/lib/libraryStorageProvider';

// Define window augmentation for our timing variables
declare global {
  interface Window {
    _sourceAnalysisStartTime?: number;
    _detailedAnalysisStartTime?: number;
    _counterNarrativeStartTime?: number;
  }
}

//  Suspense Wrapper
export default function AnalysisPageWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AnalysisPage />
    </Suspense>
  );
}

// rest of page
function AnalysisPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { getItems } = useLibraryStorage();
  
  // Store URL parameters in refs to avoid re-renders
  const noteParam = searchParams?.get('note') || null;
  const sourceParam = searchParams?.get('source') || null;

  const hasUrlParams = !!noteParam || !!sourceParam;
  
  // Create stable refs that won't cause re-renders
  const noteParamRef = useRef(noteParam);
  const sourceParamRef = useRef(sourceParam);
  const hasProcessedUrlRef = useRef(false);
  
  const { 
    sourceContent, 
    setSourceContent,
    metadata, 
    setMetadata,
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
    setActivePanel,
    roleplayMode,
    setRoleplayMode,
    detailedAnalysisLoaded,
    setDetailedAnalysisLoaded,
    setProcessingStep,
    setProcessingData,
    setActiveNote,
    setNotePanelVisible,
    setSourceType,
    setSourceThumbnailUrl
  } = useAppStore();
  
  // Track state to control when to fetch analysis
  const [shouldFetchAnalysis, setShouldFetchAnalysis] = useState(false);
  const prevModelRef = useRef(llmModel);
  const prevPerspectiveRef = useRef(perspective);
  const isFirstRenderRef = useRef(true);
  const analysisInProgressRef = useRef(false);

  useEffect(() => {
    console.log('URL params status check:', { 
      hasUrlParams, 
      processed: hasProcessedUrlRef.current,
      sourceContent: !!sourceContent,
      noteParam,
      sourceParam
    });
  }, [hasUrlParams, sourceContent, noteParam, sourceParam]);
  
  // Process URL parameters and load content accordingly
  useEffect(() => {
    if (hasProcessedUrlRef.current) {
      console.log('Already processed URL params, skipping');
      return;
    }
    
    const processUrlParams = async () => {
      // Prevent processing if already completed
      if (hasProcessedUrlRef.current) return;
      
      // If no params, mark as processed and exit
      if (!noteParamRef.current && !sourceParamRef.current) {
        hasProcessedUrlRef.current = true;
        console.log('No URL parameters to process');
        return;
      }
      
      console.log('Processing URL parameters:', { 
        note: noteParamRef.current, 
        source: sourceParamRef.current 
      });
      
      setLoading(true);
      
      try {
        let foundItem = false;
        
        // Handle note parameter
        if (noteParamRef.current) {
          const notes = await getItems<Note>('notes');
          console.log(`Found ${notes.length} notes, looking for ID: ${noteParamRef.current}`);
          
          // Try to find note by ID first with type safety
         const matchingNote = notes.find((n) => n.id && n.id === noteParamRef.current);
          
          // If not found by ID, try to find by slug in the ID
        const fallbackNote = matchingNote || notes.find((n) => 
          typeof n.id === 'string' &&
          typeof noteParamRef.current === 'string' &&
          n.id.includes(noteParamRef.current)
        );
          
          if (fallbackNote) {
            console.log('Found note by ID:', fallbackNote.id);
            foundItem = true;
            
            // Prevent redirect with dummy analysis
            setInitialAnalysis({
              summary: fallbackNote.sourceMetadata?.title || 'Note Content',
              analysis: 'Content from note: ' + fallbackNote.id,
              followupQuestions: ['What context is this note from?', 'How does this relate to the source?']
            });
            
            // Set source content and metadata from note
         if (fallbackNote.content) {
           setSourceContent(fallbackNote.content);
         }
            
            if (fallbackNote.sourceMetadata) {
              setMetadata(fallbackNote.sourceMetadata);
            }
            
            // Set active note
          if (fallbackNote && fallbackNote.id) {
  setActiveNote(fallbackNote as Note);
}
            setNotePanelVisible(true);
            setSourceType('text');
            setActivePanel('analysis');
          } else {
            console.warn('Could not find note with ID:', noteParamRef.current);
          }
        }
        
        // Handle source parameter if no note was found
        if (!foundItem && sourceParamRef.current) {
          const sources = await getItems<SavedSource>('sources');
          console.log(`Found ${sources.length} sources, looking for ID: ${sourceParamRef.current}`);
          
          // Try to find source by ID first
          const matchingSource = sources.find((s) => s.id === sourceParamRef.current);
          
          // If not found by ID, try to find by slug in the ID
         const fallbackSource = matchingSource || sources.find((s) =>
  sourceParamRef.current &&
  s.id &&
  s.id.includes(sourceParamRef.current)
);
          
          if (fallbackSource) {
            console.log('Found source by ID:', fallbackSource.id);
            foundItem = true;
            
            // Prevent redirect with dummy analysis
            setInitialAnalysis({
              summary: fallbackSource.metadata?.title || 'Source Content',
              analysis: 'Content from source: ' + fallbackSource.id,
              followupQuestions: ['What is this document about?', 'Who is the author?']
            });
            
            // Set source content and metadata
            if (fallbackSource.content) {
              setSourceContent(fallbackSource.content);
            }
            
            if (fallbackSource.metadata) {
              setMetadata(fallbackSource.metadata);
            }
            
           setSourceType(fallbackSource.type ?? 'text');
            if (fallbackSource.thumbnailUrl) {
              setSourceThumbnailUrl(fallbackSource.thumbnailUrl);
            }
            setActivePanel('analysis');
          } else {
            console.warn('Could not find source with ID:', sourceParamRef.current);
          }
        }
        
        // If we found either a note or source, create a blocking flag in localStorage
        // This helps prevent redirect during page refreshes
        if (foundItem) {
          localStorage.setItem('sourceLens_hasContent', 'true');
          console.log('Found item and set localStorage flag to prevent redirect');
        }
        
      } catch (error) {
        console.error('Error processing URL parameters:', error);
      } finally {
        // Always mark as processed, even if there was an error
        hasProcessedUrlRef.current = true;
        setLoading(false);
      }
    };
    
    processUrlParams();
    
    // Cleanup when component unmounts
    return () => {
      localStorage.removeItem('sourceLens_hasContent');
    };
  }, []); // Empty dependency array to run once
  
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
      
      // If we have URL parameters, skip automatic analysis
      if (hasUrlParams) {
        return;
      }
      
      // Only fetch initial analysis if we have content but no analysis yet
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
  }, [llmModel, perspective, sourceContent, metadata, initialAnalysis, activePanel, setDetailedAnalysis, setDetailedAnalysisLoaded, setInitialAnalysis, hasUrlParams]);
  
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
  
  // Only redirect if we have no source content, we're not loading,
  // we don't have URL parameters, and we've already processed any URL parameters that were present
  useEffect(() => {
    // Prevent redirect if:
    // 1. We have source content, or
    // 2. We're still loading, or
    // 3. We have URL parameters to process
    if (sourceContent || isLoading || (hasUrlParams && !hasProcessedUrlRef.current)) {
      return;
    }
    
    // If we don't have source content, we're not loading, and either
    // there are no URL parameters or they've been processed without success,
    // then redirect
    const redirectTimer = setTimeout(() => {
      console.log('Redirecting to home page - no content to display');
      router.push('/');
    }, 3000); // Short delay to prevent immediate redirect
    
    return () => clearTimeout(redirectTimer);
  }, [sourceContent, isLoading, router, hasUrlParams]);

  return <MainLayout />;
}