import Link from 'next/link';
import type { TripWithStopCount } from '@/lib/data/queries';

const STATUS_LABEL: Record<string, string> = {
  draft: 'Draft',
  planned: 'Planned',
  in_progress: 'In Progress',
  completed: 'Done',
  archived: 'Archived',
};

const STATUS_COLOR: Record<string, string> = {
  draft: 'text-text-muted border-border-subtle',
  planned: 'text-accent-blue border-accent-blue/30',
  in_progress: 'text-accent-amber border-accent-amber/30',
  completed: 'text-accent-green border-accent-green/30',
  archived: 'text-text-muted border-border-subtle',
};

function formatDate(d: string | null) {
  if (!d) return null;
  return new Date(d).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export function TripCard({ trip }: { trip: TripWithStopCount }) {
  const from = formatDate(trip.start_date);
  const to = formatDate(trip.end_date);
  const dateStr = from && to ? `${from} – ${to}` : from ?? to ?? null;

  return (
    <Link
      href={`/travel/trips/${trip.id}`}
      className="block rounded-xl bg-bg-surface border border-border-subtle p-4 hover:border-accent-blue/40 hover:bg-bg-elevated transition-colors"
    >
      <div className="flex items-start justify-between gap-2">
        <h2 className="text-text-primary font-sans text-base leading-tight">{trip.title}</h2>
        <span className={`text-xs label-mono border rounded px-2 py-0.5 shrink-0 ${STATUS_COLOR[trip.status] ?? 'text-text-muted border-border-subtle'}`}>
          {STATUS_LABEL[trip.status] ?? trip.status}
        </span>
      </div>
      {trip.description && (
        <p className="text-text-secondary text-sm mt-1 line-clamp-2">{trip.description}</p>
      )}
      <div className="flex items-center gap-3 mt-3 text-xs text-text-muted label-mono">
        {dateStr && <span>{dateStr}</span>}
        <span>{trip.stopCount} {trip.stopCount === 1 ? 'stop' : 'stops'}</span>
      </div>
    </Link>
  );
}
