'use client';
import { useState } from 'react';
import { LAUFPLAN_2026 } from '@/lib/sport/laufplan';

export function LaufplanTable({ currentWeek }: { currentWeek: number }) {
  const [open, setOpen] = useState(false);

  return (
    <section className="space-y-2">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between text-xs label-mono text-text-muted hover:text-text-secondary transition-colors"
      >
        <span>Laufplan W22–W43</span>
        <span>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="rounded-xl bg-bg-surface border border-border-subtle overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border-subtle">
                  <th className="text-left px-3 py-2 label-mono text-text-muted font-normal">Woche</th>
                  <th className="text-left px-3 py-2 label-mono text-text-muted font-normal">Datum</th>
                  <th className="text-right px-3 py-2 label-mono text-text-muted font-normal">km</th>
                  <th className="text-left px-3 py-2 label-mono text-text-muted font-normal">Einheiten</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {LAUFPLAN_2026.map((w) => {
                  const isCurrent = w.week === currentWeek;
                  const isPast = w.week < currentWeek;
                  return (
                    <tr
                      key={w.week}
                      className={
                        w.isRace
                          ? 'bg-accent-blue/10'
                          : isCurrent
                          ? 'bg-accent-green/10'
                          : isPast
                          ? 'opacity-40'
                          : ''
                      }
                    >
                      <td className="px-3 py-2 label-mono font-medium">
                        {w.weekStr}
                        {isCurrent && <span className="ml-1 text-accent-green">←</span>}
                      </td>
                      <td className="px-3 py-2 text-text-muted">{w.dates}</td>
                      <td className="px-3 py-2 text-right font-medium text-text-primary">{w.km}</td>
                      <td className="px-3 py-2 text-text-secondary">{w.units}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
