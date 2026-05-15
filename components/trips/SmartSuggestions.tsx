import type { Quest } from '@/lib/supabase/types';

const CATEGORY_EMOJI: Record<string, string> = {
  landmark:   '🏛',
  activity:   '🎯',
  restaurant: '🍽',
  hidden_gem: '💎',
};

type Props = {
  quests: Quest[];
  tripStopId: string;
};

export function SmartSuggestions({ quests, tripStopId }: Props) {
  if (quests.length === 0) return null;

  const top = quests
    .filter((q) => q.difficulty != null)
    .sort((a, b) => (a.difficulty ?? 5) - (b.difficulty ?? 5))
    .slice(0, 3);

  if (top.length === 0) return null;

  return (
    <div className="space-y-1.5">
      <p className="text-[10px] label-mono text-text-muted">Suggested</p>
      {top.map((q) => (
        <div
          key={q.id}
          className="flex items-start gap-2 rounded-lg bg-bg-elevated border border-border-subtle px-3 py-2"
        >
          <span className="text-base leading-none shrink-0 mt-0.5" aria-hidden="true">
            {CATEGORY_EMOJI[q.category ?? ''] ?? '📍'}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-text-secondary text-xs font-medium leading-tight">{q.title}</p>
            {q.estimated_minutes && (
              <p className="text-text-muted text-[10px] mt-0.5">~{q.estimated_minutes} min</p>
            )}
          </div>
          <span className="text-[10px] label-mono text-text-muted shrink-0">
            {'★'.repeat(q.difficulty ?? 1)}{'☆'.repeat(5 - (q.difficulty ?? 1))}
          </span>
        </div>
      ))}
    </div>
  );
}
