'use client';

import { useState, useRef, useTransition } from 'react';
import { addTask } from '@/lib/actions/tasks';

const AREAS = [
  'allgemein',
  'hochzeit',
  'finanzen',
  'sport',
  'gaming',
  'lesen',
  'wiki',
] as const;

export function QuickAddTask() {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (!String(fd.get('title') ?? '').trim()) return;
    start(async () => {
      await addTask(fd);
      formRef.current?.reset();
      setOpen(false);
    });
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full rounded-xl border border-dashed border-border-interactive bg-bg-surface/50 py-3 text-sm text-text-secondary hover:bg-bg-surface hover:text-text-primary transition-colors"
      >
        + Schnell eine Aufgabe hinzufügen
      </button>
    );
  }

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      className="rounded-xl border border-border-interactive bg-bg-surface p-4 space-y-3 animate-fade-up"
    >
      <input
        autoFocus
        type="text"
        name="title"
        placeholder="Was muss erledigt werden?"
        className="w-full rounded-lg bg-bg-elevated border border-border-subtle px-3 py-2 text-text-primary placeholder:text-text-muted focus:border-border-interactive focus:outline-none"
      />
      <div className="grid grid-cols-2 gap-2">
        <select
          name="area"
          className="rounded-lg bg-bg-elevated border border-border-subtle px-3 py-2 text-text-secondary text-sm focus:border-border-interactive focus:outline-none"
        >
          {AREAS.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
        <input
          type="date"
          name="deadline"
          className="rounded-lg bg-bg-elevated border border-border-subtle px-3 py-2 text-text-secondary text-sm focus:border-border-interactive focus:outline-none"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="flex-1 rounded-lg bg-accent-blue px-4 py-2 text-sm font-medium text-bg-base hover:bg-accent-blue/90 disabled:opacity-50 transition-colors"
        >
          {pending ? 'Speichern…' : 'Hinzufügen'}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-lg border border-border-subtle px-4 py-2 text-sm text-text-muted hover:text-text-secondary transition-colors"
        >
          Abbrechen
        </button>
      </div>
    </form>
  );
}
