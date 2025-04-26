// pages/api/analysis-search.ts
// API endpoint for using AI to intelligently search through saved analyses
// Returns ranked results based on relevance to user query

import type { NextApiRequest, NextApiResponse } from 'next';
import { Anthropic } from '@anthropic-ai/sdk';

// Configure Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { analyses, query } = req.body;
    
    // Basic validation
    if (!analyses || !query) {
      return res.status(400).json({ 
        message: 'Missing required fields (analyses, query)' 
      });
    }
    
    // Prepare analysis metadata for the LLM
    const analysesMetadata = analyses.map((analysis: any) => ({
      id: analysis.id,
      title: analysis.title,
      type: analysis.type,
      sourceName: analysis.sourceName,
      sourceAuthor: analysis.sourceAuthor,
      sourceDate: analysis.sourceDate,
      perspective: analysis.perspective,
      contentPreview: analysis.content.substring(0, 200) // First 200 chars of content
    }));
    
    // Create prompt for Claude
    const prompt = `You are helping a researcher find relevant analyses in their library. I will provide a description of the analyses in their library and a query. Your task is to identify the top 5 most relevant analyses that match the query and explain why each one is relevant.

Here is information about the analyses in the library:
${JSON.stringify(analysesMetadata, null, 2)}

The user's query is: ${query}

Please return ONLY a JSON array with the top 5 most relevant analyses. Each result should include the analysis id, a relevance score between 0 and 1 (where 1 is perfect match), and a one-sentence explanation of why it's relevant. Format your response as valid JSON. Do not include any other text or explanation outside the JSON structure.

Example response format:
[
  {"id": "analysis-123", "score": 0.95, "explanation": "This analysis directly addresses the historical context of democratic reforms mentioned in your query."},
  {"id": "analysis-456", "score": 0.82, "explanation": "Examines constitutional implications which relate to your interest in democratic governance."}
]`;

    // Call Claude API
    const response = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 1000,
      system: "You help researchers find relevant analyses in their library by returning precisely formatted JSON without any additional text.",
      messages: [
        { role: "user", content: prompt }
      ]
    });
    
    const content = response.content.find(c => c.type === 'text')?.text || '';
    
    // Extract JSON from response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    let results = [];
    
    if (jsonMatch) {
      results = JSON.parse(jsonMatch[0]);
    } else {
      console.error("Failed to parse JSON from LLM response");
      return res.status(422).json({ 
        message: 'Failed to parse results from AI response',
        rawResponse: content
      });
    }
    
    return res.status(200).json({
      results,
      rawResponse: content
    });
    
  } catch (error) {
    console.error('Analysis search error:', error);
    return res.status(500).json({ 
      message: 'Error searching analyses', 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '2mb',
    },
  },
}