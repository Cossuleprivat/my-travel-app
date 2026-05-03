import { GiWorld, GiFlagObjective, GiModernCity, GiEyeTarget } from 'react-icons/gi';
import type { IconType } from 'react-icons';

type Tone = 'blue' | 'amber' | 'green' | 'purple';

const TONE_CONFIG: Record<Tone, { border: string; text: string; glow: string; Icon: IconType }> = {
  blue:   { border: 'border-accent-blue/40',   text: 'text-accent-blue',   glow: 'hover:shadow-glow-blue',   Icon: GiWorld        },
  amber:  { border: 'border-accent-amber/40',  text: 'text-accent-amber',  glow: 'hover:shadow-glow-amber',  Icon: GiFlagObjective },
  green:  { border: 'border-accent-green/40',  text: 'text-accent-green',  glow: 'hover:shadow-glow-green',  Icon: GiModernCity   },
  purple: { border: 'border-accent-purple/40', text: 'text-accent-purple', glow: 'hover:shadow-glow-purple', Icon: GiEyeTarget    },
};

export function KpiCard({
  label, value, total, tone,
}: { label: string; value: number; total?: number; tone: Tone }) {
  const { border, text, glow, Icon } = TONE_CONFIG[tone];
  return (
    <div className={`rounded-2xl bg-bg-surface border ${border} p-4 lg:p-6 transition-shadow duration-300 ${glow}`}>
      <div className="flex items-start justify-between">
        <span className="text-xs label-mono text-text-muted uppercase tracking-wider">{label}</span>
        <Icon className={`text-2xl ${text} opacity-70`} aria-hidden="true" />
      </div>
      <div className={`mt-2 font-mono text-4xl lg:text-5xl font-bold ${text}`}>
        {value}
        {total !== undefined && (
          <span className="text-text-muted text-lg lg:text-xl font-normal"> / {total}</span>
        )}
      </div>
    </div>
  );
}
