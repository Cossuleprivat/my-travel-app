import { requireUserId } from '@/lib/auth/current-user';
import { createServiceClient } from '@/lib/supabase/server';
import { seedTasks } from '@/lib/actions/life-seed';
import { AddTaskForm } from '@/components/tasks/AddTaskForm';
import { TaskItem } from '@/components/tasks/TaskItem';

const AREAS = [
  { id: 'alle',      label: '— Alle' },
  { id: 'sport',     label: '🏃 Sport' },
  { id: 'gaming',    label: '🎮 Gaming' },
  { id: 'reading',   label: '📚 Lesen' },
  { id: 'finance',   label: '💰 Finanzen' },
  { id: 'wedding',   label: '💍 Hochzeit' },
  { id: 'travel',    label: '✈️ Reisen' },
  { id: 'coding',    label: '💻 Coding' },
  { id: 'allgemein', label: '📋 Allgemein' },
];

type Task = {
  id: string;
  title: string;
  area: string;
  priority: string;
  status: string;
  deadline: string | null;
  notes: string | null;
};

function daysLeft(deadline: string | null) {
  if (!deadline) return null;
  return Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000);
}

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };

export default async function TasksPage() {
  const userId = await requireUserId();
  await seedTasks(userId);

  const sb = createServiceClient();
  const { data } = await sb
    .from('user_tasks')
    .select('*')
    .eq('user_id', userId)
    .order('status')
    .order('priority')
    .order('deadline', { nullsFirst: false });

  const tasks = (data ?? []) as Task[];
  const open = tasks.filter((t) => t.status !== 'done').sort((a, b) => {
    const po = (PRIORITY_ORDER[a.priority as keyof typeof PRIORITY_ORDER] ?? 1) - (PRIORITY_ORDER[b.priority as keyof typeof PRIORITY_ORDER] ?? 1);
    if (po !== 0) return po;
    if (a.deadline && b.deadline) return a.deadline.localeCompare(b.deadline);
    if (a.deadline) return -1;
    if (b.deadline) return 1;
    return 0;
  });
  const done = tasks.filter((t) => t.status === 'done');

  const areaGroups = AREAS.slice(1).map((a) => ({
    ...a,
    tasks: open.filter((t) => t.area === a.id),
  })).filter((g) => g.tasks.length > 0);

  return (
    <div className="space-y-5">
      <header>
        <p className="text-xs label-mono text-text-muted">← LiveOS</p>
        <h1 className="font-sans text-2xl text-text-primary mt-1">✅ Tasks 2026</h1>
      </header>

      {/* Stats strip */}
      <div className="rounded-xl bg-bg-surface border border-border-subtle px-4 py-3 flex items-center gap-4">
        <div className="flex-1">
          <div className="h-2 rounded-full bg-bg-elevated overflow-hidden">
            <div className="h-full rounded-full bg-accent-green transition-all" style={{ width: tasks.length > 0 ? `${(done.length / tasks.length) * 100}%` : '0%' }} />
          </div>
        </div>
        <p className="text-sm label-mono text-text-muted shrink-0">{done.length}/{tasks.length} erledigt</p>
      </div>

      {/* Open tasks by area */}
      {areaGroups.map((group) => (
        <section key={group.id} className="space-y-2">
          <h2 className="text-xs label-mono text-text-muted">{group.label}</h2>
          <div className="rounded-xl bg-bg-surface border border-border-subtle overflow-hidden divide-y divide-border-subtle">
            {group.tasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                daysLeft={daysLeft(task.deadline)}
                areas={AREAS.slice(1).map((a) => ({ id: a.id, label: a.label }))}
              />
            ))}
          </div>
        </section>
      ))}

      {/* Add form */}
      <AddTaskForm areas={AREAS.slice(1).map((a) => ({ id: a.id, label: a.label }))} />

      {/* Done */}
      {done.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-xs label-mono text-text-muted">✓ Erledigt ({done.length})</h2>
          <div className="rounded-xl bg-bg-surface border border-border-subtle overflow-hidden divide-y divide-border-subtle opacity-50">
            {done.map((task) => (
              <TaskItem key={task.id} task={task} daysLeft={null} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
