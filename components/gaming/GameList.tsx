'use client';
import { useTransition } from 'react';
import { setGameStatus, assignSlot } from '@/lib/actions/gaming';

type Game = { id: string; title: string; platform: string | null; genre: string | null; played_with: string | null; notes: string | null; status: string };

const GENRE_EMOJI: Record<string, string> = {
  'RPG': '⚔️', 'Souls-like': '💀', 'Action-Adventure': '🗡️', 'Racing': '🏎️',
  'Fighting/Competitive': '🥊', 'Action-RPG': '🎯', 'RPG/Sport': '⛳', 'Horror-Action': '👻',
};

export function GameList({ title, games, variant }: { title: string; games: Game[]; variant: 'active' | 'pipeline' }) {
  const [pending, startTransition] = useTransition();

  return (
    <section className="space-y-2">
      <h2 className="text-xs label-mono text-text-muted">{title}</h2>
      <div className="rounded-xl bg-bg-surface border border-border-subtle overflow-hidden divide-y divide-border-subtle">
        {games.map((game) => (
          <div key={game.id} className="flex items-center gap-3 px-4 py-3">
            <span className="text-base shrink-0">{GENRE_EMOJI[game.genre ?? ''] ?? '🎮'}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-text-primary font-medium leading-tight">{game.title}</p>
              <p className="text-xs text-text-muted">
                {[game.platform, game.played_with !== 'Solo' ? game.played_with : null].filter(Boolean).join(' · ')}
                {game.notes && ` · ${game.notes}`}
              </p>
            </div>
            {variant === 'active' && (
              <button
                onClick={() => startTransition(() => setGameStatus(game.id, 'completed'))}
                disabled={pending}
                className="text-xs px-2 py-1 rounded-lg border border-accent-green/30 text-accent-green hover:bg-accent-green/10 transition-colors shrink-0"
              >
                ✓ Fertig
              </button>
            )}
            {variant === 'pipeline' && (
              <button
                onClick={() => startTransition(() => setGameStatus(game.id, 'active'))}
                disabled={pending}
                className="text-xs px-2 py-1 rounded-lg border border-accent-blue/30 text-accent-blue hover:bg-accent-blue/10 transition-colors shrink-0"
              >
                Start
              </button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
