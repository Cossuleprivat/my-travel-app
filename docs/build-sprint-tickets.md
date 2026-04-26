# Build Sprint Tickets (Sprint 1-10)

## GLOBALE ENTSCHEIDUNG: AUTH BYPASS (Feature-First-Development)
> Auth (T1.2, T2.1, T2.2, T2.3) wird zurueckgestellt.
> Login-Buttons leiten aktuell direkt zum Dashboard. Alle App-Routen sind ohne Login erreichbar.
> Auth wird nach Fertigstellung aller App-Features implementiert und aktiviert.
> Details und Reactivation Checklist: `docs/auth-guard-approach.md`

---

## Mapping to `execution-sprints` (Source Plan 0-6)
- Sprint 1 -> Execution Sprint 0 (Setup and Foundations)
- Sprint 2 -> Execution Sprint 1 (Auth + Profile + Onboarding)
- Sprint 3 -> Execution Sprint 2 (Place Tracking Core)
- Sprint 4 -> Execution Sprint 2 and Sprint 5 split (Map baseline + Dashboard baseline)
- Sprint 5 -> Execution Sprint 3 (Quest Engine MVP, catalog/UI)
- Sprint 6 -> Execution Sprint 3 and Sprint 5 split (Progress UI + reward feedback)
- Sprint 7 -> Execution Sprint 4 (Route Planner MVP, trips core)
- Sprint 8 -> Execution Sprint 4 (Planner quest flow)
- Sprint 9 -> Supports execution governance and DataOps quality hardening
- Sprint 10 -> Execution Sprint 6 (Stabilization and MVP Release)

This ticket document expands implementation granularity and does not redefine product milestone order.

## Sprint 1 - Project Foundation
### T1.1 Initialize app shell
- Scope: Next.js + TypeScript base, routing skeleton, shared layout.
- Acceptance: app starts locally; base routes render.

### T1.2 Supabase client integration — ZURUECKGESTELLT (Auth Bypass aktiv)
- Scope: environment setup, server/client helpers, typed config.
- Acceptance: health check query succeeds; no secrets committed.
- Status: wird nach Feature-Freeze implementiert.

### T1.3 Design token scaffold
- Scope: typography, spacing, color roles, card primitives.
- Acceptance: tokens consumed in at least 2 pages.

## Sprint 2 - Auth and Onboarding — ZURUECKGESTELLT (Auth Bypass aktiv)
> Gesamter Sprint 2 wird nach Feature-Freeze implementiert.

### T2.1 Auth flow pages — ZURUECKGESTELLT
- Scope: signup/login forms with validation (email/password only in v1).
- Acceptance: valid signup/login path works end-to-end.
- Status: Auth Bypass aktiv. Wird nach Feature-Freeze umgesetzt.

### T2.2 Profile bootstrap — ZURUECKGESTELLT
- Scope: insert/update `user_profiles` after signup.
- Acceptance: profile persists across sessions.
- Status: Abhaengig von T2.1.

### T2.3 Onboarding wizard — ZURUECKGESTELLT
- Scope: display name, interests, optional home city.
- Acceptance: onboarding completion redirects to dashboard.

## Sprint 3 - Geography Tracking Core
### T3.1 Seed geography data
- Scope: initial continents/countries/cities seed load.
- Acceptance: app can query and list seeded geography.

### T3.2 City visit logging
- Scope: create/edit/delete city visits with `start_date` (required) and `end_date` (optional).
- Acceptance: visit CRUD works under RLS policies.

### T3.3 Visited counters
- Scope: compute visited city/country/continent counts.
- Acceptance: counters reflect latest visit changes.

## Sprint 4 - Map and Dashboard Base
### T4.1 Map/list view
- Scope: visited places rendered in list and map-ready dataset.
- Acceptance: filters by geography level work.

### T4.2 Dashboard KPI row
- Scope: explorer score summary and top metrics.
- Acceptance: KPIs load under 500ms p95 target.

### T4.3 Quick actions panel
- Scope: shortcuts to visit logging, quests, and trips.
- Acceptance: actions navigate to correct pages.

## Sprint 5 - Quest Catalog and City Page
### T5.1 Quest seed model rollout
- Scope: quest schema + city-linked quest data.
- Acceptance: quests visible for seeded cities.

### T5.2 City quest list UI
- Scope: city page with quest cards and filters.
- Acceptance: category/status filters behave correctly.

### T5.3 Quest status transitions
- Scope: not_started/planned/completed transitions.
- Acceptance: invalid transition states are blocked.

## Sprint 6 - Progress and Rewards
### T6.1 Completion calculations
- Scope: city/country/global progress functions.
- Acceptance: unit tests cover edge cases and pass.

### T6.2 Progress components integration
- Scope: rings/bars/gauge on dashboard and city pages.
- Acceptance: updates visible immediately after status change.

### T6.3 Lightweight reward feedback
- Scope: completion toast and badge reveal.
- Acceptance: reward shown once per completion event.

## Sprint 7 - Trips Core
### T7.1 Trip CRUD
- Scope: create/read/update/delete trips.
- Acceptance: only owner can access own trips.

### T7.2 Trip stops timeline
- Scope: add/remove/reorder trip stops.
- Acceptance: position uniqueness and date constraints enforced.

### T7.3 Trip detail layout
- Scope: itinerary + stop detail panel.
- Acceptance: selected stop state persists in UI.

## Sprint 8 - Planner Quest Flow
### T8.1 Attach quests to stops
- Scope: add/remove quests in trip stop context.
- Acceptance: quest assignment persisted in `trip_quests`.

### T8.2 Plan-vs-done transitions
- Scope: mark planned quest done from trip page.
- Acceptance: completion syncs to quest progress.

### T8.3 Planner summary widgets
- Scope: planned/completed/open quest counters per trip.
- Acceptance: counts consistent with DB state.

## Sprint 9 - Data Ops and Import Quality
### T9.1 Admin data page baseline
- Scope: list sources, jobs, errors.
- Acceptance: latest job and error details visible.

### T9.2 Manual import command/runbook
- Scope: documented import execution path.
- Acceptance: dry-run and real-run checklists available.

### T9.3 Validation enforcement
- Scope: apply data contract validations and error logging.
- Acceptance: invalid rows land in `import_errors` reliably.

## Sprint 10 - Stabilization and Release
### T10.1 E2E core journey
- Scope: signup -> visit -> quest -> trip -> completion flow.
- Acceptance: green in CI for main user journey.

### T10.2 Security and RLS audit
- Scope: verify policy coverage by table and route.
- Acceptance: no cross-user data access observed.

### T10.3 Release checklist
- Scope: known limitations, rollback notes, KPI dashboard links.
- Acceptance: release candidate sign-off complete.

### T10.4 Performance verification pack
- Scope: benchmark `/dashboard`, `/cities/[slug]`, `/trips/[id]` read paths against p95 target.
- Acceptance: documented results show p95 <= 500ms or have approved exceptions with mitigation tasks.

## Priority Order Across All Tickets
1. Infrastructure and auth
2. Geography and tracking
3. Quest engine
4. Route planner
5. Data operations
6. Stabilization
