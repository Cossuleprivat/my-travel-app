-- RLS policies for Travel Scorer v1
-- Apply after phases A-E.

alter table public.user_profiles enable row level security;
alter table public.user_city_visits enable row level security;
alter table public.user_quest_progress enable row level security;
alter table public.trips enable row level security;
alter table public.trip_stops enable row level security;
alter table public.trip_quests enable row level security;
alter table public.quest_submissions enable row level security;
alter table public.import_jobs enable row level security;
alter table public.import_errors enable row level security;
alter table public.data_sources enable row level security;

alter table public.continents enable row level security;
alter table public.countries enable row level security;
alter table public.cities enable row level security;
alter table public.quests enable row level security;
alter table public.quest_collections enable row level security;
alter table public.city_highlights enable row level security;

drop policy if exists "continents_read_all" on public.continents;
create policy "continents_read_all" on public.continents for select using (true);

drop policy if exists "countries_read_all" on public.countries;
create policy "countries_read_all" on public.countries for select using (true);

drop policy if exists "cities_read_all" on public.cities;
create policy "cities_read_all" on public.cities for select using (true);

drop policy if exists "quests_read_active_all" on public.quests;
create policy "quests_read_active_all" on public.quests for select using (is_active = true and publish_status = 'published');

drop policy if exists "quest_collections_read_published" on public.quest_collections;
create policy "quest_collections_read_published" on public.quest_collections for select using (is_published = true);

drop policy if exists "city_highlights_read_all" on public.city_highlights;
create policy "city_highlights_read_all" on public.city_highlights for select using (true);

drop policy if exists "quests_insert_authenticated" on public.quests;
create policy "quests_insert_authenticated" on public.quests for insert with check (auth.uid() is not null and created_by = auth.uid());

drop policy if exists "quests_update_owner_only" on public.quests;
create policy "quests_update_owner_only" on public.quests for update using (created_by = auth.uid()) with check (created_by = auth.uid());

drop policy if exists "user_profiles_select_own" on public.user_profiles;
create policy "user_profiles_select_own" on public.user_profiles for select using (id = auth.uid());
drop policy if exists "user_profiles_insert_own" on public.user_profiles;
create policy "user_profiles_insert_own" on public.user_profiles for insert with check (id = auth.uid());
drop policy if exists "user_profiles_update_own" on public.user_profiles;
create policy "user_profiles_update_own" on public.user_profiles for update using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "user_city_visits_select_own" on public.user_city_visits;
create policy "user_city_visits_select_own" on public.user_city_visits for select using (user_id = auth.uid());
drop policy if exists "user_city_visits_insert_own" on public.user_city_visits;
create policy "user_city_visits_insert_own" on public.user_city_visits for insert with check (user_id = auth.uid());
drop policy if exists "user_city_visits_update_own" on public.user_city_visits;
create policy "user_city_visits_update_own" on public.user_city_visits for update using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "user_city_visits_delete_own" on public.user_city_visits;
create policy "user_city_visits_delete_own" on public.user_city_visits for delete using (user_id = auth.uid());

drop policy if exists "user_quest_progress_select_own" on public.user_quest_progress;
create policy "user_quest_progress_select_own" on public.user_quest_progress for select using (user_id = auth.uid());
drop policy if exists "user_quest_progress_insert_own" on public.user_quest_progress;
create policy "user_quest_progress_insert_own" on public.user_quest_progress for insert with check (user_id = auth.uid());
drop policy if exists "user_quest_progress_update_own" on public.user_quest_progress;
create policy "user_quest_progress_update_own" on public.user_quest_progress for update using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "user_quest_progress_delete_own" on public.user_quest_progress;
create policy "user_quest_progress_delete_own" on public.user_quest_progress for delete using (user_id = auth.uid());

drop policy if exists "trips_select_own" on public.trips;
create policy "trips_select_own" on public.trips for select using (user_id = auth.uid());
drop policy if exists "trips_insert_own" on public.trips;
create policy "trips_insert_own" on public.trips for insert with check (user_id = auth.uid());
drop policy if exists "trips_update_own" on public.trips;
create policy "trips_update_own" on public.trips for update using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "trips_delete_own" on public.trips;
create policy "trips_delete_own" on public.trips for delete using (user_id = auth.uid());

drop policy if exists "trip_stops_select_owner" on public.trip_stops;
create policy "trip_stops_select_owner" on public.trip_stops for select using (
  exists (select 1 from public.trips t where t.id = trip_stops.trip_id and t.user_id = auth.uid())
);
drop policy if exists "trip_stops_insert_owner" on public.trip_stops;
create policy "trip_stops_insert_owner" on public.trip_stops for insert with check (
  exists (select 1 from public.trips t where t.id = trip_stops.trip_id and t.user_id = auth.uid())
);
drop policy if exists "trip_stops_update_owner" on public.trip_stops;
create policy "trip_stops_update_owner" on public.trip_stops for update using (
  exists (select 1 from public.trips t where t.id = trip_stops.trip_id and t.user_id = auth.uid())
) with check (
  exists (select 1 from public.trips t where t.id = trip_stops.trip_id and t.user_id = auth.uid())
);
drop policy if exists "trip_stops_delete_owner" on public.trip_stops;
create policy "trip_stops_delete_owner" on public.trip_stops for delete using (
  exists (select 1 from public.trips t where t.id = trip_stops.trip_id and t.user_id = auth.uid())
);

drop policy if exists "trip_quests_select_owner" on public.trip_quests;
create policy "trip_quests_select_owner" on public.trip_quests for select using (user_id = auth.uid());
drop policy if exists "trip_quests_insert_owner" on public.trip_quests;
create policy "trip_quests_insert_owner" on public.trip_quests for insert with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.trip_stops ts
    join public.trips t on t.id = ts.trip_id
    where ts.id = trip_quests.trip_stop_id
      and t.user_id = auth.uid()
  )
);
drop policy if exists "trip_quests_update_owner" on public.trip_quests;
create policy "trip_quests_update_owner" on public.trip_quests for update using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "trip_quests_delete_owner" on public.trip_quests;
create policy "trip_quests_delete_owner" on public.trip_quests for delete using (user_id = auth.uid());

drop policy if exists "quest_submissions_select_own" on public.quest_submissions;
create policy "quest_submissions_select_own" on public.quest_submissions for select using (user_id = auth.uid());
drop policy if exists "quest_submissions_insert_own" on public.quest_submissions;
create policy "quest_submissions_insert_own" on public.quest_submissions for insert with check (user_id = auth.uid());
drop policy if exists "quest_submissions_update_own_pending" on public.quest_submissions;
create policy "quest_submissions_update_own_pending" on public.quest_submissions for update using (user_id = auth.uid() and status = 'pending') with check (user_id = auth.uid());
drop policy if exists "quest_submissions_delete_own_pending" on public.quest_submissions;
create policy "quest_submissions_delete_own_pending" on public.quest_submissions for delete using (user_id = auth.uid() and status = 'pending');

drop policy if exists "data_sources_read_all" on public.data_sources;
create policy "data_sources_read_all" on public.data_sources for select using (true);

drop policy if exists "import_jobs_read_authenticated" on public.import_jobs;
create policy "import_jobs_read_authenticated" on public.import_jobs for select using (auth.uid() is not null);
drop policy if exists "import_errors_read_authenticated" on public.import_errors;
create policy "import_errors_read_authenticated" on public.import_errors for select using (auth.uid() is not null);
