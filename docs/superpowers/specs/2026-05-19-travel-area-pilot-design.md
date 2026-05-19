# Travel als nativer Bereich — Pilot für „Bereich = App"

> Stand: 2026-05-19 · Branch-Basis: `claude/interesting-gagarin-e66bf0` → Ziel `main`
> Spec-Typ: Design (brainstorming → writing-plans)

## 1. Ziel & Motivation

Travel ist heute kein sauberer eigener Bereich: `travelModule.href` zeigt auf
`/dashboard`, die Sidebar hat „Travel" als **hartkodierte** Sondersektion, und die
Travel-Inhalte (`/explore`, `/trips`) liegen flach auf oberster Ebene ohne gemeinsames
Zuhause.

**Vision des Nutzers:** Jarvis ist der Rahmen um *alle* Lebensbereiche. Ein Bereich soll
sich anfühlen wie eine **eigene App innerhalb** des Jarvis-Systems — mit eigener
Sub-Navigation und eigenem Zuhause — aber **niemals entkoppelt** wirken. Das Dashboard
zeigt Highlights aus jedem Bereich (z.B. nächste Trips + Stats aus Travel); im Bereich
selbst hat man die volle Tiefe (Stats tracken, Trips planen).

Travel ist der **Pilot**: Er etabliert ein wiederverwendbares Muster (Manifest-getrieben),
nach dem künftig jeder Bereich zu einer eigenständigen, eingebetteten App wird.

## 2. Nicht-Ziele (YAGNI — bewusst ausgeschlossen)

- Kalender-Abo / ICS-Sync für Trips (ausdrücklich *nächster Schritt* des Nutzers).
- Apple-Erinnerungen aus Trips/Tasks.
- Migration der anderen Module (sport, gaming, …) auf das Manifest-Muster — diese Runde
  wird nur **der Vertrag gebaut + Travel als Pilot** umgesetzt.
- Änderungen an den internen Features von Explore/Trips (Hierarchie, Quests, Stop-Planung).

Das Design **blockiert** diese Folgeschritte nicht: `trips.start_date`/`end_date` und
`trip_stops.arrival_date`/`departure_date` existieren bereits im Schema
(`supabase/migrations/0004_phase_d_route_planner.sql`), kein DB-Umbau nötig.

## 3. Architektur-Entscheidungen

### 3.1 Bereich = Sub-App im Jarvis-Rahmen
Die Jarvis-Shell (`AppShell`: TopBar + slide-in Sidebar + Jarvis-Identität) bleibt
**immer** sichtbar und unverändert. Ein Bereich rendert seinen Inhalt *innerhalb* dieser
Shell plus eine bereichseigene Sub-Navigation. Kein separater „App-Shell-Swap" — das würde
entkoppelt wirken, was der Nutzer explizit ablehnt.

### 3.2 Manifest als Single Source of Truth (die Blaupause)
`modules/types.ts` → `LiveOSModule` wird erweitert:

```ts
export type ModuleSection = { label: string; href: string; icon: string };

export type LiveOSModule = {
  // … bestehende Felder bleiben …
  home?: string;              // Bereich-Startseite (z.B. '/travel')
  sections?: ModuleSection[]; // Sub-Navigation des Bereichs
};
```

`modules/travel/manifest.ts` deklariert:
- `href: '/travel'` (statt bisher `'/dashboard'`)
- `home: '/travel'`
- `sections: [{ Übersicht → /travel }, { Erkunden → /travel/explore }, { Trips → /travel/trips }]`

Sidebar, Sub-Nav-Leiste und TopBar-Label lesen **ausschließlich** aus dem Manifest.
Ein künftiger Bereich braucht dann nur: Manifest mit `sections` + die zugehörigen Seiten.

### 3.3 Routing-Namespace
Neuer Route-Ordner `app/(app)/travel/` mit eigenem `layout.tsx`:

| Neu | Bisher |
|---|---|
| `/travel` | (neu — gab es nicht) |
| `/travel/explore` | `/explore` |
| `/travel/explore/[continent]` | `/explore/[continent]` |
| `/travel/explore/[continent]/[country]` | … |
| `/travel/explore/[continent]/[country]/[city]` | … |
| `/travel/trips` | `/trips` |
| `/travel/trips/[id]` | `/trips/[id]` |

Die bestehenden Seiten-/Komponenten-Dateien werden in den neuen Namespace **verschoben**
(Logik unverändert), nicht dupliziert.

### 3.4 Alte URLs redirecten (nichts geht kaputt)
`/explore` und `/trips` (inkl. Unterpfade) → **permanenter Redirect** auf die
`/travel/...`-Entsprechung. Umsetzung via `next.config.ts` `redirects()` (statisch,
zuverlässig, kein Middleware-Eingriff nötig). Bestehende Bookmarks/externe Links bleiben
gültig.

### 3.5 Alle internen Referenzen repointen
Vollständige Liste der anzupassenden Stellen:
- `app/(app)/explore/[continent]/page.tsx`, `…/[country]/page.tsx`,
  `…/[city]/page.tsx` — Breadcrumb `{ label: 'Explore', href: '/explore' }`
- `app/(app)/trips/[id]/page.tsx` — Backlink `href="/trips"`
- `app/(app)/dashboard/page.tsx` — `travelLinks`, `Erkunden →`-Link, Travel-Sektion
- `components/layout/TopBar.tsx` — `ROUTE_LABELS` für `/explore`, `/trips`
- `components/layout/Sidebar.tsx` — hartkodiertes `TRAVEL`-Array entfernen → manifest-getrieben
- `components/layout/TopNav.tsx` — `{ href: "/trips" }` (prüfen ob tot; falls genutzt, repointen, sonst entfernen)
- `components/dashboard/DailyNudge.tsx` — 3× `href: '/explore'`
- `lib/actions/trips.ts` — `revalidatePath('/trips')` (2×), `redirect('/trips')`
- `lib/actions/visits.ts` — `revalidatePath('/explore')` (6×, inkl. `'layout'`-Variante)

Akzeptanzkriterium: `grep -rn "'/explore'\|'/trips'\|\"/explore\|\"/trips" app components lib`
liefert nach der Umsetzung **nur** noch die Redirect-Definition in `next.config.ts`.

## 4. Travel-Bereich-Shell (`app/(app)/travel/layout.tsx`)

Rendert direkt unter der globalen Jarvis-TopBar eine **persistente, schmale Tab-Leiste**:
- Tabs aus `travelModule.sections` (Übersicht · Erkunden · Trips)
- Aktiver Tab hervorgehoben über `usePathname()` (Exact für `/travel`, Prefix für
  `/travel/explore`, `/travel/trips`)
- Stil konsistent mit dem Design-System (§10 README): `font-mono`, `label-mono`,
  `accent-blue` als Aktiv-Indikator, `border-border-subtle`, `bg-bg-surface`
- Sticky unterhalb der TopBar, damit beim Scrollen sichtbar

Client-Komponente (`'use client'`, braucht `usePathname`); Layout selbst kann Server sein
und die Client-Tab-Leiste einbetten.

## 5. Travel-Home (`/travel`, Server-Component)

Sektionen (von oben):
1. **Header** — „Travel" + Untertitel (Deutsch, §7 Sprach-Konsistenz)
2. **Stats-Kacheln** — Kontinente/Länder/Städte/Sights (wiederverwendet aus den
   bestehenden `getUserStats`-Daten, gleiche `KpiCard`-Optik wie heute auf dem Dashboard)
3. **Nächster/aktiver Trip** — Highlight-Karte: Titel, Zeitraum (`start_date`–`end_date`),
   Anzahl Stopps / Fortschritt. Auswahl via neuer **pure** Funktion
   `pickNextTrip(trips, now)` (siehe §8). Kein Trip → dezenter Leerzustand mit
   „Trip planen →"-CTA auf `/travel/trips`
4. **Einstiegskarten** — „Erkunden" + „Trips" (führen in die Sub-Bereiche)
5. **Letzte Reise-Aktivität** — bestehende `listRecentActivity`, gefiltert auf
   travel-relevante Einträge (oder generisch, falls Filter nicht trivial — dann
   ungefiltert mit Hinweis; Detailentscheidung im Plan)

## 6. Dashboard-Anbindung (Kern: „nicht entkoppelt")

`app/(app)/dashboard/page.tsx` behält eine **eigene Travel-Highlight-Sektion**:
- Stats-Kacheln (wie bisher: Kontinente/Länder/Städte/Sights)
- **Neu:** „Nächster Trip"-Karte (gleiche `pickNextTrip`-Logik wie Travel-Home)
- Die gesamte Sektion ist nach `/travel` verlinkt (Titel/Karte klickbar)
- Die bisherigen hartkodierten `travelLinks` (Erkunden/Trips) entfallen — Einstieg läuft
  über den Bereich

Sidebar: Die hartkodierte `TRAVEL`-Sektion wird durch manifest-getriebene Darstellung
ersetzt (Bereich „Travel" + seine `sections`). Damit ist Travel in der Sidebar genauso
ein „Bereich" wie die anderen, nur mit Unterpunkten — die Blaupause.

## 7. Sprach-Konsistenz

Aktuell Englisch, wird auf Deutsch vereinheitlicht (UI ist sonst durchgängig Deutsch,
README §10):
- `app/(app)/explore/page.tsx`: „Explore" → „Erkunden", „Browse the world or search for
  a place." → dt. Entsprechung
- `app/(app)/trips/page.tsx`: „My Trips" → „Meine Trips", „Plan and track your travel
  itineraries." → dt., „No trips yet…" → dt.
- Breadcrumb-Label „Explore" → „Erkunden"

## 8. Datenmodell & Logik

**Keine Schema-Änderung.** Wiederverwendet: `listTrips(userId)`, `getUserStats(userId)`,
`listContinents`/`listCountriesByContinent`/`getVisitedSets`, `listRecentActivity`.

**Neue pure Funktion** (gemäß Test-Konvention README §3.5 — pure Logik + dünner Wrapper):
- `lib/travel/next-trip.ts` → `pickNextTrip(trips, now)`:
  - Eingabe: Trip-Liste (`{ id, title, start_date, end_date, status }[]`) + `now`
  - Regel: bevorzugt **aktiver** Trip (now zwischen start/end); sonst der **nächste
    zukünftige** (kleinstes `start_date >= now`); sonst `null`
  - Deterministisch, keine IO → Vitest-Unit-Tests (`lib/travel/next-trip.test.ts`)
- Der Aufruf in Travel-Home/Dashboard ist ein dünner Wrapper (kein eigener Test).

## 9. Betroffene/neue Dateien (Überblick)

**Neu:**
- `app/(app)/travel/layout.tsx` (+ Client-Tab-Leiste, z.B.
  `components/travel/TravelSubNav.tsx`)
- `app/(app)/travel/page.tsx` (Travel-Home)
- `lib/travel/next-trip.ts` + `lib/travel/next-trip.test.ts`

**Verschoben** (`/explore`, `/trips` → `/travel/...`, Logik unverändert):
- Alle Seiten unter `app/(app)/explore/**` und `app/(app)/trips/**`

**Geändert:**
- `modules/types.ts`, `modules/travel/manifest.ts`
- `components/layout/Sidebar.tsx`, `components/layout/TopBar.tsx`,
  `components/layout/TopNav.tsx` (oder entfernen, falls tot)
- `components/dashboard/DailyNudge.tsx`
- `app/(app)/dashboard/page.tsx`
- `lib/actions/trips.ts`, `lib/actions/visits.ts`
- `next.config.ts` (Redirects)
- ggf. README §4 (Routing/Navigation) nachziehen

## 10. Verifikation

- `pickNextTrip` — Vitest-Unit-Tests (aktiver Trip, zukünftiger Trip, kein Trip,
  Grenzfälle start==now / end==now)
- `npm run typecheck` (`tsc --noEmit`) grün
- `npm run build` (`next build` — was Vercel nutzt) grün
- Manueller Smoke: `/travel`, `/travel/explore` (inkl. tiefer Hierarchie),
  `/travel/trips` (+ Detail), Tab-Leiste-Wechsel, Sidebar-Travel manifest-getrieben,
  Dashboard-Travel-Sektion mit „Nächster Trip", Redirects `/explore`→`/travel/explore`
  & `/trips`→`/travel/trips`
- **Deploy:** Gemäß Memory muss die Arbeit nach `main` gemerged + auf Vercel-Production
  deployt werden — der Nutzer testet ausschließlich dort, nicht lokal.

## 11. Risiken

- **Verschieben statt Neuschreiben:** Explore/Trips-Seiten exakt umziehen, keine
  funktionalen Änderungen einschmuggeln (sonst Regression im Pilot).
- **Vollständigkeit der Referenz-Repoints:** Eine vergessene `revalidatePath`/`redirect`
  führt zu stale Cache / 404. Der grep-Akzeptanztest (§3.5) ist Pflicht-Gate.
- **Worktree-Eigenheit** (README §11): `node_modules` ist Symlink; `vitest.config.ts`
  **nicht** patchen.
