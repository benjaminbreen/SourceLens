// pages/api/extract-info.ts
// API for extracting structured lists and information from documents

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

// Maximum response token length for extraction
const MAX_TOKENS = 16000; // Set high to accommodate large lists

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
      modelId = 'gpt-4o-mini', // Default to most capable model for extraction
      format = 'list' // Default format (list, table, etc.)
    } = req.body;
    
    // Basic validation
    if (!content || !query) {
      return res.status(400).json({ message: 'Missing required fields (content, query)' });
    }
    
    // Trim content if it's too long to process efficiently
    const contentLength = content.length;
    let processedContent = content;
    let contentStrategy = 'full';
    
    // For extremely large documents, we need to be selective
    if (contentLength > 100000) { // ~70 pages of text
      contentStrategy = 'chunked';
      console.log(`Content too large (${contentLength} chars), processing in chunks`);
      // We'll process this document in sections
      processedContent = prepareChunkedProcessing(content);
    }
    
    // Get model configuration
    const model = getModelById(modelId);
    console.log(`Using ${model.name} for extraction`);
    
    // Build the prompt for information extraction
    const prompt = buildExtractionPrompt(processedContent, query, format, contentStrategy);
    
    let extractedInfo = '';
    let rawResponse = '';
    
    // Process with the selected model
    if (model.provider === 'anthropic') {
      const response = await anthropic.messages.create({
        model: model.apiModel,
        max_tokens: MAX_TOKENS,
        system: "You are an expert at extracting structured information from documents. You always return clear, comprehensive lists focused exactly on what was requested. You are thorough and do not miss any relevant items. Format your response appropriately.",
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2, // Keep temperature low for reliable extraction
      });
      
      rawResponse = response.content[0]?.type === 'text' 
        ? response.content[0].text 
        : '';
      extractedInfo = rawResponse;
    } else {
      // Default to OpenAI
      const response = await openai.chat.completions.create({
        model: model.apiModel,
        messages: [
          { 
            role: 'system', 
            content: "You are an expert at extracting structured information from documents. You always return clear, comprehensive lists focused exactly on what was requested. You are thorough and do not miss any relevant items. Format your response appropriately."
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.2, // Keep temperature low for reliable extraction
        max_tokens: MAX_TOKENS,
      });
      
      rawResponse = response.choices[0]?.message?.content || '';
      extractedInfo = rawResponse;
    }
    
    // Post-process the extracted information
    const processedInfo = processExtractedInfo(extractedInfo, format);
    
    return res.status(200).json({
      extractedInfo: processedInfo,
      contentStrategy,
      contentLength,
      format,
      rawResponse
    });
    
  } catch (error) {
    console.error('Information extraction error:', error);
    return res.status(500).json({ 
      message: 'Error extracting information', 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Prepare content for chunked processing
function prepareChunkedProcessing(content: string): string {
  // Simple chunking strategy - take beginning, middle and end sections
  // This can be refined based on specific document types
  const lines = content.split('\n');
  const chunkSize = 10000; // Characters per chunk
  
  if (lines.length < 100) {
    // If not many lines, just reduce the overall content
    return content.substring(0, 60000);
  }
  
  // Take beginning chunk
  const beginChunk = lines.slice(0, lines.length / 5).join('\n');
  
  // Take middle chunk
  const midStartIndex = Math.floor(lines.length * 0.4);
  const midEndIndex = Math.floor(lines.length * 0.6);
  const middleChunk = lines.slice(midStartIndex, midEndIndex).join('\n');
  
  // Take end chunk
  const endChunk = lines.slice(Math.floor(lines.length * 0.8)).join('\n');
  
  // Combine chunks with markers
  return `
[BEGINNING OF DOCUMENT]
${beginChunk.substring(0, chunkSize)}

[MIDDLE OF DOCUMENT]
${middleChunk.substring(0, chunkSize)}

[END OF DOCUMENT]
${endChunk.substring(0, chunkSize)}

[NOTE: This document has been sampled from beginning, middle, and end sections due to its large size.]
`;
}

// Build prompt for information extraction
function buildExtractionPrompt(content: string, query: string, format: string, contentStrategy: string): string {
  // Base template
  let prompt = `Please extract the following information from this document: ${query}

DOCUMENT CONTENT:
${content}

`;

  // Format-specific instructions
  if (format === 'list') {
    prompt += `
Provide your answer as a numbered list of items. Be extremely thorough and comprehensive. Use react markdown including markdown headings to structure the data in an intuitive way, for instance, you might use a ## heading and then include information field names in **bold**. 
Include ALL instances that match the query criteria from the document.
For each item, include any relevant details (like descriptions, context, page references, etc.) when available.
Do not include duplicates, but DO include variants or related forms that might be significant.
ORDER the list by first appearance in the document.
If asked to augment the data in the source with your own knowledge, you may do so. 

If the document was too large and you only saw samples, note any limitations in your analysis.
`;
  } else if (format === 'table') {
    prompt += `
Provide your answer as a structured table with appropriate columns.
Include ALL instances that match the query criteria from the document.
Include relevant metadata for each item when available.
Do not include duplicates, but DO include variants or related forms that might be significant.
`;
  }

  // Additional instructions for chunked content
  if (contentStrategy === 'chunked') {
    prompt += `
IMPORTANT: This document was too large to process in full, so you are only seeing samples from the beginning, middle, and end. 
Your extraction might be incomplete. Please indicate this limitation clearly in your response and only extract information from the provided sections.
`;
  }

  return prompt;
}

// Post-process the extracted information based on format
function processExtractedInfo(extractedInfo: string, format: string): any {
  if (format === 'list') {
    // For list format, minimal processing needed
    return extractedInfo;
  } else if (format === 'table') {
    // For table format, could convert to structured JSON
    // This is a simplified approach - in production, you'd want more robust parsing
    try {
      // Try to parse if returned as JSON
      if (extractedInfo.trim().startsWith('{') || extractedInfo.trim().startsWith('[')) {
        return JSON.parse(extractedInfo);
      }
      
      // Otherwise, return as-is
      return extractedInfo;
    } catch (e) {
      console.warn('Failed to parse table as JSON:', e);
      return extractedInfo;
    }
  }
  
  // Default: return as-is
  return extractedInfo;
}