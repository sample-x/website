import { createClient } from '@supabase/supabase-js'

// Use runtime environment variables or fallback to build-time ones
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Check if environment variables are available
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Check your .env.local and Cloudflare Pages environment variables.')
}

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
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
)

// Export a function to test the connection
export async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase.from('samples').select('count', { count: 'exact' }).limit(1)
    if (error) throw error
    console.log('Supabase connection successful:', data)
    return { success: true, data }
  } catch (error) {
    console.error('Supabase connection failed:', error)
    return { success: false, error }
  }
}
