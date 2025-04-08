// Cloudflare Pages Function for handling OAuth callbacks in static deployment
export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  
  if (code) {
    try {
      // Create URL for Supabase auth.exchangeCodeForSession
      const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || 'https://znmkkduvzzmoxzgthwby.supabase.co';
      const endpoint = `${supabaseUrl}/auth/v1/token?grant_type=authorization_code&code=${code}`;
      
      // Make the request to Supabase
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpubWtrZHV2enptb3h6Z3Rod2J5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3NDI2MzksImV4cCI6MjA1ODMxODYzOX0.YObW_QOjuEuvjGxi97JAIRbUWwsZ1gTSCebzNkMVqYk',
        },
      });
      
      if (!response.ok) {
        console.error('Error exchanging code:', await response.text());
      } else {
        const result = await response.json();
        console.log('Successfully exchanged auth code for session');
      }
    } catch (error) {
      console.error('Error in auth callback:', error);
    }
  }
  
  // Always redirect to samples regardless of outcome
  return Response.redirect(new URL('/samples', request.url).toString(), 302);
} 