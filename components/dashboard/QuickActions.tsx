import Link from 'next/link';

const ACTIONS = [
  { href: '/explore',    icon: '◎', label: 'Explore',     desc: 'Find cities' },
  { href: '/trips',      icon: '✈', label: 'Plan Trip',   desc: 'New itinerary' },
  { href: '/onboarding', icon: '✎', label: 'Edit Profile', desc: 'Update info' },
] as const;

export function QuickActions() {
  return (
    <section>
      <h2 className="text-xs label-mono text-text-muted mb-2">Quick Actions</h2>
      <div className="grid grid-cols-3 gap-2">
        {ACTIONS.map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className="flex flex-col items-center gap-1.5 rounded-xl bg-bg-surface border border-border-subtle py-4 hover:border-accent-blue/40 hover:bg-bg-elevated transition-colors text-center"
          >
            <span className="text-2xl leading-none text-accent-blue" aria-hidden="true">{a.icon}</span>
            <span className="text-xs font-sans text-text-primary">{a.label}</span>
            <span className="text-xs label-mono text-text-muted">{a.desc}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
