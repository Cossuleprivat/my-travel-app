'use client';

import { useState, useRef, useTransition } from 'react';
import { addEvent } from '@/lib/actions/events';

const COLORS = [
  { value: 'blue', label: 'Blau', dot: 'bg-accent-blue' },
  { value: 'green', label: 'Grün', dot: 'bg-accent-green' },
  { value: 'amber', label: 'Amber', dot: 'bg-accent-amber' },
  { value: 'purple', label: 'Lila', dot: 'bg-accent-purple' },
  { value: 'red', label: 'Rot', dot: 'bg-red-400' },
] as const;

export function AddEvent() {
  const [open, setOpen] = useState(false);
  const [color, setColor] = useState('blue');
  const [pending, start] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (!String(fd.get('title') ?? '').trim() || !fd.get('event_date')) return;
    fd.set('color', color);
    start(async () => {
      await addEvent(fd);
      formRef.current?.reset();
      setColor('blue');
      setOpen(false);
    });
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full rounded-xl border border-dashed border-border-interactive bg-bg-surface/50 py-3 text-sm text-text-secondary hover:bg-bg-surface hover:text-text-primary transition-colors"
      >
        + Eigenen Termin hinzufügen
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
        placeholder="Termin-Titel"
        className="w-full rounded-lg bg-bg-elevated border border-border-subtle px-3 py-2 text-text-primary placeholder:text-text-muted focus:border-border-interactive focus:outline-none"
      />
      <input
        type="date"
        name="event_date"
        className="w-full rounded-lg bg-bg-elevated border border-border-subtle px-3 py-2 text-text-secondary text-sm focus:border-border-interactive focus:outline-none"
      />
      <div className="flex gap-2">
        {COLORS.map((c) => (
          <button
            key={c.value}
            type="button"
            onClick={() => setColor(c.value)}
            aria-label={c.label}
            className={[
              'h-8 w-8 rounded-full flex items-center justify-center transition-transform',
              color === c.value ? 'ring-2 ring-text-primary scale-110' : 'opacity-60',
            ].join(' ')}
          >
            <span className={`h-4 w-4 rounded-full ${c.dot}`} />
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="flex-1 rounded-lg bg-accent-blue px-4 py-2 text-sm font-medium text-bg-base hover:bg-accent-blue/90 disabled:opacity-50 transition-colors"
        >
          {pending ? 'Speichern…' : 'Termin anlegen'}
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
