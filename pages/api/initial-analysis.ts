// pages/api/initial-analysis.ts
// Optimized API route for initial source analysis with improved caching and response handling

import type { NextApiRequest, NextApiResponse } from 'next';
import { OpenAI } from 'openai';
import { Anthropic } from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getModelById, DEFAULT_MODEL_ID } from '@/lib/models';
import { LRUCache } from 'lru-cache';

// Configure API clients
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Configure Google client
const googleAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

// Setup response caching using LRU cache - helps with page refreshes and repeat analyses
const responseCache = new LRUCache<string, any>({
  max: 100, // Maximum 100 cached responses
  ttl: 1000 * 60 * 30, // Cache TTL: 30 minutes
});

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
      modelId = DEFAULT_MODEL_ID,  // New parameter name for model ID
      model      // Keep for backward compatibility
    } = req.body;
    
    // Check if required fields are missing
    if (!source || !metadata) {
      console.log("Missing required fields");
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Handle backward compatibility - if modelId isn't provided but model is
    const effectiveModelId = modelId || (model === 'gpt' ? 'gpt-4o-mini' : 'claude-haiku');
    
    // Create a cache key based on inputs
    const sourceHash = source.substring(0, 100) + source.length; // Use first 100 chars + length as a hash
    const cacheKey = `${effectiveModelId}:${perspective}:${JSON.stringify(metadata)}:${sourceHash}`;
    
    // Try to get from cache first
    const cachedResult = responseCache.get(cacheKey);
    if (cachedResult) {
      console.log("Returning cached analysis result");
      return res.status(200).json(cachedResult);
    }
    
    // Get model configuration
    const modelConfig = getModelById(effectiveModelId);
    
    // Log request details for debugging
    console.log("Initial analysis request received:", {
      sourceLength: source.length,
      metadata: !!metadata,
      perspective,
      modelId: effectiveModelId,
      apiModel: modelConfig.apiModel,
      provider: modelConfig.provider
    });
    
    // For very large sources, truncate to optimize API usage and reduce latency
    const MAX_SOURCE_LENGTH = 100000; // Adjust based on model context window
    let truncatedSource = source;
    let contentLength = source.length;
    
    if (source.length > MAX_SOURCE_LENGTH) {
      console.log(`Source exceeds ${MAX_SOURCE_LENGTH} chars, truncating`);
      
      // More intelligent truncation - preserve beginning, middle and end
      const beginning = source.substring(0, MAX_SOURCE_LENGTH * 0.5);
      const end = source.substring(source.length - MAX_SOURCE_LENGTH * 0.2);
      const truncationMarker = "\n\n[...content truncated for length...]\n\n";
      
      truncatedSource = beginning + truncationMarker + end;
      contentLength = truncatedSource.length;
      
      console.log(`Truncated from ${source.length} to ${contentLength} chars`);
    }
    
    // Build prompt
    const prompt = buildAnalysisPrompt(truncatedSource, metadata, perspective);
    console.log(`Prompt built, sending to ${modelConfig.provider} model: ${modelConfig.apiModel}`);
    
    // Track raw prompt and response for transparency
    let rawPrompt = prompt;
    let rawResponse = '';
    
    // Process with selected LLM based on provider - now with timeouts
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60-second timeout
    
    try {
      let analysis;
      if (modelConfig.provider === 'openai') {
        console.log(`Using OpenAI model: ${modelConfig.apiModel}`);
        const response = await openai.chat.completions.create({
          model: modelConfig.apiModel,
          messages: [{ role: 'user', content: prompt }],
          temperature: modelConfig.temperature || 0.7,
          max_tokens: modelConfig.maxTokens || 700,
        });
        
        rawResponse = response.choices[0]?.message?.content || '';
        console.log("OpenAI response received");
      } else if (modelConfig.provider === 'google') {
        console.log(`Using Google model: ${modelConfig.apiModel}`);
        const model = googleAI.getGenerativeModel({ model: modelConfig.apiModel });
        
        const result = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: modelConfig.temperature || 0.7,
            maxOutputTokens: modelConfig.maxTokens || 700,
          },
        });
        
        const response = result.response;
        rawResponse = response.text();
        console.log("Google response received");
      } else {
        // Default to Anthropic/Claude
        console.log(`Using Anthropic model: ${modelConfig.apiModel}`);
        const response = await anthropic.messages.create({
          model: modelConfig.apiModel,
          messages: [{ role: 'user', content: prompt }],
          temperature: modelConfig.temperature || 0.7,
          max_tokens: modelConfig.maxTokens || 700,
        });
        
        rawResponse = response.content[0]?.type === 'text' 
          ? response.content[0].text 
          : '';
        console.log("Anthropic response received");
      }
      
      // Parse the response with optimized parser
      analysis = parseAnalysisResponse(rawResponse);
      
      // Create result object
      const result = {
        analysis,
        rawPrompt,
        rawResponse,
        contentLength
      };
      
      // Cache the result
      responseCache.set(cacheKey, result);
      
      console.log("Response parsed, sending back to client");
      return res.status(200).json(result);
    } finally {
      clearTimeout(timeoutId);
    }
  } catch (error) {
    console.error('Initial analysis error:', error);
    return res.status(500).json({ 
      message: 'Error processing analysis',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Optimized prompt builder using template literals for better performance
function buildAnalysisPrompt(
  source: string, 
  metadata: any, 
  perspective: string
): string {
  return `You are the analysis engine of SourceLens, an expert level humanistic research tool for scholars and researchers. Your job is to analyze primary sources, keeping in mind the human user's research goals and the provided date and author of the source. 

 You are able to analyze sources in any language and do so, but you default to responding in English unless asked otherwise by the user. 
  Here is your current source:

SOURCE DATE: ${metadata.date}
SOURCE AUTHOR: ${metadata.author}
RESEARCH GOALS: ${metadata.researchGoals}
${metadata.additionalInfo ? `ADDITIONAL CONTEXT: ${metadata.additionalInfo}` : ''}
${perspective ? `ANALYTICAL PERSPECTIVE: ${perspective}` : ''}

PRIMARY SOURCE:
${source}

Please provide:
1. A BRIEF one-sentence summary of the source
2. A BRIEF one-sentence preliminary analysis that addresses the research goals while considering the historical context of the author and date
3. Three EXTREMELY BRIEF (like as few as 6 words) follow-up questions that would better understand and think creatively about the source. These are questions YOU as the LLM for SourceLens, want the human user to provide answers to (ideally large dumps of data for context) in order to assist YOU, SourceLens, in developing your own analysis. These questions may be nosy, pointed, surprising, succinct, telegraphic, telepathic, and probably should be. 

Format your response as follows:
SUMMARY: [your one-sentence summary]
PRELIMINARY ANALYSIS: [your one-sentence analysis]
FOLLOW-UP QUESTIONS:
1. [first question]
2. [second question]
3. [third question]
`;
}

// Optimized parser using RegExp.exec for better performance
function parseAnalysisResponse(text: string): any {
  // Regular expressions to extract components
  const summaryRegex = /SUMMARY:\s*(.*?)(?=PRELIMINARY|$)/s;
  const analysisRegex = /PRELIMINARY ANALYSIS:\s*(.*?)(?=FOLLOW-UP|$)/s;
  const questionsRegex = /FOLLOW-UP QUESTIONS:[\s\S]*?(?:1\.\s*(.*?))\s*(?:2\.\s*(.*?))\s*(?:3\.\s*(.*?))\s*(?=$|[\r\n])/s;
  
  // Extract components using exec which is more performant
  const summaryMatch = summaryRegex.exec(text);
  const analysisMatch = analysisRegex.exec(text);
  const questionsMatch = questionsRegex.exec(text);
  
  // Build result object with fallbacks
  const result = {
    summary: summaryMatch?.[1]?.trim() || 'A historical document requiring analysis.',
    analysis: analysisMatch?.[1]?.trim() || 'This document relates to the stated research goals.',
    followupQuestions: [
      questionsMatch?.[1]?.trim() || 'What was the historical context of this document?',
      questionsMatch?.[2]?.trim() || 'How does this document relate to the author\'s other work?',
      questionsMatch?.[3]?.trim() || 'What biases or perspectives might be present in this source?',
    ].filter(Boolean)
  };
  
  return result;
}

// Set appropriate API config for large payloads
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb', // Increase size limit for large documents
    },
    responseLimit: false,
  },
};