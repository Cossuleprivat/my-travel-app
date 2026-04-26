-- Phase B: Tracking Basis

create table if not exists public.user_city_visits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  city_id uuid not null references public.cities(id) on delete restrict,
  start_date date not null,
  end_date date,
  notes text,
  media_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint visit_date_range check (end_date is null or end_date >= start_date),
  constraint visit_unique_per_start unique (user_id, city_id, start_date)
);

create index if not exists idx_user_city_visits_user_id on public.user_city_visits(user_id);
create index if not exists idx_user_city_visits_city_id on public.user_city_visits(city_id);

drop trigger if exists trg_user_city_visits_updated_at on public.user_city_visits;
create trigger trg_user_city_visits_updated_at
before update on public.user_city_visits
for each row execute function public.set_updated_at();
