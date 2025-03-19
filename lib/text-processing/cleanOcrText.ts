// lib/text-processing/cleanOcrText.ts
// Utility function to clean OCR text artifacts and improve readability
// Handles common OCR issues like excessive line breaks, strange characters, and formatting issues

/**
 * Cleans OCR text to improve readability by removing artifacts and normalizing formatting
 * @param text The raw OCR text to clean
 * @returns Cleaned and formatted text
 */
export function cleanOcrText(text: string): string {
  if (!text) return '';
  
  // Make a copy of the input text
  let cleaned = text;
  
  // Replace multiple spaces with a single space
  cleaned = cleaned.replace(/\s{2,}/g, ' ');
  
  // Remove isolated single characters that are likely OCR errors (except 'a', 'A', 'I')
  cleaned = cleaned.replace(/\s+([b-hj-z])\s+/gi, ' ');
  
  // Fix common OCR artifacts
  cleaned = cleaned
    .replace(/[\u2018\u2019]/g, "'") // Smart quotes to regular quotes
    .replace(/[\u201C\u201D]/g, '"') // Smart double quotes to regular quotes
    .replace(/\u2013|\u2014/g, '-')  // Em/en dashes to hyphens
    .replace(/\u00A0/g, ' ')         // Non-breaking spaces to regular spaces
    .replace(/\r\n|\r/g, '\n');      // Normalize line breaks

  // Handle paragraph recognition
  // Strategy: Join lines that don't end with proper sentence terminators
  const lines = cleaned.split('\n');
  const paragraphs: string[] = [];
  let currentParagraph = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines
    if (!line) {
      if (currentParagraph) {
        paragraphs.push(currentParagraph);
        currentParagraph = '';
      }
      continue;
    }
    
    // Check if the previous line ends with a paragraph terminator
    const endsWithTerminator = /[.!?:)]$/.test(currentParagraph) || 
                              /\d+$/.test(currentParagraph); // Line ends with a number
    
    // Check if this line looks like a heading or list item
    const isHeadingOrList = /^[IVX]+\.|\d+\.|\*|\-|\•|\–/.test(line);
    
    // Check if line is very short (likely a heading)
    const isShortLine = line.length < 30 && /^[A-Z]/.test(line);
    
    // If line starts with lowercase and previous line doesn't end with terminator,
    // it's likely a continuation
    const isContinuation = /^[a-z]/.test(line) && currentParagraph && !endsWithTerminator;
    
    // Join lines that are part of the same paragraph
    if (isContinuation && !isHeadingOrList) {
      currentParagraph += ' ' + line;
    } else {
      if (currentParagraph) {
        paragraphs.push(currentParagraph);
      }
      currentParagraph = line;
    }
  }
  
  // Add the last paragraph if it exists
  if (currentParagraph) {
    paragraphs.push(currentParagraph);
  }
  
  // Remove very short paragraphs that are likely artifacts (less than 3 characters)
  const filteredParagraphs = paragraphs.filter(p => p.length > 3);
  
  // Join paragraphs with double line breaks
  return filteredParagraphs.join('\n\n');
}

/**
 * Determines if text is likely OCR output based on common OCR artifacts
 * @param text The text to analyze
 * @returns True if the text appears to be OCR output
 */
export function isLikelyOcrText(text: string): boolean {
  if (!text) return false;
  
  // Common OCR artifact patterns
  const ocrPatterns = [
    /\b\w{1,2}\s{2,}\w+/,         // Isolated 1-2 character words followed by extra spaces
    /\n\s*\n\s*\n/,               // Multiple consecutive line breaks
    /\d{1,2}\s+\w{1,3}\s+\d{1,2}/, // Date-like patterns with extra spaces
    /[A-Z]\s+[a-z]/,              // Capital letter separated from lowercase by space
    /[a-z]\s+[a-z]/,              // Lowercase letters separated by space
    /\w+\s+-\s+\w+/,              // Words separated by spaced hyphens
    /\n\w{1,2}\n/                 // Single characters on their own lines
  ];
  
  // Check for short lines that don't end with punctuation
  const lines = text.split('\n');
  let shortLinesCount = 0;
  
  for (const line of lines) {
    if (line.length > 0 && line.length < 40 && !/[.!?:,;]$/.test(line.trim())) {
      shortLinesCount++;
    }
  }
  
  // If more than 20% of non-empty lines are short without punctuation, likely OCR
  const nonEmptyLines = lines.filter(line => line.trim().length > 0);
  const shortLinePercentage = (shortLinesCount / nonEmptyLines.length) * 100;
  
  // Check for OCR patterns or high percentage of short lines
  return ocrPatterns.some(pattern => pattern.test(text)) || shortLinePercentage > 20;
}