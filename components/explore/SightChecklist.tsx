'use client';

import { useTransition, useState } from 'react';
import { toggleSightCompleted } from '@/lib/actions/visits';

type SightItem = { id: string; title: string; description: string | null; completed: boolean };

export function SightChecklist({ items }: { items: SightItem[] }) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-text-muted py-3">
        No sights cached for this city yet — they appear here on first visit.
      </p>
    );
  }
  return (
    <ul className="flex flex-col gap-2">
      {items.map((s) => <SightRow key={s.id} sight={s} />)}
    </ul>
  );
}

function SightRow({ sight }: { sight: SightItem }) {
  const [done, setDone] = useState(sight.completed);
  const [pending, start] = useTransition();
  return (
    <li>
      <button
        type="button"
        disabled={pending}
        onClick={() => start(async () => {
          setDone((x) => !x);
          await toggleSightCompleted(sight.id);
        })}
        className={[
          'w-full flex items-center gap-3 rounded-lg border px-3 py-2 text-left transition-colors',
          done
            ? 'bg-accent-purple/10 border-accent-purple/30'
            : 'bg-bg-surface border-border-subtle hover:bg-bg-elevated',
        ].join(' ')}
      >
        <span
          className={[
            'w-5 h-5 rounded border flex items-center justify-center text-xs',
            done ? 'bg-accent-purple border-accent-purple text-bg-base' : 'border-border-interactive',
          ].join(' ')}
          aria-hidden="true"
        >
          {done ? '✓' : ''}
        </span>
        <div className="flex-1 min-w-0">
          <div className={done ? 'text-text-secondary line-through' : 'text-text-primary'}>
            {sight.title}
          </div>
          {sight.description && (
            <div className="text-text-muted text-xs truncate">{sight.description}</div>
          )}
        </div>
        <span className="text-xs label-mono text-accent-purple">+5 XP</span>
      </button>
    </li>
  );
}
