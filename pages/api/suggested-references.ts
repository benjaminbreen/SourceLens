// pages/api/suggested-references.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { OpenAI } from 'openai';
import { Anthropic } from '@anthropic-ai/sdk';
import { getModelById } from '@/lib/models';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Configure API clients
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const googleAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

// Timeout handler function 
async function fetchWithTimeout<T>(promise: Promise<T>, timeout: number): Promise<T> {
  // Initialize timer to undefined initially
  let timer: NodeJS.Timeout | undefined = undefined;
  
  // Create a promise that rejects after timeout
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error(`Operation timed out after ${timeout}ms`));
    }, timeout);
  });
  
  // Race the original promise against the timeout
  try {
    const result = await Promise.race([promise, timeoutPromise]);
    // Only clear the timeout if it was set
    if (timer) clearTimeout(timer);
    return result;
  } catch (error) {
    // Only clear the timeout if it was set
    if (timer) clearTimeout(timer);
    throw error;
  }
}

// Define Reference interface
export interface Reference {
  citation: string;
  type: 'book' | 'journal' | 'website' | 'other';
  relevance: string;
  reliability: string;
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
    
    // Build prompt for generating references
    const prompt = buildReferencesPrompt(source, metadata, perspective);
    
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
    
    try {
      console.log(`Using ${model.name} for references`);
      
      if (model.provider === 'anthropic') {
        // Use Anthropic (Claude)
        const response = await fetchWithTimeout(
          anthropic.messages.create({
            model: model.apiModel,
            max_tokens: 800, // Reduced for speed
            system: "You are a JSON API that returns valid JSON only, with no text outside the JSON.",
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.3,
          }),
          15000 // 15 second timeout
        );
        
        rawResponse = response.content[0]?.type === 'text' 
          ? response.content[0].text 
          : '';
        
        // Parse the response carefully
        try {
          // Try to parse directly
          const cleanedJson = rawResponse.trim()
            .replace(/^```json\s*|\s*```$/g, '') // Remove JSON fences
            .replace(/^```\s*|\s*```$/g, '')     // Remove other fences
            .trim();
          
          const parsed = JSON.parse(cleanedJson);
          references = parsed.references || [];
        } catch (parseError) {
          console.error("Error parsing Claude response:", parseError);
          // Try OpenAI as fallback
          const fallbackResponse = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.2,
            max_tokens: 1500,
            response_format: { type: "json_object" },
          });
          
          rawResponse = fallbackResponse.choices[0]?.message?.content || '';
          const parsed = JSON.parse(rawResponse);
          references = parsed.references || [];
        }
      } else if (model.provider === 'openai') {
        // OpenAI option
        const response = await openai.chat.completions.create({
          model: model.apiModel,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.2,
          max_tokens: 1500,
          response_format: { type: "json_object" },
        });
        
        rawResponse = response.choices[0]?.message?.content || '';
        const parsed = JSON.parse(rawResponse);
        references = parsed.references || [];
      } else if (model.provider === 'google') {
        // Google AI option
        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');
        const geminiModel = genAI.getGenerativeModel({ model: model.apiModel });
        
        const geminiResponse = await geminiModel.generateContent({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 1500,
          },
        });
        
        rawResponse = geminiResponse.response.text();
        try {
          const parsed = JSON.parse(rawResponse);
          references = parsed.references || [];
        } catch (parseError) {
          console.error("Error parsing Google AI response:", parseError);
          // Try OpenAI as fallback
          const fallbackResponse = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.2,
            max_tokens: 1500,
            response_format: { type: "json_object" },
          });
          
          rawResponse = fallbackResponse.choices[0]?.message?.content || '';
          const parsed = JSON.parse(rawResponse);
          references = parsed.references || [];
        }
      } else {
        throw new Error(`Unsupported model provider: ${model.provider}`);
      }
    } catch (error) {
      console.error("Error getting references:", error);
      
      // Create fallback references if needed
      if (references.length === 0) {
        references = createFallbackReferences(metadata);
      }
    }
    
    // Post-process the references
    references = postProcessReferences(references, metadata);
    
    // Send the response
    return res.status(200).json({
      references,
      rawPrompt,
      rawResponse,
      citationStyle: 'chicago',
      modelUsed: model.name,
      processingTime: Date.now() - startTime
    });
  } catch (error) {
    console.error('References generation error:', error);
    
    // Always return something useful, even on error
    const fallbackReferences = createFallbackReferences(req.body.metadata);
    
    return res.status(200).json({ 
      references: fallbackReferences,
      message: 'Using fallback references due to an error',
      error: error instanceof Error ? error.message : 'Unknown error'
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
      importance: 4
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
  const sourceExcerpt = source.length > 1000 ? source.substring(0, 1000) + '...' : source;

  return `Generate 5 highly relevant scholarly references for understanding this primary source.

SOURCE DATE: ${metadata.date}
SOURCE AUTHOR: ${metadata.author}
RESEARCH GOALS: ${metadata.researchGoals}
${metadata.additionalInfo ? `ADDITIONAL CONTEXT: ${metadata.additionalInfo}` : ''}
${perspective ? `ANALYTICAL PERSPECTIVE: ${perspective}` : ''}

PRIMARY SOURCE EXCERPT:
${source.length > 2000 ? source.substring(0, 2000) + '...' : source}

Return a JSON object with this exact structure:
{
  "references": [
    {
      "citation": "Full citation in Chicago style",
      "type": "book" | "journal" | "website" | "other",
      "relevance": "1 sentence explaining why this reference is relevant",
      "reliability": "1 sentence assessing reliability (peer-review status, if its out of date (prior to 1980 may be an issue), what sources it uses)",
      "sourceQuote": "BRIEF quote from the primary source this reference contextualizes",
      "importance": number from 1-5 (5 = most important)
    }
    // 4 more references
  ]
}

Your references must be:
- Real, verifiable scholarly works that actually exist
- Directly relevant to the source
- Include a mix of types (books, journal articles)
- Include reliability assessments noting peer-review status, age, publisher reputation
- Ranked by importance (5 = most important)

DO NOT include any text outside the JSON. Return ONLY valid JSON with no markdown formatting.`;
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
    responseLimit: false,
  },
};