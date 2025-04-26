// pages/api/topic-distribution.ts
// API for analyzing the distribution of topics throughout a document
// Returns positions, example quotes, and frequency data for visualization

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

const googleAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

// Default model - Gemini Flash is ideal for this task
const DEFAULT_MODEL = 'gemini-flash-lite';

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
      topics,
      query,
      modelId = DEFAULT_MODEL
    } = req.body;
    
    // Basic validation
    if (!content) {
      return res.status(400).json({ message: 'Missing document content' });
    }
    
    if (!topics || !Array.isArray(topics) || topics.length === 0) {
      return res.status(400).json({ message: 'Topics array is required' });
    }
    
    if (topics.length > 6) {
      return res.status(400).json({ message: 'Maximum of 6 topics allowed' });
    }
    
    // Get model configuration
    let model;
    try {
      model = getModelById(modelId);
    } catch (error) {
      console.warn(`Model ID ${modelId} not found, using ${DEFAULT_MODEL}`);
      model = getModelById(DEFAULT_MODEL);
    }
    
    console.log(`Using ${model.name} for topic distribution analysis of ${topics.length} topics`);
    
    // Build the prompt for topic distribution analysis
    const prompt = buildTopicDistributionPrompt(content, topics, query);
    
    let rawResponse = '';
    let topicData;
    
    // Process with the selected model
    if (model.provider === 'anthropic') {
      console.log(`Using Anthropic model: ${model.apiModel}`);
      const response = await anthropic.messages.create({
        model: model.apiModel,
        max_tokens: 10000,
        system: "You are an expert at analyzing text documents and identifying topical distributions. You output results in clean, valid JSON format only.",
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
      });
      
      rawResponse = response.content[0]?.type === 'text' 
        ? response.content[0].text 
        : '';
      
      // Extract JSON from response
      try {
        const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          topicData = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (parseError) {
        console.error("Error parsing Claude response:", parseError);
        throw new Error('Failed to parse LLM response as JSON');
      }
    } else if (model.provider === 'google') {
      // Google Gemini model processing
      console.log(`Using Google model: ${model.apiModel}`);
      const genModel = googleAI.getGenerativeModel({ model: model.apiModel });
      
      const result = await genModel.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 10000,
        }
      });
      
      rawResponse = result.response.text();
      
      // Extract JSON from response
      try {
        const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          topicData = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (parseError) {
        console.error("Error parsing Google AI response:", parseError);
        throw new Error('Failed to parse LLM response as JSON');
      }
    } else {
      // OpenAI
      console.log(`Using OpenAI model: ${model.apiModel}`);
      const response = await openai.chat.completions.create({
        model: model.apiModel,
        messages: [
          { 
            role: 'system', 
            content: "You are an expert at analyzing text documents and identifying topical distributions. You output results in clean, valid JSON format only."
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.1,
        response_format: { type: "json_object" },
        max_tokens: 4000,
      });
      
      rawResponse = response.choices[0]?.message?.content || '';
      
      try {
        topicData = JSON.parse(rawResponse);
      } catch (parseError) {
        console.error("Error parsing OpenAI response:", parseError);
        throw new Error('Failed to parse LLM response as JSON');
      }
    }
    
    // Validate the result
    if (!topicData || !topicData.topics || !topicData.distributions) {
      throw new Error('Invalid response format from LLM');
    }
    
    // Normalize the data for the frontend
    const normalizedData = normalizeTopicData(topicData, topics, content.length);
    
    return res.status(200).json({
      topicData: normalizedData,
      rawResponse,
      rawPrompt: prompt
    });
    
  } catch (error) {
    console.error('Topic distribution analysis error:', error);
    return res.status(500).json({ 
      message: 'Error analyzing topic distribution', 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Build prompt for topic distribution analysis
 */
function buildTopicDistributionPrompt(content: string, topics: string[], query?: string): string {
  // Truncate content if necessary to fit within token limits
  const maxLength = 15000; // Gemini Flash can handle more but we'll be conservative
  const truncatedContent = content.length > maxLength 
    ? content.substring(0, maxLength) + "... [content truncated]" 
    : content;
  
  return `Analyze the following document to identify the distribution of specific topics throughout the text.

DOCUMENT:
${truncatedContent}

TOPICS TO ANALYZE:
${topics.join('\n')}

${query ? `CONTEXT: ${query}` : ''}

For each topic:
1. Identify where in the document this topic appears
2. Calculate relative positions as character indices within the document (position 0 is the start, position ${content.length - 1} is the end)
3. Make sure to identify instances throughout the entire document, not just concentrated at the beginning
4. Extract a representative quote for each instance (keep quotes short, under 15 words)
5. Count how many times each topic appears

The positions should represent the actual character index in the document where each topic appears, allowing visualization of their distribution across the full text.

Return the results as a JSON object with this exact structure:
{
  "topics": ["topic1", "topic2", "..."],
  "distributions": [
    {
      "topic": "topic1",
      "positions": [23, 4567, 8901, ...],
      "examples": {
        "23": "Example quote from position 23",
        "4567": "Example quote from position 4567",
        "8901": "Example quote from position 8901"
      },
      "count": 3
    },
    {
      "topic": "topic2",
      "positions": [1234, 5678, ...],
      "examples": {
        "1234": "Example quote from position 1234",
        "5678": "Example quote from position 5678"
      },
      "count": 2
    }
  ],
  "totalCounts": {
    "topic1": 3,
    "topic2": 2,
    "...": 0
  }
}

Focus on semantic matches for topics, not just exact word matches. For example, if analyzing "Economy", include sentences about trade, markets, finances, commerce, etc. Only include clear examples of the topic, not tangential mentions. Ensure examples are representative quotes from the original text. BE SURE TO INCLUDE INSTANCES THROUGHOUT THE ENTIRE TEXT, WITH APPROPRIATE POSITION VALUES THAT ACCURATELY REFLECT THEIR LOCATION IN THE DOCUMENT.`;
}

/**
 * Normalize the topic data for consistent frontend display
 */
function normalizeTopicData(data: any, originalTopics: string[], documentLength: number) {
  // Make sure we have all original topics even if some have no occurrences
  const normalizedData = {
    topics: originalTopics,
    distributions: [] as any[],
    documentLength: documentLength,
    totalCounts: {} as Record<string, number>
  };
  
  // Normalize each topic's data
  originalTopics.forEach(topic => {
    // Find matching topic in data
    const topicData = data.distributions.find((d: any) => d.topic.toLowerCase() === topic.toLowerCase());
    
    if (topicData) {
      // Ensure positions are integers
      const positions = topicData.positions.map((p: any) => parseInt(p));
      
      // Add to normalized distributions
      normalizedData.distributions.push({
        topic,
        positions,
        examples: topicData.examples || {},
        count: positions.length
      });
      
      // Add to total counts
      normalizedData.totalCounts[topic] = positions.length;
    } else {
      // Add empty data for topics with no occurrences
      normalizedData.distributions.push({
        topic,
        positions: [],
        examples: {},
        count: 0
      });
      
      normalizedData.totalCounts[topic] = 0;
    }
  });
  
  return normalizedData;
}

// Allow larger request bodies
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
    responseLimit: false,
  },
};