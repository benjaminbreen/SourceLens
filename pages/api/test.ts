// pages/api/test.ts
// Simple test endpoint to verify API routing is working

import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("Test API route called", new Date().toISOString());
  
  // Return a simple success response
  return res.status(200).json({ 
    success: true, 
    message: 'API routing is working correctly',
    method: req.method,
    timestamp: new Date().toISOString()
  });
}