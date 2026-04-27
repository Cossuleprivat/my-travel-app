-- Phase G: Tracking Core (Session 02)
-- Adds slugs/emojis/iso2 to reference tables, drops NOT NULL on
-- user_city_visits.start_date, introduces continent + country visits,
-- XP/level on profile, and achievements.

-- ---------------------------------------------------------------------------
-- 1) Reference data: slugs, emoji flags, iso2 codes
-- ---------------------------------------------------------------------------

alter table public.continents add column if not exists emoji text;
alter table public.continents add column if not exists slug text;
update public.continents set slug = lower(replace(name, ' ', '-')) where slug is null;
alter table public.continents alter column slug set not null;
alter table public.continents add constraint continents_slug_unique unique (slug);

alter table public.countries add column if not exists flag_emoji text;
alter table public.countries add column if not exists iso2 text;
alter table public.countries add column if not exists slug text;
update public.countries set slug = lower(replace(name, ' ', '-')) where slug is null;
alter table public.countries alter column slug set not null;
alter table public.countries add constraint countries_slug_unique unique (slug);

-- ---------------------------------------------------------------------------
-- 2) start_date nullable + partial overlap constraint
-- ---------------------------------------------------------------------------

alter table public.user_city_visits drop constraint if exists user_city_visits_no_overlap;
alter table public.user_city_visits drop constraint if exists visit_unique_per_start;
alter table public.user_city_visits alter column start_date drop not null;
alter table public.user_city_visits alter column end_date drop not null;

-- Re-add date-range overlap exclusion only for visits that have a start_date.
-- Visits without dates are "checkbox-only" entries and are intentionally
-- allowed to coexist (the UI prevents duplicates per city via the action).
alter table public.user_city_visits
  add constraint user_city_visits_no_overlap
  exclude using gist (
    user_id with =,
    city_id with =,
    daterange(start_date, coalesce(end_date, 'infinity'::date), '[]') with &&
  ) where (start_date is not null);

-- One "dateless" visit per (user, city) — enforced by partial unique index.
create unique index if not exists user_city_visits_one_dateless_per_city
  on public.user_city_visits(user_id, city_id)
  where start_date is null;

-- ---------------------------------------------------------------------------
-- 3) Continent + Country visits
-- ---------------------------------------------------------------------------

create table if not exists public.user_continent_visits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  continent_id uuid not null references public.continents(id) on delete cascade,
  visited_at timestamptz not null default now(),
  unique (user_id, continent_id)
);

create index if not exists idx_user_continent_visits_user on public.user_continent_visits(user_id);

create table if not exists public.user_country_visits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  country_id uuid not null references public.countries(id) on delete cascade,
  visited_at timestamptz not null default now(),
  unique (user_id, country_id)
);

create index if not exists idx_user_country_visits_user on public.user_country_visits(user_id);

-- ---------------------------------------------------------------------------
-- 4) XP + level on user_profiles
-- ---------------------------------------------------------------------------

alter table public.user_profiles add column if not exists xp_total integer not null default 0;
alter table public.user_profiles add column if not exists level integer not null default 1;
alter table public.user_profiles add constraint user_profiles_xp_non_negative check (xp_total >= 0);
alter table public.user_profiles add constraint user_profiles_level_min check (level >= 1);

-- ---------------------------------------------------------------------------
-- 5) Achievements
-- ---------------------------------------------------------------------------

create table if not exists public.user_achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  achievement text not null,
  unlocked_at timestamptz not null default now(),
  unique (user_id, achievement)
);

create index if not exists idx_user_achievements_user on public.user_achievements(user_id);

-- ---------------------------------------------------------------------------
-- 6) RLS for new tables
-- ---------------------------------------------------------------------------

alter table public.user_continent_visits enable row level security;
alter table public.user_country_visits enable row level security;
alter table public.user_achievements enable row level security;

drop policy if exists "user_continent_visits_select_own" on public.user_continent_visits;
create policy "user_continent_visits_select_own"
  on public.user_continent_visits for select using (user_id = auth.uid());
drop policy if exists "user_continent_visits_insert_own" on public.user_continent_visits;
create policy "user_continent_visits_insert_own"
  on public.user_continent_visits for insert with check (user_id = auth.uid());
drop policy if exists "user_continent_visits_delete_own" on public.user_continent_visits;
create policy "user_continent_visits_delete_own"
  on public.user_continent_visits for delete using (user_id = auth.uid());

drop policy if exists "user_country_visits_select_own" on public.user_country_visits;
create policy "user_country_visits_select_own"
  on public.user_country_visits for select using (user_id = auth.uid());
drop policy if exists "user_country_visits_insert_own" on public.user_country_visits;
create policy "user_country_visits_insert_own"
  on public.user_country_visits for insert with check (user_id = auth.uid());
drop policy if exists "user_country_visits_delete_own" on public.user_country_visits;
create policy "user_country_visits_delete_own"
  on public.user_country_visits for delete using (user_id = auth.uid());

drop policy if exists "user_achievements_select_own" on public.user_achievements;
create policy "user_achievements_select_own"
  on public.user_achievements for select using (user_id = auth.uid());
drop policy if exists "user_achievements_insert_own" on public.user_achievements;
create policy "user_achievements_insert_own"
  on public.user_achievements for insert with check (user_id = auth.uid());
