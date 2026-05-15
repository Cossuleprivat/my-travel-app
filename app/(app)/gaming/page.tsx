import { requireUserId } from '@/lib/auth/current-user';
import { createServiceClient } from '@/lib/supabase/server';
import { seedGames } from '@/lib/actions/life-seed';
import { GameSlots } from '@/components/gaming/GameSlots';
import { GameList } from '@/components/gaming/GameList';
import { AddGameForm } from '@/components/gaming/AddGameForm';

async function getGames(userId: string) {
  const sb = createServiceClient();
  const { data } = await sb
    .from('user_games')
    .select('*')
    .eq('user_id', userId)
    .order('sort_order')
    .order('created_at');
  return data ?? [];
}

export default async function GamingPage() {
  const userId = await requireUserId();
  await seedGames(userId);

  const games = await getGames(userId);
  const completed = games.filter((g) => g.status === 'completed').length;
  const slots = Array.from({ length: 10 }, (_, i) => {
    const slotNum = i + 1;
    return games.find((g) => g.slot_number === slotNum) ?? null;
  });
  const active = games.filter((g) => g.status === 'active' && !g.slot_number);
  const pipeline = games.filter((g) => g.status === 'pipeline');

  return (
    <div className="space-y-5">
      <header>
        <p className="text-xs label-mono text-text-muted">← LiveOS</p>
        <h1 className="font-sans text-2xl text-text-primary mt-1">🎮 Gaming 2026</h1>
      </header>

      {/* Progress */}
      <div className="rounded-xl bg-bg-surface border border-border-subtle p-4 space-y-3">
        <div className="flex items-baseline justify-between">
          <div>
            <p className="text-xs label-mono text-text-muted">Jahresziel — 10 Games</p>
          </div>
          <p className="text-2xl font-sans text-accent-blue">{completed} <span className="text-text-muted text-base">/ 10</span></p>
        </div>
        <div className="h-2.5 rounded-full bg-bg-elevated overflow-hidden">
          <div className="h-full rounded-full bg-accent-blue transition-all" style={{ width: `${(completed / 10) * 100}%` }} />
        </div>
        <div className="flex gap-3 text-xs label-mono text-text-muted">
          <span>✅ {completed} fertig</span>
          <span>🔵 {games.filter(g => g.status === 'active').length} aktiv</span>
          <span>📋 {pipeline.length} pipeline</span>
        </div>
      </div>

      {/* 10 Slots */}
      <GameSlots slots={slots} activeGames={active} />

      {/* Active / Angefangen */}
      {active.length > 0 && (
        <GameList title="Angefangen — Kandidaten für nächste Slots" games={active} variant="active" />
      )}

      {/* Pipeline */}
      {pipeline.length > 0 && (
        <GameList title="Pipeline" games={pipeline} variant="pipeline" />
      )}

      {/* Add game */}
      <AddGameForm />
    </div>
  );
}
