import { createClient } from '@supabase/supabase-js';

// Cloudflare Pages Function format
export default {
  async fetch(request, env, ctx) {
    // CORS headers for cross-origin requests
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json'
    };

    // Handle OPTIONS request (preflight)
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers
      });
    }

    // Only allow GET requests
    if (request.method !== 'GET') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers
      });
    }

    // Basic validation for secrets
    if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
      console.error("[api/get-samples] Supabase URL or Anon Key secret not configured.");
      return new Response(JSON.stringify({ error: 'Server configuration error.' }), {
        status: 500,
        headers
      });
    }

    try {
      console.log("[api/get-samples] Initializing Supabase client...");
      // Initialize Supabase client within the function using secrets
      const supabase = createClient(
        env.SUPABASE_URL, 
        env.SUPABASE_ANON_KEY,
        { auth: { persistSession: false } }
      );

      console.log("[api/get-samples] Fetching public samples...");
      const { data, error } = await supabase
        .from('samples')
        .select('*')
        .eq('status', 'public'); // Only fetch public samples

      if (error) {
        console.error("[api/get-samples] Error fetching samples:", error);
        return new Response(JSON.stringify({ error: 'Failed to fetch samples from database.' }), {
          status: 500,
          headers
        });
      }

      console.log(`[api/get-samples] Successfully fetched ${data?.length ?? 0} samples.`);
      return new Response(JSON.stringify(data || []), {
        status: 200,
        headers
      });

    } catch (e) {
      console.error("[api/get-samples] Unexpected error:", e);
      return new Response(JSON.stringify({ error: 'An unexpected server error occurred.' }), {
        status: 500,
        headers
      });
    }
  }
}; 