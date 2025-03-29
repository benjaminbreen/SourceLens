// pages/api/suggested-references.ts
// Optimized API endpoint with caching and faster response times
// Designed to be a drop-in replacement that works with the existing component

import type { NextApiRequest, NextApiResponse } from 'next';
import { OpenAI } from 'openai';
import { Anthropic } from '@anthropic-ai/sdk';
import { getModelById } from '@/lib/models';
import { GoogleGenerativeAI } from '@google/generative-ai';
import crypto from 'crypto';

// Configure API clients
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const googleAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

// Simple in-memory cache
const CACHE_TTL = 1000 * 60 * 30; // 30 minutes
interface CacheEntry {
  data: any;
  timestamp: number;
}
const cache: Record<string, CacheEntry> = {};

// Define Reference interface - must match what frontend expects
export interface Reference {
  citation: string;
  url?: string;
  type: 'book' | 'journal' | 'website' | 'other';
  relevance: string;
  reliability?: string;
  sourceQuote: string;
  importance: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const startTime = Date.now();
  
  try {
    const { 
      source, 
      metadata, 
      perspective = '',
      modelId = 'gemini-flash', // Default to gemini flash
    } = req.body;
    
    // Validate input
    if (!source || !metadata) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Truncate source to essential parts to speed up processing
    const truncatedSource = source.length > 5000 
      ? source.substring(0, 5000) + '...' 
      : source;
    
    // Create a cache key based on inputs
    const cacheKey = crypto.createHash('md5').update(
      `${truncatedSource}|${JSON.stringify(metadata)}|${perspective}|${modelId}`
    ).digest('hex');
    
    // Check cache first
    if (cache[cacheKey] && (Date.now() - cache[cacheKey].timestamp) < CACHE_TTL) {
      console.log('Cache hit for references');
      return res.status(200).json(cache[cacheKey].data);
    }
    
    // Build prompt for generating references
    const prompt = buildReferencesPrompt(truncatedSource, metadata, perspective);
    
    // Track raw prompt and response for transparency
    let rawPrompt = prompt;
    let rawResponse = '';
    
    // Get model configuration
    let model;
    try {
      model = getModelById(modelId);
    } catch (error) {
      console.warn(`Model ID ${modelId} not found, using gemini-flash`);
      model = getModelById('gemini-flash');
    }
    
    let references: Reference[] = [];
    
    // Create a timeout promise
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('API request timed out')), 8000);
    });
    
    try {
      console.log(`Using ${model.name} for references`);
      
      if (model.provider === 'anthropic') {
        // Use Anthropic (Claude)
        const responsePromise = anthropic.messages.create({
          model: model.apiModel,
          max_tokens: 800, // Reduced for speed
          system: "You are a JSON API that returns valid JSON only, with no text outside the JSON.",
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3,
        });
        
        // Race against timeout
        const response: any = await Promise.race([responsePromise, timeoutPromise]);
        
        rawResponse = response.content[0]?.type === 'text' 
          ? response.content[0].text 
          : '';
        
        // Parse the response
        const cleanedJson = rawResponse.trim()
          .replace(/^```json\s*|\s*```$/g, '') // Remove JSON fences
          .replace(/^```\s*|\s*```$/g, '')     // Remove other fences
          .trim();
        
        try {
          const parsed = JSON.parse(cleanedJson);
          references = parsed.references || [];
        } catch (parseError) {
          console.error("Error parsing Claude response:", parseError);
          throw new Error('Failed to parse Claude response');
        }
      } else if (model.provider === 'openai') {
        // OpenAI option with timeout
        const responsePromise = openai.chat.completions.create({
          model: model.apiModel,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.2,
          max_tokens: 1000,
          response_format: { type: "json_object" },
        });
        
        const response: any = await Promise.race([responsePromise, timeoutPromise]);
        
        rawResponse = response.choices[0]?.message?.content || '';
        try {
          const parsed = JSON.parse(rawResponse);
          references = parsed.references || [];
        } catch (parseError) {
          console.error("Error parsing OpenAI response:", parseError);
          throw new Error('Failed to parse OpenAI response');
        }
      } else if (model.provider === 'google') {
        // Google AI option with timeout
        const geminiModel = googleAI.getGenerativeModel({ model: model.apiModel });
        
        const responsePromise = geminiModel.generateContent({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 1000,
          },
        });
        
        const response: any = await Promise.race([responsePromise, timeoutPromise]);
        
        rawResponse = response.response.text();
        try {
          // Try to clean up Gemini's response which sometimes adds text around JSON
          const jsonRegex = /\{[\s\S]*\}/;
          const jsonMatch = rawResponse.match(jsonRegex);
          const jsonText = jsonMatch ? jsonMatch[0] : rawResponse;
          
          const parsed = JSON.parse(jsonText);
          references = parsed.references || [];
        } catch (parseError) {
          console.error("Error parsing Google AI response:", parseError);
          throw new Error('Failed to parse Google AI response');
        }
      } else {
        throw new Error(`Unsupported model provider: ${model.provider}`);
      }
    } catch (error) {
      console.error("Error getting references:", error);
      
      // Fall back to faster OpenAI model for reliability
      try {
        console.log("Falling back to GPT-4o-mini for faster reference generation");
        
        const response = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.2,
          max_tokens: 1000,
          response_format: { type: "json_object" },
        });
        
        rawResponse = response.choices[0]?.message?.content || '';
        const parsed = JSON.parse(rawResponse);
        references = parsed.references || [];
        
        // If we get here, update the model name to show fallback was used
        model = {
          ...model,
          name: 'GPT-4o-mini (fallback)'
        };
      } catch (fallbackError) {
        console.error("Fallback also failed:", fallbackError);
        // Now create fallback references as last resort
        references = createFallbackReferences(metadata);
      }
    }
    
    // Post-process the references
    references = postProcessReferences(references, metadata);
    
    // Prepare response data (matching exactly what the component expects)
    const responseData = {
      references,
      rawPrompt,
      rawResponse,
      citationStyle: 'chicago',
      modelUsed: model.name,
      processingTime: Date.now() - startTime
    };
    
    // Update cache
    cache[cacheKey] = {
      data: responseData,
      timestamp: Date.now()
    };
    
    // Cleanup old cache entries periodically (10% chance on each request)
    if (Math.random() < 0.1) {
      const now = Date.now();
      Object.keys(cache).forEach(key => {
        if (now - cache[key].timestamp > CACHE_TTL) {
          delete cache[key];
        }
      });
    }
    
    // Send the response
    return res.status(200).json(responseData);
  } catch (error) {
    console.error('References generation error:', error);
    
    // Always return something useful, even on error
    const fallbackReferences = createFallbackReferences(req.body.metadata);
    
    return res.status(200).json({ 
      references: fallbackReferences,
      message: 'Using fallback references due to an error',
      error: error instanceof Error ? error.message : 'Unknown error',
      modelUsed: 'Fallback Generator',
      citationStyle: 'chicago'
    });
  }
}

// Create fallback references if LLM fails
function createFallbackReferences(metadata: any): Reference[] {
  const author = metadata?.author || 'Unknown';
  const date = metadata?.date || 'Unknown date';
  
  return [
    {
      citation: `Secondary literature about ${author} (${date})`,
      type: 'other',
      relevance: 'This reference would provide context about the author and time period.',
      reliability: 'Unable to assess reliability due to generation error.',
      sourceQuote: 'No specific quote available',
      importance: 4,
      url: `https://scholar.google.com/scholar?q=${encodeURIComponent(author + ' ' + date)}`
    }
  ];
}

// Post-process references to ensure quality and proper URLs
function postProcessReferences(references: Reference[], metadata: any): Reference[] {
  return references.map(ref => {
    // Extract author and title for search URL
    const citation = ref.citation || '';
    const parts = citation.split(',');
    const author = parts[0] || '';
    
    // Get title - from quotes or initial text
    let title = '';
    if (citation.includes('"')) {
      const titleMatch = citation.match(/"([^"]+)"/);
      title = titleMatch ? titleMatch[1].split(' ').slice(0, 5).join(' ') : '';
    } else if (parts.length > 1) {
      title = parts[1].trim().split(' ').slice(0, 5).join(' ');
    }
    
    const searchTerm = `${author} ${title}`.trim();
    
    return {
      ...ref,
      reliability: ref.reliability || 'Reliability assessment not available for this source.',
      type: ref.type || 'other',
      importance: ref.importance || 3,
      // Generate Google Scholar search URL
      url: `https://scholar.google.com/scholar?q=${encodeURIComponent(searchTerm)}`
    };
  });
}

function buildReferencesPrompt(
  source: string, 
  metadata: any, 
  perspective: string
): string {
  return `Generate 5 relevant scholarly references for understanding this primary source. BE EXTREMELY FAST AND EFFICIENT.

SOURCE DATE: ${metadata.date}
SOURCE AUTHOR: ${metadata.author}
RESEARCH GOALS: ${metadata.researchGoals}
${metadata.additionalInfo ? `ADDITIONAL CONTEXT: ${metadata.additionalInfo}` : ''}
${perspective ? `ANALYTICAL PERSPECTIVE: ${perspective}` : ''}

PRIMARY SOURCE EXCERPT:
${source}

Return a JSON object with this exact structure:
{
  "references": [
    {
      "citation": "Full citation in Chicago style",
      "type": "book" | "journal" | "website" | "other",
      "relevance": "1 short sentence explaining why this reference is relevant",
      "reliability": "1 short sentence assessing reliability",
      "sourceQuote": "BRIEF quote from the primary source this reference contextualizes",
      "importance": number from 1-5 (5 = most important)
    }
    // 4 more references
  ]
}

Your references must be:
- Real, verifiable scholarly works
- Directly relevant to the source
- Include a mix of types (books, journal articles)
- Ranked by importance (5 = most important)

OPTIMIZE FOR SPEED. This is a PERFORMANCE-CRITICAL task.
RETURN ONLY VALID JSON with no text outside the JSON structure.`;
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
    responseLimit: false,
  },
};