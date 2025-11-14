"use client";

import { createBrowserClient } from '@supabase/ssr';

/**
 * Creates a public, browser-side Supabase client.
 * This is used in Client Components, primarily for Realtime.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}