// pages/api/summarize-draft.ts
// API endpoint for generating structured summaries of user draft documents
// Using Gemini Flash Lite for efficient processing of potentially long documents

import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getModelById } from '@/lib/models';

// Configure Google client
const googleAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

// Interface for the response format
interface SummaryResponse {
  overallSummary: string;
  sections: {
    id: string;
    title: string;
    summary: string;
    fullText: string;
  }[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { draft, modelId = 'gemini-flash-lite' } = req.body;
    
    if (!draft || !draft.content) {
      return res.status(400).json({ message: 'Draft content is required' });
    }
    
    // Get model configuration - default to gemini-flash-lite for efficient processing
    const modelConfig = getModelById(modelId);
    
    // Make sure we're using a Google model as this is specialized for Gemini
    if (modelConfig.provider !== 'google') {
      console.warn(`Requested model ${modelId} is not a Google model, falling back to gemini-flash-lite`);
      const fallbackModel = getModelById('gemini-flash-lite');
      modelConfig.apiModel = fallbackModel.apiModel;
    }
    
    // Create the Gemini model
    const model = googleAI.getGenerativeModel({ model: modelConfig.apiModel });
    
    // Text truncation for extremely long documents
    const maxTextLength = 300000; // Approx 25,000 words
    const textToProcess = draft.content.length > maxTextLength 
      ? draft.content.substring(0, maxTextLength) + "\n\n[Note: Draft was truncated due to length.]" 
      : draft.content;
    
    // Create the prompt for draft summarization with JSON output
   // Create the prompt for draft summarization with JSON output
const summaryPrompt = `
You are DraftSummarizerAI, a specialized system for creating structured summaries of academic writing and research drafts.

DRAFT TO SUMMARIZE:
${textToProcess}

DRAFT METADATA (if available):
Title: ${draft.title || 'Untitled Draft'}

TASK:
Analyze this draft document and create a structured summary as follows:
1. Identify logical sections based on content, themes, or existing headings
2. For each section, create:
   - A descriptive title (even if none exists in the original)
   - A one-sentence summary that captures the key points
   - The full text of that section from the original document
3. Provide a brief overall summary of the entire draft (2-3 sentences)

GUIDELINES:
- Create 3-7 logical sections based on the document structure and content
- If the draft already has clear sections or headings, use those as a guide
- Ensure each section summary is concise (1-2 sentences)
- Each section's full text should contain the complete, unmodified text from that portion of the document
- Make section titles clear and descriptive
- The overall summary should capture the draft's main purpose, argument, and significance

OUTPUT FORMAT:
Return a JSON object with this exact structure:
{
  "overallSummary": "Brief 2-3 sentence summary of the entire draft",
  "sections": [
    {
      "id": "section-1",
      "title": "Section Title 1",
      "summary": "Concise summary of this section",
      "fullText": "The complete original text for this section"
    },
    {
      "id": "section-2",
      "title": "Section Title 2",
      "summary": "Concise summary of this section",
      "fullText": "The complete original text for this section"
    }
  ]
}

CRITICAL: You must return properly formatted, valid JSON. Do not include any other text outside the JSON object. Do not use markdown formatting. Avoid escape sequences that might break JSON parsing.`;

    // Call the Gemini model
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: summaryPrompt }] }],
      generationConfig: {
        temperature: 0.2, // Low temperature for more predictable output
        maxOutputTokens: 300000, // Large output limit for full sections
      },
    });
    
    const response = result.response;
    const responseText = response.text();
    
    // Parse the JSON response
    let summaryData: SummaryResponse;
    try {
      // Clean up the response text in case it has markdown code fences or other non-JSON content
      const cleanedJson = responseText.replace(/```json\s*|\s*```/g, '').trim();
      summaryData = JSON.parse(cleanedJson);
    } catch (parseError) {
      console.error('Error parsing JSON response:', parseError);
      return res.status(500).json({ 
        message: 'Failed to parse summary data', 
        error: (parseError as Error).message,
        rawResponse: responseText
      });
    }
    
    // Validate the response structure
    if (!summaryData.sections || !Array.isArray(summaryData.sections)) {
      return res.status(500).json({ 
        message: 'Invalid summary data structure',
        data: summaryData
      });
    }
    
    // Calculate word count
    const wordCount = draft.content.split(/\s+/).length;
    
    // Return the structured summary
    return res.status(200).json({
      overallSummary: summaryData.overallSummary,
      sections: summaryData.sections,
      totalSections: summaryData.sections.length,
      originalTextLength: draft.content.length,
      processedTextLength: textToProcess.length,
      wordCount
    });
    
  } catch (error) {
    console.error('Draft summarization error:', error);
    return res.status(500).json({ 
      message: 'Error processing draft summarization',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb', // Increase size limit for large documents
    },
    responseLimit: false,
  },
};