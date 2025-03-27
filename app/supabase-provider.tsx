'use client';

import { createContext, useContext } from 'react';
import { supabase } from '@/app/lib/supabase';
import type { Database } from '@/types/supabase';

// Create context with the centralized Supabase client
const Context = createContext<{ supabase: typeof supabase }>({ supabase });

export default function SupabaseProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Context.Provider value={{ supabase }}>
      {children}
    </Context.Provider>
  );
}

export const useSupabase = () => useContext(Context); 