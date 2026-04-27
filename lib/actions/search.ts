'use server';

import { createServiceClient } from '@/lib/supabase/server';

export type SearchResult =
  | { kind: 'continent'; id: string; name: string; slug: string; emoji: string | null }
  | { kind: 'country'; id: string; name: string; slug: string; flag: string | null; continentSlug: string }
  | { kind: 'city'; id: string; name: string; slug: string; countryName: string; countrySlug: string; continentSlug: string };

export async function search(q: string): Promise<SearchResult[]> {
  const term = q.trim();
  if (term.length < 2) return [];
  const like = `%${term}%`;
  const sb = createServiceClient();

  const [conts, ctrs, cities] = await Promise.all([
    sb.from('continents').select('id, name, slug, emoji').ilike('name', like).limit(5),
    sb.from('countries')
      .select('id, name, slug, flag_emoji, continents!inner(slug)')
      .ilike('name', like).limit(8),
    sb.from('cities')
      .select('id, name, slug, countries!inner(name, slug, continents!inner(slug))')
      .ilike('name', like).limit(15),
  ]);

  const results: SearchResult[] = [];
  for (const c of conts.data ?? []) {
    results.push({ kind: 'continent', id: c.id, name: c.name, slug: c.slug, emoji: c.emoji });
  }
  for (const c of ctrs.data ?? []) {
    results.push({
      kind: 'country', id: c.id, name: c.name, slug: c.slug,
      flag: c.flag_emoji,
      continentSlug: (c as any).continents.slug,
    });
  }
  for (const c of cities.data ?? []) {
    results.push({
      kind: 'city', id: c.id, name: c.name, slug: c.slug,
      countryName: (c as any).countries.name,
      countrySlug: (c as any).countries.slug,
      continentSlug: (c as any).countries.continents.slug,
    });
  }
  return results;
}
