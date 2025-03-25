import { NextResponse } from 'next/server'

// This is a static version of the auth callback route
export function GET() {
  // In a static export, we'll handle the auth callback on the client side
  // This is just a placeholder that will be replaced by client-side code
  return NextResponse.redirect(new URL('/profile', 'https://sample.exchange'))
}

// Force static generation
export const dynamic = 'force-static'
