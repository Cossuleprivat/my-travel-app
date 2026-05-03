import { PixelSprite } from '@/components/ui/PixelSprite';
import type { LevelBreakdown } from '@/lib/xp';
import type { CharacterPreset } from '@/lib/sprites';

export function ProfileHero({
  name,
  level,
  stats,
  preset = 'default',
}: {
  name: string;
  level: LevelBreakdown;
  stats: { continents: number; countries: number; cities: number };
  preset?: CharacterPreset;
}) {
  return (
    <section className="rounded-2xl bg-bg-surface border border-border-subtle p-6 lg:p-10 shadow-glow-sm-blue">
      {/* Desktop: horizontal layout; Mobile: centered */}
      <div className="flex flex-col items-center lg:flex-row lg:items-start lg:gap-10">

        {/* Sprite + glow halo */}
        <div className="relative flex-shrink-0">
          <div className="absolute inset-0 bg-accent-blue/10 rounded-full blur-2xl pointer-events-none" />
          <PixelSprite size="xl" preset={preset} />
        </div>

        <div className="flex-1 text-center lg:text-left mt-4 lg:mt-2">
          <p className="text-xs label-mono text-accent-blue mb-1">LVL {level.level}</p>
          <h1 className="font-mono text-3xl lg:text-4xl uppercase tracking-wider text-text-primary">
            {name}
          </h1>
          <p className="text-accent-amber text-sm label-mono mt-1">{level.title}</p>

          {/* XP bar */}
          <div className="mt-4 max-w-xs lg:max-w-sm mx-auto lg:mx-0">
            <div className="flex justify-between text-[11px] label-mono text-text-muted mb-1.5">
              <span>{level.currentXp} XP</span>
              <span>{level.tierXpEnd !== null ? `${level.tierXpEnd} XP` : '∞'}</span>
            </div>
            <div className="h-3 bg-bg-elevated rounded-full overflow-hidden border border-border-subtle">
              <div
                className="h-full bg-accent-amber rounded-full transition-all duration-700 shadow-glow-amber"
                style={{ width: `${Math.min(100, level.progressPct)}%` }}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6 max-w-xs lg:max-w-md mx-auto lg:mx-0">
            {[
              { value: stats.continents, label: 'Continents', color: 'text-accent-blue' },
              { value: stats.countries,  label: 'Countries',  color: 'text-accent-amber' },
              { value: stats.cities,     label: 'Cities',     color: 'text-accent-green' },
            ].map(({ value, label, color }) => (
              <div key={label} className="rounded-xl bg-bg-elevated border border-border-subtle p-3">
                <div className={`font-mono text-3xl lg:text-4xl font-bold ${color}`}>{value}</div>
                <div className="text-text-muted text-[10px] label-mono mt-0.5 uppercase">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
