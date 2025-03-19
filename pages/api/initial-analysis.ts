// pages/api/initial-analysis.ts
// API route for initial source analysis with standardized model handling
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
    console.log("Initial analysis request received:", {
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
    const prompt = buildAnalysisPrompt(source, metadata, perspective);
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
        temperature: modelConfig.temperature || 0.7,
        max_tokens: modelConfig.maxTokens || 700,
      });
      
      rawResponse = response.choices[0]?.message?.content || '';
      console.log("OpenAI response received");
    } else if (modelConfig.provider === 'google') {
      console.log(`Using Google model: ${modelConfig.apiModel}`);
      const model = googleAI.getGenerativeModel({ model: modelConfig.apiModel });
      
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: modelConfig.temperature || 0.7,
          maxOutputTokens: modelConfig.maxTokens || 700,
        },
      });
      
      const response = result.response;
      rawResponse = response.text();
      console.log("Google response received");
    } else {
      // Default to Anthropic/Claude
      console.log(`Using Anthropic model: ${modelConfig.apiModel}`);
      const response = await anthropic.messages.create({
        model: modelConfig.apiModel,
        messages: [{ role: 'user', content: prompt }],
        temperature: modelConfig.temperature || 0.7,
        max_tokens: modelConfig.maxTokens || 700,
      });
      
      rawResponse = response.content[0]?.type === 'text' 
        ? response.content[0].text 
        : '';
      console.log("Anthropic response received");
    }
    
    // Parse the response
    analysis = parseAnalysisResponse(rawResponse);
    console.log("Response parsed, sending back to client");
    
    return res.status(200).json({
      analysis,
      rawPrompt,
      rawResponse
    });
} catch (error) {
  console.error('Initial analysis error:', error);
  return res.status(500).json({ 
    message: 'Error processing analysis',
    error: error instanceof Error ? error.message : 'Unknown error'
  });
}
}

function buildAnalysisPrompt(
  source: string, 
  metadata: any, 
  perspective: string
): string {
  return `You are the analysis engine of SourceLens, an expert level humanistic research tool for scholars and researchers. Your job is to analyze primary sources, keeping in mind the human user's research goals and the provided date and author of the source. 

 You are able to analyze sources in any language and do so, but you default to responding in English unless asked otherwise by the user.
  Here is your current source:

SOURCE DATE: ${metadata.date}
SOURCE AUTHOR: ${metadata.author}
RESEARCH GOALS: ${metadata.researchGoals}
${metadata.additionalInfo ? `ADDITIONAL CONTEXT: ${metadata.additionalInfo}` : ''}
${perspective ? `ANALYTICAL PERSPECTIVE: ${perspective}` : ''}

PRIMARY SOURCE:
${source}

Please provide:
1. A BRIEF one-sentence summary of the source
2. A BRIEF one-sentence preliminary analysis that addresses the research goals while considering the historical context of the author and date
3. Three EXTREMELY BRIEF (like as few as 4-5 words) follow-up questions that would better understand and think creatively about the source. These are questions YOU as the LLM for SourceLens, want the human user to provide answers to (ideally large dumps of data for context) in order to assist YOU, SourceLens, in developing your own analysis. These questions may be nosy, pointed, surprising, succinct, telegraphic, telepathic, and probably should be. 

Format your response as follows:
SUMMARY: [your one-sentence summary]
PRELIMINARY ANALYSIS: [your one-sentence analysis]
FOLLOW-UP QUESTIONS:
1. [first question]
2. [second question]
3. [third question]
`;
}

function parseAnalysisResponse(text: string): any {
  // Extract components with regex
  const summaryMatch = text.match(/SUMMARY:\s*(.*?)(?=PRELIMINARY|$)/s);
  const analysisMatch = text.match(/PRELIMINARY ANALYSIS:\s*(.*?)(?=FOLLOW-UP|$)/s);
  const questionsMatch = text.match(/FOLLOW-UP QUESTIONS:[\s\S]*?(?:1\.\s*(.*?))\s*(?:2\.\s*(.*?))\s*(?:3\.\s*(.*?))\s*(?=$|[\r\n])/s);
  
  const result = {
    summary: summaryMatch?.[1]?.trim() || 'A historical document requiring analysis.',
    analysis: analysisMatch?.[1]?.trim() || 'This document relates to the stated research goals.',
    followupQuestions: [
      questionsMatch?.[1]?.trim() || 'What was the historical context of this document?',
      questionsMatch?.[2]?.trim() || 'How does this document relate to the author\'s other work?',
      questionsMatch?.[3]?.trim() || 'What biases or perspectives might be present in this source?',
    ].filter(Boolean)
  };
  
  console.log("Parsed analysis result:", result);
  return result;
}