import 'server-only';

// Single-user mode: no login required.
// All data is stored under this Supabase user ID.
const OWNER_USER_ID = 'acabfbe0-79cf-43e6-903b-b96834eb0a05';

export async function requireUserId(): Promise<string> {
  return OWNER_USER_ID;
}

export async function getOptionalUserId(): Promise<string | null> {
  return OWNER_USER_ID;
}
