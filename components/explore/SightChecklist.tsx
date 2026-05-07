'use client';

import React, { useTransition, useState } from 'react';
import { toggleSightCompleted, toggleSightPlanned } from '@/lib/actions/visits';

type SightStatus = 'none' | 'planned' | 'completed';
type SightItem = {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  planned?: boolean;
};

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
  const initial: SightStatus = sight.completed ? 'completed' : sight.planned ? 'planned' : 'none';
  const [status, setStatus] = useState<SightStatus>(initial);
  const [pendingComplete, startComplete] = useTransition();
  const [pendingPlan, startPlan] = useTransition();
  const pending = pendingComplete || pendingPlan;

  const bgClass =
    status === 'completed' ? 'bg-accent-purple/10 border-accent-purple/30' :
    status === 'planned'   ? 'bg-accent-blue/10 border-accent-blue/30' :
    'bg-bg-surface border-border-subtle hover:bg-bg-elevated';

  const iconClass =
    status === 'completed' ? 'bg-accent-purple border-accent-purple text-bg-base' :
    status === 'planned'   ? 'bg-accent-blue/20 border-accent-blue text-accent-blue' :
    'border-border-interactive';

  const iconLabel = status === 'completed' ? '✓' : status === 'planned' ? '…' : '';

  return (
    <li className="flex items-stretch gap-1">
      {/* Main complete button */}
      <button
        type="button"
        disabled={pending}
        onClick={() => startComplete(async () => {
          setStatus((s: SightStatus) => s === 'completed' ? 'none' : 'completed');
          await toggleSightCompleted(sight.id);
        })}
        className={[
          'flex-1 flex items-center gap-3 rounded-lg border px-3 py-2 text-left transition-colors',
          bgClass,
        ].join(' ')}
      >
        <span
          className={['w-5 h-5 rounded border flex items-center justify-center text-xs shrink-0', iconClass].join(' ')}
          aria-hidden="true"
        >
          {iconLabel}
        </span>
        <div className="flex-1 min-w-0">
          <div className={status === 'completed' ? 'text-text-secondary line-through' : 'text-text-primary'}>
            {sight.title}
          </div>
          {sight.description && (
            <div className="text-text-muted text-xs truncate">{sight.description}</div>
          )}
        </div>
        {status === 'completed' && <span className="text-xs label-mono text-accent-purple shrink-0">+5 XP</span>}
      </button>

      {/* Plan button — only show if not yet completed */}
      {status !== 'completed' && (
        <button
          type="button"
          disabled={pending}
          title={status === 'planned' ? 'Remove from plan' : 'Add to plan'}
          onClick={() => startPlan(async () => {
            setStatus((s: SightStatus) => s === 'planned' ? 'none' : 'planned');
            await toggleSightPlanned(sight.id);
          })}
          className={[
            'rounded-lg border px-2 text-xs label-mono transition-colors',
            status === 'planned'
              ? 'bg-accent-blue/20 border-accent-blue text-accent-blue'
              : 'border-border-subtle text-text-muted hover:border-accent-blue/40 hover:text-accent-blue',
          ].join(' ')}
        >
          {status === 'planned' ? '★' : '☆'}
        </button>
      )}
    </li>
  );
}
