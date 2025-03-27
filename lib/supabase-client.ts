import { createClient } from '@supabase/supabase-js';

// Safer URL validation function
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
}

// Get environment variables with validation
const getSupabaseUrl = (): string => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  
  // In static build with an invalid URL, return a safe fallback
  if (process.env.NODE_ENV === 'production' && !isValidUrl(url)) {
    console.warn('Invalid Supabase URL provided. Using fallback URL for static build.');
    return 'https://example.com'; // Safe fallback URL for static build
  }
  
  return url;
};

const getSupabaseKey = (): string => {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
};

// Create a safer client that won't throw in static builds
export const createSafeClient = () => {
  try {
    return createClient(
      getSupabaseUrl(),
      getSupabaseKey(),
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
        global: {
          headers: {
            'x-application-name': 'samplex',
          },
        },
      }
    );
  } catch (error) {
    console.error('Error creating Supabase client:', error);
    
    // Return a dummy client for static builds
    // This avoids crashes but still allows the app to render
    return {
      from: () => ({
        select: () => ({
          order: () => ({ data: [], error: null }),
          eq: () => ({ data: [], error: null }),
          single: () => ({ data: null, error: null }),
          limit: () => ({ data: [], error: null }),
          count: () => ({ data: { count: 0 }, error: null }),
        }),
      }),
      auth: {
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: null, error: null }),
      },
    } as any;
  }
};

// Export a singleton instance
export const supabase = createSafeClient();
