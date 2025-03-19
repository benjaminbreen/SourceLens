import type { NextApiRequest, NextApiResponse } from 'next';
import { OpenAI } from 'openai';
import { Anthropic } from '@anthropic-ai/sdk';

// Configure API clients
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { 
      source, 
      metadata, 
      perspective = '',
      model = 'claude' 
    } = req.body;
    
    // Validate input
    if (!source || !metadata) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Build prompt with source and metadata context
    const prompt = buildCounterNarrativePrompt(source, metadata, perspective);
    
    // Track raw prompt and response for transparency
    let rawPrompt = prompt;
    let rawResponse = '';
    
    // Process with selected LLM
    let narrative;
    if (model === 'gpt') {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.6,
        max_tokens: 500,
      });
      
      rawResponse = response.choices[0]?.message?.content || '';
      narrative = rawResponse;
    } else {
      // Default to Claude
      const response = await anthropic.messages.create({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 500,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.6,
      });
      
  rawResponse = response.content[0]?.type === 'text' 
  ? response.content[0].text 
  : '';
      narrative = rawResponse;
    }
    
    return res.status(200).json({
      narrative,
      rawPrompt,
      rawResponse
    });
  } catch (error) {
    console.error('Counter-narrative error:', error);
    return res.status(500).json({ message: 'Error processing counter-narrative' });
  }
}

function buildCounterNarrativePrompt(
  source: string, 
  metadata: any, 
  perspective: string
): string {
  return `You are an innovative humanities research assistant with expertise in critical theory and alternative readings of primary sources. Your task is to generate a counter-narrative analysis of the following source.

SOURCE DATE: ${metadata.date}
SOURCE AUTHOR: ${metadata.author}
RESEARCH GOALS: ${metadata.researchGoals}
${metadata.additionalInfo ? `ADDITIONAL CONTEXT: ${metadata.additionalInfo}` : ''}
${perspective ? `ANALYTICAL PERSPECTIVE: ${perspective}` : ''}

PRIMARY SOURCE:
${source}

First, identify what would be considered the dominant or conventional reading of this source in mainstream scholarship. Then, develop a compelling counter-narrative that challenges this interpretation by applying one or TWO (maximum two) of the following approaches:

1. Subaltern perspective: Consider how marginalized groups not centered in the source might have experienced or interpreted the events/ideas.

2. Power structures: Analyze hidden power dynamics at play that might not be immediately apparent.

3. Historical contingency: Explore how the source reflects historical accidents rather than inevitable developments.

4. Silences and omissions: Identify what is NOT said and why those omissions might be significant.

5. Cross-cultural context: Examine how different cultural frameworks might lead to alternative interpretations.

ONLY USE ONE OR TWO OF THESE. YOUR RESPONSE MUST BE TWO PARAGRAPHS MAXIMUM. KEEP IT BRIEF. The counter-narrative should be thoughtful and well-reasoned, not merely contrarian. Ground your analysis in textual evidence while offering a genuinely different perspective from conventional readings. This should help the researcher see the source in a new light that might reveal overlooked dimensions relevant to their research goals.
`;
}