import { NextRequest, NextResponse } from 'next/server';

/**
 * Middleware for Next.js
 * This runs on every request before it reaches the route handler
 */
export function middleware(request: NextRequest) {
  // You can add custom logic here:
  // - Authentication checks
  // - Request logging
  // - Rate limiting
  // - Geographic routing
  // - etc.

  const response = NextResponse.next();

  // Add custom headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response;
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - _document, _error, _app (Next.js internal pages)
     */
    '/((?!_next/static|_next/image|favicon.ico|_document|_error|_app).*)',
  ],
};
