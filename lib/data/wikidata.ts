import 'server-only';
import { createServiceClient } from '@/lib/supabase/server';

type WikiSight = { name: string; description?: string };

// Wikidata SPARQL: top "tourist attractions" / heritage sites in a city.
// Filter by `wdt:P31/wdt:P279*` is a tradeoff between precision and recall;
// this query goes for tourist-relevant entities linked to the city.
async function fetchSightsFromWikidata(cityName: string): Promise<WikiSight[]> {
  const sparql = `
    SELECT ?item ?itemLabel ?desc WHERE {
      ?item wdt:P131* ?city .
      ?city rdfs:label "${cityName.replace(/"/g, '\\"')}"@en .
      { ?item wdt:P31/wdt:P279* wd:Q570116 . }
        UNION { ?item wdt:P31/wdt:P279* wd:Q839954 . }
        UNION { ?item wdt:P31/wdt:P279* wd:Q33506 . }
      OPTIONAL { ?item schema:description ?desc . FILTER(LANG(?desc) = "en") }
      SERVICE wikibase:label { bd:serviceParam wikibase:language "en" . }
    }
    LIMIT 12
  `.trim();

  const url =
    'https://query.wikidata.org/sparql?format=json&query=' + encodeURIComponent(sparql);

  const res = await fetch(url, {
    headers: { 'User-Agent': 'TravelScorer/0.1 (dev@travelscorer.local)' },
    cache: 'no-store',
  });
  if (!res.ok) return [];
  const json = (await res.json()) as { results: { bindings: Array<{
    itemLabel?: { value: string };
    desc?: { value: string };
  }> } };
  const rows = json.results.bindings;
  const seen = new Set<string>();
  return rows
    .map((r) => ({
      name: r.itemLabel?.value ?? '',
      description: r.desc?.value,
    }))
    .filter((r) => r.name && !r.name.startsWith('Q') && !seen.has(r.name) && seen.add(r.name));
}

export async function ensureCitySights(cityId: string, cityName: string) {
  const sb = createServiceClient();
  const { data: existing } = await sb
    .from('quests')
    .select('id')
    .eq('city_id', cityId)
    .eq('category', 'landmark')
    .limit(1);
  if (existing && existing.length > 0) return;

  let sights: WikiSight[] = [];
  try { sights = await fetchSightsFromWikidata(cityName); } catch { sights = []; }
  if (sights.length === 0) return;

  const rows = sights.map((s) => ({
    city_id: cityId,
    title: s.name,
    description: s.description ?? null,
    category: 'landmark' as const,
    source: 'wikidata',
    publish_status: 'published',
    is_active: true,
  }));
  await sb.from('quests').insert(rows);
}
