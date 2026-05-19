import { notFound } from 'next/navigation';
import {
  getContinentBySlug, getCountryBySlug,
  listCitiesByCountry, getVisitedSets,
} from '@/lib/data/queries';
import { requireUserId } from '@/lib/auth/current-user';
import { SearchBar } from '@/components/explore/SearchBar';
import { Breadcrumb } from '@/components/explore/Breadcrumb';
import { HierarchyRow } from '@/components/explore/HierarchyRow';
import { CountryVisitToggle } from '@/components/explore/CountryVisitToggle';

export default async function CountryPage({
  params,
}: { params: Promise<{ continent: string; country: string }> }) {
  const { continent: contSlug, country: ctrSlug } = await params;
  const [continent, country] = await Promise.all([
    getContinentBySlug(contSlug),
    getCountryBySlug(ctrSlug),
  ]);
  if (!continent || !country || country.continent_id !== continent.id) notFound();

  const userId = await requireUserId();
  const [cities, visited] = await Promise.all([
    listCitiesByCountry(country.id),
    getVisitedSets(userId),
  ]);
  const isCountryVisited = visited.countries.has(country.id);

  return (
    <div className="space-y-4">
      <Breadcrumb items={[
        { label: 'Erkunden', href: '/travel/explore' },
        { label: continent.name, href: `/travel/explore/${continent.slug}` },
        { label: country.name },
      ]} />
      <header className="flex items-start gap-3">
        <span className="text-3xl" aria-hidden="true">{country.flag_emoji ?? '🏳'}</span>
        <div className="flex-1">
          <h1 className="font-sans text-2xl text-text-primary">{country.name}</h1>
          <p className="text-text-muted text-xs label-mono mt-1">
            {cities.length} cities
          </p>
        </div>
        <CountryVisitToggle countryId={country.id} visited={isCountryVisited} />
      </header>

      <SearchBar />

      <ul className="flex flex-col gap-2">
        {cities.length === 0 && (
          <li className="text-text-muted text-sm py-6 text-center">
            No cities seeded for {country.name} yet.
          </li>
        )}
        {cities.map((city) => {
          const isCityVisited = visited.cities.has(city.id);
          return (
            <li key={city.id}>
              <HierarchyRow
                href={`/travel/explore/${continent.slug}/${country.slug}/${city.slug}`}
                icon="◉"
                title={city.name}
                status={isCityVisited ? 'visited' : 'untouched'}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
