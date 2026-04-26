# Open Data Import Process (No Runtime Third-Party Services)

Related governance:
- Supabase source-of-truth and migration workflow: `docs/supabase-migrations-source-of-truth.md`

## 1) Goals
- Keep runtime fully on Supabase.
- Use only free/open datasets for geography and baseline quest data.
- Maintain traceability and quality via import metadata and validation.

## 2) Source Strategy
### Geography (continents, countries, cities)
- Primary source types: ISO/UN style open datasets.
- Import mode:
  - initial seed (manual curated starter set)
  - periodic bulk refresh jobs

### Quest seed data
- Curated editorial CSV/JSON per city.
- Optional enrichment from public tourism portals (manual normalization only).

## 3) Data Contracts
### Continents
- required: `code`, `name`

### Countries
- required: `code`, `name`, `continent_code`

### Cities
- required: `slug`, `name`, `country_code`
- optional: `latitude`, `longitude`

### Quests
- required: `city_slug`, `title`, `category`
- optional: `description`, `difficulty`, `estimated_minutes`, `estimated_cost_eur`

## 4) Validation Rules
- code/slug uniqueness per entity.
- geography references must exist:
  - country -> continent
  - city -> country
  - quest -> city
- coordinates must be in valid range.
- quest category must be one of:
  - landmark
  - activity
  - restaurant
  - hidden_gem
- reject rows missing required fields.

## 5) Import Pipeline (Manual + Auditable)
1. Upload source file to a controlled import storage location.
2. Register source in `data_sources` (if new).
3. Create `import_jobs` row with status `running`.
4. Parse and validate rows.
5. Upsert valid rows into target tables.
6. Log invalid rows into `import_errors`.
7. Mark job `completed` or `failed`.
8. Review import report in `/admin/data`.

## 6) Upsert Policy
- Continents: upsert by `code`.
- Countries: upsert by `code`.
- Cities: upsert by `slug`.
- Quests: upsert by deterministic key `quest_external_key`, derived as `sha256(city_slug + "|" + normalized_title + "|" + category)`.

## 7) Quality Gates
- Import is accepted when:
  - fatal errors = 0
  - row-level error ratio below threshold (e.g. < 2%)
  - referential integrity checks pass
- If an import is accepted with non-fatal row errors, scoring/KPI jobs must exclude failed rows and use only successfully upserted records.
- If threshold exceeded:
  - mark job `failed`
  - keep all errors in `import_errors`
  - no destructive delete operations

KPI consistency rule:
- Analytics and completion metrics must read from production entity tables (`continents`, `countries`, `cities`, `quests`) after successful upsert only, never from raw import payloads.

## 8) Operational Safety
- Never hard-delete production geography records in import flow.
- Prefer deactivation flags over deletion for quests (`is_active = false`).
- Run imports off-peak when possible.
- Keep one-click rollback script per import batch (transactional where feasible).

## 9) SQL Objects Used
- `data_sources`
- `import_jobs`
- `import_errors`
- `continents`
- `countries`
- `cities`
- `quests`

## 10) Future Enhancements
- Add checksums for source files to detect unchanged datasets.
- Add schema-version column to import jobs.
- Add automated diff reports (inserted/updated/deactivated counts by entity).
