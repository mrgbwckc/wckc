import { createClient } from '@supabase/supabase-js';
import { auth, getAuth } from '@clerk/nextjs/server';
import { cookies } from 'next/headers';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Creates a Supabase client authenticated on behalf of the
 * currently logged-in Clerk user.
 */
export async function createServerClient() {
  const { getToken } = await auth();


  // The template name must match the one you created in Clerk.
  const supabaseToken = await getToken({ template: 'supabase' });

  if (!supabaseToken) {
    throw new Error('Supabase token not found. Check Clerk JWT template.');
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: {
        Authorization: `Bearer ${supabaseToken}`,
      },
    },
  });

  return supabase;
}