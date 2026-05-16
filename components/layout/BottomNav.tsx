'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { ModuleSheet } from './ModuleSheet';

const NAV_ITEMS = [
  { href: '/hub',     label: 'Hub',    icon: '⬡' },
  { href: '/calendar', label: 'Kalender', icon: '📅' },
  // center slot is handled separately
  { href: '/tasks',   label: 'Tasks',  icon: '✅' },
  { href: '/profile', label: 'Profil', icon: '◈' },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <>
      <nav
        aria-label="Primary"
        className="fixed bottom-0 inset-x-0 z-40 border-t border-border-subtle bg-bg-surface/95 backdrop-blur"
      >
        <ul className="grid grid-cols-5 max-w-2xl mx-auto">
          {/* Slot 1: Hub */}
          <NavLink
            href="/hub"
            label="Hub"
            icon="⬡"
            active={pathname === '/hub' || pathname.startsWith('/hub/')}
          />

          {/* Slot 2: Kalender */}
          <NavLink
            href="/calendar"
            label="Kalender"
            icon="📅"
            active={pathname === '/calendar' || pathname.startsWith('/calendar/')}
          />

          {/* Slot 3: Center Apps button */}
          <li className="flex items-end justify-center pb-1">
            <button
              onClick={() => setSheetOpen(true)}
              aria-label="Apps öffnen"
              className={[
                'flex flex-col items-center justify-center gap-0.5',
                'w-14 h-14 rounded-full',
                'bg-accent-blue text-white shadow-lg shadow-accent-blue/30',
                '-translate-y-3',
                'hover:opacity-90 active:scale-95 transition-all',
              ].join(' ')}
            >
              <span className="text-2xl leading-none" aria-hidden="true">⊞</span>
              <span className="text-[9px] label-mono leading-none">Apps</span>
            </button>
          </li>

          {/* Slot 4: Tasks */}
          <NavLink
            href="/tasks"
            label="Tasks"
            icon="✅"
            active={pathname === '/tasks' || pathname.startsWith('/tasks/')}
          />

          {/* Slot 5: Profil */}
          <NavLink
            href="/profile"
            label="Profil"
            icon="◈"
            active={pathname === '/profile' || pathname.startsWith('/profile/')}
          />
        </ul>
      </nav>

      <ModuleSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />
    </>
  );
}

function NavLink({
  href,
  label,
  icon,
  active,
}: {
  href: string;
  label: string;
  icon: string;
  active: boolean;
}) {
  return (
    <li>
      <Link
        href={href}
        className={[
          'flex flex-col items-center justify-center py-3 gap-1 text-xs label-mono transition-colors',
          active
            ? 'text-accent-blue'
            : 'text-text-muted hover:text-text-secondary',
        ].join(' ')}
        aria-current={active ? 'page' : undefined}
      >
        <span className="text-xl leading-none" aria-hidden="true">{icon}</span>
        <span>{label}</span>
      </Link>
    </li>
  );
}
