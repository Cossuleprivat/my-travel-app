-- Phase D: Route Planner

do $$
begin
  if not exists (select 1 from pg_type where typname = 'trip_status') then
    create type public.trip_status as enum ('draft', 'planned', 'in_progress', 'completed', 'archived');
  end if;
end
$$;

create table if not exists public.trips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  start_date date,
  end_date date,
  status public.trip_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint trip_date_range check (end_date is null or start_date is null or end_date >= start_date)
);

create table if not exists public.trip_stops (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  city_id uuid not null references public.cities(id) on delete restrict,
  position integer not null,
  arrival_date date,
  departure_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint trip_stop_position_positive check (position >= 1),
  constraint trip_stop_date_range check (departure_date is null or arrival_date is null or departure_date >= arrival_date),
  constraint unique_stop_position_per_trip unique (trip_id, position)
);

create table if not exists public.trip_quests (
  id uuid primary key default gen_random_uuid(),
  trip_stop_id uuid not null references public.trip_stops(id) on delete cascade,
  quest_id uuid not null references public.quests(id) on delete restrict,
  user_id uuid not null references auth.users(id) on delete cascade,
  is_completed boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint unique_trip_stop_quest unique (trip_stop_id, quest_id),
  constraint trip_quest_completion_timestamp check (
    (is_completed = true and completed_at is not null)
    or (is_completed = false)
  )
);

create index if not exists idx_trips_user_id on public.trips(user_id);
create index if not exists idx_trip_stops_trip_id on public.trip_stops(trip_id);
create index if not exists idx_trip_stops_city_id on public.trip_stops(city_id);
create index if not exists idx_trip_quests_trip_stop_id on public.trip_quests(trip_stop_id);
create index if not exists idx_trip_quests_user_id on public.trip_quests(user_id);

drop trigger if exists trg_trips_updated_at on public.trips;
create trigger trg_trips_updated_at
before update on public.trips
for each row execute function public.set_updated_at();

drop trigger if exists trg_trip_stops_updated_at on public.trip_stops;
create trigger trg_trip_stops_updated_at
before update on public.trip_stops
for each row execute function public.set_updated_at();

drop trigger if exists trg_trip_quests_updated_at on public.trip_quests;
create trigger trg_trip_quests_updated_at
before update on public.trip_quests
for each row execute function public.set_updated_at();
