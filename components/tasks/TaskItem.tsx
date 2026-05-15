'use client';
import { useTransition } from 'react';
import { setTaskStatus, deleteTask } from '@/lib/actions/tasks';

const PRIORITY_DOT: Record<string, string> = {
  high:   'bg-red-400',
  medium: 'bg-yellow-400',
  low:    'bg-text-muted',
};

type Task = { id: string; title: string; area: string; priority: string; status: string; deadline: string | null; notes: string | null };

export function TaskItem({ task, daysLeft }: { task: Task; daysLeft: number | null }) {
  const [pending, startTransition] = useTransition();
  const isDone = task.status === 'done';

  function toggle() {
    startTransition(() => setTaskStatus(task.id, isDone ? 'open' : 'done'));
  }

  function remove() {
    if (!confirm('Task löschen?')) return;
    startTransition(() => deleteTask(task.id));
  }

  return (
    <div className={`flex items-center gap-3 px-4 py-3 ${pending ? 'opacity-50' : ''}`}>
      <button
        onClick={toggle}
        className={`w-5 h-5 rounded border shrink-0 flex items-center justify-center transition-colors ${isDone ? 'bg-accent-green border-accent-green' : 'border-border-primary'}`}
      >
        {isDone && <span className="text-white text-xs">✓</span>}
      </button>
      <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${PRIORITY_DOT[task.priority] ?? 'bg-text-muted'}`} />
      <div className="flex-1 min-w-0">
        <p className={`text-sm ${isDone ? 'line-through text-text-muted' : 'text-text-primary'}`}>{task.title}</p>
        {task.notes && <p className="text-xs text-text-muted">{task.notes}</p>}
      </div>
      {daysLeft != null && !isDone && (
        <span className={`text-xs shrink-0 ${daysLeft < 0 ? 'text-red-400' : daysLeft <= 7 ? 'text-yellow-400' : 'text-text-muted'}`}>
          {daysLeft < 0 ? 'überfällig' : `${daysLeft}d`}
        </span>
      )}
      <button onClick={remove} className="text-text-muted hover:text-red-400 text-xs transition-colors shrink-0 ml-1">✕</button>
    </div>
  );
}
