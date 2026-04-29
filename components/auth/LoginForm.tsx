'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from '@/lib/actions/auth';

export function LoginForm({ redirectTo }: { redirectTo: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    start(async () => {
      const res = await signIn(fd);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.push(redirectTo);
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-xl bg-bg-surface border border-border-subtle p-6">
      <label className="block">
        <span className="text-xs label-mono text-text-muted">Email</span>
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          className="mt-1 block w-full rounded-lg bg-bg-elevated border border-border-subtle px-3 py-2 text-text-primary focus:border-border-interactive focus:outline-none"
        />
      </label>

      <label className="block">
        <span className="text-xs label-mono text-text-muted">Password</span>
        <input
          type="password"
          name="password"
          required
          autoComplete="current-password"
          className="mt-1 block w-full rounded-lg bg-bg-elevated border border-border-subtle px-3 py-2 text-text-primary focus:border-border-interactive focus:outline-none"
        />
      </label>

      {error && (
        <p className="text-sm text-accent-amber" role="alert">{error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-accent-blue px-4 py-3 font-sans font-medium text-bg-base hover:bg-accent-blue/90 transition-colors disabled:opacity-50"
      >
        {pending ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}
