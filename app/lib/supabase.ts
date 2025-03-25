import { createClient } from '@supabase/supabase-js'

// Use environment variables with fallback values for static builds
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://znmkkduvzzmoxzgthwby.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpubWtrZHV2enptb3h6Z3Rod2J5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3NDI2MzksImV4cCI6MjA1ODMxODYzOX0.YObW_QOjuEuvjGxi97JAIRbUWwsZ1gTSCebzNkMVqYk'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
