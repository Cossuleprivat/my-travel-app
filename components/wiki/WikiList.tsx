'use client';
import Link from 'next/link';
import { useState } from 'react';
import type { Note } from '@/app/(app)/wiki/page';

const CAT_LABEL: Record<string, string> = {
  zeitlektur:    '📅',
  weltgeschichte:'🌍',
  literatur:     '📖',
  kunst:         '🎨',
  architektur:   '🏛️',
  musik:         '🎵',
  philosophie:   '🧠',
  allgemein:     '📋',
};

function excerpt(content: string, len = 80) {
  const clean = content.replace(/^#+ .+$/mg, '').replace(/---/g, '').replace(/\n+/g, ' ').trim();
  return clean.length > len ? clean.slice(0, len) + '…' : clean;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('de-DE', { day: 'numeric', month: 'short' });
}

export function WikiList({ notes, categories }: { notes: Note[]; categories: { id: string; label: string }[] }) {
  const [active, setActive] = useState('alle');
  const [search, setSearch] = useState('');

  const filtered = notes.filter((n) => {
    const matchCat = active === 'alle' || n.category === active;
    const q = search.toLowerCase();
    const matchSearch = !q || n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  const pinned = filtered.filter((n) => n.is_pinned);
  const rest = filtered.filter((n) => !n.is_pinned);

  return (
    <div className="space-y-4">
      {/* Search */}
      <input
        type="search"
        placeholder="Suchen…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded-xl bg-bg-surface border border-border-subtle px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-blue"
      />

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setActive(c.id)}
            className={[
              'shrink-0 px-3 py-1 rounded-full text-xs label-mono whitespace-nowrap transition-colors',
              active === c.id
                ? 'bg-accent-blue text-white'
                : 'bg-bg-surface border border-border-subtle text-text-muted',
            ].join(' ')}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Pinned */}
      {pinned.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-xs label-mono text-text-muted">📌 Angepinnt</h2>
          <NoteList notes={pinned} />
        </section>
      )}

      {/* Rest */}
      {rest.length > 0 && (
        <section className="space-y-2">
          {pinned.length > 0 && <h2 className="text-xs label-mono text-text-muted">Alle</h2>}
          <NoteList notes={rest} />
        </section>
      )}

      {filtered.length === 0 && (
        <p className="text-center text-text-muted text-sm py-8">Keine Notizen gefunden.</p>
      )}
    </div>
  );

  function NoteList({ notes: list }: { notes: Note[] }) {
    return (
      <div className="rounded-xl bg-bg-surface border border-border-subtle overflow-hidden divide-y divide-border-subtle">
        {list.map((note) => (
          <Link key={note.id} href={`/wiki/${note.id}`} className="block px-4 py-3 hover:bg-bg-elevated transition-colors">
            <div className="flex items-start gap-2">
              <span className="text-base shrink-0 mt-0.5">{CAT_LABEL[note.category] ?? '📋'}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-text-primary font-medium truncate">{note.title}</p>
                {note.lektion_zeitraum && (
                  <p className="text-xs text-accent-blue">{note.lektion_zeitraum}</p>
                )}
                <p className="text-xs text-text-muted mt-0.5 line-clamp-1">{excerpt(note.content)}</p>
              </div>
              <span className="text-xs text-text-muted shrink-0">{formatDate(note.updated_at)}</span>
            </div>
          </Link>
        ))}
      </div>
    );
  }
}
