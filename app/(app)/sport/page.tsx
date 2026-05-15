import { requireUserId } from '@/lib/auth/current-user';
import { createServiceClient } from '@/lib/supabase/server';
import { LAUFPLAN_2026, GOAL_KM_2026, KM_BEFORE_PLAN, daysUntilHM, getISOWeek, getCurrentPlanWeek, getNextPlanWeek } from '@/lib/sport/laufplan';
import { RunLogForm } from '@/components/sport/RunLogForm';
import { LaufplanTable } from '@/components/sport/LaufplanTable';
import { seedGoals } from '@/lib/actions/life-seed';

async function getSportData(userId: string) {
  const sb = createServiceClient();
  const { data: logs } = await sb
    .from('user_run_logs')
    .select('*')
    .eq('user_id', userId)
    .order('run_date', { ascending: false })
    .limit(20);

  const { data: sumResult } = await sb
    .from('user_run_logs')
    .select('distance_km')
    .eq('user_id', userId);

  const loggedKm = (sumResult ?? []).reduce((acc, r) => acc + Number(r.distance_km), 0);
  const totalKm = KM_BEFORE_PLAN + loggedKm;

  return { logs: logs ?? [], totalKm };
}

export default async function SportPage() {
  const userId = await requireUserId();
  await seedGoals(userId);

  const { logs, totalKm } = await getSportData(userId);
  const today = new Date();
  const isoWeek = getISOWeek(today);
  const daysLeft = daysUntilHM(today);
  const currentPlanWeek = getCurrentPlanWeek(isoWeek);
  const nextPlanWeek = getNextPlanWeek(isoWeek);
  const progressPct = Math.min((totalKm / GOAL_KM_2026) * 100, 100);
  const hmProgressPct = Math.min((totalKm / 500) * 100, 100);

  const inPlanPhase = isoWeek >= 22 && isoWeek <= 43;
  const planStarted = isoWeek >= 22;

  return (
    <div className="space-y-5">
      <header>
        <p className="text-xs label-mono text-text-muted">← LiveOS</p>
        <h1 className="font-sans text-2xl text-text-primary mt-1">🏃 Sport 2026</h1>
      </header>

      {/* 500km Progress */}
      <div className="rounded-xl bg-bg-surface border border-border-subtle p-4 space-y-3">
        <div className="flex items-baseline justify-between">
          <div>
            <p className="text-xs label-mono text-text-muted">Jahresziel</p>
            <p className="text-lg font-sans text-text-primary mt-0.5">500 km 2026</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-sans text-accent-blue">{totalKm.toFixed(1)}</p>
            <p className="text-xs label-mono text-text-muted">/ 500 km</p>
          </div>
        </div>
        <div className="h-2.5 rounded-full bg-bg-elevated overflow-hidden">
          <div className="h-full rounded-full bg-accent-blue transition-all" style={{ width: `${progressPct}%` }} />
        </div>
        <p className="text-xs text-text-muted">{(GOAL_KM_2026 - totalKm).toFixed(1)} km verbleibend</p>
      </div>

      {/* HM Countdown */}
      <div className="rounded-xl bg-bg-surface border border-border-subtle p-4 flex items-center gap-4">
        <div className="text-3xl">🏁</div>
        <div className="flex-1">
          <p className="text-xs label-mono text-text-muted">Halbmarathon — Sportscheck Run Nürnberg</p>
          <p className="text-text-primary font-sans mt-0.5">25. Oktober 2026</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-2xl font-sans text-accent-green">{daysLeft}</p>
          <p className="text-xs label-mono text-text-muted">Tage</p>
        </div>
      </div>

      {/* Plan status */}
      <div className="rounded-xl bg-bg-surface border border-border-subtle p-4 space-y-2">
        <p className="text-xs label-mono text-text-muted">Laufplan Status</p>
        {!planStarted ? (
          <div>
            <p className="text-text-secondary text-sm">W16–W21 — Fußballsaison + Portugal. Kein Laufplan.</p>
            {nextPlanWeek && (
              <div className="mt-2 rounded-lg bg-accent-blue/10 border border-accent-blue/20 px-3 py-2">
                <p className="text-xs label-mono text-accent-blue">{nextPlanWeek.weekStr} — Start {nextPlanWeek.dates}</p>
                <p className="text-sm text-text-primary mt-0.5">{nextPlanWeek.km} km — {nextPlanWeek.units}</p>
              </div>
            )}
          </div>
        ) : currentPlanWeek ? (
          <div className="rounded-lg bg-accent-green/10 border border-accent-green/20 px-3 py-2">
            <p className="text-xs label-mono text-accent-green">{currentPlanWeek.weekStr} — {currentPlanWeek.dates}</p>
            <p className="text-sm text-text-primary mt-0.5">{currentPlanWeek.km} km — {currentPlanWeek.units}</p>
          </div>
        ) : (
          <p className="text-text-muted text-sm">Kein aktiver Laufplan diese Woche.</p>
        )}
      </div>

      {/* Log run */}
      <RunLogForm />

      {/* Recent logs */}
      {logs.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-xs label-mono text-text-muted">Letzte Aktivitäten</h2>
          <div className="rounded-xl bg-bg-surface border border-border-subtle overflow-hidden divide-y divide-border-subtle">
            {logs.map((log) => (
              <div key={log.id} className="flex items-center gap-3 px-4 py-2.5">
                <span className="text-base shrink-0">
                  {log.run_type === 'LL' ? '🏃' : log.run_type === 'Fußball' ? '⚽' : log.run_type === 'Kraft' ? '💪' : '🏃‍♂️'}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-primary">{Number(log.distance_km).toFixed(1)} km</p>
                  <p className="text-xs text-text-muted">{log.run_type}{log.duration_minutes ? ` · ${log.duration_minutes} min` : ''}{log.notes ? ` · ${log.notes}` : ''}</p>
                </div>
                <p className="text-xs label-mono text-text-muted shrink-0">
                  {new Date(log.run_date).toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Full laufplan */}
      <LaufplanTable currentWeek={isoWeek} />

      {/* Wochenroutine */}
      <section className="space-y-2">
        <h2 className="text-xs label-mono text-text-muted">Wochenroutine</h2>
        <div className="rounded-xl bg-bg-surface border border-border-subtle overflow-hidden divide-y divide-border-subtle">
          {[
            ['Di', 'Lauf EL (Zone 2) 06:45', '~35 min'],
            ['Di', 'Fußball Training 18:30', '90 min'],
            ['Mi', 'Fitness / Kraft 18:00', '60 min'],
            ['Do', 'Lauf EL (Zone 2) 06:45', '~35 min'],
            ['Do', 'Fußball Training 18:30', '90 min'],
            ['Fr', 'Fitness / Kraft 18:00', '60 min'],
            ['Sa', 'Langer Lauf 09:00', '60–120 min'],
            ['tägl.', '5 Min Dehnen (Abend)', '5 min'],
          ].map(([tag, was, dauer]) => (
            <div key={`${tag}-${was}`} className="flex items-center gap-3 px-4 py-2">
              <span className="text-xs label-mono text-accent-blue w-10 shrink-0">{tag}</span>
              <p className="text-sm text-text-primary flex-1">{was}</p>
              <p className="text-xs label-mono text-text-muted shrink-0">{dauer}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
