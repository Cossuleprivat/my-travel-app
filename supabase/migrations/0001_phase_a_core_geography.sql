-- Phase A: Core Geography + Auth Profile

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $func$
begin
  new.updated_at = now();
  return new;
end;
$func$;

create table if not exists public.continents (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.countries (
  id uuid primary key default gen_random_uuid(),
  continent_id uuid not null references public.continents(id) on delete restrict,
  code text not null unique,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cities (
  id uuid primary key default gen_random_uuid(),
  country_id uuid not null references public.countries(id) on delete restrict,
  slug text not null unique,
  name text not null,
  latitude numeric(9, 6),
  longitude numeric(9, 6),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint city_latitude_range check (latitude is null or (latitude between -90 and 90)),
  constraint city_longitude_range check (longitude is null or (longitude between -180 and 180))
);

create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  home_city_id uuid references public.cities(id) on delete set null,
  travel_interests text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_countries_continent_id on public.countries(continent_id);
create index if not exists idx_cities_country_id on public.cities(country_id);

drop trigger if exists trg_continents_updated_at on public.continents;
create trigger trg_continents_updated_at
before update on public.continents
for each row execute function public.set_updated_at();

drop trigger if exists trg_countries_updated_at on public.countries;
create trigger trg_countries_updated_at
before update on public.countries
for each row execute function public.set_updated_at();

drop trigger if exists trg_cities_updated_at on public.cities;
create trigger trg_cities_updated_at
before update on public.cities
for each row execute function public.set_updated_at();

drop trigger if exists trg_user_profiles_updated_at on public.user_profiles;
create trigger trg_user_profiles_updated_at
before update on public.user_profiles
for each row execute function public.set_updated_at();
