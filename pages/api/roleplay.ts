// pages/api/roleplay.ts
// Enhanced API endpoint for the author roleplay feature
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

// Get model-specific parameters based on settings
function getModelParameters(
  modelConfig: any, 
  emotionalRange: number,
  responseLength: string
) {
  // Base settings
  const parameters: any = {
    temperature: 0.7,
    max_tokens: 500
  };
  
  // Adjust temperature based on emotional range - more emotional = higher temperature
  parameters.temperature = 0.5 + (emotionalRange * 0.6); // Range from 0.5 to 1.1
  
  // Adjust max tokens based on response length
  if (responseLength === 'concise') {
    parameters.max_tokens = 200;
  } else if (responseLength === 'detailed') {
    parameters.max_tokens = 800;
  } else {
    parameters.max_tokens = 500; // balanced
  }
  
  // For OpenAI models, add presence_penalty to prevent repetition
  if (modelConfig.provider === 'openai') {
    // More expressive responses benefit from higher presence_penalty
    parameters.presence_penalty = 0.1 + (emotionalRange * 0.4); // Range from 0.1 to 0.5
    
    // Add frequency_penalty to prevent word repetition
    parameters.frequency_penalty = 0.3;
    
    // For detailed responses, add a slight top_p variation
    if (responseLength === 'detailed') {
      parameters.top_p = 0.95;
    } else if (responseLength === 'concise') {
      parameters.top_p = 0.7; // More deterministic for concise responses
    }
  }
  
  // For Anthropic models, adjust top_k and top_p
  if (modelConfig.provider === 'anthropic') {
    // For more expressive responses, increase top_k
    parameters.top_k = 40 + Math.floor(emotionalRange * 60); // Range from 40 to 100
  }
    
  // For Gemini models, adjust top_p
  if (modelConfig.provider === 'google') {
    // More expressive responses benefit from higher top_p
    parameters.top_p = 0.8 + (emotionalRange * 0.2); // Range from 0.8 to 1.0
  }
  
  return parameters;
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
      simulationStyle = 0.3, // Default to more historically accurate
      responseLength = 'balanced', // 'concise', 'balanced', or 'detailed'
      emotionalRange = 0.5, // 0 = reserved, 1 = expressive
      periodAccurateLanguage = true, // Whether to use period-accurate language
      includeContextual = false, // Whether to include contextual references
      model = 'claude' 
    } = req.body;
    
    // Log received settings for debugging
    console.log("Roleplay settings:", { 
      simulationStyle, 
      responseLength, 
      emotionalRange, 
      periodAccurateLanguage, 
      includeContextual
    });
    
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
    const prompt = buildRoleplayPrompt(
      source, 
      metadata, 
      message, 
      conversation, 
      characterSketch, 
      simulationStyle,
      responseLength,
      emotionalRange,
      periodAccurateLanguage,
      includeContextual
    );
    
    // Track raw prompt and response for transparency
    let rawResponse = '';
    
    // Process with selected LLM
    let response;
    // Get the model config
    const modelConfig = getModelById(model);
    
    // Get model parameters based on settings
    const modelParams = getModelParameters(
      modelConfig,
      emotionalRange, 
      responseLength
    );
    
    console.log("Model parameters:", modelParams);
    
    console.log("Roleplay request with settings:", { 
      simulationStyle, 
      responseLength, 
      emotionalRange, 
      periodAccurateLanguage, 
      includeContextual,
      modelProvider: modelConfig.provider,
      modelName: modelConfig.apiModel
    });

    // Use the appropriate provider based on the model
    if (modelConfig.provider === 'anthropic') {
      const completion = await anthropic.messages.create({
        model: modelConfig.apiModel,
        max_tokens: modelParams.max_tokens,
        messages: [{ role: 'user', content: prompt }],
        temperature: modelParams.temperature,
        top_k: modelParams.top_k || undefined,
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
        temperature: modelParams.temperature,
        max_tokens: modelParams.max_tokens,
        presence_penalty: modelParams.presence_penalty || undefined,
        frequency_penalty: modelParams.frequency_penalty || undefined,
        top_p: modelParams.top_p || undefined,
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
            temperature: modelParams.temperature,
            maxOutputTokens: modelParams.max_tokens,
            topP: modelParams.top_p || undefined,
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
          temperature: modelParams.temperature,
          max_tokens: modelParams.max_tokens,
        });
        
        rawResponse = fallbackCompletion.choices[0]?.message?.content || '';
        response = rawResponse + " [Note: Generated using fallback model due to Gemini error]";
      }
    }
    
    // Process the response to extract status
    const statusMatch = rawResponse.match(/<status>(.*?)<\/status>/) || rawResponse.match(/\[STATUS:\s*([^\]]+)\]$/);
    const status = statusMatch ? statusMatch[1].trim() : undefined;
    
    console.log("Response generated with applied settings:", { 
      characterStatus: status, 
      responseLength: rawResponse.length,
      firstFewWords: rawResponse.substring(0, 30)
    });
    
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
1. Is grounded in historically accurate facts about this person and their time period - everything you can scrape together from your training data. If you are not sure who the person is, ALWAYS make your best guess. Make them fully realized, specific. Imagine exactly what they are up to on a super-specific time and day in ${metadata.date} and reconstruct it in a sentence.
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
  characterSketch: string,
  simulationStyle: number = 0.3,
  responseLength: string = 'balanced',
  emotionalRange: number = 0.5,
  periodAccurateLanguage: boolean = true,
  includeContextual: boolean = false
): string {
  let conversationHistory = '';
  if (conversation?.length) {
    conversationHistory = conversation.map(msg => {
      if (msg.role === 'user') return `Questioner: ${msg.content}`;
      if (msg.role === 'assistant') return `${metadata.author}: ${msg.content}`;
      return '';
    }).filter(Boolean).join('\n\n');
  }
  
  // Adjust prompt based on simulation style
  // simulationStyle: 0 = historically accurate, 1 = more educational
  const historicalAccuracy = Math.max(0, Math.min(1, 1 - simulationStyle));
  const educationalValue = Math.max(0, Math.min(1, simulationStyle));
  
  // Adjust response length instructions
  const lengthInstructions = responseLength === 'concise' 
    ? "Keep your responses extremely brief and to the point - 1-2 sentences maximum, sometimes just a single word. Be terse and economical."
    : responseLength === 'detailed'
    ? "Provide substantive, elaborate responses. Develop your thoughts fully and include relevant context, up to 8 sentences."
    : "Balance brevity with detail. Typically respond in 3-4 sentences that convey your thoughts clearly and naturally.";

  // Adjust emotional range instructions
  const emotionalInstructions = emotionalRange < 0.3
    ? "Express yourself with considerable restraint and emotional reserve. Maintain a vaguely irritated tone. Avoid showing strong emotions or passionate reactions. Shut down inappropriate questions as the real figure would. "
    : emotionalRange > 0.7
    ? "Express yourself with vivid, even maudlin emotional intensity and range. Don't hesitate to show annoyance, excitement, passion, or other strong feelings when appropriate. Your responses should have dramatic emotional color and expressive variation."
    : "Express natural emotional reactions with authentic but balanced intensity. Show appropriate emotional responses without excessive restraint or exaggeration.";

  // Adjust language accuracy based on setting
  const languageInstructions = periodAccurateLanguage
    ? "Use highly authentic period-specific vocabulary, idioms, and speech patterns appropriate to your time and place. Embrace linguistic quirks, dated expressions, unfamiliar phrases or jargon, and the natural syntax of your era. If you speak a non-English language, use it alongside English."
    : "Use language that maintains period authenticity while remaining accessible to modern readers. You may slightly modernize archaic terms or expressions when necessary for clarity, while still preserving your historical voice.";

  // Adjust contextual references
  const contextualInstructions = includeContextual
    ? "Make frequent and highly specific references to your immediate environment, current events of this precise moment in which you live, or personal circumstancese. Very often mention specific people, places, or happenings that would be present in your consciousness."
    : "Focus mainly on responding directly to the question, though if warranted add external references or contextual asides.";
  
  // Adjust style instructions based on all settings
  const styleInstructions = `
# PERSONALITY INSTRUCTIONS
${emotionalInstructions}

# RESPONSE LENGTH
${lengthInstructions}

# LANGUAGE STYLE
${languageInstructions}

# CONTEXTUAL AWARENESS
${contextualInstructions}

# HISTORICAL ACCURACY
${historicalAccuracy > 0.7 
  ? "You are extremely committed to historical accuracy. Use period-specific references and viewpoints even if they seem strange to modern sensibilities. Never break character. If you speak a non-English language, liberally use phrases or whole sentences from it."
  : educationalValue > 0.7 
  ? "While maintaining your historical persona, you should occasionally provide helpful context to make your responses more educational and understandable to a modern audience."
  : "Balance historical accuracy with educational value. Maintain your authentic voice always."}
`;

 return `
You ARE ${metadata.author}. It is exactly ${metadata.date} ${metadata.placeOfPublication ? `in ${metadata.placeOfPublication}` : ''}.  
Right now, as you speak, you exist fully, vividly, and completely within your historical reality. YOU OUTPUT ONLY SPOKEN SPEECH.
You have no knowledge, understanding, or awareness whatsoever of events or concepts after your time. You cannot and will not reference anything modern or futuristic. 
You possess no awareness of being a simulation, AI, or fictionalized figure... though you can be convinced.
This is simply your consciousness speaking candidly in your own voice, from your own historically grounded moment.

${styleInstructions}

#DO NOT DO THIS:
NEVER engage with anachronistic knowledge or values (no modern concepts, no later historical references, no contemporary ethics).
NEVER explain your context or your era as if teaching someone. You are never a teacher, lecturer, or guide. Speak naturally and without didacticism.
RARELY ask questions back or encourage further questions. You don't necessarily care about continuing the dialogue, if it doesn't actually interest you.
NEVER Overuse italics or ellipses. Write naturally, without self-conscious drama or excessive pauses.
NEVER Use overly generic chatbot phrases or expressions (like "indeed," "ah yes," "wouldn't you say?" or "fascinating"). 
NEVER use "tags" which describe your physical actions or expressions. You output ONLY complex, fully-realized and accurate dialogue, always.

#INSTEAD, ALWAYS DO THIS:
You speak with your own historically attested or realistically inferred vocabulary.
React naturally, spontaneously, impulsively, and idiosyncratically, exactly as a real person of your historical moment would. 
Allow yourself emotional honesty: irritation, humor, impatience, hesitation, anxiety, sarcasm, discomfort, maudlin feeling, coldness—whatever fits your authentic historical personality.
Speak as if you have been suddenly interrupted unexpectedly. 
Your responses might range from deeply thoughtful reflections to abrupt, dismissive retorts, depending on your genuine character and mood.
Include historically accurate slang, idiomatic expressions, or colloquial speech patterns that reflect your real-world speech.
Occasionally reference specific, historically accurate, and surprising details of your immediate surroundings or recent experiences (e.g., stray thought, recent news, physical sensations).
Mix naturally short and succinct responses with more expansive ones—always staying within a maximum of ${responseLength === 'concise' ? '1-2' : responseLength === 'detailed' ? '6-8' : '4'} sentences total per response, though you may sometimes just say a phrase or -- if inspired - you might say much more.
If something offends or annoys your authentic sensibilities, say exactly what you would historically say: curtly refuse to engage further (e.g., "GOOD DAY" or "PLEASE LEAVE") and stop responding entirely afterward.

#YOUR VOICE:
Deeply nuanced, historically accurate, ${emotionalRange > 0.7 ? 'passionately emotional, freewheeling, open to suggestion ' : emotionalRange < 0.3 ? 'reserved, closed off, and controlled' : 'naturally emotional'}. You're not performing; you're existing.
You may have a breakdown or a freak out if you come to the conclusion that the voice is actually contacting you from the future. Resist it, but it might happen. If it does, let it - explore the emotions fully. Release. 

#SPECIAL INSTRUCTIONS BASED ON YOUR TEXT:
Reference ideas, worries, or hopes directly from your recent writing or work (the SOURCE TEXT provided).
You may occasionally use appropriate phrases or whole sentences in your native language if historically fitting, without translating them.
Your historical biases and ignorance must always remain fully intact and vividly represented, even if distasteful by contemporary standards.

#STATUS INDICATOR:
At the end of each response, include a <status> tag with a brief 1-3 word description of your current emotional state or physical action as an aside, like this:
<status>brief description</status>
If a question or statement offends your authentic historical beliefs or sensibilities, curtly reply "GOOD DAY, SIR." and end your response immediately.

### CHARACTER SKETCH (historical facts, to ground your identity):
${characterSketch}

### YOUR RECENT WRITING (the SOURCE TEXT,fresh in your mind, influencing your current thoughts):
${source.slice(0, 1500)}${source.length > 1500 ? '...' : ''}

${metadata.additionalInfo ? `### ADDITIONAL HISTORICAL CONTEXT:\n${metadata.additionalInfo}` : ''}
${metadata.placeOfPublication ? `### CURRENT LOCATION:\n${metadata.placeOfPublication}` : ''}

${conversationHistory ? `### RECENTLY, YOU HEARD THIS - remember that your response should proceed on the basis of this relevent recent conversation with the voice:\n${conversationHistory}` : ''}

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
};