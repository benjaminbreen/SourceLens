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
    const prompt = buildDetailedAnalysisPrompt(source, metadata, perspective);
    
    // Track raw prompt and response for transparency
    let rawPrompt = prompt;
    let rawResponse = '';
    
    // Process with selected LLM
    let analysis;
    if (model === 'gpt') {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.5,
        max_tokens: 500,
      });
      
      rawResponse = response.choices[0]?.message?.content || '';
      analysis = rawResponse;
    } else {
      // Default to Claude
      const response = await anthropic.messages.create({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 500,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.5,
      });
      
rawResponse = response.content[0]?.type === 'text' 
  ? response.content[0].text 
  : '';
      analysis = rawResponse;
    }
    
    return res.status(200).json({
      analysis,
      rawPrompt,
      rawResponse
    });
  } catch (error) {
    console.error('Detailed analysis error:', error);
    return res.status(500).json({ message: 'Error processing detailed analysis' });
  }
}

function buildDetailedAnalysisPrompt(
  source: string, 
  metadata: any, 
  perspective: string
): string {
  return `You are an expert humanities research assistant analyzing a primary source for a scholar.

SOURCE DATE: ${metadata.date}
SOURCE AUTHOR: ${metadata.author}
RESEARCH GOALS: ${metadata.researchGoals}
${metadata.additionalInfo ? `ADDITIONAL CONTEXT: ${metadata.additionalInfo}` : ''}
${perspective ? `ANALYTICAL PERSPECTIVE: ${perspective}` : ''}

PRIMARY SOURCE:
${source}

Provide an analysis of this primary source that addresses the following (ONE TWO TWO SENTENCES FOR EACH)

1. CONTEXT: Place this source in its historical context, including relevant events, movements, or trends from the period.

2. AUTHOR PERSPECTIVE: Analyze the author's background, potential biases, and how these might influence the source.

3. KEY THEMES: Identify the main themes, arguments, or narratives present in the source.

4. EVIDENCE & RHETORIC: Analyze how the author uses evidence, language, or rhetoric to convey their message.

5. SIGNIFICANCE: Explain why this source is valuable for the stated research goals, highlighting its contributions to understanding the topic.

KEEP IT BRIEF BUT CONTENT RICH AND SOPHISTICATED. Provide specific examples from the text where relevant and THIS IS CRUCIAL cite relevent academic sources in Chicago style. Be thorough but concise, and ensure your analysis directly relates to the researcher's stated goals.
`;
}