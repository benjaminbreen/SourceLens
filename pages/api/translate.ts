// pages/api/translate.ts
// API endpoint for translating source text with customizable parameters
// Supports multiple target languages and different translation styles

import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getModelById } from '@/lib/models';

// Only initialize OpenAI if the API key exists
let openai: any = null;
try {
  const { OpenAI } = require('openai');
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || "",
  });
} catch (error) {
  console.warn('OpenAI client initialization failed, will fallback to other providers');
}

// Only initialize Anthropic if the API key exists
let anthropic: any = null;
try {
  const { Anthropic } = require('@anthropic-ai/sdk');
  anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY || "",
  });
} catch (error) {
  console.warn('Anthropic client initialization failed, will fallback to other providers');
}

// Configure Google client
let googleAI: any = null;
try {
  googleAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");
} catch (error) {
  console.warn('Google client initialization failed');
}

// Default translation model - prioritize Google's Gemini for translations
const DEFAULT_TRANSLATION_MODEL = 'gemini-2.0-pro-exp-02-05';

// Supported target languages
export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ru', name: 'Russian' },
  { code: 'ar', name: 'Arabic' }
];

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
      targetLanguage = 'en',
      translationScope = 'all',
      explanationLevel = 'minimal',
      literalToPoetic = 0.5, // 0 = literal, 1 = poetic
      preserveLineBreaks = true,
      includeAlternatives = false,
      modelId = DEFAULT_TRANSLATION_MODEL,
      isContinuation = false,
      continuationContext = '',
      continuationIndex = 0
    } = req.body;
    
    // Validate input
    if (!source) {
      return res.status(400).json({ message: 'Missing source text' });
    }
    
    // Get model configuration
    let modelConfig;
    try {
      modelConfig = getModelById(modelId);
    } catch (error) {
      // If model not found, use default
      console.warn(`Model ID ${modelId} not found, using ${DEFAULT_TRANSLATION_MODEL}`);
      modelConfig = getModelById(DEFAULT_TRANSLATION_MODEL);
    }
    
    // Log request details
    console.log("Translation request received:", {
      sourceLength: source?.length,
      targetLanguage,
      translationScope,
      explanationLevel,
      literalToPoetic,
      preserveLineBreaks,
      includeAlternatives,
      modelId: modelConfig.id,
      provider: modelConfig.provider
    });
    
    // Build the translation prompt
    const prompt = buildTranslationPrompt(
      source,
      metadata,
      targetLanguage,
      translationScope,
      explanationLevel,
      literalToPoetic,
      preserveLineBreaks,
      includeAlternatives
    );
    
    // Track raw prompt and response
    let rawPrompt = prompt;
    let rawResponse = '';
    let translation = '';
    
    // Process with selected provider or fallback to Google
    if (modelConfig.provider === 'google' && googleAI) {
      console.log(`Using Google model: ${modelConfig.apiModel}`);
      const model = googleAI.getGenerativeModel({ model: modelConfig.apiModel });
      
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3, // Lower temperature for more accurate translations
          maxOutputTokens: 8192,
        },
      });
      
      rawResponse = result.response.text();
      translation = rawResponse;
    } else if (modelConfig.provider === 'anthropic' && anthropic) {
      console.log(`Using Anthropic model: ${modelConfig.apiModel}`);
      const response = await anthropic.messages.create({
        model: modelConfig.apiModel,
        max_tokens: 4000,
        system: "You are a world-class translator with expertise in historical documents, literary works, and technical texts. Provide accurate translations that respect the user's preferences regarding literal vs. poetic style, while maintaining the original meaning and cultural context.",
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
      });
      
      rawResponse = response.content[0]?.type === 'text' 
        ? response.content[0].text 
        : '';
      translation = rawResponse;
    } else if (modelConfig.provider === 'openai' && openai) {
      console.log(`Using OpenAI model: ${modelConfig.apiModel}`);
      const response = await openai.chat.completions.create({
        model: modelConfig.apiModel,
        messages: [
          { 
            role: 'system', 
            content: "You are a world-class translator with expertise in historical documents, literary works, and technical texts. Provide accurate translations that respect the user's preferences regarding literal vs. poetic style, while maintaining the original meaning and cultural context."
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 4000,
      });
      
      rawResponse = response.choices[0]?.message?.content || '';
      translation = rawResponse;
    } else {
      // If the selected provider isn't available, try Google as fallback
      if (googleAI) {
        console.log(`Provider ${modelConfig.provider} not available, falling back to Google Gemini`);
        const model = googleAI.getGenerativeModel({ model: 'gemini-2.0-pro-exp-02-05' });
        
        const result = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 8192,
          },
        });
        
        rawResponse = result.response.text();
        translation = rawResponse;
      } else {
        throw new Error('No API clients are available for translation');
      }
    }
    
    return res.status(200).json({
      translation,
      rawPrompt,
      rawResponse,
      modelUsed: modelConfig.name,
      targetLanguage,
      translationScope,
      explanationLevel
    });
    
  } catch (error) {
    console.error('Translation error:', error);
    return res.status(500).json({ 
      message: 'Error processing translation',
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}

// Build the translation prompt based on user preferences
function buildTranslationPrompt(
  source: string,
  metadata: any,
  targetLanguage: string,
  translationScope: string,
  explanationLevel: string,
  literalToPoetic: number,
  preserveLineBreaks: boolean,
  includeAlternatives: boolean,
  isContinuation = false,
  continuationContext = ''
): string {
  // Get language name from code
  const languageName = SUPPORTED_LANGUAGES.find(lang => lang.code === targetLanguage)?.name || 'English';
  
  // Determine translation style based on literal vs. poetic slider
  let translationStyle = '';
  if (literalToPoetic <= 0.25) {
    translationStyle = 'extremely literal and precise, prioritizing word-for-word accuracy over fluency';
  } else if (literalToPoetic <= 0.5) {
    translationStyle = 'mostly literal while maintaining readability, staying close to the original text';
  } else if (literalToPoetic <= 0.75) {
    translationStyle = 'balanced between accuracy and natural expression, with some literary qualities';
  } else {
    translationStyle = 'poetic and literary, capturing the spirit and emotional impact of the original, even if it requires some creative interpretation';
  }
  
  // Build base prompt with continuation context if needed
  let prompt = `You are an expert translator tasked with translating ${isContinuation ? 'the continuation of' : ''} the following ${metadata?.documentType || 'text'} from ${metadata?.date || 'unknown date'} ${metadata?.author ? `by ${metadata.author}` : ''} into ${languageName}.`;

  // Add continuation context if this is a continuation
  if (isContinuation && continuationContext) {
    prompt += `\n\nIMPORTANT: This is a continuation of a previous translation. ${continuationContext}\n\n`;
  }

  prompt += `\nSOURCE TEXT TO TRANSLATE:
${source}

TRANSLATION INSTRUCTIONS:
1. Use a ${translationStyle} translation approach.
2. ${preserveLineBreaks ? 'Preserve the original line breaks and paragraph structure exactly.' : 'Format the text naturally in the target language, adjusting line breaks as needed.'}
3. ${includeAlternatives ? 'For ambiguous or difficult-to-translate terms, include alternative possible translations in [square brackets].' : 'Do not include alternative translations or notes within the translated text.'}
`;

  // Add explanation level instructions
  if (explanationLevel === 'minimal') {
    prompt += '4. Do not add explanatory notes or commentary.\n';
  } else if (explanationLevel === 'moderate') {
    prompt += '4. Add brief explanatory notes in [square brackets] for culturally-specific concepts or historical references that may be unclear to readers of the target language.\n';
  } else if (explanationLevel === 'extensive') {
    prompt += '4. Add detailed explanatory notes in [square brackets] for culturally-specific concepts, historical references, and important contextual information. Include brief etymological information for key terms when relevant.\n';
  }

  // Add translation scope instructions
  if (translationScope !== 'all' && !isContinuation) {
    prompt += `5. Only translate the following portion of the text: ${translationScope}\n`;
  }

  // Add instructions for historical/specialized text
  prompt += `
ADDITIONAL HISTORICAL CONTEXT:
- This translation is for scholarly research purposes.
- The original text is from ${metadata?.date || 'an unknown date'} and may contain archaic language or specialized terminology.
- The cultural context includes ${metadata?.placeOfPublication || 'unknown location'}.
- The document type is ${metadata?.documentType || 'unknown'}.
- The subject matter relates to ${metadata?.genre || metadata?.academicSubfield || 'unknown field'}.

${isContinuation ? "Begin your translation where the previous translation left off, maintaining consistency with the previous translated content." : ""}

Please provide only the translated text with no additional commentary outside of what was requested in the instructions. Do not include the original text in your response.
`;

  return prompt;
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
    responseLimit: false,
  },
};