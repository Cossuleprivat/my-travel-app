'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { search, type SearchResult } from '@/lib/actions/search';

export function SearchBar() {
  const [q, setQ] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [pending, start] = useTransition();

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setQ(value);
    start(async () => {
      setResults(await search(value));
    });
  }

  return (
    <div className="relative mb-4">
      <input
        type="search"
        value={q}
        onChange={onChange}
        placeholder="Search continents, countries, cities…"
        className="w-full rounded-lg bg-bg-elevated px-4 py-3 text-sm text-text-primary placeholder-text-muted border border-border-subtle focus:border-border-interactive focus:outline-none"
      />
      {q.length >= 2 && (
        <ul className="absolute z-30 left-0 right-0 mt-1 max-h-80 overflow-auto rounded-lg bg-bg-surface border border-border-subtle shadow-lg">
          {pending && <li className="p-3 text-sm text-text-muted label-mono">searching…</li>}
          {!pending && results.length === 0 && (
            <li className="p-3 text-sm text-text-muted">No matches.</li>
          )}
          {results.map((r) => {
            const href =
              r.kind === 'continent' ? `/travel/explore/${r.slug}` :
              r.kind === 'country'   ? `/travel/explore/${r.continentSlug}/${r.slug}` :
              `/travel/explore/${r.continentSlug}/${r.countrySlug}/${r.slug}`;
            const subtitle =
              r.kind === 'continent' ? 'Continent' :
              r.kind === 'country'   ? 'Country' :
              `${r.countryName}`;
            const flag =
              r.kind === 'continent' ? r.emoji :
              r.kind === 'country'   ? r.flag :
              null;
            return (
              <li key={`${r.kind}-${r.id}`}>
                <Link
                  href={href}
                  onClick={() => { setQ(''); setResults([]); }}
                  className="flex items-center gap-3 p-3 hover:bg-bg-elevated"
                >
                  <span className="text-xl">{flag ?? '•'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-text-primary text-sm">{r.name}</div>
                    <div className="text-text-muted text-xs">{subtitle}</div>
                  </div>
                  <span className="text-text-muted text-xs label-mono">{r.kind}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
