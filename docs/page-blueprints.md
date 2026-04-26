# Travel Scorer Page Blueprints (Wireframe Level)

Scope labels:
- MVP: user-facing route included in v1.
- internal MVP: operational route for internal/admin use in v1.
- Post-MVP: not part of v1 delivery scope.

## `/` Landing
### Blocks
1. Hero value proposition
2. Feature highlights (tracking, quests, planner)
3. Example progress visuals
4. Signup CTA

### Functions
- Explain product value.
- Convert visitors to signup.

### Primary actions
- `Create account`
- `Sign in`

## `/auth`
### Blocks
1. Auth tabs (login/signup)
2. Credentials form
3. Optional social login (Post-MVP target v1.1)

### Functions
- Account creation and sign-in.

### Primary actions
- `Sign up`
- `Sign in`

## `/onboarding`
### Blocks
1. Intro step
2. Profile fields (display name, interests)
3. Optional home city select
4. Completion CTA

### Functions
- Collect minimal personalization.

### Primary actions
- `Continue`
- `Finish onboarding`

## `/dashboard`
### Blocks
1. Hero with explorer score
2. KPI row (visited cities/countries/continents)
3. Recent completed quests
4. Upcoming trip summary
5. Quick actions panel

### Functions
- Provide global progress overview.
- Offer shortcuts to core flows.

### Primary actions
- `Log city visit`
- `Open city quests`
- `Plan trip`

## `/map`
### Blocks
1. Map canvas
2. Layer filters (continent/country/city)
3. Category filter
4. Selected place detail drawer

### Functions
- Visualize traveled footprint.
- Navigate to place details quickly.

### Primary actions
- `Filter`
- `Open city details`

## `/cities/[slug]`
### Blocks
1. City hero (name, country, completion ring)
2. Quest filters (category/status)
3. Quest list
4. Visit history block
5. Related trip stops block

### Functions
- City-level quest completion and tracking.

### Primary actions
- `Mark quest planned`
- `Mark quest completed`
- `Log city visit`

## `/countries/[code]` (Post-MVP)
### Blocks
1. Country header with completion
2. Cities progress grid
3. Completion trend panel

### Functions
- Country rollup and city drill-down.

### Primary actions
- `Open city`
- `Filter by completion`

## `/continents/[code]` (Post-MVP)
### Blocks
1. Continent header with completion
2. Countries progress table
3. Highlights section

### Functions
- Continent rollup view.

### Primary actions
- `Open country`

## `/quests` (Post-MVP)
### Blocks
1. Status tabs (not_started/planned/completed)
2. Quest list with city metadata
3. Bulk filter row

### Functions
- Centralize user quest management.

### Primary actions
- `Change status`
- `Open city`

## `/trips`
### Blocks
1. Trips header + create CTA
2. Upcoming trips list
3. Past trips list

### Functions
- List and create trips.

### Primary actions
- `Create trip`
- `Open trip`

## `/trips/[id]`
### Blocks
1. Trip hero (title, dates, status)
2. Stops timeline
3. Selected stop quest panel
4. Plan-vs-done summary

### Functions
- Manage itinerary and quest execution.

### Primary actions
- `Add stop`
- `Plan quest`
- `Mark quest done`

## `/profile`
### Blocks
1. Account section
2. Preferences section
3. Privacy and export section

### Functions
- Manage profile and privacy settings.

### Primary actions
- `Save profile`
- `Export data`

## `/admin/data` (internal MVP)
### Blocks
1. Data source registry
2. Import job table
3. Import error log
4. Validation status summary

### Functions
- Operate and audit data pipeline.

### Primary actions
- `Start import`
- `Review errors`
- `Mark source active`
