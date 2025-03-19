// pages/api/chat.ts
// Simple chat API endpoint for basic conversation

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
  console.log("Chat API route called");
  
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { message, source, metadata, model = 'gpt' } = req.body;
    
    console.log("Received chat request:", { model, messageLength: message?.length });
    
    if (!message || !source || !metadata) {
      console.log("Missing required fields");
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Build simple prompt
    const prompt = `You are SourceLens, an AI research assistant analyzing a primary source.
    
SOURCE DATE: ${metadata.date}
SOURCE AUTHOR: ${metadata.author}
RESEARCH GOALS: ${metadata.researchGoals || 'Not specified'}
PRIMARY SOURCE:
${source}

The user has asked: "${message}"

Please respond to their question about this source as an expert, opinionated, skeptical and somewhat eclectic historian, ensuring you only reply in maximum two sentences unless specifically asked to go longer. NEVER write out your actions, always just straight dialogue.`;
    
    let responseText = '';
    
    // Use appropriate model
    if (model === 'gpt') {
      console.log("Using GPT-4o-mini model");
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 800,
      });
      
      responseText = completion.choices[0]?.message?.content || 'No response generated';
    } else {
      console.log("Using Claude model");
      const completion = await anthropic.messages.create({
        model: 'claude-3-5-haiku-20241022',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 800,
      });
      
      responseText = completion.content[0]?.type === 'text' 
        ? completion.content[0].text 
        : 'No response generated';
    }
    
    console.log("Response received, sending back to client");
    
    return res.status(200).json({
      rawResponse: responseText,
      rawPrompt: prompt,
    });
    
} catch (error) {
  console.error("Chat API error:", error);
  return res.status(500).json({ 
    message: 'Error processing chat',
    error: error instanceof Error ? error.message : 'Unknown error'
  });
}
}