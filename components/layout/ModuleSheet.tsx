'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MODULE_REGISTRY } from '@/modules/registry';

const TRAVEL_SUBROUTES = [
  { icon: '◎', name: 'Explore', href: '/explore' },
  { icon: '⊞', name: 'Trips', href: '/trips' },
  { icon: '✈', name: 'Dashboard', href: '/dashboard' },
];

interface ModuleSheetProps {
  open: boolean;
  onClose: () => void;
}

export function ModuleSheet({ open, onClose }: ModuleSheetProps) {
  const router = useRouter();
  const activeModules = MODULE_REGISTRY.filter((m) => m.status === 'active');

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  function navigate(href: string) {
    router.push(href);
    onClose();
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={[
          'fixed inset-0 z-50 bg-black/60 transition-opacity duration-300',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        ].join(' ')}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        className={[
          'fixed bottom-0 inset-x-0 z-50 bg-bg-surface border-t border-border-subtle rounded-t-2xl',
          'max-h-[70vh] overflow-y-auto transition-transform duration-300',
          open ? 'translate-y-0' : 'translate-y-full',
        ].join(' ')}
        role="dialog"
        aria-modal="true"
        aria-label="App modules"
      >
        {/* Header */}
        <div className="sticky top-0 bg-bg-surface border-b border-border-subtle px-4 py-3 flex items-center justify-between">
          <span className="label-mono text-text-muted">Apps</span>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary transition-colors p-1"
            aria-label="Close"
          >
            <span className="text-lg leading-none">✕</span>
          </button>
        </div>

        <div className="p-4 space-y-5">
          {/* Travel sub-routes section */}
          <div>
            <p className="label-mono text-text-muted mb-3">Travel</p>
            <div className="grid grid-cols-3 gap-3">
              {TRAVEL_SUBROUTES.map((route) => (
                <button
                  key={route.href}
                  onClick={() => navigate(route.href)}
                  className="flex flex-col items-center gap-2 rounded-xl bg-bg-elevated border border-border-subtle p-4 hover:bg-bg-surface transition-colors"
                >
                  <span className="text-2xl leading-none">{route.icon}</span>
                  <span className="text-xs text-text-secondary label-mono">{route.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* All active modules */}
          <div>
            <p className="label-mono text-text-muted mb-3">Module</p>
            <div className="grid grid-cols-3 gap-3">
              {activeModules.map((mod) => (
                <button
                  key={mod.id}
                  onClick={() => navigate(mod.href)}
                  className="flex flex-col items-center gap-2 rounded-xl bg-bg-elevated border border-border-subtle p-4 hover:bg-bg-surface transition-colors"
                >
                  <span className="text-2xl leading-none">{mod.icon}</span>
                  <span className="text-xs text-text-secondary label-mono text-center">{mod.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Safe area spacer */}
        <div className="h-4" />
      </div>
    </>
  );
}
