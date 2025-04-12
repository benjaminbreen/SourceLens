// pages/api/user-data.ts
// API route for handling user data operations
// Provides endpoints for CRUD operations on user data with server-side authentication

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { NextApiRequest, NextApiResponse } from 'next';
import { cookies } from 'next/headers';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createRouteHandlerClient({ cookies });
  
  // Get the user session
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  try {
    // Handle different HTTP methods
    switch (req.method) {
      case 'GET':
        return await handleGet(req, res, supabase, session);
      case 'POST':
        return await handlePost(req, res, supabase, session);
      case 'DELETE':
        return await handleDelete(req, res, supabase, session);
      case 'PATCH':
        return await handlePatch(req, res, supabase, session);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Server error' });
  }
}

// GET handler
async function handleGet(req: NextApiRequest, res: NextApiResponse, supabase: any, session: any) {
  // Get data type from query params
  const { type, id } = req.query;
  
  if (!type) {
    return res.status(400).json({ error: 'Missing data type parameter' });
  }
  
  // Validate data type
  if (!['references', 'analyses', 'sources', 'drafts'].includes(type as string)) {
    return res.status(400).json({ error: 'Invalid data type' });
  }
  
  // Fetch data based on type
  let query = supabase
    .from(type as string)
    .select('*')
    .eq('userId', session.user.id);
    
  // If ID is provided, get specific item
  if (id) {
    query = query.eq('id', id);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  
  return res.status(200).json({ data });
}

// POST handler
async function handlePost(req: NextApiRequest, res: NextApiResponse, supabase: any, session: any) {
  // Get data type from query params
  const { type } = req.query;
  
  if (!type) {
    return res.status(400).json({ error: 'Missing data type parameter' });
  }
  
  // Validate data type
  if (!['references', 'analyses', 'sources', 'drafts'].includes(type as string)) {
    return res.status(400).json({ error: 'Invalid data type' });
  }
  
  // Add user ID to request body
  const data = {
    ...req.body,
    userId: session.user.id
  };
  
  // Insert into database
  const { data: result, error } = await supabase
    .from(type as string)
    .insert(data)
    .select();
    
  if (error) throw error;
  
  return res.status(200).json({ data: result[0] });
}

// DELETE handler
async function handleDelete(req: NextApiRequest, res: NextApiResponse, supabase: any, session: any) {
  // Get data type and ID from query params
  const { type, id } = req.query;
  
  if (!type || !id) {
    return res.status(400).json({ error: 'Missing parameters' });
  }
  
  // Validate data type
  if (!['references', 'analyses', 'sources', 'drafts'].includes(type as string)) {
    return res.status(400).json({ error: 'Invalid data type' });
  }
  
  // Delete from database
  const { error } = await supabase
    .from(type as string)
    .delete()
    .eq('id', id)
    .eq('userId', session.user.id);
    
  if (error) throw error;
  
  return res.status(200).json({ success: true });
}

// PATCH handler
async function handlePatch(req: NextApiRequest, res: NextApiResponse, supabase: any, session: any) {
  // Get data type and ID from query params
  const { type, id } = req.query;
  
  if (!type || !id) {
    return res.status(400).json({ error: 'Missing parameters' });
  }
  
  // Validate data type
  if (!['references', 'analyses', 'sources', 'drafts'].includes(type as string)) {
    return res.status(400).json({ error: 'Invalid data type' });
  }
  
  // Update in database
  const { data, error } = await supabase
    .from(type as string)
    .update(req.body)
    .eq('id', id)
    .eq('userId', session.user.id)
    .select();
    
  if (error) throw error;
  
  return res.status(200).json({ data: data[0] });
}