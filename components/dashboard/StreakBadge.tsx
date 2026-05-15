type Props = {
  streak: number;
  isAlive: boolean;
  longestStreak: number;
};

export function StreakBadge({ streak, isAlive, longestStreak }: Props) {
  const active = isAlive && streak > 0;

  return (
    <div className="rounded-xl bg-bg-surface border border-border-subtle p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className={`text-3xl leading-none ${active ? '' : 'grayscale opacity-40'}`} aria-hidden="true">
          🔥
        </span>
        <div>
          <p className={`text-2xl font-mono font-bold leading-none ${active ? 'text-accent-amber' : 'text-text-muted'}`}>
            {active ? streak : 0}
            <span className="text-sm font-normal ml-1 text-text-muted">day{streak !== 1 ? 's' : ''}</span>
          </p>
          <p className="text-[10px] label-mono text-text-muted mt-0.5">
            {active
              ? streak >= 7 ? `${streak}-day streak 🎉` : 'Current streak'
              : streak > 0 ? `Streak broken — was ${streak}` : 'No streak yet'}
          </p>
        </div>
      </div>

      {longestStreak > 0 && (
        <div className="text-right">
          <p className="text-xs font-mono text-text-muted">Best</p>
          <p className="text-sm font-mono text-text-secondary font-medium">{longestStreak}d</p>
        </div>
      )}
    </div>
  );
}
