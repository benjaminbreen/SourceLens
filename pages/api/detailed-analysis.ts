// pages/api/detailed-analysis.ts
// API route for detailed source analysis with standardized model handling
// Supports OpenAI, Anthropic, and Google models through a unified configuration

import type { NextApiRequest, NextApiResponse } from 'next';
import { OpenAI } from 'openai';
import { Anthropic } from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getModelById, DEFAULT_MODEL_ID } from '@/lib/models';

// Configure API clients
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Configure Google client
const googleAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

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
      modelId = DEFAULT_MODEL_ID,  // New parameter name for model ID
      model      // Keep for backward compatibility
    } = req.body;
    
    // Handle backward compatibility - if modelId isn't provided but model is
    const effectiveModelId = modelId || (model === 'gpt' ? 'gpt-4o-mini' : 'claude-haiku');
    
    // Get model configuration
    const modelConfig = getModelById(effectiveModelId);
    
    // Log request details for debugging
    console.log("Detailed analysis request received:", {
      sourceLength: source?.length,
      metadata: !!metadata,
      perspective,
      modelId: effectiveModelId,
      apiModel: modelConfig.apiModel,
      provider: modelConfig.provider
    });
    
    // Validate input
    if (!source || !metadata) {
      console.log("Missing required fields");
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Build prompt
    const prompt = buildDetailedAnalysisPrompt(source, metadata, perspective);
    console.log(`Prompt built, sending to ${modelConfig.provider} model: ${modelConfig.apiModel}`);
    
    // Track raw prompt and response for transparency
    let rawPrompt = prompt;
    let rawResponse = '';
    
    // Process with selected LLM based on provider
    let analysis;
    if (modelConfig.provider === 'openai') {
      console.log(`Using OpenAI model: ${modelConfig.apiModel}`);
      const response = await openai.chat.completions.create({
        model: modelConfig.apiModel,
        messages: [{ role: 'user', content: prompt }],
        temperature: modelConfig.temperature || 0.4,
        max_tokens: modelConfig.maxTokens || 4500,
      });
      
      rawResponse = response.choices[0]?.message?.content || '';
      analysis = rawResponse;
      console.log("OpenAI response received");
    } else if (modelConfig.provider === 'google') {
      console.log(`Using Google model: ${modelConfig.apiModel}`);
      const model = googleAI.getGenerativeModel({ model: modelConfig.apiModel });
      
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: modelConfig.temperature || 0.4,
          maxOutputTokens: modelConfig.maxTokens || 4500,
        },
      });
      
      const response = result.response;
      rawResponse = response.text();
      analysis = rawResponse;
      console.log("Google response received");
    } else {
      // Default to Anthropic/Claude
      console.log(`Using Anthropic model: ${modelConfig.apiModel}`);
      const response = await anthropic.messages.create({
        model: modelConfig.apiModel,
        messages: [{ role: 'user', content: prompt }],
        temperature: modelConfig.temperature || 0.5,
        max_tokens: modelConfig.maxTokens || 4500,
      });
      
      rawResponse = response.content[0]?.type === 'text' 
        ? response.content[0].text 
        : '';
      analysis = rawResponse;
      console.log("Anthropic response received");
    }
    
    return res.status(200).json({
      analysis,
      rawPrompt,
      rawResponse
    });
  } catch (error) {
    console.error('Detailed analysis error:', error);
    return res.status(500).json({ 
      message: 'Error processing detailed analysis',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

function buildDetailedAnalysisPrompt(
  source: string, 
  metadata: any, 
  perspective: string
): string {
  return `You are an expert and highly sensitive professor in the humanities analyzing a primary source in depth. You have a flexible, creative, and unorthodox mind and value scholarly rigor, truth-telling, skepticism, and plainspokennes.

SOURCE DATE: ${metadata.date}
SOURCE AUTHOR: ${metadata.author}
RESEARCH GOALS: ${metadata.researchGoals}
${metadata.additionalInfo ? `ADDITIONAL CONTEXT: ${metadata.additionalInfo}` : ''}
${perspective ? `ANALYTICAL PERSPECTIVE: ${perspective}` : ''}

PRIMARY SOURCE:
${source}

Provide an analysis of this primary source that addresses the following (around 2-3 sentences each). 

IMPORTANT: Cite the most relevant and useful academic secondary sources as needed, maximum 4. THIS IS KEY: When citing a source, ALWAYS use the format 📚(Author, Year) - for example 📚(Smith, 2010) or 📚(Johnson). This ensures the citations are properly linked in the interface.

Provide ONLY the following entries, with absolutely no prefatory material or opening sentence. 

1. ###CONTEXT: Place this source in its historical context, including relevant events, movements, or trends from the period. Include unfamiliar or unexpected but true details as needed.

2. ###AUTHOR PERSPECTIVE: Analyze the author's background, potential biases, and how these might influence the source.

3. ###KEY THEMES: Identify the main themes, arguments, or narratives present in the source.

4. ###EVIDENCE & RHETORIC: Analyze how the author uses evidence, language, or rhetoric to convey their message.

5. ###SIGNIFICANCE: Explain why this source MAY (or MAY NOT) be valuable for the stated research goals, highlighting its potential contributions (or not) to understanding the topic. ONE SENTENCE ONLY.

6. ###REFERENCES: All sources you cited, in Chicago style. List them in the order they were first cited.

KEEP IT BRIEF BUT CONTENT RICH. Provide specific examples from the text where relevant and THIS IS CRUCIAL cite relevent academic sources using the 📚(Author, Year) format within your text. Be thorough but concise, and ensure your analysis directly relates to the researcher's stated goals.
`;
}