// lib/store.ts
// Central state management using Zustand
// Handles all app state including source content, analysis results, UI state, and roleplay

import { create } from 'zustand';
import { DEFAULT_MODEL_ID } from './models';
import { SavedDraft, Note } from './libraryContext';
export type { Note, SavedDraft, SavedReference, SavedAnalysis, SavedSource } from './libraryContext';


export interface GraphNode {
  id: string;
  name: string;
  x: number;
  y: number;
  color: string;
  size: number;
  type: string;
  emoji: string;
  [key: string]: any; // To allow extra properties like `metadata`, `year`, etc.
}

export interface SimplifiedNote {
  id: string;
  content: string;
  sourceId: string;
  lastModified: number;
}

export interface NodeNote {
  nodeId: string;
  note: string;
}

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
  thumbnailUrl?: string | null;
}

export interface TranslationOptions {
  targetLanguage: string;
  translationScope: string;
  explanationLevel: string;
  literalToPoetic: number;
  preserveLineBreaks: boolean;
  includeAlternatives: boolean;
  fontSize: number;
}

export interface SpecialLensRequest {
  lensType: 'voice' | 'place' | 'provenance' | null;
  instructions: string;
  autoGenerate?: boolean; 
}

export interface HighlightedSegment {
  text: string;         // The actual text segment
  startIndex: number;   // Character position where segment starts in original text
  endIndex: number;     // Character position where segment ends in original text
  score: number;        // Relevance score from 0 to 1
  explanation: string;  // Brief explanation of why this segment matches
  id: number;
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


export interface AppState {
  // Notes state
  activeNote: Note | null;
    isNotePanelVisible: boolean;
    setActiveNote: (note: Note | null) => void;
    setNotePanelVisible: (visible: boolean) => void;
    toggleNotePanel: () => void;

  // Source and metadata
  sourceContent: string;
  sourceFile: File | null;
  sourceType: 'text' | 'pdf' | 'image' | 'audio' | null;
  metadata: Metadata | null;
  perspective: string;
  referencesModel: string;
  sourceThumbnailUrl: string | null;

  // translations
  translatedText: string;
  translationOptions: TranslationOptions;
  setTranslatedText: (text: string) => void;
  setTranslationOptions: (options: TranslationOptions) => void;

  // Draft context
  activeDraft: SavedDraft | null;
  setActiveDraft: (draft: SavedDraft | null) => void;

  //text segment color coding
  highlightedSegments: HighlightedSegment[];
  highlightQuery: string;
  isHighlightMode: boolean;

  specialLensRequest: SpecialLensRequest | null;
  setSpecialLensRequest: (request: SpecialLensRequest | null) => void;

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
  activePanel: 'analysis' | 'detailed-analysis' | 'counter' | 'roleplay' | 'references' | 'extract-info' | 'highlight' | 'translate' | 'connections';
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
  setSourceType: (type: 'text' | 'pdf' | 'image' | 'audio' | null) => void;
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
  setActivePanel: (panel: 'analysis' | 'detailed-analysis' | 'counter' | 'roleplay' | 'references' | 'extract-info' | 'highlight' | 'translate' | 'connections') => void;
  setShowMetadataModal: (show: boolean) => void;
  setRawPrompt: (prompt: string | null) => void;
  setRawResponse: (response: string | null) => void;
  setLLMModel: (model: string) => void;
  resetState: () => void;
  setReferencesModel: (model: string) => void;
  setDetailedAnalysisLoaded: (loaded: boolean) => void;
  resetDetailedAnalysisLoaded: () => void;
  setHighlightedSegments: (segments: HighlightedSegment[]) => void;
  setHighlightQuery: (query: string) => void;
  setHighlightMode: (active: boolean) => void;
  clearHighlights: () => void;
  setSourceThumbnailUrl: (url: string | null) => void;
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
  referencesModel: 'gpt-4.1-nano', 
  detailedAnalysisLoaded: false,
  extractInfoConfig: null,
  processingStep: '',
  processingData: {},
  isDarkMode: false,
  summarySections: [],
  summaryOverall: '',
  highlightedSegments: [],
  highlightQuery: '',
  isHighlightMode: false,
  specialLensRequest: null,
  sourceThumbnailUrl: null,
  activeDraft: null,
  translatedText: '',
  translationOptions: {
    targetLanguage: 'en',
    translationScope: 'all',
    explanationLevel: 'minimal',
    literalToPoetic: 0.5,
    preserveLineBreaks: true,
    includeAlternatives: false,
    fontSize: 17,
  },
  activeNote: null,
  isNotePanelVisible: false,
};

export const useAppStore = create<AppState>((set) => ({
  ...initialState,

  setActiveNote: (note) => set({ activeNote: note }),
  
  toggleNotePanel: () => set((state) => ({ 
    isNotePanelVisible: !state.isNotePanelVisible 
  })),
  
  setNotePanelVisible: (visible) => set({ isNotePanelVisible: visible }),
  
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
  
  setHighlightedSegments: (segments) => set({ highlightedSegments: segments }),
  
  setHighlightQuery: (query) => set({ highlightQuery: query }),
  
  setHighlightMode: (active) => set({ isHighlightMode: active }),

  setSpecialLensRequest: (request) => set({ specialLensRequest: request }),
  
  setSourceThumbnailUrl: (url) => set({ sourceThumbnailUrl: url }),

  setActiveDraft: (draft) => set({ activeDraft: draft }),
  
  setTranslatedText: (text) => set({ translatedText: text }),
  
  setTranslationOptions: (options) => set({ translationOptions: options }),

  clearHighlights: () => set({ 
    highlightedSegments: [], 
    highlightQuery: '',
    isHighlightMode: false 
  }),

  resetState: () => set(initialState)
}));