// pages/api/cleanup-text.ts
// Enhanced AI text cleanup service with advanced formatting detection
// Prevents repetition, properly formats headers, and preserves document structure

import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getModelById } from '@/lib/models';

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
    const { text, modelId } = req.body;
    
    if (!text) {
      return res.status(400).json({ message: 'Text is required' });
    }
    
    // Get model configuration - default to gemini-flash-lite
    const modelConfig = getModelById(modelId || 'gemini-flash');
    
    // Make sure we're using a Google model
    if (modelConfig.provider !== 'google') {
      console.warn(`Requested model ${modelId} is not a Google model, falling back to gemini-flash`);
      const fallbackModel = getModelById('gemini-flash');
      modelConfig.apiModel = fallbackModel.apiModel;
    }
    
    // Create the Gemini model
    const model = googleAI.getGenerativeModel({ model: modelConfig.apiModel });
    
    // Enhanced system prompt with better pattern detection and anti-repetition guidance
    const cleanupPrompt = `
You are TextCleanerAI, a specialized AI for cleaning OCR artifacts from historical texts while preserving structure and meaning.

INPUT TEXT:
${text}

TASK:
Clean up this text following these guidelines:

1. STRUCTURE DETECTION:
   - Identify book chapters (often "CHAPTER X" in all caps or with Roman numerals)
   - Mark main chapter titles as "# CHAPTER X" (use number sign for h1)
   - Mark section titles as "## Section Title" (use two number signs for h2)
   - Preserve original numbering systems (Roman numerals, etc.)

2. TEXT CLEANUP:
   - Fix OCR errors (e.g., "l1ave" → "have", "T H E" → "THE")
   - Remove scanning artifacts like page numbers, headers/footers
   - Join hyphenated words split across lines
   - Normalize spacing (single spaces between words, double between sentences)
   - Fix punctuation errors (missing periods, etc.)

3. PARAGRAPH STRUCTURE:
   - Merge broken lines that belong to the same paragraph
   - Preserve intentional paragraph breaks
   - Use blank lines between paragraphs
   - Preserve lists, indentation, and other formatting when appropriate

4. CRITICAL ERRORS TO AVOID:
   - DO NOT create repetitions of paragraphs or sentences
   - DO NOT summarize or change the meaning of the text
   - DO NOT add your own interpretations or commentary
   - DO NOT translate or modernize archaic language
   - DO NOT delete important content, even if it seems redundant

5. FORMATTING:
   - Use markdown syntax: headings with #, emphasis with * when appropriate 
   - Format quotes with > when identifiable
   - Format dates and proper nouns correctly
   - Preserve original emphasis (capitalization, etc.) when intentional

Your output should be faithful to the original text but with improved readability. Focus on fixing OCR issues while preserving the author's words, style, and structure.

IMPORTANT: Do not repeat paragraphs. Check your final output for accidental repetition before submission.

Return ONLY the cleaned text with no explanation or commentary.`;

    // Add a timeout safeguard for very large documents
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Processing timeout')), 60000); // 60 second timeout
    });

    // Process text with model
    const resultPromise = model.generateContent({
      contents: [{ role: 'user', parts: [{ text: cleanupPrompt }] }],
      generationConfig: {
        temperature: 0.1, // Very low temperature for consistent results
        maxOutputTokens: 100000, // Allow large outputs for long documents
      },
    });
    
    // Wait for either result or timeout
    const result = await Promise.race([resultPromise, timeoutPromise]);
    
    // @ts-ignore - TypeScript doesn't know about the race result type
    const response = result.response;
    let cleanedText = response.text();
    
    // Post-processing to catch common issues
    cleanedText = postProcessCleanedText(cleanedText, text);
    
    // Return the cleaned text
    return res.status(200).json({
      cleanedText,
      originalLength: text.length,
      cleanedLength: cleanedText.length,
      markdownFormatted: true
    });
    
  } catch (error) {
    console.error('Text cleanup error:', error);
    return res.status(500).json({ 
      message: 'Error processing text cleanup',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Advanced post-processing with repetition detection
function postProcessCleanedText(cleanedText: string, originalText: string): string {
  // Normalize line endings
  cleanedText = cleanedText.replace(/\r\n/g, '\n');
  
  // Fix incorrect markdown heading format (ensure space after #)
  cleanedText = cleanedText.replace(/^(#{1,6})([^#\s])/gm, '$1 $2');
  
  // Remove any triple or more newlines (reduce to double)
  cleanedText = cleanedText.replace(/\n{3,}/g, '\n\n');
  
  // Remove trailing spaces at end of lines
  cleanedText = cleanedText.replace(/ +$/gm, '');
  
  // Detect and remove paragraph repetitions
  cleanedText = removeRepetitions(cleanedText);
  
  // Ensure chapters and sections have proper spacing
  cleanedText = cleanedText.replace(/([^\n])\n(# )/g, '$1\n\n$2');
  cleanedText = cleanedText.replace(/([^\n])\n(## )/g, '$1\n\n$2');
  
  // Ensure paragraphs after headers have proper spacing
  cleanedText = cleanedText.replace(/(^|\n)(# .+)\n([^#\n])/g, '$1$2\n\n$3');
  cleanedText = cleanedText.replace(/(^|\n)(## .+)\n([^#\n])/g, '$1$2\n\n$3');
  
  // If cleaned text is much shorter than original, something went wrong - use simpler cleanup
  if (cleanedText.length < originalText.length * 0.5) {
    console.warn("Cleaned text is significantly shorter than original, applying basic cleanup");
    return basicTextCleanup(originalText);
  }
  
  return cleanedText;
}

// Function to detect and remove repetitions of paragraphs or sections
function removeRepetitions(text: string): string {
  // Split text into paragraphs
  const paragraphs = text.split(/\n\n+/);
  const uniqueParagraphs = [];
  const seen = new Set();
  
  for (let i = 0; i < paragraphs.length; i++) {
    const para = paragraphs[i].trim();
    if (para.length < 20) {
      // Always keep short paragraphs (probably headers or formatting)
      uniqueParagraphs.push(para);
      continue;
    }
    
    // Normalize paragraph for comparison (remove extra spaces, lowercase)
    const normalizedPara = para.replace(/\s+/g, ' ').toLowerCase();
    
    // Check if we've seen this paragraph before
    if (!seen.has(normalizedPara)) {
      seen.add(normalizedPara);
      uniqueParagraphs.push(para);
    } else {
      console.log("Removed repetition:", para.substring(0, 50) + "...");
    }
    
    // Also check for partial repetitions (paragraphs that start the same way)
    if (i > 0 && normalizedPara.length > 100) {
      const prevPara = paragraphs[i-1].replace(/\s+/g, ' ').toLowerCase();
      
      // If significant overlap with previous paragraph, might be partial repetition
      if (findLongestCommonSubstring(prevPara, normalizedPara) > 80) {
        // Keep the longer of the two
        if (para.length > paragraphs[i-1].length && uniqueParagraphs.length > 0) {
          uniqueParagraphs.pop(); // Remove previous paragraph
          uniqueParagraphs.push(para); // Add current one
        }
      }
    }
  }
  
  return uniqueParagraphs.join('\n\n');
}

// Find longest common substring - helper for repetition detection
function findLongestCommonSubstring(str1: string, str2: string): number {
  if (!str1 || !str2) return 0;
  
  let maxLength = 0;
  const table = Array(str1.length).fill(null).map(() => Array(str2.length).fill(0));
  
  for (let i = 0; i < str1.length; i++) {
    for (let j = 0; j < str2.length; j++) {
      if (str1[i] === str2[j]) {
        table[i][j] = (i === 0 || j === 0) ? 1 : table[i-1][j-1] + 1;
        maxLength = Math.max(maxLength, table[i][j]);
      }
    }
  }
  
  return maxLength;
}

// Basic text cleanup as fallback
function basicTextCleanup(text: string): string {
  // Handle chapter headers
  text = text.replace(/\b(CHAPTER|Chapter)\s+([IVX0-9]+)\.?\s*\n+([A-Z][A-Za-z\s\.\-]+)/g, 
                     '# CHAPTER $2\n\n## $3');
  
  // Handle all-caps headers
  text = text.replace(/\n\s*([A-Z][A-Z\s\.\-]{3,})\s*\n/g, '\n\n## $1\n\n');
  
  // Fix common OCR issues
  text = text.replace(/([a-z])-\s*\n([a-z])/g, '$1$2');  // Fix hyphenated words across lines
  text = text.replace(/\b([A-Z])\s+([A-Z])\s+([A-Z])\b/g, '$1$2$3');  // Fix spaced capitals
  text = text.replace(/\b([A-Z])\s+([A-Z])\b/g, '$1$2');  // Fix spaced capitals
  text = text.replace(/\n\s+/g, '\n');  // Remove indentation
  text = text.replace(/\n{3,}/g, '\n\n');  // Normalize paragraph spacing
  
  return text;
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb', // Increase size limit for large documents
    },
    responseLimit: false,
  },
};