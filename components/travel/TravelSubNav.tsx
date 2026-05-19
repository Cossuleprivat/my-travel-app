'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { travelModule } from '@/modules/travel/manifest';

export function TravelSubNav() {
  const pathname = usePathname();
  const sections = travelModule.sections ?? [];

  function isActive(href: string) {
    if (href === '/travel') return pathname === '/travel';
    return pathname === href || pathname.startsWith(href + '/');
  }

  return (
    // top-[57px]: Sticky-Offset = Höhe der Jarvis-TopBar. Ändert sich die TopBar-Höhe, hier anpassen.
    <nav
      className="sticky top-[57px] z-20 -mx-4 px-4 py-2 border-b border-border-subtle backdrop-blur"
      style={{ background: 'rgba(9,14,22,0.92)' }}
      aria-label="Travel-Navigation"
    >
      <div className="flex gap-1">
        {sections.map((s) => {
          const active = isActive(s.href);
          return (
            <Link
              key={s.href}
              href={s.href}
              aria-current={active ? 'page' : undefined}
              className={[
                'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs label-mono transition-colors',
                active
                  ? 'bg-bg-elevated text-text-primary ring-1 ring-accent-blue/25'
                  : 'text-text-muted hover:text-text-secondary hover:bg-bg-elevated/50',
              ].join(' ')}
            >
              <span aria-hidden="true">{s.icon}</span>
              <span>{s.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
