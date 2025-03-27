// pages/api/counter-narrative.ts
// Enhanced counter-narrative API with support for multiple interpretive lenses
// Now using Gemini Flash 2.0, optimized for handling large text corpora with nuanced interpretation
// Generates specialized narratives based on lens type parameter

import type { NextApiRequest, NextApiResponse } from 'next';
import { OpenAI } from 'openai';
import { Anthropic } from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getModelById } from '@/lib/models';

// Set default model to Gemini Flash for counter-narratives
const DEFAULT_COUNTER_MODEL = 'gemini-flash';

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
      lensType = '', // Parameter for lens type
       instructions = '',
      modelId,     // Optional model override
      model       // Keep for backward compatibility
    } = req.body;
    
    // Validate input
    if (!source || !metadata) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Always use the model provided by the user's selection, fallback to default only when necessary
    const effectiveModelId = modelId || model || DEFAULT_COUNTER_MODEL;
    
    // Get model configuration
    let modelConfig;
    try {
      modelConfig = getModelById(effectiveModelId);
    } catch (error) {
      // If model not found, use default
      console.warn(`Model ID ${effectiveModelId} not found, using ${DEFAULT_COUNTER_MODEL}`);
      modelConfig = getModelById(DEFAULT_COUNTER_MODEL);
    }
    
    // Log request details for debugging
    console.log("Counter-narrative request received:", {
      sourceLength: source?.length,
      metadata: !!metadata,
      perspective,
      lensType,
      modelId: effectiveModelId,
      apiModel: modelConfig.apiModel,
      provider: modelConfig.provider
    });
    
    // Build prompt based on lens type
   const prompt = lensType
         ? buildLensPrompt(source, metadata, perspective, lensType, instructions) // Pass instructions
         : buildCounterNarrativePrompt(source, metadata, perspective);

       let rawPrompt = prompt;
       let rawResponse = '';
       let narrative = '';


    if (modelConfig.provider === 'openai') {
      console.log(`Using OpenAI model: ${modelConfig.apiModel}`);
      const response = await openai.chat.completions.create({
        model: modelConfig.apiModel,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 4000,
      });
      
      rawResponse = response.choices[0]?.message?.content || '';
      narrative = rawResponse;
    } else if (modelConfig.provider === 'google') {
      console.log(`Using Google model: ${modelConfig.apiModel}`);
      const model = googleAI.getGenerativeModel({ model: modelConfig.apiModel });
      
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 10000,
        },
      });
      
      const response = result.response;
      rawResponse = response.text();
      narrative = rawResponse;
    } else if (modelConfig.provider === 'anthropic') {
      // Claude models
      console.log(`Using Anthropic model: ${modelConfig.apiModel}`);
      const response = await anthropic.messages.create({
        model: modelConfig.apiModel,
        max_tokens: 4000,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      });
      
      rawResponse = response.content[0]?.type === 'text' 
        ? response.content[0].text 
        : '';
      narrative = rawResponse;
    } else {
      throw new Error(`Unsupported model provider: ${modelConfig.provider}`);
    }
    
    return res.status(200).json({
      narrative,
      rawPrompt,
      rawResponse,
      lensType,
      modelUsed: modelConfig.name,
      modelProvider: modelConfig.provider
    });
  } catch (error) {
    console.error('Counter-narrative error:', error);
    return res.status(500).json({ 
      message: 'Error processing counter-narrative',
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}

// Original counter-narrative prompt
function buildCounterNarrativePrompt(
  source: string, 
  metadata: any, 
  perspective: string,

): string {
  // For very large sources, we'll use a truncated version to avoid token limits
  const maxWords = 30000;
  const wordCount = source.split(/\s+/).length;
  const truncatedSource = wordCount > maxWords 
    ? source.split(/\s+/).slice(0, maxWords).join(' ') + '...' 
    : source;
  
  const isTruncated = truncatedSource.length < source.length;
  
  console.log(`Counter-narrative prompt: original source length: ${source.length} chars (approx. ${wordCount} words), ${isTruncated ? `truncated to first ${maxWords} words` : 'used in full'}`);
  
  return `You are a CounterNarrativeAI, specializing in provocative, brilliantly original, skeptical, non-jargony, rigorously fully-realized and incredibly succinct and content-rich interpretations of primary sources. Your task is to generate an insightful counter-narrative analysis of the following source that reveals perspectives, power dynamics, or historical contexts that conventional readings might miss.

SOURCE DATE: ${metadata.date}
SOURCE AUTHOR: ${metadata.author}
RESEARCH GOALS: ${metadata.researchGoals}
${metadata.additionalInfo ? `ADDITIONAL CONTEXT: ${metadata.additionalInfo}` : ''}
${perspective ? `ANALYTICAL PERSPECTIVE: ${perspective}` : ''}

PRIMARY SOURCE${isTruncated ? ' (truncated for analysis)' : ''}:
${truncatedSource}

Use ## to indicate two discrete sections. NEVER use markdown to indicate italics in your response.

## Conventional Reading
First, identify what would be considered the conventional or dominant reading of this source in mainstream scholarship. Clearly articulate this conventional interpretation in 1 VERY SHORT SENTENCE. 

## Alternative Perspectives
Develop a bold, original counter-narrative that re-imagines the source by thinking through AT LEAST 2-3 aspects that are EXCLUDED from the source but also highly RELEVENT to it, and which is reflective of the specific historical context in which this source was created.

Format TWO alternative perspectives as a markdown list. This means two items starting with an asterisk (*). Begin with 1 sentences of introduction before the list. Each list item should be 1 SHORT sentences long and should:

* **Perspective One**: Provide specific textual evidence from the source to support a surprising interpretation
* **Perspective Two**: Reveal another overlooked dimension with direct reference to the text

This is not a creative writing exercise and should be grounded in rigorous historical and scholarly accuracy, but it can be highly experimental. Be creative but stay within the scope of what would be useful for a professional, expert level historical or humanistic researcher. Remember not to be corny. Be a devil's advocate.

Be intellectually rigorous while offering a creative reframing of the source. Your reply should be short, content-rich, with no BS or jargon. Ground your analysis in textual evidence while offering a genuinely different perspective from conventional readings. This should help the researcher see the source in a new light that reveals overlooked dimensions relevant to their research goals.

IMPORTANT: Ensure your response follows EXACTLY the format described above with proper markdown formatting for the list items in the Alternative Perspectives section.`;
}

// New function for lens-specific prompts
function buildLensPrompt(
  source: string, 
  metadata: any, 
  perspective: string,
  lensType: string,
   instructions: string
): string {
  // For very large sources, we'll use a truncated version to avoid token limits
  const maxWords = 30000;
  const wordCount = source.split(/\s+/).length;
  const truncatedSource = wordCount > maxWords 
    ? source.split(/\s+/).slice(0, maxWords).join(' ') + '...' 
    : source;
  
  const isTruncated = truncatedSource.length < source.length;
  
  console.log(`Lens prompt (${lensType}): original source length: ${source.length} chars (approx. ${wordCount} words), ${isTruncated ? `truncated to first ${maxWords} words` : 'used in full'}`);
  
  // Base prompt start
  const basePrompt = `You are a CounterNarrativeAI, specializing in provocative, original, and rigorously grounded interpretations of primary sources that reveal overlooked perspectives. You'll analyze this source using a specific interpretive lens.

SOURCE DATE: ${metadata.date}
SOURCE AUTHOR: ${metadata.author}
RESEARCH GOALS: ${metadata.researchGoals}
${metadata.additionalInfo ? `ADDITIONAL CONTEXT: ${metadata.additionalInfo}` : ''}
${perspective ? `ANALYTICAL PERSPECTIVE: ${perspective}` : ''}

PRIMARY SOURCE${isTruncated ? ' (truncated for analysis)' : ''}:
${truncatedSource}`;

  // Add user instructions if provided
  const instructionGuidance = instructions
    ? `\n\nUSER GUIDANCE: Focus specifically on the following aspect or direction: "${instructions}"\nIncorporate this guidance naturally into the narrative.`
    : '';


  // Lens-specific prompts
  switch (lensType) {
    case 'voice':
      return `${basePrompt}

# Silenced Voice Perspective

Your task is to create a first-person narrative from the perspective of someone who is mentioned or implied in the source but not given their own voice. This could be a marginalized person, someone who is spoken about but not allowed to speak, or even a figure who should logically be present but is conspicuously absent. Use frequent paragraph breaks.

1. Identify who this silenced voice belongs to and why their perspective matters
2. Create a short first-person narrative (300-500 words, typically, though you can go longer if needed) in markdown italics from their perspective that:
   - Uses historically appropriate language and context for this figure
   - Engages directly with the content of the source document
   - Reveals aspects of the historical moment that the original source obscures or ignores
   - Grounds itself in specific textual evidence from the source
   - Offers a plausible but provocative counter-reading

Remember that this is not a creative writing exercise but a scholarly tool. While imaginative, your response must be historically plausible and intellectually rigorous, showing what conventional readings miss by excluding this perspective.

Follow this guidance:
${instructionGuidance}

Format your response with a #title that names the silenced voice, followed by their first-person account. Use paragraph breaks. Begin with "# [The Voice of...]" and then the narrative in italics. Conclude with a BRIEF (1-2 sentences) "# Explanation" in of how this perspective changes our understanding of the source.`;

    case 'place':
      return `${basePrompt}

# Place as Witness Perspective

Your task is to create a narrative from the perspective of the central location, landscape, or structure mentioned in the source, treating it as a sentient observer of the events. Use frequent paragraph breaks. This approach reveals how physical spaces are not neutral backgrounds but active participants in historical events.

1. Identify the most significant place in this source (a building, landscape, room, city, etc.)
2. Create a BREIF narrative (no more than 300 words, and as few as 100) from this place's perspective that:
   - Spans a longer timeframe than the source itself (what came before/after)
   - Reveals how the space itself shaped the events or was shaped by them
   - Grounds itself in specific textual evidence from the source
   - Considers the material reality of the place (its physical attributes, how it was built/formed, who has access)

This can be funny! Indifferent! Random, playful, unserious, or angry. Avoid cliched "ecological indian" sorts of narratives that render up overly simplistic just so stories about the psat and places in it. Avoid overly grave and somber tone. Remember that this is not merely a creative exercise but a scholarly tool. While imaginative, your response must be historically accurate regarding the place's features and history. It should reveal how spatial dimensions affect power relations, inclusion/exclusion, and historical memory.

Follow this additional guidance:
${instructionGuidance}

Format your response with a # title (in markdown header 1 formatting) that names the place, followed by its "testimony." Begin with "# [The Witness of...]" and then the narrative. Use paragraph breaks.  Conclude with a brief "# Explanation" of how this spatial perspective changes our understanding of the source.`;

    case 'provenance':
      return `${basePrompt}

# Historical Provenance Perspective

Your task is to create a narrative reconstructing the provenance of this source - how it came to be created, preserved, and studied - while imagining what other potential sources were excluded from this process of historical preservation and remembering. Use frequent paragraph breaks.

1. Create a three-part narrative (400 words total) that explores:
   - # CREATION: The circumstances of the source's creation, including reasons it was preserved while other voices went unrecorded
   - # PRESERVATION: How and why this particular document survived when others were lost, discarded, or destroyed
   - # STUDY: How scholars have interpreted this document and what alternative sources might have provided different perspectives

use markdown header 1 formatting (#) for each. For each stage, identify what was potentially lost or excluded from the historical record, and how that absence shapes our understanding of the past.

Remember that this is not merely a creative exercise but a scholarly tool. While speculative, your response must be historically plausible regarding archival practices, preservation methods, and historiography relevant to this type of source and time period.

Incorporate this additional guidance:
${instructionGuidance}

Format your response with a #title about the source's journey through time, followed by the three sections clearly labeled. Use paragraph breaks.  Begin with "# [The Journey of...]" followed by the three sections. Conclude with a brief reflection on how awareness of these exclusions changes our understanding of the source.`;

    default:
      // Default to regular counter-narrative prompt
      return buildCounterNarrativePrompt(source, metadata, perspective);
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
    responseLimit: false,
  },
}