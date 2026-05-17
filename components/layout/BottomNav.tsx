'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const ITEMS = [
  { href: '/dashboard', label: 'Hub',    icon: '⬡', activeColor: '#40a0d0' },
  { href: '/explore',   label: 'Reisen', icon: '✈', activeColor: '#40a0d0' },
  { href: '/trips',     label: 'Trips',  icon: '◎', activeColor: '#40c070' },
  { href: '/jarvis',    label: 'Jarvis', icon: 'J', activeColor: '#40a0d0', mono: true },
  { href: '/profile',   label: 'Profil', icon: '◈', activeColor: '#a060e0' },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Hauptnavigation"
      className="fixed bottom-0 inset-x-0 z-40 border-t border-border-subtle backdrop-blur"
      style={{ background: 'rgba(9,14,22,0.96)' }}
    >
      <ul className="grid grid-cols-5 max-w-2xl mx-auto">
        {ITEMS.map((item) => {
          const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href + '/'));
          const isJarvis = item.href === '/jarvis';
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className="relative flex flex-col items-center justify-center py-3 gap-0.5 transition-colors"
                aria-current={active ? 'page' : undefined}
                style={{ color: active ? item.activeColor : 'rgba(120,146,168,0.6)' }}
              >
                <span
                  className={[
                    'flex items-center justify-center leading-none',
                    isJarvis ? 'h-7 w-7 rounded-full border font-mono font-bold text-sm' : 'text-xl',
                  ].join(' ')}
                  style={isJarvis ? {
                    borderColor: active ? 'rgba(64,160,208,0.6)' : 'rgba(64,160,208,0.2)',
                    background:  active ? 'rgba(64,160,208,0.1)' : 'transparent',
                    boxShadow:   active ? '0 0 8px rgba(64,160,208,0.2)' : 'none',
                    color:       active ? '#40a0d0' : 'rgba(64,160,208,0.35)',
                  } : {}}
                  aria-hidden="true"
                >
                  {item.icon}
                </span>
                <span className="text-[9px] font-mono tracking-wider uppercase">
                  {item.label}
                </span>
                {active && (
                  <span
                    className="absolute bottom-0 h-px w-8 rounded-full"
                    style={{ background: item.activeColor, opacity: 0.6 }}
                  />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
