'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GiHouse, GiCompass, GiAirplane, GiCharacter, GiExitDoor } from 'react-icons/gi';
import { SignOutButton } from '@/components/auth/SignOutButton';

const NAV_ITEMS = [
  { href: '/dashboard', Icon: GiHouse,    label: 'Dashboard' },
  { href: '/explore',   Icon: GiCompass,  label: 'Explore' },
  { href: '/trips',     Icon: GiAirplane, label: 'Trips' },
  { href: '/profile',   Icon: GiCharacter,label: 'Profile' },
] as const;

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-full w-16 z-50 bg-bg-surface/90 backdrop-blur-sm border-r border-border-subtle">
      {/* Logo */}
      <div className="flex items-center justify-center h-16 border-b border-border-subtle flex-shrink-0">
        <Link href="/dashboard" aria-label="Travel Scorer — Dashboard">
          <div className="h-9 w-9 rounded-xl bg-accent-blue flex items-center justify-center shadow-glow-sm-blue hover:shadow-glow-blue transition-shadow">
            <span className="font-mono text-xs font-bold text-bg-base">TS</span>
          </div>
        </Link>
      </div>

      {/* Nav items */}
      <nav className="flex flex-col items-center gap-1 pt-4 flex-1" aria-label="App navigation">
        {NAV_ITEMS.map(({ href, Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              title={label}
              className={[
                'relative flex items-center justify-center w-11 h-11 rounded-xl text-2xl transition-all duration-200',
                active
                  ? 'bg-bg-elevated text-accent-blue shadow-glow-sm-blue'
                  : 'text-text-muted hover:text-text-secondary hover:bg-bg-elevated',
              ].join(' ')}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-accent-blue rounded-r" />
              )}
              <Icon />
            </Link>
          );
        })}
      </nav>

      {/* Sign out */}
      <div className="flex items-center justify-center pb-4">
        <SignOutButton compact />
      </div>
    </aside>
  );
}
