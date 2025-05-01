// middleware.ts
// Next.js middleware for protecting routes that require authentication
// Works with both Pages Router and App Router, and integrates with Supabase auth
// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication
const PROTECTED_ROUTES = [
  '/library',
  '/account',
];

// Routes that need preloaded data
const DATA_PRELOAD_ROUTES = [
  '/analysis',
];

export async function middleware(req: NextRequest) {
  // Create a response object that we'll modify if needed
  const res = NextResponse.next();
  
  // Create a Supabase client with the cookies from the request
  const supabase = createMiddlewareClient({ req, res });
  
  // Check if there is a session
  const { data: { session } } = await supabase.auth.getSession();
  
  // Get the path from the request
  const path = req.nextUrl.pathname;
  
  // Check if the path is protected and there's no session
  const isProtectedRoute = PROTECTED_ROUTES.some(route => 
    path === route || path.startsWith(`${route}/`)
  );
  
  if (isProtectedRoute && !session) {
    // Redirect to login page with the original URL as a redirect parameter
    const redirectUrl = new URL('/login', req.url);
    redirectUrl.searchParams.set('redirect', path);
    return NextResponse.redirect(redirectUrl);
  }
  
  return res;
}

// Run middleware on specific paths - this works for both Pages and App Router
export const config = {
  matcher: [
    '/library/:path*',
    '/account/:path*',
    '/analysis/:path*',
  ],
};