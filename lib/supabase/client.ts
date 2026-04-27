import { createClient } from '@supabase/supabase-js';

// Anon-key client. Safe to import from client components; subject to RLS.
const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const rawAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!rawUrl || !rawAnonKey) {
  throw new Error(
    'NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is not set in .env.local',
  );
}
const url: string = rawUrl;
const anonKey: string = rawAnonKey;

export function createBrowserClient() {
  return createClient(url, anonKey, {
    auth: { persistSession: false },
  });
}
