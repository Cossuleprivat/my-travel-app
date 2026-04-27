import { notFound } from 'next/navigation';
import {
  getContinentBySlug, listCountriesByContinent, getVisitedSets,
} from '@/lib/data/queries';
import { DEV_USER_ID } from '@/lib/dev-user';
import { SearchBar } from '@/components/explore/SearchBar';
import { Breadcrumb } from '@/components/explore/Breadcrumb';
import { HierarchyRow } from '@/components/explore/HierarchyRow';
import { ContinentVisitToggle } from '@/components/explore/ContinentVisitToggle';

export default async function ContinentPage({
  params,
}: { params: Promise<{ continent: string }> }) {
  const { continent: slug } = await params;
  const continent = await getContinentBySlug(slug);
  if (!continent) notFound();

  const [countries, visited] = await Promise.all([
    listCountriesByContinent(continent.id),
    getVisitedSets(DEV_USER_ID),
  ]);
  const isContinentVisited = visited.continents.has(continent.id);

  return (
    <div className="space-y-4">
      <Breadcrumb items={[
        { label: 'Explore', href: '/explore' },
        { label: continent.name },
      ]} />
      <header className="flex items-start gap-3">
        <span className="text-3xl" aria-hidden="true">{continent.emoji ?? '◎'}</span>
        <div className="flex-1">
          <h1 className="font-sans text-2xl text-text-primary">{continent.name}</h1>
          <p className="text-text-muted text-xs label-mono mt-1">
            {countries.length} countries
          </p>
        </div>
        <ContinentVisitToggle continentId={continent.id} visited={isContinentVisited} />
      </header>

      <SearchBar />

      <ul className="flex flex-col gap-2">
        {countries.map((co) => {
          const isCountryVisited = visited.countries.has(co.id);
          const status = isCountryVisited ? 'visited' as const : 'untouched' as const;
          return (
            <li key={co.id}>
              <HierarchyRow
                href={`/explore/${continent.slug}/${co.slug}`}
                icon={co.flag_emoji ?? '🏳'}
                title={co.name}
                subtitle={co.iso2 ?? undefined}
                status={status}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
