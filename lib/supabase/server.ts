import 'server-only';
import { createClient } from '@supabase/supabase-js';

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const rawServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!rawUrl || !rawServiceRoleKey) {
  throw new Error(
    'NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set in .env.local',
  );
}
const url: string = rawUrl;
const serviceRoleKey: string = rawServiceRoleKey;

// Service-role client — bypasses RLS. Use ONLY in Server Components and
// Server Actions. Never import from a client component.
export function createServiceClient() {
  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
