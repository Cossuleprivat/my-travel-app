import { requireUserId } from '@/lib/auth/current-user';
import { createServiceClient } from '@/lib/supabase/server';
import { seedGoals } from '@/lib/actions/life-seed';
import { setGoalDone } from '@/lib/actions/tasks';

const AREA_META: Record<string, { icon: string; label: string; color: string }> = {
  sport:   { icon: '🏃', label: 'Sport',    color: 'text-accent-green' },
  gaming:  { icon: '🎮', label: 'Gaming',   color: 'text-accent-purple' },
  reading: { icon: '📚', label: 'Lesen',    color: 'text-accent-amber' },
  travel:  { icon: '✈️', label: 'Reisen',   color: 'text-accent-blue' },
  finance: { icon: '💰', label: 'Finanzen', color: 'text-accent-amber' },
  wedding: { icon: '💍', label: 'Hochzeit', color: 'text-red-400' },
  coding:  { icon: '💻', label: 'Coding',   color: 'text-accent-blue' },
  content: { icon: '📱', label: 'Content',  color: 'text-text-muted' },
};

function daysLeft(deadline: string | null) {
  if (!deadline) return null;
  return Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000);
}

function fmt(n: number) {
  return n.toLocaleString('de-DE', { maximumFractionDigits: 0 });
}

async function getGoalProgress(userId: string) {
  const sb = createServiceClient();
  const [{ data: runs }, { data: games }, { data: books }, { data: financeMonths }] = await Promise.all([
    sb.from('user_run_logs').select('distance_km').eq('user_id', userId),
    sb.from('user_games').select('status').eq('user_id', userId).eq('year', 2026),
    sb.from('user_books').select('status, type').eq('user_id', userId).eq('year', 2026),
    sb.from('finance_months').select('kk_saldo_end').eq('user_id', userId).eq('year', 2026).order('month').limit(12),
  ]);

  const kmRun = (runs ?? []).reduce((s, r) => s + Number(r.distance_km ?? 0), 0);
  const gamesDone = (games ?? []).filter((g) => g.status === 'completed').length;
  const booksDone = (books ?? []).filter((b) => b.type === 'book' && b.status === 'done').length;
  const audioDone = (books ?? []).filter((b) => b.type === 'audiobook' && b.status === 'done').length;
  const latestKK = (financeMonths ?? []).at(-1)?.kk_saldo_end ?? null;

  return { kmRun, gamesDone, booksDone, audioDone, latestKK };
}

type Goal = { id: string; area: string; title: string; definition_of_done: string | null; deadline: string | null; xp_reward: number; status: string };

function GoalProgress({ goal, progress }: { goal: Goal; progress: Awaited<ReturnType<typeof getGoalProgress>> }) {
  const { kmRun, gamesDone, booksDone, audioDone, latestKK } = progress;

  if (goal.title.includes('500 km')) {
    const pct = Math.min(100, (kmRun / 500) * 100);
    return (
      <div className="mt-2 space-y-1">
        <div className="h-1.5 rounded-full bg-bg-base overflow-hidden">
          <div className="h-full rounded-full bg-accent-green" style={{ width: `${pct}%` }} />
        </div>
        <p className="text-xs text-text-muted">{kmRun.toFixed(1)} / 500 km</p>
      </div>
    );
  }
  if (goal.title.includes('10 Games')) {
    const pct = Math.min(100, (gamesDone / 10) * 100);
    return (
      <div className="mt-2 space-y-1">
        <div className="h-1.5 rounded-full bg-bg-base overflow-hidden">
          <div className="h-full rounded-full bg-accent-purple" style={{ width: `${pct}%` }} />
        </div>
        <p className="text-xs text-text-muted">{gamesDone} / 10 Spiele</p>
      </div>
    );
  }
  if (goal.title.includes('5 Bücher')) {
    const pct = Math.min(100, (booksDone / 5) * 100);
    return (
      <div className="mt-2 space-y-1">
        <div className="h-1.5 rounded-full bg-bg-base overflow-hidden">
          <div className="h-full rounded-full bg-accent-amber" style={{ width: `${pct}%` }} />
        </div>
        <p className="text-xs text-text-muted">{booksDone} / 5 Bücher</p>
      </div>
    );
  }
  if (goal.title.includes('5 Hörbücher')) {
    const pct = Math.min(100, (audioDone / 5) * 100);
    return (
      <div className="mt-2 space-y-1">
        <div className="h-1.5 rounded-full bg-bg-base overflow-hidden">
          <div className="h-full rounded-full bg-accent-amber" style={{ width: `${pct}%` }} />
        </div>
        <p className="text-xs text-text-muted">{audioDone} / 5 Hörbücher</p>
      </div>
    );
  }
  if (goal.title.includes('KK-Saldo')) {
    const kk = latestKK != null ? Number(latestKK) : null;
    const pct = kk != null ? Math.min(100, Math.max(0, ((2492 + kk) / 2492) * 100)) : 0;
    return (
      <div className="mt-2 space-y-1">
        <div className="h-1.5 rounded-full bg-bg-base overflow-hidden">
          <div className="h-full rounded-full bg-accent-green" style={{ width: `${pct}%` }} />
        </div>
        <p className="text-xs text-text-muted">{kk != null ? `${fmt(kk)} € aktuell` : '— noch kein Snapshot'}</p>
      </div>
    );
  }
  return null;
}

export default async function GoalsPage() {
  const userId = await requireUserId();
  await seedGoals(userId);

  const sb = createServiceClient();
  const { data: goalsRaw } = await sb.from('user_goals').select('*').eq('user_id', userId).eq('year', 2026).order('area').order('created_at');
  const goals = (goalsRaw ?? []) as Goal[];
  const progress = await getGoalProgress(userId);

  const areas = [...new Set(goals.map((g) => g.area))];
  const totalXP = goals.reduce((s, g) => s + g.xp_reward, 0);
  const doneXP = goals.filter((g) => g.status === 'done').reduce((s, g) => s + g.xp_reward, 0);
  const doneCount = goals.filter((g) => g.status === 'done').length;

  return (
    <div className="space-y-5">
      <header>
        <p className="text-xs label-mono text-text-muted">← LiveOS</p>
        <h1 className="font-sans text-2xl text-text-primary mt-1">🎯 Jahresplan 2026</h1>
      </header>

      {/* XP Overview */}
      <div className="rounded-xl bg-bg-surface border border-border-subtle p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs label-mono text-text-muted">XP-Fortschritt</p>
          <p className="text-xs label-mono text-accent-blue">{doneXP} / {totalXP} XP</p>
        </div>
        <div className="h-2 rounded-full bg-bg-elevated overflow-hidden">
          <div className="h-full rounded-full bg-accent-blue transition-all" style={{ width: `${totalXP > 0 ? (doneXP / totalXP) * 100 : 0}%` }} />
        </div>
        <p className="text-xs text-text-muted">{doneCount}/{goals.length} Ziele erreicht</p>
      </div>

      {/* Goals by area */}
      {areas.map((area) => {
        const meta = AREA_META[area] ?? { icon: '◎', label: area, color: 'text-text-muted' };
        const areaGoals = goals.filter((g) => g.area === area);
        return (
          <section key={area} className="space-y-2">
            <h2 className="text-xs label-mono text-text-muted">{meta.icon} {meta.label}</h2>
            <div className="rounded-xl bg-bg-surface border border-border-subtle overflow-hidden divide-y divide-border-subtle">
              {areaGoals.map((goal) => {
                const dl = daysLeft(goal.deadline);
                const isDone = goal.status === 'done';
                return (
                  <div key={goal.id} className={`px-4 py-3 ${isDone ? 'opacity-60' : ''}`}>
                    <div className="flex items-start gap-3">
                      <form action={async () => {
                        'use server';
                        await setGoalDone(goal.id, !isDone);
                      }}>
                        <button type="submit" className={`mt-0.5 w-5 h-5 rounded border shrink-0 flex items-center justify-center transition-colors ${isDone ? 'bg-accent-green border-accent-green' : 'border-border-primary'}`}>
                          {isDone && <span className="text-white text-xs">✓</span>}
                        </button>
                      </form>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${isDone ? 'line-through text-text-muted' : 'text-text-primary'}`}>{goal.title}</p>
                        {goal.definition_of_done && (
                          <p className="text-xs text-text-muted mt-0.5">{goal.definition_of_done}</p>
                        )}
                        <GoalProgress goal={goal} progress={progress} />
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className={`text-[10px] label-mono px-1.5 py-0.5 rounded ${meta.color} bg-bg-elevated`}>
                          +{goal.xp_reward} XP
                        </span>
                        {dl != null && !isDone && (
                          <span className={`text-xs ${dl < 0 ? 'text-red-400' : dl <= 30 ? 'text-yellow-400' : 'text-text-muted'}`}>
                            {dl < 0 ? 'überfällig' : `${dl}d`}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
