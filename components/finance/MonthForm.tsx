'use client';
import { useState } from 'react';
import { saveMonth } from '@/lib/actions/finance';

const MONTHS = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];

export function MonthForm({ existingMonths }: { existingMonths: number[] }) {
  const [open, setOpen] = useState(false);
  const today = new Date();
  const currentMonth = today.getMonth() + 1;

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="w-full rounded-xl border border-dashed border-border-subtle bg-bg-surface py-3 text-sm text-text-muted hover:text-text-secondary transition-colors">
        + Monat eintragen
      </button>
    );
  }

  return (
    <form action={async (fd) => { await saveMonth(fd); setOpen(false); }} className="rounded-xl bg-bg-surface border border-border-subtle p-4 space-y-3">
      <p className="text-xs label-mono text-text-muted">Monats-Snapshot eintragen</p>
      <select name="month" className="w-full rounded-lg bg-bg-elevated border border-border-subtle px-3 py-2 text-sm text-text-primary">
        {Array.from({ length: 9 }, (_, i) => i + 4).map((m) => (
          <option key={m} value={m}>{MONTHS[m - 1]} 2026{m === currentMonth ? ' (aktuell)' : ''}</option>
        ))}
      </select>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="text-xs text-text-muted mb-1 block">KK-Saldo (€)</label><input type="number" name="kk_saldo_end" step="0.01" placeholder="-2492" className="w-full rounded-lg bg-bg-elevated border border-border-subtle px-3 py-2 text-sm text-text-primary" /></div>
        <div><label className="text-xs text-text-muted mb-1 block">KK-Frei (€)</label><input type="number" name="kk_free" step="0.01" placeholder="3508" className="w-full rounded-lg bg-bg-elevated border border-border-subtle px-3 py-2 text-sm text-text-primary" /></div>
        <div><label className="text-xs text-text-muted mb-1 block">Girokonto (€)</label><input type="number" name="giro_saldo" step="0.01" placeholder="1567" className="w-full rounded-lg bg-bg-elevated border border-border-subtle px-3 py-2 text-sm text-text-primary" /></div>
        <div><label className="text-xs text-text-muted mb-1 block">Gehalt (€)</label><input type="number" name="salary" step="0.01" placeholder="2750" className="w-full rounded-lg bg-bg-elevated border border-border-subtle px-3 py-2 text-sm text-text-primary" /></div>
      </div>
      <input type="text" name="notes" placeholder="Notizen (optional)" className="w-full rounded-lg bg-bg-elevated border border-border-subtle px-3 py-2 text-sm text-text-primary" />
      <div className="flex gap-2">
        <button type="submit" className="flex-1 rounded-lg bg-accent-blue text-white py-2 text-sm font-medium">Speichern</button>
        <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 text-sm text-text-muted">Abbrechen</button>
      </div>
    </form>
  );
}
