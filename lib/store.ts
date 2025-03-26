// lib/store.ts
// Central state management using Zustand
// Handles all app state including source content, analysis results, UI state, and roleplay

import { create } from 'zustand';
import { DEFAULT_MODEL_ID } from './models';



export interface Metadata {
  date: string;
  author: string;
  researchGoals: string;
  additionalInfo?: string;
  authorEmoji?: string;
  birthYear?: string;
  deathYear?: string;
  birthplace?: string;
  characterStatus?: string;
  title?: string;
   summary?: string;
  documentEmoji?: string;
  placeOfPublication?: string;
  genre?: string;
  documentType?: string;
  academicSubfield?: string;
  tags?: string[] | string;
  fullCitation?: string;

}

export interface ExtractInfoConfig {
  listType: string;
  fields: string[];
  format?: 'list' | 'table';
}

export interface AnalysisResult {
  summary: string;
  analysis: string;
  followupQuestions: string[];
}

export interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export interface Reference {
  citation: string;
  url: string;
  type: 'book' | 'journal' | 'website' | 'other';
  relevance: string;
  reliability: string;
  sourceQuote: string;
  importance: number; // 1-5 ranking
}




interface AppState {
  // Source and metadata
  sourceContent: string;
  sourceFile: File | null;
  sourceType: 'text' | 'pdf' | 'image' | null;
  metadata: Metadata | null;
  perspective: string;
  referencesModel: string;


// dark mode
isDarkMode: boolean;
toggleDarkMode: () => void;

// summaries

summarySections: {
  id: string;
  title: string;
  summary: string;
  fullText: string;
}[];
summaryOverall: string;
setSummarySections: (sections: {
  id: string;
  title: string;
  summary: string;
  fullText: string;
}[]) => void;
setSummaryOverall: (summary: string) => void;
  
  // Analysis results
    detailedAnalysisLoaded: boolean;
  initialAnalysis: AnalysisResult | null;
  detailedAnalysis: string | null;
  counterNarrative: string | null;
  references: Reference[] | null;
  
  // Roleplay state
  roleplayMode: boolean;
  roleplayContext: any | null;
  conversation: ConversationMessage[];

  // data extraction
  extractInfoConfig: ExtractInfoConfig | null;
setExtractInfoConfig: (config: ExtractInfoConfig | null) => void;
  
  // UI state
  isLoading: boolean;
 activePanel: 'analysis' | 'detailed-analysis' | 'counter' | 'roleplay' | 'references' | 'extract-info';
  showMetadataModal: boolean;
  rawPrompt: string | null;
  rawResponse: string | null;
  llmModel: string;
  processingStep: string;
  processingData: Record<string, any>;
  setProcessingStep: (step: string) => void;
  setProcessingData: (data: Record<string, any>) => void;
  
  // Actions
  setSourceContent: (content: string) => void;
   setSourceFile: (file: File | null) => void;
   setSourceType: (type: 'text' | 'pdf' | 'image' | null) => void;
   setMetadata: (metadata: Metadata) => void;
   setPerspective: (perspective: string) => void;
   setInitialAnalysis: (analysis: AnalysisResult | null) => void;
   setDetailedAnalysis: (analysis: string | null) => void;
   setCounterNarrative: (narrative: string | null) => void;
   setRoleplayMode: (active: boolean) => void;
   setRoleplayContext: (context: any | null) => void;
   addMessage: (message: Omit<ConversationMessage, 'timestamp'>) => void;
   clearConversation: () => void;
   setLoading: (loading: boolean) => void;
   setActivePanel: (panel: 'analysis' | 'detailed-analysis' | 'counter' | 'roleplay' | 'references' | 'extract-info') => void;
   setShowMetadataModal: (show: boolean) => void;
   setRawPrompt: (prompt: string | null) => void;
   setRawResponse: (response: string | null) => void;
   setLLMModel: (model: string) => void;
   resetState: () => void;
   setReferencesModel: (model: string) => void;
   setDetailedAnalysisLoaded: (loaded: boolean) => void;
   resetDetailedAnalysisLoaded: () => void;
 
 }

const initialState = {
  sourceContent: '',
  sourceFile: null,
  sourceType: null,
  metadata: null,
  perspective: '',
  initialAnalysis: null,
  detailedAnalysis: null,
  counterNarrative: null,
  references: null,
  roleplayMode: false,
  roleplayContext: null,
  conversation: [],
  isLoading: false,
  activePanel: 'analysis' as const,
  showMetadataModal: false,
  rawPrompt: null,
  rawResponse: null,
  llmModel: DEFAULT_MODEL_ID,
  referencesModel: 'gemini-flash', 
  detailedAnalysisLoaded: false,
   extractInfoConfig: null,
   processingStep: '',
   processingData: {},
   isDarkMode: false,
   summarySections: [],
summaryOverall: '',
   
};

export const useAppStore = create<AppState>((set) => ({
  ...initialState,
  
  setSourceContent: (content) => set({ sourceContent: content }),
  
  setSourceFile: (file) => set({ sourceFile: file }),
  
  setSourceType: (type) => set({ sourceType: type }),
  
  setMetadata: (metadata) => set({ metadata }),
  
  setPerspective: (perspective) => set({ perspective }),
  
  setInitialAnalysis: (analysis) => set({ initialAnalysis: analysis }),
  
  setDetailedAnalysis: (analysis) => set({ detailedAnalysis: analysis }),

  setDetailedAnalysisLoaded: (loaded) => set({ detailedAnalysisLoaded: loaded }),

  resetDetailedAnalysisLoaded: () => set({ detailedAnalysisLoaded: false }),

  setCounterNarrative: (narrative) => set({ counterNarrative: narrative }),

  setReferencesModel: (model) => set({ referencesModel: model }),
  
  setRoleplayMode: (active) => set((state) => ({
    roleplayMode: active,
    // If turning off roleplay mode, also reset conversation
    ...(active === false ? { conversation: [] } : {})
  })),

  setRoleplayContext: (context) => set({ roleplayContext: context }),
  
  addMessage: (message) => set((state) => ({
    conversation: [
      ...state.conversation,
      { ...message, timestamp: Date.now() }
    ]
  })),

  clearConversation: () => set({ conversation: [] }),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  setActivePanel: (panel) => set({ activePanel: panel }),
  
  setShowMetadataModal: (show) => set({ showMetadataModal: show }),
  
  setRawPrompt: (prompt) => set({ rawPrompt: prompt }),
  
  setRawResponse: (response) => set({ rawResponse: response }),
  
  setLLMModel: (model) => set({ llmModel: model }),
  
  setExtractInfoConfig: (config) => set({ extractInfoConfig: config }),

    setProcessingStep: (step) => set({ processingStep: step }),
  
  setProcessingData: (data) => set({ processingData: data }),

  setSummarySections: (sections) => set({ summarySections: sections }),
setSummaryOverall: (summary) => set({ summaryOverall: summary }),

  toggleDarkMode: () => set(state => ({ isDarkMode: !state.isDarkMode })),

  
  resetState: () => set(initialState)
}));