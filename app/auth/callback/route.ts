import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { isStaticExport } from '@/app/lib/staticData';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');
  
  // Log any errors that come from the OAuth provider
  if (error) {
    console.error(`Auth callback error: ${error}`, errorDescription);
    // Redirect to login page with error
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error || 'unknown_error')}`, requestUrl.origin));
  }
  
  // In static export mode, just redirect to samples
  if (isStaticExport()) {
    console.log('Static export mode detected - skipping auth code exchange');
    return NextResponse.redirect(new URL('/samples', requestUrl.origin));
  }
  
  if (code) {
    try {
      // Create a supabase client
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      
      const supabase = createClient(supabaseUrl, supabaseKey, {
        auth: {
          flowType: 'pkce',
          autoRefreshToken: false,
          detectSessionInUrl: false,
          persistSession: false
        }
      });
      
      // Exchange the code for a session
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        console.error('Error exchanging auth code for session:', error);
        // Redirect to login page with error
        return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error.message || 'session_error')}`, requestUrl.origin));
      }
      
      // Success! Redirect to samples page
      console.log('Successfully exchanged auth code for session');
      return NextResponse.redirect(new URL('/samples', requestUrl.origin));
    } catch (error) {
      console.error('Error in auth callback:', error);
      // Redirect to login page with generic error
      return NextResponse.redirect(new URL('/login?error=unexpected_error', requestUrl.origin));
    }
  }

  // No code provided, redirect to samples page
  return NextResponse.redirect(new URL('/samples', requestUrl.origin));
}

// Needed for static export to work
// For dynamic deployments, use a Worker/Function to handle this route
export const dynamic = 'force-static';
