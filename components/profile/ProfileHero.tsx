import { PixelSprite } from '@/components/ui/PixelSprite';
import type { LevelBreakdown } from '@/lib/xp';

export function ProfileHero({
  name, level, stats,
}: {
  name: string;
  level: LevelBreakdown;
  stats: { continents: number; countries: number; cities: number };
}) {
  return (
    <section className="rounded-xl bg-bg-surface border border-border-subtle p-6 text-center">
      <PixelSprite size="lg" />
      <h1 className="mt-4 font-mono uppercase tracking-wider text-xl">{name}</h1>
      <p className="text-accent-amber text-xs label-mono mt-1">
        Lvl {level.level} · {level.title}
      </p>

      <div className="mt-4">
        <div className="h-2 bg-bg-elevated rounded overflow-hidden">
          <div className="h-full bg-accent-amber" style={{ width: `${Math.min(100, level.progressPct)}%` }} />
        </div>
        <p className="text-text-muted text-[10px] label-mono mt-1">
          {level.currentXp} / {level.tierXpEnd ?? '∞'} XP
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-5 text-xs label-mono">
        <div>
          <div className="font-mono text-2xl text-accent-blue">{stats.continents}</div>
          <div className="text-text-muted">Continents</div>
        </div>
        <div>
          <div className="font-mono text-2xl text-accent-amber">{stats.countries}</div>
          <div className="text-text-muted">Countries</div>
        </div>
        <div>
          <div className="font-mono text-2xl text-accent-green">{stats.cities}</div>
          <div className="text-text-muted">Cities</div>
        </div>
      </div>
    </section>
  );
}
