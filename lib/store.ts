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
  
  // Analysis results
  initialAnalysis: AnalysisResult | null;
  detailedAnalysis: string | null;
  counterNarrative: string | null;
  references: Reference[] | null;
  
  // Roleplay state
  roleplayMode: boolean;
  roleplayContext: any | null;
  conversation: ConversationMessage[];
  
  // UI state
  isLoading: boolean;
 activePanel: 'analysis' | 'counter' | 'roleplay' | 'references';
  showMetadataModal: boolean;
  rawPrompt: string | null;
  rawResponse: string | null;
  llmModel: string;
  
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
 setActivePanel: (panel: 'analysis' | 'counter' | 'roleplay' | 'references') => void;
  setShowMetadataModal: (show: boolean) => void;
  setRawPrompt: (prompt: string | null) => void;
  setRawResponse: (response: string | null) => void;
  setLLMModel: (model: string) => void;
  resetState: () => void;
   setReferencesModel: (model: string) => void; 
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
  referencesModel: 'claude-sonnet', 
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
  
  resetState: () => set(initialState)
}));