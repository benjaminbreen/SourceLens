// pages/api/suggest-extraction.ts
// API endpoint for suggesting extraction fields and structure based on document content analysis
// Uses AI to recommend the most appropriate list type, fields, and format for data extraction

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

// Default model changed to gemini-flash for better handling of large documents
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
      modelId = DEFAULT_MODEL // Using gemini-flash as default
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
    
    console.log(`Using ${model.name} for extraction suggestions`);
    
    // Build prompt for generating extraction suggestions
    const prompt = buildSuggestionPrompt(content);
    
    // Track raw prompt and response for transparency
    let rawPrompt = prompt;
    let rawResponse = '';
    
    // Process with selected LLM based on provider
    let suggestedConfig;
    
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
        suggestedConfig = JSON.parse(rawResponse);
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
          suggestedConfig = JSON.parse(jsonMatch[0]);
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
        
        suggestedConfig = JSON.parse(cleanedJson);
      } catch (parseError) {
        console.error("Error parsing Claude response:", parseError);
        throw new Error('Failed to parse LLM response as JSON');
      }
    }
    
    // Validate the extracted configuration
    if (!suggestedConfig || !suggestedConfig.listType || !Array.isArray(suggestedConfig.fields) || suggestedConfig.fields.length === 0) {
      throw new Error('LLM response did not include the expected extraction configuration');
    }
    
    return res.status(200).json({
      listType: suggestedConfig.listType,
      fields: suggestedConfig.fields,
      format: suggestedConfig.format || 'table',
      explanation: suggestedConfig.explanation || '',
      prompt: rawPrompt,
      rawResponse: rawResponse,
      modelUsed: model.name
    });
    
  } catch (error) {
    console.error('Extraction suggestion error:', error);
    return res.status(500).json({ 
      message: 'Error generating extraction suggestions', 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Build prompt for suggesting extraction configuration
 * @param content - The document content to analyze
 * @returns A prompt string designed to get high-quality extraction suggestions
 */
function buildSuggestionPrompt(content: string): string {
  // Limit content length to avoid token limits while preserving enough context
  const maxLength = 8000; // Increased for gemini-flash which handles larger contexts
  const truncatedContent = content.length > maxLength 
    ? content.substring(0, maxLength) + "..." 
    : content;
  
  return `Analyze the following document and suggest the most appropriate extraction configuration for creating a structured table or list. 

DOCUMENT:
${truncatedContent}

Based on the content of this document, determine:
1. What type of list would be most valuable, interesting, or enlightening to extract (e.g., people, events, terms, statistics, etc.)
2. What specific fields should be extracted for each item in the list? Make the first 2-3 columns rational but the last column surprising and even delightful. 
3. Whether the data would be better presented as a list or table format

Return a JSON object with this exact structure:
{
  "listType": "A clear description of what should be extracted",
  "fields": ["Field1", "Field2", "Field3", ...],
  "format": "table" or "list",
  "explanation": "A brief explanation of why this extraction would be valuable"
}

Choose the most insightful and useful extraction that would help a researcher understand key aspects of this document. Be specific about what to extract, not generic. Aim for 5-10 fields that reveal meaningful patterns in the source. The fields should be concise, clear, and easy to understand.

An example: if the source is a list of medicines or natural products, you would select "table" as format, listType would be "remedies [or natural products] in source and their concordance" and the fields could be something like "name in source" "english name" "latin name" "place of origin" "non-western use?" "if yes, give brief quote specifying" "medical use (2-3 words)" "fungus, plant, mineral, or other?" `;
}

// Allow for larger request bodies to handle substantial documents
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
    responseLimit: false,
  },
};