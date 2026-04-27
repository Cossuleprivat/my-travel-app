import { PixelSprite } from '@/components/ui/PixelSprite';
import type { LevelBreakdown } from '@/lib/xp';

export function CharacterCard({
  name, level,
}: { name: string; level: LevelBreakdown }) {
  return (
    <section className="rounded-xl bg-bg-surface border border-border-subtle p-5">
      <div className="flex items-center gap-4">
        <PixelSprite size="md" />
        <div className="flex-1 min-w-0">
          <p className="text-xs label-mono text-text-muted">Lvl {level.level}</p>
          <h2 className="font-mono text-lg uppercase tracking-wider truncate">{name}</h2>
          <p className="text-accent-amber text-xs label-mono">{level.title}</p>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex justify-between text-[10px] label-mono text-text-muted">
          <span>{level.currentXp} XP</span>
          <span>{level.tierXpEnd ?? '∞'} XP</span>
        </div>
        <div className="h-2 bg-bg-elevated rounded mt-1 overflow-hidden">
          <div
            className="h-full bg-accent-amber"
            style={{ width: `${Math.min(100, level.progressPct)}%` }}
          />
        </div>
        {level.tierXpEnd && (
          <p className="text-text-muted text-[10px] label-mono mt-1">
            {level.xpToNextTier} XP to next tier
          </p>
        )}
      </div>
    </section>
  );
}
