// pages/api/chunk-text.ts
// API endpoint for intelligent text chunking and summarization
// Divides text into logical sections with titles and summaries

import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getModelById } from '@/lib/models';

// Set default model
const DEFAULT_MODEL = 'gemini-flash';

// Configure Google client
let googleAI: any = null;
try {
  googleAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");
} catch (error) {
  console.warn('Google client initialization failed');
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
      originalText, 
      translatedText,
      modelId = DEFAULT_MODEL
    } = req.body;
    
    // Validate input
    if (!originalText || !translatedText) {
      return res.status(400).json({ message: 'Missing required text fields' });
    }
    
    // Get model configuration
    let modelConfig;
    try {
      modelConfig = getModelById(modelId);
    } catch (error) {
      console.warn(`Model ID ${modelId} not found, using ${DEFAULT_MODEL}`);
      modelConfig = getModelById(DEFAULT_MODEL);
    }
    
    // If text is short, return a single section
    if (originalText.length < 5000) {
      return res.status(200).json({
        originalSections: [{
          id: '1',
          title: 'Original Text',
          content: originalText,
          summary: 'Complete original text'
        }],
        translationSections: [{
          id: '1',
          title: 'Translation',
          content: translatedText,
          summary: 'Complete translation'
        }]
      });
    }
    
    // For longer text, use Gemini to chunk intelligently
    if (!googleAI) {
      throw new Error('Google AI client not available for text chunking');
    }
    
    // Use Gemini Flash for text processing
    const model = googleAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    
    const prompt = `
I need to divide two large text documents into logical sections with titles and brief summaries. The first document is the original text, and the second is its translation. Please analyze both texts and divide them into 3-7 logical sections based on content and structure.

ORIGINAL TEXT:
${originalText.substring(0, 30000)} ${originalText.length > 30000 ? '... (text continues)' : ''}

TRANSLATION:
${translatedText.substring(0, 30000)} ${translatedText.length > 30000 ? '... (text continues)' : ''}

Please return a JSON structure with two arrays:
1. originalSections: sections for the original text
2. translationSections: matching sections for the translation

Each section should have these properties:
- id: A unique identifier (string)
- title: A brief title for the section (string)
- content: The text content for this section (string) - I'll fill this in later
- summary: A 1-sentence summary of this section (string)

The sections should correspond to each other, so section 1 in original corresponds to section 1 in translation.

Identify logical breaks in the text such as:
- Topical shifts
- Narrative transitions
- Paragraph groupings
- Natural sections

Include the COMPLETE content of both texts, dividing them at matching logical points.
Return ONLY valid JSON without any explanation or commentary.
`;
    
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 8192,
      },
    });
    
    const responseText = result.response.text();
    
    // Extract JSON from response
    let jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse JSON from AI response');
    }
    
    let sectionsData = JSON.parse(jsonMatch[0]);
    
    // Now we need to assign the actual content to each section
    // This is a simplified approach - in production, you'd need more sophisticated text splitting
    
    // Process original text
    const originalSections = await assignContentToSections(originalText, sectionsData.originalSections);
    
    // Process translated text
    const translationSections = await assignContentToSections(translatedText, sectionsData.translationSections);
    
    return res.status(200).json({
      originalSections,
      translationSections
    });
    
  } catch (error) {
    console.error('Text chunking error:', error);
    return res.status(500).json({ 
      message: 'Error processing text chunks',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Helper function to assign content to sections based on AI-generated section info
async function assignContentToSections(fullText: string, sections: any[]): Promise<any[]> {
  // If we only have one section, just use the full text
  if (sections.length === 1) {
    sections[0].content = fullText;
    return sections;
  }
  
  // For more complex division, we need to approximately split the text
  // This is a simplified approach that divides by word count
  const words = fullText.split(/\s+/);
  const totalWords = words.length;
  const sectionSize = Math.floor(totalWords / sections.length);
  
  let currentIndex = 0;
  
  return sections.map((section, index) => {
    // For the last section, take all remaining text
    if (index === sections.length - 1) {
      const content = words.slice(currentIndex).join(' ');
      return { ...section, content };
    }
    
    // Otherwise, take a section's worth of words
    const endIndex = currentIndex + sectionSize;
    const content = words.slice(currentIndex, endIndex).join(' ');
    currentIndex = endIndex;
    
    return { ...section, content };
  });
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
    responseLimit: false,
  },
};