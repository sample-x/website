import { createClient } from '@supabase/supabase-js';

// Read environment variables with fallback for build time
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create a conditional client that only initializes with valid credentials
const createSupabaseClient = () => {
  // Check if we're in a build environment without proper env vars
  if (typeof window === 'undefined' && (!supabaseUrl || !supabaseAnonKey)) {
    // Return a mock client during build
    return {
      auth: {
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        signOut: () => Promise.resolve({ error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            single: () => Promise.resolve({ data: null, error: null }),
            data: null,
            error: null
          }),
          data: null,
          error: null
        }),
      }),
    };
  }

  // Create a real client for runtime
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    }
  });
};

export const supabase = createSupabaseClient();
