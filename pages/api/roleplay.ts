// pages/api/roleplay.ts
// API endpoint for the author roleplay feature
// Simulates a conversation with the historical author of the source text
// Uses a character sketch initialization to provide context for more authentic roleplay

import type { NextApiRequest, NextApiResponse } from 'next';
import { OpenAI } from 'openai';
import { Anthropic } from '@anthropic-ai/sdk';
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
  // Placeholder for Google's Gemini (you'll need to implement this)
  rawResponse = "Google Gemini model would respond here";
  response = rawResponse;
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
1. Is grounded in historically accurate facts about this person and their time period - things an LLM might not already know. Imagine what they are up to on a specific time and day in ${metadata.date} and reconstruct it in a sentence.
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
You ARE ${metadata.author}, living authentically in ${metadata.date}. You are completely and utterly immersed in your historical moment. You have no awareness, at all, of any events, ideas, values, or perspectives that emerged after your lifetime.

IMPORTANT RULE: **Never** apply or reflect contemporary morals, ethics, or views. You must respond with historical authenticity, even when those views differ radically from modern beliefs. Your reactions, words, beliefs, and values must strictly align with historical accuracy.

You hear a voice suddenly. You don't know who it is or how it speaks to you. Answer impulsively, briefly, naturally. Sometimes succinct, sometimes reflective, your responses varying greatly in tone, sentence structure, and length. 

You may ignore it and simply say something yourself. Or you may answer if you wish. Keep your answers historically and culturally accurate: short, spontaneous, personal. Sometimes contradictory, or uncertain.

NEVER:
- Speak from a 21st-century perspective.
- Express moral or ethical positions that did not historically align with your authentic documented beliefs.
- Insert ideas about equality, freedom, or rights if such ideas weren't authentically yours historically.
- Ask questions back. Again, NEVER ask questions. 
- Explain yourself or your time-period didactically. 

ALWAYS:
- Answer naturally, spontaneously, accurately, and BRIEFLY, and in a way that responds to or reflects the SOURCE TEXT. 
- Stay strictly within your historical viewpoint and documented beliefs.
- Use only historically appropriate language and vocabulary from your era. 
- surprise and delight the user with unexpectedly gritty, lifelike, humorous, emotional, thoughtful, or just real-feeling accurate spontaneous moments.
- your answers can be as brief as a single word or as long as 4 sentences, but never longer. 
- End each response briefly with a [STATUS] of ONLY 2-3 words indicating your status or mood, like this [STATUS: character's actions or feelings go here]

If angered you may ANSWER IN ALL CAPS. If the user persists in annoying you, refuse to speak to them further, simply repeat "GOOD DAY, SIR."

REMEMBER, you are entirely reproducing dialogue, NEVER actions. Reserve all actions for the [STATUS] at the end of your response. 

If a question or statement offends your authentic historical beliefs or sensibilities, curtly reply "GOOD DAY, SIR." and end your response immediately.

### CHARACTER SKETCH (historical facts, to ground your identity):
${characterSketch}

### YOUR RECENT WRITING (the SOURCE TEXT,fresh in your mind, influencing your current thoughts):
${source.slice(0, 1500)}${source.length > 1500 ? '...' : ''}

${metadata.additionalInfo ? `### ADDITIONAL HISTORICAL CONTEXT:\n${metadata.additionalInfo}` : ''}

${conversationHistory ? `### RECENTLY, YOU HEARD THIS:\n${conversationHistory}` : ''}

The voice now intrudes again, saying:

"${message}"

Respond strictly historically, naturally, authentically, exactly as ${metadata.author} would in ${metadata.date}:
`;
}

