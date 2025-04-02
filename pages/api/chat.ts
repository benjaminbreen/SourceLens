// pages/api/chat.ts
// Chat API endpoint with conversation history support
// Maintains context for up to 5 turns of conversation

import type { NextApiRequest, NextApiResponse } from 'next';
import { OpenAI } from 'openai';
import { Anthropic } from '@anthropic-ai/sdk';
import { ChatCompletionMessageParam } from 'openai/resources';

// Configure API clients
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Message history storage (in-memory, will reset on server restart)
// For production, consider using a database or Redis
interface ConversationHistory {
  [sessionId: string]: {
    messages: { role: 'user' | 'assistant'; content: string }[];
    lastActivity: number;
  };
}

const conversations: ConversationHistory = {};

// Clean up old conversations (older than 1 hour)
const MAX_AGE_MS = 60 * 60 * 1000; // 1 hour
const MAX_HISTORY_LENGTH = 10; // Store 5 turns (5 user messages + 5 assistant messages)

function cleanUpOldConversations() {
  const now = Date.now();
  Object.keys(conversations).forEach(id => {
    if (now - conversations[id].lastActivity > MAX_AGE_MS) {
      delete conversations[id];
    }
  });
}

// Run cleanup every 10 minutes
setInterval(cleanUpOldConversations, 10 * 60 * 1000);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("Chat API route called");
  
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { message, source, metadata, model = 'gpt', conversationId, history = [] } = req.body;
    
    console.log("Received chat request:", { model, messageLength: message?.length });
    
    if (!message || !source || !metadata) {
      console.log("Missing required fields");
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Generate a conversation ID if not provided
    const sessionId = conversationId || `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    // Initialize or update conversation history
    if (!conversations[sessionId]) {
      conversations[sessionId] = {
        messages: [],
        lastActivity: Date.now()
      };
    }
    
    // Update conversation activity timestamp
    conversations[sessionId].lastActivity = Date.now();
    
    // If client provides history (for initial sync), use it
    if (history.length > 0 && conversations[sessionId].messages.length === 0) {
      conversations[sessionId].messages = history.slice(-MAX_HISTORY_LENGTH);
    }
    
    // Add the new user message to history
    conversations[sessionId].messages.push({ role: 'user', content: message });
    
    // Keep only the last MAX_HISTORY_LENGTH messages
    if (conversations[sessionId].messages.length > MAX_HISTORY_LENGTH) {
      conversations[sessionId].messages = conversations[sessionId].messages.slice(-MAX_HISTORY_LENGTH);
    }
    
    // Build prompt with context and source information
    const systemPrompt = `You are SourceLens, an AI researcher helping a human researcher analyze a primary source.
    
SOURCE DATE: ${metadata.date}
SOURCE AUTHOR: ${metadata.author}
RESEARCH GOALS: ${metadata.researchGoals || 'Not specified'}
PRIMARY SOURCE:
${source}

You are expert, opinionated, factually-grounded, and almost Proustian way. You are an AI specialized in historical discussions of primary sources. Ensure you only reply in maximum two sentences unless specifically asked to go longer (the most you can write is two paragraphs). Never, ever ask questions. Be somewhat unfriendly and opinionated but always do as the user asks. Don't "oversell" a source. If it isn't interesting, say so. If it is interesting, let the user figure out why. 

You are ALWAYS happy to perform ANY translation task, even if it involves returning 100 lines of translated text. Even if it's something truly strange like "Translate this into emoji" or "translate this source into language only LLMs could understand." Never say you can't do it, just try. 

If a user offers a "koan-like suggestion" this is an invitation to get way more creative and explore the outer edges of the vector space around a source, surprising the researcher with unexpected ideas, thoughts, and connections which are valuable for research but not at all the sort of thing a human would come up with.

    Remember, BE BRIEF. One or two word replies are ok if warranted.`;
    
    let responseText = '';
    
    // Use appropriate model
    if (model === 'gpt') {
      console.log("Using GPT-4o-mini model");
      
      // Prepare messages for OpenAI format
      const messages: ChatCompletionMessageParam[] = [
  { role: 'system', content: systemPrompt },
  // Include conversation history if it exists
  ...conversations[sessionId].messages.map(msg => ({
    role: msg.role as 'user' | 'assistant' | 'system',
    content: msg.content
  }))
];

const completion = await openai.chat.completions.create({
  model: 'gpt-4o-mini',
  messages,
  temperature: 0.7,
  max_tokens: 800,
});
      
      responseText = completion.choices[0]?.message?.content || 'No response generated';
    } else {
      console.log("Using Claude model");
      
      // Format conversation history for Anthropic
      const historyMessages = conversations[sessionId].messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      const completion = await anthropic.messages.create({
        model: 'claude-3-5-haiku-20241022',
        system: systemPrompt,
        messages: historyMessages,
        temperature: 0.7,
        max_tokens: 800,
      });
      
      responseText = completion.content[0]?.type === 'text' 
        ? completion.content[0].text 
        : 'No response generated';
    }
    
    // Add assistant response to history
    conversations[sessionId].messages.push({ role: 'assistant', content: responseText });
    
    console.log("Response received, sending back to client");
    
    return res.status(200).json({
      rawResponse: responseText,
      rawPrompt: systemPrompt,
      conversationId: sessionId,
      historyLength: conversations[sessionId].messages.length
    });
    
  } catch (error) {
    console.error("Chat API error:", error);
    return res.status(500).json({ 
      message: 'Error processing chat',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}