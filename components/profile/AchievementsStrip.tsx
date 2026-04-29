import { ACHIEVEMENTS } from '@/lib/achievements';

export function AchievementsStrip({ unlocked }: { unlocked: Set<string> }) {
  return (
    <section className="rounded-xl bg-bg-surface border border-border-subtle p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs label-mono text-text-muted">Achievements</h2>
        <span className="text-text-muted text-[10px] label-mono">
          {unlocked.size} / {ACHIEVEMENTS.length}
        </span>
      </div>
      <ul className="grid grid-cols-4 gap-2">
        {ACHIEVEMENTS.map((a) => {
          const got = unlocked.has(a.id);
          return (
            <li
              key={a.id}
              title={got ? a.title : 'Locked'}
              className={[
                'aspect-square rounded-lg border flex flex-col items-center justify-center text-center p-1',
                got
                  ? 'bg-accent-amber/15 border-accent-amber/30 text-accent-amber'
                  : 'bg-bg-elevated border-border-subtle text-text-muted opacity-50',
              ].join(' ')}
            >
              <span className="text-xl" aria-hidden="true">{got ? '★' : '·'}</span>
              <span className="text-[9px] label-mono mt-1 leading-tight">{a.title}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
