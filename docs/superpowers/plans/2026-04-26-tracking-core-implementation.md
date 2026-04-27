# Tracking Core Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Travel Scorer tracking core: hierarchy explorer, visit tracking on all levels (continent/country/city/sight), XP gamification, dashboard redesign, and profile page — per the approved design spec at `docs/superpowers/specs/2026-04-26-tracking-core-design.md`.

**Architecture:** Next.js 15 App Router with Server Components + Server Actions. Supabase Postgres for persistence. Reference data (continents, countries, cities) statically seeded; landmarks fetched on-demand from Wikidata and cached in `quests` table. Auth intentionally disabled — a hardcoded dev user is used and writes go through a server-side Supabase client with the **service role key** (bypasses RLS). When auth lands in Session 05, only the dev-user wiring needs to be replaced.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS, Supabase (postgres-js client), Vitest (for pure-logic unit tests).

**Auth Bypass Strategy (Session 02 only):**
- One row inserted into `auth.users` via Supabase admin SQL (UUID hardcoded in `lib/dev-user.ts`).
- All Server Actions use `createServiceRoleClient()` which bypasses RLS.
- Server Components read with the same client (RLS is bypassed but reference tables are public-read anyway).
- TODO comments mark every spot to revisit in Session 05.

---

## Pre-Flight Checklist (do these before Task 1)

- [ ] **Verify Supabase project is reachable**

You already have the project keys. Open the Supabase dashboard for project `vfxcozgkupzzqhgozyqo` (https://supabase.com/dashboard/project/vfxcozgkupzzqhgozyqo) and confirm:
- The project is **not paused**
- You can access the SQL editor

- [ ] **Get the service role key**

In the Supabase dashboard: Settings → API → `service_role` (secret) key. Copy it. Required for the auth-bypass strategy.

- [ ] **Create a dev user in auth.users**

In the Supabase dashboard: Authentication → Users → "Add user" → "Create new user".
- Email: `dev@travelscorer.local`
- Password: any (we never use it)
- Auto Confirm User: ON

Copy the generated UUID — you'll paste it into `.env.local` in Task 1.

---

## File Structure

### New files (created)
- `.env.local` — Supabase keys + dev-user UUID
- `lib/supabase/client.ts` — browser/anon client
- `lib/supabase/server.ts` — server-side service-role client
- `lib/supabase/types.ts` — database row types
- `lib/dev-user.ts` — dev-user UUID export with TODO marker
- `lib/xp.ts` — XP/level pure logic
- `lib/xp.test.ts` — unit tests for xp.ts
- `lib/achievements.ts` — achievement-check pure logic
- `lib/achievements.test.ts` — unit tests for achievements.ts
- `lib/data/queries.ts` — server-side data fetchers
- `lib/data/wikidata.ts` — Wikidata SPARQL fetcher for sights
- `lib/actions/visits.ts` — Server Actions for tracking
- `lib/actions/search.ts` — Server Action for global search
- `supabase/migrations/0008_tracking_core.sql` — schema additions
- `supabase/seed/01_continents.sql` — 7 continents
- `supabase/seed/02_countries.sql` — ~250 countries
- `supabase/seed/03_cities.sql` — top 3-5 cities per country
- `supabase/seed/README.md` — seeding instructions
- `app/(app)/explore/page.tsx` — continent list
- `app/(app)/explore/[continent]/page.tsx` — country list
- `app/(app)/explore/[continent]/[country]/page.tsx` — city list
- `app/(app)/explore/[continent]/[country]/[city]/page.tsx` — city detail
- `app/(app)/profile/page.tsx` — profile hero + achievements
- `components/explore/SearchBar.tsx`
- `components/explore/Breadcrumb.tsx`
- `components/explore/HierarchyRow.tsx`
- `components/explore/WarHierButton.tsx`
- `components/explore/SightChecklist.tsx`
- `components/dashboard/CharacterCard.tsx`
- `components/dashboard/KpiCard.tsx`
- `components/dashboard/RecentFeed.tsx`
- `components/profile/ProfileHero.tsx`
- `components/profile/AchievementsStrip.tsx`
- `components/profile/CustomizationSlots.tsx`
- `components/layout/BottomNav.tsx`
- `components/ui/PixelSprite.tsx`
- `vitest.config.ts`

### Modified files
- `package.json` — new deps (`@supabase/supabase-js`, `vitest`, `@types/node-fetch`)
- `tailwind.config.ts` — Dark Pixel Adventure tokens
- `app/globals.css` — bg.base default, monospace utility
- `app/layout.tsx` — drop DM_Serif_Display, switch to system + monospace, dark scheme
- `app/(app)/layout.tsx` — uses new AppShell with bottom nav
- `app/(app)/dashboard/page.tsx` — full rebuild per design spec
- `app/(app)/trips/page.tsx` — restyle to dark theme (still skeleton)
- `app/(app)/onboarding/page.tsx` — restyle (still skeleton)
- `app/(public)/page.tsx` — restyle hero
- `components/layout/AppShell.tsx` — bottom-nav layout
- `components/layout/TopNav.tsx` — keep for /(public) only or delete
- `.gitignore` — ensure `.env.local` is ignored (already standard with Next.js)

### Deleted files
- `app/(app)/cities/[slug]/` — replaced by `/explore/.../[city]` (delete after explore route works)

---

## Task 1: Environment, Supabase Client, Dev-User Wiring

**Files:**
- Create: `.env.local`
- Create: `lib/supabase/client.ts`
- Create: `lib/supabase/server.ts`
- Create: `lib/supabase/types.ts`
- Create: `lib/dev-user.ts`
- Modify: `package.json`

- [ ] **Step 1: Install Supabase JS**

Run:
```bash
npm install @supabase/supabase-js
```
Expected: package.json now lists `@supabase/supabase-js` in dependencies.

- [ ] **Step 2: Create `.env.local`**

Create `.env.local` (project root) with:
```
NEXT_PUBLIC_SUPABASE_URL=https://vfxcozgkupzzqhgozyqo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmeGNvemdrdXB6enFoZ296eXFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3OTQ4MzgsImV4cCI6MjA4MzM3MDgzOH0.-bAEmp2Du2cjFcd_2hnlSkGFyF3Ky9RUZZHN4yN4_Tk
SUPABASE_SERVICE_ROLE_KEY=PASTE_FROM_DASHBOARD
DEV_USER_ID=PASTE_UUID_FROM_DASHBOARD
```
Replace the two placeholders with values from the Pre-Flight Checklist.

- [ ] **Step 3: Verify `.gitignore` excludes `.env.local`**

Run: `grep -n "\.env" .gitignore`
Expected: `.env*` or `.env.local` is listed. If not, add `.env*` to `.gitignore`.

- [ ] **Step 4: Create `lib/supabase/types.ts`**

```typescript
// Hand-written row types. Replace with generated types in Session 05 once
// Supabase CLI is wired (npx supabase gen types).

export type Continent = {
  id: string;
  code: string;
  name: string;
  slug: string;
  emoji: string | null;
};

export type Country = {
  id: string;
  continent_id: string;
  code: string;
  iso2: string | null;
  name: string;
  slug: string;
  flag_emoji: string | null;
};

export type City = {
  id: string;
  country_id: string;
  slug: string;
  name: string;
  latitude: number | null;
  longitude: number | null;
};

export type Quest = {
  id: string;
  city_id: string;
  title: string;
  description: string | null;
  category: 'landmark' | 'activity' | 'restaurant' | 'hidden_gem';
};

export type UserCityVisit = {
  id: string;
  user_id: string;
  city_id: string;
  start_date: string | null;
  end_date: string | null;
  notes: string | null;
  created_at: string;
};

export type UserContinentVisit = {
  id: string;
  user_id: string;
  continent_id: string;
  visited_at: string;
};

export type UserCountryVisit = {
  id: string;
  user_id: string;
  country_id: string;
  visited_at: string;
};

export type UserProfile = {
  id: string;
  display_name: string | null;
  home_city_id: string | null;
  travel_interests: string[];
  xp_total: number;
  level: number;
};

export type UserAchievement = {
  id: string;
  user_id: string;
  achievement: string;
  unlocked_at: string;
};
```

- [ ] **Step 5: Create `lib/supabase/client.ts` (browser/anon)**

```typescript
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export function createBrowserClient() {
  return createClient(url, anonKey, {
    auth: { persistSession: false },
  });
}
```

- [ ] **Step 6: Create `lib/supabase/server.ts` (server / service role)**

```typescript
import 'server-only';
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Service-role client — bypasses RLS. Use ONLY in Server Components and
// Server Actions. Never import from a client component.
export function createServiceClient() {
  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set in .env.local');
  }
  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
```

- [ ] **Step 7: Create `lib/dev-user.ts`**

```typescript
// AUTH BYPASS (Session 02): hardcoded dev user.
// Session 05 will replace this with the authenticated user's id from
// the Supabase session.
export const DEV_USER_ID = process.env.DEV_USER_ID!;

if (!DEV_USER_ID) {
  // Fail loud at import time if the env var is missing — there is no
  // graceful fallback because every visit needs a user_id.
  throw new Error(
    'DEV_USER_ID is not set in .env.local. See plan Pre-Flight Checklist.',
  );
}
```

- [ ] **Step 8: Smoke-test the connection**

Create a temporary script `scripts/smoke-test-supabase.mjs`:
```javascript
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const client = createClient(url, key);
const { data, error } = await client.from('continents').select('count');
if (error) {
  console.error('FAIL', error);
  process.exit(1);
}
console.log('OK', data);
```
Run: `npm install --save-dev dotenv && node --env-file=.env.local scripts/smoke-test-supabase.mjs`
Expected: `OK [{ count: 0 }]` (table exists, empty if migrations not yet deployed — or rows returned if they are).
If error mentions table missing, that's fine — Task 4 will deploy migrations.

- [ ] **Step 9: Delete the smoke-test script**

```bash
rm scripts/smoke-test-supabase.mjs && rmdir scripts 2>/dev/null || true
```

- [ ] **Step 10: Commit**

```bash
git add .gitignore lib/ package.json package-lock.json
git commit -m "feat(supabase): wire client, server (service-role), dev-user

Auth is intentionally bypassed for Session 02. Server Actions will use
the service-role client; the dev user UUID is read from env. Replaced
in Session 05 when real auth lands."
```

> Note: do NOT commit `.env.local` — it must stay ignored.

---

## Task 2: Theme Switch — Dark Pixel Adventure Tokens

**Files:**
- Modify: `tailwind.config.ts`
- Modify: `app/globals.css`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Replace tailwind.config.ts with the dark pixel palette**

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        mono: ['ui-monospace', 'Menlo', 'Consolas', 'monospace'],
      },
      colors: {
        bg: {
          base: '#0e1a26',
          surface: '#121e2c',
          elevated: '#162230',
        },
        text: {
          primary: '#c0dff0',
          secondary: '#80a0b8',
          muted: '#405060',
        },
        accent: {
          blue: '#40a0d0',
          amber: '#d48030',
          green: '#40c070',
          purple: '#a060e0',
        },
        border: {
          subtle: '#192535',
          interactive: '#2a5070',
        },
      },
      animation: {
        'fade-up': 'fadeUp 0.3s ease-out both',
        'fade-in': 'fadeIn 0.25s ease-out both',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 2: Replace `app/globals.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html, body {
    background: #0e1a26;
    color: #c0dff0;
    color-scheme: dark;
  }
  html {
    scroll-behavior: smooth;
  }
  :focus-visible {
    outline: 2px solid #40a0d0;
    outline-offset: 2px;
    border-radius: 4px;
  }
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
}

@layer utilities {
  .pixel-border {
    box-shadow:
      inset 0 0 0 1px #2a5070,
      0 0 0 1px #0e1a26;
  }
  .label-mono {
    font-family: ui-monospace, Menlo, Consolas, monospace;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }
}
```

- [ ] **Step 3: Update `app/layout.tsx`**

```typescript
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Travel Scorer — Track every journey",
  description:
    "Track your travels, level up your character, and explore the world.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-bg-base text-text-primary font-sans min-h-screen">
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 4: Verify dev server still boots**

Run: `npm run dev`
Open http://localhost:3000 — expect the existing public landing page with dark background. Some old colors (stone-50/brand-700) will look broken on the public hero — that's fine, Task 11 (or later) handles a quick public-page restyle. Stop the dev server.

- [ ] **Step 5: Commit**

```bash
git add tailwind.config.ts app/globals.css app/layout.tsx
git commit -m "feat(theme): switch to Dark Pixel Adventure palette

Tokens per design spec. Old stone/brand classes still appear on public
landing — restyled in a later task. Bottom nav arrives in Task 10."
```

---

## Task 3: Add Vitest for Pure-Logic Tests

**Files:**
- Create: `vitest.config.ts`
- Modify: `package.json`

- [ ] **Step 1: Install Vitest**

Run:
```bash
npm install --save-dev vitest @vitest/ui
```

- [ ] **Step 2: Create `vitest.config.ts`**

```typescript
import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['lib/**/*.test.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
```

- [ ] **Step 3: Add test script to `package.json`**

In `scripts`, add:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 4: Verify Vitest runs (no tests yet)**

Run: `npm test`
Expected: "No test files found, exiting with code 0" or similar — exit code may be non-zero. Acceptable; we'll have a test in Task 6.

- [ ] **Step 5: Commit**

```bash
git add vitest.config.ts package.json package-lock.json
git commit -m "chore: add vitest for pure-logic unit tests"
```

---

## Task 4: Migration 0008 — Schema Additions

**Files:**
- Create: `supabase/migrations/0008_tracking_core.sql`

- [ ] **Step 1: Write the migration**

```sql
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
```

- [ ] **Step 2: Apply migrations 0001..0008 to Supabase**

There are two paths — pick one:

**Path A (recommended): Supabase MCP tool / SQL editor**

In Supabase dashboard SQL editor, run each migration file in order (0001 → 0008). After each, run `select count(*) from <table>` for one table to confirm it exists. The current implementer (Claude) can also use the Supabase MCP `apply_migration` tool to apply each file by name.

**Path B: psql CLI**
```bash
# requires DATABASE_URL with the postgres password from dashboard → Project Settings → Database
psql "$DATABASE_URL" -f supabase/migrations/0001_phase_a_core_geography.sql
# … and so on through 0008
```

- [ ] **Step 3: Verify schema**

Run this in the Supabase SQL editor:
```sql
select table_name from information_schema.tables
where table_schema = 'public'
  and table_name in (
    'continents', 'countries', 'cities',
    'user_city_visits', 'user_continent_visits', 'user_country_visits',
    'user_profiles', 'user_achievements', 'quests', 'user_quest_progress'
  )
order by table_name;
```
Expected: all 10 rows returned.

Also verify the slug columns exist:
```sql
select column_name from information_schema.columns
where table_schema = 'public' and table_name = 'continents';
```
Expected: includes `slug` and `emoji`.

- [ ] **Step 4: Commit the migration file**

```bash
git add supabase/migrations/0008_tracking_core.sql
git commit -m "feat(db): migration 0008 — slugs, nullable visit dates, XP, achievements

Reference tables get slug/emoji/iso2/flag_emoji. user_city_visits accepts
dateless 'I was here' entries. New tables: user_continent_visits,
user_country_visits, user_achievements. user_profiles gets xp_total +
level. RLS policies in place; service-role bypass used until Session 05."
```

---

## Task 5: Seed Reference Data (Continents, Countries, Cities)

**Files:**
- Create: `supabase/seed/01_continents.sql`
- Create: `supabase/seed/02_countries.sql`
- Create: `supabase/seed/03_cities.sql`
- Create: `supabase/seed/README.md`

> The plan ships continents inline. Countries (~250) and cities (~1000) are too large to embed verbatim in this plan — instead, the implementer generates them programmatically from open-source datasets and writes the resulting SQL. Concrete generation steps below.

- [ ] **Step 1: Write `supabase/seed/01_continents.sql`**

```sql
-- Idempotent: re-runs do nothing.
insert into public.continents (code, name, slug, emoji) values
  ('AF', 'Africa',        'africa',        '🌍'),
  ('AN', 'Antarctica',    'antarctica',    '🧊'),
  ('AS', 'Asia',          'asia',          '🌏'),
  ('EU', 'Europe',        'europe',        '🌍'),
  ('NA', 'North America', 'north-america', '🌎'),
  ('OC', 'Oceania',       'oceania',       '🌏'),
  ('SA', 'South America', 'south-america', '🌎')
on conflict (code) do update set
  slug = excluded.slug,
  emoji = excluded.emoji;
```

- [ ] **Step 2: Generate `02_countries.sql` from REST Countries data**

Create a one-shot generator script `scripts/gen-countries.mjs`:
```javascript
// Generates supabase/seed/02_countries.sql from restcountries.com.
// Run once: `node scripts/gen-countries.mjs`. Delete after.

import { writeFileSync } from 'node:fs';

const REGION_TO_CONTINENT_CODE = {
  Africa: 'AF',
  Americas: null, // split by subregion below
  Asia: 'AS',
  Europe: 'EU',
  Oceania: 'OC',
  Antarctic: 'AN',
};

const SUBREGION_TO_CONTINENT_CODE = {
  'Northern America': 'NA',
  'Central America': 'NA',
  'Caribbean': 'NA',
  'South America': 'SA',
};

function continentCodeFor(country) {
  if (country.region === 'Americas') {
    return SUBREGION_TO_CONTINENT_CODE[country.subregion] ?? 'NA';
  }
  return REGION_TO_CONTINENT_CODE[country.region];
}

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}\s-]/gu, '')
    .trim()
    .replace(/\s+/g, '-');
}

function escape(s) {
  return s.replace(/'/g, "''");
}

const res = await fetch(
  'https://restcountries.com/v3.1/all?fields=name,cca2,cca3,region,subregion,flag',
);
const countries = await res.json();

const rows = countries
  .map((c) => ({
    code: c.cca3,
    iso2: c.cca2,
    name: c.name.common,
    slug: slugify(c.name.common),
    flag: c.flag ?? null,
    continent: continentCodeFor(c),
  }))
  .filter((c) => c.continent && c.code && c.name)
  .sort((a, b) => a.name.localeCompare(b.name));

const lines = rows.map(
  (c) =>
    `  ('${escape(c.code)}', (select id from c where code = '${c.continent}'), '${escape(c.iso2 ?? '')}', '${escape(c.name)}', '${escape(c.slug)}', ${c.flag ? `'${escape(c.flag)}'` : 'null'})`,
);

const sql = `-- Auto-generated from restcountries.com (${rows.length} countries).
-- Regenerate by re-running scripts/gen-countries.mjs.
with c as (select id, code from public.continents)
insert into public.countries (code, continent_id, iso2, name, slug, flag_emoji) values
${lines.join(',\n')}
on conflict (code) do update set
  iso2 = excluded.iso2,
  name = excluded.name,
  slug = excluded.slug,
  flag_emoji = excluded.flag_emoji;
`;

writeFileSync('supabase/seed/02_countries.sql', sql);
console.log(`Wrote ${rows.length} countries.`);
```

Run:
```bash
node scripts/gen-countries.mjs
```
Expected output: `Wrote ~250 countries.`

Verify the file exists and looks sane: `head -30 supabase/seed/02_countries.sql`.

- [ ] **Step 3: Generate `03_cities.sql` from a curated list**

Cities can't be reliably auto-derived from a single open API (GeoNames requires registration, Wikipedia "largest cities" lists are inconsistent). Instead, ship a curated capital-cities seed for now (one per country) and add 2-4 more cities for the top 30 travel countries.

Create `scripts/gen-cities.mjs`:
```javascript
// Generates supabase/seed/03_cities.sql.
// Capitals come from restcountries.com; bonus cities are curated.

import { writeFileSync } from 'node:fs';

// Bonus cities by ISO2 — top destinations to pad beyond capitals.
const BONUS = {
  US: ['New York', 'Los Angeles', 'Chicago', 'San Francisco', 'Miami'],
  GB: ['Manchester', 'Edinburgh', 'Liverpool', 'Birmingham'],
  FR: ['Lyon', 'Marseille', 'Nice', 'Bordeaux'],
  DE: ['Munich', 'Hamburg', 'Cologne', 'Frankfurt'],
  IT: ['Milan', 'Florence', 'Venice', 'Naples'],
  ES: ['Barcelona', 'Valencia', 'Seville'],
  JP: ['Osaka', 'Kyoto', 'Yokohama'],
  CN: ['Shanghai', 'Hong Kong', 'Guangzhou'],
  IN: ['Mumbai', 'Bangalore', 'Kolkata', 'Chennai'],
  BR: ['Rio de Janeiro', 'São Paulo', 'Salvador'],
  CA: ['Toronto', 'Vancouver', 'Montreal'],
  AU: ['Sydney', 'Melbourne', 'Brisbane'],
  MX: ['Cancún', 'Guadalajara', 'Monterrey'],
  TH: ['Phuket', 'Chiang Mai'],
  AE: ['Dubai'],
  TR: ['Istanbul', 'Izmir'],
  EG: ['Alexandria', 'Luxor'],
  ZA: ['Cape Town', 'Johannesburg'],
  AR: ['Córdoba', 'Mendoza'],
  PT: ['Porto', 'Faro'],
  NL: ['Rotterdam', 'The Hague'],
  GR: ['Thessaloniki'],
  RU: ['Saint Petersburg'],
  KR: ['Busan'],
  VN: ['Ho Chi Minh City', 'Da Nang'],
  ID: ['Bali', 'Bandung'],
  PH: ['Cebu City', 'Davao'],
  MA: ['Marrakech', 'Casablanca'],
  PE: ['Cusco'],
  CL: ['Valparaíso'],
};

function slugify(name) {
  return name
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

function escape(s) { return s.replace(/'/g, "''"); }

const res = await fetch(
  'https://restcountries.com/v3.1/all?fields=name,cca2,capital',
);
const countries = await res.json();

const cities = [];
const seenSlug = new Set();

function pushCity(countryIso2, name) {
  let slug = slugify(name);
  let finalSlug = slug;
  let n = 2;
  while (seenSlug.has(finalSlug)) {
    finalSlug = `${slug}-${countryIso2.toLowerCase()}-${n++}`;
  }
  seenSlug.add(finalSlug);
  cities.push({ countryIso2, name, slug: finalSlug });
}

for (const c of countries) {
  const iso2 = c.cca2;
  const caps = c.capital ?? [];
  for (const cap of caps) pushCity(iso2, cap);
  for (const bonus of (BONUS[iso2] ?? [])) pushCity(iso2, bonus);
}

const lines = cities.map(
  (city) =>
    `  ((select id from public.countries where iso2 = '${escape(city.countryIso2)}' limit 1), '${escape(city.slug)}', '${escape(city.name)}')`,
);

const sql = `-- Auto-generated. ${cities.length} cities (capitals + curated bonuses).
insert into public.cities (country_id, slug, name) values
${lines.join(',\n')}
on conflict (slug) do update set
  name = excluded.name;
`;

writeFileSync('supabase/seed/03_cities.sql', sql);
console.log(`Wrote ${cities.length} cities.`);
```

Run:
```bash
node scripts/gen-cities.mjs
```
Expected: `Wrote ~350 cities.`

- [ ] **Step 4: Apply the seeds to Supabase**

In the Supabase SQL editor (or via the Supabase MCP `execute_sql` tool), run each seed file in order: 01, 02, 03.

Verify:
```sql
select count(*) from continents;        -- expect 7
select count(*) from countries;         -- expect ~250
select count(*) from cities;            -- expect ~350
select c.name, ci.name from continents c
  join countries co on co.continent_id = c.id
  join cities ci on ci.country_id = co.id
  where c.code = 'EU' and co.iso2 = 'DE'
  limit 5;
```
Expected: a handful of German cities (Berlin, Munich, Hamburg, Cologne, Frankfurt).

- [ ] **Step 5: Write `supabase/seed/README.md`**

```markdown
# Seed Data

Reference data for the Travel Scorer hierarchy. Run in this order
against a project that already has migrations 0001..0008 applied:

1. `01_continents.sql` — 7 hand-written rows
2. `02_countries.sql` — auto-generated from restcountries.com
3. `03_cities.sql` — auto-generated capitals + curated bonuses

To regenerate the auto-generated files:
```bash
node scripts/gen-countries.mjs
node scripts/gen-cities.mjs
```

Apply to Supabase via the SQL editor, or via the Supabase CLI:
```bash
psql "$DATABASE_URL" -f supabase/seed/01_continents.sql
psql "$DATABASE_URL" -f supabase/seed/02_countries.sql
psql "$DATABASE_URL" -f supabase/seed/03_cities.sql
```

Sights/landmarks are NOT seeded — they're fetched on-demand from
Wikidata when a city detail page first loads, then cached in `quests`.
```

- [ ] **Step 6: Delete the generator scripts (commit-ready repo)**

The generated SQL is checked in; the scripts are one-shot. Keep them around in `scripts/` if you want to regenerate, but don't gitignore them — small enough to keep tracked. Decision: **keep** the scripts; they document how the seeds were produced.

- [ ] **Step 7: Commit**

```bash
git add supabase/seed scripts/gen-countries.mjs scripts/gen-cities.mjs
git commit -m "feat(seed): continents, countries, cities reference data

- 7 continents (hand-written)
- ~250 countries (restcountries.com)
- ~350 cities (capitals + curated bonuses for top destinations)

Generators kept in scripts/ for reproducibility. Sights stay on-demand."
```

---

## Task 6: XP/Level Pure Logic (TDD)

**Files:**
- Create: `lib/xp.test.ts`
- Create: `lib/xp.ts`

- [ ] **Step 1: Write the failing tests**

Create `lib/xp.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import { XP_EVENTS, calcLevel, levelFromXp, LEVEL_TIERS } from './xp';

describe('XP_EVENTS', () => {
  it('matches the design spec values', () => {
    expect(XP_EVENTS.continentVisit).toBe(100);
    expect(XP_EVENTS.countryVisit).toBe(50);
    expect(XP_EVENTS.cityVisit).toBe(10);
    expect(XP_EVENTS.sightCompleted).toBe(5);
    expect(XP_EVENTS.dateBonus).toBe(3);
    expect(XP_EVENTS.noteBonus).toBe(2);
  });
});

describe('levelFromXp', () => {
  it('returns 1 for 0 XP', () => {
    expect(levelFromXp(0)).toBe(1);
  });

  it('returns 1 for 99 XP (below first threshold)', () => {
    expect(levelFromXp(99)).toBe(1);
  });

  it('returns 2 at exactly 100 XP', () => {
    expect(levelFromXp(100)).toBe(2);
  });

  it('returns 5 at 600 XP (Explorer)', () => {
    expect(levelFromXp(600)).toBe(5);
  });

  it('returns 30 at 30000 XP (Legend)', () => {
    expect(levelFromXp(30000)).toBe(30);
  });

  it('caps at the highest tier for higher XP', () => {
    expect(levelFromXp(99999)).toBe(30);
  });
});

describe('calcLevel', () => {
  it('returns full breakdown for a mid-progress user', () => {
    const r = calcLevel(700);
    expect(r.level).toBe(5);
    expect(r.title).toBe('Explorer');
    expect(r.currentXp).toBe(700);
    expect(r.tierXpStart).toBe(600);
    expect(r.tierXpEnd).toBe(1500); // next tier (Pathfinder, level 8)
    expect(r.xpIntoTier).toBe(100);
    expect(r.xpToNextTier).toBe(800);
    expect(r.progressPct).toBeCloseTo(11.11, 1);
  });

  it('clamps progress at 100% for max tier', () => {
    const r = calcLevel(50000);
    expect(r.level).toBe(30);
    expect(r.title).toBe('Legend');
    expect(r.progressPct).toBe(100);
    expect(r.tierXpEnd).toBeNull();
  });
});

describe('LEVEL_TIERS', () => {
  it('is sorted ascending by xp', () => {
    const sorted = [...LEVEL_TIERS].sort((a, b) => a.xp - b.xp);
    expect(LEVEL_TIERS).toEqual(sorted);
  });
});
```

- [ ] **Step 2: Run the tests — expect failure**

Run: `npm test`
Expected: FAIL — `xp.ts` does not export `XP_EVENTS`, `calcLevel`, etc.

- [ ] **Step 3: Implement `lib/xp.ts`**

```typescript
export const XP_EVENTS = {
  continentVisit: 100,
  countryVisit: 50,
  cityVisit: 10,
  sightCompleted: 5,
  dateBonus: 3,
  noteBonus: 2,
} as const;

export type LevelTier = {
  level: number;
  xp: number;
  title: string;
};

export const LEVEL_TIERS: readonly LevelTier[] = [
  { level: 1,  xp: 0,     title: 'Newcomer' },
  { level: 2,  xp: 100,   title: 'Wanderer' },
  { level: 3,  xp: 250,   title: 'Traveler' },
  { level: 5,  xp: 600,   title: 'Explorer' },
  { level: 8,  xp: 1500,  title: 'Pathfinder' },
  { level: 12, xp: 4000,  title: 'Seasoned Explorer' },
  { level: 20, xp: 12000, title: 'World Citizen' },
  { level: 30, xp: 30000, title: 'Legend' },
];

export function levelFromXp(xp: number): number {
  let current = LEVEL_TIERS[0];
  for (const tier of LEVEL_TIERS) {
    if (xp >= tier.xp) current = tier;
    else break;
  }
  return current.level;
}

export type LevelBreakdown = {
  level: number;
  title: string;
  currentXp: number;
  tierXpStart: number;
  tierXpEnd: number | null;
  xpIntoTier: number;
  xpToNextTier: number;
  progressPct: number;
};

export function calcLevel(xp: number): LevelBreakdown {
  const safe = Math.max(0, Math.floor(xp));
  let current = LEVEL_TIERS[0];
  let next: LevelTier | null = null;
  for (let i = 0; i < LEVEL_TIERS.length; i++) {
    if (safe >= LEVEL_TIERS[i].xp) current = LEVEL_TIERS[i];
    else { next = LEVEL_TIERS[i]; break; }
  }

  const tierXpStart = current.xp;
  const tierXpEnd = next?.xp ?? null;
  const xpIntoTier = safe - tierXpStart;
  const xpToNextTier = next ? next.xp - safe : 0;
  const progressPct = next
    ? (xpIntoTier / (next.xp - tierXpStart)) * 100
    : 100;

  return {
    level: current.level,
    title: current.title,
    currentXp: safe,
    tierXpStart,
    tierXpEnd,
    xpIntoTier,
    xpToNextTier,
    progressPct,
  };
}
```

- [ ] **Step 4: Run the tests — expect pass**

Run: `npm test`
Expected: 9 tests passing in `lib/xp.test.ts`.

- [ ] **Step 5: Commit**

```bash
git add lib/xp.ts lib/xp.test.ts
git commit -m "feat(xp): pure XP/level logic with vitest coverage"
```

---

## Task 7: Achievements Pure Logic (TDD)

**Files:**
- Create: `lib/achievements.test.ts`
- Create: `lib/achievements.ts`

- [ ] **Step 1: Write the failing tests**

Create `lib/achievements.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import { ACHIEVEMENTS, evaluateAchievements } from './achievements';

describe('ACHIEVEMENTS catalog', () => {
  it('contains all 7 base achievements', () => {
    const ids = ACHIEVEMENTS.map((a) => a.id);
    expect(ids).toEqual([
      'first_steps',
      'continent_hopper',
      'world_explorer',
      'country_collector',
      'globe_trotter',
      'city_slicker',
      'sight_seer',
    ]);
  });
});

describe('evaluateAchievements', () => {
  const base = {
    cityCount: 0, continentCount: 0, countryCount: 0, sightCount: 0,
  };

  it('returns empty for a brand new user', () => {
    expect(evaluateAchievements(base)).toEqual([]);
  });

  it('unlocks first_steps after 1 city', () => {
    const r = evaluateAchievements({ ...base, cityCount: 1 });
    expect(r).toContain('first_steps');
  });

  it('unlocks continent_hopper after 2 continents', () => {
    const r = evaluateAchievements({ ...base, continentCount: 2 });
    expect(r).toContain('continent_hopper');
  });

  it('unlocks both world_explorer and continent_hopper at 5 continents', () => {
    const r = evaluateAchievements({ ...base, continentCount: 5 });
    expect(r).toContain('continent_hopper');
    expect(r).toContain('world_explorer');
  });

  it('unlocks country_collector at 10 and globe_trotter at 50', () => {
    expect(evaluateAchievements({ ...base, countryCount: 10 })).toContain('country_collector');
    expect(evaluateAchievements({ ...base, countryCount: 50 })).toContain('globe_trotter');
  });

  it('unlocks city_slicker at 25 cities', () => {
    expect(evaluateAchievements({ ...base, cityCount: 25 })).toContain('city_slicker');
  });

  it('unlocks sight_seer at 50 sights', () => {
    expect(evaluateAchievements({ ...base, sightCount: 50 })).toContain('sight_seer');
  });
});
```

- [ ] **Step 2: Run the tests — expect failure**

Run: `npm test -- lib/achievements.test.ts`
Expected: FAIL — `achievements.ts` does not exist.

- [ ] **Step 3: Implement `lib/achievements.ts`**

```typescript
export type AchievementId =
  | 'first_steps'
  | 'continent_hopper'
  | 'world_explorer'
  | 'country_collector'
  | 'globe_trotter'
  | 'city_slicker'
  | 'sight_seer';

export type Achievement = {
  id: AchievementId;
  title: string;
  description: string;
};

export const ACHIEVEMENTS: readonly Achievement[] = [
  { id: 'first_steps',       title: 'First Steps',       description: 'Track your first city.' },
  { id: 'continent_hopper',  title: 'Continent Hopper',  description: 'Visit 2 continents.' },
  { id: 'world_explorer',    title: 'World Explorer',    description: 'Visit 5 continents.' },
  { id: 'country_collector', title: 'Country Collector', description: 'Visit 10 countries.' },
  { id: 'globe_trotter',     title: 'Globe Trotter',     description: 'Visit 50 countries.' },
  { id: 'city_slicker',      title: 'City Slicker',      description: 'Visit 25 cities.' },
  { id: 'sight_seer',        title: 'Sight Seer',        description: 'Tick 50 sights.' },
];

export type AchievementCounts = {
  cityCount: number;
  continentCount: number;
  countryCount: number;
  sightCount: number;
};

export function evaluateAchievements(c: AchievementCounts): AchievementId[] {
  const unlocked: AchievementId[] = [];
  if (c.cityCount >= 1) unlocked.push('first_steps');
  if (c.continentCount >= 2) unlocked.push('continent_hopper');
  if (c.continentCount >= 5) unlocked.push('world_explorer');
  if (c.countryCount >= 10) unlocked.push('country_collector');
  if (c.countryCount >= 50) unlocked.push('globe_trotter');
  if (c.cityCount >= 25) unlocked.push('city_slicker');
  if (c.sightCount >= 50) unlocked.push('sight_seer');
  return unlocked;
}
```

- [ ] **Step 4: Run the tests — expect pass**

Run: `npm test`
Expected: all xp + achievement tests pass.

- [ ] **Step 5: Commit**

```bash
git add lib/achievements.ts lib/achievements.test.ts
git commit -m "feat(achievements): catalog + threshold evaluator"
```

---

## Task 8: Server-Side Data Queries

**Files:**
- Create: `lib/data/queries.ts`

- [ ] **Step 1: Write `lib/data/queries.ts`**

```typescript
import 'server-only';
import { createServiceClient } from '@/lib/supabase/server';
import type {
  Continent, Country, City, Quest,
  UserProfile,
} from '@/lib/supabase/types';

export async function listContinents(): Promise<Continent[]> {
  const sb = createServiceClient();
  const { data, error } = await sb
    .from('continents')
    .select('id, code, name, slug, emoji')
    .order('name');
  if (error) throw error;
  return data ?? [];
}

export async function getContinentBySlug(slug: string): Promise<Continent | null> {
  const sb = createServiceClient();
  const { data, error } = await sb
    .from('continents')
    .select('id, code, name, slug, emoji')
    .eq('slug', slug)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function listCountriesByContinent(continentId: string): Promise<Country[]> {
  const sb = createServiceClient();
  const { data, error } = await sb
    .from('countries')
    .select('id, continent_id, code, iso2, name, slug, flag_emoji')
    .eq('continent_id', continentId)
    .order('name');
  if (error) throw error;
  return data ?? [];
}

export async function getCountryBySlug(slug: string): Promise<Country | null> {
  const sb = createServiceClient();
  const { data, error } = await sb
    .from('countries')
    .select('id, continent_id, code, iso2, name, slug, flag_emoji')
    .eq('slug', slug)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function listCitiesByCountry(countryId: string): Promise<City[]> {
  const sb = createServiceClient();
  const { data, error } = await sb
    .from('cities')
    .select('id, country_id, slug, name, latitude, longitude')
    .eq('country_id', countryId)
    .order('name');
  if (error) throw error;
  return data ?? [];
}

export async function getCityBySlug(slug: string): Promise<City | null> {
  const sb = createServiceClient();
  const { data, error } = await sb
    .from('cities')
    .select('id, country_id, slug, name, latitude, longitude')
    .eq('slug', slug)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function listSightsForCity(cityId: string): Promise<Quest[]> {
  const sb = createServiceClient();
  const { data, error } = await sb
    .from('quests')
    .select('id, city_id, title, description, category')
    .eq('city_id', cityId)
    .eq('category', 'landmark')
    .eq('is_active', true);
  if (error) throw error;
  return data ?? [];
}

export type UserStats = {
  cityCount: number;
  continentCount: number;
  countryCount: number;
  sightCount: number;
  xpTotal: number;
  level: number;
};

export async function getUserStats(userId: string): Promise<UserStats> {
  const sb = createServiceClient();
  const [cities, continents, countries, sights, profile] = await Promise.all([
    sb.from('user_city_visits').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    sb.from('user_continent_visits').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    sb.from('user_country_visits').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    sb.from('user_quest_progress').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('status', 'completed'),
    sb.from('user_profiles').select('xp_total, level').eq('id', userId).maybeSingle(),
  ]);
  return {
    cityCount: cities.count ?? 0,
    continentCount: continents.count ?? 0,
    countryCount: countries.count ?? 0,
    sightCount: sights.count ?? 0,
    xpTotal: profile.data?.xp_total ?? 0,
    level: profile.data?.level ?? 1,
  };
}

export async function ensureUserProfile(userId: string): Promise<UserProfile> {
  const sb = createServiceClient();
  const { data: existing } = await sb
    .from('user_profiles')
    .select('id, display_name, home_city_id, travel_interests, xp_total, level')
    .eq('id', userId)
    .maybeSingle();
  if (existing) return existing as UserProfile;

  const { data, error } = await sb
    .from('user_profiles')
    .insert({ id: userId, display_name: 'Traveler', travel_interests: [] })
    .select('id, display_name, home_city_id, travel_interests, xp_total, level')
    .single();
  if (error) throw error;
  return data as UserProfile;
}

export type RecentVisit = {
  kind: 'city' | 'country' | 'continent' | 'sight';
  id: string;
  label: string;
  subLabel: string | null;
  at: string;
  xp: number;
};

export async function listRecentActivity(userId: string, limit = 10): Promise<RecentVisit[]> {
  const sb = createServiceClient();

  const [cities, countries, continents, sights] = await Promise.all([
    sb.from('user_city_visits')
      .select('id, created_at, cities!inner(name, slug, country_id, countries!inner(name))')
      .eq('user_id', userId).order('created_at', { ascending: false }).limit(limit),
    sb.from('user_country_visits')
      .select('id, visited_at, countries!inner(name)')
      .eq('user_id', userId).order('visited_at', { ascending: false }).limit(limit),
    sb.from('user_continent_visits')
      .select('id, visited_at, continents!inner(name)')
      .eq('user_id', userId).order('visited_at', { ascending: false }).limit(limit),
    sb.from('user_quest_progress')
      .select('id, completed_at, quests!inner(title, cities!inner(name))')
      .eq('user_id', userId).eq('status', 'completed')
      .order('completed_at', { ascending: false }).limit(limit),
  ]);

  const items: RecentVisit[] = [];
  for (const r of cities.data ?? []) {
    items.push({
      kind: 'city', id: r.id,
      label: (r as any).cities.name,
      subLabel: (r as any).cities.countries.name,
      at: r.created_at, xp: 10,
    });
  }
  for (const r of countries.data ?? []) {
    items.push({ kind: 'country', id: r.id, label: (r as any).countries.name, subLabel: null, at: r.visited_at, xp: 50 });
  }
  for (const r of continents.data ?? []) {
    items.push({ kind: 'continent', id: r.id, label: (r as any).continents.name, subLabel: null, at: r.visited_at, xp: 100 });
  }
  for (const r of sights.data ?? []) {
    items.push({
      kind: 'sight', id: r.id,
      label: (r as any).quests.title,
      subLabel: (r as any).quests.cities.name,
      at: r.completed_at, xp: 5,
    });
  }

  return items
    .sort((a, b) => (a.at < b.at ? 1 : -1))
    .slice(0, limit);
}

export type VisitedSets = {
  continents: Set<string>;
  countries: Set<string>;
  cities: Set<string>;
};

export async function getVisitedSets(userId: string): Promise<VisitedSets> {
  const sb = createServiceClient();
  const [conts, ctrs, cities] = await Promise.all([
    sb.from('user_continent_visits').select('continent_id').eq('user_id', userId),
    sb.from('user_country_visits').select('country_id').eq('user_id', userId),
    sb.from('user_city_visits').select('city_id').eq('user_id', userId),
  ]);
  return {
    continents: new Set((conts.data ?? []).map((r) => r.continent_id)),
    countries: new Set((ctrs.data ?? []).map((r) => r.country_id)),
    cities: new Set((cities.data ?? []).map((r) => r.city_id)),
  };
}

export async function listUserAchievements(userId: string): Promise<string[]> {
  const sb = createServiceClient();
  const { data, error } = await sb
    .from('user_achievements')
    .select('achievement')
    .eq('user_id', userId);
  if (error) throw error;
  return (data ?? []).map((r) => r.achievement);
}
```

- [ ] **Step 2: Type-check**

Run: `npm run typecheck`
Expected: no errors. (If `cities!inner(...)` chain produces `unknown` type errors, the `as any` casts inside `listRecentActivity` are intentional — `@supabase/supabase-js` joins are untyped without generated DB types.)

- [ ] **Step 3: Commit**

```bash
git add lib/data/queries.ts
git commit -m "feat(data): server-side query helpers for tracking core"
```

---

## Task 9: Server Actions for Tracking

**Files:**
- Create: `lib/actions/visits.ts`
- Create: `lib/actions/search.ts`

- [ ] **Step 1: Write `lib/actions/visits.ts`**

```typescript
'use server';

import { revalidatePath } from 'next/cache';
import { createServiceClient } from '@/lib/supabase/server';
import { DEV_USER_ID } from '@/lib/dev-user';
import { XP_EVENTS, levelFromXp } from '@/lib/xp';
import {
  evaluateAchievements,
  type AchievementId,
} from '@/lib/achievements';
import { ensureUserProfile, getUserStats, listUserAchievements } from '@/lib/data/queries';

// AUTH BYPASS: returns hardcoded dev user. Session 05 swaps this with
// supabase.auth.getUser() in middleware.
function getCurrentUserId(): string {
  return DEV_USER_ID;
}

async function awardXpAndCheckAchievements(userId: string, xpDelta: number) {
  const sb = createServiceClient();
  await ensureUserProfile(userId);

  const { data: profile, error: profErr } = await sb
    .from('user_profiles')
    .select('xp_total')
    .eq('id', userId)
    .single();
  if (profErr) throw profErr;

  const newXp = (profile.xp_total ?? 0) + xpDelta;
  const newLevel = levelFromXp(newXp);

  const { error: updErr } = await sb
    .from('user_profiles')
    .update({ xp_total: newXp, level: newLevel })
    .eq('id', userId);
  if (updErr) throw updErr;

  const stats = await getUserStats(userId);
  const earned = evaluateAchievements(stats);
  const existing = new Set(await listUserAchievements(userId));
  const newOnes = earned.filter((a) => !existing.has(a));
  if (newOnes.length > 0) {
    const rows = newOnes.map((a) => ({ user_id: userId, achievement: a }));
    const { error: achErr } = await sb.from('user_achievements').insert(rows);
    if (achErr) throw achErr;
  }

  return { xpTotal: newXp, level: newLevel, newAchievements: newOnes as AchievementId[] };
}

export async function markContinentVisited(continentId: string) {
  const userId = getCurrentUserId();
  const sb = createServiceClient();
  const { error } = await sb
    .from('user_continent_visits')
    .insert({ user_id: userId, continent_id: continentId })
    .select('id');
  // Ignore unique-violation (already visited): Postgres code 23505.
  if (error && error.code !== '23505') throw error;
  if (!error) await awardXpAndCheckAchievements(userId, XP_EVENTS.continentVisit);
  revalidatePath('/explore');
  revalidatePath('/dashboard');
}

export async function unmarkContinentVisited(continentId: string) {
  const userId = getCurrentUserId();
  const sb = createServiceClient();
  const { data: existed } = await sb
    .from('user_continent_visits')
    .select('id').eq('user_id', userId).eq('continent_id', continentId).maybeSingle();
  if (!existed) return;
  const { error } = await sb
    .from('user_continent_visits')
    .delete().eq('user_id', userId).eq('continent_id', continentId);
  if (error) throw error;
  await awardXpAndCheckAchievements(userId, -XP_EVENTS.continentVisit);
  revalidatePath('/explore');
  revalidatePath('/dashboard');
}

export async function markCountryVisited(countryId: string) {
  const userId = getCurrentUserId();
  const sb = createServiceClient();
  const { error } = await sb
    .from('user_country_visits')
    .insert({ user_id: userId, country_id: countryId });
  if (error && error.code !== '23505') throw error;
  if (!error) await awardXpAndCheckAchievements(userId, XP_EVENTS.countryVisit);
  revalidatePath('/explore');
  revalidatePath('/dashboard');
}

export async function unmarkCountryVisited(countryId: string) {
  const userId = getCurrentUserId();
  const sb = createServiceClient();
  const { data: existed } = await sb
    .from('user_country_visits')
    .select('id').eq('user_id', userId).eq('country_id', countryId).maybeSingle();
  if (!existed) return;
  const { error } = await sb
    .from('user_country_visits').delete()
    .eq('user_id', userId).eq('country_id', countryId);
  if (error) throw error;
  await awardXpAndCheckAchievements(userId, -XP_EVENTS.countryVisit);
  revalidatePath('/explore');
  revalidatePath('/dashboard');
}

export type CityVisitInput = {
  cityId: string;
  startDate?: string | null;   // ISO date "YYYY-MM-DD"
  endDate?: string | null;
  notes?: string | null;
};

export async function markCityVisited(input: CityVisitInput) {
  const userId = getCurrentUserId();
  const sb = createServiceClient();

  // For dateless visits, the partial unique index blocks duplicates.
  // For dated visits, the gist exclude blocks overlap. We intercept
  // both to deliver a friendlier "already tracked" no-op.
  const { error } = await sb
    .from('user_city_visits')
    .insert({
      user_id: userId,
      city_id: input.cityId,
      start_date: input.startDate ?? null,
      end_date: input.endDate ?? null,
      notes: input.notes ?? null,
    });

  if (error) {
    if (error.code === '23P01' || error.code === '23505') {
      // Constraint or unique violation = already tracked. Treat as no-op.
      return { alreadyTracked: true };
    }
    throw error;
  }

  let xp = XP_EVENTS.cityVisit;
  if (input.startDate) xp += XP_EVENTS.dateBonus;
  if (input.notes && input.notes.trim().length > 0) xp += XP_EVENTS.noteBonus;

  await awardXpAndCheckAchievements(userId, xp);
  revalidatePath('/explore');
  revalidatePath('/dashboard');
  revalidatePath('/profile');
  return { alreadyTracked: false };
}

export async function toggleSightCompleted(questId: string) {
  const userId = getCurrentUserId();
  const sb = createServiceClient();

  const { data: existing } = await sb
    .from('user_quest_progress')
    .select('id, status')
    .eq('user_id', userId).eq('quest_id', questId).maybeSingle();

  let xpDelta = 0;
  if (existing?.status === 'completed') {
    // Un-complete: per migration 0007 transition guard, we cannot move
    // out of 'completed' — so we delete instead.
    await sb.from('user_quest_progress').delete().eq('id', existing.id);
    xpDelta = -XP_EVENTS.sightCompleted;
  } else if (existing) {
    await sb
      .from('user_quest_progress')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', existing.id);
    xpDelta = XP_EVENTS.sightCompleted;
  } else {
    await sb.from('user_quest_progress').insert({
      user_id: userId, quest_id: questId, status: 'completed',
      completed_at: new Date().toISOString(),
    });
    xpDelta = XP_EVENTS.sightCompleted;
  }

  if (xpDelta !== 0) await awardXpAndCheckAchievements(userId, xpDelta);
  revalidatePath('/explore', 'layout');
  revalidatePath('/dashboard');
}
```

- [ ] **Step 2: Write `lib/actions/search.ts`**

```typescript
'use server';

import { createServiceClient } from '@/lib/supabase/server';

export type SearchResult =
  | { kind: 'continent'; id: string; name: string; slug: string; emoji: string | null }
  | { kind: 'country'; id: string; name: string; slug: string; flag: string | null; continentSlug: string }
  | { kind: 'city'; id: string; name: string; slug: string; countryName: string; countrySlug: string; continentSlug: string };

export async function search(q: string): Promise<SearchResult[]> {
  const term = q.trim();
  if (term.length < 2) return [];
  const like = `%${term}%`;
  const sb = createServiceClient();

  const [conts, ctrs, cities] = await Promise.all([
    sb.from('continents').select('id, name, slug, emoji').ilike('name', like).limit(5),
    sb.from('countries')
      .select('id, name, slug, flag_emoji, continents!inner(slug)')
      .ilike('name', like).limit(8),
    sb.from('cities')
      .select('id, name, slug, countries!inner(name, slug, continents!inner(slug))')
      .ilike('name', like).limit(15),
  ]);

  const results: SearchResult[] = [];
  for (const c of conts.data ?? []) {
    results.push({ kind: 'continent', id: c.id, name: c.name, slug: c.slug, emoji: c.emoji });
  }
  for (const c of ctrs.data ?? []) {
    results.push({
      kind: 'country', id: c.id, name: c.name, slug: c.slug,
      flag: c.flag_emoji,
      continentSlug: (c as any).continents.slug,
    });
  }
  for (const c of cities.data ?? []) {
    results.push({
      kind: 'city', id: c.id, name: c.name, slug: c.slug,
      countryName: (c as any).countries.name,
      countrySlug: (c as any).countries.slug,
      continentSlug: (c as any).countries.continents.slug,
    });
  }
  return results;
}
```

- [ ] **Step 3: Type-check**

Run: `npm run typecheck`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add lib/actions
git commit -m "feat(actions): server actions for visit tracking + search

Each action awards XP, recomputes level, evaluates achievements, and
revalidates affected paths. Constraint violations (already-tracked) are
mapped to friendly no-ops instead of bubbling errors."
```

---

## Task 10: Bottom Nav + AppShell

**Files:**
- Create: `components/layout/BottomNav.tsx`
- Modify: `components/layout/AppShell.tsx`
- Modify: `components/layout/TopNav.tsx` (remove or adapt for /(public) only)
- Modify: `app/(app)/layout.tsx`

- [ ] **Step 1: Create `components/layout/BottomNav.tsx`**

```typescript
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: '⌂' },
  { href: '/explore',   label: 'Explore',   icon: '◎' },
  { href: '/trips',     label: 'Trips',     icon: '✈' },
  { href: '/profile',   label: 'Profile',   icon: '◈' },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Primary"
      className="fixed bottom-0 inset-x-0 z-40 border-t border-border-subtle bg-bg-surface/95 backdrop-blur"
    >
      <ul className="grid grid-cols-4 max-w-2xl mx-auto">
        {ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={[
                  'flex flex-col items-center justify-center py-3 gap-1 text-xs label-mono transition-colors',
                  active
                    ? 'text-accent-blue'
                    : 'text-text-muted hover:text-text-secondary',
                ].join(' ')}
                aria-current={active ? 'page' : undefined}
              >
                <span className="text-xl leading-none" aria-hidden="true">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
```

- [ ] **Step 2: Replace `components/layout/AppShell.tsx`**

```typescript
import { BottomNav } from './BottomNav';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg-base text-text-primary">
      <main className="mx-auto w-full max-w-2xl px-4 pb-24 pt-6">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
```

- [ ] **Step 3: Verify dev server boots and bottom nav renders**

Run: `npm run dev`
Open http://localhost:3000/dashboard. Expect:
- Dark background (#0e1a26).
- Bottom nav with 4 icons (Dashboard, Explore, Trips, Profile).
- The dashboard content is still old/broken (gets fixed in Task 14). That's fine — what we verify here is the shell + nav.

Click each nav item — Dashboard, Explore, Trips, Profile — only Dashboard and Trips should currently render (Explore/Profile will 404). Active state of the nav item should highlight in `accent.blue`.

Stop the dev server.

- [ ] **Step 4: Commit**

```bash
git add components/layout app/\(app\)/layout.tsx
git commit -m "feat(layout): bottom nav + dark app shell

4-item bottom nav per design spec. Active state via usePathname.
Top nav file kept for the public marketing page."
```

---

## Task 11: Pixel Sprite Placeholder

**Files:**
- Create: `components/ui/PixelSprite.tsx`

- [ ] **Step 1: Create the component**

```typescript
type Size = 'sm' | 'md' | 'lg';

const sizeMap: Record<Size, string> = {
  sm: 'w-12 h-12',
  md: 'w-20 h-20',
  lg: 'w-32 h-32',
};

// Static placeholder. Real sprites land in Session 03.
// Renders a minimal CSS pixel-art body (head + body + base) using a
// 7x10 grid of divs.
export function PixelSprite({ size = 'md' }: { size?: Size }) {
  const px = size === 'sm' ? 6 : size === 'md' ? 10 : 16;
  // Color map: 0=transparent, 1=skin, 2=outline, 3=shirt, 4=hair
  const grid: number[][] = [
    [0,0,2,2,2,0,0],
    [0,2,4,4,4,2,0],
    [0,2,1,1,1,2,0],
    [0,0,2,1,2,0,0],
    [0,2,3,3,3,2,0],
    [2,3,3,3,3,3,2],
    [2,3,3,3,3,3,2],
    [2,3,3,3,3,3,2],
    [0,2,3,0,3,2,0],
    [0,2,2,0,2,2,0],
  ];
  const palette = ['transparent', '#e8c8a0', '#0e1a26', '#40a0d0', '#604030'];
  return (
    <div
      className={`${sizeMap[size]} grid grid-cols-7 grid-rows-10 mx-auto`}
      role="img"
      aria-label="Pixel character"
    >
      {grid.flat().map((c, i) => (
        <div
          key={i}
          style={{ background: palette[c], width: px / 7 + 'px', height: px / 10 + 'px' }}
        />
      ))}
    </div>
  );
}
```

> Sizing here uses Tailwind classes; the inner pixel sizes are illustrative — visual quality isn't critical, this is a placeholder for Session 03.

- [ ] **Step 2: Commit**

```bash
git add components/ui/PixelSprite.tsx
git commit -m "feat(ui): placeholder pixel sprite (replaced in Session 03)"
```

---

## Task 12: Explore Route — Continent List

**Files:**
- Create: `app/(app)/explore/page.tsx`
- Create: `components/explore/SearchBar.tsx`
- Create: `components/explore/HierarchyRow.tsx`

- [ ] **Step 1: Create `components/explore/SearchBar.tsx`**

```typescript
'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { search, type SearchResult } from '@/lib/actions/search';

export function SearchBar() {
  const [q, setQ] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [pending, start] = useTransition();

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setQ(value);
    start(async () => {
      setResults(await search(value));
    });
  }

  return (
    <div className="relative mb-4">
      <input
        type="search"
        value={q}
        onChange={onChange}
        placeholder="Search continents, countries, cities…"
        className="w-full rounded-lg bg-bg-elevated px-4 py-3 text-sm text-text-primary placeholder-text-muted border border-border-subtle focus:border-border-interactive focus:outline-none"
      />
      {q.length >= 2 && (
        <ul className="absolute z-30 left-0 right-0 mt-1 max-h-80 overflow-auto rounded-lg bg-bg-surface border border-border-subtle shadow-lg">
          {pending && <li className="p-3 text-sm text-text-muted label-mono">searching…</li>}
          {!pending && results.length === 0 && (
            <li className="p-3 text-sm text-text-muted">No matches.</li>
          )}
          {results.map((r) => {
            const href =
              r.kind === 'continent' ? `/explore/${r.slug}` :
              r.kind === 'country'   ? `/explore/${r.continentSlug}/${r.slug}` :
              `/explore/${r.continentSlug}/${r.countrySlug}/${r.slug}`;
            const subtitle =
              r.kind === 'continent' ? 'Continent' :
              r.kind === 'country'   ? 'Country' :
              `${r.countryName}`;
            const flag =
              r.kind === 'continent' ? r.emoji :
              r.kind === 'country'   ? r.flag :
              null;
            return (
              <li key={`${r.kind}-${r.id}`}>
                <Link
                  href={href}
                  onClick={() => { setQ(''); setResults([]); }}
                  className="flex items-center gap-3 p-3 hover:bg-bg-elevated"
                >
                  <span className="text-xl">{flag ?? '•'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-text-primary text-sm">{r.name}</div>
                    <div className="text-text-muted text-xs">{subtitle}</div>
                  </div>
                  <span className="text-text-muted text-xs label-mono">{r.kind}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create `components/explore/HierarchyRow.tsx`**

```typescript
import Link from 'next/link';

type Status = 'visited' | 'partial' | 'untouched';

export function HierarchyRow({
  href,
  icon,
  title,
  subtitle,
  status,
  badgeText,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  status: Status;
  badgeText?: string;
}) {
  const badge =
    status === 'visited'
      ? { label: badgeText ?? '✓ Visited', cls: 'bg-accent-green/15 text-accent-green' }
      : status === 'partial'
        ? { label: badgeText ?? '·', cls: 'bg-accent-amber/15 text-accent-amber' }
        : { label: badgeText ?? 'New', cls: 'bg-accent-blue/15 text-accent-blue' };

  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-lg bg-bg-surface border border-border-subtle px-4 py-3 hover:bg-bg-elevated hover:border-border-interactive transition-colors"
    >
      <div className="text-2xl w-8 text-center" aria-hidden="true">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="text-text-primary text-sm font-medium truncate">{title}</div>
        {subtitle && <div className="text-text-muted text-xs">{subtitle}</div>}
      </div>
      <span className={`px-2 py-0.5 rounded text-xs label-mono ${badge.cls}`}>
        {badge.label}
      </span>
      <span className="text-text-muted" aria-hidden="true">›</span>
    </Link>
  );
}
```

- [ ] **Step 3: Create `app/(app)/explore/page.tsx`**

```typescript
import { listContinents, listCountriesByContinent, getVisitedSets } from '@/lib/data/queries';
import { DEV_USER_ID } from '@/lib/dev-user';
import { SearchBar } from '@/components/explore/SearchBar';
import { HierarchyRow } from '@/components/explore/HierarchyRow';

export default async function ExplorePage() {
  const continents = await listContinents();
  const visited = await getVisitedSets(DEV_USER_ID);

  // Per-continent country counts (visited / total).
  const counts = await Promise.all(
    continents.map(async (c) => {
      const countries = await listCountriesByContinent(c.id);
      const visitedCount = countries.filter((co) => visited.countries.has(co.id)).length;
      return { continentId: c.id, total: countries.length, visited: visitedCount };
    }),
  );
  const countMap = new Map(counts.map((x) => [x.continentId, x]));

  return (
    <div className="space-y-4">
      <header>
        <h1 className="font-sans text-2xl text-text-primary">Explore</h1>
        <p className="text-text-secondary text-sm mt-1">
          Browse the world or search for a place.
        </p>
      </header>

      <SearchBar />

      <ul className="flex flex-col gap-2">
        {continents.map((c) => {
          const count = countMap.get(c.id);
          const total = count?.total ?? 0;
          const visitedCount = count?.visited ?? 0;
          const isContinentVisited = visited.continents.has(c.id);

          let status: 'visited' | 'partial' | 'untouched' = 'untouched';
          let badge: string | undefined;
          if (isContinentVisited) {
            status = 'visited';
          } else if (visitedCount > 0) {
            status = 'partial';
            badge = `${visitedCount}/${total}`;
          }

          return (
            <li key={c.id}>
              <HierarchyRow
                href={`/explore/${c.slug}`}
                icon={c.emoji ?? '◎'}
                title={c.name}
                subtitle={`${total} countries`}
                status={status}
                badgeText={badge}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
```

- [ ] **Step 4: Manual verification**

Run: `npm run dev`
Open http://localhost:3000/explore — expect:
- Page header "Explore".
- Search bar.
- 7 continent rows with emoji + name + country count + "New" badge (no visits yet).

Try the search bar with "ger" — expect Germany to appear (kind=country) and link to `/explore/europe/germany`.

Stop the dev server.

- [ ] **Step 5: Commit**

```bash
git add app/\(app\)/explore/page.tsx components/explore
git commit -m "feat(explore): continent list + global search bar"
```

---

## Task 13: Explore — Country List + City List

**Files:**
- Create: `app/(app)/explore/[continent]/page.tsx`
- Create: `app/(app)/explore/[continent]/[country]/page.tsx`
- Create: `components/explore/Breadcrumb.tsx`

- [ ] **Step 1: Create `components/explore/Breadcrumb.tsx`**

```typescript
import Link from 'next/link';

type Crumb = { label: string; href?: string };

export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-xs label-mono text-text-muted mb-3">
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((c, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={i} className="flex items-center gap-1">
              {c.href && !isLast ? (
                <Link href={c.href} className="hover:text-text-secondary">{c.label}</Link>
              ) : (
                <span className={isLast ? 'text-text-secondary' : ''}>{c.label}</span>
              )}
              {!isLast && <span aria-hidden="true">›</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
```

- [ ] **Step 2: Create `app/(app)/explore/[continent]/page.tsx`**

```typescript
import { notFound } from 'next/navigation';
import {
  getContinentBySlug, listCountriesByContinent, getVisitedSets,
} from '@/lib/data/queries';
import { DEV_USER_ID } from '@/lib/dev-user';
import { SearchBar } from '@/components/explore/SearchBar';
import { Breadcrumb } from '@/components/explore/Breadcrumb';
import { HierarchyRow } from '@/components/explore/HierarchyRow';
import { ContinentVisitToggle } from '@/components/explore/ContinentVisitToggle';

export default async function ContinentPage({
  params,
}: { params: Promise<{ continent: string }> }) {
  const { continent: slug } = await params;
  const continent = await getContinentBySlug(slug);
  if (!continent) notFound();

  const [countries, visited] = await Promise.all([
    listCountriesByContinent(continent.id),
    getVisitedSets(DEV_USER_ID),
  ]);
  const isContinentVisited = visited.continents.has(continent.id);

  return (
    <div className="space-y-4">
      <Breadcrumb items={[
        { label: 'Explore', href: '/explore' },
        { label: continent.name },
      ]} />
      <header className="flex items-start gap-3">
        <span className="text-3xl" aria-hidden="true">{continent.emoji ?? '◎'}</span>
        <div className="flex-1">
          <h1 className="font-sans text-2xl text-text-primary">{continent.name}</h1>
          <p className="text-text-muted text-xs label-mono mt-1">
            {countries.length} countries
          </p>
        </div>
        <ContinentVisitToggle continentId={continent.id} visited={isContinentVisited} />
      </header>

      <SearchBar />

      <ul className="flex flex-col gap-2">
        {countries.map((co) => {
          const isCountryVisited = visited.countries.has(co.id);
          const status = isCountryVisited ? 'visited' as const : 'untouched' as const;
          return (
            <li key={co.id}>
              <HierarchyRow
                href={`/explore/${continent.slug}/${co.slug}`}
                icon={co.flag_emoji ?? '🏳'}
                title={co.name}
                subtitle={co.iso2 ?? undefined}
                status={status}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
```

- [ ] **Step 3: Create `components/explore/ContinentVisitToggle.tsx`**

```typescript
'use client';

import { useTransition } from 'react';
import { markContinentVisited, unmarkContinentVisited } from '@/lib/actions/visits';

export function ContinentVisitToggle({
  continentId, visited,
}: { continentId: string; visited: boolean }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => start(async () => {
        if (visited) await unmarkContinentVisited(continentId);
        else await markContinentVisited(continentId);
      })}
      className={[
        'rounded-lg px-3 py-2 text-xs label-mono border transition-colors',
        visited
          ? 'bg-accent-green/15 border-accent-green/30 text-accent-green'
          : 'bg-bg-elevated border-border-interactive text-accent-blue hover:bg-accent-blue/10',
        pending && 'opacity-50',
      ].filter(Boolean).join(' ')}
    >
      {pending ? '…' : visited ? '✓ Visited' : '+ Track'}
    </button>
  );
}
```

- [ ] **Step 4: Create `components/explore/CountryVisitToggle.tsx`**

(Identical structure to `ContinentVisitToggle`, swap action imports — actions `markCountryVisited` / `unmarkCountryVisited`, prop `countryId`.)

```typescript
'use client';

import { useTransition } from 'react';
import { markCountryVisited, unmarkCountryVisited } from '@/lib/actions/visits';

export function CountryVisitToggle({
  countryId, visited,
}: { countryId: string; visited: boolean }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => start(async () => {
        if (visited) await unmarkCountryVisited(countryId);
        else await markCountryVisited(countryId);
      })}
      className={[
        'rounded-lg px-3 py-2 text-xs label-mono border transition-colors',
        visited
          ? 'bg-accent-green/15 border-accent-green/30 text-accent-green'
          : 'bg-bg-elevated border-border-interactive text-accent-blue hover:bg-accent-blue/10',
        pending && 'opacity-50',
      ].filter(Boolean).join(' ')}
    >
      {pending ? '…' : visited ? '✓ Visited' : '+ Track'}
    </button>
  );
}
```

- [ ] **Step 5: Create `app/(app)/explore/[continent]/[country]/page.tsx`**

```typescript
import { notFound } from 'next/navigation';
import {
  getContinentBySlug, getCountryBySlug,
  listCitiesByCountry, getVisitedSets,
} from '@/lib/data/queries';
import { DEV_USER_ID } from '@/lib/dev-user';
import { SearchBar } from '@/components/explore/SearchBar';
import { Breadcrumb } from '@/components/explore/Breadcrumb';
import { HierarchyRow } from '@/components/explore/HierarchyRow';
import { CountryVisitToggle } from '@/components/explore/CountryVisitToggle';

export default async function CountryPage({
  params,
}: { params: Promise<{ continent: string; country: string }> }) {
  const { continent: contSlug, country: ctrSlug } = await params;
  const [continent, country] = await Promise.all([
    getContinentBySlug(contSlug),
    getCountryBySlug(ctrSlug),
  ]);
  if (!continent || !country || country.continent_id !== continent.id) notFound();

  const [cities, visited] = await Promise.all([
    listCitiesByCountry(country.id),
    getVisitedSets(DEV_USER_ID),
  ]);
  const isCountryVisited = visited.countries.has(country.id);

  return (
    <div className="space-y-4">
      <Breadcrumb items={[
        { label: 'Explore', href: '/explore' },
        { label: continent.name, href: `/explore/${continent.slug}` },
        { label: country.name },
      ]} />
      <header className="flex items-start gap-3">
        <span className="text-3xl" aria-hidden="true">{country.flag_emoji ?? '🏳'}</span>
        <div className="flex-1">
          <h1 className="font-sans text-2xl text-text-primary">{country.name}</h1>
          <p className="text-text-muted text-xs label-mono mt-1">
            {cities.length} cities
          </p>
        </div>
        <CountryVisitToggle countryId={country.id} visited={isCountryVisited} />
      </header>

      <SearchBar />

      <ul className="flex flex-col gap-2">
        {cities.length === 0 && (
          <li className="text-text-muted text-sm py-6 text-center">
            No cities seeded for {country.name} yet.
          </li>
        )}
        {cities.map((city) => {
          const isCityVisited = visited.cities.has(city.id);
          return (
            <li key={city.id}>
              <HierarchyRow
                href={`/explore/${continent.slug}/${country.slug}/${city.slug}`}
                icon="◉"
                title={city.name}
                status={isCityVisited ? 'visited' : 'untouched'}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
```

- [ ] **Step 6: Manual verification**

Run: `npm run dev`
- `/explore` → Click Europe → see country list (~50 European countries with flags).
- Click "+ Track" on Europe row at the top → expect button to flip to "✓ Visited".
- Click Germany → see German cities.
- Click "+ Track" on Germany header → flips to visited. Going back, Germany should now show as visited.

Stop the dev server.

- [ ] **Step 7: Commit**

```bash
git add app/\(app\)/explore components/explore
git commit -m "feat(explore): country + city list pages with continent/country toggles"
```

---

## Task 14: Wikidata Sights Fetcher + City Detail Page

**Files:**
- Create: `lib/data/wikidata.ts`
- Create: `app/(app)/explore/[continent]/[country]/[city]/page.tsx`
- Create: `components/explore/WarHierButton.tsx`
- Create: `components/explore/SightChecklist.tsx`

- [ ] **Step 1: Create `lib/data/wikidata.ts`**

```typescript
import 'server-only';
import { createServiceClient } from '@/lib/supabase/server';

type WikiSight = { name: string; description?: string };

// Wikidata SPARQL: top "tourist attractions" / heritage sites in a city.
// Filter by `wdt:P31/wdt:P279*` is a tradeoff between precision and recall;
// this query goes for tourist-relevant entities linked to the city.
async function fetchSightsFromWikidata(cityName: string): Promise<WikiSight[]> {
  const sparql = `
    SELECT ?item ?itemLabel ?desc WHERE {
      ?item wdt:P131* ?city .
      ?city rdfs:label "${cityName.replace(/"/g, '\\"')}"@en .
      { ?item wdt:P31/wdt:P279* wd:Q570116 . }
        UNION { ?item wdt:P31/wdt:P279* wd:Q839954 . }
        UNION { ?item wdt:P31/wdt:P279* wd:Q33506 . }
      OPTIONAL { ?item schema:description ?desc . FILTER(LANG(?desc) = "en") }
      SERVICE wikibase:label { bd:serviceParam wikibase:language "en" . }
    }
    LIMIT 12
  `.trim();

  const url =
    'https://query.wikidata.org/sparql?format=json&query=' + encodeURIComponent(sparql);

  const res = await fetch(url, {
    headers: { 'User-Agent': 'TravelScorer/0.1 (dev@travelscorer.local)' },
    cache: 'no-store',
  });
  if (!res.ok) return [];
  const json = (await res.json()) as { results: { bindings: Array<{
    itemLabel?: { value: string };
    desc?: { value: string };
  }> } };
  const rows = json.results.bindings;
  const seen = new Set<string>();
  return rows
    .map((r) => ({
      name: r.itemLabel?.value ?? '',
      description: r.desc?.value,
    }))
    .filter((r) => r.name && !r.name.startsWith('Q') && !seen.has(r.name) && seen.add(r.name));
}

export async function ensureCitySights(cityId: string, cityName: string) {
  const sb = createServiceClient();
  const { data: existing } = await sb
    .from('quests')
    .select('id')
    .eq('city_id', cityId)
    .eq('category', 'landmark')
    .limit(1);
  if (existing && existing.length > 0) return;

  let sights: WikiSight[] = [];
  try { sights = await fetchSightsFromWikidata(cityName); } catch { sights = []; }
  if (sights.length === 0) return;

  const rows = sights.map((s) => ({
    city_id: cityId,
    title: s.name,
    description: s.description ?? null,
    category: 'landmark' as const,
    source: 'wikidata',
    publish_status: 'published',
    is_active: true,
  }));
  await sb.from('quests').insert(rows);
}
```

- [ ] **Step 2: Create `components/explore/WarHierButton.tsx`**

```typescript
'use client';

import { useState, useTransition } from 'react';
import { markCityVisited } from '@/lib/actions/visits';

export function WarHierButton({
  cityId, alreadyTracked,
}: { cityId: string; alreadyTracked: boolean }) {
  const [hintOpen, setHintOpen] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');
  const [pending, start] = useTransition();
  const [done, setDone] = useState(alreadyTracked);

  function onTrack() {
    start(async () => {
      const res = await markCityVisited({
        cityId,
        startDate: startDate || null,
        endDate: endDate || null,
        notes: notes.trim() || null,
      });
      setDone(true);
      if (res.alreadyTracked) {
        // No XP awarded; UI still shows "✓ Visited".
      }
    });
  }

  if (done) {
    return (
      <div className="rounded-xl bg-accent-green/15 border border-accent-green/30 px-4 py-6 text-center">
        <p className="text-accent-green text-lg font-sans">✓ You&apos;ve been here</p>
        <p className="text-text-muted text-xs mt-1">+10 XP added to your journey</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={onTrack}
        disabled={pending}
        className="w-full rounded-xl bg-accent-blue text-bg-base font-sans text-base font-semibold py-4 hover:bg-accent-blue/90 transition-colors disabled:opacity-50"
      >
        {pending ? 'Tracking…' : 'War hier (+10 XP)'}
      </button>

      <button
        type="button"
        onClick={() => setHintOpen((x) => !x)}
        className="w-full text-left text-xs text-text-secondary border border-border-subtle rounded-lg px-3 py-2 hover:bg-bg-elevated"
      >
        {hintOpen ? '−' : '+'} Add date or notes — earns a journal stamp (+5 XP)
      </button>

      {hintOpen && (
        <div className="space-y-2 rounded-lg bg-bg-elevated border border-border-subtle p-3">
          <div className="grid grid-cols-2 gap-2">
            <label className="text-xs label-mono text-text-muted">
              From
              <input
                type="date" value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="block w-full mt-1 bg-bg-surface border border-border-subtle rounded px-2 py-1 text-text-primary text-sm"
              />
            </label>
            <label className="text-xs label-mono text-text-muted">
              To
              <input
                type="date" value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="block w-full mt-1 bg-bg-surface border border-border-subtle rounded px-2 py-1 text-text-primary text-sm"
              />
            </label>
          </div>
          <label className="block text-xs label-mono text-text-muted">
            Notes
            <textarea
              value={notes} maxLength={500}
              onChange={(e) => setNotes(e.target.value)}
              className="block w-full mt-1 bg-bg-surface border border-border-subtle rounded px-2 py-1 text-text-primary text-sm h-20"
              placeholder="What stood out?"
            />
          </label>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Create `components/explore/SightChecklist.tsx`**

```typescript
'use client';

import { useTransition, useState } from 'react';
import { toggleSightCompleted } from '@/lib/actions/visits';

type SightItem = { id: string; title: string; description: string | null; completed: boolean };

export function SightChecklist({ items }: { items: SightItem[] }) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-text-muted py-3">
        No sights cached for this city yet — they appear here on first visit.
      </p>
    );
  }
  return (
    <ul className="flex flex-col gap-2">
      {items.map((s) => <SightRow key={s.id} sight={s} />)}
    </ul>
  );
}

function SightRow({ sight }: { sight: SightItem }) {
  const [done, setDone] = useState(sight.completed);
  const [pending, start] = useTransition();
  return (
    <li>
      <button
        type="button"
        disabled={pending}
        onClick={() => start(async () => {
          setDone((x) => !x);
          await toggleSightCompleted(sight.id);
        })}
        className={[
          'w-full flex items-center gap-3 rounded-lg border px-3 py-2 text-left transition-colors',
          done
            ? 'bg-accent-purple/10 border-accent-purple/30'
            : 'bg-bg-surface border-border-subtle hover:bg-bg-elevated',
        ].join(' ')}
      >
        <span
          className={[
            'w-5 h-5 rounded border flex items-center justify-center text-xs',
            done ? 'bg-accent-purple border-accent-purple text-bg-base' : 'border-border-interactive',
          ].join(' ')}
          aria-hidden="true"
        >
          {done ? '✓' : ''}
        </span>
        <div className="flex-1 min-w-0">
          <div className={done ? 'text-text-secondary line-through' : 'text-text-primary'}>
            {sight.title}
          </div>
          {sight.description && (
            <div className="text-text-muted text-xs truncate">{sight.description}</div>
          )}
        </div>
        <span className="text-xs label-mono text-accent-purple">+5 XP</span>
      </button>
    </li>
  );
}
```

- [ ] **Step 4: Create `app/(app)/explore/[continent]/[country]/[city]/page.tsx`**

```typescript
import { notFound } from 'next/navigation';
import {
  getContinentBySlug, getCountryBySlug, getCityBySlug,
  listSightsForCity, getVisitedSets,
} from '@/lib/data/queries';
import { ensureCitySights } from '@/lib/data/wikidata';
import { createServiceClient } from '@/lib/supabase/server';
import { DEV_USER_ID } from '@/lib/dev-user';
import { Breadcrumb } from '@/components/explore/Breadcrumb';
import { WarHierButton } from '@/components/explore/WarHierButton';
import { SightChecklist } from '@/components/explore/SightChecklist';

export default async function CityPage({
  params,
}: { params: Promise<{ continent: string; country: string; city: string }> }) {
  const { continent: contSlug, country: ctrSlug, city: citySlug } = await params;

  const [continent, country, city] = await Promise.all([
    getContinentBySlug(contSlug),
    getCountryBySlug(ctrSlug),
    getCityBySlug(citySlug),
  ]);
  if (!continent || !country || !city) notFound();
  if (country.continent_id !== continent.id) notFound();
  if (city.country_id !== country.id) notFound();

  // Lazy: trigger Wikidata fetch if no sights cached. Best-effort.
  await ensureCitySights(city.id, city.name);
  const sights = await listSightsForCity(city.id);

  // Which sights has the user completed?
  const sb = createServiceClient();
  const { data: completed } = await sb
    .from('user_quest_progress')
    .select('quest_id')
    .eq('user_id', DEV_USER_ID).eq('status', 'completed');
  const completedSet = new Set((completed ?? []).map((c) => c.quest_id));

  const visited = await getVisitedSets(DEV_USER_ID);
  const alreadyTracked = visited.cities.has(city.id);

  return (
    <div className="space-y-5">
      <Breadcrumb items={[
        { label: 'Explore', href: '/explore' },
        { label: continent.name, href: `/explore/${continent.slug}` },
        { label: country.name, href: `/explore/${continent.slug}/${country.slug}` },
        { label: city.name },
      ]} />

      <header className="flex items-start gap-3">
        <span className="text-3xl" aria-hidden="true">{country.flag_emoji ?? '🏳'}</span>
        <div className="flex-1">
          <h1 className="font-sans text-2xl text-text-primary">{city.name}</h1>
          <p className="text-text-muted text-xs label-mono mt-1">
            {country.name} · {continent.name} · {sights.length} sights
          </p>
        </div>
      </header>

      <WarHierButton cityId={city.id} alreadyTracked={alreadyTracked} />

      <section className="space-y-2">
        <h2 className="text-xs label-mono text-text-muted">Sights</h2>
        <SightChecklist
          items={sights.map((s) => ({
            id: s.id,
            title: s.title,
            description: s.description,
            completed: completedSet.has(s.id),
          }))}
        />
      </section>
    </div>
  );
}
```

- [ ] **Step 5: Manual verification**

Run: `npm run dev`
- Navigate `/explore/europe/germany/berlin`. Expect:
  - Breadcrumb crumbs.
  - Header with German flag + Berlin + count.
  - Big "War hier (+10 XP)" button.
  - Hint banner that expands to date + notes inputs.
  - Sights list (may take 1-2 seconds on first load while Wikidata fills the cache; subsequent loads are instant).
- Click "War hier" — button flips to "✓ You've been here".
- Tick 2-3 sights — they fade out, +5 XP each.
- Hard reload — visit + sight checks persist.

Verify in Supabase SQL editor:
```sql
select count(*) from user_city_visits where user_id = (select id from auth.users where email = 'dev@travelscorer.local');
select count(*) from user_quest_progress where status = 'completed' and user_id = (select id from auth.users where email = 'dev@travelscorer.local');
select xp_total, level from user_profiles where id = (select id from auth.users where email = 'dev@travelscorer.local');
```
Expected: counts > 0, xp_total reflects 10 + 5×N + bonuses.

Stop the dev server.

- [ ] **Step 6: Commit**

```bash
git add app/\(app\)/explore lib/data/wikidata.ts components/explore
git commit -m "feat(explore): city detail with WAR HIER + sights from wikidata

City page lazily fills sights cache from Wikidata SPARQL on first
visit. WAR HIER button supports optional date + notes (each +XP)."
```

---

## Task 15: Dashboard Rebuild

**Files:**
- Replace: `app/(app)/dashboard/page.tsx`
- Create: `components/dashboard/CharacterCard.tsx`
- Create: `components/dashboard/KpiCard.tsx`
- Create: `components/dashboard/RecentFeed.tsx`

- [ ] **Step 1: Create `components/dashboard/KpiCard.tsx`**

```typescript
type Tone = 'blue' | 'amber' | 'green' | 'purple';

const toneClasses: Record<Tone, string> = {
  blue:   'border-accent-blue/30 text-accent-blue',
  amber:  'border-accent-amber/30 text-accent-amber',
  green:  'border-accent-green/30 text-accent-green',
  purple: 'border-accent-purple/30 text-accent-purple',
};

export function KpiCard({
  label, value, total, tone,
}: { label: string; value: number; total?: number; tone: Tone }) {
  return (
    <div className={`rounded-xl bg-bg-surface border ${toneClasses[tone]} p-4`}>
      <div className="text-xs label-mono text-text-muted">{label}</div>
      <div className="mt-1 font-mono text-3xl">
        {value}
        {total !== undefined && (
          <span className="text-text-muted text-base"> / {total}</span>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `components/dashboard/CharacterCard.tsx`**

```typescript
import { PixelSprite } from '@/components/ui/PixelSprite';
import type { LevelBreakdown } from '@/lib/xp';

export function CharacterCard({
  name, level,
}: { name: string; level: LevelBreakdown }) {
  return (
    <section className="rounded-xl bg-bg-surface border border-border-subtle p-5">
      <div className="flex items-center gap-4">
        <PixelSprite size="md" />
        <div className="flex-1 min-w-0">
          <p className="text-xs label-mono text-text-muted">Lvl {level.level}</p>
          <h2 className="font-mono text-lg uppercase tracking-wider truncate">{name}</h2>
          <p className="text-accent-amber text-xs label-mono">{level.title}</p>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex justify-between text-[10px] label-mono text-text-muted">
          <span>{level.currentXp} XP</span>
          <span>{level.tierXpEnd ?? '∞'} XP</span>
        </div>
        <div className="h-2 bg-bg-elevated rounded mt-1 overflow-hidden">
          <div
            className="h-full bg-accent-amber"
            style={{ width: `${Math.min(100, level.progressPct)}%` }}
          />
        </div>
        {level.tierXpEnd && (
          <p className="text-text-muted text-[10px] label-mono mt-1">
            {level.xpToNextTier} XP to next tier
          </p>
        )}
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Create `components/dashboard/RecentFeed.tsx`**

```typescript
import type { RecentVisit } from '@/lib/data/queries';

const KIND_ICONS: Record<RecentVisit['kind'], string> = {
  continent: '🌐',
  country: '🏳',
  city: '◉',
  sight: '★',
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function RecentFeed({ items }: { items: RecentVisit[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl bg-bg-surface border border-border-subtle p-6 text-center text-text-muted text-sm">
        Nothing tracked yet — head to <span className="text-accent-blue">Explore</span> to begin.
      </div>
    );
  }
  return (
    <ul className="rounded-xl bg-bg-surface border border-border-subtle divide-y divide-border-subtle">
      {items.map((it) => (
        <li key={`${it.kind}-${it.id}`} className="flex items-center gap-3 p-3">
          <span className="text-xl" aria-hidden="true">{KIND_ICONS[it.kind]}</span>
          <div className="flex-1 min-w-0">
            <div className="text-text-primary text-sm truncate">{it.label}</div>
            {it.subLabel && (
              <div className="text-text-muted text-xs">{it.subLabel}</div>
            )}
          </div>
          <div className="text-right">
            <div className="text-accent-amber text-xs label-mono">+{it.xp} XP</div>
            <div className="text-text-muted text-[10px] label-mono">{formatDate(it.at)}</div>
          </div>
        </li>
      ))}
    </ul>
  );
}
```

- [ ] **Step 4: Replace `app/(app)/dashboard/page.tsx`**

```typescript
import Link from 'next/link';
import { getUserStats, listRecentActivity, ensureUserProfile } from '@/lib/data/queries';
import { calcLevel } from '@/lib/xp';
import { DEV_USER_ID } from '@/lib/dev-user';
import { CharacterCard } from '@/components/dashboard/CharacterCard';
import { KpiCard } from '@/components/dashboard/KpiCard';
import { RecentFeed } from '@/components/dashboard/RecentFeed';

export default async function DashboardPage() {
  const profile = await ensureUserProfile(DEV_USER_ID);
  const [stats, recent] = await Promise.all([
    getUserStats(DEV_USER_ID),
    listRecentActivity(DEV_USER_ID, 6),
  ]);
  const level = calcLevel(stats.xpTotal);

  return (
    <div className="space-y-5">
      <CharacterCard name={profile.display_name ?? 'Traveler'} level={level} />

      <section className="grid grid-cols-2 gap-3">
        <KpiCard label="Continents" value={stats.continentCount} total={7}    tone="blue" />
        <KpiCard label="Countries"  value={stats.countryCount}  tone="amber" />
        <KpiCard label="Cities"     value={stats.cityCount}     tone="green" />
        <KpiCard label="Sights"     value={stats.sightCount}    tone="purple" />
      </section>

      <section>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs label-mono text-text-muted">Recent</h2>
          <Link href="/explore" className="text-accent-blue text-xs label-mono">Explore →</Link>
        </div>
        <RecentFeed items={recent} />
      </section>
    </div>
  );
}
```

- [ ] **Step 5: Manual verification**

Run: `npm run dev`
Open `/dashboard`. Expect:
- Character card with placeholder pixel sprite, "Traveler" name, level + title, XP bar.
- 4 KPI cards with the counts you set up by tracking earlier.
- Recent feed showing the 6 most recent actions in reverse-chronological order.
- "Explore →" link in top-right of recent.

Stop the dev server.

- [ ] **Step 6: Commit**

```bash
git add app/\(app\)/dashboard components/dashboard
git commit -m "feat(dashboard): pixel-adventure rebuild with character card + KPIs + recent feed"
```

---

## Task 16: Profile Page

**Files:**
- Create: `app/(app)/profile/page.tsx`
- Create: `components/profile/ProfileHero.tsx`
- Create: `components/profile/AchievementsStrip.tsx`
- Create: `components/profile/CustomizationSlots.tsx`

- [ ] **Step 1: Create `components/profile/ProfileHero.tsx`**

```typescript
import { PixelSprite } from '@/components/ui/PixelSprite';
import type { LevelBreakdown } from '@/lib/xp';

export function ProfileHero({
  name, level, stats,
}: {
  name: string;
  level: LevelBreakdown;
  stats: { continents: number; countries: number; cities: number };
}) {
  return (
    <section className="rounded-xl bg-bg-surface border border-border-subtle p-6 text-center">
      <PixelSprite size="lg" />
      <h1 className="mt-4 font-mono uppercase tracking-wider text-xl">{name}</h1>
      <p className="text-accent-amber text-xs label-mono mt-1">
        Lvl {level.level} · {level.title}
      </p>

      <div className="mt-4">
        <div className="h-2 bg-bg-elevated rounded overflow-hidden">
          <div className="h-full bg-accent-amber" style={{ width: `${Math.min(100, level.progressPct)}%` }} />
        </div>
        <p className="text-text-muted text-[10px] label-mono mt-1">
          {level.currentXp} / {level.tierXpEnd ?? '∞'} XP
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-5 text-xs label-mono">
        <div>
          <div className="font-mono text-2xl text-accent-blue">{stats.continents}</div>
          <div className="text-text-muted">Continents</div>
        </div>
        <div>
          <div className="font-mono text-2xl text-accent-amber">{stats.countries}</div>
          <div className="text-text-muted">Countries</div>
        </div>
        <div>
          <div className="font-mono text-2xl text-accent-green">{stats.cities}</div>
          <div className="text-text-muted">Cities</div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Create `components/profile/CustomizationSlots.tsx`**

```typescript
const SLOTS = [
  { id: 'hat', label: 'Hat', icon: '🎩' },
  { id: 'jacket', label: 'Jacket', icon: '🧥' },
  { id: 'glasses', label: 'Glasses', icon: '👓' },
  { id: 'boots', label: 'Boots', icon: '🥾' },
] as const;

export function CustomizationSlots() {
  return (
    <section className="rounded-xl bg-bg-surface border border-border-subtle p-4">
      <h2 className="text-xs label-mono text-text-muted mb-3">Customization</h2>
      <div className="grid grid-cols-4 gap-2">
        {SLOTS.map((s) => (
          <div
            key={s.id}
            className="aspect-square rounded-lg bg-bg-elevated border border-dashed border-border-subtle flex flex-col items-center justify-center text-center opacity-60"
          >
            <span className="text-2xl" aria-hidden="true">{s.icon}</span>
            <span className="text-[10px] label-mono text-text-muted mt-1">{s.label}</span>
          </div>
        ))}
      </div>
      <p className="text-text-muted text-[10px] label-mono mt-3 text-center">
        🔒 Items unlock in Session 03
      </p>
    </section>
  );
}
```

- [ ] **Step 3: Create `components/profile/AchievementsStrip.tsx`**

```typescript
import { ACHIEVEMENTS } from '@/lib/achievements';

export function AchievementsStrip({ unlocked }: { unlocked: Set<string> }) {
  return (
    <section className="rounded-xl bg-bg-surface border border-border-subtle p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs label-mono text-text-muted">Achievements</h2>
        <span className="text-text-muted text-[10px] label-mono">
          {unlocked.size} / {ACHIEVEMENTS.length}
        </span>
      </div>
      <ul className="grid grid-cols-4 gap-2">
        {ACHIEVEMENTS.map((a) => {
          const got = unlocked.has(a.id);
          return (
            <li
              key={a.id}
              title={got ? a.title : 'Locked'}
              className={[
                'aspect-square rounded-lg border flex flex-col items-center justify-center text-center p-1',
                got
                  ? 'bg-accent-amber/15 border-accent-amber/30 text-accent-amber'
                  : 'bg-bg-elevated border-border-subtle text-text-muted opacity-50',
              ].join(' ')}
            >
              <span className="text-xl" aria-hidden="true">{got ? '★' : '·'}</span>
              <span className="text-[9px] label-mono mt-1 leading-tight">{a.title}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
```

- [ ] **Step 4: Create `app/(app)/profile/page.tsx`**

```typescript
import { ensureUserProfile, getUserStats, listUserAchievements } from '@/lib/data/queries';
import { calcLevel } from '@/lib/xp';
import { DEV_USER_ID } from '@/lib/dev-user';
import { ProfileHero } from '@/components/profile/ProfileHero';
import { CustomizationSlots } from '@/components/profile/CustomizationSlots';
import { AchievementsStrip } from '@/components/profile/AchievementsStrip';

export default async function ProfilePage() {
  const profile = await ensureUserProfile(DEV_USER_ID);
  const [stats, ach] = await Promise.all([
    getUserStats(DEV_USER_ID),
    listUserAchievements(DEV_USER_ID),
  ]);
  const level = calcLevel(stats.xpTotal);

  return (
    <div className="space-y-4">
      <ProfileHero
        name={profile.display_name ?? 'Traveler'}
        level={level}
        stats={{ continents: stats.continentCount, countries: stats.countryCount, cities: stats.cityCount }}
      />
      <CustomizationSlots />
      <AchievementsStrip unlocked={new Set(ach)} />

      <section className="rounded-xl bg-bg-surface border border-border-subtle p-4 space-y-3">
        <h2 className="text-xs label-mono text-text-muted">Settings</h2>
        <p className="text-text-secondary text-sm">
          Account &amp; auth land in Session 05. Display name, language,
          notifications, and privacy will live here.
        </p>
      </section>
    </div>
  );
}
```

- [ ] **Step 5: Manual verification**

Run: `npm run dev`. Visit `/profile`. Expect:
- Pixel sprite hero, name, level + title, XP bar, 3 mini-stats.
- Customization slots greyed-out with "🔒 Items unlock in Session 03".
- Achievements grid: those you've unlocked highlight in amber, rest greyed.
- Settings stub.

If you tracked a city + ≥1 sight earlier, "First Steps" should be unlocked.

Stop the dev server.

- [ ] **Step 6: Commit**

```bash
git add app/\(app\)/profile components/profile
git commit -m "feat(profile): hero + customization placeholders + achievements"
```

---

## Task 17: Public Landing + Auxiliary Pages — Theme Coherence Pass

**Files:**
- Modify: `app/(public)/page.tsx`
- Modify: `app/(app)/trips/page.tsx`
- Modify: `app/(app)/onboarding/page.tsx`
- Delete: `app/(app)/cities/[slug]/` (entire directory)
- Delete (optional): `components/layout/TopNav.tsx` if only `(public)` uses it

- [ ] **Step 1: Restyle the public landing page**

Read `app/(public)/page.tsx` — it currently uses old sky/stone classes. Replace its color classes with the dark palette tokens (`bg-bg-base`, `text-text-primary`, `text-accent-blue`, etc.). The hero should look like the dark theme; specifics aren't critical because Session 05 will rework auth and the public marketing page.

For the bare minimum: ensure no white-on-white or stone-on-dark issues. Keep it brief — this is not the focus of Session 02.

- [ ] **Step 2: Restyle the trips skeleton**

Replace `app/(app)/trips/page.tsx` with a dark-theme equivalent that mirrors the existing intent (page header, "Create trip" disabled CTA, empty state). Per spec, Trips remains a placeholder.

```typescript
export default function TripsPage() {
  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-sans text-2xl text-text-primary">My Trips</h1>
        <p className="text-text-secondary text-sm mt-1">
          Plan and track your travel itineraries.
        </p>
      </header>
      <div className="rounded-xl border border-dashed border-border-subtle bg-bg-surface p-12 text-center">
        <p className="text-text-secondary text-sm">
          Trip planning lands in Session 06.
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Restyle the onboarding skeleton**

```typescript
export default function OnboardingPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-md space-y-4 text-center">
        <h1 className="font-sans text-2xl text-text-primary">Welcome to Travel Scorer</h1>
        <p className="text-text-secondary text-sm">
          Onboarding wizard arrives with auth in Session 05.
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Delete the old cities route**

`/cities/[slug]` is replaced by the explore hierarchy. Remove it:
```bash
rm -rf app/\(app\)/cities
```

- [ ] **Step 5: Boot the dev server and click through the whole app**

Run: `npm run dev`. Manually click through:
- `/` — public landing renders cleanly in dark theme.
- `/dashboard`, `/explore`, `/trips`, `/profile` — bottom nav highlights the active tab.
- `/explore` → continent → country → city → "War hier" → returns to dashboard, KPI count incremented.

Stop the dev server.

- [ ] **Step 6: Run the full test + typecheck + lint**

Run:
```bash
npm test
npm run typecheck
npm run lint
```
Expected: all pass. Fix any issues that surface.

- [ ] **Step 7: Commit**

```bash
git add app/\(public\)/page.tsx app/\(app\)/trips/page.tsx app/\(app\)/onboarding/page.tsx
git rm -r app/\(app\)/cities
git commit -m "chore: dark-theme polish across public + skeleton routes; drop old cities route"
```

---

## Task 18: Session-End Branch + PR

**Files:** none (workflow only)

- [ ] **Step 1: Push the branch**

If you're working on `main` directly, create a feature branch retroactively:
```bash
git checkout -b feature/tracking-core
git push -u origin feature/tracking-core
```
If you've already been on a feature branch, just `git push`.

- [ ] **Step 2: Open a PR**

```bash
gh pr create --title "Session 02: Tracking Core" --body "$(cat <<'EOF'
## Summary
- Adds the tracking core (continent/country/city/sight visits + XP + level + achievements).
- Replaces editorial theme with Dark Pixel Adventure tokens.
- Introduces explore hierarchy + global search.
- Migration 0008 + seed data (~7 continents, ~250 countries, ~350 cities).
- Auth still bypassed via dev-user; service-role client used server-side.

## Test plan
- [ ] `/explore` shows 7 continents with country counts.
- [ ] Drilling into a country shows seeded cities.
- [ ] City "War hier" awards 10 XP, ticking sights awards 5 XP each.
- [ ] Dashboard KPIs reflect counts; recent feed lists last 6 actions.
- [ ] Profile shows unlocked achievements after first city.
- [ ] `npm test` passes (xp + achievements suites).
- [ ] `npm run typecheck` passes.
EOF
)"
```

- [ ] **Step 3: Update memory**

Update `~/.claude/projects/-Users-andreacossu-Devprivat-my-travel-app-new/memory/project_travel_scorer.md` to reflect the new state:
- Migrations 0001..0008 deployed to Supabase.
- Seed data live.
- Session 02 implementation complete.
- Next session: 03 — Pixel Characters.

---

## Self-Review Notes

**Spec coverage check:**
- Section 3 (Routes): all 6 routes implemented (`/dashboard`, `/explore`, `/explore/[continent]`, `/explore/[continent]/[country]`, `/explore/[continent]/[country]/[city]`, `/profile`).
- Section 4 (Datenquellen + Migration 0008): all 6 schema changes covered.
- Section 5 (Tracking-Interaktion): WAR HIER button, hint banner, sights checklist all in Task 14. Search bar in Task 12.
- Section 6 (Gamification): XP table in `lib/xp.ts`, level tiers and 7 achievements covered.
- Section 7 (Screens im Detail): Dashboard (Task 15), Explore family (12-14), Profile (Task 16).
- Section 9 (Pre-flight): Tasks 1, 4, 5.

**Out-of-scope items deliberately omitted (per spec section "Out of Scope"):**
- Pixel character sprites (placeholder only)
- Trip planning
- Community/store
- Real auth (dev-user bypass)
- Timeline / journal stamp view
- Map view

**Known limitations / TODOs to revisit:**
- `lib/data/queries.ts` uses `as any` in joined queries due to missing generated DB types. Generate via `npx supabase gen types typescript` in Session 05.
- City data is capitals + curated bonuses (~350). Adding richer data is a Session 04+ task.
- Wikidata query is best-effort and English-only; no retry, no rate-limit handling. Acceptable for MVP.
- "Customization Slots" is presentational only — backing tables come in Session 03.
