'use client';
import { useRef, useState, useTransition } from 'react';
import { addGame } from '@/lib/actions/gaming';

export function AddGameForm() {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      await addGame(fd);
      formRef.current?.reset();
      setOpen(false);
    });
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full rounded-xl border border-dashed border-border-subtle bg-bg-surface py-3 text-sm text-text-muted hover:text-text-secondary hover:border-border-primary transition-colors"
      >
        + Spiel hinzufügen
      </button>
    );
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="rounded-xl bg-bg-surface border border-border-subtle p-4 space-y-3">
      <p className="text-xs label-mono text-text-muted">Neues Spiel</p>
      <input type="text" name="title" placeholder="Spieltitel *" required className="w-full rounded-lg bg-bg-elevated border border-border-subtle px-3 py-2 text-sm text-text-primary" />
      <div className="grid grid-cols-2 gap-3">
        <input type="text" name="platform" placeholder="Platform (PS5, Switch…)" className="rounded-lg bg-bg-elevated border border-border-subtle px-3 py-2 text-sm text-text-primary" />
        <input type="text" name="genre" placeholder="Genre (RPG, Action…)" className="rounded-lg bg-bg-elevated border border-border-subtle px-3 py-2 text-sm text-text-primary" />
        <input type="text" name="played_with" defaultValue="Solo" placeholder="Solo / Koop" className="rounded-lg bg-bg-elevated border border-border-subtle px-3 py-2 text-sm text-text-primary" />
        <select name="status" className="rounded-lg bg-bg-elevated border border-border-subtle px-3 py-2 text-sm text-text-primary">
          <option value="pipeline">Pipeline</option>
          <option value="active">Aktiv</option>
        </select>
      </div>
      <input type="text" name="notes" placeholder="Notizen (optional)" className="w-full rounded-lg bg-bg-elevated border border-border-subtle px-3 py-2 text-sm text-text-primary" />
      <div className="flex gap-2">
        <button type="submit" disabled={pending} className="flex-1 rounded-lg bg-accent-blue text-white py-2 text-sm font-medium disabled:opacity-50">
          {pending ? 'Hinzufügen…' : 'Hinzufügen'}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 text-sm text-text-muted">Abbrechen</button>
      </div>
    </form>
  );
}
