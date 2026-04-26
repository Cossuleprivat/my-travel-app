# Travel Scorer Execution Sprints

## Sprint 0 - Setup and Foundations
### Goal
Create implementation-ready project infrastructure for a PWA + Supabase stack.

### Deliverables
- Next.js + TypeScript project bootstrap.
- Supabase project wiring (`anon` key via env vars, no secrets in code).
- Basic layout, routing skeleton, and auth guard utilities.
- CI baseline (lint + typecheck + test command placeholders).

### Acceptance Criteria
- App boots locally and in preview environment.
- Auth client initializes without runtime errors.
- CI job passes on clean branch.

### Risks
- Environment drift between local and hosted setup.

### Exit Criteria
- Team can start feature development without infra blockers.

---

## Sprint 1 - Auth + Profile + Onboarding
### Goal
Users can sign up/sign in and complete a minimal onboarding flow.

### Deliverables
- Email/password auth UI.
- Profile persistence in `user_profiles`.
- Onboarding fields: display name, interests, optional home city.
- Social login explicitly deferred to v1.1.

### Acceptance Criteria
- New account can complete onboarding in one flow.
- Profile data is persisted and read back after refresh.
- RLS prevents profile access across users.

### Test Focus
- E2E: sign-up to dashboard redirect.
- Integration: profile insert/update APIs.

---

## Sprint 2 - Place Tracking Core
### Goal
Users can log visited cities and see visited counts.

### Deliverables
- City search/select UI.
- Visit logging form (`user_city_visits`) with `start_date` required and `end_date` optional.
- Counters for visited cities/countries/continents.
- Basic map/list page to view visited places.

### Acceptance Criteria
- User can create, edit, and delete own city visits.
- Country/continent counters update consistently.
- No cross-user data visibility.

### Test Focus
- Unit: hierarchy rollup helpers.
- Integration: visit CRUD under RLS.

---

## Sprint 3 - Quest Engine MVP
### Goal
Users can browse city quests, plan or complete them, and see progress.

### Deliverables
- City quest list UI with category filters.
- `user_quest_progress` state transitions.
- Progress calculations:
  - city completion
  - country completion
  - global explorer score
- Recent quest activity section in dashboard.

### Acceptance Criteria
- Quest status transitions are valid and persisted.
- Completion percentages update within one refresh.
- Invalid transitions are rejected safely.
- Zero-data edge cases return `0` percentages/scores (no NaN/Infinity).

### Test Focus
- Unit: scoring and percentage math.
- Integration: quest progress transitions.

---

## Sprint 4 - Route Planner MVP
### Goal
Users can create trips, add stops, attach quests, and track plan-vs-done.

### Deliverables
- Trips list and trip detail page.
- `trips` and `trip_stops` CRUD.
- Add/remove quests for each stop (`trip_quests`).
- Mark planned quests as completed from trip context.

### Acceptance Criteria
- User can complete full planning flow for one multi-stop trip.
- Planned quest completion reflects in quest progress/dashboard.
- Trip ownership enforced by RLS.

### Test Focus
- E2E: create trip -> add stop -> plan quest -> complete quest.
- Integration: stop ordering and ownership constraints.

---

## Sprint 5 - Dashboard and Product Analytics
### Goal
Provide actionable feedback loops for users and product team.

### Deliverables
- Dashboard v1 cards and progress widgets.
- Instrumentation for MVP events:
  - signup_completed
  - onboarding_completed
  - city_visit_logged
  - quest_planned
  - quest_completed
  - trip_created
  - trip_stop_added
  - planned_quest_completed
- Internal analytics view/query templates.

### Acceptance Criteria
- Dashboard values match DB-backed calculations.
- Event fire rate above 95% for tested flows.
- Product can compute activation and weekly completion metrics.

### Test Focus
- Contract tests for event payload shape.
- Manual QA checklist for dashboard consistency.

---

## Sprint 6 - Stabilization and MVP Release
### Goal
Ship stable MVP with security and quality baseline.

### Deliverables
- Bug triage and polish pass.
- Performance improvements for top read paths.
- Accessibility pass for core pages.
- Release checklist and rollback playbook.

### Acceptance Criteria
- No P0/P1 bugs open.
- Core user flow E2E green in CI.
- RLS audit completed.
- p95 read latency <= 500ms for `/dashboard`, `/cities/[slug]`, `/trips/[id]` under agreed test dataset.
- MVP release notes and known limitations documented.

---

## Cross-Sprint Governance
- Keep strict "not now" list aligned with `docs/mvp-contract.md`.
- Ticket-level breakdown is maintained in `docs/build-sprint-tickets.md` with an explicit sprint mapping.
- Weekly metric review: activation, quest completions, D7 retention, D30 retention.
- Every sprint includes:
  - security checks (RLS + auth assumptions)
  - test coverage updates
  - migration review for backward compatibility
