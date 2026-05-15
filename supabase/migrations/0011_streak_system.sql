-- Sprint 11: Streak System & Daily Reward Loop

-- ---------------------------------------------------------------------------
-- 1) user_streaks table
-- ---------------------------------------------------------------------------

create table if not exists public.user_streaks (
  user_id          uuid primary key references auth.users(id) on delete cascade,
  current_streak   integer not null default 0,
  longest_streak   integer not null default 0,
  last_active_date date,
  updated_at       timestamptz not null default now()
);

alter table public.user_streaks enable row level security;

drop policy if exists "user_streaks_select_own" on public.user_streaks;
create policy "user_streaks_select_own"
  on public.user_streaks for select using (user_id = auth.uid());

drop policy if exists "user_streaks_insert_own" on public.user_streaks;
create policy "user_streaks_insert_own"
  on public.user_streaks for insert with check (user_id = auth.uid());

drop policy if exists "user_streaks_update_own" on public.user_streaks;
create policy "user_streaks_update_own"
  on public.user_streaks for update using (user_id = auth.uid());
