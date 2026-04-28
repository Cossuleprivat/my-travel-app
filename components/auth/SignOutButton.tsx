'use client';

import { useTransition } from 'react';
import { signOut } from '@/lib/actions/auth';

export function SignOutButton() {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => start(async () => { await signOut(); })}
      className="w-full rounded-lg border border-border-interactive bg-bg-elevated px-4 py-2 text-sm font-sans text-text-primary hover:bg-bg-surface transition-colors disabled:opacity-50"
    >
      {pending ? 'Signing out…' : 'Sign out'}
    </button>
  );
}
