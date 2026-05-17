'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MODULE_REGISTRY } from '@/modules/registry';

const COLOR_TILE: Record<string, string> = {
  blue:   'bg-[#40a0d0]/15 text-[#40a0d0]',
  green:  'bg-[#40c070]/15 text-[#40c070]',
  amber:  'bg-[#d48030]/15 text-[#d48030]',
  purple: 'bg-[#a060e0]/15 text-[#a060e0]',
  indigo: 'bg-[#a060e0]/15 text-[#a060e0]',
  red:    'bg-red-400/15 text-red-400',
};

const CORE = [
  { href: '/dashboard', name: 'Jarvis Hub',  icon: '⬡',  color: 'blue'   },
  { href: '/jarvis',    name: 'Jarvis Chat', icon: 'J',   color: 'blue', mono: true },
  { href: '/calendar',  name: 'Kalender',    icon: '📅', color: 'amber'  },
  { href: '/profile',   name: 'Profil',      icon: '◈',  color: 'purple' },
];

const TRAVEL = [
  { href: '/explore', name: 'Erkunden',  icon: '✈', color: 'blue' },
  { href: '/trips',   name: 'Trips',     icon: '◎', color: 'blue' },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const lifeModules = MODULE_REGISTRY.filter(
    (m) => m.status === 'active' && m.id !== 'travel',
  );

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  function Item({
    href, name, icon, color, mono,
  }: {
    href: string; name: string; icon: string; color: string; mono?: boolean;
  }) {
    const active = pathname === href || (href !== '/' && pathname.startsWith(href + '/'));
    const isJ = mono && icon === 'J';
    return (
      <Link
        href={href}
        onClick={onClose}
        className={[
          'flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all active:scale-[0.98]',
          active
            ? 'bg-bg-elevated ring-1 ring-[#40a0d0]/25'
            : 'hover:bg-bg-elevated/50',
        ].join(' ')}
      >
        {isJ ? (
          <span
            className="flex h-9 w-9 items-center justify-center rounded-lg shrink-0 font-mono font-bold text-sm border border-[#40a0d0]/30 text-[#40a0d0]"
            style={{ background: 'radial-gradient(circle, #0d2035 0%, #060c14 100%)' }}
          >
            J
          </span>
        ) : (
          <span
            className={[
              'flex h-9 w-9 items-center justify-center rounded-lg text-lg shrink-0',
              COLOR_TILE[color] ?? COLOR_TILE.blue,
            ].join(' ')}
          >
            {icon}
          </span>
        )}
        <span
          className={[
            'text-sm flex-1 truncate',
            active ? 'text-text-primary font-medium' : 'text-text-secondary',
          ].join(' ')}
        >
          {name}
        </span>
        {active && (
          <span className="h-1.5 w-1.5 rounded-full bg-[#40a0d0] shrink-0" />
        )}
      </Link>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={[
          'fixed inset-0 z-50 bg-black/65 backdrop-blur-sm transition-opacity duration-300',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        ].join(' ')}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className={[
          'fixed inset-y-0 left-0 z-50 w-[82%] max-w-[300px]',
          'flex flex-col',
          'border-r border-border-subtle',
          'transition-transform duration-300 ease-out',
          'shadow-2xl shadow-black/60',
          open ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
        style={{ background: 'rgba(10,17,27,0.98)' }}
        role="dialog"
        aria-modal="true"
        aria-label="Jarvis Navigation"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-5 pb-4 border-b border-border-subtle">
          <div className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#40a0d0]/30"
              style={{ background: 'radial-gradient(circle, #0d2035 0%, #060c14 100%)', boxShadow: '0 0 12px rgba(64,160,208,0.1)' }}
            >
              <span className="font-mono text-sm font-bold text-[#40a0d0]">J</span>
            </div>
            <div>
              <p className="text-text-primary font-mono text-sm uppercase tracking-widest leading-tight">Jarvis</p>
              <p className="text-[#40a0d0]/40 text-[10px] font-mono tracking-wider">● Persönlicher Assistent</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Schließen"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Nav */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {/* Core */}
          <nav className="space-y-0.5">
            <p className="px-3 pb-2 text-[10px] font-mono tracking-[0.2em] uppercase text-text-muted">
              Übersicht
            </p>
            {CORE.map((i) => <Item key={i.href} {...i} />)}
          </nav>

          {/* Life modules */}
          <nav className="space-y-0.5">
            <p className="px-3 pb-2 text-[10px] font-mono tracking-[0.2em] uppercase text-text-muted">
              Bereiche
            </p>
            {lifeModules.map((m) => (
              <Item key={m.id} href={m.href} name={m.name} icon={m.icon} color={m.color} />
            ))}
          </nav>

          {/* Travel sub-nav */}
          <nav className="space-y-0.5">
            <p className="px-3 pb-2 text-[10px] font-mono tracking-[0.2em] uppercase text-text-muted">
              Travel
            </p>
            {TRAVEL.map((i) => <Item key={i.href} {...i} />)}
          </nav>
        </div>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-border-subtle flex items-center justify-between">
          <p className="text-[10px] font-mono text-text-muted">
            {new Date().toLocaleDateString('de-DE', {
              weekday: 'short', day: 'numeric', month: 'short',
            })}
          </p>
          <span className="text-[10px] font-mono text-[#40a0d0]/30 tracking-widest">v2.4</span>
        </div>
      </aside>
    </>
  );
}
