type Props = {
  pct: number;       // 0-100
  size?: number;     // px diameter, default 64
  stroke?: number;   // stroke width, default 5
  color?: string;    // tailwind color or CSS color
  label?: string;    // centre label
  sublabel?: string; // small text below label
};

export function ProgressRing({
  pct,
  size = 64,
  stroke = 5,
  color = '#40a0d0',
  label,
  sublabel,
}: Props) {
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (Math.min(100, Math.max(0, pct)) / 100) * circ;
  const cx = size / 2;

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={cx} cy={cx} r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-bg-elevated"
        />
        <circle
          cx={cx} cy={cx} r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      {label && (
        <div className="text-center -mt-1">
          <div className="text-text-primary text-xs font-sans">{label}</div>
          {sublabel && <div className="text-text-muted text-xs label-mono">{sublabel}</div>}
        </div>
      )}
    </div>
  );
}
