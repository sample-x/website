'use client';

import { createContext } from 'react';
import { createClientComponentClient, SupabaseClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';

export const SupabaseContext = createContext<SupabaseClient<Database> | null>(null);

export function Providers({ children }: { children: React.ReactNode }) {
  const supabase = createClientComponentClient<Database>();

  return (
    <SupabaseContext.Provider value={supabase}>
      {children}
    </SupabaseContext.Provider>
  );
} 