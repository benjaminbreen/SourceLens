// pages/api/extract-metadata.ts
// API endpoint for extracting metadata from source text using Gemini Flash model
// Improved with citation generation, additional scholarly metadata fields, and thumbnail generation

import type { NextApiRequest, NextApiResponse } from 'next';
import { OpenAI } from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { exec } from 'child_process';
import util from 'util';
import { PDFDocument } from 'pdf-lib';

// Configure OpenAI client as fallback
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Configure Google Gemini client
const googleAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

// Convert exec to Promise-based
const execPromise = util.promisify(exec);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  try {
    const { text, file } = req.body;
    
    if (!text) {
      return res.status(400).json({ message: 'Text is required' });
    }
    
    // Truncate text to first 10,000 words to avoid token limit errors
    const truncatedText = text.split(/\s+/).slice(0, 10000).join(' ');
    console.log(`Original text length: ${text.length} chars, truncated to: ${truncatedText.length} chars`);
    
    // Set up prompt for metadata extraction
    const promptContent = `Extract document metadata from the provided text (this is only the beginning portion of a longer document). 
    Return ONLY a JSON object with these fields:
    - date: the most likely publication date found in ISO format (YYYY-MM-DD) or provide your best guess if unclear from text (if a guess, render it simply as a circa year, circa YYYY, without month or day). ALWAYS provide a guess here. This must be date CREATED, not other dates that appear in text. If a year is less than 4 digits, render it without zeroes, i.e. 65 CE is 65 CE, not 0065 CE. Always use CE or BCE if it may be unclear.
    - author: the most likely author name or say "UNKNOWN" if truly uncertain. ONLY IN THE CASE OF UNKNOWN, include a paranthetical 3-4 word phrase which is your choice of a best guess as to author's approximate identity, like their social class, time period, milieu, etc. If author is known, ALWAYS return ONLY the full author name. In some cases there will be an AUTHOR and an EDITOR, in which case list the author here and editor in additionalInfo. If a name has initials, ALWAYS silently expand to your best guess of the full name (i.e. change W. to William, or whatever makes most sense based on context.)
    - title: the most likely document title. Always come up with something here. If there is no title, create a descriptive phrase, i.e. if its a brief letter to someone and you can find name, title should be "Short letter to [person]." If you can't find name, then "short letter about [contents]"
    - summary: a VERY SHORT 5-6 word summary of the document content
    - documentEmoji: a single emoji that creatively represents the document's content, theme, or time period
    - researchValue: a brief 1-2 sentence description of what this document might be useful for researching
    - additionalInfo: one sentence of any other relevent information extracted from text or speculation based on your training data. If unsure of author or title, ALWAYS provide your best guess here based on context clues. If there appears to be metadata in the text itself, include it here (1 sentence max)
    - documentType: the type of document (e.g., Letter, Diary, Speech, etc.) or empty string if uncertain
    - genre: the literary or historical genre of the document or empty string if uncertain. Be specific but brief, i.e. "field notes" rather than "non-fiction" or "anthropological field notes"
    - placeOfPublication: where the document was created or published, in format of: City, Country. If no specific information is available, consider the language and context to make a best guess as to country of origin. ALWAYS guess the country. 
    - academicSubfield: what academic fields might study this document or empty string if uncertain
    - tags: an array of 3-5 keyword tags related to the document's content and context
    - fullCitation: a complete Chicago-style citation for this source based on the available information. Construct this using the author, title, place of publication, date, and any other relevant details. If you don't have enough information for a proper citation, make your best attempt and include available data in standard Chicago format. If citation is impossible, leave an empty string.
    
    Extrapolate and make educated guesses if a field is not obvious, but if unsure please indicate this (in the case of dates, by preceding integer with 'circa').`;
    
    let extractedMetadata: any = {};
    
    try {
      // Primary attempt with Gemini Flash
      console.log("Attempting metadata extraction with Gemini Flash");
      const model = googleAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: promptContent + "\n\nTEXT TO ANALYZE:\n" + truncatedText }] }],
        generationConfig: {
          temperature: 0.2,
        },
      });
      
      const response = result.response;
      const responseText = response.text();
      
      // Try to parse JSON from response
      try {
        // Extract JSON if it's wrapped in backticks
        const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/) || 
                          responseText.match(/```\s*([\s\S]*?)\s*```/) ||
                          [null, responseText];
        
        const jsonContent = jsonMatch[1] || responseText;
        extractedMetadata = JSON.parse(jsonContent);
        console.log("Successfully extracted metadata with Gemini Flash");
      } catch (parseError) {
        console.error("Error parsing Gemini JSON response:", parseError);
        // Fall back to OpenAI if JSON parsing fails
        throw new Error("Failed to parse Gemini response");
      }
    } catch (geminiError) {
      // Fallback to OpenAI
      console.warn("Gemini Flash failed, falling back to OpenAI:", geminiError);
      
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: promptContent
          },
          {
            role: 'user',
            content: truncatedText
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.2,
      });
      
      // Parse the response
      const content = completion.choices[0].message.content;
      // Add a null check
      extractedMetadata = content ? JSON.parse(content) : {};
      console.log("Successfully extracted metadata with OpenAI fallback");
    }
    
    // If a file was uploaded and had a base64 data field, include it as thumbnailUrl
    if (req.body.fileData) {
  try {
    // The file data should be passed in the request body
    const { fileData, fileType } = req.body;
    
    if (fileType === 'application/pdf' && fileData) {
      // Generate thumbnail for PDF
      console.log("Generating thumbnail from PDF first page");
      const thumbnailUrl = await generatePdfThumbnail(fileData);
      if (thumbnailUrl) {
        extractedMetadata.thumbnailUrl = thumbnailUrl;
        console.log("Successfully added PDF thumbnail to metadata");
      }
    } else if (fileType.startsWith('image/') && fileData) {
      // If it's already an image, use the data directly
      console.log("Using image data directly as thumbnail");
      extractedMetadata.thumbnailUrl = fileData;
      console.log("Successfully added image thumbnail to metadata");
    }
  } catch (thumbnailError) {
    console.error("Error generating thumbnail:", thumbnailError);
    // Continue without thumbnail if there's an error
  }
}

// Add this log to debug
console.log("Final metadata includes thumbnailUrl:", !!extractedMetadata.thumbnailUrl);
    
    return res.status(200).json(extractedMetadata);
  } catch (error) {
    console.error('Metadata extraction error:', error);
    return res.status(500).json({ 
      message: 'Error extracting metadata',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Function to generate a thumbnail from the first page of a PDF
async function generatePdfThumbnail(pdfData: string): Promise<string | null> {
  try {
    // Decode base64 data
    const buffer = Buffer.from(pdfData.replace(/^data:application\/pdf;base64,/, ''), 'base64');
    
    // Load the PDF
    const pdfDoc = await PDFDocument.load(buffer);
    
    // Get the first page
    if (pdfDoc.getPageCount() === 0) {
      console.log("PDF has no pages");
      return null;
    }
    
    // Create a new document with just the first page
    const newPdfDoc = await PDFDocument.create();
    const [firstPage] = await newPdfDoc.copyPages(pdfDoc, [0]);
    newPdfDoc.addPage(firstPage);
    
    // Convert to base64 - this is the PDF's first page
    const firstPagePdfBytes = await newPdfDoc.saveAsBase64();
    
    // Create a temporary folder
    const tempDir = path.join(os.tmpdir(), `pdf-thumb-${Date.now()}`);
    fs.mkdirSync(tempDir, { recursive: true });
    
    // Save the PDF to a file
    const pdfPath = path.join(tempDir, 'first-page.pdf');
    fs.writeFileSync(pdfPath, Buffer.from(firstPagePdfBytes, 'base64'));
    
    // Convert PDF to image using ImageMagick or Poppler if available
    try {
      // Try pdftoppm (from Poppler) first
      const imagePath = path.join(tempDir, 'thumbnail');
      await execPromise(`pdftoppm -png -singlefile -scale-to 300 "${pdfPath}" "${imagePath}"`);
      
      // Read the generated image
      const files = fs.readdirSync(tempDir);
      const imageFile = files.find(f => f.startsWith('thumbnail') && f.endsWith('.png'));
      
      if (imageFile) {
        const imageBuf = fs.readFileSync(path.join(tempDir, imageFile));
        const base64Image = `data:image/png;base64,${imageBuf.toString('base64')}`;
        
        // Clean up
        try {
          fs.unlinkSync(pdfPath);
          fs.unlinkSync(path.join(tempDir, imageFile));
          fs.rmdirSync(tempDir);
        } catch (e) {
          console.warn("Error cleaning up temp files:", e);
        }
        
        return base64Image;
      }
    } catch (error) {
      console.warn("Could not use external tools to convert PDF, falling back to default:", error);
      
      // If external tools aren't available, return the PDF data as-is
      // The client will need to handle displaying the PDF data
      return `data:application/pdf;base64,${firstPagePdfBytes}`;
    }
    
    return null;
  } catch (error) {
    console.error("Error in PDF thumbnail generation:", error);
    return null;
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
    responseLimit: false,
  },
};