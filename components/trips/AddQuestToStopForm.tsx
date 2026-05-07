'use client';

import React, { useState, useTransition } from 'react';
import { addQuestToStop } from '@/lib/actions/trips';
import type { Quest } from '@/lib/supabase/types';

export function AddQuestToStopForm({
  tripStopId,
  availableQuests,
}: {
  tripStopId: string;
  availableQuests: Quest[];
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState('');
  const [pending, start] = useTransition();

  if (availableQuests.length === 0) return null;

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs text-accent-blue label-mono hover:underline"
      >
        + Plan a quest
      </button>
    );
  }

  return (
    <div className="flex gap-2 items-center mt-1 animate-fade-in">
      <select
        value={selected}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelected(e.target.value)}
        className="flex-1 bg-bg-base border border-border-subtle rounded px-2 py-1 text-text-primary text-xs"
      >
        <option value="">Pick a quest…</option>
        {availableQuests.map((q) => (
          <option key={q.id} value={q.id}>{q.title}</option>
        ))}
      </select>
      <button
        type="button"
        disabled={!selected || pending}
        onClick={() => start(async () => {
          await addQuestToStop(tripStopId, selected);
          setSelected('');
          setOpen(false);
        })}
        className="text-xs bg-accent-blue text-bg-base rounded px-3 py-1 label-mono disabled:opacity-40"
      >
        {pending ? '…' : 'Add'}
      </button>
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="text-xs text-text-muted label-mono hover:text-text-secondary"
      >
        ×
      </button>
    </div>
  );
}
