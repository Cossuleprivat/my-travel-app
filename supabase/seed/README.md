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
