'use client';
import { useTransition } from 'react';
import { setGameStatus } from '@/lib/actions/gaming';

type Game = { id: string; title: string; platform: string | null; status: string; slot_number: number | null; notes: string | null; completed_at: string | null };

export function GameSlots({ slots, activeGames }: { slots: (Game | null)[]; activeGames: Game[] }) {
  const [pending, startTransition] = useTransition();

  const markDone = (gameId: string, slot: number) => {
    startTransition(() => setGameStatus(gameId, 'completed', slot));
  };

  return (
    <section className="space-y-2">
      <h2 className="text-xs label-mono text-text-muted">2026 Game-Slots</h2>
      <div className="space-y-2">
        {slots.map((game, idx) => {
          const slotNum = idx + 1;
          if (!game) {
            return (
              <div key={slotNum} className="rounded-xl bg-bg-surface border border-dashed border-border-subtle px-4 py-3 flex items-center gap-3 opacity-50">
                <span className="w-6 h-6 rounded-full bg-bg-elevated text-text-muted text-xs label-mono flex items-center justify-center shrink-0">{slotNum}</span>
                <p className="text-sm text-text-muted">Slot offen — wähle aus Angefangen-Liste</p>
              </div>
            );
          }

          const statusColor = game.status === 'completed' ? 'bg-accent-green/20 border-accent-green/30' : 'bg-bg-surface border-border-subtle';
          const numColor = game.status === 'completed' ? 'bg-accent-green/20 text-accent-green' : game.status === 'active' ? 'bg-accent-blue/20 text-accent-blue' : 'bg-bg-elevated text-text-muted';

          return (
            <div key={slotNum} className={`rounded-xl border px-4 py-3 flex items-center gap-3 ${statusColor}`}>
              <span className={`w-6 h-6 rounded-full text-xs label-mono flex items-center justify-center shrink-0 ${numColor}`}>{slotNum}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-text-primary font-medium leading-tight">{game.title}</p>
                {game.platform && <p className="text-xs text-text-muted">{game.platform}</p>}
              </div>
              <div className="shrink-0 flex items-center gap-2">
                {game.status === 'completed' ? (
                  <span className="text-accent-green text-sm">✅</span>
                ) : game.status === 'active' ? (
                  <button
                    onClick={() => markDone(game.id, slotNum)}
                    disabled={pending}
                    className="text-xs px-2 py-1 rounded-lg border border-accent-green/30 text-accent-green hover:bg-accent-green/10 transition-colors"
                  >
                    Fertig ✓
                  </button>
                ) : (
                  <span className="text-text-muted text-sm">🔴</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
