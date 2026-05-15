'use client';
import { useTransition } from 'react';

async function toggleTask(id: string, currentStatus: string) {
  'use server';
  const { createServiceClient } = await import('@/lib/supabase/server');
  const { requireUserId } = await import('@/lib/auth/current-user');
  const { revalidatePath } = await import('next/cache');
  const userId = await requireUserId();
  const sb = createServiceClient();
  const next = currentStatus === 'done' ? 'open' : 'done';
  await sb.from('wedding_tasks').update({ status: next }).eq('id', id).eq('user_id', userId);
  revalidatePath('/wedding');
}

type Task = { id: string; title: string; deadline: string | null; status: string; notes: string | null };

function formatDeadline(d: string | null) {
  if (!d) return null;
  return new Date(d).toLocaleDateString('de-DE', { day: 'numeric', month: 'short', year: 'numeric' });
}

function daysLeft(d: string | null) {
  if (!d) return null;
  const days = Math.ceil((new Date(d).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (days < 0) return <span className="text-red-400">überfällig</span>;
  if (days <= 14) return <span className="text-yellow-400">{days}d</span>;
  return <span className="text-text-muted">{days}d</span>;
}

export function WeddingTaskList({ title, tasks, area }: { title: string; tasks: Task[]; area: string }) {
  return (
    <section className="space-y-2">
      <h2 className="text-xs label-mono text-text-muted">{title}</h2>
      <div className="rounded-xl bg-bg-surface border border-border-subtle overflow-hidden divide-y divide-border-subtle">
        {tasks.map((task) => (
          <form key={task.id} action={toggleTask.bind(null, task.id, task.status)}>
            <button type="submit" className="w-full flex items-center gap-3 px-4 py-3 hover:bg-bg-elevated/50 transition-colors text-left">
              <span className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${task.status === 'done' ? 'bg-accent-green border-accent-green' : 'border-border-primary'}`}>
                {task.status === 'done' && <span className="text-white text-xs">✓</span>}
              </span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${task.status === 'done' ? 'text-text-muted line-through' : 'text-text-primary'}`}>{task.title}</p>
                {task.deadline && (
                  <p className="text-xs text-text-muted mt-0.5">{formatDeadline(task.deadline)}</p>
                )}
                {task.notes && <p className="text-xs text-text-muted">{task.notes}</p>}
              </div>
              {task.status !== 'done' && daysLeft(task.deadline) && (
                <span className="text-xs shrink-0">{daysLeft(task.deadline)}</span>
              )}
            </button>
          </form>
        ))}
      </div>
    </section>
  );
}
