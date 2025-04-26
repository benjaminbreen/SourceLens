// lib/text-processing/cleanOcrText.ts
// Advanced OCR text cleaning utility that preserves formatting, lists, and distinguishes different text types

/**
 * Configuration options for OCR text cleaning
 */
interface OcrCleaningConfig {
  preserveFormatting?: boolean;
  detectLists?: boolean;
  distinguishHandwritten?: boolean;
  minParagraphLength?: number;
}

/**
 * Cleans OCR text by intelligently removing artifacts while preserving structure
 * @param text The raw OCR text to clean
 * @param config Configuration options for text cleaning
 * @returns Cleaned and formatted text
 */
export function cleanOcrText(text: string, config: OcrCleaningConfig = {}): string {
  if (!text) return '';

  const {
    preserveFormatting = true,
    detectLists = true,
    distinguishHandwritten = true,
    minParagraphLength = 3
  } = config;

  // Make a copy of the input text
  let cleaned = text;

  // Normalize line breaks
  cleaned = cleaned.replace(/\r\n|\r/g, '\n');

  // Fix common OCR artifacts
  cleaned = cleaned
    // Fix smart quotes and dashes
    .replace(/[\u2018\u2019]/g, "'")  // Smart single quotes
    .replace(/[\u201C\u201D]/g, '"')  // Smart double quotes
    .replace(/\u2013|\u2014/g, '-')   // Em/en dashes to hyphens
    .replace(/\u00A0/g, ' ')          // Non-breaking spaces to regular spaces
    // Remove excessive spaces (but preserve indentation)
    .replace(/([^\n]) {2,}/g, '$1 ');

  // Split into lines for processing
  const lines = cleaned.split('\n');
  const processedLines: string[] = [];

  // Track if we're inside a list
  let inNumberedList = false;
  let inBulletList = false;
  let currentListIndentation = 0;
  
  // Track when we see potential handwritten notes or secondary text
  const isLikelyHandwritten = (line: string): boolean => {
    // Look for indicators of handwritten notes:
    // - Text in parentheses or brackets that's isolated
    // - Lines that are significantly shorter than surrounding text
    // - Lines with distinctive markers or different formatting
    return (
      /^\s*[\(\[\{].*[\)\]\}]\s*$/.test(line) || // Surrounded by brackets
      /^\s*[\"\'].*[\"\']\s*$/.test(line) ||     // Surrounded by quotes
      /\(handwritten\)|written in margin|note:/i.test(line) || // Explicit indicators
      /^[A-Z\s]+:$/i.test(line) ||               // Labels like "NOTE:" or "COMMENT:"
      /^\s*vs\.?\s+/i.test(line) ||              // "vs" pattern
      line.length < 20 && /[A-Z][a-z]+ \d{4}$/.test(line) // Date signatures
    );
  };

  // Process each line with list detection
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines but preserve paragraph breaks
    if (!line) {
      if (processedLines.length > 0 && processedLines[processedLines.length - 1] !== '') {
        processedLines.push('');
      }
      // Reset list tracking when we hit a blank line
      inNumberedList = false;
      inBulletList = false;
      continue;
    }
    
    // Check for list patterns
    const numberedListMatch = line.match(/^\s*(\d+)[\.\)](\s+)(.+)/);
    const bulletListMatch = line.match(/^\s*[\•\-\*\+](\s+)(.+)/);
    const alphaListMatch = line.match(/^\s*([a-z])[\.\)](\s+)(.+)/i);
    const romanListMatch = line.match(/^\s*((?:i|ii|iii|iv|v|vi|vii|viii|ix|x|xi|xii))[\.\)](\s+)(.+)/i);
    
    // Preserve indentation for sublists
    const indentation = line.match(/^(\s+)/)?.[1].length || 0;
    
    if (distinguishHandwritten && isLikelyHandwritten(line)) {
      // Mark handwritten or secondary text with italics
      processedLines.push(`*${line}*`);
    }
    else if (numberedListMatch) {
      // Numbered list item
      inNumberedList = true;
      currentListIndentation = indentation;
      // Preserve the original number and formatting
      processedLines.push(`${' '.repeat(indentation)}${numberedListMatch[1]}.${numberedListMatch[2]}${numberedListMatch[3]}`);
    }
    else if (bulletListMatch) {
      // Bullet list item
      inBulletList = true;
      currentListIndentation = indentation;
      // Standardize bullet format
      processedLines.push(`${' '.repeat(indentation)}- ${bulletListMatch[2]}`);
    }
    else if (alphaListMatch) {
      // Alphabetical list item (like a., b., c.)
      // Preserve the original letter and formatting
      processedLines.push(`${' '.repeat(indentation)}${alphaListMatch[1]}.${alphaListMatch[2]}${alphaListMatch[3]}`);
    }
    else if (romanListMatch) {
      // Roman numeral list item
      // Preserve the original numeral and formatting
      processedLines.push(`${' '.repeat(indentation)}${romanListMatch[1]}.${romanListMatch[2]}${romanListMatch[3]}`);
    }
    else if (inNumberedList || inBulletList) {
      // Check if this line is a continuation of a list item (indented text)
      if (indentation > currentListIndentation) {
        // This is indented text under a list item, preserve it
        processedLines.push(line);
      } 
      // Check if this might be a list item without proper formatting
      else if (line.match(/^\s*[a-z][\.\)]\s+/i) || line.match(/^\s*\d+[\.\)]\s+/)) {
        // This looks like a list item that OCR missed, try to format it properly
        const fixedLine = line.replace(/^(\s*)([a-z\d]+)[\.\)](\s+)(.+)/i, 
                                      (_, indent, marker, spaces, content) => 
                                      `${indent}${marker}.${spaces}${content}`);
        processedLines.push(fixedLine);
      }
      else {
        // Not part of list anymore
        inNumberedList = false;
        inBulletList = false;
        processedLines.push(line);
      }
    }
    else {
      // Regular line - check for section headings or titles
      if (line.match(/^[A-Z\s\d\"\'\-\_\:\;]+$/) && line.length < 50) {
        // This looks like a title or heading (all caps, reasonably short)
        if (processedLines.length > 0 && processedLines[processedLines.length - 1] !== '') {
          processedLines.push(''); // Add space before heading
        }
        processedLines.push(`**${line}**`); // Mark as bold
        processedLines.push(''); // Add space after heading
      } else {
        processedLines.push(line);
      }
    }
  }

  // Join the processed lines
  let result = processedLines.join('\n');
  
  // Final cleanup: merge paragraphs that were incorrectly split
  if (preserveFormatting) {
    // Merge lines that are part of the same paragraph
    result = result.replace(/([a-z,;:])\n([a-z])/gi, '$1 $2');
    
    // Remove excessive blank lines
    result = result.replace(/\n{3,}/g, '\n\n');
  }
  
  return result.trim();
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
  const shortLinePercentage = nonEmptyLines.length > 0 ? (shortLinesCount / nonEmptyLines.length) * 100 : 0;
  
  // Check for OCR patterns or high percentage of short lines
  return ocrPatterns.some(pattern => pattern.test(text)) || shortLinePercentage > 20;
}