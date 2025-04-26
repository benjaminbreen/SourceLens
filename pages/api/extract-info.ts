// pages/api/extract-info.ts
// API for extracting structured lists and information from documents
// Optimized for Gemini Flash with enhanced handling of extremely large documents
// Only chunks data for documents larger than 300k characters

import type { NextApiRequest, NextApiResponse } from 'next';
import { OpenAI } from 'openai';
import { Anthropic } from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getModelById } from '@/lib/models';

// Set default model to Gemini Flash for extraction tasks
const DEFAULT_EXTRACTION_MODEL = 'gemini-flash-lite';

// Configure API clients
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Configure Google client
const googleAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

// Maximum character size before chunking (approximately 400k tokens)
const MAX_FULL_CONTENT_SIZE = 500000;

// Maximum response token length for extraction
const MAX_TOKENS = 31000;

// Helper to get appropriate token limit based on model
function getMaxTokensForModel(model: any): number {
  // Return the model's configured max tokens or a reasonable default if not specified
  return model.maxTokens || MAX_TOKENS;
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
      modelId = DEFAULT_EXTRACTION_MODEL, // Default to Gemini Flash
      format = 'list' // Default format (list, table, etc.)
    } = req.body;
    
    // Basic validation
    if (!content || !query) {
      return res.status(400).json({ message: 'Missing required fields (content, query)' });
    }
    
    // Content processing strategy
    const contentLength = content.length;
    let processedContent = content;
    let contentStrategy = 'full';
    
    // Only chunk extremely large documents
    if (contentLength > MAX_FULL_CONTENT_SIZE) {
      contentStrategy = 'chunked';
      console.log(`Content exceeds ${MAX_FULL_CONTENT_SIZE} chars (${contentLength} chars), processing in chunks`);
      processedContent = prepareChunkedProcessing(content);
      console.log(`Chunked content length: ${processedContent.length} chars`);
    }
    
    // Get model configuration
    let model;
    try {
      model = getModelById(modelId);
    } catch (error) {
      console.warn(`Model ID ${modelId} not found, using ${DEFAULT_EXTRACTION_MODEL}`);
      model = getModelById(DEFAULT_EXTRACTION_MODEL);
    }
    
    console.log(`Using ${model.name} for extraction on ${contentLength} chars of content (strategy: ${contentStrategy})`);
    
    // Build the prompt for information extraction
    const prompt = buildExtractionPrompt(processedContent, query, format, contentStrategy);
    
    let extractedInfo = '';
    let rawResponse = '';
    
    // Process with the selected model
    if (model.provider === 'anthropic') {
      console.log(`Using Anthropic model: ${model.apiModel}`);
      const response = await anthropic.messages.create({
        model: model.apiModel,
        max_tokens: getMaxTokensForModel(model),
        system: "You are an expert at extracting structured information from documents. You always return clear, comprehensive lists focused exactly on what was requested. You are thorough and do not miss any relevant items. Format your response appropriately.",
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2, // Keep temperature low for reliable extraction
      });
      
      rawResponse = response.content[0]?.type === 'text' 
        ? response.content[0].text 
        : '';
      extractedInfo = rawResponse;
    } else if (model.provider === 'google') {
      // Google Gemini model processing
      console.log(`Using Google model: ${model.apiModel}`);
      const genModel = googleAI.getGenerativeModel({ model: model.apiModel });
      
      const result = await genModel.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: getMaxTokensForModel(model),
        }
      });
      
      rawResponse = result.response.text();
      extractedInfo = rawResponse;
    } else {
      //  OpenAI
      console.log(`Using OpenAI model: ${model.apiModel}`);
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
        max_tokens: getMaxTokensForModel(model),
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
      rawResponse,
      modelUsed: model.name,
      chunkingApplied: contentStrategy === 'chunked'
    });
    
  } catch (error) {
    console.error('Information extraction error:', error);
    return res.status(500).json({ 
      message: 'Error extracting information', 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Prepare content for chunked processing with larger chunks for Gemini Flash
function prepareChunkedProcessing(content: string): string {
  // Adaptive chunking strategy - takes size into account
  const totalLength = content.length;
  const chunkSize = totalLength > 500000 ? 20000 : 30000; // Larger chunks for Gemini Flash
  
  // Use a more strategic approach for large documents
  const lines = content.split('\n');
  
  if (lines.length < 100) {
    // If not many lines, just reduce the overall content
    return content.substring(0, 120000);
  }
  
  // Determine how many chunks to use based on document size
  const numChunks = Math.min(5, Math.ceil(totalLength / 150000));
  let result = '';
  
  // Take beginning chunk - always important
  const beginChunk = lines.slice(0, Math.min(lines.length / 8, 400)).join('\n');
  result += `[BEGINNING OF DOCUMENT]\n${beginChunk.substring(0, chunkSize)}\n\n`;
  
  // For very large documents, sample multiple sections throughout
  if (numChunks > 2) {
    for (let i = 1; i < numChunks - 1; i++) {
      const position = Math.floor((lines.length * i) / numChunks);
      const sectionStart = Math.max(0, position - 200);
      const sectionEnd = Math.min(lines.length, position + 200);
      const sectionChunk = lines.slice(sectionStart, sectionEnd).join('\n');
      
      result += `[SECTION ${i} OF DOCUMENT - APPROXIMATELY ${Math.floor((i * 100) / numChunks)}% THROUGH]\n${sectionChunk.substring(0, chunkSize)}\n\n`;
    }
  } else {
    // For smaller documents, just take a middle chunk
    const midStartIndex = Math.floor(lines.length * 0.4);
    const midEndIndex = Math.floor(lines.length * 0.6);
    const middleChunk = lines.slice(midStartIndex, midEndIndex).join('\n');
    result += `[MIDDLE OF DOCUMENT]\n${middleChunk.substring(0, chunkSize)}\n\n`;
  }
  
  // Take end chunk - always important
  const endChunk = lines.slice(Math.max(0, Math.floor(lines.length * 0.9))).join('\n');
  result += `[END OF DOCUMENT]\n${endChunk.substring(0, chunkSize)}\n\n`;
  
  // Add a note about sampling
  result += `[NOTE: This document has been sampled from ${numChunks} sections due to its large size (approximately ${Math.round(totalLength / 1000)}KB). The full document may contain additional important information not captured in these samples.]\n`;
  
  return result;
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
NEVER  leave cellls blank. Always return 'n/a' or 'unknown' if no concrete answer is possible.

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

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
    responseLimit: false,
  },
}