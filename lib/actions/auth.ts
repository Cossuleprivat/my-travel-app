'use server';

import { redirect } from 'next/navigation';

export type AuthResult = { ok: true } | { ok: false; error: string };

export async function signIn(_formData: FormData): Promise<AuthResult> {
  return { ok: true };
}

export async function signUp(_formData: FormData): Promise<AuthResult> {
  return { ok: true };
}

export async function signOut() {
  redirect('/hub');
}
