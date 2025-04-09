import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// Safer URL validation function
function isValidUrl(url: string): boolean {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
}

// Get environment variables with validation
const getSupabaseUrl = (): string => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) {
      console.error('[SupabaseClient] Error: NEXT_PUBLIC_SUPABASE_URL is not defined.');
      // Potentially throw or return a default/dummy URL if safe
      return ''; 
  }
  if (!isValidUrl(url)) {
      console.error(`[SupabaseClient] Error: Invalid NEXT_PUBLIC_SUPABASE_URL: ${url}`);
      return '';
  }
  console.log(`[SupabaseClient] Using Supabase URL: ${url.substring(0, 15)}...`);
  return url;
};

const getSupabaseKey = (): string => {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key) {
      console.error('[SupabaseClient] Error: NEXT_PUBLIC_SUPABASE_ANON_KEY is not defined.');
      return '';
  }
  console.log(`[SupabaseClient] Using Supabase Anon Key: Present (length ${key.length})`);
  return key;
};

// Keep track of the client instance
let supabaseInstance: SupabaseClient<Database> | null = null;

// Function to create or get the Supabase client
export const createSafeClient = (): SupabaseClient<Database> => {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  const supabaseUrl = getSupabaseUrl();
  const supabaseKey = getSupabaseKey();

  if (!supabaseUrl || !supabaseKey) {
    console.error('[SupabaseClient] Cannot create Supabase client: URL or Key is missing/invalid.');
    // Return a non-functional dummy client or throw an error
    // depending on how you want to handle this critical failure.
    // Throwing an error might be better to halt execution clearly.
    throw new Error('Supabase URL or Key is missing or invalid. Check environment variables.');
  }

  console.log('[SupabaseClient] Creating new Supabase client instance...');
  try {
    supabaseInstance = createClient<Database>(
        supabaseUrl,
        supabaseKey,
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
      console.log('[SupabaseClient] Supabase client created successfully.');
      
      // Optional: Test connection immediately after creation
      supabaseInstance.auth.getSession()
        .then(({ error }) => {
            if (error) console.error('[SupabaseClient] Post-creation connection test failed:', error.message);
            else console.log('[SupabaseClient] Post-creation connection test successful.');
        });

      return supabaseInstance;
  } catch (error) {
    console.error('[SupabaseClient] CRITICAL ERROR during createClient call:', error);
    // Rethrow or handle critical failure
    throw new Error('Failed to initialize Supabase client.');
  }
};

// Export the singleton instance obtained via the safe creator function
export const supabase = createSafeClient();
