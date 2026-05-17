'use client';
import { useState, useTransition } from 'react';
import { setTaskStatus, deleteTask, updateTask } from '@/lib/actions/tasks';

const PRIORITY_DOT: Record<string, string> = {
  high: 'bg-red-400',
  medium: 'bg-yellow-400',
  low: 'bg-text-muted',
};

type Task = {
  id: string;
  title: string;
  area: string;
  priority: string;
  status: string;
  deadline: string | null;
  notes: string | null;
};

type AreaOpt = { id: string; label: string };

export function TaskItem({
  task,
  daysLeft,
  areas = [],
}: {
  task: Task;
  daysLeft: number | null;
  areas?: AreaOpt[];
}) {
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const isDone = task.status === 'done';

  function toggle() {
    startTransition(() => setTaskStatus(task.id, isDone ? 'open' : 'done'));
  }

  function remove() {
    if (!confirm('Task löschen?')) return;
    startTransition(() => deleteTask(task.id));
  }

  function onSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (!String(fd.get('title') ?? '').trim()) return;
    startTransition(async () => {
      await updateTask(task.id, fd);
      setEditing(false);
    });
  }

  if (editing) {
    return (
      <form
        onSubmit={onSave}
        className={`px-4 py-3 space-y-3 bg-bg-elevated/50 ${pending ? 'opacity-50' : ''}`}
      >
        <input
          autoFocus
          type="text"
          name="title"
          defaultValue={task.title}
          placeholder="Titel"
          className="w-full rounded-lg bg-bg-elevated border border-border-subtle px-3 py-2 text-sm text-text-primary focus:border-border-interactive focus:outline-none"
        />
        <textarea
          name="notes"
          defaultValue={task.notes ?? ''}
          placeholder="Beschreibung / Notizen"
          rows={2}
          className="w-full rounded-lg bg-bg-elevated border border-border-subtle px-3 py-2 text-sm text-text-secondary focus:border-border-interactive focus:outline-none resize-none"
        />
        <div className="grid grid-cols-3 gap-2">
          <select
            name="area"
            defaultValue={task.area}
            className="rounded-lg bg-bg-elevated border border-border-subtle px-2 py-2 text-xs text-text-secondary focus:border-border-interactive focus:outline-none"
          >
            {(areas.length ? areas : [{ id: task.area, label: task.area }]).map((a) => (
              <option key={a.id} value={a.id}>
                {a.label}
              </option>
            ))}
          </select>
          <select
            name="priority"
            defaultValue={task.priority}
            className="rounded-lg bg-bg-elevated border border-border-subtle px-2 py-2 text-xs text-text-secondary focus:border-border-interactive focus:outline-none"
          >
            <option value="high">Hoch</option>
            <option value="medium">Mittel</option>
            <option value="low">Niedrig</option>
          </select>
          <input
            type="date"
            name="deadline"
            defaultValue={task.deadline ?? ''}
            className="rounded-lg bg-bg-elevated border border-border-subtle px-2 py-2 text-xs text-text-secondary focus:border-border-interactive focus:outline-none"
          />
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={pending}
            className="flex-1 rounded-lg bg-accent-blue px-3 py-2 text-sm font-medium text-bg-base hover:bg-accent-blue/90 disabled:opacity-50 transition-colors"
          >
            {pending ? 'Speichern…' : 'Speichern'}
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="rounded-lg border border-border-subtle px-3 py-2 text-sm text-text-muted hover:text-text-secondary transition-colors"
          >
            Abbrechen
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className={`flex items-center gap-3 px-4 py-3 ${pending ? 'opacity-50' : ''}`}>
      <button
        onClick={toggle}
        aria-label={isDone ? 'Als offen markieren' : 'Als erledigt markieren'}
        className={`w-5 h-5 rounded border shrink-0 flex items-center justify-center transition-colors ${isDone ? 'bg-accent-green border-accent-green' : 'border-border-primary'}`}
      >
        {isDone && <span className="text-white text-xs">✓</span>}
      </button>
      <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${PRIORITY_DOT[task.priority] ?? 'bg-text-muted'}`} />
      <button
        onClick={() => setEditing(true)}
        className="flex-1 min-w-0 text-left"
      >
        <p className={`text-sm ${isDone ? 'line-through text-text-muted' : 'text-text-primary'}`}>
          {task.title}
        </p>
        {task.notes && <p className="text-xs text-text-muted truncate">{task.notes}</p>}
      </button>
      {daysLeft != null && !isDone && (
        <span
          className={`text-xs shrink-0 ${daysLeft < 0 ? 'text-red-400' : daysLeft <= 7 ? 'text-yellow-400' : 'text-text-muted'}`}
        >
          {daysLeft < 0 ? 'überfällig' : `${daysLeft}d`}
        </span>
      )}
      <button
        onClick={() => setEditing(true)}
        aria-label="Bearbeiten"
        className="text-text-muted hover:text-accent-blue text-xs transition-colors shrink-0 ml-1"
      >
        ✎
      </button>
      <button
        onClick={remove}
        aria-label="Löschen"
        className="text-text-muted hover:text-red-400 text-xs transition-colors shrink-0"
      >
        ✕
      </button>
    </div>
  );
}
