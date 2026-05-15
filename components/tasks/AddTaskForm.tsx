'use client';
import { useState, useRef } from 'react';
import { addTask } from '@/lib/actions/tasks';

export function AddTaskForm({ areas }: { areas: { id: string; label: string }[] }) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="w-full rounded-xl border border-dashed border-border-subtle bg-bg-surface py-3 text-sm text-text-muted hover:text-text-secondary transition-colors">
        + Task hinzufügen
      </button>
    );
  }

  return (
    <form
      ref={formRef}
      action={async (fd) => { await addTask(fd); formRef.current?.reset(); setOpen(false); }}
      className="rounded-xl bg-bg-surface border border-border-subtle p-4 space-y-3"
    >
      <p className="text-xs label-mono text-text-muted">Neuer Task</p>
      <input type="text" name="title" placeholder="Was muss erledigt werden? *" required className="w-full rounded-lg bg-bg-elevated border border-border-subtle px-3 py-2 text-sm text-text-primary" />
      <div className="grid grid-cols-2 gap-3">
        <select name="area" className="rounded-lg bg-bg-elevated border border-border-subtle px-3 py-2 text-sm text-text-primary">
          {areas.map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}
        </select>
        <select name="priority" className="rounded-lg bg-bg-elevated border border-border-subtle px-3 py-2 text-sm text-text-primary">
          <option value="high">🔴 Hoch</option>
          <option value="medium" selected>🟡 Mittel</option>
          <option value="low">🟢 Niedrig</option>
        </select>
      </div>
      <input type="date" name="deadline" className="w-full rounded-lg bg-bg-elevated border border-border-subtle px-3 py-2 text-sm text-text-primary" />
      <input type="text" name="notes" placeholder="Notizen (optional)" className="w-full rounded-lg bg-bg-elevated border border-border-subtle px-3 py-2 text-sm text-text-primary" />
      <div className="flex gap-2">
        <button type="submit" className="flex-1 rounded-lg bg-accent-blue text-white py-2 text-sm font-medium">Speichern</button>
        <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 text-sm text-text-muted">Abbrechen</button>
      </div>
    </form>
  );
}
