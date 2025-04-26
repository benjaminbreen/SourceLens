// pages/api/suggest-topics.ts
// API endpoint for suggesting interesting topics to analyze in a document
// Uses AI to recommend topics based on document content and genre

import type { NextApiRequest, NextApiResponse } from 'next';
import { OpenAI } from 'openai';
import { Anthropic } from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getModelById } from '@/lib/models';

// Configure API clients
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Default model for topic suggestions
const DEFAULT_MODEL = 'gemini-flash';

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
      modelId = DEFAULT_MODEL
    } = req.body;
    
    // Validate input
    if (!content) {
      return res.status(400).json({ message: 'Missing content' });
    }
    
    // Get model configuration
    let model;
    try {
      model = getModelById(modelId);
    } catch (error) {
      console.warn(`Model ID ${modelId} not found, using ${DEFAULT_MODEL}`);
      model = getModelById(DEFAULT_MODEL);
    }
    
    console.log(`Using ${model.name} for topic suggestions`);
    
    // Build prompt for generating topic suggestions
    const prompt = buildTopicSuggestionPrompt(content);
    
    // Track raw prompt and response for transparency
    let rawPrompt = prompt;
    let rawResponse = '';
    
    // Process with selected LLM based on provider
    let suggestedTopics;
    
    if (model.provider === 'openai') {
      const response = await openai.chat.completions.create({
        model: model.apiModel,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 1000,
        response_format: { type: "json_object" },
      });
      
      rawResponse = response.choices[0]?.message?.content || '';
      
      try {
        suggestedTopics = JSON.parse(rawResponse);
      } catch (parseError) {
        console.error("Error parsing OpenAI response:", parseError);
        throw new Error('Failed to parse LLM response as JSON');
      }
    } else if (model.provider === 'google') {
      // Add Google AI handling
      const googleAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');
      const geminiModel = googleAI.getGenerativeModel({ model: model.apiModel });
      
      const geminiResponse = await geminiModel.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 1000,
        },
      });
      
      rawResponse = geminiResponse.response.text();
      
      try {
        // Extract JSON from response
        const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          suggestedTopics = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (parseError) {
        console.error("Error parsing Google AI response:", parseError);
        throw new Error('Failed to parse LLM response as JSON');
      }
    } else {
      // Default to Anthropic/Claude
      const response = await anthropic.messages.create({
        model: model.apiModel,
        system: "You are a JSON API that returns valid JSON only, with no text outside the JSON.",
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 1000,
      });
      
      rawResponse = response.content[0]?.type === 'text' 
        ? response.content[0].text 
        : '';
      
      try {
        // Try to parse directly or extract JSON if wrapped in code blocks
        const cleanedJson = rawResponse.trim()
          .replace(/^```json\s*|\s*```$/g, '') // Remove JSON fences
          .replace(/^```\s*|\s*```$/g, '')     // Remove other fences
          .trim();
        
        suggestedTopics = JSON.parse(cleanedJson);
      } catch (parseError) {
        console.error("Error parsing Claude response:", parseError);
        throw new Error('Failed to parse LLM response as JSON');
      }
    }
    
    // Validate the extracted configuration
    if (!suggestedTopics || !Array.isArray(suggestedTopics.topics) || suggestedTopics.topics.length === 0) {
      throw new Error('LLM response did not include the expected topic suggestions');
    }
    
    // Make sure we have no more than 6 topics
    const limitedTopics = suggestedTopics.topics.slice(0, 6);
    
    return res.status(200).json({
      topics: limitedTopics,
      description: suggestedTopics.description || "Topic distribution in document",
      explanation: suggestedTopics.explanation || "",
      prompt: rawPrompt,
      rawResponse: rawResponse,
      modelUsed: model.name
    });
    
  } catch (error) {
    console.error('Topic suggestion error:', error);
    return res.status(500).json({ 
      message: 'Error generating topic suggestions', 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Build prompt for suggesting topics to analyze
 */
function buildTopicSuggestionPrompt(content: string): string {
  // Limit content length to avoid token limits while preserving enough context
  const maxLength = 8000;
  const truncatedContent = content.length > maxLength 
    ? content.substring(0, maxLength) + "..." 
    : content;
  
  return `Analyze the following document and suggest the most interesting topics to visualize in a distribution analysis.

DOCUMENT:
${truncatedContent}

Based on the content of this document, recommend up to 6 topics that would be revealing to visualize as a distribution across the text. These should be key themes, concepts, or subjects that appear multiple times throughout the document and would be interesting to see how they're distributed across the text.

Return a JSON object with this structure:
{
  "topics": ["topic1", "topic2", "topic3", ...],
  "description": "A descriptive title for the topic analysis",
  "explanation": "Brief explanation of why these topics are significant"
}

The topics should:
1. Be clear, single-word or short phrase concepts
2. Represent substantive themes in the document
3. Be balanced in scope (not too broad or too narrow)
4. Be likely to show interesting distribution patterns
5. Include a mix of dominant and secondary themes

For example, a historical document about Chinese philosophy might have topics like "Legalism", "Confucianism", "Economy", "Agriculture", "Huaxia region", and "Ethnic minorities".

Choose topics that will be most revealing of the document's thematic structure when visualized.`;
}

// Allow for larger request bodies
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
    responseLimit: false,
  },
};