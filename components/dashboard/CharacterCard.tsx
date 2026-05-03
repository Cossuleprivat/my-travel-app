import { PixelSprite } from '@/components/ui/PixelSprite';
import type { LevelBreakdown } from '@/lib/xp';
import type { CharacterPreset } from '@/lib/sprites';

export function CharacterCard({
  name,
  level,
  preset = 'default',
}: {
  name: string;
  level: LevelBreakdown;
  preset?: CharacterPreset;
}) {
  return (
    <section className="rounded-2xl bg-bg-surface border border-border-subtle p-5 lg:p-8 shadow-glow-sm-blue">
      <div className="flex items-center gap-4 lg:gap-6">
        <div className="relative flex-shrink-0">
          <div className="absolute inset-0 rounded-full bg-accent-blue/10 blur-xl pointer-events-none" />
          <PixelSprite size="lg" preset={preset} />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-xs label-mono text-accent-blue mb-1">LVL {level.level}</p>
          <h2 className="font-mono text-2xl lg:text-3xl uppercase tracking-wider truncate text-text-primary">
            {name}
          </h2>
          <p className="text-accent-amber text-xs label-mono mt-0.5">{level.title}</p>
        </div>
      </div>

      <div className="mt-5">
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
        {level.tierXpEnd && (
          <p className="text-text-muted text-[11px] label-mono mt-1.5">
            {level.xpToNextTier} XP to next tier
          </p>
        )}
      </div>
    </section>
  );
}
