// pages/api/connections.ts
// API endpoint for generating connections between a source and related entities
// Uses Gemini model to identify relationships and create network graph nodes

import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { v4 as uuidv4 } from 'uuid';
import { getModelById } from '@/lib/models';

// --- Basic Error Handling Class ---
class ApiError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ApiError';
  }
}

// Configure API client
if (!process.env.GOOGLE_API_KEY) {
  console.error("FATAL ERROR: GOOGLE_API_KEY environment variable is not set.");
}
const googleAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

// Node types constants
const NODE_TYPES = {
  PERSON: 'person',
  EVENT: 'event',
  CONCEPT: 'concept',
  PLACE: 'place',
  WORK: 'work',
  ORGANIZATION: 'organization',
  FACT: 'fact',
  SOURCE: 'source'
};

// Emoji mapping for node types
const NODE_TYPE_EMOJIS: { [key: string]: string } = {
  person: '👤',
  event: '🗓️',
  concept: '💡',
  place: '📍',
  work: '📚',
  organization: '🏛️',
  fact: '📋',
  source: '📄'
};

const DEFAULT_MODEL_ID = 'gemini-flash-lite';

// --- Main API Handler ---
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log(`[${new Date().toISOString()}] Received POST /api/connections request.`);

  if (req.method !== 'POST') {
    console.warn(`[${new Date().toISOString()}] Method Not Allowed: ${req.method}`);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const {
      source,
      metadata,
      modelId = DEFAULT_MODEL_ID,
      parentNodeId = 'source' // default fallback
    } = req.body;

    console.log(`[${new Date().toISOString()}] Validating input... Model ID: ${modelId}`);
    if (!source || !metadata || typeof source !== 'string') {
       console.error(`[${new Date().toISOString()}] Validation Failed: Missing or invalid source/metadata. Source type: ${typeof source}, Metadata: ${!!metadata}`);
      return res.status(400).json({ message: 'Missing required fields: source (string) and metadata (object) are required.' });
    }
     if (!process.env.GOOGLE_API_KEY) {
       console.error(`[${new Date().toISOString()}] Server Configuration Error: GOOGLE_API_KEY is not set.`);
       return res.status(500).json({ message: 'Server configuration error.' });
     }

    const modelConfig = getModelById(modelId);
    console.log(`[${new Date().toISOString()}] Using model config:`, modelConfig);

    if (modelConfig.provider !== 'google') {
      console.warn(`[${new Date().toISOString()}] Unsupported provider: ${modelConfig.provider}`);
      return res.status(400).json({ message: 'Only Google models are supported for connections at this time.' });
    }

    console.log(`[${new Date().toISOString()}] Preparing source node and prompt.`);
    const parentId = req.body.parentNodeId || 'source';

    const sourceNode = {
      id: parentId,
      name: metadata.title || metadata.author || 'Primary Source',
      type: NODE_TYPES.SOURCE,
      metadata: { ...metadata, emoji: metadata.documentEmoji || NODE_TYPE_EMOJIS.source },
      x: 0, y: 0, fx: 0, fy: 0,
      color: '#6366F1', size: 25
    };


    const truncatedSource = source.length > 8000 ? source.substring(0, 8000) + '... [content truncated]' : source;
    const prompt = `
Analyze the provided primary source text and generate a network of connections to related entities.

PRIMARY SOURCE INFO:
Title: ${metadata.title || 'N/A'}
Author: ${metadata.author || 'N/A'}
Date: ${metadata.date || 'N/A'}
Context: ${metadata.researchGoals || metadata.additionalInfo || 'N/A'}

SOURCE TEXT (Excerpt):
${truncatedSource}

INSTRUCTIONS:
1. Identify 8 to 10 key entities (people, events, concepts, places, works, organizations, specific facts) explicitly mentioned or strongly implicitly related to the source text and its context. Focus on diverse and insightful connections.
2. For each entity, provide the following information:
   - name: Concise name of the entity.
   - type: ONE of ["person", "event", "concept", "place", "work", "organization", "fact"].
   - relationship: "direct" (mentioned in text) or "indirect" (related contextually/historically).
   - distance: Integer 1-5 (1 = core topic, 5 = tangential).
   - description: 2-3 sentences explaining the connection to the source.
   - emoji: A single, relevant emoji.
   - year: Associated year or period (e.g., "1776", "c. 1850s", "Late Antiquity"). Use "N/A" if not applicable.
   - location: Associated place (e.g., "Paris", "Roman Empire"). Use "N/A" if not applicable.
   - wikipediaTitle: The exact corresponding English Wikipedia page title (use name if unsure or no page exists).
   - field: Primary academic field (e.g., "History of Science", "Literary Theory", "Art History").

OUTPUT FORMAT:
Respond ONLY with a valid JSON array containing the 8-10 connection objects. Do not include any explanatory text, markdown formatting (like \`\`\`json), or introduction/conclusion.

Example object:
{
  "name": "Isaac Newton",
  "type": "person",
  "relationship": "indirect",
  "distance": 2,
  "description": "Newton's work on optics and gravity provides the scientific context for discussions of light and celestial mechanics in the period.",
  "emoji": "🍎",
  "year": "1643-1727",
  "location": "England",
  "wikipediaTitle": "Isaac Newton",
  "field": "History of Science"
}
`;

    console.log(`[${new Date().toISOString()}] Calling Google AI model (${modelConfig.apiModel})... Prompt length: ${prompt.length} chars.`);
    const model = googleAI.getGenerativeModel({
        model: modelConfig.apiModel,
        safetySettings: [
            { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        ],
    });

    const generationStartTime = Date.now();
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.25,
        maxOutputTokens: 8192,
        responseMimeType: "application/json",
      }
    });
    const generationEndTime = Date.now();

    const rawResponseText = result.response.text();
    console.log(`[${new Date().toISOString()}] Google AI response received (${(generationEndTime - generationStartTime)}ms). Raw text length: ${rawResponseText?.length ?? 0}`);
    console.log(`[${new Date().toISOString()}] Raw Response (Preview): ${rawResponseText?.substring(0, 500) ?? 'N/A'}${rawResponseText?.length > 500 ? '...' : ''}`);

    if (!rawResponseText || result.response.promptFeedback?.blockReason) {
      const blockReason = result.response.promptFeedback?.blockReason;
      const safetyRatings = result.response.promptFeedback?.safetyRatings;
      console.error(`[${new Date().toISOString()}] Google AI Error: Response blocked or empty. Reason: ${blockReason || 'Empty Response'}. Safety Ratings:`, safetyRatings);
      throw new ApiError(`Content generation failed. Reason: ${blockReason || 'Empty Response'}`, 500);
    }

    let generatedConnections;
    const jsonStr = rawResponseText.trim();
    console.log(`[${new Date().toISOString()}] Attempting to parse JSON...`);
    try {
      generatedConnections = JSON.parse(jsonStr);

      if (!Array.isArray(generatedConnections)) {
        console.error(`[${new Date().toISOString()}] Parsed result is not an array. Type: ${typeof generatedConnections}`);
        throw new Error('Parsed response is not a valid JSON array.');
      }
      console.log(`[${new Date().toISOString()}] Successfully parsed ${generatedConnections.length} connections.`);

      const processedConnections = generatedConnections.map((conn: any, index: number) => {
        const id = uuidv4();
        const type = Object.values(NODE_TYPES).includes(conn.type) ? conn.type : NODE_TYPES.CONCEPT;
        const relationship = ['direct', 'indirect'].includes(conn.relationship) ? conn.relationship : 'indirect';
        const distance = typeof conn.distance === 'number' && conn.distance >= 1 && conn.distance <= 5 ? conn.distance : 3;
        const name = conn.name || `Connection ${index + 1}`;
        const description = conn.description || 'No description provided.';
        const emoji = conn.emoji || NODE_TYPE_EMOJIS[type] || '🔗';
        const year = conn.year || 'N/A';
        const location = conn.location || 'N/A';
        const wikipediaTitle = conn.wikipediaTitle || name;
        const field = conn.field || 'General';

        let color = '#6B7280';
        switch (type) {
          case NODE_TYPES.PERSON: color = '#EC4899'; break;
          case NODE_TYPES.EVENT: color = '#F97316'; break;
          case NODE_TYPES.CONCEPT: color = '#8B5CF6'; break;
          case NODE_TYPES.PLACE: color = '#10B981'; break;
          case NODE_TYPES.WORK: color = '#3B82F6'; break;
          case NODE_TYPES.ORGANIZATION: color = '#F59E0B'; break;
          case NODE_TYPES.FACT: color = '#06B6D4'; break;
        }
        const size = 22 - (distance * 2.5);

        return {
          id, name, type, relationship, distance, description, emoji,
          year, location, wikipediaTitle, field, color, size,
        };
      });

 const links = processedConnections.map(conn => ({
   source: sourceNode.id,
   target: conn.id,
      distance: conn.distance,
      relationship: conn.relationship,
      type: conn.type
    }));


      const finalResponseData = {
        sourceNode: { ...sourceNode, fx: null, fy: null }, // Unfix source node position
        connections: processedConnections,
        links
      };

      console.log(`[${new Date().toISOString()}] Successfully processed connections. Sending ${finalResponseData.connections.length} nodes and ${finalResponseData.links.length} links.`);
      return res.status(200).json(finalResponseData);

    } catch (parseError) {
      console.error(`[${new Date().toISOString()}] JSON Parsing Error:`, parseError);
      console.error(`[${new Date().toISOString()}] Raw response that failed parsing:`, jsonStr);
      throw new ApiError('Failed to parse connections from AI response.', 500);
    }
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Connections API Error:`, error);
    const statusCode = error instanceof ApiError ? error.statusCode : 500;
    const message = error instanceof Error ? error.message : 'An unknown error occurred.';
    return res.status(statusCode).json({
      message: 'Error generating connections',
      error: message
    });
  }
}