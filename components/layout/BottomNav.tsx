'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: '⌂' },
  { href: '/explore',   label: 'Explore',   icon: '◎' },
  { href: '/trips',     label: 'Trips',     icon: '✈' },
  { href: '/profile',   label: 'Profile',   icon: '◈' },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Primary"
      className="fixed bottom-0 inset-x-0 z-40 border-t border-border-subtle bg-bg-surface/95 backdrop-blur"
    >
      <ul className="grid grid-cols-4 max-w-2xl mx-auto">
        {ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={[
                  'flex flex-col items-center justify-center py-3 gap-1 text-xs label-mono transition-colors',
                  active
                    ? 'text-accent-blue'
                    : 'text-text-muted hover:text-text-secondary',
                ].join(' ')}
                aria-current={active ? 'page' : undefined}
              >
                <span className="text-xl leading-none" aria-hidden="true">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
