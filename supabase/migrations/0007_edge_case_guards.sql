-- Phase F: Edge-case hardening (RLS, imports, status transitions, date conflicts)

create extension if not exists btree_gist;

-- ---------------------------------------------------------------------------
-- 1) RLS hardening
-- ---------------------------------------------------------------------------

drop policy if exists "quest_submissions_update_own_pending" on public.quest_submissions;
create policy "quest_submissions_update_own_pending"
on public.quest_submissions
for update
using (user_id = auth.uid() and status = 'pending')
with check (user_id = auth.uid() and status = 'pending');

drop policy if exists "trip_quests_update_owner" on public.trip_quests;
create policy "trip_quests_update_owner"
on public.trip_quests
for update
using (user_id = auth.uid())
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.trip_stops ts
    join public.trips t on t.id = ts.trip_id
    where ts.id = trip_quests.trip_stop_id
      and t.user_id = auth.uid()
  )
);

drop policy if exists "import_jobs_read_authenticated" on public.import_jobs;
drop policy if exists "import_jobs_read_own" on public.import_jobs;
create policy "import_jobs_read_own"
on public.import_jobs
for select
using (initiated_by = auth.uid());

drop policy if exists "import_errors_read_authenticated" on public.import_errors;
drop policy if exists "import_errors_read_own" on public.import_errors;
create policy "import_errors_read_own"
on public.import_errors
for select
using (
  exists (
    select 1
    from public.import_jobs ij
    where ij.id = import_errors.import_job_id
      and ij.initiated_by = auth.uid()
  )
);

-- ---------------------------------------------------------------------------
-- 2) Status transition guards
-- ---------------------------------------------------------------------------

create or replace function public.enforce_user_quest_progress_transition()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    if new.status = 'planned' and new.planned_at is null then
      new.planned_at := now();
    end if;
    if new.status = 'completed' and new.completed_at is null then
      new.completed_at := now();
    end if;
    return new;
  end if;

  if old.status = 'not_started' and new.status not in ('not_started', 'planned', 'completed') then
    raise exception 'Invalid quest status transition';
  end if;

  if old.status = 'planned' and new.status not in ('planned', 'completed') then
    raise exception 'Invalid quest status transition';
  end if;

  if old.status = 'completed' and new.status <> 'completed' then
    raise exception 'Invalid quest status transition';
  end if;

  if new.status <> 'completed' then
    new.completed_at := null;
  elsif new.completed_at is null then
    new.completed_at := now();
  end if;

  if new.status = 'planned' and new.planned_at is null then
    new.planned_at := now();
  end if;

  return new;
end;
$$;

drop trigger if exists trg_user_quest_progress_transition on public.user_quest_progress;
create trigger trg_user_quest_progress_transition
before insert or update on public.user_quest_progress
for each row execute function public.enforce_user_quest_progress_transition();

create or replace function public.enforce_trip_quests_completion_transition()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    if new.is_completed and new.completed_at is null then
      new.completed_at := now();
    end if;
    if not new.is_completed then
      new.completed_at := null;
    end if;
    return new;
  end if;

  if old.is_completed and not new.is_completed then
    raise exception 'Cannot rollback completed trip quest';
  end if;

  if new.is_completed and new.completed_at is null then
    new.completed_at := coalesce(old.completed_at, now());
  end if;

  if not new.is_completed then
    new.completed_at := null;
  end if;

  if old.completed_at is not null and new.completed_at is distinct from old.completed_at then
    raise exception 'completed_at is immutable after first completion';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_trip_quests_completion_transition on public.trip_quests;
create trigger trg_trip_quests_completion_transition
before insert or update on public.trip_quests
for each row execute function public.enforce_trip_quests_completion_transition();

create or replace function public.enforce_quest_submission_transition()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    return new;
  end if;

  if old.status = 'pending' and new.status not in ('pending', 'approved', 'rejected') then
    raise exception 'Invalid submission status transition';
  end if;

  if old.status in ('approved', 'rejected') and new.status <> old.status then
    raise exception 'Moderation status is terminal once decided';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_quest_submissions_transition on public.quest_submissions;
create trigger trg_quest_submissions_transition
before update on public.quest_submissions
for each row execute function public.enforce_quest_submission_transition();

-- ---------------------------------------------------------------------------
-- 3) Date conflict guards
-- ---------------------------------------------------------------------------

alter table public.user_quest_progress
drop constraint if exists completed_at_requires_status;
alter table public.user_quest_progress
add constraint completed_at_requires_status
check (
  (status = 'completed' and completed_at is not null)
  or (status <> 'completed' and completed_at is null)
);

alter table public.trip_quests
drop constraint if exists trip_quest_completion_timestamp;
alter table public.trip_quests
add constraint trip_quest_completion_timestamp
check (
  (is_completed = true and completed_at is not null)
  or (is_completed = false and completed_at is null)
);

alter table public.trips
drop constraint if exists trip_date_range;
alter table public.trips
add constraint trip_date_range
check (
  (start_date is null and end_date is null)
  or (start_date is not null and end_date is not null and end_date >= start_date)
);

alter table public.trip_stops
drop constraint if exists trip_stop_date_range;
alter table public.trip_stops
add constraint trip_stop_date_range
check (
  (arrival_date is null and departure_date is null)
  or (arrival_date is not null and departure_date is not null and departure_date >= arrival_date)
);

alter table public.user_city_visits
drop constraint if exists user_city_visits_no_overlap;
alter table public.user_city_visits
add constraint user_city_visits_no_overlap
exclude using gist (
  user_id with =,
  city_id with =,
  daterange(start_date, coalesce(end_date, 'infinity'::date), '[]') with &&
);

alter table public.trip_stops
drop constraint if exists trip_stops_no_overlap_per_trip;
alter table public.trip_stops
add constraint trip_stops_no_overlap_per_trip
exclude using gist (
  trip_id with =,
  daterange(arrival_date, departure_date, '[]') with &&
)
where (arrival_date is not null and departure_date is not null);

-- ---------------------------------------------------------------------------
-- 4) Import idempotency safeguards
-- ---------------------------------------------------------------------------

alter table public.import_jobs
add column if not exists source_checksum text;

create unique index if not exists uq_import_jobs_completed_checksum
on public.import_jobs (source_id, entity_type, source_checksum)
where status = 'completed' and source_checksum is not null;
