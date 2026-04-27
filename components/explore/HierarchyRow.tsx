import Link from 'next/link';

type Status = 'visited' | 'partial' | 'untouched';

export function HierarchyRow({
  href,
  icon,
  title,
  subtitle,
  status,
  badgeText,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  status: Status;
  badgeText?: string;
}) {
  const badge =
    status === 'visited'
      ? { label: badgeText ?? '✓ Visited', cls: 'bg-accent-green/15 text-accent-green' }
      : status === 'partial'
        ? { label: badgeText ?? '·', cls: 'bg-accent-amber/15 text-accent-amber' }
        : { label: badgeText ?? 'New', cls: 'bg-accent-blue/15 text-accent-blue' };

  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-lg bg-bg-surface border border-border-subtle px-4 py-3 hover:bg-bg-elevated hover:border-border-interactive transition-colors"
    >
      <div className="text-2xl w-8 text-center" aria-hidden="true">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="text-text-primary text-sm font-medium truncate">{title}</div>
        {subtitle && <div className="text-text-muted text-xs">{subtitle}</div>}
      </div>
      <span className={`px-2 py-0.5 rounded text-xs label-mono ${badge.cls}`}>
        {badge.label}
      </span>
      <span className="text-text-muted" aria-hidden="true">›</span>
    </Link>
  );
}
