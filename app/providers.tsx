'use client';

import { createContext } from 'react';
import { createClientComponentClient, SupabaseClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';
import { AuthProvider } from './auth/AuthProvider';
import SupabaseProvider from './supabase-provider';

export const SupabaseContext = createContext<SupabaseClient<Database> | null>(null);

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SupabaseProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </SupabaseProvider>
  );
} 