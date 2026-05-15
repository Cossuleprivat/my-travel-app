import { requireUserId } from '@/lib/auth/current-user';
import { createServiceClient } from '@/lib/supabase/server';
import { seedWedding } from '@/lib/actions/life-seed';
import { WeddingTaskList } from '@/components/wedding/WeddingTaskList';

async function getWeddingTasks(userId: string) {
  const sb = createServiceClient();
  const { data } = await sb.from('wedding_tasks').select('*').eq('user_id', userId).order('sort_order').order('deadline', { nullsFirst: false });
  return data ?? [];
}

function daysUntil(dateStr: string) {
  const d = new Date(dateStr);
  const today = new Date();
  return Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export default async function WeddingPage() {
  const userId = await requireUserId();
  await seedWedding(userId);
  const tasks = await getWeddingTasks(userId);

  const standesamt = tasks.filter((t) => t.area === 'standesamt');
  const freieTrauung = tasks.filter((t) => t.area === 'freie_trauung');
  const allgemein = tasks.filter((t) => t.area === 'allgemein');

  const doneCount = tasks.filter((t) => t.status === 'done').length;
  const daysToStandesamt = daysUntil('2026-10-10');

  return (
    <div className="space-y-5">
      <header>
        <p className="text-xs label-mono text-text-muted">← LiveOS</p>
        <h1 className="font-sans text-2xl text-text-primary mt-1">💍 Hochzeit</h1>
      </header>

      {/* Overview */}
      <div className="rounded-xl bg-bg-surface border border-border-subtle p-4 flex items-center gap-4">
        <div className="text-3xl">💍</div>
        <div className="flex-1">
          <p className="text-xs label-mono text-text-muted">Standesamt — Die Schmiede, Schwabach</p>
          <p className="text-text-primary font-sans">10. Oktober 2026</p>
          <p className="text-xs text-text-muted mt-0.5">Freie Trauung 2027 — Planung ab November</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-2xl font-sans text-accent-blue">{daysToStandesamt}</p>
          <p className="text-xs label-mono text-text-muted">Tage</p>
        </div>
      </div>

      {/* Progress */}
      <div className="rounded-xl bg-bg-surface border border-border-subtle px-4 py-3 flex items-center gap-4">
        <div className="flex-1">
          <div className="h-2 rounded-full bg-bg-elevated overflow-hidden">
            <div className="h-full rounded-full bg-accent-green transition-all" style={{ width: `${(doneCount / tasks.length) * 100}%` }} />
          </div>
        </div>
        <p className="text-sm label-mono text-text-muted shrink-0">{doneCount}/{tasks.length} erledigt</p>
      </div>

      <WeddingTaskList title="💍 Standesamt 2026" tasks={standesamt} area="standesamt" />
      <WeddingTaskList title="🎉 Freie Trauung 2027" tasks={freieTrauung} area="freie_trauung" />
      {allgemein.length > 0 && <WeddingTaskList title="📋 Allgemein" tasks={allgemein} area="allgemein" />}
    </div>
  );
}
