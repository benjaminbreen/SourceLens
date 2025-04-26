// lib/types/sourcePossibilities.ts
export interface SourcePossibilities {
  summary: string;
  'detailed-analysis': string;
  'extract-info': string;
  'references': string;
  'translate': string;
  'roleplay': string;
  'connections': string;
  'counter': string;
  'highlight': string;
  [key: string]: string; // For any additional lenses
}

export const emptySourcePossibilities: SourcePossibilities = {
  summary: '',
  'detailed-analysis': '',
  'extract-info': '',
  'references': '',
  'translate': '',
  'roleplay': '',
  'connections': '',
  'counter': '',
  'highlight': ''
};