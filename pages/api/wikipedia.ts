// pages/api/wikipedia.ts
import type { NextApiRequest, NextApiResponse } from 'next';

interface WikiResponse {
  summary: string | null;
  fullUrl: string | null;
  error?: string;
}

// Helper function to extract the second paragraph (simple implementation)
function extractSecondParagraph(text: string): string | null {
  if (!text) return null;
  // Split by double newlines, which often separate paragraphs in MediaWiki plain text extracts
  const paragraphs = text.split('\n\n').map(p => p.trim()).filter(Boolean);
  // Return the second paragraph if it exists, otherwise fallback to the first or null
  return paragraphs.length > 1 ? paragraphs[1] : (paragraphs.length > 0 ? paragraphs[0] : null);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<WikiResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ summary: null, fullUrl: null, error: 'Method Not Allowed' });
  }

  const { title, type } = req.query; // Get params from query string

  if (!title || typeof title !== 'string') {
    return res.status(400).json({ summary: null, fullUrl: null, error: 'Missing or invalid title parameter' });
  }

  const encodedTitle = encodeURIComponent(title.replace(/ /g, '_')); // Ensure spaces are underscores for wiki URLs
  const WIKIPEDIA_API_ENDPOINT = "https://en.wikipedia.org/w/api.php";
  const WIKIPEDIA_REST_API_ENDPOINT = "https://en.wikipedia.org/api/rest_v1/page/summary/";
  const USER_AGENT = "SourceLensApp/1.0 (sourcelens@example.com)"; // Replace with actual contact if needed

  console.log(`[API /wikipedia] Fetching data for title: "${title}", type: "${type}"`);

  try {
    let summary: string | null = null;
    let fullUrl: string | null = `https://en.wikipedia.org/wiki/${encodedTitle}`; // Default URL

    if (type === 'date') {
      console.log(`[API /wikipedia] Fetching full text for date: ${title}`);
      // For dates, fetch full plain text content to extract the second paragraph
      const params = new URLSearchParams({
        action: 'query',
        format: 'json',
        titles: title,
        prop: 'extracts',
        exlimit: '1',
        explaintext: 'true', // Get plain text
        exsectionformat: 'plain', // No special section formatting
        origin: '*', // Necessary for CORS from server-side? Check if needed. Usually not from server.
      });
      const url = `${WIKIPEDIA_API_ENDPOINT}?${params.toString()}`;

      const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
      if (!response.ok) throw new Error(`Wikipedia API error (query): ${response.statusText}`);

      const data = await response.json();
      const pages = data.query?.pages;
      const pageId = pages ? Object.keys(pages)[0] : null;

      if (pageId && pages[pageId] && !pages[pageId].missing) {
        const fullExtract = pages[pageId].extract;
        summary = extractSecondParagraph(fullExtract); // Get the second paragraph
        if (!summary) { // Fallback if second paragraph extraction fails
          console.warn(`[API /wikipedia] Could not extract second paragraph for "${title}", falling back to first.`);
          summary = fullExtract?.split('\n\n')[0]?.trim() || null;
        }
        console.log(`[API /wikipedia] Extracted summary (date): "${summary?.substring(0, 100)}..."`);
      } else {
          console.warn(`[API /wikipedia] No content found for date: ${title}`);
          summary = `No specific Wikipedia entry found for the exact date ${title}. General information may be available for the year.`;
      }

    } else { // Default behavior for 'author' or 'general'
      console.log(`[API /wikipedia] Fetching summary for: ${title}`);
      // Use the REST API for summaries (usually contains the intro paragraph)
      const url = `${WIKIPEDIA_REST_API_ENDPOINT}${encodedTitle}`;
      const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });

      if (!response.ok) {
         // Handle cases where the REST API might 404 even if a page exists (e.g., redirects)
         if (response.status === 404) {
            console.warn(`[API /wikipedia] Summary endpoint 404 for "${title}", page might still exist.`);
            summary = `Could not fetch summary automatically.`; // Keep URL link
         } else {
            throw new Error(`Wikipedia REST API error: ${response.statusText}`);
         }
      } else {
          const data = await response.json();
          summary = data.extract || null;
          fullUrl = data.content_urls?.desktop?.page || fullUrl; // Update URL if available
          console.log(`[API /wikipedia] Extracted summary (author/general): "${summary?.substring(0, 100)}..."`);
      }
    }

    // Return successful response
    res.status(200).json({ summary, fullUrl });

  } catch (error) {
    console.error(`[API /wikipedia] Error fetching data for "${title}":`, error);
    res.status(500).json({
      summary: null,
      fullUrl: `https://en.wikipedia.org/wiki/${encodedTitle}`, // Still provide a link
      error: error instanceof Error ? error.message : 'Failed to fetch Wikipedia content'
    });
  }
}