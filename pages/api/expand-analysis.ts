// pages/api/expand-analysis.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getModelById } from '@/lib/models'; // Assuming you have this helper

// Configure Google client (or adapt for OpenAI/Anthropic if needed)
const googleAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');
const EXPANSION_MODEL_ID = 'gemini-flash'; // Use a fast model for this

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const {
      sectionKey,     // e.g., 'context', 'author'
      sectionTitle,   // e.g., 'Context', 'Author Perspective'
      originalContent,// The text of the section being expanded
      userInput,      // The user's question/prompt for expansion
      fullAnalysis,   // The entire original detailed analysis for context (optional but helpful)
      metadata        // Source metadata (optional but helpful)
    } = req.body;

    // Validate input
    if (!sectionKey || !sectionTitle || !originalContent || !userInput) {
      return res.status(400).json({ message: 'Missing required fields for expansion' });
    }

    let modelConfig;
    try {
        modelConfig = getModelById(EXPANSION_MODEL_ID);
    } catch (error) {
        console.error(`Expansion model ${EXPANSION_MODEL_ID} not found:`, error);
        return res.status(500).json({ message: `Configuration error for model ${EXPANSION_MODEL_ID}` });
    }

    const prompt = `
      You are an expert assistant helping a user delve deeper into a specific section of a historical source analysis.
      The user is focusing on the "${sectionTitle}" section.

      Original Full Analysis Context (Optional):
      ${fullAnalysis ? fullAnalysis.substring(0, 2000) + '...' : 'Not provided.'}

      Original "${sectionTitle}" Section Content:
      ---
      ${originalContent}
      ---

      The user wants to expand on this section with the following specific question or focus:
      ---
      ${userInput}
      ---

      Based ONLY on the original section content and the user's request, provide a concise (2-4 sentences) expansion addressing the user's input. Do NOT introduce completely new topics not hinted at in the original section. Focus directly on elaborating or clarifying based on the user's query in relation to the provided section text. Do not repeat the user's question. Start the response directly.
    `;

    console.log(`Sending expansion request for section "${sectionKey}" to ${modelConfig.provider} model: ${modelConfig.apiModel}`);

    // --- Google Gemini Implementation (Adapt if using OpenAI/Anthropic) ---
    const model = googleAI.getGenerativeModel({ model: modelConfig.apiModel });
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.5, // Slightly creative but focused
        maxOutputTokens: 250, // Keep it concise
      },
      // Add safety settings if needed
    });

    const response = result.response;
    const expandedText = response.text();
    // --- End Google Gemini Implementation ---

    if (!expandedText) {
        console.error("LLM returned empty response for expansion.");
        throw new Error("Failed to generate expansion text.");
    }

    console.log(`Expansion generated for section "${sectionKey}"`);

    return res.status(200).json({ expandedText });

  } catch (error) {
    console.error('Error expanding analysis section:', error);
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return res.status(500).json({ message: 'Error processing expansion request', error: message });
  }
}

// Add API config if needed (e.g., for body size)
// export const config = { api: { bodyParser: { sizeLimit: '1mb' } } };