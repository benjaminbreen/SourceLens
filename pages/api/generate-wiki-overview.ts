// pages/api/generate-wiki-overview.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { OpenAI } from 'openai';
import { Anthropic } from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

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
      title, 
      sourceContext, 
      type 
    } = req.body;
    
    // Debug logging to see exactly what we're receiving
    console.log('Wiki overview request received:', { 
      title, 
      type, 
      sourceContext: JSON.stringify(sourceContext)
    });
    
    if (!title) {
      console.error('Missing title parameter');
      return res.status(400).json({ message: 'Missing title parameter' });
    }

    // Build prompt based on type
    let prompt = '';
    if (type === 'author') {
 
prompt = `Generate a crisp, historically grounded one-sentence summary of the larger historical and temporal context for the work titled "${sourceContext?.title || 'unknown'}", written by ${title}.

Source context: This is a ${sourceContext?.type || 'document'} from ${sourceContext?.date || 'unknown date'} called ${sourceContext?.title || 'unknown'} by ${title}.

      If you know an author from your training data, proceed from that assumption and knowledge base. Be confident. 
      IMPORTANT: Even if ${title} is unclear or you don't have specific information about them, provide a brief, pithy description of what this author from (${sourceContext?.date || 'unknown date'}) WOULD have been like, given the context and your background knowledge.
      
      Your response must:
      1. Be ONE VERY SHORT sentence only (no more than 20 words)
      2. Always insightfully and analytically situate the source within its historical context - don't just summarize or describe it. 
      3. Never begin with phrases like "According to" or include qualifiers like "possibly" or "likely"`;
    } else if (type === 'date') {
      prompt = `Based on ${title} (if this is an exact date, note it carefully), describe relevent historical events and other contextual factors.
      
      Source context: This is a ${sourceContext?.type || 'document'} written by ${sourceContext?.author || 'an author'} titled ${sourceContext?.title || 'unknown'}.
      
    1. Be a concise, crisp 1-2 sentences covering TWO TO THREE brief historical context points relating DIRECTLY to the historical circumstances of the EXACT DATE if available (or year/decade if not). Be pithy and never begin with any prologue or intro text of any kind. Just jump right into describing the context and then end after 2 content-rich but concise sentences max.
      2. Focus on important historical context that helps us better understand or situate ${title} within larger trends - go big and general here. Don't just identify context of immediate relevence, but note the big picture trends underlying it all.`;
    } else {
      prompt = `Based on ${title} (this will be the name of an author OR a date), generate a crisp, historically grounded one-sentence summary of EITHER the author or date (depending) who wrote the work titled "${sourceContext?.title || 'unknown'}", written by ${title}.

Source context: This is a ${sourceContext?.type || 'document'} from ${sourceContext?.date || 'unknown date'} called ${sourceContext?.title || 'unknown'} by ${title}.
      
      Your response must:
      1. Be ONE concise sentence only about EITHER the named person or the timeframe, depending on whether ${title} is a name or date. WRITE NOTHING BUT THE SENTENCE, no "here's your result" and no follow up sentences.
      2. Provide valuable historical context or significance to understand this source. rather than summarizing the source itself, summarize its historical context with an emphasis on either the named author or date, depending. 
      3. Be specific rather than general`;
    }

    console.log('Using prompt:', prompt);

    // Try using Gemini
    try {
      console.log('Attempting to use Gemini Flash Lite');
      const model = googleAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });
      
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 200,
        }
      });
      
      let summary = result.response.text().trim();
      console.log('Raw Gemini response:', summary);
      
     
      
      return res.status(200).json({ 
        summary,
        type,
        title,
        model: 'gemini-flash-lite'
      });
    } catch (geminiError) {
      console.error('Gemini error:', geminiError);
      
      // If Gemini fails, try Anthropic
      try {
        console.log('Falling back to Anthropic Claude');
        const response = await anthropic.messages.create({
          model: 'claude-3-5-sonnet-20240620',
          max_tokens: 200,
          temperature: 0.4,
          messages: [
            { role: 'user', content: prompt }
          ]
        });
        
        let summary = response.content[0].type === 'text' 
          ? response.content[0].text.trim() 
          : '';
          
        console.log('Raw Claude response:', summary);
          
       
          
        return res.status(200).json({ 
          summary, 
          type,
          title,
          model: 'claude-3-5-sonnet' 
        });
      } catch (claudeError) {
        // Pass both errors to the client for better debugging
        console.error('Both Gemini and Claude failed:', claudeError);
        return res.status(500).json({ 
          error: true, 
        geminiError: geminiError ? String(geminiError) : 'Unknown error',
claudeError: claudeError ? String(claudeError) : 'Unknown error',
          message: 'Both Gemini and Claude LLMs failed to generate a summary'
        });
      }
    }
  } catch (error) {
    console.error('Error in generate-wiki-overview endpoint:', error);
    return res.status(500).json({ 
      error: true,
      message: error instanceof Error ? error.message : 'Unknown error in wiki overview generation'
    });
  }
}