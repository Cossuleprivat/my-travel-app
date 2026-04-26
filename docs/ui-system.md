# Travel Scorer UI System (Premium Travel Editorial)

## 1) Visual Direction
- Style: premium travel editorial.
- Tone: calm, aspirational, structured, lightly gamified.
- UX principle: content-first, progress-visible, low-friction actions.

## 2) Design Tokens (v1)
### Color roles
- `bg.primary`: page background
- `bg.surface`: cards and panels
- `text.primary`: main content
- `text.secondary`: metadata
- `accent.brand`: primary CTA and highlights
- `accent.success`: completed quest/progress success
- `accent.warning`: pending/planned states
- `border.subtle`: separators and neutral borders

### Typography scale
- `display`: hero titles and city headers
- `h1`, `h2`, `h3`: section hierarchy
- `body`: standard content
- `caption`: metadata and helper text

### Spacing scale
- 4/8/12/16/24/32/48 spacing system.
- Vertical rhythm uses 24 or 32 between major sections.

### Radius and shadows
- Card radius: medium (12px baseline).
- Elevation: minimal and consistent (editorial look).

## 3) Layout System
- Global max width container with generous margins.
- Page anatomy:
  1. Hero (title + short context)
  2. KPI/progress strip
  3. Primary action area
  4. Secondary lists/details
- Sidebar only for dense pages (`/trips/[id]`, `/dashboard` desktop).

## 4) Component Library (v1)
### Core primitives
- `AppShell`
- `TopNav`
- `SectionHeader`
- `StatChip`
- `EmptyState`
- `FilterBar`

### Domain cards
- `CityCard`
  - city name, country, completion ring, visited badge
- `QuestCard`
  - title, category, effort, status chip, action button
- `TripCard`
  - title, date range, stop count, completion preview

### Progress components
- `CityCompletionRing`
- `CountryCompletionBar`
- `ExplorerScoreGauge`
- `QuestStatusPill`

### Form components
- `CityVisitForm`
- `TripForm`
- `TripStopForm`
- `QuestStatusToggle`

## 5) Gamification UI Rules
- Progress always visible at page-top context areas.
- Reward feedback is concise:
  - single toast on completion
  - optional badge reveal drawer
- Avoid game noise:
  - no excessive animations
  - no blocking modal loops for rewards

## 6) Responsive Behavior
- Mobile-first.
- Card stacks on small screens.
- On mobile:
  - sticky bottom primary action for core tasks
  - reduced KPI count per row
- Desktop:
  - richer side-by-side layouts
  - map + list split views where useful

## 7) Accessibility Baseline
- All controls keyboard reachable.
- Visible focus state on actionable elements.
- Contrast target at least WCAG AA for body text and controls.
- Icons must have text labels or aria labels.

## 8) Page-Level Visual Rules
- `/dashboard`: KPI-first, then recent quests and trip activity.
- `/cities/[slug]`: editorial hero image area, then quest list + completion.
- `/trips/[id]`: itinerary timeline + quest panel by selected stop.
- `/map`: full-width map with compact filter and legend.

## 9) Implementation Notes
- Keep tokens in a dedicated theme module.
- Prefer composable, pure functional React components.
- Keep each component single-responsibility and typed.
