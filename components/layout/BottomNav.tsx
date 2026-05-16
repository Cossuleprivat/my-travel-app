'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Sidebar } from './Sidebar';

export function BottomNav() {
  const pathname = usePathname();
  const [navOpen, setNavOpen] = useState(false);

  return (
    <>
      <nav
        aria-label="Primary"
        className="fixed bottom-0 inset-x-0 z-40 border-t border-border-subtle bg-bg-surface/90 backdrop-blur-xl"
      >
        <ul className="grid grid-cols-5 max-w-2xl mx-auto px-2">
          <NavLink
            href="/hub"
            label="Hub"
            icon="⬡"
            active={pathname === '/hub' || pathname.startsWith('/hub/')}
          />
          <NavLink
            href="/calendar"
            label="Kalender"
            icon="📅"
            active={pathname === '/calendar' || pathname.startsWith('/calendar/')}
          />

          <li className="flex items-end justify-center pb-1.5">
            <button
              onClick={() => setNavOpen(true)}
              aria-label="Menü öffnen"
              className={[
                'flex flex-col items-center justify-center gap-0.5',
                'w-14 h-14 rounded-2xl',
                'bg-accent-blue text-white',
                'shadow-lg shadow-accent-blue/40',
                '-translate-y-3',
                'hover:shadow-accent-blue/60 hover:-translate-y-3.5',
                'active:scale-95 transition-all duration-200',
              ].join(' ')}
            >
              <span className="text-xl leading-none" aria-hidden="true">☰</span>
              <span className="text-[9px] label-mono leading-none">Menü</span>
            </button>
          </li>

          <NavLink
            href="/tasks"
            label="Tasks"
            icon="✅"
            active={pathname === '/tasks' || pathname.startsWith('/tasks/')}
          />
          <NavLink
            href="/profile"
            label="Profil"
            icon="◈"
            active={pathname === '/profile' || pathname.startsWith('/profile/')}
          />
        </ul>
      </nav>

      <Sidebar open={navOpen} onClose={() => setNavOpen(false)} />
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
          'relative flex flex-col items-center justify-center py-3 gap-1 text-xs label-mono transition-colors duration-200',
          active ? 'text-accent-blue' : 'text-text-muted hover:text-text-secondary',
        ].join(' ')}
        aria-current={active ? 'page' : undefined}
      >
        {active && (
          <span className="absolute top-0 h-0.5 w-8 rounded-full bg-accent-blue" />
        )}
        <span
          className={[
            'text-xl leading-none transition-transform duration-200',
            active ? 'scale-110' : '',
          ].join(' ')}
          aria-hidden="true"
        >
          {icon}
        </span>
        <span>{label}</span>
      </Link>
    </li>
  );
}
