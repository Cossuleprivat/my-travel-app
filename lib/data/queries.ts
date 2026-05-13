// `as any` is used for nested join shapes returned by supabase-js; replaced
// with generated DB types in Session 05.
/* eslint-disable @typescript-eslint/no-explicit-any */
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
    .select('id, display_name, home_city_id, travel_interests, xp_total, level, avatar_url, avatar_generated_at, avatar_generation_month, avatar_generation_count')
    .eq('id', userId)
    .maybeSingle();
  if (existing) return existing as UserProfile;

  const { data, error } = await sb
    .from('user_profiles')
    .insert({ id: userId, display_name: 'Traveler', travel_interests: [] })
    .select('id, display_name, home_city_id, travel_interests, xp_total, level, avatar_url, avatar_generated_at, avatar_generation_month, avatar_generation_count')
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
    continents: new Set((conts.data ?? []).map((r: { continent_id: string }) => r.continent_id)),
    countries: new Set((ctrs.data ?? []).map((r: { country_id: string }) => r.country_id)),
    cities: new Set((cities.data ?? []).map((r: { city_id: string }) => r.city_id)),
  };
}

export async function listUserAchievements(userId: string): Promise<string[]> {
  const sb = createServiceClient();
  const { data, error } = await sb
    .from('user_achievements')
    .select('achievement')
    .eq('user_id', userId);
  if (error) throw error;
  return (data ?? []).map((r: { achievement: string }) => r.achievement);
}

// ---- Trips ----

export type TripWithStopCount = {
  id: string;
  title: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  status: string;
  created_at: string;
  stopCount: number;
};

export async function listTrips(userId: string): Promise<TripWithStopCount[]> {
  const sb = createServiceClient();
  const { data, error } = await sb
    .from('trips')
    .select('id, title, description, start_date, end_date, status, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  if (!data || data.length === 0) return [];

  const tripIds = data.map((t: { id: string }) => t.id);
  const { data: stops } = await sb
    .from('trip_stops')
    .select('trip_id')
    .in('trip_id', tripIds);

  const countMap: Record<string, number> = {};
  for (const s of stops ?? []) {
    countMap[s.trip_id] = (countMap[s.trip_id] ?? 0) + 1;
  }

  return data.map((t: Record<string, unknown> & { id: string }) => ({ ...t, stopCount: countMap[t.id] ?? 0 })) as TripWithStopCount[];
}

export type TripDetail = {
  id: string;
  title: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  status: string;
  stops: TripStopDetail[];
};

export type TripStopDetail = {
  id: string;
  trip_id: string;
  city_id: string;
  cityName: string;
  citySlug: string;
  countryName: string;
  continentSlug: string;
  countrySlug: string;
  position: number;
  arrival_date: string | null;
  departure_date: string | null;
  quests: TripQuestDetail[];
};

export type TripQuestDetail = {
  id: string;
  trip_stop_id: string;
  quest_id: string;
  questTitle: string;
  is_completed: boolean;
  completed_at: string | null;
};

export async function getTripDetail(tripId: string, userId: string): Promise<TripDetail | null> {
  const sb = createServiceClient();
  const { data: trip, error: tripErr } = await sb
    .from('trips')
    .select('id, title, description, start_date, end_date, status')
    .eq('id', tripId)
    .eq('user_id', userId)
    .maybeSingle();
  if (tripErr) throw tripErr;
  if (!trip) return null;

  const { data: stops, error: stopsErr } = await sb
    .from('trip_stops')
    .select(`id, trip_id, city_id, position, arrival_date, departure_date,
      cities!inner(name, slug, countries!inner(name, slug, continents!inner(slug)))`)
    .eq('trip_id', tripId)
    .order('position');
  if (stopsErr) throw stopsErr;

  const stopIds = (stops ?? []).map((s: { id: string }) => s.id);
  const { data: tripQuests } = await sb
    .from('trip_quests')
    .select('id, trip_stop_id, quest_id, is_completed, completed_at, quests!inner(title)')
    .in('trip_stop_id', stopIds.length > 0 ? stopIds : ['00000000-0000-0000-0000-000000000000']);

  const questsByStop: Record<string, TripQuestDetail[]> = {};
  for (const tq of tripQuests ?? []) {
    const detail: TripQuestDetail = {
      id: tq.id,
      trip_stop_id: tq.trip_stop_id,
      quest_id: tq.quest_id,
      questTitle: (tq as any).quests.title,
      is_completed: tq.is_completed,
      completed_at: tq.completed_at,
    };
    if (!questsByStop[tq.trip_stop_id]) questsByStop[tq.trip_stop_id] = [];
    questsByStop[tq.trip_stop_id].push(detail);
  }

  const stopsDetail: TripStopDetail[] = (stops ?? []).map((s: any) => {
    const c = (s as any).cities;
    const ctr = c.countries;
    const cont = ctr.continents;
    return {
      id: s.id,
      trip_id: s.trip_id,
      city_id: s.city_id,
      cityName: c.name,
      citySlug: c.slug,
      countryName: ctr.name,
      countrySlug: ctr.slug,
      continentSlug: cont.slug,
      position: s.position,
      arrival_date: s.arrival_date,
      departure_date: s.departure_date,
      quests: questsByStop[s.id] ?? [],
    };
  });

  return { ...trip, stops: stopsDetail };
}

export async function listQuestsForCity(cityId: string): Promise<Quest[]> {
  const sb = createServiceClient();
  const { data, error } = await sb
    .from('quests')
    .select('id, city_id, title, description, category')
    .eq('city_id', cityId)
    .eq('is_active', true)
    .order('title');
  if (error) throw error;
  return data ?? [];
}

export async function getQuestsForTripStop(tripStopId: string): Promise<TripQuestDetail[]> {
  const sb = createServiceClient();
  const { data, error } = await sb
    .from('trip_quests')
    .select('id, trip_stop_id, quest_id, is_completed, completed_at, quests!inner(title)')
    .eq('trip_stop_id', tripStopId);
  if (error) throw error;
  return (data ?? []).map((tq: any) => ({
    id: tq.id,
    trip_stop_id: tq.trip_stop_id,
    quest_id: tq.quest_id,
    questTitle: tq.quests.title,
    is_completed: tq.is_completed,
    completed_at: tq.completed_at,
  }));
}

// ---------------------------------------------------------------------------
// Items
// ---------------------------------------------------------------------------

import type { Item, UserItem, EquippedItems } from '@/lib/items/types';

export async function getItemCatalog(): Promise<Item[]> {
  const sb = createServiceClient();
  const { data, error } = await sb
    .from('items')
    .select('*')
    .order('category')
    .order('layer');
  if (error) throw error;
  return (data ?? []) as Item[];
}

export async function getUserItems(userId: string): Promise<UserItem[]> {
  const sb = createServiceClient();
  const { data, error } = await sb
    .from('user_items')
    .select('item_id, unlocked_at, items(*)')
    .eq('user_id', userId);
  if (error) throw error;
  return (data ?? []).map((r: any) => ({
    item_id: r.item_id,
    unlocked_at: r.unlocked_at,
    item: r.items as Item,
  }));
}

export async function getEquippedItems(userId: string): Promise<EquippedItems> {
  const sb = createServiceClient();
  const { data, error } = await sb
    .from('user_profiles')
    .select('equipped_items')
    .eq('id', userId)
    .single();
  if (error) return {};
  return (data?.equipped_items as EquippedItems) ?? {};
}
