import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';

// Create client for server-side auth verification
const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Handle admin API routes and protected API endpoints
  const isAdminApi = pathname.startsWith('/api/admin/');
  const isProtectedApi = (pathname.startsWith('/api/services') || pathname.startsWith('/api/packages')) && request.method !== 'GET';

  if (isAdminApi || isProtectedApi) {
    // Allow schema-status and setup endpoints without authentication
    // These are needed for database initialization before login
    if (isAdminApi && (pathname === '/api/admin/schema-status' || pathname === '/api/admin/setup')) {
      return NextResponse.next();
    }

    const token = request.cookies.get('sb-access-token')?.value;
    console.log('Middleware: Admin API request to', pathname, 'method:', request.method, 'has token:', !!token);

    if (!token) {
      console.log('Middleware: No token found for admin API');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    try {
      const { data: { user }, error } = await supabase.auth.getUser(token);

      if (error || !user) {
        console.log('Middleware: Token verification failed:', error?.message);
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
      }

      console.log('Middleware: User verified:', user.id);

      // Add user info to request headers for API routes
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', user.id);
      requestHeaders.set('x-user-email', user.email || '');

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (error: any) {
      console.log('Middleware: Auth error:', error?.message);
      return NextResponse.json({ error: 'Authentication error' }, { status: 401 });
    }
  }

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

    // Valid session with existing user, add user info to request headers for API routes
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', user.id);
    requestHeaders.set('x-user-email', user.email || '');

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

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
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * But DO match /api/admin/* routes for authentication
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};