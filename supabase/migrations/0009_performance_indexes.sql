-- Performance indexes for Sprint 10 (T10.4)
-- Targets: /dashboard, /cities/[slug], /trips/[id]

-- dashboard: getUserStats filters quest_progress by user_id + status='completed'
create index if not exists idx_uqp_user_status
  on public.user_quest_progress (user_id, status);

-- dashboard: listRecentActivity joins on completed_at desc
create index if not exists idx_uqp_user_completed_at
  on public.user_quest_progress (user_id, completed_at desc)
  where status = 'completed';

-- dashboard: user_city_visits ordered by created_at desc
create index if not exists idx_ucv_user_created_at
  on public.user_city_visits (user_id, created_at desc);

-- dashboard: user_country_visits ordered by visited_at desc
create index if not exists idx_uctr_user_visited_at
  on public.user_country_visits (user_id, visited_at desc);

-- dashboard: user_continent_visits ordered by visited_at desc
create index if not exists idx_ucont_user_visited_at
  on public.user_continent_visits (user_id, visited_at desc);

-- city page: quests filtered by city_id + active + category
create index if not exists idx_quests_city_active_category
  on public.quests (city_id, is_active, category)
  where is_active = true;

-- trips: trip_stops ordered by position for itinerary
create index if not exists idx_trip_stops_trip_position
  on public.trip_stops (trip_id, position);

-- trips: trip_quests for a given stop
create index if not exists idx_trip_quests_stop_user
  on public.trip_quests (trip_stop_id, user_id);

-- profile: user_achievements lookup
create index if not exists idx_user_achievements_user_unlocked
  on public.user_achievements (user_id, unlocked_at desc);
