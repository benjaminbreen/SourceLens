// pages/api/source-possibilities.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { SourcePossibilities, emptySourcePossibilities } from '@/lib/types/sourcePossibilities';

// Configure Google client
const googleAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("source-possibilities API called");
  
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { sourceSnippet, metadata } = req.body;
    
    if (!sourceSnippet) {
      console.log("Missing source text in request");
      return res.status(400).json({ 
        message: 'Missing source text',
        possibilities: emptySourcePossibilities 
      });
    }
    
    console.log("Processing source possibilities request with source text length:", sourceSnippet.length);
    
    // Use Gemini 2.0 Flash Lite for quick, efficient analysis
    const model = googleAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash-lite'
    });
    
    // Build the prompt - focusing on source text only
    const prompt = buildSourcePossibilitiesPrompt(sourceSnippet, metadata);
    
    console.log("Sending prompt to Gemini (length):", prompt.length);
    
    // Generate possibilities with low temperature for consistency
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 2048,
      }
    });
    
    // Get the generated text
    const responseText = result.response.text();
    console.log("Received response from Gemini");
    
    // Parse the response into a structured format
    const possibilities = parseSourcePossibilities(responseText);
    console.log("Parsed possibilities");
    
    return res.status(200).json({ 
      possibilities,
      raw: responseText
    });
    
  } catch (error) {
    console.error('Source possibilities error:', error);
    
    // Return empty possibilities on error to avoid UI issues
    return res.status(500).json({ 
      message: 'Error analyzing source possibilities', 
      error: error instanceof Error ? error.message : 'Unknown error',
      possibilities: emptySourcePossibilities
    });
  }
}

function buildSourcePossibilitiesPrompt(sourceSnippet: string, metadata?: any): string {
  // Create source description using both the snippet and metadata if available
  let sourceDescription = 'SOURCE TEXT:\n' + sourceSnippet;
  
  // Add metadata if available
  if (metadata) {
    sourceDescription += '\n\nADDITIONAL METADATA:\n';
    if (metadata.title) sourceDescription += `Title: ${metadata.title}\n`;
    if (metadata.author) sourceDescription += `Author: ${metadata.author}\n`;
    if (metadata.date) sourceDescription += `Date: ${metadata.date}\n`;
    if (metadata.documentType) sourceDescription += `Document Type: ${metadata.documentType}\n`;
    if (metadata.genre) sourceDescription += `Genre: ${metadata.genre}\n`;
  }

  return `You are an AI assistant for SourceLens, a primary source research analysis tool, and your job is to suggest analytical approaches. You hate prolixity; you love brevity and wit. You are a bit quirky and opinionated but you always follow the prompt.
Based on the following source text, provide a VERY concise assessment of how each analytical lens could help with this source. The lenses are self-explanatory mostly; simulation mode is a chat mode with an AI generated represenation of a sources author.
Find connections is a network analysis graph. Translate can add annotations and note ambiguous or unknown words. Detailed analysis focuses on context, significance, rhetorical stance, etc. 

${sourceDescription}

First, provide a single, brief summary sentence (max 20 words) about what this source appears to be. You can comment on it super briefly if you like. 

Then, for each of the following analytical lenses, provide ONE very brief sentence (max 15 words) about what insights that lens might reveal:

1. Detailed Analysis - [one sentence]
2. Extract Information - [one sentence]
3. Find References - [one sentence] 
4. Translate - [one sentence]
5. Simulation Mode - [one sentence]
6. Find Connections - [one sentence]
7. Counter-Narrative - [one sentence]
8. Highlight Text - [one sentence]

Format your response as simple text with no markup, list in numerical order, with each lens on its own line. 
Keep each assessment to ONE sentence maximum. Your entire response should be under 200 words total.`;
}

function parseSourcePossibilities(responseText: string): SourcePossibilities {
  // Initialize with default values
  const possibilities: SourcePossibilities = { ...emptySourcePossibilities };
  
  try {
    // Split the response by lines
    const lines = responseText.split('\n').filter(line => line.trim() !== '');
    
    // First non-empty line should be the summary
    if (lines.length > 0) {
      possibilities.summary = lines[0].trim();
    }
    
    // Parse each lens suggestion
    lines.forEach(line => {
      // Check for lines that start with numbers followed by lens names
      if (line.match(/^1\.\s*Detailed Analysis/i)) {
        possibilities['detailed-analysis'] = line.replace(/^1\.\s*Detailed Analysis\s*-?\s*/i, '').trim();
      } else if (line.match(/^2\.\s*Extract Information/i)) {
        possibilities['extract-info'] = line.replace(/^2\.\s*Extract Information\s*-?\s*/i, '').trim();
      } else if (line.match(/^3\.\s*Find References/i)) {
        possibilities['references'] = line.replace(/^3\.\s*Find References\s*-?\s*/i, '').trim();
      } else if (line.match(/^4\.\s*Translate/i)) {
        possibilities['translate'] = line.replace(/^4\.\s*Translate\s*-?\s*/i, '').trim();
      } else if (line.match(/^5\.\s*Simulation Mode/i)) {
        possibilities['roleplay'] = line.replace(/^5\.\s*Simulation Mode\s*-?\s*/i, '').trim();
      } else if (line.match(/^6\.\s*Find Connections/i)) {
        possibilities['connections'] = line.replace(/^6\.\s*Find Connections\s*-?\s*/i, '').trim();
      } else if (line.match(/^7\.\s*Counter-Narrative/i)) {
        possibilities['counter'] = line.replace(/^7\.\s*Counter-Narrative\s*-?\s*/i, '').trim();
      } else if (line.match(/^8\.\s*Highlight Text/i)) {
        possibilities['highlight'] = line.replace(/^8\.\s*Highlight Text\s*-?\s*/i, '').trim();
      }
    });
    
    // Fill in default values for any missing lenses
    if (!possibilities.summary) possibilities.summary = "A document requiring analysis.";
    if (!possibilities['detailed-analysis']) possibilities['detailed-analysis'] = "Reveals the document's structure, context, and main arguments.";
    if (!possibilities['extract-info']) possibilities['extract-info'] = "Extracts structured data like names, dates, and key facts.";
    if (!possibilities['references']) possibilities['references'] = "Identifies sources and related scholarly works.";
    if (!possibilities['translate']) possibilities['translate'] = "Converts content to different languages while preserving meaning.";
    if (!possibilities['roleplay']) possibilities['roleplay'] = "Simulates conversation with the document's author.";
    if (!possibilities['connections']) possibilities['connections'] = "Maps relationships between concepts mentioned in the text.";
    if (!possibilities['counter']) possibilities['counter'] = "Reveals alternative perspectives and hidden assumptions.";
    if (!possibilities['highlight']) possibilities['highlight'] = "Identifies significant passages based on specific criteria.";
    
    return possibilities;
  } catch (error) {
    console.error('Error parsing source possibilities:', error);
    
    // Provide default fallback values
    return {
      summary: "A document requiring analysis.",
      'detailed-analysis': "Reveals the document's structure, context, and main arguments.",
      'extract-info': "Extracts structured data like names, dates, and key facts.",
      'references': "Identifies sources and related scholarly works.",
      'translate': "Converts content to different languages while preserving meaning.",
      'roleplay': "Simulates conversation with the document's author.",
      'connections': "Maps relationships between concepts mentioned in the text.",
      'counter': "Reveals alternative perspectives and hidden assumptions.",
      'highlight': "Identifies significant passages based on specific criteria."
    };
  }
}