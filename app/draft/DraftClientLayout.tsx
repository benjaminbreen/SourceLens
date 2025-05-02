// app/draft/DraftClientLayout.tsx
// Client-side layout component for the draft editor page
// Handles draft loading, selection, and interaction with the source and results panels
// Fixes TypeScript errors and improves type safety throughout

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { useLibrary, SavedDraft } from '@/lib/libraryContext';
import { useLibraryStorage } from '@/lib/libraryStorageProvider';
import DraftSelectDropdown from '@/components/draft/DraftSelectDropdown';
import DraftDisplay from '@/components/draft/DraftDisplay';
import SourceSelectPanel from '@/components/draft/SourceSelectPanel';
import ResultsPanel from '@/components/draft/ResultsPanel';
import { getModelById } from '@/lib/models';
import { useDebouncedCallback } from 'use-debounce';

// Define section interface to avoid errors with 'content' property
interface DraftSection {
  id: string;
  title: string;
  summary: string;
  fullText: string;
  content?: string; // Make content optional since it might not exist
}

export default function DraftClientLayout() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  
  const isDarkMode = useAppStore(state => state.isDarkMode);
  const activeDraftId = useAppStore(state => state.activeDraftId);
  const setActiveDraftId = useAppStore(state => state.setActiveDraftId);
  
  // Remove getDraft from the destructured object as it doesn't exist
  const { addDraft, updateDraft } = useLibrary();
  const { getItems, getFullItem } = useLibraryStorage();
  
  const [activeDraft, setActiveDraft] = useState<SavedDraft | null>(null);
  const [leftPanelOpen, setLeftPanelOpen] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);
  const [analyticFramework, setAnalyticFramework] = useState<string>('');
  const [highlightInfo, setHighlightInfo] = useState<{
    text: string;
    startIndex: number;
    endIndex: number;
    sectionId?: string;
  } | null>(null);
  const [llmResults, setLlmResults] = useState<{
    type: 'relate' | 'critique' | 'segue';
    suggestions: string[];
  } | null>(null);
  const [isResultsLoading, setIsResultsLoading] = useState(false);
  const [assistAction, setAssistAction] = useState<'relate' | 'critique' | 'segue' | null>(null);
  const [tocVisible, setTocVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  
  // Handle URL parameter changes - Fix searchParams null check
  useEffect(() => {
    if (!searchParams) return;
    
    const draftId = searchParams.get('id');
    if (draftId && draftId !== activeDraftId) {
      setActiveDraftId(draftId);
    }
  }, [searchParams, setActiveDraftId, activeDraftId]);
  
  // Main draft load logic
  useEffect(() => {
    const loadDraft = async () => {
      if (!activeDraftId) {
        setActiveDraft(null);
        setIsLoading(false); // Ensure loading stops if no ID
        return;
      }

      // Reset state before loading new draft
      setActiveDraft(null);
      setIsLoading(true);
      setHighlightInfo(null);
      setLlmResults(null);
      setAssistAction(null);

      try {
        console.log(`DraftClientLayout: Fetching full draft with ID: ${activeDraftId}`);
        const draft = await getFullItem<SavedDraft>('drafts', activeDraftId);
        console.log("Draft fetched:", draft ? `Title: ${draft.title}` : "Not found");

        if (draft) {
          // --- SAFER Section Processing ---
          let processedSections = draft.sections || []; // Default to empty array if sections is null/undefined

          if (Array.isArray(processedSections)) { // Ensure it's an array
            processedSections = processedSections.map(section => {
              // If fullText is missing, create a placeholder.
              if (!section.fullText) {
                console.warn(`Section "${section.title}" (ID: ${section.id}) is missing fullText. Using placeholder.`);
                return {
                  ...section,
                  // Safer fallback: Use title or generic placeholder.
                  fullText: `Content for section: ${section.title || section.id}` // Placeholder
                };
              }
              return section; // Return unmodified if fullText exists
            });
          } else {
            console.warn("Draft sections data is not an array:", processedSections);
            processedSections = []; // Reset to empty array if data is invalid
          }

          // Create the final draft object for state
          const finalDraftData = {
            ...draft,
            sections: processedSections // Use the processed sections array
          };

          // Validate that the main content exists
          if (typeof finalDraftData.content !== 'string') {
              console.error("Fetched draft is missing 'content' string:", finalDraftData);
              throw new Error("Draft content is missing or invalid.");
          }

          setActiveDraft(finalDraftData);
          console.log("Active draft set:", finalDraftData.title);

          // Update URL - Fix searchParams null check
          if (searchParams) {
            const currentUrlDraftId = searchParams.get('id');
            if (currentUrlDraftId !== activeDraftId) {
              const newParams = new URLSearchParams(searchParams.toString());
              newParams.set('id', activeDraftId);
              // Use push instead of replace if you want browser history
              router.push(`${pathname}?${newParams.toString()}`, { scroll: false });
              console.log("URL updated with draft ID:", activeDraftId);
            }
          }
        } else {
          console.warn(`Draft with ID ${activeDraftId} not found.`);
          setActiveDraft(null); // Clear active draft if not found
          // Optionally redirect or show a "not found" message
        }
      } catch (error) {
        console.error('Error loading draft:', error);
        setActiveDraft(null); // Clear on error
      } finally {
        setIsLoading(false);
        console.log("Draft loading process finished.");
      }
    };

    loadDraft();
  }, [activeDraftId, getFullItem, pathname, router, searchParams, setActiveDraftId]);
  
  // Handle draft selection from dropdown
  const handleSelectDraft = async (draftId: string) => {
    setActiveDraftId(draftId);
  };
  
  // Trigger draft assist API
  const triggerDraftAssist = async (
    action: 'relate' | 'critique' | 'segue',
    highlightedText: string,
    highlightStart: number,
    highlightEnd: number,
    sectionId?: string,
    feedback?: string
  ) => {
    if (!activeDraft) return;
    
    try {
      setIsResultsLoading(true);
      setAssistAction(action);
      setRightPanelOpen(true);
      
      const model = getModelById('gemini-flash-lite');
      
      const payload = {
        action,
        highlightedText,
        highlightStart,
        highlightEnd,
        draftId: activeDraft.id,
        draftTitle: activeDraft.title,
        draftSections: activeDraft.sections || [],
        sourceId: action === 'relate' ? selectedSourceId : undefined,
        analyticFramework: analyticFramework || undefined,
        sectionId,
        feedback,
        modelId: model.apiModel
      };
      
      const response = await fetch('/api/draft-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      setLlmResults({
        type: action,
        suggestions: data.suggestions || []
      });
    } catch (error) {
      console.error('Draft assist error:', error);
    } finally {
      setIsResultsLoading(false);
    }
  };
  
  // Handle drop of source onto draft - Fix section.content type error
  const handleSourceDrop = async (sourceId: string, dropSectionId: string) => {
    if (!activeDraft || !sourceId) return;
    
    setSelectedSourceId(sourceId);
    setLeftPanelOpen(true);
    
    // Find the section
    const section = activeDraft.sections?.find(s => s.id === dropSectionId);
    if (!section) return;
    
    // Use section text as the highlighted text - Fixed by using optional chaining on content
    const text = section.fullText || (section as any).content || '';
    
    // Estimate the index (could be improved)
    const startIndex = activeDraft.content.indexOf(text) || 0;
    const endIndex = startIndex + text.length;
    
    // Set highlight info
    setHighlightInfo({
      text,
      startIndex,
      endIndex,
      sectionId: dropSectionId
    });
    
    // Trigger the assist API
    await triggerDraftAssist('relate', text, startIndex, endIndex, dropSectionId);
  };
  
  // Handle regenerate/feedback request
  const handleRegenerateRequest = async (feedback?: string) => {
    if (!highlightInfo || !assistAction) return;
    
    await triggerDraftAssist(
      assistAction,
      highlightInfo.text,
      highlightInfo.startIndex,
      highlightInfo.endIndex,
      highlightInfo.sectionId,
      feedback
    );
  };
  
  // Auto-save draft changes (if editing is implemented)
  const debouncedSaveDraft = useDebouncedCallback(async (draft: SavedDraft) => {
    try {
      await updateDraft(draft.id, {
        content: draft.content,
        lastEdited: Date.now()
      });
    } catch (error) {
      console.error('Error saving draft:', error);
    }
  }, 1000);
  
  return (
    <div className={`flex h-screen w-full overflow-hidden ${isDarkMode ? 'dark' : ''}`}>
      {/* Left panel - Source Selection */}
      <SourceSelectPanel 
        isOpen={leftPanelOpen}
        setIsOpen={setLeftPanelOpen}
        selectedSourceId={selectedSourceId}
        setSelectedSourceId={setSelectedSourceId}
        analyticFramework={analyticFramework}
        setAnalyticFramework={setAnalyticFramework}
        darkMode={isDarkMode}
      />
      
      {/* Main draft area */}
      <div className="flex flex-col flex-grow h-full overflow-hidden">
        {/* Top bar with draft selection */}
        <div className={`p-4 border-b ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex-grow max-w-md">
              <DraftSelectDropdown
                onSelectDraft={handleSelectDraft}
                selectedDraftId={activeDraftId}
                darkMode={isDarkMode}
              />
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setLeftPanelOpen(!leftPanelOpen)}
                className={`p-2 rounded ${isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}
                title="Toggle sources panel"
              >
                <svg className={`w-5 h-5 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </button>
              <button
                onClick={() => setTocVisible(!tocVisible)}
                className={`p-2 rounded ${isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}
                title="Toggle table of contents"
              >
                <svg className={`w-5 h-5 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
              <button
                onClick={() => setRightPanelOpen(!rightPanelOpen)}
                className={`p-2 rounded ${isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}
                title="Toggle results panel"
              >
                <svg className={`w-5 h-5 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        {/* Draft content */}
        {isLoading ? (
          <div className={`flex-grow flex items-center justify-center ${isDarkMode ? 'bg-slate-900 text-slate-300' : 'bg-slate-50 text-slate-600'}`}>
            <div className="text-center p-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500 mb-4"></div>
              <p>Loading draft...</p>
            </div>
          </div>
        ) : activeDraft ? (
          <DraftDisplay
            draft={activeDraft}
            onHighlight={setHighlightInfo}
            onDraftAssist={triggerDraftAssist}
            onSourceDrop={handleSourceDrop}
            selectedSourceId={selectedSourceId}
            darkMode={isDarkMode}
          />
        ) : (
          <div className={`flex-grow flex items-center justify-center ${isDarkMode ? 'bg-slate-900 text-slate-300' : 'bg-slate-50 text-slate-600'}`}>
            <div className="text-center p-8">
              <svg className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-slate-700' : 'text-slate-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h2 className="text-xl font-semibold mb-2">No Draft Selected</h2>
              <p className="max-w-md">Select a draft from the dropdown above to get started, or create a new draft from the library page.</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Right panel - TOC and Results */}
      <ResultsPanel 
        isOpen={rightPanelOpen}
        setIsOpen={setRightPanelOpen}
        draft={activeDraft}
        llmResults={llmResults}
        isLoading={isResultsLoading}
        onRegenerateRequest={handleRegenerateRequest}
        tocVisible={tocVisible}
        setTocVisible={setTocVisible}
        darkMode={isDarkMode}
      />
    </div>
  );
}