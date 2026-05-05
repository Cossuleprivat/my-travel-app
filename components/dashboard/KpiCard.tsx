import { ProgressRing } from '@/components/ui/ProgressRing';

type Tone = 'blue' | 'amber' | 'green' | 'purple';

const toneClasses: Record<Tone, string> = {
  blue:   'border-accent-blue/30 text-accent-blue',
  amber:  'border-accent-amber/30 text-accent-amber',
  green:  'border-accent-green/30 text-accent-green',
  purple: 'border-accent-purple/30 text-accent-purple',
};

const toneColors: Record<Tone, string> = {
  blue:   '#40a0d0',
  amber:  '#d48030',
  green:  '#40c070',
  purple: '#a060e0',
};

export function KpiCard({
  label, value, total, tone,
}: { label: string; value: number; total?: number; tone: Tone }) {
  const pct = total !== undefined && total > 0 ? (value / total) * 100 : 0;

  return (
    <div className={`rounded-xl bg-bg-surface border ${toneClasses[tone]} p-4 flex items-center gap-3`}>
      {total !== undefined && (
        <ProgressRing pct={pct} size={44} stroke={4} color={toneColors[tone]} />
      )}
      <div className="flex-1 min-w-0">
        <div className="text-xs label-mono text-text-muted">{label}</div>
        <div className="mt-0.5 font-mono text-2xl">
          {value}
          {total !== undefined && (
            <span className="text-text-muted text-sm"> / {total}</span>
          )}
        </div>
      </div>
    </div>
  );
}
