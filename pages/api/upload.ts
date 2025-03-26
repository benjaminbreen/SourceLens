// pages/api/upload.ts
// Optimized file processing with intelligent fallbacks:
// - PDF processing with multiple layers: pdf-lib/pdf-parse → command-line tools → Gemini/Claude vision
// - Image OCR using Gemini Flash with automatic Claude Vision fallback
// - Handles text, PDF, images, and cleaned-up document handling with efficient error management

import type { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm } from 'formidable';
import fs from 'fs';
import path from 'path';
import util from 'util';
import { exec as execCallback } from 'child_process';
import { PDFDocument } from 'pdf-lib';
import pdfParse from 'pdf-parse';
import { cleanOcrText } from '@/lib/text-processing/cleanOcrText';
import os from 'os';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Anthropic } from '@anthropic-ai/sdk';

// Configure API clients
const googleAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

// Minimum text length to be considered successful extraction
const MIN_TEXT_LENGTH = 500;

// Maximum PDF size in bytes (20MB)
const MAX_PDF_SIZE = 20 * 1024 * 1024;

// Maximum PDF pages to process
const MAX_PDF_PAGES = 400;

// Convert exec to Promise-based
const exec = util.promisify(execCallback);

// Disable body parser for file uploads
export const config = {
  api: {
    bodyParser: false,
    responseLimit: false,
  },
};


interface TextContent {
  items: Array<{
    str: string;
    transform: number[];
    // Add other properties if needed
  }>;
  // Add other properties if needed
}

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
    tempDir = path.join(os.tmpdir(), `file-process-${Date.now()}`);
    fs.mkdirSync(tempDir, { recursive: true });
    console.log(`Created temp directory: ${tempDir}`);
    
    // Parse the form with increased file size limit
    const form = new IncomingForm({
      keepExtensions: true,
      maxFileSize: MAX_PDF_SIZE,
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
    
       function getSupportedMediaType(mimeType: string): "image/jpeg" | "image/png" | "image/gif" | "image/webp" {
  // Check if the mimeType is one of the supported types
  if (
    mimeType === "image/jpeg" || 
    mimeType === "image/png" || 
    mimeType === "image/gif" || 
    mimeType === "image/webp"
  ) {
    return mimeType as "image/jpeg" | "image/png" | "image/gif" | "image/webp";
  }
  
  // Default to image/jpeg if the provided type isn't supported
  return "image/jpeg";
}

    // Check if we should use AI Vision as the primary method
    const useAIVision = fields.useAIVision && fields.useAIVision[0] === 'true';
    console.log(`AI Vision preference: ${useAIVision ? 'PRIMARY' : 'FALLBACK'}`);
    
    // Get the selected AI Vision model
    const visionModel = fields.visionModel 
      ? fields.visionModel[0] 
      : 'gemini-2.0-flash';
    console.log(`Selected AI Vision model: ${visionModel}`);
    
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
    
    // Send initial status for large files
    if (fileSize > 5 * 1024 * 1024) {
      res.writeHead(202, {
        'Content-Type': 'application/json',
        'Transfer-Encoding': 'chunked'
      });
      
      res.write(JSON.stringify({
        status: 'processing',
        message: `Processing large file (${Math.round(fileSize / (1024 * 1024))} MB), please wait...`,
        progress: 10
      }));
    }
    
    let content = '';
    let processingMethod = '';
    let pageCount = 0;
    
    // Process based on file type
    if (mimeType.includes('pdf') || fileExtension === '.pdf') {
      console.log('Processing as PDF');
      const pdfBuffer = fs.readFileSync(filePath);
      
      try {
        // Try to get page count first
        try {
          const pdfDoc = await PDFDocument.load(pdfBuffer);
          pageCount = pdfDoc.getPageCount();
          console.log(`PDF has ${pageCount} pages (via pdf-lib)`);
          
          if (pageCount > MAX_PDF_PAGES) {
            return res.status(400).json({
              message: `PDF has too many pages (${pageCount}). Maximum allowed is ${MAX_PDF_PAGES} pages.`,
              error: 'TOO_MANY_PAGES'
            });
          }
        } catch (err) {
          console.warn('Could not get page count with pdf-lib, trying pdf-parse:', err);
          try {
            const data = await pdfParse(pdfBuffer, { max: 1 });
            pageCount = data.numpages || 0;
            console.log(`PDF has ${pageCount} pages (via pdf-parse)`);
            
            if (pageCount > MAX_PDF_PAGES) {
              return res.status(400).json({
                message: `PDF has too many pages (${pageCount}). Maximum allowed is ${MAX_PDF_PAGES} pages.`,
                error: 'TOO_MANY_PAGES'
              });
            }
          } catch {
            console.warn('Could not determine page count');
            // Continue without page count
          }
        }
        
        // Try extraction methods in order of preference
        
        // Status update for large files
        if (fileSize > 5 * 1024 * 1024 && !res.writableEnded) {
          res.write(JSON.stringify({
            status: 'processing',
            message: 'Extracting text from PDF...',
            progress: 20
          }));
        }
        
        // LAYER 1: Try command-line tools first
        console.log('LAYER 1: Trying command-line extraction tools...');
        let hasExtractedText = false;
        
        try {
          // Try pdftotext (part of poppler-utils)
          const tempPdfPath = path.join(tempDir, 'temp.pdf');
          const tempTextPath = path.join(tempDir, 'output.txt');
          
          fs.writeFileSync(tempPdfPath, pdfBuffer);
          
          await exec(`pdftotext -layout "${tempPdfPath}" "${tempTextPath}"`);
          
          if (fs.existsSync(tempTextPath)) {
            content = fs.readFileSync(tempTextPath, 'utf-8');
            processingMethod = 'pdftotext-command';
            hasExtractedText = true;
            
            console.log(`pdftotext extracted ${content.length} characters`);
            
            // Clean up temporary files
            try {
              fs.unlinkSync(tempPdfPath);
              fs.unlinkSync(tempTextPath);
            } catch (e) {
              console.warn('Error cleaning up temp files:', e);
            }
          }
        } catch (e) {
          console.warn('pdftotext extraction failed:', e);
        }
        
        // LAYER 2: Try pdf-parse if command-line tools failed
        if (!hasExtractedText) {
          console.log('Command-line tools unavailable or failed, trying pdf-parse...');
          
          if (fileSize > 5 * 1024 * 1024 && !res.writableEnded) {
            res.write(JSON.stringify({
              status: 'processing',
              message: 'Trying alternative PDF extraction...',
              progress: 30
            }));
          }
          
          try {
            // Custom renderer for better text extraction
            const renderOptions = {
              normalizeWhitespace: true,
              disableCombineTextItems: false
            };
            
            const data = await pdfParse(pdfBuffer, {
              pagerender: function(pageData) {
                return pageData.getTextContent(renderOptions)
                  .then(function(textContent: TextContent) {
                    let lastY: number | undefined, text = '';
                    const items = textContent.items;
                    
                    // Sort by y position then x to maintain reading order
                    items.sort(function(a, b) {
                      if (a.transform[5] !== b.transform[5]) {
                        return b.transform[5] - a.transform[5]; // Sort by y position (reversed)
                      }
                      return a.transform[4] - b.transform[4]; // Then by x position
                    });
                    
                    // Process text with better layout preservation
                    for (let i = 0; i < items.length; i++) {
                      const item = items[i];
                      
                      // Start a new line if y position changes significantly
                      if (lastY !== undefined && Math.abs(lastY - item.transform[5]) > 5) {
                        text += '\n';
                      } else if (i > 0 && items[i-1].str.slice(-1) !== ' ' && item.str[0] !== ' ') {
                        // Add space between words on same line if needed
                        text += ' ';
                      }
                      
                      text += item.str;
                      lastY = item.transform[5];
                    }
                    
                    return text;
                  });
              }
            });
            
            const extractedText = data.text.replace(/\s+/g, ' ')
                                         .replace(/(\n\s*){3,}/g, '\n\n')
                                         .trim();
            
            content = extractedText;
            processingMethod = 'optimized-pdf-parse';
            hasExtractedText = true;
            
            console.log(`pdf-parse extracted ${content.length} characters`);
          } catch (e) {
            console.warn('pdf-parse extraction failed:', e);
          }
        }
        
        // LAYER 3: Try AI-based extraction if needed
        if ((hasExtractedText && content.length < MIN_TEXT_LENGTH) || useAIVision) {
          console.log('Direct extraction insufficient or AI Vision requested');
          
          if (fileSize > 5 * 1024 * 1024 && !res.writableEnded) {
            res.write(JSON.stringify({
              status: 'processing',
              message: 'Using AI for enhanced PDF processing...',
              progress: 50
            }));
          }
          
       

          // Try Gemini Flash first
          try {
            const modelName = "gemini-2.0-flash";
            const model = googleAI.getGenerativeModel({ model: modelName });
            
            const prompt = "Extract all text content from this PDF document, which is a public domain historical source. Preserve paragraph structure, headings, and formatting. Include all text without summarization or modification.";
            
            const result = await model.generateContent({
              contents: [
                {
                  role: "user",
                  parts: [
                    { text: prompt },
                    { 
                      inlineData: {
                        mimeType: "application/pdf",
                        data: pdfBuffer.toString('base64')
                      }
                    }
                  ]
                }
              ],
              generationConfig: {
                temperature: 0.1,
                maxOutputTokens: 8192,
              }
            });
            
            const geminiContent = result.response.text();
            console.log(`Gemini extracted ${geminiContent.length} characters from PDF`);
            
            if (geminiContent.length > content.length) {
              content = geminiContent;
              processingMethod = `gemini-native-pdf-${modelName}`;
            } else if (content.length > 0) {
              console.log(`Keeping direct extraction as it's better (${content.length} > ${geminiContent.length} chars)`);
            } else {
              content = geminiContent;
              processingMethod = `gemini-native-pdf-${modelName}`;
            }
          } catch (geminiErr) {
            console.error('Gemini PDF processing error:', geminiErr);
            // Fall back to Claude Vision if Gemini fails or content still insufficient
          }
          
          // Fall back to Claude Vision if needed
          if (content.length < MIN_TEXT_LENGTH) {
            console.log('Using Claude Vision for first page OCR as fallback');
            
            if (fileSize > 5 * 1024 * 1024 && !res.writableEnded) {
              res.write(JSON.stringify({
                status: 'processing',
                message: 'Using Claude Vision for detailed OCR...',
                progress: 75
              }));
            }
            
            try {
              // Convert first page to image
              const poppler = await checkPoppler();
              
              if (poppler.available) {
                const pdfFilename = path.basename(filePath, '.pdf');
                const outputPath = path.join(tempDir, `${pdfFilename}-page1`);
                await exec(`${poppler.command} -png -r 300 -f 1 -l 1 "${filePath}" "${outputPath}"`);
                
                const imageFiles = fs.readdirSync(tempDir)
                  .filter(file => file.startsWith(`${pdfFilename}-page1`) && file.endsWith('.png'))
                  .map(file => path.join(tempDir, file));
                
                if (imageFiles.length > 0) {
                  const imageBuffer = fs.readFileSync(imageFiles[0]);
                  const base64Image = imageBuffer.toString('base64');

                  const response = await anthropic.messages.create({
                    model: 'claude-3-5-haiku-latest',
                    max_tokens: 8000,
                    temperature: 0.1,
                    system: "Extract ALL text visible in the image with perfect formatting, including paragraph breaks. Include all text, tables, captions, headers, footers, and page numbers.",
                    messages: [
                      {
                        role: 'user',
                        content: [
                          {
                            type: 'text',
                            text: 'Extract ALL text from this document page, maintaining formatting as much as possible. Just give me the raw extracted text with no commentary.'
                          },
                          {
                            type: 'image',
                            source: {
                              type: 'base64',
                              media_type: getSupportedMediaType(mimeType || ''),
                              data: base64Image
                            }
                          }
                        ]
                      }
                    ]
                  });
                  
                  const claudeText = response.content[0]?.type === 'text' ? response.content[0].text : '';
                  console.log(`Claude Vision extracted ${claudeText.length} characters from first page`);
                  
                  // Only use Claude Vision if it gives better results or if we have very little content
                  if (claudeText.length > content.length || content.length < MIN_TEXT_LENGTH / 2) {
                    let claudeContent = claudeText;
                    if (pageCount > 1) {
                      claudeContent += `\n\n[Note: This is only the first page of a ${pageCount}-page document. The remaining pages were not processed.]`;
                    }
                    
                    content = claudeContent;
                    processingMethod = 'claude-vision-first-page';
                    console.log(`Using Claude Vision output (${claudeText.length} chars)`);
                  }
                  
                  // Clean up temporary image
                  try {
                    fs.unlinkSync(imageFiles[0]);
                  } catch (err) {
                    console.warn(`Error deleting temporary image: ${imageFiles[0]}`, err);
                  }
                }
              } else {
                console.log('Poppler not available, cannot convert PDF page for Claude Vision');
              }
            } catch (claudeErr) {
              console.error('Claude Vision OCR error:', claudeErr);
              // Continue with best content we have so far
            }
          }
        } else if (hasExtractedText) {
          console.log(`Direct extraction successful, yielded ${content.length} characters`);
        } else {
          console.log('All extraction methods failed');
          content = '[PDF processing failed - document may be damaged, encrypted, or contain no extractable text]';
          processingMethod = 'all-methods-failed';
        }
      } catch (error) {
        console.error('PDF processing error:', error);
        content = '[PDF processing failed - document may be damaged or encrypted]';
        processingMethod = 'all-methods-failed';
      }
    } else if (mimeType.includes('text') || fileExtension === '.txt') {
      // Direct text file reading
      console.log('Processing as text file');
      content = fs.readFileSync(filePath, 'utf-8');
      processingMethod = 'direct-text';
    } else if (mimeType.includes('image') || 
              ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'].includes(fileExtension)) {
      // Image processing with auto-fallback from Gemini to Claude
      console.log('Processing image with AI Vision');
      
      // Read the image file
      const imageBuffer = fs.readFileSync(filePath);
      
      // Always try Gemini first, then fall back to Claude if it fails
      let geminiSuccess = false;
      
      if (!visionModel.includes('claude')) {
        try {
          // Try Gemini Vision first
          console.log('Trying Gemini Vision first for image OCR');
          const model = googleAI.getGenerativeModel({ model: visionModel });
          
          const result = await model.generateContent({
            contents: [
              {
                role: "user",
                parts: [
                  { text: "Extract all text from this image accurately, preserving formatting. If the image has no text, describe what is shown in the image in detail." },
                  { 
                    inlineData: {
                      mimeType: mimeType || "image/jpeg",
                      data: imageBuffer.toString('base64')
                    }
                  }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.1,
              maxOutputTokens: 4096,
            }
          });
          
          content = result.response.text();
          processingMethod = `gemini-vision-image-${visionModel}`;
          geminiSuccess = true;
          console.log(`Gemini Vision extracted ${content.length} characters from image`);
          
        } catch (geminiErr) {
          console.error('Gemini Vision error (trying Claude as fallback):', geminiErr);
          // Will fall back to Claude Vision below
        }
      }
      
      // Use Claude Vision if Gemini failed or was not attempted
      if (!geminiSuccess || visionModel.includes('claude')) {
        try {
          console.log('Using Claude Vision for image OCR');
          const base64Image = imageBuffer.toString('base64');
          
          const response = await anthropic.messages.create({
            model: 'claude-3-5-haiku-latest',
            max_tokens: 8000,
            temperature: 0.1,
            system: "Extract ALL text visible in the image with perfect formatting. If the image has no text, then provide a detailed description of the image.",
            messages: [
              {
                role: 'user',
                content: [
                  {
                    type: 'text',
                    text: 'Please extract ALL text from this image, maintaining formatting as much as possible. If there is no text, provide a detailed description of the image.'
                  },
                  {
                    type: 'image',
                    source: {
                      type: 'base64',
                     media_type: getSupportedMediaType(mimeType || ''),
                      data: base64Image
                    }
                  }
                ]
              }
            ]
          });
          
          content = response.content[0]?.type === 'text' ? response.content[0].text : '';
          processingMethod = 'claude-vision-image';
          console.log(`Claude Vision extracted ${content.length} characters from image`);
          
        } catch (claudeErr) {
          console.error('Claude Vision error:', claudeErr);
          
          // If both models failed, set error content
          if (!geminiSuccess) {
            content = '[Image processing failed - unable to extract text with either Gemini or Claude. This may be due to the nature of the content. Try a different source.)]';
            processingMethod = 'image-processing-failed';
          }
        }
      }
    }

     else {
      content = `[Unsupported file type: ${mimeType || fileExtension}]`;
      processingMethod = 'unsupported';
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
    if (processingMethod.includes('ocr') || processingMethod.includes('vision') || processingMethod.includes('gemini')) {
      const originalLength = content.length;
      content = cleanOcrText(content);
      console.log(`Text cleaning applied, content length changed from ${originalLength} to ${content.length}`);
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

  // Helper function to check if a command is available
async function checkCommandAvailable(command: string): Promise<boolean> {
  try {
    await exec(`which ${command}`);
    return true;
  } catch (err) {
    return false;
  }
}

// Helper function to format duration in HH:MM:SS
function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  return [
    hours > 0 ? String(hours).padStart(2, '0') : '',
    String(minutes).padStart(2, '0'),
    String(secs).padStart(2, '0')
  ].filter(Boolean).join(':');
}
}


