# Travel Scorer Product Specification (v1)

## 1. Vision
Travel Scorer helps people track where they have been and turns travel goals into game-like quests, so users can unlock cities with 100% completion and plan smarter trips.

## 2. Product Scope
This specification covers MVP v1:
- Tracking visited continents, countries, and cities.
- Completing city quests (landmarks, activities, restaurants, hidden gems).
- Planning trips with stop-level quest lists.
- Showing personal progress in a dashboard.

## 3. Personas
### Persona A: Progress Collector
- Wants to track all visited cities and complete checklists.
- Values completion percentages and badges.

### Persona B: Trip Planner
- Plans upcoming multi-city travel.
- Wants to know which quests are worth doing at each stop.

### Persona C: Casual Explorer
- Uses app occasionally to log memories and key places.
- Needs low friction and simple UX.

## 4. Core User Journeys
1. Sign up -> onboard -> log first city visit.
2. Open city page -> complete quests -> increase city completion.
3. Create trip -> add stops -> view recommended quests per stop.
4. Mark planned quests done during/after trip.
5. View dashboard for total progress and recent achievements.

## 5. Functional Requirements
### 5.1 Authentication and Profile
- Email/password for MVP v1.
- Basic profile fields: display name, home city (optional), travel interests.

### 5.2 Place Tracking
- Data model supports continent -> country -> city hierarchy.
- User can log city visit with:
  - start date (required)
  - end date (optional)
  - notes (optional)
  - media URL (optional)
- Country and continent status derived from city visits.

### 5.3 Quest Engine
- Quest belongs to one city.
- Quest categories:
  - landmark
  - activity
  - restaurant
  - hidden_gem
- Quest states per user:
  - not_started
  - planned
  - completed
- Completion formulas:
  - City completion = completed city quests / total city quests.
  - Country completion = average of city completion values in that country (MVP rule).
  - Continent completion = average of country completion values in that continent (MVP rule).
  - Global explorer score = weighted average (city 50%, country 30%, continent 20%).
- Formula guardrails:
  - If a city has zero quests, city completion = 0 (never NaN/Infinity).
  - If a country has zero cities with quests, country completion = 0.
  - If a continent has zero countries with quest data, continent completion = 0.
  - Global explorer score is rounded to one decimal place for display.

### 5.4 Route Planner
- User can create a trip with title, date range.
- User can add trip stops (city, arrival/departure).
- System can suggest quests for each stop.
- User can mark planned quests as completed.

### 5.5 Dashboard
- KPIs shown to user:
  - visited cities count
  - visited countries count
  - visited continents count
  - overall explorer score
  - recent completed quests

## 6. Non-Functional Requirements
- Type-safe frontend and backend contracts (TypeScript).
- Secure-by-default with Supabase RLS.
- PWA installable baseline.
- Target p95 API response under 500ms for key read endpoints.
- Basic accessibility: keyboard navigation and semantic labels for core views.

## 7. Information Architecture (MVP)
- `/`
- `/auth`
- `/onboarding`
- `/dashboard`
- `/map`
- `/cities/[slug]`
- `/trips`
- `/trips/[id]`
- `/profile`
- `/admin/data` (internal only)

Not in MVP routing:
- `/quests` standalone page (quest management stays contextual)
- `/countries/[code]`
- `/continents/[code]`

## 8. Prioritization (MoSCoW)
### Must
- Auth
- City tracking
- Quest completion
- Basic route planner
- Dashboard basics

### Should
- PWA install prompts
- Streak and badge visuals
- Quest filters by category
- One social login provider (target v1.1)

### Could
- CSV export
- Shared progress card links

### Won't (v1)
- Native mobile app
- Marketplace/booking checkout
- Team challenges

## 9. Event Tracking (Analytics)
- `signup_completed`
- `onboarding_completed`
- `city_visit_logged`
- `quest_planned`
- `quest_completed`
- `trip_created`
- `trip_stop_added`
- `planned_quest_completed`

Required event attributes:
- `user_id`
- `city_id` (when relevant)
- `quest_id` (when relevant)
- `trip_id` (when relevant)
- `timestamp`

## 10. Success Metrics
- Activation rate: users logging first city within 24h.
- Weekly quest completion per WAU.
- D7 retention.
- D30 retention.
- Trips with at least one completed planned quest.

## 11. MVP User Stories with Acceptance Criteria
### Story 1: Register and Onboard
As a new user, I want to create an account and set basic preferences.
- Given new user on auth page, when they sign up successfully, then onboarding starts.
- Given onboarding form, when required fields are provided, then dashboard loads.

### Story 2: Log a City Visit
As a user, I want to record that I visited a city.
- Given city detail page, when user submits valid visit data, then visit is saved.
- Given saved visit, when dashboard reloads, then visited counters update.

### Story 3: Complete a Quest
As a user, I want to mark quests completed and increase progress.
- Given city quest list, when user marks one quest completed, then city completion updates.
- Given city completion update, country/global progress recalculates.

### Story 4: Plan a Trip
As a user, I want to create a trip and add stops.
- Given trips page, when user creates trip with valid title and dates, then trip exists.
- Given trip detail, when stop is added, then stop appears in itinerary.

### Story 5: Manage Planned Quests
As a user, I want planned quests per stop and to mark them done.
- Given trip stop, when user plans quest, then quest state becomes `planned`.
- Given planned quest, when user marks completed, then state becomes `completed` and progress updates.

## 12. Risks and Mitigations
- Quest quality risk: start with curated seed content and editorial rules.
- Scope creep risk: enforce strict MVP contract and backlog labels.
- Data consistency risk: use DB constraints and server-side validation.

## 13. Release Criteria
- All Must features shipped.
- No critical auth/security issues.
- Core E2E journey passes.
- Monitoring dashboards available for activation and completion metrics.

## 14. Technical Governance
- Supabase schema and RLS source-of-truth: `supabase/migrations/` only.
- See `docs/supabase-migrations-source-of-truth.md` for the team rule and workflow.
