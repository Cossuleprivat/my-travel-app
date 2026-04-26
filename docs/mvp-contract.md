# Travel Scorer MVP Contract (v1)

## ENTWICKLUNGSSTRATEGIE: FEATURE-FIRST, AUTH AM ENDE
> **Entscheidung:** Auth ist bewusst deaktiviert, um zunaechst alle App-Features zu bauen und zu validieren.
> Login-Buttons leiten direkt zum Dashboard. Alle App-Routen sind ohne Login erreichbar.
> Die echte Auth-Implementierung (Supabase, Session-Guard, Login-Formulare) erfolgt als letzter Schritt
> vor dem MVP-Release, wenn alle anderen Features fertig und getestet sind.
> Reactivation Checklist: `docs/auth-guard-approach.md`

---

## 1) Product Goal
Travel Scorer v1 is a PWA where users track visited places, complete city quests, and plan trips with quest-aware stop lists.

## 2) Target Users
- Broad travel audience (solo travelers, couples, friends, city-trip users).
- Primary first-use case: users who already visited places and want to track completion.
- Secondary first-use case: users planning an upcoming trip and selecting quests.

## 3) In-Scope (Must Have)
- Authentication and user profile basics.
- Place hierarchy tracking:
  - Continent
  - Country
  - City
- City visit logging:
  - `start_date` (required)
  - `end_date` (optional, defaults to `start_date` semantics for single-day visits)
  - notes (optional)
  - media URL reference (optional)
- Quest system:
  - quest types: landmark, activity, restaurant, hidden_gem
  - city quest completion percentage
  - country and global completion rollups
- Route planner (basic):
  - create trip
  - define trip stops (cities, dates)
  - attach recommended quests to stops
  - plan vs done quest view
- Personal dashboard:
  - explored cities/countries/continents
  - progress percentages
  - recent completed quests

### MVP Route Contract
- Public:
  - `/`
  - `/auth`
- Authenticated user:
  - `/onboarding`
  - `/dashboard`
  - `/map`
  - `/cities/[slug]`
  - `/trips`
  - `/trips/[id]`
  - `/profile`
- Internal-only (MVP operations, non-user-facing):
  - `/admin/data`

## 4) Out of Scope (Not Now)
- Dedicated user-facing route for `/quests` (quest management stays in city/trip/dashboard contexts in v1).
- Dedicated user-facing rollup routes for `/countries/[code]` and `/continents/[code]`.
- Public social feed.
- Full community moderation workflow UI.
- Real-time multiplayer/team challenges.
- Revenue features (subscriptions, ads, affiliate checkouts).
- Native mobile app (PWA only in v1).
- Offline-first completeness (only essential caching in v1).

## 5) Success Metrics (MVP)
- Activation: user completes onboarding and logs first city within 24 hours.
- Engagement: weekly quest completions per active user.
- Retention: D7 and D30 return rate.
- Planning utility: percentage of created trips with at least one completed planned quest.

## 6) Quality Gates
- All user-owned records protected by Supabase RLS.
- Type-safe data access in TypeScript.
- Core calculations covered by unit tests:
  - city completion percent
  - country completion percent
  - continent completion percent
  - global explorer score
  - zero-denominator guardrails return 0 (never NaN/Infinity)
- Critical flow covered by E2E:
  - sign up -> log city -> complete quest -> create trip -> mark planned quest done

## 7) MVP Definition of Done
MVP is complete when:
1. New user can sign up, onboard, and log at least one visit.
2. User can complete quests and see city/country/global progress.
3. User can create a trip, add stops, and track planned vs done quests.
4. Dashboard reflects latest progress within acceptable latency.
5. Core flow tests are green in CI.
