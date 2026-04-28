import { listContinents, listCountriesByContinent, getVisitedSets } from '@/lib/data/queries';
import { requireUserId } from '@/lib/auth/current-user';
import { SearchBar } from '@/components/explore/SearchBar';
import { HierarchyRow } from '@/components/explore/HierarchyRow';

export default async function ExplorePage() {
  const userId = await requireUserId();
  const continents = await listContinents();
  const visited = await getVisitedSets(userId);

  // Per-continent country counts (visited / total).
  const counts = await Promise.all(
    continents.map(async (c) => {
      const countries = await listCountriesByContinent(c.id);
      const visitedCount = countries.filter((co) => visited.countries.has(co.id)).length;
      return { continentId: c.id, total: countries.length, visited: visitedCount };
    }),
  );
  const countMap = new Map(counts.map((x) => [x.continentId, x]));

  return (
    <div className="space-y-4">
      <header>
        <h1 className="font-sans text-2xl text-text-primary">Explore</h1>
        <p className="text-text-secondary text-sm mt-1">
          Browse the world or search for a place.
        </p>
      </header>

      <SearchBar />

      <ul className="flex flex-col gap-2">
        {continents.map((c) => {
          const count = countMap.get(c.id);
          const total = count?.total ?? 0;
          const visitedCount = count?.visited ?? 0;
          const isContinentVisited = visited.continents.has(c.id);

          let status: 'visited' | 'partial' | 'untouched' = 'untouched';
          let badge: string | undefined;
          if (isContinentVisited) {
            status = 'visited';
          } else if (visitedCount > 0) {
            status = 'partial';
            badge = `${visitedCount}/${total}`;
          }

          return (
            <li key={c.id}>
              <HierarchyRow
                href={`/explore/${c.slug}`}
                icon={c.emoji ?? '◎'}
                title={c.name}
                subtitle={`${total} countries`}
                status={status}
                badgeText={badge}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
