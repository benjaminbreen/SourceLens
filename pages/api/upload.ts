// pages/api/upload.ts
// Enhanced API for handling large PDFs with chunking, improved text extraction,
// and multi-page AI Vision support for files up to 300 pages / 20MB

import type { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm } from 'formidable';
import fs from 'fs';
import path from 'path';
import util from 'util';
import { exec as execCallback } from 'child_process';
import pdfParse from 'pdf-parse';
import { cleanOcrText } from '@/lib/text-processing/cleanOcrText';
import os from 'os';
import { Anthropic } from '@anthropic-ai/sdk';

// Configure Anthropic client for Claude Vision
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

// Minimum text length to be considered successful extraction
const MIN_TEXT_LENGTH = 100;

// Maximum PDF size in bytes (20MB)
const MAX_PDF_SIZE = 20 * 1024 * 1024;

// Maximum PDF pages to process
const MAX_PDF_PAGES = 300;

// Maximum pages to process with Claude Vision
const MAX_CLAUDE_VISION_PAGES = 20;

// Convert exec to Promise-based
const exec = util.promisify(execCallback);

// Disable body parser for file uploads
export const config = {
  api: {
    bodyParser: false,
    // Increase timeout for larger files
    responseLimit: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("Upload API called with method:", req.method);
  
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  let tempDir = '';
  
  try {
    // Create a temp directory for processing files
    tempDir = path.join(os.tmpdir(), `pdf-process-${Date.now()}`);
    fs.mkdirSync(tempDir, { recursive: true });
    console.log(`Created temp directory: ${tempDir}`);
    
    // Parse the form with increased file size limit (20MB)
    const form = new IncomingForm({
      keepExtensions: true,
      maxFileSize: MAX_PDF_SIZE, // 20MB limit
      uploadDir: tempDir,
      multiples: false,
    });
    
    console.log("Parsing form data...");
    const [fields, files]: [any, any] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) {
          console.error("Form parsing error:", err);
          return reject(err);
        }
        resolve([fields, files]);
      });
    });
    
    // Check if we should use AI Vision as the primary method
    const useAIVision = fields.useAIVision && fields.useAIVision[0] === 'true';
    console.log(`AI Vision preference: ${useAIVision ? 'PRIMARY' : 'FALLBACK'}`);
    
    // Get the file object
    let fileObj: any = files.file;
    if (!fileObj) {
      const fileKeys = Object.keys(files);
      if (fileKeys.length > 0) {
        fileObj = files[fileKeys[0]];
      }
    }
    
    // Handle array structure if present
    if (Array.isArray(fileObj)) {
      fileObj = fileObj[0];
    }
    
    if (!fileObj) {
      console.error("No file found in request");
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // Determine the file path
    const filePath = fileObj.filepath || fileObj.path;
    if (!filePath || !fs.existsSync(filePath)) {
      console.error("File path doesn't exist:", filePath);
      return res.status(400).json({ message: 'File path not found' });
    }
    
    const originalFilename = fileObj.originalFilename || 'uploaded-file';
    const mimeType: string = fileObj.mimetype || '';
    const fileExtension = path.extname(originalFilename).toLowerCase();
    const fileSize = fs.statSync(filePath).size;
    
    console.log(`Processing file: ${originalFilename} (type: ${mimeType}, size: ${Math.round(fileSize / 1024)} KB)`);
    
    // First response for large files to show progress
    if (fileSize > 5 * 1024 * 1024) { // Files over 5MB
      // Send initial status - this won't be used on the client side
      // but helps with keeping the connection alive
      res.writeHead(202, {
        'Content-Type': 'application/json',
        'Transfer-Encoding': 'chunked'
      });
      
      // Send progress update
      res.write(JSON.stringify({
        status: 'processing',
        message: `Processing large file (${Math.round(fileSize / (1024 * 1024))} MB), please wait...`,
        progress: 10
      }));
    }
    
    let content = '';
    let processingMethod = '';
    let pageCount = 0;
    
    // If it's a PDF, get page count first to inform processing approach
    if (mimeType.includes('pdf') || fileExtension === '.pdf') {
      try {
        const pdfBuffer = fs.readFileSync(filePath);
        const pdfData = await pdfParse(pdfBuffer, { max: 1 }); // Just parse metadata
        pageCount = pdfData.numpages || 0;
        console.log(`PDF has ${pageCount} pages`);
        
        // Check if PDF exceeds maximum page count
        if (pageCount > MAX_PDF_PAGES) {
          return res.status(400).json({
            message: `PDF has too many pages (${pageCount}). Maximum allowed is ${MAX_PDF_PAGES} pages.`,
            error: 'TOO_MANY_PAGES'
          });
        }
      } catch (metadataErr) {
        console.warn('Could not determine PDF page count:', metadataErr);
        // Continue processing without page count information
      }
    }
    
    // If AI Vision is selected as primary method, use it directly
    if (useAIVision) {
      try {
        console.log('Using Claude Vision as primary method');
        
        // For PDFs with Claude Vision, process multiple pages if needed
        if (mimeType.includes('pdf') || fileExtension === '.pdf') {
          if (pageCount > 1) {
            // Process multiple pages with Claude Vision
            const pagesToProcess = Math.min(pageCount, MAX_CLAUDE_VISION_PAGES);
            console.log(`Processing ${pagesToProcess} pages of PDF with Claude Vision`);
            
            // Send progress update
            if (fileSize > 5 * 1024 * 1024) {
              res.write(JSON.stringify({
                status: 'processing',
                message: `Processing ${pagesToProcess} pages of PDF with AI Vision...`,
                progress: 30
              }));
            }
            
            const claudeResult = await processPdfWithClaudeVision(filePath, tempDir, pagesToProcess);
            content = claudeResult.text;
            processingMethod = claudeResult.method;
          } else {
            // Single page PDF
            const claudeResult = await processWithClaudeVision(filePath, mimeType);
            content = claudeResult.text;
            processingMethod = claudeResult.method;
          }
        } else {
          // Non-PDF file with Claude Vision
          const claudeResult = await processWithClaudeVision(filePath, mimeType);
          content = claudeResult.text;
          processingMethod = claudeResult.method;
        }
      } catch (error) {
        console.error('Claude Vision processing failed:', error);
        content = '[AI Vision processing failed - please try standard processing]';
        processingMethod = 'claude-vision-failed';
      }
    } else {
      // Process based on file type with standard methods
      if (mimeType.includes('pdf') || fileExtension === '.pdf') {
        console.log('Processing as PDF');
        
        // Handle large PDFs with chunked processing
        if (pageCount > 50 || fileSize > 5 * 1024 * 1024) {
          console.log('Large PDF detected, using chunked processing');
          
          // Send progress update
          if (fileSize > 5 * 1024 * 1024) {
            res.write(JSON.stringify({
              status: 'processing',
              message: 'Processing large PDF in chunks...',
              progress: 40
            }));
          }
          
          try {
            // For large PDFs, we extract text in chunks to prevent memory issues
            const maxPagesPerChunk = 20;
            let allText = '';
            
            // Calculate total chunks for progress reporting
            const totalChunks = Math.ceil(pageCount / maxPagesPerChunk);
            
            for (let i = 1; i <= pageCount; i += maxPagesPerChunk) {
              const endPage = Math.min(i + maxPagesPerChunk - 1, pageCount);
              console.log(`Processing pages ${i} to ${endPage}`);
              
              // Send progress update
              if (fileSize > 5 * 1024 * 1024) {
                const currentChunk = Math.ceil(i / maxPagesPerChunk);
                const progress = 40 + Math.round((currentChunk / totalChunks) * 50);
                
                res.write(JSON.stringify({
                  status: 'processing',
                  message: `Processing pages ${i} to ${endPage} of ${pageCount}...`,
                  progress: progress
                }));
              }
              
              try {
                // Try standard PDF text extraction first for this chunk
                const chunkText = await extractPdfTextRange(filePath, i, endPage);
                
                // Check if we got meaningful text
                if (chunkText && chunkText.length > MIN_TEXT_LENGTH) {
                  allText += chunkText + "\n\n";
                  continue; // Move to next chunk if successful
                }
                
                // If text extraction wasn't successful, fall back to OCR
                console.log(`Standard extraction for pages ${i}-${endPage} yielded insufficient text, trying OCR`);
                const ocrResult = await processPdfPagesWithOcr(filePath, tempDir, i, endPage);
                allText += ocrResult.text + "\n\n";
              } catch (chunkErr) {
                console.warn(`Error extracting text from pages ${i}-${endPage}:`, chunkErr);
                
                // Fall back to OCR for this chunk if text extraction fails
                try {
                  const ocrResult = await processPdfPagesWithOcr(filePath, tempDir, i, endPage);
                  allText += ocrResult.text + "\n\n";
                } catch (ocrErr) {
                  console.error(`OCR fallback also failed for pages ${i}-${endPage}:`, ocrErr);
                  
                  // Try Claude Vision as last resort for this chunk if text is too short
                  if (useAIVision || allText.length < MIN_TEXT_LENGTH) {
                    try {
                      // Process a single page with Claude Vision as sample
                      const samplePage = Math.floor((i + endPage) / 2); // Middle page as sample
                      console.log(`Trying Claude Vision for sample page ${samplePage} from chunk ${i}-${endPage}`);
                      
                      const claudeResult = await processSinglePageWithClaudeVision(filePath, tempDir, samplePage);
                      allText += `[Sample from pages ${i}-${endPage}]:\n${claudeResult.text}\n\n`;
                    } catch (claudeErr) {
                      console.error(`Claude Vision sampling also failed for pages ${i}-${endPage}:`, claudeErr);
                      allText += `[PDF processing failed for pages ${i}-${endPage}]\n\n`;
                    }
                  } else {
                    allText += `[PDF processing failed for pages ${i}-${endPage}]\n\n`;
                  }
                }
              }
            }
            
            content = allText;
            processingMethod = 'pdf-chunked-processing';
          } catch (chunkedErr) {
            console.error('Chunked PDF processing failed:', chunkedErr);
            
            // Fall back to standard processing if chunked approach fails
            content = '[Chunked PDF processing failed, trying standard approach...]';
            processingMethod = 'chunked-pdf-error';
            
            // Continue to standard processing below
          }
        }
        
        // If content is still empty (chunked processing failed or wasn't needed),
        // try standard PDF processing
        if (!content) {
          // Send progress update
          if (fileSize > 5 * 1024 * 1024) {
            res.write(JSON.stringify({
              status: 'processing',
              message: 'Trying standard PDF extraction...',
              progress: 70
            }));
          }
          
          // Try standard PDF text extraction first
          try {
            const pdfBuffer = fs.readFileSync(filePath);
            const pdfData = await pdfParse(pdfBuffer);
            content = pdfData.text || '';
            
            console.log(`PDF text extraction complete, content length: ${content.length}`);
            
            // If we got meaningful text, use it
            if (content.length > MIN_TEXT_LENGTH) {
              processingMethod = 'pdf-parse';
            } else {
              // Otherwise, fall back to OCR
              console.log(`PDF text extraction yielded minimal results (${content.length} chars), falling back to OCR`);
              
              // Send progress update
              if (fileSize > 5 * 1024 * 1024) {
                res.write(JSON.stringify({
                  status: 'processing',
                  message: 'Trying OCR...',
                  progress: 80
                }));
              }
              
              const ocrResult = await processPdfWithOcr(filePath, tempDir);
              
              if (ocrResult.text.length > content.length) {
                content = ocrResult.text;
                processingMethod = ocrResult.method;
                console.log(`OCR improved text extraction, new content length: ${content.length}`);
              } else {
                processingMethod = 'pdf-parse-minimal';
              }
              
              // If still below threshold, try Claude Vision
              if (content.length < MIN_TEXT_LENGTH) {
                console.log(`Standard OCR yielded minimal results (${content.length} chars), trying Claude Vision`);
                
                // Send progress update
                if (fileSize > 5 * 1024 * 1024) {
                  res.write(JSON.stringify({
                    status: 'processing',
                    message: 'Trying AI Vision as last resort...',
                    progress: 90
                  }));
                }
                
                // Process multiple pages with Claude Vision
                const pagesToProcess = Math.min(pageCount, MAX_CLAUDE_VISION_PAGES);
                const claudeResult = await processPdfWithClaudeVision(filePath, tempDir, pagesToProcess);
                
                if (claudeResult.text.length > content.length) {
                  content = claudeResult.text;
                  processingMethod = claudeResult.method;
                  console.log(`Claude Vision improved text extraction, new content length: ${content.length}`);
                }
              }
            }
          } catch (err) {
            console.error('Error with PDF processing:', err);
            
            // If text extraction fails, try OCR as fallback
            try {
              console.log('Falling back to OCR due to PDF parsing error');
              
              // Send progress update
              if (fileSize > 5 * 1024 * 1024) {
                res.write(JSON.stringify({
                  status: 'processing',
                  message: 'Standard PDF extraction failed, trying OCR...',
                  progress: 75
                }));
              }
              
              const ocrResult = await processPdfWithOcr(filePath, tempDir);
              content = ocrResult.text;
              processingMethod = ocrResult.method;
              
              // If still below threshold, try Claude Vision
              if (content.length < MIN_TEXT_LENGTH) {
                console.log(`OCR fallback yielded minimal results (${content.length} chars), trying Claude Vision`);
                
                // Send progress update
                if (fileSize > 5 * 1024 * 1024) {
                  res.write(JSON.stringify({
                    status: 'processing',
                    message: 'Trying AI Vision as last resort...',
                    progress: 90
                  }));
                }
                
                // Process multiple pages with Claude Vision
                const pagesToProcess = Math.min(pageCount, MAX_CLAUDE_VISION_PAGES);
                const claudeResult = await processPdfWithClaudeVision(filePath, tempDir, pagesToProcess);
                
                if (claudeResult.text.length > content.length) {
                  content = claudeResult.text;
                  processingMethod = claudeResult.method;
                  console.log(`Claude Vision improved text extraction, new content length: ${content.length}`);
                }
              }
            } catch (ocrErr) {
              console.error('OCR fallback also failed:', ocrErr);
              
              // Try Claude Vision as last resort
              try {
                console.log('All OCR methods failed, trying Claude Vision as last resort');
                
                // Send progress update
                if (fileSize > 5 * 1024 * 1024) {
                  res.write(JSON.stringify({
                    status: 'processing',
                    message: 'Trying AI Vision as last resort...',
                    progress: 95
                  }));
                }
                
                // Process multiple pages with Claude Vision
                const pagesToProcess = Math.min(pageCount, MAX_CLAUDE_VISION_PAGES);
                const claudeResult = await processPdfWithClaudeVision(filePath, tempDir, pagesToProcess);
                content = claudeResult.text;
                processingMethod = claudeResult.method;
              } catch (claudeErr) {
                console.error('Claude Vision fallback also failed:', claudeErr);
                content = '[PDF processing failed - document may be damaged or encrypted]';
                processingMethod = 'all-methods-failed';
              }
            }
          }
        }
      } else if (mimeType.includes('text') || fileExtension === '.txt') {
        // Direct text file reading
        console.log('Processing as text file');
        content = fs.readFileSync(filePath, 'utf-8');
        processingMethod = 'direct-text';
      } else if (mimeType.includes('image') || 
                ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'].includes(fileExtension)) {
        // Process images with Tesseract OCR
        console.log('Processing as image with OCR');
        try {
          const ocrResult = await processImageWithOcr(filePath, tempDir);
          content = ocrResult.text;
          processingMethod = 'image-ocr';
          
          // If below threshold, try Claude Vision
          if (content.length < MIN_TEXT_LENGTH) {
            console.log(`Image OCR yielded minimal results (${content.length} chars), trying Claude Vision`);
            const claudeResult = await processWithClaudeVision(filePath, mimeType);
            
            if (claudeResult.text.length > content.length) {
              content = claudeResult.text;
              processingMethod = claudeResult.method;
              console.log(`Claude Vision improved image text extraction, new content length: ${content.length}`);
            }
          }
        } catch (err) {
          console.error('Image OCR error:', err);
          
          // Try Claude Vision as fallback
          try {
            console.log('Image OCR failed, falling back to Claude Vision');
            const claudeResult = await processWithClaudeVision(filePath, mimeType);
            content = claudeResult.text;
            processingMethod = claudeResult.method;
          } catch (claudeErr) {
            console.error('Claude Vision fallback also failed:', claudeErr);
            content = '[Image processing failed - unable to extract text]';
            processingMethod = 'all-methods-failed';
          }
        }
      } else {
        content = `[Unsupported file type: ${mimeType || fileExtension}]`;
        processingMethod = 'unsupported';
      }
    }
    
    // Clean up original uploaded file
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`Original uploaded file deleted: ${filePath}`);
      }
    } catch (err) {
      console.warn('Error deleting original file:', err);
    }
    
    // Apply OCR text cleaning
    if (processingMethod.includes('ocr') || processingMethod.includes('claude-vision')) {
      const originalLength = content.length;
      content = cleanOcrText(content);
      console.log(`OCR cleaning applied, content length changed from ${originalLength} to ${content.length}`);
    }
    
    console.log(`Processing complete, final content length: ${content.length}`);
    
    // Send progress update for completion
    if (fileSize > 5 * 1024 * 1024 && !res.writableEnded) {
      res.write(JSON.stringify({
        status: 'completed',
        message: 'File processing complete!',
        progress: 100
      }));
    }
    
    // Final response
    return res.status(200).json({
      content,
      filename: originalFilename,
      type: mimeType || fileExtension,
      processingMethod,
      pageCount: pageCount > 0 ? pageCount : undefined,
      fileSize
    });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ 
      message: 'Error processing file upload', 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  } finally {
    // Clean up temp directory
    if (tempDir && fs.existsSync(tempDir)) {
      try {
        // Use a recursive rm function for directories
        const rmRecursive = (dir: string) => {
          if (fs.existsSync(dir)) {
            fs.readdirSync(dir).forEach((file) => {
              const curPath = path.join(dir, file);
              if (fs.lstatSync(curPath).isDirectory()) {
                // Recurse
                rmRecursive(curPath);
              } else {
                // Delete file
                fs.unlinkSync(curPath);
              }
            });
            fs.rmdirSync(dir);
          }
        };
        
        rmRecursive(tempDir);
        console.log(`Temp directory cleaned up: ${tempDir}`);
      } catch (err) {
        console.warn('Error cleaning up temp directory:', err);
      }
    }
  }
}

// Process with Claude Vision for OCR
async function processWithClaudeVision(filePath: string, mimeType: string): Promise<{ text: string; method: string }> {
  console.log('Processing with Claude Vision...');
  
  try {
    // Check if this is a PDF
    const isPdf = mimeType.includes('pdf') || filePath.toLowerCase().endsWith('.pdf');
    let fileToProcess = filePath;
    let tempFilePath = '';
    
    // If it's a PDF, we need to convert the first page to an image first
    if (isPdf) {
      console.log('Converting PDF to image for Claude Vision...');
      
      // Check if Poppler is available for PDF conversion
      const poppler = await checkPoppler();
      
      if (!poppler.available) {
        throw new Error('Cannot process PDF with Claude Vision: Poppler not available for conversion');
      }
      
      // Create temp directory for the image if needed
      const tempDir = path.dirname(filePath);
      const pdfFilename = path.basename(filePath, '.pdf');
      const outputPath = path.join(tempDir, `${pdfFilename}-vision`);
      
      // Convert first page of PDF to PNG
      await exec(`${poppler.command} -png -f 1 -l 1 -r 300 "${filePath}" "${outputPath}"`);
      
      // Find the generated image file
      const imageFiles = fs.readdirSync(tempDir)
        .filter(file => file.startsWith(`${pdfFilename}-vision`) && file.endsWith('.png'))
        .map(file => path.join(tempDir, file));
      
      if (imageFiles.length === 0) {
        throw new Error('Failed to convert PDF to image for Claude Vision');
      }
      
      // Use the first page for processing
      fileToProcess = imageFiles[0];
      tempFilePath = fileToProcess; // Remember to clean up this temp file later
      mimeType = 'image/png';
    }
    
    // Check if it's a supported image type
    if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(mimeType)) {
      // If not a standard image format that Claude supports, convert to PNG
      if (mimeType.includes('image')) {
        // It's an image but not in a supported format, convert to PNG using ImageMagick if available
        try {
          const tempPngPath = `${fileToProcess}.converted.png`;
          await exec(`convert "${fileToProcess}" "${tempPngPath}"`);
          
          if (fs.existsSync(tempPngPath)) {
            if (tempFilePath) {
              // Clean up the previous temp file if it exists
              try { fs.unlinkSync(tempFilePath); } catch {}
            }
            
            fileToProcess = tempPngPath;
            tempFilePath = tempPngPath;
            mimeType = 'image/png';
          }
        } catch (convErr) {
          console.error('Failed to convert image format:', convErr);
          // Continue with original file and let Claude API handle error
        }
      } else {
        throw new Error(`Unsupported file type for Claude Vision: ${mimeType}`);
      }
    }
    
    // Read the file as a base64 string
    const fileBuffer = fs.readFileSync(fileToProcess);
    const base64File = fileBuffer.toString('base64');
    
    console.log(`Sending file to Claude Vision API (${Math.round(fileBuffer.length / 1024)} KB, type: ${mimeType})`);
    
    // Create Claude message with the image
    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307', // Use Claude 3 Haiku with vision
      max_tokens: 4000,
      temperature: 0.2,
      system: "You are an OCR specialist. Extract ALL text visible in the image with perfect formatting, including paragraph breaks. Include all text, tables, captions, headers, footers, and page numbers. Do not add any commentary, just extract the text precisely as it appears. If the image has no text and is a picture, then provide an extremely detailed description and analysis of the image, including conjectures about when and by whom it may have been made.",
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Please extract ALL text from this document, maintaining paragraph breaks and formatting as much as possible. Include tables, captions, headers, footers, and page numbers if present. Just give me the raw extracted text with no commentary.'
            },
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mimeType as "image/png" | "image/jpeg" | "image/gif" | "image/webp",
                data: base64File
              }
            }
          ]
        }
      ]
    });
    
    // Clean up temporary file if we created one
    if (tempFilePath && tempFilePath !== filePath) {
      try {
        fs.unlinkSync(tempFilePath);
        console.log(`Deleted temporary file: ${tempFilePath}`);
      } catch (unlinkErr) {
        console.warn(`Failed to delete temporary file ${tempFilePath}:`, unlinkErr);
      }
    }
    
    // Extract the text from Claude's response
    const extractedText = response.content[0]?.type === 'text' 
      ? response.content[0].text 
      : '';
    
    console.log(`Claude Vision extracted ${extractedText.length} characters`);
    
    // If this was a PDF, add a note that only the first page was processed
    const methodSuffix = isPdf ? '-pdf-first-page' : '';
    
    return {
      text: isPdf 
        ? extractedText + '\n\n[Note: Only the first page of the PDF was processed with Claude Vision]' 
        : extractedText,
      method: `claude-vision-ocr${methodSuffix}`
    };
  } catch (error) {
    console.error('Error in Claude Vision processing:', error);
    throw error;
  }
}

// Process multiple PDF pages with Claude Vision
async function processPdfWithClaudeVision(
  pdfPath: string, 
  tempDir: string, 
  maxPages: number = MAX_CLAUDE_VISION_PAGES
): Promise<{ text: string; method: string }> {
  console.log(`Processing up to ${maxPages} PDF pages with Claude Vision...`);
  
  // Check if Poppler is available for PDF conversion
  const poppler = await checkPoppler();
  
  if (!poppler.available) {
    throw new Error('Cannot process PDF with Claude Vision: Poppler not available for conversion');
  }
  
  try {
    // Convert PDF pages to images
    const pdfFilename = path.basename(pdfPath, '.pdf');
    const outputPath = path.join(tempDir, `${pdfFilename}-vision`);
    
    console.log(`Converting ${maxPages} PDF pages to images for Claude Vision`);
    await exec(`${poppler.command} -png -r 300 -f 1 -l ${maxPages} "${pdfPath}" "${outputPath}"`);
    
    // Find the generated image files
    const imageFiles = fs.readdirSync(tempDir)
      .filter(file => file.startsWith(`${pdfFilename}-vision`) && file.endsWith('.png'))
      .map(file => path.join(tempDir, file))
      .sort(); // Make sure they're in order
    
    if (imageFiles.length === 0) {
      throw new Error('Failed to convert PDF pages to images for Claude Vision');
    }
    
    console.log(`Generated ${imageFiles.length} page images for Claude Vision`);
    
    // Process each page with Claude Vision
    let allText = '';
    let pageNumber = 1;
    
    for (const imagePath of imageFiles) {
      console.log(`Processing page ${pageNumber} with Claude Vision`);
      
      try {
        const result = await processImageWithClaudeVision(imagePath);
        allText += `\n\n----- Page ${pageNumber} -----\n\n` + result.text;
        
        // Clean up the temporary image
        try {
          fs.unlinkSync(imagePath);
        } catch (err) {
          console.warn(`Error deleting temporary image: ${imagePath}`, err);
        }
      } catch (pageError) {
        console.error(`Error processing page ${pageNumber} with Claude Vision:`, pageError);
        allText += `\n\n----- Page ${pageNumber} -----\n\n[Text extraction failed for this page]`;
      }
      
      pageNumber++;
    }
    
    return {
      text: allText,
      method: `claude-vision-ocr-${imageFiles.length}-pages`
    };
  } catch (error) {
    console.error('Error in multi-page PDF Claude Vision processing:', error);
    throw error;
  }
}

// Process a single PDF page with Claude Vision
async function processSinglePageWithClaudeVision(
  pdfPath: string, 
  tempDir: string, 
  pageNumber: number
): Promise<{ text: string; method: string }> {
  console.log(`Processing PDF page ${pageNumber} with Claude Vision...`);
  
  // Check if Poppler is available for PDF conversion
  const poppler = await checkPoppler();
  
  if (!poppler.available) {
    throw new Error('Cannot process PDF with Claude Vision: Poppler not available for conversion');
  }
  
  try {
    // Convert specific PDF page to image
    const pdfFilename = path.basename(pdfPath, '.pdf');
    const outputPath = path.join(tempDir, `${pdfFilename}-p${pageNumber}`);
    
    console.log(`Converting PDF page ${pageNumber} to image for Claude Vision`);
    await exec(`${poppler.command} -png -r 300 -f ${pageNumber} -l ${pageNumber} "${pdfPath}" "${outputPath}"`);
    
    // Find the generated image file
    const imageFiles = fs.readdirSync(tempDir)
      .filter(file => file.startsWith(`${pdfFilename}-p${pageNumber}`) && file.endsWith('.png'))
      .map(file => path.join(tempDir, file));
    
    if (imageFiles.length === 0) {
      throw new Error(`Failed to convert PDF page ${pageNumber} to image for Claude Vision`);
    }
    
    // Process the image with Claude Vision
    const result = await processImageWithClaudeVision(imageFiles[0]);
    
    // Clean up the temporary image
    try {
      fs.unlinkSync(imageFiles[0]);
    } catch (err) {
      console.warn(`Error deleting temporary image: ${imageFiles[0]}`, err);
    }
    
    return {
      text: result.text,
      method: `claude-vision-ocr-page-${pageNumber}`
    };
  } catch (error) {
    console.error(`Error processing PDF page ${pageNumber} with Claude Vision:`, error);
    throw error;
  }
}

// Process an image with Claude Vision
async function processImageWithClaudeVision(imagePath: string): Promise<{ text: string; method: string }> {
  console.log(`Processing image with Claude Vision: ${imagePath}`);
  
  try {
    // Read the file as a base64 string
    const fileBuffer = fs.readFileSync(imagePath);
    const base64File = fileBuffer.toString('base64');
    const mimeType = 'image/png'; // Assume PNG since we convert everything to PNG
    
    console.log(`Sending image to Claude Vision API (${Math.round(fileBuffer.length / 1024)} KB)`);
    
    // Create Claude message with the image
    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307', // Use Claude 3 Haiku with vision
      max_tokens: 4000,
      temperature: 0.2,
      system: "You are an OCR specialist. Extract ALL text visible in the image with perfect formatting, including paragraph breaks. Include all text, tables, captions, headers, footers, and page numbers. Do not add any commentary, just extract the text precisely as it appears. If the image has no text and is a picture, then provide an extremely detailed description and analysis of the image, including conjectures about when and by whom it may have been made.",
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Please extract ALL text from this document, maintaining paragraph breaks and formatting as much as possible. Include tables, captions, headers, footers, and page numbers if present. Just give me the raw extracted text with no commentary.'
            },
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mimeType,
                data: base64File
              }
            }
          ]
        }
      ]
    });
    
    // Extract the text from Claude's response
    const extractedText = response.content[0]?.type === 'text' 
      ? response.content[0].text 
      : '';
    
    console.log(`Claude Vision extracted ${extractedText.length} characters from image`);
    
    return {
      text: extractedText,
      method: 'claude-vision-ocr-image'
    };
  } catch (error) {
    console.error('Error in Claude Vision image processing:', error);
    throw error;
  }
}

// Check if Poppler is installed and get the command
async function checkPoppler(): Promise<{ available: boolean; command: string }> {
  const possibleCommands = ['pdftoppm', 'pdftoppm.exe'];
  
  for (const cmd of possibleCommands) {
    try {
      const result = await exec(`which ${cmd}`);
      if (result.stdout.trim()) {
        console.log(`Found Poppler command: ${result.stdout.trim()}`);
        return { available: true, command: cmd };
      }
    } catch (err) {
      // Command not found, try next
    }
  }
  
  // Try checking if the command exists without 'which'
  try {
    await exec(`pdftoppm -v`);
    return { available: true, command: 'pdftoppm' };
  } catch (err) {
    // Try alternative flag
    try {
      await exec(`pdftoppm --version`);
      return { available: true, command: 'pdftoppm' };
    } catch (err2) {
      console.warn('Poppler (pdftoppm) not found in PATH');
      return { available: false, command: '' };
    }
  }
}

// Extract text from specific pages of a PDF
async function extractPdfTextRange(pdfPath: string, startPage: number, endPage: number): Promise<string> {
  console.log(`Extracting text from PDF pages ${startPage}-${endPage}`);
  
  try {
    const pdfBuffer = fs.readFileSync(pdfPath);
    
    // Use pdf-parse with more options
    const pdfData = await pdfParse(pdfBuffer, {
      max: endPage, // Maximum pages
      pagerender: (pageData) => {
        // Custom page renderer if needed
       return pageData.getTextContent()
         .then((textContent: any) => {
            let lastY, text = '';
            for (const item of textContent.items) {
              if (lastY != item.transform[5] || text.endsWith(' ')) {
                text += '\n';
              }
              text += item.str;
              lastY = item.transform[5];
            }
            return text;
          });
      }
    });

    // Filter content to only include the requested pages
    const lines = pdfData.text.split('\n');
    
    // Approximate page markers in the text - this depends on PDF structure
    const pagesStartMarkers = findPageBreaks(lines);
    
    if (pagesStartMarkers.length < startPage) {
      // If we can't determine page boundaries, return all text from the PDF
      console.log('Could not determine page boundaries, returning all extracted text');
      return pdfData.text;
    }
    
    const startIndex = pagesStartMarkers[startPage - 1] || 0;
    const endIndex = (endPage < pagesStartMarkers.length) ? pagesStartMarkers[endPage] : lines.length;
    
    const extractedText = lines.slice(startIndex, endIndex).join('\n');
    console.log(`Extracted ${extractedText.length} characters from pages ${startPage}-${endPage}`);
    
    return extractedText;
  } catch (error) {
    console.error(`Error extracting PDF text range for pages ${startPage}-${endPage}:`, error);
    throw error;
  }
}

// Find likely page breaks in PDF text
function findPageBreaks(lines: string[]): number[] {
  const markers: number[] = [0]; // First page starts at the beginning
  
  // Look for page break patterns - this is heuristic and depends on PDF structure
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    // Look for common page break patterns
    if (
      (line.match(/^\s*Page\s+\d+\s*$/i) && lines[i+1]?.trim() === '') || // "Page X" followed by blank line
      (line.match(/^\s*\d+\s*$/) && lines[i-1]?.trim() === '' && lines[i+1]?.trim() === '') || // Isolated page number between blank lines
      (line === '' && lines[i+1]?.trim() === '' && lines[i+2]?.match(/^\s*\d+\s*$/)) || // Multiple blank lines followed by page number
      (line.match(/^\s*-\s*\d+\s*-\s*$/) || line.match(/^\[\s*\d+\s*\]$/)) // Format like "-42-" or "[42]"
    ) {
      markers.push(i);
    }
  }
  
  // If we didn't find many page breaks but it's a long document,
  // use a simple heuristic based on approximate lines per page
  if (markers.length < 3 && lines.length > 100) {
    console.log('Few page markers found, using approximate page sizes');
    markers.length = 0;
    markers.push(0); // Start of first page
    
    const approxLinesPerPage = 50; // Rough estimate, adjust as needed
    for (let i = approxLinesPerPage; i < lines.length; i += approxLinesPerPage) {
      markers.push(i);
    }
  }
  
  return markers;
}

// Process specific PDF pages with OCR
async function processPdfPagesWithOcr(
  pdfPath: string, 
  tempDir: string, 
  startPage: number, 
  endPage: number
): Promise<{ text: string; method: string }> {
  console.log(`OCR processing PDF pages ${startPage}-${endPage}`);
  
  const poppler = await checkPoppler();
  
  if (!poppler.available) {
    console.log('Poppler not available for page extraction');
    return {
      text: `[Pages ${startPage}-${endPage}: OCR processing unavailable]`,
      method: 'pdf-noocr'
    };
  }
  
  try {
    const pdfFilename = path.basename(pdfPath, '.pdf');
    const outputPathBase = path.join(tempDir, `${pdfFilename}-page`);
    
    // Convert specific PDF pages to images using pdftoppm
    console.log(`Converting PDF pages ${startPage}-${endPage} to images`);
    await exec(`${poppler.command} -png -r 300 -f ${startPage} -l ${endPage} "${pdfPath}" "${outputPathBase}"`);
    
    // Get the list of generated image files
    const imageFiles = fs.readdirSync(tempDir)
      .filter(file => file.startsWith(`${pdfFilename}-page`) && file.endsWith('.png'))
      .map(file => path.join(tempDir, file))
      .sort();
    
    console.log(`Generated ${imageFiles.length} images from PDF pages ${startPage}-${endPage}`);
    
    if (imageFiles.length === 0) {
      console.warn(`No images generated from PDF pages ${startPage}-${endPage}`);
      return { 
        text: `[Pages ${startPage}-${endPage}: Image conversion failed]`, 
        method: 'pdf-image-failed' 
      };
    }
    
    // Process images with Tesseract OCR
    let pageText = '';
    for (const imagePath of imageFiles) {
      const ocrText = await runTesseractOcr(imagePath);
      pageText += ocrText + '\n\n';
      
      // Clean up the temporary image
      try {
        fs.unlinkSync(imagePath);
      } catch (err) {
        console.warn(`Error deleting temporary image: ${imagePath}`, err);
      }
    }
    
    return { text: pageText, method: 'pdf-ocr-pages' };
  } catch (err) {
    console.error(`Error in PDF pages OCR processing: ${startPage}-${endPage}`, err);
    return {
      text: `[Pages ${startPage}-${endPage}: OCR processing error]`,
      method: 'pdf-ocr-error'
    };
  }
}

// Process PDF with OCR by first converting to images
async function processPdfWithOcr(pdfPath: string, tempDir: string): Promise<{ text: string; method: string }> {
  console.log('Checking for Poppler installation...');
  
  // Check if Poppler is available
  const poppler = await checkPoppler();
  
  if (!poppler.available) {
    console.log('Poppler not available, using pdf-parse only');
    return {
      text: 'This PDF may contain images or scanned content that requires OCR processing. For better results, install Poppler utilities on your server.',
      method: 'pdf-parse-noocr'
    };
  }
  
  console.log('Starting PDF OCR processing with Poppler...');
  
  try {
    const pdfFilename = path.basename(pdfPath, '.pdf');
    const outputPath = path.join(tempDir, `${pdfFilename}-page`);
    
    // Convert PDF to images using pdftoppm
    console.log(`Converting PDF to images: ${pdfPath}`);
    await exec(`${poppler.command} -png -r 300 "${pdfPath}" "${outputPath}"`);
    
    // Get the list of generated image files
    const imageFiles = fs.readdirSync(tempDir)
      .filter(file => file.startsWith(`${pdfFilename}-page`) && file.endsWith('.png'))
      .map(file => path.join(tempDir, file))
      .sort();
    
    console.log(`Generated ${imageFiles.length} images from PDF`);
    
    if (imageFiles.length === 0) {
      console.warn('No images generated from PDF');
      return { text: '[PDF conversion failed - no images generated]', method: 'pdf-image-failed' };
    }
    
    // Process a reasonable number of pages (limit to first 20 to save processing time)
    const pagesToProcess = Math.min(imageFiles.length, 20); // Increased from 5 to 20
    let allText = '';
    
    // Process each image with Tesseract OCR
    for (let i = 0; i < pagesToProcess; i++) {
      console.log(`OCR processing page ${i + 1}/${pagesToProcess}`);
      const pageText = await runTesseractOcr(imageFiles[i]);
      allText += pageText + '\n\n';
      
      // Clean up the temporary image
      try {
        fs.unlinkSync(imageFiles[i]);
      } catch (err) {
        console.warn(`Error deleting temporary image: ${imageFiles[i]}`, err);
      }
    }
    
    if (imageFiles.length > pagesToProcess) {
      allText += `\n\n[Note: Only the first ${pagesToProcess} pages of ${imageFiles.length} total pages were processed]`;
    }
    
    return { text: allText, method: 'pdf-poppler-ocr' };
  } catch (err) {
    console.error('Error in PDF OCR processing:', err);
    
    // Fallback to simpler method
    return {
      text: 'PDF processing encountered an error. This may be due to lack of text content or an issue with the OCR system.',
      method: 'pdf-ocr-error'
    };
  }
}

// Process an image with Tesseract OCR
async function processImageWithOcr(imagePath: string, tempDir: string): Promise<{ text: string; method: string }> {
  return {
    text: await runTesseractOcr(imagePath),
    method: 'tesseract-ocr'
  };
}

// Run Tesseract OCR command line
async function runTesseractOcr(imagePath: string): Promise<string> {
  const outputBase = path.join(
    path.dirname(imagePath),
    `ocr-${path.basename(imagePath, path.extname(imagePath))}`
  );
  const outputTxt = `${outputBase}.txt`;
  
  try {
    // Run Tesseract OCR with improved options
    await exec(`tesseract "${imagePath}" "${outputBase}" -l eng --psm 3 --dpi 300 -c preserve_interword_spaces=1`);
    
    // Read the output
    if (fs.existsSync(outputTxt)) {
      const text = fs.readFileSync(outputTxt, 'utf-8');
      
      // Clean up
      fs.unlinkSync(outputTxt);
      
      return text;
    } else {
      throw new Error('Tesseract OCR output file not found');
    }
  } catch (err) {
    console.error('Tesseract OCR error:', err);
    
    // Try fallback to simpler version
    try {
      await exec(`tesseract "${imagePath}" "${outputBase}"`);
      
      if (fs.existsSync(outputTxt)) {
        const text = fs.readFileSync(outputTxt, 'utf-8');
        fs.unlinkSync(outputTxt);
        return text;
      }
    } catch (fallbackErr) {
      console.error('Tesseract fallback also failed:', fallbackErr);
    }
    
    return '[OCR processing failed]';
  }
}