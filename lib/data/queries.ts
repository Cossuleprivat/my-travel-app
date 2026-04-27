import 'server-only';
import { createServiceClient } from '@/lib/supabase/server';
import type {
  Continent, Country, City, Quest,
  UserProfile,
} from '@/lib/supabase/types';

export async function listContinents(): Promise<Continent[]> {
  const sb = createServiceClient();
  const { data, error } = await sb
    .from('continents')
    .select('id, code, name, slug, emoji')
    .order('name');
  if (error) throw error;
  return data ?? [];
}

export async function getContinentBySlug(slug: string): Promise<Continent | null> {
  const sb = createServiceClient();
  const { data, error } = await sb
    .from('continents')
    .select('id, code, name, slug, emoji')
    .eq('slug', slug)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function listCountriesByContinent(continentId: string): Promise<Country[]> {
  const sb = createServiceClient();
  const { data, error } = await sb
    .from('countries')
    .select('id, continent_id, code, iso2, name, slug, flag_emoji')
    .eq('continent_id', continentId)
    .order('name');
  if (error) throw error;
  return data ?? [];
}

export async function getCountryBySlug(slug: string): Promise<Country | null> {
  const sb = createServiceClient();
  const { data, error } = await sb
    .from('countries')
    .select('id, continent_id, code, iso2, name, slug, flag_emoji')
    .eq('slug', slug)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function listCitiesByCountry(countryId: string): Promise<City[]> {
  const sb = createServiceClient();
  const { data, error } = await sb
    .from('cities')
    .select('id, country_id, slug, name, latitude, longitude')
    .eq('country_id', countryId)
    .order('name');
  if (error) throw error;
  return data ?? [];
}

export async function getCityBySlug(slug: string): Promise<City | null> {
  const sb = createServiceClient();
  const { data, error } = await sb
    .from('cities')
    .select('id, country_id, slug, name, latitude, longitude')
    .eq('slug', slug)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function listSightsForCity(cityId: string): Promise<Quest[]> {
  const sb = createServiceClient();
  const { data, error } = await sb
    .from('quests')
    .select('id, city_id, title, description, category')
    .eq('city_id', cityId)
    .eq('category', 'landmark')
    .eq('is_active', true);
  if (error) throw error;
  return data ?? [];
}

export type UserStats = {
  cityCount: number;
  continentCount: number;
  countryCount: number;
  sightCount: number;
  xpTotal: number;
  level: number;
};

export async function getUserStats(userId: string): Promise<UserStats> {
  const sb = createServiceClient();
  const [cities, continents, countries, sights, profile] = await Promise.all([
    sb.from('user_city_visits').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    sb.from('user_continent_visits').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    sb.from('user_country_visits').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    sb.from('user_quest_progress').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('status', 'completed'),
    sb.from('user_profiles').select('xp_total, level').eq('id', userId).maybeSingle(),
  ]);
  return {
    cityCount: cities.count ?? 0,
    continentCount: continents.count ?? 0,
    countryCount: countries.count ?? 0,
    sightCount: sights.count ?? 0,
    xpTotal: profile.data?.xp_total ?? 0,
    level: profile.data?.level ?? 1,
  };
}

export async function ensureUserProfile(userId: string): Promise<UserProfile> {
  const sb = createServiceClient();
  const { data: existing } = await sb
    .from('user_profiles')
    .select('id, display_name, home_city_id, travel_interests, xp_total, level')
    .eq('id', userId)
    .maybeSingle();
  if (existing) return existing as UserProfile;

  const { data, error } = await sb
    .from('user_profiles')
    .insert({ id: userId, display_name: 'Traveler', travel_interests: [] })
    .select('id, display_name, home_city_id, travel_interests, xp_total, level')
    .single();
  if (error) throw error;
  return data as UserProfile;
}

export type RecentVisit = {
  kind: 'city' | 'country' | 'continent' | 'sight';
  id: string;
  label: string;
  subLabel: string | null;
  at: string;
  xp: number;
};

export async function listRecentActivity(userId: string, limit = 10): Promise<RecentVisit[]> {
  const sb = createServiceClient();

  const [cities, countries, continents, sights] = await Promise.all([
    sb.from('user_city_visits')
      .select('id, created_at, cities!inner(name, slug, country_id, countries!inner(name))')
      .eq('user_id', userId).order('created_at', { ascending: false }).limit(limit),
    sb.from('user_country_visits')
      .select('id, visited_at, countries!inner(name)')
      .eq('user_id', userId).order('visited_at', { ascending: false }).limit(limit),
    sb.from('user_continent_visits')
      .select('id, visited_at, continents!inner(name)')
      .eq('user_id', userId).order('visited_at', { ascending: false }).limit(limit),
    sb.from('user_quest_progress')
      .select('id, completed_at, quests!inner(title, cities!inner(name))')
      .eq('user_id', userId).eq('status', 'completed')
      .order('completed_at', { ascending: false }).limit(limit),
  ]);

  const items: RecentVisit[] = [];
  for (const r of cities.data ?? []) {
    items.push({
      kind: 'city', id: r.id,
      label: (r as any).cities.name,
      subLabel: (r as any).cities.countries.name,
      at: r.created_at, xp: 10,
    });
  }
  for (const r of countries.data ?? []) {
    items.push({ kind: 'country', id: r.id, label: (r as any).countries.name, subLabel: null, at: r.visited_at, xp: 50 });
  }
  for (const r of continents.data ?? []) {
    items.push({ kind: 'continent', id: r.id, label: (r as any).continents.name, subLabel: null, at: r.visited_at, xp: 100 });
  }
  for (const r of sights.data ?? []) {
    items.push({
      kind: 'sight', id: r.id,
      label: (r as any).quests.title,
      subLabel: (r as any).quests.cities.name,
      at: r.completed_at, xp: 5,
    });
  }

  return items
    .sort((a, b) => (a.at < b.at ? 1 : -1))
    .slice(0, limit);
}

export type VisitedSets = {
  continents: Set<string>;
  countries: Set<string>;
  cities: Set<string>;
};

export async function getVisitedSets(userId: string): Promise<VisitedSets> {
  const sb = createServiceClient();
  const [conts, ctrs, cities] = await Promise.all([
    sb.from('user_continent_visits').select('continent_id').eq('user_id', userId),
    sb.from('user_country_visits').select('country_id').eq('user_id', userId),
    sb.from('user_city_visits').select('city_id').eq('user_id', userId),
  ]);
  return {
    continents: new Set((conts.data ?? []).map((r) => r.continent_id)),
    countries: new Set((ctrs.data ?? []).map((r) => r.country_id)),
    cities: new Set((cities.data ?? []).map((r) => r.city_id)),
  };
}

export async function listUserAchievements(userId: string): Promise<string[]> {
  const sb = createServiceClient();
  const { data, error } = await sb
    .from('user_achievements')
    .select('achievement')
    .eq('user_id', userId);
  if (error) throw error;
  return (data ?? []).map((r) => r.achievement);
}
