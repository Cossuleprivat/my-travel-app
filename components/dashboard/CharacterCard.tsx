// components/dashboard/CharacterCard.tsx
import { AvatarDisplay } from '@/components/avatar/AvatarDisplay';
import { ProgressRing } from '@/components/ui/ProgressRing';
import type { LevelBreakdown } from '@/lib/xp';
import type { AvatarMood } from '@/lib/streaks/streak';

export function CharacterCard({
  name, level, avatarUrl, streak = 0, streakAlive = false, mood,
}: {
  name: string;
  level: LevelBreakdown;
  avatarUrl: string | null;
  streak?: number;
  streakAlive?: boolean;
  mood?: AvatarMood;
}) {
  return (
    <section className="rounded-xl bg-bg-surface border border-border-subtle p-5">
      <div className="flex items-center gap-4">
        <div className="relative">
          <AvatarDisplay avatarUrl={avatarUrl} name={name} size="md" mood={mood} />
          <div className="absolute -bottom-2 -right-2">
            <ProgressRing
              pct={level.progressPct}
              size={32}
              stroke={3}
              color="#d48030"
            />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs label-mono text-text-muted">Lvl {level.level}</p>
          <h2 className="font-mono text-lg uppercase tracking-wider truncate">{name}</h2>
          <p className="text-accent-amber text-xs label-mono">{level.title}</p>
        </div>
        {streak > 0 && (
          <div className={`flex flex-col items-center gap-0.5 ${streakAlive ? '' : 'opacity-40'}`}>
            <span className="text-xl leading-none" aria-hidden="true">🔥</span>
            <span className={`text-xs font-mono font-bold ${streakAlive ? 'text-accent-amber' : 'text-text-muted'}`}>
              {streak}
            </span>
          </div>
        )}
      </div>

      <div className="mt-4">
        <div className="flex justify-between text-[10px] label-mono text-text-muted">
          <span>{level.currentXp} XP</span>
          <span>{level.tierXpEnd ?? '∞'} XP</span>
        </div>
        <div className="h-2 bg-bg-elevated rounded mt-1 overflow-hidden">
          <div
            className="h-full bg-accent-amber transition-all duration-500"
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
