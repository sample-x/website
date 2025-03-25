import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Simple middleware that just passes through all requests
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Only run middleware on specific routes
    '/api/:path*',
    '/profile/:path*',
    '/dashboard/:path*',
    '/upload/:path*',
  ],
}; 