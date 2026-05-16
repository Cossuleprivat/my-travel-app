'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MODULE_REGISTRY } from '@/modules/registry';

const COLOR_TILE: Record<string, string> = {
  blue: 'bg-accent-blue/15 text-accent-blue',
  green: 'bg-accent-green/15 text-accent-green',
  amber: 'bg-accent-amber/15 text-accent-amber',
  purple: 'bg-accent-purple/15 text-accent-purple',
  indigo: 'bg-accent-purple/15 text-accent-purple',
  red: 'bg-red-400/15 text-red-400',
};

const OVERVIEW = [
  { href: '/hub', name: 'Dashboard', icon: '⬡', color: 'blue' },
  { href: '/calendar', name: 'Kalender', icon: '📅', color: 'amber' },
  { href: '/profile', name: 'Profil', icon: '◈', color: 'purple' },
];

const TRAVEL = [
  { href: '/dashboard', name: 'Travel Dashboard', icon: '✈', color: 'blue' },
  { href: '/explore', name: 'Explore', icon: '◎', color: 'blue' },
  { href: '/trips', name: 'Trips', icon: '⊞', color: 'blue' },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const modules = MODULE_REGISTRY.filter((m) => m.status === 'active' && m.id !== 'travel');

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  function Item({
    href,
    name,
    icon,
    color,
  }: {
    href: string;
    name: string;
    icon: string;
    color: string;
  }) {
    const active = pathname === href || pathname.startsWith(href + '/');
    return (
      <Link
        href={href}
        onClick={onClose}
        className={[
          'flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all',
          active
            ? 'bg-bg-elevated ring-1 ring-border-interactive'
            : 'hover:bg-bg-elevated/60 active:scale-[0.98]',
        ].join(' ')}
      >
        <span
          className={[
            'flex h-9 w-9 items-center justify-center rounded-lg text-lg shrink-0',
            COLOR_TILE[color] ?? COLOR_TILE.blue,
          ].join(' ')}
        >
          {icon}
        </span>
        <span
          className={[
            'text-sm flex-1 truncate',
            active ? 'text-text-primary font-medium' : 'text-text-secondary',
          ].join(' ')}
        >
          {name}
        </span>
        {active && <span className="h-1.5 w-1.5 rounded-full bg-accent-blue shrink-0" />}
      </Link>
    );
  }

  return (
    <>
      <div
        className={[
          'fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        ].join(' ')}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={[
          'fixed inset-y-0 left-0 z-50 w-[82%] max-w-xs',
          'bg-bg-surface border-r border-border-subtle',
          'flex flex-col transition-transform duration-300 ease-out',
          'shadow-2xl shadow-black/50',
          open ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-6 pb-4 border-b border-border-subtle">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-blue/15 ring-1 ring-accent-blue/30">
              <span className="font-mono text-sm font-bold text-accent-blue">LO</span>
            </div>
            <div>
              <p className="text-text-primary font-semibold leading-tight">LiveOS</p>
              <p className="text-text-muted text-[11px] label-mono">Life Operating System</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Schließen"
            className="text-text-muted hover:text-text-primary transition-colors p-1"
          >
            <span className="text-xl leading-none">✕</span>
          </button>
        </div>

        {/* Scrollable nav */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          <nav className="space-y-1">
            <p className="px-3 pb-1 text-[11px] label-mono text-text-muted">Übersicht</p>
            {OVERVIEW.map((i) => (
              <Item key={i.href} {...i} />
            ))}
          </nav>

          <nav className="space-y-1">
            <p className="px-3 pb-1 text-[11px] label-mono text-text-muted">Bereiche</p>
            {modules.map((m) => (
              <Item
                key={m.id}
                href={m.href}
                name={m.name}
                icon={m.icon}
                color={m.color}
              />
            ))}
          </nav>

          <nav className="space-y-1">
            <p className="px-3 pb-1 text-[11px] label-mono text-text-muted">Travel</p>
            {TRAVEL.map((i) => (
              <Item key={i.href} {...i} />
            ))}
          </nav>
        </div>

        <div className="px-5 py-4 border-t border-border-subtle">
          <p className="text-[11px] text-text-muted">
            {new Date().toLocaleDateString('de-DE', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </p>
        </div>
      </aside>
    </>
  );
}
