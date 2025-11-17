"use client";

import React, { ReactNode, createContext, useEffect, useState } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { useAuth } from '@clerk/nextjs';

/**
 * Context for Supabase client
 */
export const SupabaseContext = createContext<SupabaseClient | null>(null);

/**
 * SupabaseProvider component that wraps your application
 * Initializes the authenticated Supabase client and provides it via context
 * 
 * Usage in layout.tsx:
 * <SupabaseProvider>
 *   <YourApp />
 * </SupabaseProvider>
 */
export function SupabaseProvider({ children }: { children: ReactNode }) {
  const { getToken } = useAuth();
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);

  useEffect(() => {
    const initializeSupabase = async () => {
      try {
        const supabaseToken = await getToken({ template: 'supabase' });

        if (!supabaseToken) {
          throw new Error('Supabase token not found. Ensure Clerk JWT template is configured.');
        }

        const client = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          {
            global: {
              headers: {
                Authorization: `Bearer ${supabaseToken}`,
              },
            },
          }
        );

        setSupabase(client);
      } catch (error) {
        console.error('Failed to initialize Supabase client:', error);
        setSupabase(null);
      }
    };

    initializeSupabase();
  }, [getToken]);

  return (
    <SupabaseContext.Provider value={supabase}>
      {children}
    </SupabaseContext.Provider>
  );
}
