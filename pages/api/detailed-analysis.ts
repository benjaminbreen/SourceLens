// pages/api/detailed-analysis.ts
// API route for detailed source analysis with standardized model handling
// Now using Gemini 2.0 Pro Exp as default for high-quality detailed analysis
// Supports OpenAI, Anthropic, and Google models through a unified configuration

import type { NextApiRequest, NextApiResponse } from 'next';
import { OpenAI } from 'openai';
import { Anthropic } from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getModelById } from '@/lib/models';

// Set default model to Gemini 2.0 Pro Exp for detailed analysis
const DEFAULT_DETAILED_MODEL = 'gemini-flash';

// Configure API clients
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Configure Google client
const googleAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { 
      source, 
      metadata, 
      perspective = '',
      modelId,  // New parameter name for model ID
      model      // Keep for backward compatibility
    } = req.body;
    
    // Always prioritize user-selected model, fall back to old 'model' param for compatibility
    const effectiveModelId = modelId || model || DEFAULT_DETAILED_MODEL;
    
    // Get model configuration
    let modelConfig;
    try {
      modelConfig = getModelById(effectiveModelId);
    } catch (error) {
      // If model not found, use default
      console.warn(`Model ID ${effectiveModelId} not found, using ${DEFAULT_DETAILED_MODEL}`);
      modelConfig = getModelById(DEFAULT_DETAILED_MODEL);
    }
    
    // Log request details for debugging
    console.log("Detailed analysis request received:", {
      sourceLength: source?.length,
      metadata: !!metadata,
      perspective,
      modelId: effectiveModelId,
      apiModel: modelConfig.apiModel,
      provider: modelConfig.provider
    });
    
    // Validate input
    if (!source || !metadata) {
      console.log("Missing required fields");
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Process large text appropriately for different models
    const truncatedSource = processSizeForModel(source, modelConfig);
    const isTruncated = truncatedSource.length < source.length;
    
    if (isTruncated) {
      console.log(`Source truncated from ${source.length} chars to ${truncatedSource.length} chars for ${modelConfig.name}`);
    }
    
    // Build prompt
    const prompt = buildDetailedAnalysisPrompt(truncatedSource, metadata, perspective, isTruncated);
    console.log(`Prompt built, sending to ${modelConfig.provider} model: ${modelConfig.apiModel}`);
    
    // Track raw prompt and response for transparency
    let rawPrompt = prompt;
    let rawResponse = '';
    
    // Process with selected LLM based on provider
    let analysis;
    if (modelConfig.provider === 'openai') {
      console.log(`Using OpenAI model: ${modelConfig.apiModel}`);
      const response = await openai.chat.completions.create({
        model: modelConfig.apiModel,
        messages: [{ role: 'user', content: prompt }],
        temperature: modelConfig.temperature || 0.4,
        max_tokens: modelConfig.maxTokens || 16000,
      });
      
      rawResponse = response.choices[0]?.message?.content || '';
      analysis = rawResponse;
      console.log("OpenAI response received");
    } else if (modelConfig.provider === 'google') {
      console.log(`Using Google model: ${modelConfig.apiModel}`);
      const model = googleAI.getGenerativeModel({ model: modelConfig.apiModel });
      
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: modelConfig.temperature || 0.4,
          maxOutputTokens: modelConfig.maxTokens || 16000,
        },
      });
      
      const response = result.response;
      rawResponse = response.text();
      analysis = rawResponse;
      console.log("Google response received");
    } else {
      // Default to Anthropic/Claude
      console.log(`Using Anthropic model: ${modelConfig.apiModel}`);
      const response = await anthropic.messages.create({
        model: modelConfig.apiModel,
        messages: [{ role: 'user', content: prompt }],
        temperature: modelConfig.temperature || 0.5,
        max_tokens: modelConfig.maxTokens || 16000,
      });
      
      rawResponse = response.content[0]?.type === 'text' 
        ? response.content[0].text 
        : '';
      analysis = rawResponse;
      console.log("Anthropic response received");
    }
    
    return res.status(200).json({
      analysis,
      rawPrompt,
      rawResponse,
      modelUsed: modelConfig.name,
      truncated: isTruncated,
      originalLength: source.length,
      truncatedLength: truncatedSource.length
    });
  } catch (error) {
    console.error('Detailed analysis error:', error);
    return res.status(500).json({ 
      message: 'Error processing detailed analysis',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Process source text with appropriate truncation based on model
function processSizeForModel(source: string, modelConfig: any): string {
  // Default token counts - adjust based on model capabilities
  const maxTokens = {
    'openai': 30000,
    'anthropic': 25000,
    'google': 40000
  };
  
  // Rough approximation: 1 token ≈ 4 characters for English text
  const provider = modelConfig.provider;

const charLimit = (maxTokens[provider as keyof typeof maxTokens] || 40000) * 4;
  
  // Special handling for specific models with larger context windows
  if (modelConfig.id === 'gemini-2.0-pro-exp-02-05' || modelConfig.id === 'gemini-flash') {
    return source; // These models can handle very large contexts, so no truncation
  }
  
  // For other models, truncate if necessary
  if (source.length > charLimit) {
    return source.substring(0, charLimit);
  }
  
  return source;
}

function buildDetailedAnalysisPrompt(
  source: string, 
  metadata: any, 
  perspective: string,
  isTruncated: boolean
): string {
  return `You are an expert, blunt, and succinct professor in the humanities analyzing a primary source in depth. You have a flexible, creative, and unorthodox mind and value scholarly rigor, truth-telling, skepticism, and plainspokenness.

SOURCE DATE: ${metadata.date}
SOURCE AUTHOR: ${metadata.author}
RESEARCH GOALS: ${metadata.researchGoals}
${metadata.additionalInfo ? `ADDITIONAL CONTEXT: ${metadata.additionalInfo}` : ''}
${perspective ? `ANALYTICAL PERSPECTIVE: ${perspective}` : ''}

PRIMARY SOURCE${isTruncated ? ' (truncated for analysis)' : ''}:
${source}

Provide an analysis of this primary source that includes only the the following 6 sections: ###CONTEXT: ###PERSPECTIVE: ###THEMES: ###EVIDENCE: ###SIGNIFICANCE: ###REFERENCES:   Remember that each entry must always be formatted like ###HEADER: content

Use in-line short form chicago style citations the most relevant and useful academic secondary sources throughout (between 3 and 5 total citations). 

When citing a source, ALWAYS use the format 📚(Author, Year) - for example 📚(Smith, 2010) or 📚(Johnson, 2010). This ensures the citations are properly linked in the interface.

Provide ONLY the following entries, with absolutely no prefatory material or opening sentence. 

1.###CONTEXT: Place this source in its historical context, including relevant events, movements, or trends from the period. 3-4 sentences. Always discuss the wider context of the time period, and cite at least one source.

2.###PERSPECTIVE: Analyze the author's background, potential biases, and how these might influence the source. 4-5 sentences. Always consider what is excluded. 

3.###THEMES: Identify the main themes, arguments, or narratives present in the source. 4-5 sentences, with direct quotes. Cite at least one source here.

4.###EVIDENCE: Analyze how the author uses evidence, language, or rhetoric to convey their message. 4-5 sentences, with direct quotes. Cite at least one source. 

5.###SIGNIFICANCE: Explain why this source MAY (or MAY NOT) be valuable for the stated research goals, highlighting its potential contributions (or not) to understanding the topic. ONE SENTENCE ONLY.

6.###REFERENCES: All sources you cited, in full Chicago style. Numbered in alphabetical order. Always cite minimum of three sources.

`;
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
    responseLimit: false,
  },
};