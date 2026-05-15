import type { RouteLeg } from '@/lib/trips/route';

export function LegConnector({ leg }: { leg: RouteLeg }) {
  return (
    <div className="flex items-center gap-2 px-4 py-1">
      {/* Vertical dotted line */}
      <div className="flex flex-col items-center w-6 shrink-0">
        <div className="w-px flex-1 border-l-2 border-dashed border-border-subtle" style={{ minHeight: 20 }} />
      </div>

      <div className="flex items-center gap-2 text-[11px] label-mono text-text-muted bg-bg-elevated border border-border-subtle rounded-full px-3 py-1">
        <span aria-hidden="true">{leg.modeEmoji}</span>
        <span>{leg.modeLabel}</span>
        <span className="text-border-interactive">·</span>
        <span>{leg.distanceKm.toLocaleString()} km</span>
        <span className="text-border-interactive">·</span>
        <span>{leg.durationLabel}</span>
      </div>
    </div>
  );
}
