// pages/api/upload.ts
// API route for handling file uploads with improved OCR text processing
// Handles PDF parsing, text file reading, and image OCR while cleaning text artifacts

import type { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm } from 'formidable';
import fs from 'fs';
import { createWorker } from 'tesseract.js';
import pdfParse from 'pdf-parse';
import path from 'path';
import { cleanOcrText, isLikelyOcrText } from '@/lib/text-processing/cleanOcrText';

// Disable body parser for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

// Content size limiting function
function limitContentSize(content: string, mimeType: string, fileExtension: string): { 
  content: string, 
  limited: boolean,
  originalSize: number,
  limitReason: string | null
} {
  const originalSize = content.length;
  let limited = false;
  let limitReason = null;
  
  // Different limits based on file type
  const TEXT_CHAR_LIMIT = 50000; // Approximately 25 pages of text
  const PDF_CHAR_LIMIT = 30000;  // Approximately 15-20 pages
  const OCR_CHAR_LIMIT = 20000;  // For image OCR
  
  // Calculate paragraph count (paragraphs are separated by double newlines)
  const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  const PARAGRAPH_LIMIT = 100;
  
  let result = content;
  
  // Apply different limits based on file type
  if (mimeType.includes('pdf') || fileExtension === '.pdf') {
    if (content.length > PDF_CHAR_LIMIT) {
      // For PDFs, take the first N characters
      result = content.substring(0, PDF_CHAR_LIMIT);
      limited = true;
      limitReason = `PDF too large (${Math.round(originalSize/1000)}K chars). Limited to first ${Math.round(PDF_CHAR_LIMIT/1000)}K chars.`;
    }
  } else if (mimeType.includes('image') || ['.jpg', '.jpeg', '.png'].includes(fileExtension)) {
    if (content.length > OCR_CHAR_LIMIT) {
      // For OCR'd images
      result = content.substring(0, OCR_CHAR_LIMIT);
      limited = true;
      limitReason = `OCR content too large (${Math.round(originalSize/1000)}K chars). Limited to first ${Math.round(OCR_CHAR_LIMIT/1000)}K chars.`;
    }
  } else {
    // For text files
    if (content.length > TEXT_CHAR_LIMIT) {
      result = content.substring(0, TEXT_CHAR_LIMIT);
      limited = true;
      limitReason = `Text too large (${Math.round(originalSize/1000)}K chars). Limited to first ${Math.round(TEXT_CHAR_LIMIT/1000)}K chars.`;
    }
  }
  
  // Additional paragraph-based limit
  if (paragraphs.length > PARAGRAPH_LIMIT && !limited) {
    // Take only the first N paragraphs
    result = paragraphs.slice(0, PARAGRAPH_LIMIT).join('\n\n');
    limited = true;
    limitReason = `Document too long (${paragraphs.length} paragraphs). Limited to first ${PARAGRAPH_LIMIT} paragraphs.`;
  }
  
  return {
    content: result,
    limited,
    originalSize,
    limitReason
  };
}

// Basic text preprocessing function that's applied before the more advanced cleaning
function preProcessOcrText(text: string): string {
  if (!text) return '';
  
  // Replace multiple consecutive line breaks with double line breaks
  let processed = text.replace(/\n{3,}/g, '\n\n');
  
  // Remove excessive spaces
  processed = processed.replace(/[ \t]{2,}/g, ' ');
  
  // Remove page numbers and headers that appear as isolated digits or short text on single lines
  processed = processed.replace(/^\s*\d+\s*$/gm, '');
  processed = processed.replace(/^\s*[A-Z0-9 -]{1,10}\s*$/gm, '');
  
  // Remove common OCR artifacts like standalone characters
  processed = processed.replace(/\n\s*[b-hj-z]\s*\n/gi, '\n');
  
  return processed;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("Upload API called with method:", req.method);
  
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Create incoming form with explicit options
    const form = new IncomingForm({
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB limit
      multiples: false, // We only want one file
    });

    console.log("Parsing form data...");
    
    // Parse the form
    const [fields, files] = await new Promise<[any, any]>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) {
          console.error("Form parse error:", err);
          return reject(err);
        }
        resolve([fields, files]);
      });
    });

    console.log("Form parsed, files:", Object.keys(files));
    
    // Get the file object - handle both array and object forms that formidable might return
    const fileKey = Object.keys(files)[0];
    const file = files[fileKey];
    
    if (!file) {
      console.error("No file found in request");
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // If file is an array, take the first one
    const fileObj = Array.isArray(file) ? file[0] : file;
    
    console.log("Processing file:", fileObj.originalFilename, "type:", fileObj.mimetype);

    // Determine the file path using type checks
    let filePath: string = '';
    
    // Different versions of formidable use different properties
    if (typeof fileObj.filepath === 'string') {
      filePath = fileObj.filepath;
    } else if (typeof fileObj.path === 'string') {
      filePath = fileObj.path;
    } else {
      console.error("No valid file path found");
      return res.status(400).json({ message: 'Invalid file path' });
    }

    if (!filePath || !fs.existsSync(filePath)) {
      console.error("File path doesn't exist:", filePath);
      return res.status(400).json({ message: 'File path not found' });
    }

    // Determine MIME type
    const mimeType: string = fileObj.mimetype || '';
    console.log("File MIME type:", mimeType);
    
    // Fall back to extension-based type detection if MIME type is not available
    const fileExtension = path.extname(fileObj.originalFilename || '').toLowerCase();
    
    // Attempt text extraction based on file type
    let content = '';
    let processingMethod = '';
    let needsOcrCleaning = false;
    let limited = false;
    let originalSize = 0;
    let limitReason = null;

    try {
      if (mimeType.includes('pdf') || fileExtension === '.pdf') {
        // Parse PDF content
        console.log("Processing as PDF");
        processingMethod = 'pdf-parse';
        needsOcrCleaning = true;
        
        const pdfBuffer = fs.readFileSync(filePath);
        const pdfData = await pdfParse(pdfBuffer);
        content = pdfData.text;
      } else if (mimeType.includes('text') || fileExtension === '.txt') {
        // Read text content directly
        console.log("Processing as text");
        processingMethod = 'direct-text';
        
        content = fs.readFileSync(filePath, 'utf-8');
        // Check if the text file might be OCR output
        needsOcrCleaning = isLikelyOcrText(content);
      } else if (mimeType.includes('image') || 
                ['.jpg', '.jpeg', '.png'].includes(fileExtension)) {
        // Use Tesseract.js for OCR on images
        console.log("Processing as image with OCR");
        processingMethod = 'tesseract';
        needsOcrCleaning = true;
        
        const worker = await createWorker('eng');
        const { data } = await worker.recognize(filePath);
        content = data.text;
        await worker.terminate();
      } else {
        console.error("Unsupported file type:", mimeType, fileExtension);
        return res.status(400).json({ 
          message: 'Unsupported file type. Please use PDF, JPG, PNG, or TXT files.'
        });
      }
      
      // Apply text cleaning if needed
      console.log(`Text extraction complete, content length: ${content.length}, needs cleaning: ${needsOcrCleaning}`);
      
      // Apply content size limiting
      const sizeLimitResult = limitContentSize(content, mimeType, fileExtension);
      content = sizeLimitResult.content;
      limited = sizeLimitResult.limited;
      originalSize = sizeLimitResult.originalSize;
      limitReason = sizeLimitResult.limitReason;
      
      if (limited) {
        console.log(`Content limited: ${limitReason}`);
        processingMethod += '-limited';
      }
      
      if (needsOcrCleaning) {
        // First apply basic preprocessing
        content = preProcessOcrText(content);
        
        // Then apply more advanced OCR cleaning
        const originalLength = content.length;
        content = cleanOcrText(content);
        
        console.log(`OCR cleaning applied, content length changed from ${originalLength} to ${content.length}`);
        processingMethod += '-cleaned';
      }
      
   } catch (processingError) {
      console.error('Processing error:', processingError);
      return res.status(500).json({
        message: 'Error processing file content',
        detail: processingError instanceof Error ? processingError.message : 'Unknown processing error',
        processingMethod,
        fileType: mimeType || fileExtension
      });
    }

    // Clean up the temporary file
    try {
      fs.unlinkSync(filePath);
      console.log("Temporary file deleted:", filePath);
    } catch (unlinkError) {
      console.warn("Failed to delete temporary file:", unlinkError);
      // Don't fail the whole request if cleanup fails
    }

    console.log("Processing complete, final content length:", content.length);
    
    return res.status(200).json({
      content,
      filename: fileObj.originalFilename || 'uploaded-file',
      type: mimeType || fileExtension,
      processingMethod,
      cleaned: needsOcrCleaning,
      limited,
      originalSize,
      limitReason
    });
  } catch (error) {
    console.error('General upload error:', error);
    return res.status(500).json({ 
      message: 'Error processing file upload',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}