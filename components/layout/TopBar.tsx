'use client';

import { usePathname } from 'next/navigation';
import { MODULE_REGISTRY } from '@/modules/registry';

const ROUTE_LABELS: Record<string, { label: string; icon: string }> = {
  '/dashboard':  { label: 'Hub',           icon: '⬡' },
  '/jarvis':     { label: 'Jarvis',        icon: 'J' },
  '/explore':    { label: 'Erkunden',      icon: '✈' },
  '/trips':      { label: 'Trips',         icon: '◎' },
  '/profile':    { label: 'Profil',        icon: '◈' },
  '/calendar':   { label: 'Kalender',      icon: '📅' },
  '/tasks':      { label: 'Tasks',         icon: '✅' },
  '/sport':      { label: 'Sport',         icon: '🏃' },
  '/gaming':     { label: 'Gaming',        icon: '🎮' },
  '/reading':    { label: 'Lesen',         icon: '📚' },
  '/finance':    { label: 'Finanzen',      icon: '💰' },
  '/wedding':    { label: 'Hochzeit',      icon: '💍' },
  '/goals':      { label: 'Jahresplan',    icon: '🎯' },
  '/wiki':       { label: 'Wissensbase',   icon: '📖' },
};

function getPageMeta(pathname: string) {
  // Exact match first
  if (ROUTE_LABELS[pathname]) return ROUTE_LABELS[pathname];
  // Prefix match
  for (const [route, meta] of Object.entries(ROUTE_LABELS)) {
    if (route !== '/' && pathname.startsWith(route + '/')) return meta;
  }
  // Check module registry
  const mod = MODULE_REGISTRY.find(
    (m) => pathname === m.href || pathname.startsWith(m.href + '/'),
  );
  if (mod) return { label: mod.name, icon: mod.icon };
  return { label: 'Jarvis', icon: 'J' };
}

interface TopBarProps {
  onMenuOpen: () => void;
}

export function TopBar({ onMenuOpen }: TopBarProps) {
  const pathname = usePathname();
  const { label, icon } = getPageMeta(pathname);
  const isJarvis = icon === 'J';

  return (
    <header
      className="sticky top-0 z-30 flex items-center gap-3 px-4 py-3 border-b border-border-subtle backdrop-blur"
      style={{ background: 'rgba(9,14,22,0.92)' }}
    >
      {/* Hamburger */}
      <button
        type="button"
        onClick={onMenuOpen}
        aria-label="Menü öffnen"
        className="flex h-9 w-9 items-center justify-center rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors shrink-0"
      >
        <svg width="18" height="14" viewBox="0 0 18 14" fill="none" aria-hidden="true">
          <rect y="0"  width="18" height="1.8" rx="0.9" fill="currentColor"/>
          <rect y="6"  width="12" height="1.8" rx="0.9" fill="currentColor"/>
          <rect y="12" width="18" height="1.8" rx="0.9" fill="currentColor"/>
        </svg>
      </button>

      {/* Current page */}
      <div className="flex items-center gap-2 min-w-0">
        <span
          className={[
            'shrink-0 flex items-center justify-center',
            isJarvis
              ? 'h-6 w-6 rounded-full border border-[#40a0d0]/50 font-mono text-xs font-bold text-[#40a0d0]'
              : 'text-base leading-none',
          ].join(' ')}
          style={isJarvis ? { background: 'radial-gradient(circle, #0d2035 0%, #060c14 100%)' } : {}}
        >
          {icon}
        </span>
        <span className="font-mono text-sm uppercase tracking-widest text-text-primary truncate">
          {label}
        </span>
      </div>

      {/* Jarvis status dot */}
      <div className="ml-auto flex items-center gap-1.5 shrink-0">
        <span className="h-1.5 w-1.5 rounded-full bg-[#40a0d0]/60 animate-pulse" />
        <span className="font-mono text-[9px] tracking-widest text-[#40a0d0]/40 uppercase">
          Online
        </span>
      </div>
    </header>
  );
}
