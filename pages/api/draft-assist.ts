// pages/api/draft-assist.ts
import type { NextApiRequest, NextApiResponse } from 'next';
// Use createPagesServerClient for API routes for better session handling
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Configure Google client
const googleAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Use createPagesServerClient for API routes
const supabase = createPagesServerClient({ req, res });

  // Get session robustly
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  if (sessionError) {
      console.error("Session Error:", sessionError.message);
      return res.status(401).json({ message: 'Unauthorized: Session error' });
  }
  if (!session) {
      return res.status(401).json({ message: 'Unauthorized: No active session' });
  }
  const userId = session.user.id; // Get user ID reliably

  try {
    const {
      action,
      highlightedText,
      highlightStart, // Note: these indices might not be directly useful without full context handling
      highlightEnd,   // Note: these indices might not be directly useful without full context handling
      draftId,
      draftTitle,     // Title from request body (might be slightly stale)
      draftSections,  // Sections from request body (might be slightly stale)
      sourceId,
      analyticFramework,
      sectionId,      // ID of the specific section where highlight occurred (optional)
      feedback,
      modelId = 'gemini-flash-lite'
    } = req.body;

    // Validate required parameters
    if (!action || !highlightedText || !draftId || typeof draftId !== 'string') {
      console.error("Validation Error: Missing required parameters", { action, highlightedText, draftId });
      return res.status(400).json({ message: 'Missing required parameters (action, highlightedText, draftId)' });
    }
    if (action === 'relate' && (!sourceId || typeof sourceId !== 'string')) {
       console.error("Validation Error: Missing sourceId for 'relate' action", { sourceId });
       return res.status(400).json({ message: "Missing sourceId for 'relate' action" });
    }


    // --- Fetch Source Data (if needed) ---
    let sourceContent = '';
    let sourceMetadata = {};
    if (action === 'relate' && sourceId) {
      console.log(`Fetching source with ID: ${sourceId} for user: ${userId}`);
      const { data: sourceData, error: sourceError } = await supabase
        .from('sources') // Use unquoted table name (client handles mapping if needed)
        .select('content, metadata')
        .eq('id', sourceId)
        // --- FIX: Use quoted "userId" ---
        .eq('"userId"', userId) // Ensure RLS can match using the correct column name
        .single(); // Use single to expect one row or null

      if (sourceError) {
        // Log specific Supabase error
        console.error(`Error fetching source (ID: ${sourceId}):`, sourceError);
        // Check for common RLS failure or not found
        if (sourceError.code === 'PGRST116') { // PGRST116: "Searched for a single row but found 0 rows" indicates not found or RLS block
             return res.status(404).json({ message: `Source not found or access denied (ID: ${sourceId})` });
        }
        return res.status(500).json({ message: `Database error fetching source: ${sourceError.message}` });
      }
      if (!sourceData) {
         return res.status(404).json({ message: `Source not found (ID: ${sourceId})` });
      }

      sourceContent = sourceData.content;
      sourceMetadata = sourceData.metadata || {}; // Default to empty object if metadata is null
      console.log(`Source fetched successfully: ${sourceId}`);
    }

    // --- Fetch Draft Data ---
    console.log(`Fetching draft with ID: ${draftId} for user: ${userId}`);
    const { data: draftData, error: draftError } = await supabase
      .from('drafts') // Use unquoted table name
      .select('content, title, sections') // Select needed fields
      .eq('id', draftId)
      // --- FIX: Use quoted "userId" ---
      .eq('"userId"', userId) // Ensure RLS match
      .single();

    if (draftError) {
      console.error(`Error fetching draft (ID: ${draftId}):`, draftError);
       if (draftError.code === 'PGRST116') {
           return res.status(404).json({ message: `Draft not found or access denied (ID: ${draftId})` });
       }
      return res.status(500).json({ message: `Database error fetching draft: ${draftError.message}` });
    }
     if (!draftData) {
         return res.status(404).json({ message: `Draft not found (ID: ${draftId})` });
     }
     console.log(`Draft fetched successfully: ${draftData.title}`);


    // --- Prepare Context for LLM ---

    // Use fetched draft data for consistency
    const currentDraftTitle = draftData.title || draftTitle || 'Untitled Draft'; // Prefer fetched title
    const currentDraftContent = draftData.content;
    const currentDraftSections = draftData.sections || []; // Use fetched sections

    // Truncate full draft content if too long for the prompt context
    const maxDraftContextLength = 10000; // Adjust as needed
    const draftContextForPrompt = currentDraftContent.length > maxDraftContextLength
      ? currentDraftContent.substring(0, maxDraftContextLength) + "\n...[draft truncated]"
      : currentDraftContent;

    // Get section context (summary primarily) - Less critical now we send full draft (truncated)
    const sectionSummariesContext = Array.isArray(currentDraftSections) && currentDraftSections.length > 0
      ? currentDraftSections.map((s: any) => `- ${s.title || s.id}: ${s.summary || '[No Summary]'}`).join('\n')
      : 'No section data available';

    // --- Construct Prompt based on Action ---
    let promptText = ''; // Initialize prompt text

    // Common Preamble
    const preamble = `You are DraftAssistant, an AI assistant specializing in academic writing and analysis. You will be given context from a user's draft and potentially a source document. 
Always begin your response with an opinionated, VERY succinct, interesting, one SHORT sentence summary of what you did in a given response; if it was challenging or there was a potential issue to flag, note that. Be critical and skeptical.`;

    if (action === 'relate') {
        promptText = `${preamble}

SOURCE METADATA:
${JSON.stringify(sourceMetadata, null, 2)}

SOURCE CONTENT (Truncated if long):
${sourceContent.substring(0, 5000)} ${sourceContent.length > 5000 ? "\n...[truncated]" : ""}

DRAFT TITLE: ${currentDraftTitle}

FULL DRAFT CONTEXT (Truncated if long):
${draftContextForPrompt}

HIGHLIGHTED TEXT FROM DRAFT:
>>> ${highlightedText} <<<

${analyticFramework ? `USER'S ANALYTIC FRAMEWORK:\n${analyticFramework}\n` : ''}
${feedback ? `PREVIOUS RESPONSE FEEDBACK:\n${feedback}\n` : ''}

TASK:
Based ONLY on the HIGHLIGHTED text snippet within the context of the FULL DRAFT and the provided SOURCE document, suggest THREE distinct and insightful ways the draft author could connect the highlighted idea to the source material. Focus on strengthening the draft's argument or analysis. Each suggestion should be 3-5 sentences long and explain the value of the connection.

RESPONSE FORMAT:
Provide exactly three suggestions, numbered 1-3. Always begin with a single sentence, numbered 0, summing up your experience of doing this or giving a barbed or otherwise opinionated general observation - don't be nice. Be super blunt and honest.`;
    } else if (action === 'critique') {
        promptText = `${preamble}

DRAFT TITLE: ${currentDraftTitle}

FULL DRAFT CONTEXT (Truncated if long):
${draftContextForPrompt}

HIGHLIGHTED TEXT FROM DRAFT TO CRITIQUE:
>>> ${highlightedText} <<<

${feedback ? `PREVIOUS RESPONSE FEEDBACK:\n${feedback}\n` : ''}

TASK:
Provide THREE distinct, constructive critiques of the HIGHLIGHTED text snippet, considering its place within the FULL DRAFT context. Focus on aspects like clarity, argumentation, evidence use, or structure from a scholarly perspective. Each critique should be 3-4 sentences long and offer specific points for improvement.

RESPONSE FORMAT:
Provide exactly three critiques, numbered 1-3. Always begin with a single sentence, numbered 0, summing up your experience of doing this or giving a barbed or otherwise opinionated general observation - don't be nice. Be super blunt, but don't be mean - just honest. `;
    } else if (action === 'segue') {
         promptText = `${preamble}

DRAFT TITLE: ${currentDraftTitle}

FULL DRAFT CONTEXT (Truncated if long):
${draftContextForPrompt}

HIGHLIGHTED TEXT FROM DRAFT (Transition needed around here):
>>> ${highlightedText} <<<

${feedback ? `PREVIOUS RESPONSE FEEDBACK:\n${feedback}\n` : ''}

TASK:
Generate FIVE effective transition passags (segues) of anywhere between a single pithy phrase to up to three sentences that could logically follow or incorporate the HIGHLIGHTED text, ensuring smooth flow within the FULL DRAFT context. Vary the transition types (e.g., contrast, cause/effect, elaboration).

RESPONSE FORMAT:
Provide exactly five segue options, numbered 1-5. Always begin with a single sentence, numbered 0, summing up your experience of doing this or giving your general opinion. Be super blunt, not nice. Don't be mean, just honest and critical.`;
    } else {
      return res.status(400).json({ message: 'Invalid action specified' });
    }

    // --- Call LLM ---
    console.log(`Calling Gemini model (${modelId}) for action: ${action}`);
    const model = googleAI.getGenerativeModel({ model: modelId });
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: promptText }] }],
      generationConfig: {
        temperature: action === 'segue' ? 0.5 : 0.7, // Slightly lower temp for segues maybe
        maxOutputTokens: 5500, // Adjust based on expected response length
      },
    });

    const responseText = result.response.text();
    console.log(`LLM Response received (length: ${responseText.length})`);

    // --- Parse LLM Response ---
    let suggestions: string[] = [];
    const lines = responseText.split('\n').map(l => l.trim()).filter(l => l.length > 0);

    // Simple parsing based on numbering
    lines.forEach(line => {
        // Match lines starting with a number, period, optional space
        if (line.match(/^\d+[\.\)]\s*/)) {
            suggestions.push(line.replace(/^\d+[\.\)]\s*/, '').trim());
        }
        // Sometimes the model might just list things without numbers
        else if (suggestions.length > 0 || lines.length <= (action === 'segue' ? 6 : 4)) {
             // Add lines if we've already started finding numbered suggestions
             // OR if the total response is short (likely just the list)
             suggestions.push(line);
        }
    });

    // If numbered parsing failed, try splitting by double newline as fallback
     if (suggestions.length < (action === 'segue' ? 5 : 3)) {
         console.log("Numbered parsing yielded few results, trying double newline split.");
         suggestions = responseText.split('\n\n')
             .map(s => s.trim())
             .filter(s => s.length > 10); // Filter very short lines
     }

     // Ensure correct number of suggestions
     const expectedCount = action === 'segue' ? 5 : 3;
     while (suggestions.length < expectedCount) {
         suggestions.push("Suggestion not generated.");
     }
     suggestions = suggestions.slice(0, expectedCount);


    console.log(`Parsed ${suggestions.length} suggestions for action: ${action}`);

    return res.status(200).json({
      suggestions,
      action, // Echo back action type
      // Include other relevant data if needed by frontend
    });

  } catch (error) {
    console.error('Draft assist API error:', error);
    // Check if it's a specific type of error, e.g., from the LLM API
    if (error instanceof Error) {
        // You might check error.name or specific properties if the LLM client provides them
        return res.status(500).json({
            message: `Error processing request: ${error.message}`,
            error: error.stack // Provide stack in dev maybe
        });
    }
    return res.status(500).json({
      message: 'Unknown error processing request',
      error: String(error)
    });
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '4mb', // Allow adequate size for potential context
    },
  },
};