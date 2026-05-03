'use client';

import { useTransition } from 'react';
import { signOut } from '@/lib/actions/auth';

export function SignOutButton({ compact = false }: { compact?: boolean }) {
  const [pending, start] = useTransition();
  const handleClick = () => start(async () => { await signOut(); });

  if (compact) {
    return (
      <button
        type="button"
        disabled={pending}
        onClick={handleClick}
        className="text-xs label-mono text-text-muted hover:text-accent-amber transition-colors disabled:opacity-50"
      >
        {pending ? '…' : 'Sign out'}
      </button>
    );
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={handleClick}
      className="w-full rounded-lg border border-border-interactive bg-bg-elevated px-4 py-2 text-sm font-sans text-text-primary hover:bg-bg-surface transition-colors disabled:opacity-50"
    >
      {pending ? 'Signing out…' : 'Sign out'}
    </button>
  );
}
