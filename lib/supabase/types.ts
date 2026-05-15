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
  difficulty: number | null;
  estimated_minutes: number | null;
  estimated_cost_eur: number | null;
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
  avatar_url: string | null;
  avatar_generated_at: string | null;
  avatar_generation_month: number | null;
  avatar_generation_count: number;
};

export type UserAchievement = {
  id: string;
  user_id: string;
  achievement: string;
  unlocked_at: string;
};

export type TripStatus = 'draft' | 'planned' | 'in_progress' | 'completed' | 'archived';

export type Trip = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  status: TripStatus;
  created_at: string;
  updated_at: string;
};

export type TripStop = {
  id: string;
  trip_id: string;
  city_id: string;
  position: number;
  arrival_date: string | null;
  departure_date: string | null;
  created_at: string;
  updated_at: string;
};

export type TripQuest = {
  id: string;
  trip_stop_id: string;
  quest_id: string;
  user_id: string;
  is_completed: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};
