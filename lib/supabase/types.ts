// Hand-written row types. Replace with generated types in Session 05 once
// Supabase CLI is wired (npx supabase gen types).

export type Continent = {
  id: string;
  code: string;
  name: string;
  slug: string;
  emoji: string | null;
};

export type Country = {
  id: string;
  continent_id: string;
  code: string;
  iso2: string | null;
  name: string;
  slug: string;
  flag_emoji: string | null;
};

export type City = {
  id: string;
  country_id: string;
  slug: string;
  name: string;
  latitude: number | null;
  longitude: number | null;
};

export type Quest = {
  id: string;
  city_id: string;
  title: string;
  description: string | null;
  category: 'landmark' | 'activity' | 'restaurant' | 'hidden_gem';
};

export type UserCityVisit = {
  id: string;
  user_id: string;
  city_id: string;
  start_date: string | null;
  end_date: string | null;
  notes: string | null;
  created_at: string;
};

export type UserContinentVisit = {
  id: string;
  user_id: string;
  continent_id: string;
  visited_at: string;
};

export type UserCountryVisit = {
  id: string;
  user_id: string;
  country_id: string;
  visited_at: string;
};

export type UserProfile = {
  id: string;
  display_name: string | null;
  home_city_id: string | null;
  travel_interests: string[];
  xp_total: number;
  level: number;
};

export type UserAchievement = {
  id: string;
  user_id: string;
  achievement: string;
  unlocked_at: string;
};
