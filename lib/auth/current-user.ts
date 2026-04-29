import 'server-only';
import { createCookieClient } from '@/lib/supabase/cookie-client';

// Returns the authenticated user's id. Throws if no session — pages should
// be guarded by middleware so this is only ever called for logged-in users.
export async function requireUserId(): Promise<string> {
  const sb = await createCookieClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) throw new Error('No authenticated user — middleware should have redirected.');
  return user.id;
}

export async function getOptionalUserId(): Promise<string | null> {
  const sb = await createCookieClient();
  const { data: { user } } = await sb.auth.getUser();
  return user?.id ?? null;
}
