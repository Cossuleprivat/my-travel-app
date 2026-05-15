'use client';
import { useRef, useState, useTransition } from 'react';
import { logRun } from '@/lib/actions/sport';

export function RunLogForm() {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      await logRun(fd);
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
        + Aktivität loggen
      </button>
    );
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="rounded-xl bg-bg-surface border border-border-subtle p-4 space-y-3">
      <p className="text-xs label-mono text-text-muted">Neue Aktivität</p>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-text-muted mb-1 block">Datum</label>
          <input
            type="date"
            name="run_date"
            defaultValue={new Date().toISOString().split('T')[0]}
            className="w-full rounded-lg bg-bg-elevated border border-border-subtle px-3 py-2 text-sm text-text-primary"
          />
        </div>
        <div>
          <label className="text-xs text-text-muted mb-1 block">Distanz (km)</label>
          <input
            type="number"
            name="distance_km"
            step="0.1"
            min="0.1"
            placeholder="5.0"
            required
            className="w-full rounded-lg bg-bg-elevated border border-border-subtle px-3 py-2 text-sm text-text-primary"
          />
        </div>
        <div>
          <label className="text-xs text-text-muted mb-1 block">Typ</label>
          <select name="run_type" className="w-full rounded-lg bg-bg-elevated border border-border-subtle px-3 py-2 text-sm text-text-primary">
            <option value="EL">EL (Easy)</option>
            <option value="LL">LL (Long Run)</option>
            <option value="Intervall">Intervall</option>
            <option value="Fußball">Fußball</option>
            <option value="Kraft">Kraft</option>
            <option value="Sonstiges">Sonstiges</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-text-muted mb-1 block">Dauer (min, optional)</label>
          <input
            type="number"
            name="duration_minutes"
            min="1"
            placeholder="35"
            className="w-full rounded-lg bg-bg-elevated border border-border-subtle px-3 py-2 text-sm text-text-primary"
          />
        </div>
      </div>
      <input
        type="text"
        name="notes"
        placeholder="Notizen (optional)"
        className="w-full rounded-lg bg-bg-elevated border border-border-subtle px-3 py-2 text-sm text-text-primary"
      />
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="flex-1 rounded-lg bg-accent-blue text-white py-2 text-sm font-medium disabled:opacity-50"
        >
          {pending ? 'Speichern…' : 'Speichern'}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 text-sm text-text-muted">
          Abbrechen
        </button>
      </div>
    </form>
  );
}
