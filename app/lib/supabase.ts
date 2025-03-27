import { supabase } from '@/lib/supabase-client';
import { isStaticExport } from './staticData';

// Export connection test function
export async function testSupabaseConnection() {
  // Don't attempt real connection in static mode
  if (isStaticExport()) {
    return { 
      success: false, 
      message: 'Static mode - real Supabase connection not available',
      data: { mode: 'static' } 
    };
  }
  
  try {
    const { data, error } = await supabase.from('samples').select('count', { count: 'exact' }).limit(1);
    
    if (error) throw error;
    
    console.log('Supabase connection successful:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Supabase connection failed:', error);
    return { success: false, error };
  }
}

// Export Supabase client
export { supabase };
