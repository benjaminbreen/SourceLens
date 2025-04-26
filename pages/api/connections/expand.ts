// pages/api/connections/expand.ts
// API endpoint for expanding a node by generating sub-connections
// Creates relationships between the selected node and other entities

import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { v4 as uuidv4 } from 'uuid';
import { getModelById } from '@/lib/models';

// Configure API client
if (!process.env.GOOGLE_API_KEY) {
  console.error("FATAL ERROR: GOOGLE_API_KEY environment variable is not set.");
}
const googleAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

// Node types
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

// Default model for connections
const DEFAULT_MODEL_ID = 'gemini-1.5-flash-latest';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log(`[${new Date().toISOString()}] Received POST /api/connections/expand request.`);

  if (req.method !== 'POST') {
    console.warn(`[${new Date().toISOString()}] Method Not Allowed: ${req.method}`);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { 
      sourceNode, 
      originalSource,
      existingConnections = [],
      graphData = null,
      modelId = DEFAULT_MODEL_ID
    } = req.body;
    
    console.log(`[${new Date().toISOString()}] Validating input...`);
    
    // Basic validation
    if (!sourceNode || !originalSource) {
      console.error(`[${new Date().toISOString()}] Missing required fields: sourceNode or originalSource`);
      return res.status(400).json({ message: 'Missing required fields: sourceNode and originalSource are required' });
    }
    
    if (!process.env.GOOGLE_API_KEY) {
      console.error(`[${new Date().toISOString()}] Server Configuration Error: GOOGLE_API_KEY is not set.`);
      return res.status(500).json({ message: 'Server configuration error.' });
    }
    
    // Get model configuration
    const modelConfig = getModelById(modelId);
    console.log(`[${new Date().toISOString()}] Using model config:`, modelConfig);
    
    // Only support Google models for now
    if (modelConfig.provider !== 'google') {
      console.warn(`[${new Date().toISOString()}] Unsupported provider: ${modelConfig.provider}`);
      return res.status(400).json({ 
        message: 'Only Google models are supported for connections at this time' 
      });
    }
    
    console.log(`[${new Date().toISOString()}] Expanding connections for ${sourceNode.name} using ${modelConfig.apiModel}`);
    
    // Collect existing connection names to avoid duplicates
    let existingConnectionNames: string[] = [];
    
    // Handle both data formats (graphData object or flat connections array)
    if (graphData && graphData.connections) {
      existingConnectionNames = graphData.connections.map((c: any) => c.name);
    } else if (Array.isArray(existingConnections)) {
      existingConnectionNames = existingConnections.map((c: any) => c.name);
    }
    
    console.log(`[${new Date().toISOString()}] Existing connections: ${existingConnectionNames.length}`);
    
    // Prepare prompt for connection expansion
    const prompt = `
Analyze the provided concept/entity related to a primary source and generate further connections from it.

PRIMARY SOURCE INFO:
Title: ${originalSource.metadata?.title || 'Untitled Source'}
Author: ${originalSource.metadata?.author || 'Unknown Author'}
Date: ${originalSource.metadata?.date || 'Unknown Date'}
Context: ${originalSource.metadata?.researchGoals || originalSource.metadata?.additionalInfo || 'N/A'}

ENTITY TO EXPAND:
Name: ${sourceNode.name}
Type: ${sourceNode.type}
Description: ${sourceNode.description || 'No description available'}
${sourceNode.year ? `Year/Period: ${sourceNode.year}` : ''}
${sourceNode.location ? `Location: ${sourceNode.location}` : ''}
${sourceNode.field ? `Field: ${sourceNode.field}` : ''}

EXISTING CONNECTIONS:
${existingConnectionNames.join(', ')}

INSTRUCTIONS:
Generate exactly 8 connections to entities related to "${sourceNode.name}". For each connection:
1. Focus on both EXPLICIT connections (directly related to this entity) and IMPLICIT connections (intellectually or historically related in ways that might not be obvious).
2. Avoid any entities that are already in the existing connections list.
3. For each connection, provide:
   - name: A short, clear name for the entity
   - type: One of: ["person", "event", "concept", "place", "work", "organization", "fact"]
   - relationship: Either "direct" (explicitly related) or "indirect" (implicitly related)
   - distance: A number from 1-5 representing how closely related it is (1 = very close, 5 = distantly related)
   - description: A detailed paragraph (3-5 sentences) explaining how this entity relates to ${sourceNode.name}
   - emoji: A single emoji that best represents this entity
   - year: The year or time period associated with this entity
   - location: A geographical location connected to this entity, if applicable
   - wikipediaTitle: The exact title of the Wikipedia page for this entity (simply the entity name if obvious)
   - field: The academic subject area this entity belongs to (e.g., "Political History", "Economics", "Literature")

OUTPUT FORMAT:
Respond ONLY with a valid JSON array containing these connection objects. Do not include any explanatory text, markdown formatting (like \`\`\`json), or introduction/conclusion.

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
    
    // Use the Gemini model to generate connections
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
        temperature: 0.2,
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
      throw new Error(`Content generation failed. Reason: ${blockReason || 'Empty Response'}`);
    }
    
    // Parse the response and clean it up
    let rawConnections;
    try {
      // Extract JSON from the response if needed
      const jsonStr = rawResponseText.trim();
      
      console.log(`[${new Date().toISOString()}] Attempting to parse JSON...`);
      rawConnections = JSON.parse(jsonStr);
      
      // Validate connections format
      if (!Array.isArray(rawConnections)) {
        console.error(`[${new Date().toISOString()}] Parsed result is not an array. Type: ${typeof rawConnections}`);
        throw new Error('Parsed response is not a valid JSON array.');
      }
      
      console.log(`[${new Date().toISOString()}] Successfully parsed ${rawConnections.length} connections.`);
      
      // Process and enhance each connection
      const connections = rawConnections.map((conn: any, index: number) => {
        // Generate a unique ID
        const id = uuidv4();
        
        // Ensure type exists and is valid
        const type = Object.values(NODE_TYPES).includes(conn.type) ? conn.type : NODE_TYPES.CONCEPT;
        
        // Validate relationship
        const relationship = ['direct', 'indirect'].includes(conn.relationship) ? conn.relationship : 'indirect';
        
        // Validate distance
        const distance = typeof conn.distance === 'number' && conn.distance >= 1 && conn.distance <= 5 
          ? conn.distance 
          : 3;
        
        // Calculate position (arrange in a circle around the source node)
        // Default to center of screen if source coordinates aren't available
        const srcX = sourceNode.x || 0;
        const srcY = sourceNode.y || 0;
        
        const angle = (index / rawConnections.length) * 2 * Math.PI;
        const radius = 120 + (distance * 20); // Adjust radius based on distance
        const x = srcX + Math.cos(angle) * radius;
        const y = srcY + Math.sin(angle) * radius;
        
        // Set color based on type
        let color = '#6B7280'; // Default gray
        switch (type) {
          case NODE_TYPES.PERSON: color = '#EC4899'; break; // Pink
          case NODE_TYPES.EVENT: color = '#F97316'; break; // Orange
          case NODE_TYPES.CONCEPT: color = '#8B5CF6'; break; // Violet
          case NODE_TYPES.PLACE: color = '#10B981'; break; // Emerald
          case NODE_TYPES.WORK: color = '#3B82F6'; break; // Blue
          case NODE_TYPES.ORGANIZATION: color = '#F59E0B'; break; // Amber
          case NODE_TYPES.FACT: color = '#06B6D4'; break; // Cyan
        }
        
        // Calculate size based on distance (smaller for more distant nodes)
        const size = Math.max(15, 22 - (distance * 2.5));
        
        // Ensure emoji exists
        const emoji = conn.emoji || NODE_TYPE_EMOJIS[type] || '🔍';
        
        return {
          id,
          name: conn.name || `Connection ${index + 1}`,
          type,
          relationship,
          distance,
          description: conn.description || 'No description provided.',
          emoji,
          year: conn.year || 'N/A',
          location: conn.location || 'N/A',
          wikipediaTitle: conn.wikipediaTitle || conn.name || `Connection ${index + 1}`,
          field: conn.field || 'General',
          color,
          size,
          x,
          y
        };
      });
      
      // Create connection links
      const links = connections.map((conn: any) => ({
        source: sourceNode.id,
        target: conn.id,
        distance: conn.distance,
        relationship: conn.relationship,
        type: conn.type
      }));
      
      console.log(`[${new Date().toISOString()}] Successfully processed connections. Sending ${connections.length} nodes and ${links.length} links.`);
      
      // Return connections and links
      return res.status(200).json({
        connections,
        links
      });
    } catch (parseError) {
      console.error(`[${new Date().toISOString()}] JSON Parsing Error:`, parseError);
      console.error(`[${new Date().toISOString()}] Raw response that failed parsing:`, rawResponseText);
      return res.status(500).json({ 
        message: 'Failed to parse connections from AI response', 
        error: parseError instanceof Error ? parseError.message : 'Unknown error',
        rawResponse: rawResponseText
      });
    }
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Connections expansion error:`, error);
    return res.status(500).json({ 
      message: 'Error expanding connections',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}