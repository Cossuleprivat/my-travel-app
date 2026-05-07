import { notFound } from 'next/navigation';
import {
  getContinentBySlug, getCountryBySlug, getCityBySlug,
  listSightsForCity, getVisitedSets, getCityCompletion,
} from '@/lib/data/queries';
import { ensureCitySights } from '@/lib/data/wikidata';
import { createServiceClient } from '@/lib/supabase/server';
import { requireUserId } from '@/lib/auth/current-user';
import { Breadcrumb } from '@/components/explore/Breadcrumb';
import { WarHierButton } from '@/components/explore/WarHierButton';
import { SightChecklist } from '@/components/explore/SightChecklist';
import { ProgressRing } from '@/components/ui/ProgressRing';

export default async function CityPage({
  params,
}: { params: Promise<{ continent: string; country: string; city: string }> }) {
  const { continent: contSlug, country: ctrSlug, city: citySlug } = await params;

  const [continent, country, city] = await Promise.all([
    getContinentBySlug(contSlug),
    getCountryBySlug(ctrSlug),
    getCityBySlug(citySlug),
  ]);
  if (!continent || !country || !city) notFound();
  if (country.continent_id !== continent.id) notFound();
  if (city.country_id !== country.id) notFound();

  const userId = await requireUserId();

  // Lazy: trigger Wikidata fetch if no sights cached. Best-effort.
  await ensureCitySights(city.id, city.name);
  const sights = await listSightsForCity(city.id);

  // Which sights has the user completed or planned?
  const sb = createServiceClient();
  const { data: progress } = await sb
    .from('user_quest_progress')
    .select('quest_id, status')
    .eq('user_id', userId)
    .in('status', ['completed', 'planned']);
  const completedSet = new Set((progress ?? []).filter((c: { status: string }) => c.status === 'completed').map((c: { quest_id: string }) => c.quest_id));
  const plannedSet   = new Set((progress ?? []).filter((c: { status: string }) => c.status === 'planned').map((c: { quest_id: string }) => c.quest_id));

  const [visited, completion] = await Promise.all([
    getVisitedSets(userId),
    getCityCompletion(city.id, userId),
  ]);
  const alreadyTracked = visited.cities.has(city.id);

  return (
    <div className="space-y-5">
      <Breadcrumb items={[
        { label: 'Explore', href: '/explore' },
        { label: continent.name, href: `/explore/${continent.slug}` },
        { label: country.name, href: `/explore/${continent.slug}/${country.slug}` },
        { label: city.name },
      ]} />

      <header className="flex items-start gap-3">
        <span className="text-3xl" aria-hidden="true">{country.flag_emoji ?? '🏳'}</span>
        <div className="flex-1">
          <h1 className="font-sans text-2xl text-text-primary">{city.name}</h1>
          <p className="text-text-muted text-xs label-mono mt-1">
            {country.name} · {continent.name} · {sights.length} sights
          </p>
        </div>
        {completion.totalSights > 0 && (
          <ProgressRing
            pct={completion.pct}
            size={52}
            stroke={4}
            color="#a060e0"
            label={`${completion.pct}%`}
            sublabel="done"
          />
        )}
      </header>

      <WarHierButton cityId={city.id} alreadyTracked={alreadyTracked} />

      <section className="space-y-2">
        <h2 className="text-xs label-mono text-text-muted">Sights</h2>
        <SightChecklist
          items={sights.map((s) => ({
            id: s.id,
            title: s.title,
            description: s.description,
            completed: completedSet.has(s.id),
            planned: plannedSet.has(s.id),
          }))}
        />
      </section>
    </div>
  );
}
