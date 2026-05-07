'use client';

import React, { useState, useTransition } from 'react';
import { completeTripQuest, removeQuestFromStop } from '@/lib/actions/trips';
import type { TripQuestDetail } from '@/lib/data/queries';

export function TripQuestRow({ tq, tripId }: { tq: TripQuestDetail; tripId: string }) {
  const [done, setDone] = useState(tq.is_completed);
  const [pendingToggle, startToggle] = useTransition();
  const [pendingRemove, startRemove] = useTransition();

  return (
    <li className="flex items-center gap-2">
      <button
        type="button"
        disabled={pendingToggle}
        onClick={() => startToggle(async () => {
          setDone((x: boolean) => !x);
          await completeTripQuest(tq.id, tripId);
        })}
        className={[
          'flex-1 flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors',
          done
            ? 'bg-accent-green/10 border-accent-green/30 text-text-secondary'
            : 'bg-bg-base border-border-subtle text-text-primary hover:bg-bg-elevated',
        ].join(' ')}
      >
        <span
          className={[
            'w-4 h-4 rounded border flex items-center justify-center text-xs shrink-0',
            done ? 'bg-accent-green border-accent-green text-bg-base' : 'border-border-interactive',
          ].join(' ')}
        >
          {done ? '✓' : ''}
        </span>
        <span className={done ? 'line-through' : ''}>{tq.questTitle}</span>
        {done && <span className="ml-auto text-xs label-mono text-accent-green">+5 XP</span>}
      </button>
      <button
        type="button"
        disabled={pendingRemove}
        onClick={() => startRemove(() => removeQuestFromStop(tq.id, tripId))}
        className="text-xs text-text-muted hover:text-red-400 label-mono shrink-0 disabled:opacity-40"
      >
        ×
      </button>
    </li>
  );
}
