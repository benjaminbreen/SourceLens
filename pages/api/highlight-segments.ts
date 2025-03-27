// pages/api/highlight-segments.ts
// API endpoint for identifying and scoring text segments based on user criteria
// Returns segment positions and relevance scores for highlighting in the UI

import type { NextApiRequest, NextApiResponse } from 'next';
import { OpenAI } from 'openai';
import { Anthropic } from '@anthropic-ai/sdk';
import { getModelById } from '@/lib/models';

// Configure API clients
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Default model to use
const DEFAULT_MODEL = 'gemini-flash';

// Interface for highlighted segments
export interface HighlightedSegment {
  id: number;          // Unique identifier for the segment
  text: string;        // The actual text segment
  startIndex: number;  // Character position where segment starts in original text
  endIndex: number;    // Character position where segment ends in original text
  score: number;       // Relevance score from 0 to 1
  explanation: string; // Brief explanation of why this segment matches
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { 
      content, 
      query, 
      modelId = DEFAULT_MODEL,
      numSegments = 5     // Default to 5 segments
    } = req.body;
    
    // Validate input
    if (!content || !query) {
      return res.status(400).json({ message: 'Missing required fields (content, query)' });
    }
    
    // Get model configuration
    const modelConfig = getModelById(modelId);
    
    // Prepare the prompt for segment identification
    const prompt = buildHighlightPrompt(content, query, numSegments);
    
    // Track raw prompt and response for transparency
    let rawResponse = '';
    
    // Process with selected LLM based on provider
    let segments: HighlightedSegment[] = [];
    
    if (modelConfig.provider === 'openai') {
      console.log(`Using OpenAI model: ${modelConfig.apiModel}`);
      const response = await openai.chat.completions.create({
        model: modelConfig.apiModel,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        response_format: { type: "json_object" },
        max_tokens: 6000,
      });
      
      rawResponse = response.choices[0]?.message?.content || '';
      
      try {
        const parsed = JSON.parse(rawResponse);
        segments = parsed.segments || [];
      } catch (error) {
        console.error('Error parsing JSON response:', error);
        throw new Error('Failed to parse segments from LLM response');
      }
    } else if (modelConfig.provider === 'anthropic') {
      console.log(`Using Anthropic model: ${modelConfig.apiModel}`);
      const response = await anthropic.messages.create({
        model: modelConfig.apiModel,
        max_tokens: 6000,
        system: "You are a JSON API that returns valid JSON only, with no additional text.",
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
      });
      
      rawResponse = response.content[0]?.type === 'text' 
        ? response.content[0].text 
        : '';
      
      try {
        // Clean the response to ensure valid JSON
        const cleanedJson = rawResponse.trim()
          .replace(/^```json\s*|\s*```$/g, '') // Remove JSON fences if present
          .replace(/^```\s*|\s*```$/g, '')     // Remove other fences if present
          .trim();
        
        const parsed = JSON.parse(cleanedJson);
        segments = parsed.segments || [];
      } catch (error) {
        console.error('Error parsing Claude response:', error);
        throw new Error('Failed to parse segments from Claude response');
      }
    } else {
      // Default to OpenAI for now if we don't recognize the provider
      console.log(`Using default OpenAI for unknown provider`);
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        response_format: { type: "json_object" },
        max_tokens: 6000,
      });
      
      rawResponse = response.choices[0]?.message?.content || '';
      
      try {
        const parsed = JSON.parse(rawResponse);
        segments = parsed.segments || [];
      } catch (error) {
        console.error('Error parsing JSON response:', error);
        throw new Error('Failed to parse segments from LLM response');
      }
    }
    
    // Normalize scores to ensure they're between 0 and 1
    segments = normalizeSegments(segments);
    
    // Sort segments by score (highest first)
    segments.sort((a, b) => b.score - a.score);
    
    // Limit to requested number of segments
    if (segments.length > numSegments) {
      segments = segments.slice(0, numSegments);
    }
    
    // Add IDs to segments (required for proper highlighting)
    const segmentsWithIds = segments.map((segment, index) => ({
      ...segment,
      id: index
    }));
    
    // Validate if text segments actually exist in content
    const validatedSegments = segmentsWithIds.filter(segment => {
      // Only keep segments whose text actually appears in the content
      return content.includes(segment.text);
    });
    
    console.log(`Found ${validatedSegments.length} valid segments out of ${segments.length} total`);
    
    return res.status(200).json({
      segments: validatedSegments,
      query,
      totalSegments: validatedSegments.length,
      rawPrompt: prompt,
      rawResponse
    });
    
  } catch (error) {
    console.error('Highlight segments error:', error);
    return res.status(500).json({ 
      message: 'Error processing highlight request', 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

function buildHighlightPrompt(
  content: string, 
  query: string,
  numSegments: number
): string {
  return `Identify the top ${numSegments} text segments in the following content that best match this query: "${query}"

CONTENT:
${content}

For each segment:
1. Extract the exact text (try to make each segment 1-3 sentences, or roughly 20-100 words)
2. Find the start and end character position of the segment in the original text
3. Assign a relevance score from 0 to 1 (with 1 being most relevant)
4. Provide a brief explanation (1 sentence) of why this segment is relevant

Return a valid JSON object with this exact structure:
{
  "segments": [
    {
      "text": "The exact text segment from the content",
      "startIndex": 123, 
      "endIndex": 234,
      "score": 0.95,
      "explanation": "Brief explanation of why this segment is relevant" 
    },
    ...
  ]
}

IMPORTANT:
- Ensure the "text" is the exact text from the content, including original spacing
- The startIndex and endIndex must be accurate character positions in the original content
- Make sure each segment is truly relevant to the query
- Don't include overlapping segments
- Scores should be relative, with the most relevant segment having the highest score
- Include ONLY this JSON in your response, no other text`;
}

// Normalize scores to ensure they're between 0 and 1
function normalizeSegments(segments: HighlightedSegment[]): HighlightedSegment[] {
  // Find min and max scores
  let minScore = 1;
  let maxScore = 0;
  
  for (const segment of segments) {
    minScore = Math.min(minScore, segment.score);
    maxScore = Math.max(maxScore, segment.score);
  }
  
  // If all scores are the same, set them all to 1
  if (maxScore === minScore) {
    return segments.map(segment => ({
      ...segment,
      score: 1
    }));
  }
  
  // Normalize the scores
  return segments.map(segment => ({
    ...segment,
    score: (segment.score - minScore) / (maxScore - minScore)
  }));
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
    responseLimit: false,
  },
};