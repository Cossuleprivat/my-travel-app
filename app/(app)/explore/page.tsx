import Link from 'next/link';
import { listContinents, listCountriesByContinent, getVisitedSets } from '@/lib/data/queries';
import { requireUserId } from '@/lib/auth/current-user';
import { SearchBar } from '@/components/explore/SearchBar';
import { getContinentIcon } from '@/lib/continentIcon';

export default async function ExplorePage() {
  const userId = await requireUserId();
  const continents = await listContinents();
  const visited = await getVisitedSets(userId);

  const counts = await Promise.all(
    continents.map(async (c) => {
      const countries = await listCountriesByContinent(c.id);
      const visitedCount = countries.filter((co) => visited.countries.has(co.id)).length;
      return { continentId: c.id, total: countries.length, visited: visitedCount };
    }),
  );
  const countMap = new Map(counts.map((x) => [x.continentId, x]));

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-mono text-3xl lg:text-4xl uppercase tracking-wider text-text-primary">
          Explore
        </h1>
        <p className="text-text-secondary text-sm mt-2">
          Browse the world or search for a place.
        </p>
      </header>

      <SearchBar />

      {/* Continent cards — 1-col mobile, 2-col lg */}
      <ul className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {continents.map((c) => {
          const count = countMap.get(c.id);
          const total = count?.total ?? 0;
          const visitedCount = count?.visited ?? 0;
          const isVisited = visited.continents.has(c.id);
          const pct = total > 0 ? Math.round((visitedCount / total) * 100) : 0;

          const statusColor = isVisited
            ? 'border-accent-green/60 hover:shadow-glow-green'
            : visitedCount > 0
              ? 'border-accent-amber/60 hover:shadow-glow-amber'
              : 'border-border-subtle hover:border-border-interactive';

          return (
            <li key={c.id}>
              <Link
                href={`/explore/${c.slug}`}
                className={`group block rounded-2xl bg-bg-surface border ${statusColor} shadow-card p-5 lg:p-6 transition-all duration-300`}
              >
                <div className="flex items-start justify-between mb-4">
                  {(() => { const Icon = getContinentIcon(c.slug); return <Icon className="text-4xl lg:text-5xl text-accent-blue" aria-hidden="true" />; })()}
                  {isVisited && (
                    <span className="text-xs label-mono text-accent-green bg-accent-green/10 border border-accent-green/30 px-2 py-0.5 rounded-full">
                      ✓ Visited
                    </span>
                  )}
                  {!isVisited && visitedCount > 0 && (
                    <span className="text-xs label-mono text-accent-amber bg-accent-amber/10 border border-accent-amber/30 px-2 py-0.5 rounded-full">
                      {visitedCount}/{total}
                    </span>
                  )}
                </div>

                <h2 className="font-mono text-xl lg:text-2xl uppercase tracking-wider text-text-primary group-hover:text-accent-blue transition-colors">
                  {c.name}
                </h2>
                <p className="text-text-muted text-xs label-mono mt-1">{total} countries</p>

                {/* Progress bar */}
                <div className="mt-4">
                  <div className="h-1.5 rounded-full bg-bg-elevated overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        isVisited ? 'bg-accent-green' : visitedCount > 0 ? 'bg-accent-amber' : 'bg-border-interactive'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-[10px] label-mono text-text-muted mt-1">{pct}% explored</p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
