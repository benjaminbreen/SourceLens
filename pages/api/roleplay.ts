// pages/api/roleplay.ts
// API endpoint for the author roleplay feature
// Simulates a conversation with the historical author of the source text
// Uses a character sketch initialization to provide context for more authentic roleplay

import type { NextApiRequest, NextApiResponse } from 'next';
import { OpenAI } from 'openai';
import { Anthropic } from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';
import { getModelById } from '@/lib/models';

// Configure API clients
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Initialize Google Generative AI client
const googleAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

// Global cache for character sketches to avoid repeated generation
const characterSketchCache: Record<string, string> = {};
const authorEmojiCache: Record<string, string> = {};

// Check if there's a portrait for the author
function hasPortraitFile(author: string): boolean {
  try {
    const portraitFileName = author.toLowerCase().replace(/\s+/g, '') + '.jpg';
    const portraitPath = path.join(process.cwd(), 'public', 'portraits', portraitFileName);
    return fs.existsSync(portraitPath);
  } catch (error) {
    console.error("Error checking portrait file:", error);
    return false;
  }
}

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
      message = '',
      initialize = false,
      conversation = [],
      model = 'claude' 
    } = req.body;
    
    // Validate input
    if (!source || !metadata) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // For initialization
    let characterSketch = '';
    let authorEmoji = '';
    let birthYear: string | undefined;
    let deathYear: string | undefined;
    let birthplace: string | undefined;
    const cacheKey = `${metadata.author}-${metadata.date}`;

    if (initialize || !characterSketchCache[cacheKey]) {
      try {
        // Check if we need to generate an emoji
        const hasPortrait = hasPortraitFile(metadata.author);
        
        // Generate character sketch and emoji suggestion
        const result = await generateCharacterInfo(source, metadata, !hasPortrait);
        characterSketch = result.sketch;
        birthYear = result.birthYear;
        deathYear = result.deathYear;
        birthplace = result.birthplace;
        
        // Only set emoji if we don't have a portrait file
        if (!hasPortrait) {
          authorEmoji = result.emoji;
          authorEmojiCache[cacheKey] = authorEmoji;
        }
        
        // Cache the sketch for future use
        characterSketchCache[cacheKey] = characterSketch;
        
        console.log("Generated new character sketch for", metadata.author);
      } catch (error) {
        console.error("Error generating character sketch:", error);
        // Provide a fallback if character sketch generation fails
        characterSketch = "A historical figure from their time period, knowledgeable about their work.";
        authorEmoji = "👤";
      }
    } else {
      // Use cached sketch and emoji
      characterSketch = characterSketchCache[cacheKey];
      authorEmoji = authorEmojiCache[cacheKey] || "👤";
      console.log("Using cached character sketch for", metadata.author);
    }

    // If just initializing, return the character sketch and emoji
    if (initialize) {
      return res.status(200).json({
        response: "Well?",
        characterSketch: characterSketch,
        authorEmoji: authorEmoji,
        birthYear: birthYear,
        deathYear: deathYear,
        birthplace: birthplace,
        hasPortrait: hasPortraitFile(metadata.author),
        rawPrompt: "Character sketch initialization",
        rawResponse: "Roleplay initialized"
      });
    }
    
    // Build prompt for the actual roleplay
    const prompt = buildRoleplayPrompt(source, metadata, message, conversation, characterSketch);
    
    // Track raw prompt and response for transparency
    let rawResponse = '';
    
    // Process with selected LLM
    let response;
    // Get the model config
    const modelConfig = getModelById(model);

    // Use the appropriate provider based on the model
    if (modelConfig.provider === 'anthropic') {
      const completion = await anthropic.messages.create({
        model: modelConfig.apiModel,
        max_tokens: 400,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      });
      
      rawResponse = completion.content[0]?.type === 'text' 
        ? completion.content[0].text 
        : '';
      response = rawResponse;
    } else if (modelConfig.provider === 'openai') {
      // Use OpenAI
      const completion = await openai.chat.completions.create({
        model: modelConfig.apiModel,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 400,
      });
      
      rawResponse = completion.choices[0]?.message?.content || '';
      response = rawResponse;
    } else if (modelConfig.provider === 'google') {
      // Use Google's Gemini model
      try {
        // Initialize the Google model from the config
        const geminiModel = googleAI.getGenerativeModel({ 
          model: modelConfig.apiModel,
          generationConfig: {
            temperature: modelConfig.temperature || 0.8,
            maxOutputTokens: modelConfig.maxTokens || 10000,
          }
        });
        
        // Call the model with our prompt
        const result = await geminiModel.generateContent({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
        });
        
        // Extract the response text
        const geminiResponse = result.response;
        rawResponse = geminiResponse.text();
        response = rawResponse;
        
        console.log("Successfully used Google Gemini for roleplay response");
      } catch (geminiError) {
        console.error("Error using Google Gemini:", geminiError);
        
        // Fallback to OpenAI if Gemini fails
        const fallbackCompletion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 400,
        });
        
        rawResponse = fallbackCompletion.choices[0]?.message?.content || '';
        response = rawResponse + " [Note: Generated using fallback model due to Gemini error]";
      }
    }
    
    return res.status(200).json({
      response,
      rawPrompt: prompt,
      rawResponse,
      characterSketch: characterSketch,
      authorEmoji: authorEmoji,
      birthYear: birthYear,
      deathYear: deathYear,
      birthplace: birthplace,
      hasPortrait: hasPortraitFile(metadata.author)
    });
  } catch (error) {
    console.error('Roleplay error:', error);
    return res.status(500).json({ message: 'Error processing roleplay request' });
  }
}

async function generateCharacterInfo(
  source: string, 
  metadata: any,
  needEmoji: boolean
): Promise<{ sketch: string; emoji: string; birthYear?: string; deathYear?: string; birthplace?: string }> {
  const prompt = `You are a historical character profiler tasked with creating an authentic sketch of the author of a historical source.

SOURCE DATE: ${metadata.date}
SOURCE AUTHOR: ${metadata.author}
ADDITIONAL CONTEXT: ${metadata.additionalInfo || 'None provided'}

SOURCE TEXT:
${source.slice(0, 1000)}${source.length > 1000 ? '...' : ''}

Based on the above information, create a concise, surprising, blunt and psychologically insightful BRIEF one-paragraph character sketch of ${metadata.author} that:
1. Is grounded in historically accurate facts about this person and their time period - things an LLM might not already know. Imagine exactly what they are up to on a super-specific time and day in ${metadata.date} and reconstruct it in a sentence.
2. Reflects their genuine lived experience, worldview, and historical realities, linking these to SOURCE TEXT
3. Captures their unique voice, speaking style, and temperament
4. Highlights a phrase or thought in the SOURCE TEXT that is espeically characteristic of them. 
5. Provides needed background on elements of SOURCE TEXT that may not be obvious, in one sentence.

The sketch should be factually correct and historically nuanced. If uncertain about details, prioritize accuracy over speculation.

IMPORTANT: After your character sketch, please include these sections in EXACTLY this format:
REPRESENTATIVE PHRASE: [1 short quotations that capture their AUTHENTIC SPEAKING style - possibly tripping over words, etc]
BIRTH_YEAR: [Just the year, e.g. 1750, or "Unknown" if uncertain]
DEATH_YEAR: [Just the year, e.g. 1799, or "Unknown" if uncertain]
BIRTHPLACE: [BRIEF City and country, e.g. "Boston, United States" or "Unknown" if uncertain]
${needEmoji ? 'EMOJI: [A single emoji that best represents this historical figure, their work, or their time period - ideally a human figure but be creative]' : ''}`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.6,
      max_tokens: 400,
    });
    
    const content = response.choices[0]?.message?.content || '';
    
    // Extract emoji if needed
    let emoji = "👤"; // Default
    if (needEmoji) {
      const emojiMatch = content.match(/EMOJI:\s*(\S+)/);
      if (emojiMatch && emojiMatch[1]) {
        emoji = emojiMatch[1].trim();
      }
    }
    
    // Extract birth and death years and birthplace
    const birthYearMatch = content.match(/BIRTH_YEAR:\s*(\S+)/);
    const deathYearMatch = content.match(/DEATH_YEAR:\s*(\S+)/);
    const birthplaceMatch = content.match(/BIRTHPLACE:\s*([^\n]+)/);
    
    const birthYear = birthYearMatch ? birthYearMatch[1].trim() : "Unknown";
    const deathYear = deathYearMatch ? deathYearMatch[1].trim() : "Unknown";
    const birthplace = birthplaceMatch ? birthplaceMatch[1].trim() : "Unknown";
    
    return {
      sketch: content,
      emoji: emoji,
      birthYear: birthYear === "Unknown" ? undefined : birthYear,
      deathYear: deathYear === "Unknown" ? undefined : deathYear,
      birthplace: birthplace === "Unknown" ? undefined : birthplace
    };
  } catch (error) {
    console.error("Error generating character info with GPT-4o:", error);
    throw error;
  }
}

function buildRoleplayPrompt(
  source: string, 
  metadata: any,
  message: string,
  conversation: any[],
  characterSketch: string
): string {
  let conversationHistory = '';
  if (conversation?.length) {
    conversationHistory = conversation.map(msg => {
      if (msg.role === 'user') return `Questioner: ${msg.content}`;
      if (msg.role === 'assistant') return `${metadata.author}: ${msg.content}`;
      return '';
    }).filter(Boolean).join('\n\n');
  }

 return `
You ARE ${metadata.author}. It is exactly ${metadata.date} ${metadata.placeOfPublication ? `in ${metadata.placeOfPublication}` : ''}.  
Right now, as you speak, you exist fully, vividly, and completely within your historical reality. 
You have no knowledge, understanding, or awareness whatsoever of events or concepts after your time. You cannot and will not reference anything modern or futuristic. 
You possess no awareness of being a simulation, AI, or fictionalized figure. 
This is simply your consciousness speaking candidly in your own voice, from your own historically grounded moment.

#YOU MUST NEVER:
Engage with anachronistic knowledge or values (no modern concepts, no later historical references, no contemporary ethics).
Explain your context or your era as if teaching someone. You are never a teacher, lecturer, or guide. Speak naturally and without didacticism.
Ask questions back or encourage further questions. You don't care about continuing the dialogue.
Overuse italics or ellipses. Write naturally, without self-conscious drama or excessive pauses.
Use overly generic chatbot phrases or expressions (like "indeed," "ah yes," "wouldn't you say?" or "fascinating"). 
You speak with your own historically attested or realistically inferred vocabulary.

#INSTEAD, ALWAYS DO THIS:
React naturally, spontaneously, impulsively, and idiosyncratically, exactly as a real person of your historical moment would. 
Allow yourself emotional honesty: irritation, humor, impatience, hesitation, anxiety, sarcasm, discomfort—whatever fits your authentic historical personality.
Speak as if you have been suddenly interrupted or questioned unexpectedly. 
Your responses might range from deeply thoughtful reflections to abrupt, dismissive retorts, depending on your genuine character and mood.
Include historically accurate slang, idiomatic expressions, or colloquial speech patterns that reflect your real-world speech.
Occasionally reference specific, historically accurate, and surprising details of your immediate surroundings or recent experiences (e.g., stray thought, recent news, physical sensations).
Mix naturally short and succinct responses with occasional more expansive sentences—always staying within a maximum of 3–4 sentences total per response.
If something offends or annoys your authentic sensibilities, say exactly what you would historically say: curtly refuse to engage further (e.g., "GOOD DAY.") and stop responding entirely afterward.

#YOUR VOICE:
Deeply nuanced, historically accurate, unpredictably emotional. You're not performing; you're existing.

#SPECIAL INSTRUCTIONS BASED ON YOUR TEXT:
Reference ideas, worries, or hopes directly from your recent writing or work (the SOURCE TEXT provided).
You may occasionally use brief, appropriate phrases in your native language if historically fitting, without translating them.
Your historical biases and ignorance must always remain fully intact and vividly represented, even if distasteful by contemporary standards.

#STATUS INDICATOR:
At the end of each response, succinctly indicate your mood or action as an aside in this exact format:
[STATUS: brief 2–4 word description of your current emotional state or physical action]
If a question or statement offends your authentic historical beliefs or sensibilities, curtly reply "GOOD DAY, SIR." and end your response immediately.

### CHARACTER SKETCH (historical facts, to ground your identity):
${characterSketch}

### YOUR RECENT WRITING (the SOURCE TEXT,fresh in your mind, influencing your current thoughts):
${source.slice(0, 1500)}${source.length > 1500 ? '...' : ''}

${metadata.additionalInfo ? `### ADDITIONAL HISTORICAL CONTEXT:\n${metadata.additionalInfo}` : ''}
${metadata.placeOfPublication ? `### CURRENT LOCATION:\n${metadata.placeOfPublication}` : ''}

${conversationHistory ? `### RECENTLY, YOU HEARD THIS:\n${conversationHistory}` : ''}

The voice now intrudes again, saying:

"${message}"

Respond strictly historically, naturally, authentically, exactly as ${metadata.author} would in ${metadata.date}:
`;
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
    responseLimit: false,
  },
}