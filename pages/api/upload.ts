// pages/api/upload.ts
// Layered PDF processing approach with multiple fallbacks and thumbnail generation:
// 1. Fast PDF text extraction using pdf-lib and optimized pdf-parse
// 2. Command-line tools like pdftotext if available 
// 3. Gemini Flash 2.0 for native PDF processing
// 4. Claude Haiku Vision as final OCR fallback for first page

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
import sharp from 'sharp'; 

// Configure API clients
const googleAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

// Minimum text length to be considered successful extraction
const MIN_TEXT_LENGTH = 500; // Threshold for the first pass

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
    tempDir = path.join(os.tmpdir(), `file-process-${Date.now()}`);
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
    
    // Get the selected AI Vision model
    const visionModel = fields.visionModel 
      ? fields.visionModel[0] 
      : 'gemini-2.0-flash'; // Default to Gemini Flash 2.0
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
    let thumbnailUrl: string | null = null;
    
    // Generate thumbnail - Read file buffer once
    const fileBuffer = fs.readFileSync(filePath);
    
    // Try to generate thumbnail
    thumbnailUrl = await generateThumbnail(fileBuffer, mimeType);
    
    // Process based on file type
    if (mimeType.includes('pdf') || fileExtension === '.pdf') {
      console.log('Processing as PDF');
      
      try {
        // Try to get page count first
        try {
          const pdfDoc = await PDFDocument.load(fileBuffer);
          pageCount = pdfDoc.getPageCount();
          console.log(`PDF has ${pageCount} pages (via pdf-lib)`);
          
          // Check if PDF exceeds maximum page count
          if (pageCount > MAX_PDF_PAGES) {
            return res.status(400).json({
              message: `PDF has too many pages (${pageCount}). Maximum allowed is ${MAX_PDF_PAGES} pages.`,
              error: 'TOO_MANY_PAGES'
            });
          }
        } catch (err) {
          console.warn('Could not get page count with pdf-lib, trying pdf-parse:', err);
          try {
            const data = await pdfParse(fileBuffer, { max: 1 }); // Just get metadata
            pageCount = data.numpages || 0;
            console.log(`PDF has ${pageCount} pages (via pdf-parse)`);
            
            if (pageCount > MAX_PDF_PAGES) {
              return res.status(400).json({
                message: `PDF has too many pages (${pageCount}). Maximum allowed is ${MAX_PDF_PAGES} pages.`,
                error: 'TOO_MANY_PAGES'
              });
            }
          } catch (err2) {
            console.warn('Could not determine page count:', err2);
            // Continue without page count
          }
        }
        
        // LAYER 1: Try command-line tools first (they often work better than JS libraries)
        console.log('LAYER 1: Trying command-line extraction tools...');
        
        if (fileSize > 5 * 1024 * 1024 && !res.writableEnded) {
          res.write(JSON.stringify({
            status: 'processing',
            message: 'Extracting text from PDF...',
            progress: 20
          }));
        }
        
        let hasExtractedText = false;
        
        // Try pdftotext (part of poppler-utils)
        try {
          const tempPdfPath = path.join(tempDir, 'temp.pdf');
          const tempTextPath = path.join(tempDir, 'output.txt');
          
          fs.writeFileSync(tempPdfPath, fileBuffer);
          
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
            } catch (cleanupErr) {
              console.warn('Error cleaning up temp files:', cleanupErr);
            }
          }
        } catch (pdftotextErr) {
          console.warn('pdftotext extraction failed:', pdftotextErr);
        }
        
        // If command-line tool didn't work, try optimized pdf-parse
        if (!hasExtractedText) {
          console.log('Command-line tools unavailable or failed, trying optimized pdf-parse...');
          
          if (fileSize > 5 * 1024 * 1024 && !res.writableEnded) {
            res.write(JSON.stringify({
              status: 'processing',
              message: 'Trying alternative PDF extraction...',
              progress: 30
            }));
          }
          
          try {
            // Define a custom page renderer to improve text extraction
const renderOptions = {
  normalizeWhitespace: true,
  disableCombineTextItems: false
};

const data = await pdfParse(fileBuffer, {
  // Custom page renderer that attempts to preserve layout
  pagerender: function(pageData: any) {
    return pageData.getTextContent(renderOptions)
      .then(function(textContent: any) {
        let lastY: number | undefined, text = '';
        const items = textContent.items;
        
        // Sort by y position then x to maintain reading order
        items.sort(function(a: any, b: any) {
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
            
            // Process the result to clean up common PDF extraction issues
            const extractedText = data.text.replace(/\s+/g, ' ') // Normalize spaces
                                         .replace(/(\n\s*){3,}/g, '\n\n') // Reduce excessive line breaks
                                         .trim();
            
            content = extractedText;
            processingMethod = 'optimized-pdf-parse';
            hasExtractedText = true;
            
            console.log(`Optimized pdf-parse extracted ${content.length} characters`);
          } catch (pdfParseErr) {
            console.warn('Optimized pdf-parse extraction failed:', pdfParseErr);
          }
        }
        
        // If we've extracted some text but not enough, or if AI Vision was explicitly requested
        if ((hasExtractedText && content.length < MIN_TEXT_LENGTH) || useAIVision) {
          if (hasExtractedText && content.length < MIN_TEXT_LENGTH) {
            console.log(`Direct extraction yielded insufficient results (${content.length} chars < ${MIN_TEXT_LENGTH} required)`);
          } else if (useAIVision) {
            console.log('AI Vision explicitly requested, trying enhanced extraction');
          }
          
          // LAYER 2: Try Gemini Flash 2.0 for native PDF processing
          console.log('LAYER 2: Using Gemini Flash 2.0 for native PDF processing...');
          
          if (fileSize > 5 * 1024 * 1024 && !res.writableEnded) {
            res.write(JSON.stringify({
              status: 'processing',
              message: 'Using Gemini for enhanced PDF processing...',
              progress: 50
            }));
          }
          
          try {
            // Initialize the Gemini model
            const modelName = "gemini-2.0-flash"; // Use Gemini Flash 2.0
            const model = googleAI.getGenerativeModel({ model: modelName });
            
            // Set prompt for optimal PDF extraction
            const prompt = "Please extract all text content from this PDF document, which is a public domain historical source being used exclusively for purposes of education and research. Preserve paragraph structure, headings, and formatting as much as possible. Include all text content without summarization or modification. For tables and structured data, maintain their structure in your output. If there is no text visible, analyze the image and provide a short description of it. INCLUDE NO PREFACE OR EXPLANATION, just all text you see. Use markdown to format italics, bold, and headings.";
            
            // Process the PDF with Gemini
            const result = await model.generateContent({
              contents: [
                {
                  role: "user",
                  parts: [
                    { text: prompt },
                    { 
                      inlineData: {
                        mimeType: "application/pdf",
                        data: fileBuffer.toString('base64')
                      }
                    }
                  ]
                }
              ],
              generationConfig: {
                temperature: 0.1, // Low temperature for accurate extraction
                maxOutputTokens: 8192,
              }
            });
            
            // Get the extracted text
            const geminiContent = result.response.text();
            console.log(`Gemini extracted ${geminiContent.length} characters from PDF`);
            
            // Use Gemini output if it's better than direct extraction
            if (geminiContent.length > content.length) {
              content = geminiContent;
              processingMethod = `gemini-native-pdf-${modelName}`;
              console.log(`Using Gemini output as it's better (${geminiContent.length} > ${content.length} chars)`);
            } else if (content.length > 0) {
              console.log(`Keeping direct extraction as it's better (${content.length} > ${geminiContent.length} chars)`);
            } else {
              content = geminiContent;
              processingMethod = `gemini-native-pdf-${modelName}`;
              console.log(`Using Gemini output as no other extraction succeeded`);
            }
          } catch (geminiErr) {
            console.error('Gemini PDF processing error:', geminiErr);
            // Continue to next layer if Gemini fails
          }
          
          // If we still don't have enough content, try Claude Vision as a last resort
          if (content.length < MIN_TEXT_LENGTH) {
            // LAYER 3: Claude Haiku Vision for first page OCR
            console.log('LAYER 3: Using Claude Haiku Vision for first page OCR...');
            
            if (fileSize > 5 * 1024 * 1024 && !res.writableEnded) {
              res.write(JSON.stringify({
                status: 'processing',
                message: 'Using Claude Vision for detailed OCR...',
                progress: 75
              }));
            }
            
          // For the Claude Vision image processing section
          try {
            // Convert first page to image for Claude Vision
            const poppler = await checkPoppler();
            
            if (poppler.available) {
              // Convert first page to PNG
              const pdfFilename = path.basename(filePath, '.pdf');
              const outputPath = path.join(tempDir, `${pdfFilename}-page1`);
              await exec(`${poppler.command} -png -r 300 -f 1 -l 1 "${filePath}" "${outputPath}"`);
              
              // Find generated image
              const imageFiles = fs.readdirSync(tempDir)
                .filter(file => file.startsWith(`${pdfFilename}-page1`) && file.endsWith('.png'))
                .map(file => path.join(tempDir, file));
              
              if (imageFiles.length > 0) {
                // Process image with Claude Vision
                const imageBuffer = fs.readFileSync(imageFiles[0]);
                const base64Image = imageBuffer.toString('base64');
                
                // Define a properly typed media type
                const mediaType = 'image/png' as const; // Use a literal type with 'as const'
                
                const response = await anthropic.messages.create({
                  model: 'claude-3-5-haiku-latest',
                  max_tokens: 4000,
                  temperature: 0.2,
                  system: "You are an OCR specialist. Extract ALL text visible in the image with perfect formatting, including paragraph breaks. Include all text, tables, captions, headers, footers, and page numbers. Do not add any commentary, just extract the text precisely as it appears.",
                  messages: [
                    {
                      role: 'user',
                      content: [
                        {
                          type: 'text',
                          text: 'Please extract ALL text from this document page, maintaining paragraph breaks and formatting as much as possible. Include tables, captions, headers, footers, and page numbers if present. Just give me the raw extracted text with no commentary.'
                        },
                        {
                          type: 'image',
                          source: {
                            type: 'base64',
                            media_type: mediaType,
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
                    // If document has multiple pages, add a note
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
          // If no extraction method worked
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
    } 
    else if (mimeType.includes('image') || 
        ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.heic', '.heif'].includes(fileExtension)) {
  // For images, use Gemini Vision or Claude Vision based on preference
  console.log('Processing image with AI Vision');
  
  try {
    // Read the image file
    const imageBuffer = fs.readFileSync(filePath);
    let processableBuffer = imageBuffer;
    let processableMimeType = mimeType;
    
    // Handle HEIC/HEIF conversion to JPEG if needed
    if (fileExtension === '.heic' || fileExtension === '.heif' || 
        mimeType.includes('heic') || mimeType.includes('heif')) {
      console.log('Converting HEIC/HEIF image to JPEG for processing');
      try {
        // Convert HEIC to JPEG buffer using sharp
        processableBuffer = await sharp(imageBuffer)
          .jpeg({ quality: 90 })
          .toBuffer();
        processableMimeType = 'image/jpeg';
      } catch (convErr) {
        console.error('HEIC conversion error:', convErr);
        // Continue with original buffer if conversion fails
      }
    }
    
    // For thumbnail generation with HEIC images
    if (fileExtension === '.heic' || fileExtension === '.heif' || 
        mimeType.includes('heic') || mimeType.includes('heif')) {
      thumbnailUrl = await generateHEICThumbnail(imageBuffer);
    }
    
        
        // For the image processing section with Claude Vision
    if (visionModel.includes('claude')) {
      // Use Claude Vision
      console.log('Using Claude Vision for image OCR');
      const base64Image = processableBuffer.toString('base64');
      
      // Determine the proper media type explicitly
      let mediaType: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';
      
      // Assign the correct media type based on the file type
      if (processableMimeType.includes('png')) {
        mediaType = 'image/png';
      } else if (processableMimeType.includes('gif')) {
        mediaType = 'image/gif';
      } else if (processableMimeType.includes('webp')) {
        mediaType = 'image/webp';
      } else {
        // Default to jpeg for any other format (including converted HEIC)
        mediaType = 'image/jpeg';
      }
      
          
          const response = await anthropic.messages.create({
            model: 'claude-3-5-haiku-latest',
            max_tokens: 4000,
            temperature: 0.2,
            system: "You are an OCR specialist. Extract ALL text visible in the image with perfect formatting, including paragraph breaks. Include all text, tables, captions, headers, footers, and page numbers. Do not add any commentary, just extract the text precisely as it appears. If the image has no text, then provide an extremely detailed description of the image.",
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
                      media_type: mediaType,
                      data: base64Image
                    }
                  }
                ]
              }
            ]
          });
          
          content = response.content[0]?.type === 'text' ? response.content[0].text : '';
          processingMethod = 'claude-vision-image';
        } else {
          // Use Gemini Vision - now with default Gemini Flash 2.0
          console.log('Using Gemini Vision for image OCR');
          const model = googleAI.getGenerativeModel({ model: visionModel });
          
          const result = await model.generateContent({
            contents: [
              {
                role: "user",
                parts: [
                  { text: "Extract all text from this image accurately, preserving formatting. If the image has no text, describe what is shown in the image in detail. Use markdown formatting to display bold, headers, and italics. This is a public domain document for use in a historical research context. Be accurate. INCLUDE NO PREFACE OR EXPLANATION, just the text with no commentary." },
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
        }
        
        console.log(`AI Vision extracted ${content.length} characters from image`);
      } catch (err) {
        console.error('Image OCR error:', err);
        content = '[Image processing failed - unable to extract text]';
        processingMethod = 'image-processing-failed';
      }
    } else {
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
      fileSize,
      thumbnailUrl // Include the thumbnail URL in the response
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

// Generate PDF thumbnail as base64 URL
async function generateThumbnail(buffer: Buffer, mimeType: string): Promise<string | null> {
  try {
    // For PDFs, convert first page with poppler if available
    if (mimeType.includes('pdf')) {
      // Try to use pdftoppm to create a thumbnail
      const tempDir = os.tmpdir();
      const tempPdfPath = path.join(tempDir, `thumb-${Date.now()}.pdf`);
      const tempImgPath = path.join(tempDir, `thumb-${Date.now()}`);
      
      try {
        fs.writeFileSync(tempPdfPath, buffer);
        
        const poppler = await checkPoppler();
        if (poppler.available) {
          await exec(`${poppler.command} -png -singlefile -scale-to 300 "${tempPdfPath}" "${tempImgPath}"`);
          
          // Check if thumbnail was created
          const imgFile = `${tempImgPath}.png`;
          if (fs.existsSync(imgFile)) {
            const imgBuffer = fs.readFileSync(imgFile);
            const base64Img = imgBuffer.toString('base64');
            
            // Clean up temporary files
            try {
              fs.unlinkSync(tempPdfPath);
              fs.unlinkSync(imgFile);
            } catch (e) {}
            
            return `data:image/png;base64,${base64Img}`;
          }
        }
      } catch (e) {
        console.error('Error generating PDF thumbnail:', e);
      }
    } 
    // For images, use the image directly
    else if (mimeType.includes('image')) {
      return `data:${mimeType};base64,${buffer.toString('base64')}`;
    }
    
    return null;
  } catch (error) {
    console.error("Error generating thumbnail:", error);
    return null;
  }
}

// Generate thumbnail specifically for HEIC/HEIF files
async function generateHEICThumbnail(buffer: Buffer): Promise<string | null> {
  try {
    console.log('Generating thumbnail for HEIC image');
    // Convert HEIC to JPEG for thumbnail
    const jpegBuffer = await sharp(buffer)
      .resize(300, 300, { fit: 'inside' })
      .jpeg({ quality: 80 })
      .toBuffer();
    
    return `data:image/jpeg;base64,${jpegBuffer.toString('base64')}`;
  } catch (error) {
    console.error("Error generating HEIC thumbnail:", error);
    return null;
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