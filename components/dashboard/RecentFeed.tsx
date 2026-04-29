import type { RecentVisit } from '@/lib/data/queries';

const KIND_ICONS: Record<RecentVisit['kind'], string> = {
  continent: '🌐',
  country: '🏳',
  city: '◉',
  sight: '★',
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function RecentFeed({ items }: { items: RecentVisit[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl bg-bg-surface border border-border-subtle p-6 text-center text-text-muted text-sm">
        Nothing tracked yet — head to <span className="text-accent-blue">Explore</span> to begin.
      </div>
    );
  }
  return (
    <ul className="rounded-xl bg-bg-surface border border-border-subtle divide-y divide-border-subtle">
      {items.map((it) => (
        <li key={`${it.kind}-${it.id}`} className="flex items-center gap-3 p-3">
          <span className="text-xl" aria-hidden="true">{KIND_ICONS[it.kind]}</span>
          <div className="flex-1 min-w-0">
            <div className="text-text-primary text-sm truncate">{it.label}</div>
            {it.subLabel && (
              <div className="text-text-muted text-xs">{it.subLabel}</div>
            )}
          </div>
          <div className="text-right">
            <div className="text-accent-amber text-xs label-mono">+{it.xp} XP</div>
            <div className="text-text-muted text-[10px] label-mono">{formatDate(it.at)}</div>
          </div>
        </li>
      ))}
    </ul>
  );
}
