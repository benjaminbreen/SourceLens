// pages/api/next-steps.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Configure Google AI client
const googleAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { stats, recentSources, recentNotes } = req.body;
    
    if (!stats) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Build prompt for the AI
    const prompt = `
As a research assistant for SourceLens, a document analysis platform, suggest the next steps for a researcher based on their current activity.

USER ACTIVITY STATS:
- Sources: ${stats.sourcesCount}
- Notes: ${stats.notesCount}
- Analyses: ${stats.analysesCount}
- Last active: ${stats.lastActive}

${recentSources && recentSources.length > 0 ? `RECENT SOURCES:\n${recentSources.join('\n')}` : 'NO RECENT SOURCES'}

${recentNotes && recentNotes.length > 0 ? `RECENT NOTES SNIPPETS:\n${recentNotes.join('\n')}` : 'NO RECENT NOTES'}

Based on this information, provide a concise, helpful, and personalized 2-3 sentence suggestion for what the researcher might want to do next to make progress in their work. Be specific rather than generic.
`;

    // Use Gemini Flash Lite (lighter, faster model)
    const genModel = googleAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });
    
    const result = await genModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 200,
      }
    });
    
    const suggestion = result.response.text();
    
    return res.status(200).json({
      suggestion: suggestion || 'Consider reviewing your recent sources to identify patterns or contradictions, then create notes to capture your insights.'
    });
    
  } catch (error) {
    console.error('AI suggestion error:', error);
    return res.status(500).json({ 
      message: 'Error generating suggestions',
      suggestion: 'Consider continuing your analysis of recent documents or exploring the library to find related sources.'
    });
  }
}