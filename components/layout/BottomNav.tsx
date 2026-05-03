'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GiHouse, GiCompass, GiAirplane, GiCharacter } from 'react-icons/gi';

const ITEMS = [
  { href: '/dashboard', Icon: GiHouse,    label: 'Dashboard' },
  { href: '/explore',   Icon: GiCompass,  label: 'Explore' },
  { href: '/trips',     Icon: GiAirplane, label: 'Trips' },
  { href: '/profile',   Icon: GiCharacter,label: 'Profile' },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Primary"
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border-subtle bg-bg-surface/95 backdrop-blur"
    >
      <ul className="grid grid-cols-4 max-w-2xl mx-auto">
        {ITEMS.map(({ href, Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <li key={href}>
              <Link
                href={href}
                className={[
                  'flex flex-col items-center justify-center py-3 gap-1 text-xs label-mono transition-colors',
                  active ? 'text-accent-blue' : 'text-text-muted hover:text-text-secondary',
                ].join(' ')}
                aria-current={active ? 'page' : undefined}
              >
                <Icon className="text-2xl" aria-hidden="true" />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
