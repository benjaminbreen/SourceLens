// lib/text-processing/cleanOcrText.ts
// Advanced OCR text cleaning utility with intelligent preservation of original text characteristics

/**
 * Configuration options for OCR text cleaning
 */
interface OcrCleaningConfig {
  preserveFormatting?: boolean;
  detectLineBreaks?: boolean;
  minParagraphLength?: number;
}

/**
 * Cleans OCR text by intelligently removing artifacts while preserving original text characteristics
 * @param text The raw OCR text to clean
 * @param config Configuration options for text cleaning
 * @returns Cleaned and formatted text
 */
export function cleanOcrText(text: string, config: OcrCleaningConfig = {}): string {
  if (!text) return '';

  const {
    preserveFormatting = true,
    detectLineBreaks = true,
    minParagraphLength = 3
  } = config;

  // Utility function to determine if a word is likely a genuine word
  const isValidWord = (word: string): boolean => {
    // Check if word contains letters and meets minimum length
    if (word.length < 2) return false;

    // Allow words with apostrophes (like contractions)
    const cleanWord = word.replace(/[''-]/g, '');

    // Check for a mix of letters
    const hasLetters = /[a-zA-Z]/.test(cleanWord);
    const hasReasonableLength = cleanWord.length >= 2 && cleanWord.length <= 20;

    return hasLetters && hasReasonableLength;
  };

  // Intelligent line break detection and preservation
  const detectAndPreserveLineBreaks = (text: string): string => {
    // Split text into lines
    const lines = text.split('\n');
    
    // Analyze line characteristics
    const processedLines: string[] = [];
    let currentParagraph: string[] = [];

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      // Skip completely empty lines
      if (!trimmedLine) {
        // If we have a paragraph in progress, add it
        if (currentParagraph.length > 0) {
          processedLines.push(currentParagraph.join(' '));
          currentParagraph = [];
        }
        return;
      }

      // Split line into words
      const words = trimmedLine.split(/\s+/);
      const validWords = words.filter(isValidWord);

      // Heuristics for line break preservation
      const isLikelyIndependentLine = 
        // Short, capitalized line (possible heading or poetic line)
        (trimmedLine.length < 50 && /^[A-Z]/.test(trimmedLine)) ||
        // Line with very distinctive punctuation
        /[—–\[\]{}()]/.test(trimmedLine) ||
        // Line that looks like a title or section header
        (/^[A-Z\d]/.test(trimmedLine) && validWords.length <= 6);

      // Determine if line should be kept separate or joined
      if (isLikelyIndependentLine) {
        // If we have a paragraph in progress, add it first
        if (currentParagraph.length > 0) {
          processedLines.push(currentParagraph.join(' '));
          currentParagraph = [];
        }
        processedLines.push(trimmedLine);
      } else {
        // Try to join the line with ongoing paragraph
        currentParagraph.push(trimmedLine);
      }
    });

    // Add any remaining paragraph
    if (currentParagraph.length > 0) {
      processedLines.push(currentParagraph.join(' '));
    }

    return processedLines.join('\n\n');
  };

  // Main cleaning process
  let cleaned = text;

  // Remove problematic OCR artifacts
  cleaned = cleaned
    // Remove multiple consecutive spaces
    .replace(/\s{2,}/g, ' ')
    
    // Remove isolated single characters (except known single-letter words like 'a', 'I')
    .replace(/\s+([b-hj-kn-z])\s+/gi, ' ')
    
    // Fix common hyphenation errors (words split across lines)
    .replace(/(\w+)-\s*\n\s*(\w+)/g, '$1$2')
    
    // Normalize line breaks
    .replace(/\r\n|\r/g, '\n');

  // Normalize historical punctuation while preserving original intent
  cleaned = cleaned
    .replace(/[\u2018\u2019]/g, "'")   // Smart single quotes
    .replace(/[\u201C\u201D]/g, '"')   // Smart double quotes
    .replace(/\u2013|\u2014/g, '-')    // Em/en dashes to hyphens
    .replace(/\u00A0/g, ' ');          // Non-breaking spaces to regular spaces

  // Line break detection and preservation
  if (detectLineBreaks) {
    cleaned = detectAndPreserveLineBreaks(cleaned);
  }

  // Final cleanup: remove excessive whitespace
  cleaned = cleaned
    .replace(/\n{3,}/g, '\n\n')   // Limit multiple line breaks
    .trim();

  return cleaned;
}

/**
 * Determines if text is likely OCR output based on common artifacts
 * @param text The text to analyze
 * @returns True if the text appears to be OCR output
 */
export function isLikelyOcrText(text: string): boolean {
  if (!text) return false;
  
  // Enhanced OCR artifact patterns
  const ocrPatterns = [
    /\b\w{1,2}\s{2,}\w+/,         // Isolated 1-2 character words followed by extra spaces
    /\n\s*\n\s*\n/,               // Multiple consecutive line breaks
    /\d{1,2}\s+\w{1,3}\s+\d{1,2}/, // Date-like patterns with extra spaces
    /[A-Z]\s+[a-z]/,              // Capital letter separated from lowercase by space
    /[a-z]\s+[a-z]/,              // Lowercase letters separated by space
    /\w+\s+-\s+\w+/,              // Words separated by spaced hyphens
    /\n\w{1,2}\n/,                // Single characters on their own lines
    /\w+\n\w+/                    // Words split by line breaks
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

// Example usage demonstrating configuration options
export function processText(text: string) {
  return cleanOcrText(text, {
    preserveFormatting: true,
    detectLineBreaks: true,
    minParagraphLength: 3
  });
}