// Cloudflare Pages Function for handling OAuth callbacks in static deployment
export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');
  const errorDescription = url.searchParams.get('error_description');
  
  // Log any errors from OAuth provider
  if (error) {
    console.error(`OAuth Error: ${error}`, errorDescription);
    return Response.redirect(new URL(`/login?error=${encodeURIComponent(error)}`, url.origin).toString(), 302);
  }
  
  // Handle Google OAuth callback
  if (code) {
    try {
      // Get Supabase credentials from environment variables
      const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || 'https://znmkkduvzzmoxzgthwby.supabase.co';
      const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpubWtrZHV2enptb3h6Z3Rod2J5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3NDI2MzksImV4cCI6MjA1ODMxODYzOX0.YObW_QOjuEuvjGxi97JAIRbUWwsZ1gTSCebzNkMVqYk';
      
      // First, construct the token endpoint
      const tokenEndpoint = `${supabaseUrl}/auth/v1/token?grant_type=authorization_code&code=${code}`;
      
      // Make the API request to Supabase to exchange the code for a session
      console.log('Exchanging auth code for session...');
      const response = await fetch(tokenEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error exchanging code:', errorText);
        return Response.redirect(new URL('/login?error=auth_exchange_failed', url.origin).toString(), 302);
      }
      
      // Get the session data
      const result = await response.json();
      console.log('Auth code exchange successful');
      
      // Create response with cookies
      const redirectUrl = new URL('/samples', url.origin);
      
      // Create the response with redirect
      const redirectResponse = Response.redirect(redirectUrl.toString(), 302);
      
      // Set cookies from the session data if available
      if (result.session) {
        const cookieOptions = 'Path=/; Secure; SameSite=Lax; Max-Age=28800';
        redirectResponse.headers.append('Set-Cookie', `sb-access-token=${result.session.access_token}; ${cookieOptions}`);
        redirectResponse.headers.append('Set-Cookie', `sb-refresh-token=${result.session.refresh_token}; ${cookieOptions}`);
      }
      
      return redirectResponse;
    } catch (error) {
      console.error('Error in auth callback:', error);
      return Response.redirect(new URL('/login?error=unexpected_error', url.origin).toString(), 302);
    }
  }
  
  // If we got here, no valid code was provided
  return Response.redirect(new URL('/login?error=no_code', url.origin).toString(), 302);
} 