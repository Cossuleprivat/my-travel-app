-- Phase C: Quest Catalog + Editorial Content

do $$
begin
  if not exists (select 1 from pg_type where typname = 'quest_category') then
    create type public.quest_category as enum ('landmark', 'activity', 'restaurant', 'hidden_gem');
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'quest_status') then
    create type public.quest_status as enum ('not_started', 'planned', 'completed');
  end if;
end
$$;

create table if not exists public.quests (
  id uuid primary key default gen_random_uuid(),
  city_id uuid not null references public.cities(id) on delete cascade,
  title text not null,
  description text,
  category public.quest_category not null,
  difficulty smallint not null default 1,
  estimated_minutes integer,
  estimated_cost_eur numeric(10, 2),
  source text not null default 'seed',
  publish_status text not null default 'published',
  is_active boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint quest_difficulty_range check (difficulty between 1 and 5),
  constraint quest_publish_status_valid check (publish_status in ('draft', 'published')),
  constraint quest_estimated_minutes_non_negative check (estimated_minutes is null or estimated_minutes >= 0),
  constraint quest_estimated_cost_non_negative check (estimated_cost_eur is null or estimated_cost_eur >= 0)
);

create table if not exists public.user_quest_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  quest_id uuid not null references public.quests(id) on delete cascade,
  status public.quest_status not null default 'not_started',
  planned_at timestamptz,
  completed_at timestamptz,
  completion_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint unique_user_quest unique (user_id, quest_id),
  constraint completed_at_requires_status check (
    (status = 'completed' and completed_at is not null)
    or (status <> 'completed')
  )
);

create table if not exists public.quest_collections (
  id uuid primary key default gen_random_uuid(),
  city_id uuid references public.cities(id) on delete set null,
  title text not null,
  description text,
  is_published boolean not null default false,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.city_highlights (
  id uuid primary key default gen_random_uuid(),
  city_id uuid not null references public.cities(id) on delete cascade,
  title text not null,
  body text not null,
  rank integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint city_highlights_rank_positive check (rank >= 1)
);

create index if not exists idx_quests_city_id on public.quests(city_id);
create index if not exists idx_quests_category on public.quests(category);
create index if not exists idx_user_quest_progress_user_id on public.user_quest_progress(user_id);
create index if not exists idx_user_quest_progress_quest_id on public.user_quest_progress(quest_id);
create index if not exists idx_user_quest_progress_status on public.user_quest_progress(status);
create index if not exists idx_quest_collections_city_id on public.quest_collections(city_id);
create index if not exists idx_city_highlights_city_id on public.city_highlights(city_id);

drop trigger if exists trg_quests_updated_at on public.quests;
create trigger trg_quests_updated_at
before update on public.quests
for each row execute function public.set_updated_at();

drop trigger if exists trg_user_quest_progress_updated_at on public.user_quest_progress;
create trigger trg_user_quest_progress_updated_at
before update on public.user_quest_progress
for each row execute function public.set_updated_at();

drop trigger if exists trg_quest_collections_updated_at on public.quest_collections;
create trigger trg_quest_collections_updated_at
before update on public.quest_collections
for each row execute function public.set_updated_at();

drop trigger if exists trg_city_highlights_updated_at on public.city_highlights;
create trigger trg_city_highlights_updated_at
before update on public.city_highlights
for each row execute function public.set_updated_at();
