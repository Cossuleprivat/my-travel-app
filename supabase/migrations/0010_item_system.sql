-- Sprint 10: Character Customization & Item System
-- Adds items catalog, user inventory, and equipped state on user_profiles.

-- ---------------------------------------------------------------------------
-- 1) Items catalog
-- ---------------------------------------------------------------------------

create table if not exists public.items (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  name          text not null,
  category      text not null check (category in ('background', 'outfit', 'accessory', 'frame')),
  layer         integer not null default 1,
  emoji         text not null,
  unlock_type   text not null check (unlock_type in ('xp_level', 'country_count', 'city_count', 'quest_count')),
  unlock_threshold integer not null default 0,
  price_cents   integer not null default 0,
  seasonal_until date,
  created_at    timestamptz not null default now()
);

-- Items are public read (everyone can see what's available)
alter table public.items enable row level security;
drop policy if exists "items_public_read" on public.items;
create policy "items_public_read"
  on public.items for select using (true);

-- ---------------------------------------------------------------------------
-- 2) User inventory (unlocked items)
-- ---------------------------------------------------------------------------

create table if not exists public.user_items (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  item_id     uuid not null references public.items(id) on delete cascade,
  unlocked_at timestamptz not null default now(),
  unique (user_id, item_id)
);

create index if not exists idx_user_items_user on public.user_items(user_id);

alter table public.user_items enable row level security;

drop policy if exists "user_items_select_own" on public.user_items;
create policy "user_items_select_own"
  on public.user_items for select using (user_id = auth.uid());

drop policy if exists "user_items_insert_own" on public.user_items;
create policy "user_items_insert_own"
  on public.user_items for insert with check (user_id = auth.uid());

drop policy if exists "user_items_delete_own" on public.user_items;
create policy "user_items_delete_own"
  on public.user_items for delete using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- 3) Equipped state on user_profiles
--    JSON shape: { "background": "<item_slug>", "outfit": "<item_slug>", ... }
-- ---------------------------------------------------------------------------

alter table public.user_profiles
  add column if not exists equipped_items jsonb not null default '{}'::jsonb;

-- ---------------------------------------------------------------------------
-- 4) Seed: 15 starter items
-- ---------------------------------------------------------------------------

insert into public.items (slug, name, category, layer, emoji, unlock_type, unlock_threshold) values
  -- Accessories
  ('wanderer-pack',    'Wanderer Pack',    'accessory', 1, '🎒', 'xp_level',     2),
  ('sunglasses',       'Sunglasses',       'accessory', 2, '🕶',  'quest_count',  5),
  ('safari-hat',       'Safari Hat',       'accessory', 3, '🪖', 'country_count', 5),
  ('trekking-boots',   'Trekking Boots',   'accessory', 4, '🥾', 'city_count',   10),
  ('treasure-map',     'Treasure Map',     'accessory', 5, '🗺', 'city_count',   25),
  -- Outfits
  ('explorer-jacket',  'Explorer Jacket',  'outfit',    1, '🧥', 'xp_level',     3),
  ('adventure-vest',   'Adventure Vest',   'outfit',    2, '🦺', 'quest_count',  20),
  -- Backgrounds
  ('mountain-vista',   'Mountain Vista',   'background', 1, '🏔', 'country_count', 3),
  ('city-lights',      'City Lights',      'background', 2, '🌆', 'city_count',   5),
  ('desert-dunes',     'Desert Dunes',     'background', 3, '🏜', 'country_count', 10),
  ('northern-lights',  'Northern Lights',  'background', 4, '🌌', 'country_count', 20),
  -- Frames
  ('bronze-frame',     'Bronze Frame',     'frame',      1, '🔶', 'xp_level',     2),
  ('silver-frame',     'Silver Frame',     'frame',      2, '⬡',  'xp_level',     5),
  ('gold-frame',       'Gold Frame',       'frame',      3, '🔷', 'xp_level',    10),
  ('platinum-frame',   'Platinum Frame',   'frame',      4, '💎', 'country_count', 50)
on conflict (slug) do nothing;
