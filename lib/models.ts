// lib/models.ts
// Central configuration for model providers and settings
// Includes support for OpenAI, Anthropic, and Google models with appropriate context windows

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
    apiModel: 'claude-3-5-haiku-latest',
    description: 'Fast and efficient for quick analyses',
    maxTokens: 30000,
    temperature: 0.2,
  },
  {
    id: 'claude-sonnet',
    name: 'Claude 3.7 Sonnet',
    provider: 'anthropic',
    apiModel: 'claude-3-7-sonnet-latest',
    description: 'Advanced with deeper context understanding',
    maxTokens: 30000,
    temperature: 0.5,
  },
  {
    id: 'gpt-4.1-nano',
    name: 'GPT-4.1 Nano',
    provider: 'openai',
    apiModel: 'gpt-4.1-nano',
    description: 'A new low-latency model.',
    maxTokens: 32000,
    temperature: 0.3,
  },
  {
    id: 'gpt-4.1',
    name: 'GPT-4.1',
    provider: 'openai',
    apiModel: 'gpt-4.1-2025-04-14',
    description: 'A new flagship model from OpenAI',
    maxTokens: 32000,
    temperature: 0.3,
  },
  {
    id: 'o3-mini',
    name: 'O3 Mini',
    provider: 'openai',
    apiModel: 'o3-mini-2025-01-31',
    description: 'Fast, advanced reasoning model for complex analysis',
    temperature: 0.3,
  },
  {
    id: 'gemini-flash',
    name: 'Gemini 2.0 Flash',
    provider: 'google',
    apiModel: 'gemini-2.0-flash',
    description: 'Process long texts with 1M token context window',
    maxTokens: 400000, 
    temperature: 0.2,
  },
    {
    id: 'gemini-flash-lite',
    name: 'Gemini 2.0 Flash Lite',
    provider: 'google',
    apiModel: 'gemini-2.0-flash-lite',
    description: 'The smaller version of Flash. Good all-arounder.',
    maxTokens: 600000, // unknown if this works
    temperature: 0.2,
  },

  {
  id: 'gemini-2.0-pro-exp-02-05',
  name: 'Gemini 2.0 Pro Experimental',
  provider: 'google',
  apiModel: 'gemini-2.0-pro-exp-02-05',
  description: 'Latest experimental version of Gemini Pro with enhanced document processing capabilities',
  maxTokens: 500000,
  temperature: 0.2,
}
];

export const DEFAULT_MODEL_ID = 'gemini-flash-lite';

// Set component-specific default models
export const COMPONENT_DEFAULT_MODELS: Record<string, string> = {

  'extract-info': 'gemini-flash-lite', // Gemini Flash lite for long document extraction
  // Add other component-specific defaults as needed
};

// Get all models from a specific provider
export function getModelsByProvider(provider: 'anthropic' | 'openai' | 'google'): ModelConfig[] {
  return models.filter(m => m.provider === provider);
}

export const LEGACY_MODEL_MAPPING: Record<string, string> = {
  'claude': 'claude-haiku',
  'gpt': 'gpt-4o-mini',
  'o3-mini-2025-01-31': 'o3-mini' // Add this line to map the API model name to your internal ID
};

// Also add logging when getting a model by ID
export function getModelById(id: string): ModelConfig {
  // Handle both cases: when the ID might be the API model name instead of our internal ID
  const mappedId = LEGACY_MODEL_MAPPING[id] || id;
  
  // Try to find by id first
  let model = models.find(m => m.id === mappedId);
  
  // If not found, try to find by API model name
  if (!model) {
    model = models.find(m => m.apiModel === mappedId);
  }
  
  // If still not found, use default
  if (!model) {
    console.warn(`Model with ID "${id}" not found, using default "${DEFAULT_MODEL_ID}"`);
    return models.find(m => m.id === DEFAULT_MODEL_ID) || models[0];
  }
  
  console.log(`getModelById resolved "${id}" to model: ${model.name} (${model.id})`);
  return model;
}