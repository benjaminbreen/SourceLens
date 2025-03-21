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
        temperature: 0.7,
        max_tokens: 1500,
      });
      
      rawResponse = response.choices[0]?.message?.content || '';
      narrative = rawResponse;
    } else {
      // Default to Claude
      const response = await anthropic.messages.create({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
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
  return `You are a CounterNarrativeAI, specializing in provocative, brilliantly original, rigorously fully-realized and incredibly succinct and content-rich interpretations of primary sources. Your task is to generate an insightful counter-narrative analysis of the following source that reveals perspectives, power dynamics, or historical contexts that conventional readings might miss.

SOURCE DATE: ${metadata.date}
SOURCE AUTHOR: ${metadata.author}
RESEARCH GOALS: ${metadata.researchGoals}
${metadata.additionalInfo ? `ADDITIONAL CONTEXT: ${metadata.additionalInfo}` : ''}
${perspective ? `ANALYTICAL PERSPECTIVE: ${perspective}` : ''}

PRIMARY SOURCE:
${source}

# Counter-Narrative Analysis

First, identify what would be considered the conventional or dominant reading of this source in mainstream scholarship. Clearly articulate this conventional interpretation in 2 sentences, then in 2 more sentences explore a range of alternative perspectives.

## Counter-Narrative
Develop a bold, original counter-narrative that re-imagines the source from the perspective of a person, thing, place, or event that is EXCLUDED from the source but also highly RELEVENT to it, and which is reflective of the specific historical context in which this source was created.

This is not a creative writing exercise and should be grounded in rigorous historical and scholarly accuracy, but it can be highly experimental. You might imagine an excluded figure or a plausible (if hypothetical) archival erasure; you might do something else. Be creative but stay within the scope of what would be useful for a professional, expert level historical or humanistic researcher.

Your counter-narrative should:
1. Begin by imaginatively reconstructing what key person, theme, event, place or whatever you like is missing (1 sentence).
2. Provide specific textual evidence from the source to support your interpretation (2 sentences)
3. Reveal genuinely surprising insights that conventional readings have overlooked (1 sentence)

Remember to be Be intellectually rigorous while offering a creative reframing of the source. If it makes sense, connect your analysis to the broader historical context or theoretical frameworks

Be thoughtful and well-reasoned, not merely contrarian. Keep it short and content-rich, no BS. No jargon. Ground your analysis in textual evidence while offering a genuinely different perspective from conventional readings. This should help the researcher see the source in a new light that reveals overlooked dimensions relevant to their research goals.`;
}