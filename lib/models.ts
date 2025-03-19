// lib/models.ts
export interface ModelConfig {
  id: string;        // Internal ID used in the app
  name: string;      // Display name
  provider: 'anthropic' | 'openai' | 'google';  // Added 'google'
  apiModel: string;  // Actual API model identifier
  description?: string; // Optional description
  maxTokens?: number;   // Default max tokens
  temperature?: number; // Default temperature
}

// Central configuration for all supported models
export const models: ModelConfig[] = [
  {
    id: 'claude-haiku',
    name: 'Claude 3.5 Haiku',
    provider: 'anthropic',
    apiModel: 'claude-3-5-haiku-20241022',
    description: 'Fast and efficient for quick analyses',
    maxTokens: 700,
    temperature: 0.7,
  },
  {
    id: 'claude-sonnet',
    name: 'Claude 3.7 Sonnet',
    provider: 'anthropic',
    apiModel: 'claude-3-7-sonnet-20250219',
    description: 'Advanced with deeper context understanding',
    maxTokens: 700,
    temperature: 0.5,
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'openai',
    apiModel: 'gpt-4o-mini',
    description: 'Efficient analysis with good performance',
    maxTokens: 700,
    temperature: 0.7,
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    apiModel: 'gpt-4o',
    description: 'Powerful model for comprehensive analyses',
    maxTokens: 700,
    temperature: 0.7,
  },
  {
    id: 'gpt-4.5-preview',
    name: 'GPT-4.5 Preview',
    provider: 'openai',
    apiModel: 'gpt-4.5-preview',
    description: 'Latest cutting-edge capabilities for deep insights',
    maxTokens: 700,
    temperature: 0.7,
  },
  {
    id: 'o3-mini',
    name: 'O3 Mini',
    provider: 'openai',
    apiModel: 'o3-mini-2025-01-31',
    description: 'Lightweight model for basic analysis',
    maxTokens: 500,
    temperature: 0.7,
  },
  {
    id: 'gemini-flash',
    name: 'Gemini 2.0 Flash',
    provider: 'google',
    apiModel: 'gemini-2.0-flash',
    description: 'Google\'s fast and responsive model',
    maxTokens: 800,
    temperature: 0.7,
  }
];

export const DEFAULT_MODEL_ID = 'gpt-4o-mini';
export const COMPONENT_DEFAULT_MODELS: Record<string, string> = {
  'references': 'claude-sonnet',
  // Add other component-specific defaults as needed
};


// Get all models from a specific provider
export function getModelsByProvider(provider: 'anthropic' | 'openai' | 'google'): ModelConfig[] {
  return models.filter(m => m.provider === provider);
}

export const LEGACY_MODEL_MAPPING: Record<string, string> = {
  'claude': 'claude-sonnet',
  'gpt': 'gpt-4o-mini'
};

// Also add logging when getting a model by ID
export function getModelById(id: string): ModelConfig {
  // Check if it's a legacy ID and map it
  const mappedId = LEGACY_MODEL_MAPPING[id] || id;
  
  const model = models.find(m => m.id === mappedId);
  if (!model) {
    console.error(`Model with ID ${id} not found, using default`);
    // Return a default model instead of throwing
    return models.find(m => m.id === DEFAULT_MODEL_ID) || models[0];
  }
  
  console.log(`getModelById resolved ${id} to model:`, model.name);
  return model;
}