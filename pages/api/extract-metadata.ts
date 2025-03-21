// pages/api/extract-metadata.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { OpenAI } from 'openai';

// Configure OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ message: 'Text is required' });
    }
    
    // Use OpenAI to extract metadata
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Extract document metadata from the provided text. 
          Return ONLY a JSON object with these fields:
          - date: the most likely publication date found in ISO format (YYYY-MM-DD) or empty string if uncertain
          - author: the most likely author name or empty string if uncertain. If the first name is abbreviated, expand it to the most likely result (i.e. Wm--> William)
          - title: the most likely document title or empty string if uncertain
          - summary: a VERY SHORT 5-6 word summary of the document content
          - documentEmoji: a single emoji that creatively represents the document's content, theme, or time period
          - documentType: the type of document (e.g., Letter, Diary, Speech, etc.) or empty string if uncertain
          - genre: the literary or historical genre of the document or empty string if uncertain
          - placeOfPublication: where the document was created or published (if evident) or empty string if uncertain
          - academicSubfield: what academic fields might study this document or empty string if uncertain
          - tags: an array of 3-5 keyword tags related to the document's content and context
          - researchValue: a brief 1-2 sentence description of what this document might be useful for researching
          `
        },
        {
          role: 'user',
          content: text
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.4,
    });
    
    // Parse the response
    const content = completion.choices[0].message.content;
    // Add a null check
    const extractedMetadata = content ? JSON.parse(content) : {};
    
    return res.status(200).json(extractedMetadata);
  } catch (error) {
    console.error('Metadata extraction error:', error);
    return res.status(500).json({ 
      message: 'Error extracting metadata',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}