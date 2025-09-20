import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';

// Create client for server-side auth verification
const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /backoffice routes
  if (!pathname.startsWith('/backoffice')) {
    return NextResponse.next();
  }

  // Allow login page without authentication
  if (pathname === '/backoffice/login') {
    return NextResponse.next();
  }

  // Check for session token
  const token = request.cookies.get('sb-access-token')?.value;

  if (!token) {
    // No token, redirect to login - route groups don't affect URL structure
    const loginUrl = new URL('/backoffice/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  try {
    // Verify the session with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      // Invalid token, redirect to login
      const loginUrl = new URL('/backoffice/login', request.url);
      const response = NextResponse.redirect(loginUrl);

      // Clear invalid token
      response.cookies.delete('sb-access-token');
      response.cookies.delete('sb-refresh-token');

      return response;
    }

    // Check if user exists in database using simple fetch to our own API
    try {
      const userCheckResponse = await fetch(`${request.nextUrl.origin}/api/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!userCheckResponse.ok) {
        // User not found in database or other error, redirect to login
        const loginUrl = new URL('/backoffice/login', request.url);
        const response = NextResponse.redirect(loginUrl);

        // Clear tokens for missing users
        response.cookies.delete('sb-access-token');
        response.cookies.delete('sb-refresh-token');

        return response;
      }
    } catch (dbCheckError) {
      console.error('Database user check failed:', dbCheckError);
      // On error, allow through but log it
    }

    // Valid session with existing user, add user info to headers for API routes
    const response = NextResponse.next();
    response.headers.set('x-user-id', user.id);
    response.headers.set('x-user-email', user.email || '');

    return response;

  } catch (error) {
    console.error('Middleware auth error:', error);

    // On error, redirect to login
    const loginUrl = new URL('/backoffice/login', request.url);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes that handle their own auth)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};