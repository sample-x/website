import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { isStaticExport } from '@/app/lib/staticData';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  
  // In static export mode, just redirect to samples
  if (isStaticExport()) {
    console.log('Static export mode detected - skipping auth code exchange');
    return NextResponse.redirect(new URL('/samples', request.url));
  }
  
  if (code) {
    // Create a supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const cookieStore = cookies();
    
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        flowType: 'pkce',
        autoRefreshToken: false,
        detectSessionInUrl: false,
        persistSession: false
      }
    });
    
    try {
      // Exchange the code for a session
      await supabase.auth.exchangeCodeForSession(code);
    } catch (error) {
      console.error('Error exchanging auth code for session:', error);
      // Still redirect to samples page even on error
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(new URL('/samples', request.url));
}

// Needed for static export to work
// For dynamic deployments, use a Worker/Function to handle this route
export const dynamic = 'force-static';
