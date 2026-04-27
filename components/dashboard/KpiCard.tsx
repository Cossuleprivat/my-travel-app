type Tone = 'blue' | 'amber' | 'green' | 'purple';

const toneClasses: Record<Tone, string> = {
  blue:   'border-accent-blue/30 text-accent-blue',
  amber:  'border-accent-amber/30 text-accent-amber',
  green:  'border-accent-green/30 text-accent-green',
  purple: 'border-accent-purple/30 text-accent-purple',
};

export function KpiCard({
  label, value, total, tone,
}: { label: string; value: number; total?: number; tone: Tone }) {
  return (
    <div className={`rounded-xl bg-bg-surface border ${toneClasses[tone]} p-4`}>
      <div className="text-xs label-mono text-text-muted">{label}</div>
      <div className="mt-1 font-mono text-3xl">
        {value}
        {total !== undefined && (
          <span className="text-text-muted text-base"> / {total}</span>
        )}
      </div>
    </div>
  );
}
