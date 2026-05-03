'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createCookieClient } from '@/lib/supabase/cookie-client';
import { ensureUserProfile } from '@/lib/data/queries';

export type AuthResult = { ok: true } | { ok: false; error: string };

export async function signIn(formData: FormData): Promise<AuthResult> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');
  if (!email || !password) return { ok: false, error: 'Email and password are required.' };

  const sb = await createCookieClient();
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, error: error.message };
  if (!data.user) return { ok: false, error: 'Login failed.' };

  await ensureUserProfile(data.user.id);
  revalidatePath('/', 'layout');
  return { ok: true };
}

export async function signUp(formData: FormData): Promise<AuthResult> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');
  const displayName = String(formData.get('displayName') ?? '').trim();
  if (!email || !password) return { ok: false, error: 'Email and password are required.' };
  if (password.length < 6) return { ok: false, error: 'Password must be at least 6 characters.' };

  const sb = await createCookieClient();
  const { data, error } = await sb.auth.signUp({
    email,
    password,
    options: { data: { display_name: displayName || null } },
  });
  if (error) return { ok: false, error: error.message };
  if (!data.user) return { ok: false, error: 'Sign-up failed.' };

  // Best-effort profile bootstrap — wrapped because Supabase returns a fake user
  // object for duplicate emails (enumeration protection). That fake ID won't exist
  // in auth.users, producing a 23503 FK violation we can safely ignore.
  try {
    await ensureUserProfile(data.user.id);
    if (displayName) {
      const { createServiceClient } = await import('@/lib/supabase/server');
      const admin = createServiceClient();
      await admin.from('user_profiles').update({ display_name: displayName }).eq('id', data.user.id);
    }
  } catch (e) {
    if ((e as { code?: string })?.code !== '23503') throw e;
  }
  revalidatePath('/', 'layout');
  return { ok: true };
}

export async function signOut() {
  const sb = await createCookieClient();
  await sb.auth.signOut();
  redirect('/auth/login');
}
