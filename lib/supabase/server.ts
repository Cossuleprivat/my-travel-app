import 'server-only';
import { createClient } from '@supabase/supabase-js';

// Single-user mode: RLS is disabled on all user tables, so the anon key is
// sufficient. URL and key are hardcoded as fallbacks so no Vercel env vars
// are required for the app to function.
const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://vfxcozgkupzzqhgozyqo.supabase.co';
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmeGNvemdrdXB6enFoZ296eXFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3OTQ4MzgsImV4cCI6MjA4MzM3MDgzOH0.-bAEmp2Du2cjFcd_2hnlSkGFyF3Ky9RUZZHN4yN4_Tk';

export function createServiceClient() {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
