# Travel als nativer Bereich — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Travel zu einem nativen, in Jarvis integrierten Bereich mit eigenem Namespace (`/travel`), eigener Sub-Navigation und eigenem Zuhause umbauen — als manifest-getriebene Blaupause für künftige Bereiche.

**Architecture:** Bestehende Explore-/Trips-Seiten werden unverändert in einen `app/(app)/travel/`-Namespace verschoben. Ein neues `travel/layout.tsx` rendert unter der unveränderten Jarvis-Shell eine persistente, aus dem Modul-Manifest gespeiste Tab-Leiste. Eine neue Travel-Home (`/travel`) bündelt Stats + nächsten Trip. Alte URLs redirecten permanent. Sidebar/TopBar lesen Travel aus dem Manifest statt aus Hardcode.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Tailwind, Vitest (`environment: node`), Supabase.

---

## Vorbemerkungen für den ausführenden Entwickler

- **Worktree-Eigenheit (README §11):** `node_modules` ist ein Symlink aufs Haupt-Repo. **Niemals** `vitest.config.ts` patchen.
- **Test-Konvention (README §3.5):** Nur reine Funktionen werden unit-getestet. DB/IO-Wrapper werden via `tsc` + `build` + Smoke verifiziert, **nicht** gemockt.
- **Absolute Imports:** Alias `@` → Repo-Root. Das Verschieben von Seiten-Dateien bricht `@/...`-Imports **nicht**. Nur hartkodierte Route-*Strings* müssen angepasst werden.
- **Befehle:** `npm run typecheck` (`tsc --noEmit`) · `npm run build` · `npx vitest run lib/<datei>.test.ts` · `npm run lint`.
- **Commits:** Häufig, pro Task. Commit-Messages auf Deutsch, Stil wie bisher (`feat:`/`refactor:`/`fix:`/`docs:`).

---

## Task 1: Manifest-Vertrag erweitern (die Blaupause)

**Files:**
- Modify: `modules/types.ts`
- Modify: `modules/travel/manifest.ts`

- [ ] **Step 1: `ModuleSection`-Typ + Manifest-Felder ergänzen**

In `modules/types.ts`, nach der `LiveOSModule`-Definition `ModuleSection` ergänzen und `LiveOSModule` um zwei optionale Felder erweitern. Die Datei lautet danach vollständig:

```ts
export type ModuleStatus = 'active' | 'coming_soon';
export type ModuleColor = 'blue' | 'green' | 'amber' | 'purple' | 'red' | 'indigo';

export type ModuleSection = {
  label: string;
  href: string;
  icon: string;
};

export type LiveOSModule = {
  id: string;
  name: string;
  tagline: string;
  icon: string;
  color: ModuleColor;
  href: string;
  profileDataHref: string;
  status: ModuleStatus;
  /** Sub-Navigation des Bereichs (Tab-Leiste + Sidebar-Unterpunkte); Präsenz = navigierbarer Bereich. */
  sections?: ModuleSection[];
};

export type ModuleProfileData = {
  moduleId: string;
  headline: string;
  subline: string;
  metrics: { label: string; value: string | number }[];
};
```

- [ ] **Step 2: Travel-Manifest auf Bereich umstellen**

`modules/travel/manifest.ts` vollständig ersetzen durch:

```ts
import type { LiveOSModule } from '@/modules/types';

export const travelModule: LiveOSModule = {
  id: 'travel',
  name: 'Travel Scorer',
  tagline: 'Städte tracken, Quests abschließen, als Explorer leveln',
  icon: '✈',
  color: 'blue',
  href: '/travel',
  profileDataHref: '/api/modules/travel/profile-data',
  status: 'active',
  sections: [
    { label: 'Übersicht', href: '/travel',          icon: '⬡' },
    { label: 'Erkunden',  href: '/travel/explore',  icon: '✈' },
    { label: 'Trips',     href: '/travel/trips',    icon: '◎' },
  ],
};
```

- [ ] **Step 3: Typecheck**

Run: `npm run typecheck`
Expected: PASS (keine Fehler; `sections` ist optional, übrige Module unverändert gültig).

- [ ] **Step 4: Commit**

```bash
git add modules/types.ts modules/travel/manifest.ts
git commit -m "feat(travel): Manifest-Vertrag um home + sections erweitern"
```

---

## Task 2: `pickNextTrip` — reine Funktion + Tests (TDD)

**Files:**
- Create: `lib/travel/next-trip.ts`
- Test: `lib/travel/next-trip.test.ts`

- [ ] **Step 1: Failing-Test schreiben**

`lib/travel/next-trip.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { pickNextTrip, type TripLike } from './next-trip';

const t = (over: Partial<TripLike> & { id: string }): TripLike => ({
  title: over.id,
  start_date: null,
  end_date: null,
  status: 'draft',
  ...over,
});

describe('pickNextTrip', () => {
  const now = new Date('2026-06-15T12:00:00Z');

  it('returns null when no trips have dates', () => {
    expect(pickNextTrip([t({ id: 'a' }), t({ id: 'b' })], now)).toBeNull();
  });

  it('returns null for an empty list', () => {
    expect(pickNextTrip([], now)).toBeNull();
  });

  it('prefers an active trip (now within start/end) over an upcoming one', () => {
    const active = t({ id: 'active', start_date: '2026-06-10', end_date: '2026-06-20' });
    const upcoming = t({ id: 'up', start_date: '2026-07-01', end_date: '2026-07-05' });
    expect(pickNextTrip([upcoming, active], now)?.id).toBe('active');
  });

  it('returns the earliest upcoming trip when none are active', () => {
    const later = t({ id: 'later', start_date: '2026-09-01' });
    const sooner = t({ id: 'sooner', start_date: '2026-07-01' });
    expect(pickNextTrip([later, sooner], now)?.id).toBe('sooner');
  });

  it('treats start_date == today as active', () => {
    const trip = t({ id: 'startsToday', start_date: '2026-06-15', end_date: '2026-06-20' });
    expect(pickNextTrip([trip], now)?.id).toBe('startsToday');
  });

  it('treats end_date == today as still active', () => {
    const trip = t({ id: 'endsToday', start_date: '2026-06-01', end_date: '2026-06-15' });
    expect(pickNextTrip([trip], now)?.id).toBe('endsToday');
  });

  it('treats an open-ended started trip (no end_date) as active', () => {
    const trip = t({ id: 'openEnded', start_date: '2026-06-01', end_date: null });
    expect(pickNextTrip([trip], now)?.id).toBe('openEnded');
  });

  it('ignores a fully past trip', () => {
    const past = t({ id: 'past', start_date: '2026-01-01', end_date: '2026-01-10' });
    expect(pickNextTrip([past], now)).toBeNull();
  });

  it('ignores trips without a start_date', () => {
    const noStart = t({ id: 'noStart', start_date: null, end_date: '2026-07-01' });
    expect(pickNextTrip([noStart], now)).toBeNull();
  });
});
```

- [ ] **Step 2: Test ausführen, Fehlschlag verifizieren**

Run: `npx vitest run lib/travel/next-trip.test.ts`
Expected: FAIL — Modul `./next-trip` existiert nicht / `pickNextTrip is not a function`.

- [ ] **Step 3: Minimale Implementierung**

`lib/travel/next-trip.ts`:

```ts
export type TripLike = {
  id: string;
  title: string;
  start_date: string | null;
  end_date: string | null;
  status: string;
};

/**
 * Wählt den relevantesten Trip:
 *   1. ein aktiver Trip (heute zwischen start_date und end_date; offenes Ende zählt),
 *   2. sonst der nächste zukünftige (kleinstes start_date > heute),
 *   3. sonst null.
 * Pure: keine IO, deterministisch über `now`.
 */
export function pickNextTrip<T extends TripLike>(trips: T[], now: Date): T | null {
  const today = now.toISOString().slice(0, 10);

  const active = trips
    .filter(
      (t) =>
        t.start_date !== null &&
        t.start_date <= today &&
        (t.end_date === null || t.end_date >= today),
    )
    .sort((a, b) => (a.start_date! < b.start_date! ? -1 : 1));
  if (active.length > 0) return active[0];

  const upcoming = trips
    .filter((t) => t.start_date !== null && t.start_date > today)
    .sort((a, b) => (a.start_date! < b.start_date! ? -1 : 1));
  if (upcoming.length > 0) return upcoming[0];

  return null;
}
```

- [ ] **Step 4: Test ausführen, Erfolg verifizieren**

Run: `npx vitest run lib/travel/next-trip.test.ts`
Expected: PASS (9 Tests grün).

- [ ] **Step 5: Commit**

```bash
git add lib/travel/next-trip.ts lib/travel/next-trip.test.ts
git commit -m "feat(travel): pickNextTrip reine Funktion + Unit-Tests"
```

---

## Task 3: Explore-Seiten in `/travel/explore` verschieben

**Files:**
- Move: `app/(app)/explore/**` → `app/(app)/travel/explore/**`
- Modify (Breadcrumb-Strings): `app/(app)/travel/explore/[continent]/page.tsx`, `app/(app)/travel/explore/[continent]/[country]/page.tsx`, `app/(app)/travel/explore/[continent]/[country]/[city]/page.tsx`

- [ ] **Step 1: Verzeichnis verschieben (Git-tracked)**

```bash
mkdir -p "app/(app)/travel"
git mv "app/(app)/explore" "app/(app)/travel/explore"
```

- [ ] **Step 2: Breadcrumb-Href in den 3 Unterseiten anpassen**

In allen drei Dateien die Zeile `{ label: 'Explore', href: '/explore' },` ersetzen durch:

```ts
        { label: 'Erkunden', href: '/travel/explore' },
```

Betroffen:
- `app/(app)/travel/explore/[continent]/page.tsx` (war Zeile 28)
- `app/(app)/travel/explore/[continent]/[country]/page.tsx` (war Zeile 32)
- `app/(app)/travel/explore/[continent]/[country]/[city]/page.tsx` (war Zeile 47)

- [ ] **Step 3: Deutsche Header in `app/(app)/travel/explore/page.tsx`**

Den `<header>`-Block ersetzen. Vorher:

```tsx
      <header>
        <h1 className="font-sans text-2xl text-text-primary">Explore</h1>
        <p className="text-text-secondary text-sm mt-1">
          Browse the world or search for a place.
        </p>
      </header>
```

Nachher:

```tsx
      <header>
        <h1 className="font-sans text-2xl text-text-primary">Erkunden</h1>
        <p className="text-text-secondary text-sm mt-1">
          Die Welt durchstöbern oder einen Ort suchen.
        </p>
      </header>
```

- [ ] **Step 4: Typecheck + Build**

Run: `npm run typecheck && npm run build`
Expected: PASS. Routen `/travel/explore`, `/travel/explore/[continent]` etc. erscheinen im Build-Output; `/explore` nicht mehr.

- [ ] **Step 5: Commit**

```bash
git add -A "app/(app)/travel/explore"
git commit -m "refactor(travel): Explore nach /travel/explore verschieben + dt. Header"
```

---

## Task 4: Trips-Seiten in `/travel/trips` verschieben + Server-Actions umbiegen

**Files:**
- Move: `app/(app)/trips/**` → `app/(app)/travel/trips/**`
- Modify: `app/(app)/travel/trips/[id]/page.tsx` (Backlink)
- Modify: `lib/actions/trips.ts` (revalidatePath/redirect)

- [ ] **Step 1: Verzeichnis verschieben**

```bash
git mv "app/(app)/trips" "app/(app)/travel/trips"
```

- [ ] **Step 2: Backlink in `app/(app)/travel/trips/[id]/page.tsx` anpassen**

Ersetze:

```tsx
            <Link href="/trips" className="text-xs label-mono text-text-muted hover:text-text-secondary">
              ← Trips
            </Link>
```

durch:

```tsx
            <Link href="/travel/trips" className="text-xs label-mono text-text-muted hover:text-text-secondary">
              ← Trips
            </Link>
```

- [ ] **Step 3: Deutsche Header in `app/(app)/travel/trips/page.tsx`**

Ersetze den `<header>`-Block:

```tsx
      <header>
        <h1 className="font-sans text-2xl text-text-primary">My Trips</h1>
        <p className="text-text-secondary text-sm mt-1">
          Plan and track your travel itineraries.
        </p>
      </header>
```

durch:

```tsx
      <header>
        <h1 className="font-sans text-2xl text-text-primary">Meine Trips</h1>
        <p className="text-text-secondary text-sm mt-1">
          Reisen planen und verfolgen.
        </p>
      </header>
```

Und den Leerzustand:

```tsx
          <p className="text-text-secondary text-sm">No trips yet — create your first one above.</p>
```

durch:

```tsx
          <p className="text-text-secondary text-sm">Noch keine Trips — erstelle oben deinen ersten.</p>
```

- [ ] **Step 4: `lib/actions/trips.ts` — alle `/trips`-Pfade auf `/travel/trips` umbiegen**

Exakte Ersetzungen (Zeilennummern vor Änderung als Orientierung):

- Z. 53: `revalidatePath('/trips');` → `revalidatePath('/travel/trips');`
- Z. 54: `redirect(\`/trips/${data.id}\`);` → `redirect(\`/travel/trips/${data.id}\`);`
- Z. 73: `revalidatePath(\`/trips/${tripId}\`);` → `revalidatePath(\`/travel/trips/${tripId}\`);`
- Z. 74: `revalidatePath('/trips');` → `revalidatePath('/travel/trips');`
- Z. 86: `revalidatePath('/trips');` → `revalidatePath('/travel/trips');`
- Z. 87: `redirect('/trips');` → `redirect('/travel/trips');`
- Z. 115: `revalidatePath(\`/trips/${tripId}\`);` → `revalidatePath(\`/travel/trips/${tripId}\`);`
- Z. 136: `revalidatePath(\`/trips/${tripId}\`);` → `revalidatePath(\`/travel/trips/${tripId}\`);`
- Z. 155: `if (stop) revalidatePath(\`/trips/${stop.trip_id}\`);` → `if (stop) revalidatePath(\`/travel/trips/${stop.trip_id}\`);`
- Z. 162: `revalidatePath(\`/trips/${tripId}\`);` → `revalidatePath(\`/travel/trips/${tripId}\`);`
- Z. 201: `revalidatePath(\`/trips/${tripId}\`);` → `revalidatePath(\`/travel/trips/${tripId}\`);`
- Z. 202: `revalidatePath('/dashboard');` → **unverändert lassen** (Dashboard existiert weiter).

Verifikation der Vollständigkeit:

Run: `grep -n "'/trips'\|\"/trips\|\`/trips/" lib/actions/trips.ts`
Expected: keine Treffer mehr (alle auf `/travel/trips` umgestellt).

- [ ] **Step 5: Typecheck + Build**

Run: `npm run typecheck && npm run build`
Expected: PASS. Routen `/travel/trips`, `/travel/trips/[id]` im Output; `/trips` nicht mehr.

- [ ] **Step 6: Commit**

```bash
git add -A "app/(app)/travel/trips" lib/actions/trips.ts
git commit -m "refactor(travel): Trips nach /travel/trips verschieben + Actions/Header umbiegen"
```

---

## Task 5: `lib/actions/visits.ts` — Explore-Revalidierung umbiegen

**Files:**
- Modify: `lib/actions/visits.ts`

- [ ] **Step 1: Alle `/explore`-Pfade auf `/travel/explore` umstellen**

Exakte Ersetzungen (Zeilennummern vor Änderung):

- Z. 62: `revalidatePath('/explore');` → `revalidatePath('/travel/explore');`
- Z. 78: `revalidatePath('/explore');` → `revalidatePath('/travel/explore');`
- Z. 90: `revalidatePath('/explore');` → `revalidatePath('/travel/explore');`
- Z. 106: `revalidatePath('/explore');` → `revalidatePath('/travel/explore');`
- Z. 147: `revalidatePath('/explore');` → `revalidatePath('/travel/explore');`
- Z. 183: `revalidatePath('/explore', 'layout');` → `revalidatePath('/travel/explore', 'layout');`

Alle `revalidatePath('/dashboard')` / `revalidatePath('/profile')` **unverändert lassen**.

- [ ] **Step 2: Vollständigkeit verifizieren**

Run: `grep -n "'/explore'\|\"/explore" lib/actions/visits.ts`
Expected: keine Treffer mehr.

- [ ] **Step 3: Typecheck**

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add lib/actions/visits.ts
git commit -m "refactor(travel): visits.ts Revalidierung auf /travel/explore"
```

---

## Task 6: Permanente Redirects für alte URLs

**Files:**
- Modify: `next.config.ts`

- [ ] **Step 1: Redirects ergänzen**

`next.config.ts` vollständig ersetzen durch:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: '/explore', destination: '/travel/explore', permanent: true },
      { source: '/explore/:path*', destination: '/travel/explore/:path*', permanent: true },
      { source: '/trips', destination: '/travel/trips', permanent: true },
      { source: '/trips/:path*', destination: '/travel/trips/:path*', permanent: true },
    ];
  },
};

export default nextConfig;
```

- [ ] **Step 2: Build (Redirects werden beim Build registriert)**

Run: `npm run build`
Expected: PASS. Build-Log zeigt die 4 Redirects unter „Redirects".

- [ ] **Step 3: Commit**

```bash
git add next.config.ts
git commit -m "feat(travel): permanente Redirects /explore & /trips → /travel/*"
```

---

## Task 7: Travel-Bereich-Shell (Sub-Nav-Tab-Leiste)

**Files:**
- Create: `components/travel/TravelSubNav.tsx`
- Create: `app/(app)/travel/layout.tsx`

- [ ] **Step 1: Client-Tab-Leiste aus dem Manifest**

`components/travel/TravelSubNav.tsx`:

```tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { travelModule } from '@/modules/travel/manifest';

export function TravelSubNav() {
  const pathname = usePathname();
  const sections = travelModule.sections ?? [];

  function isActive(href: string) {
    if (href === '/travel') return pathname === '/travel';
    return pathname === href || pathname.startsWith(href + '/');
  }

  return (
    <nav
      className="sticky top-[57px] z-20 -mx-4 px-4 py-2 border-b border-border-subtle backdrop-blur"
      style={{ background: 'rgba(9,14,22,0.92)' }}
      aria-label="Travel-Navigation"
    >
      <div className="flex gap-1">
        {sections.map((s) => {
          const active = isActive(s.href);
          return (
            <Link
              key={s.href}
              href={s.href}
              className={[
                'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs label-mono transition-colors',
                active
                  ? 'bg-bg-elevated text-text-primary ring-1 ring-[#40a0d0]/25'
                  : 'text-text-muted hover:text-text-secondary hover:bg-bg-elevated/50',
              ].join(' ')}
            >
              <span aria-hidden="true">{s.icon}</span>
              <span>{s.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
```

> Hinweis: `top-[57px]` setzt die Leiste direkt unter die sticky TopBar (TopBar = `py-3` + Border ≈ 57px). Falls im Smoke-Test ein sichtbarer Versatz auftritt, Wert anpassen — funktional unkritisch.

- [ ] **Step 2: Bereich-Layout**

`app/(app)/travel/layout.tsx`:

```tsx
import { TravelSubNav } from '@/components/travel/TravelSubNav';

export default function TravelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <TravelSubNav />
      {children}
    </div>
  );
}
```

- [ ] **Step 3: Typecheck + Build**

Run: `npm run typecheck && npm run build`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add components/travel/TravelSubNav.tsx "app/(app)/travel/layout.tsx"
git commit -m "feat(travel): Bereich-Shell mit manifest-getriebener Sub-Nav"
```

---

## Task 8: Travel-Home (`/travel`)

**Files:**
- Create: `app/(app)/travel/page.tsx`

- [ ] **Step 1: Travel-Home implementieren**

`app/(app)/travel/page.tsx`:

```tsx
import Link from 'next/link';
import { requireUserId } from '@/lib/auth/current-user';
import { getUserStats, listTrips, listRecentActivity } from '@/lib/data/queries';
import { pickNextTrip } from '@/lib/travel/next-trip';
import { KpiCard } from '@/components/dashboard/KpiCard';
import { RecentFeed } from '@/components/dashboard/RecentFeed';

function fmtRange(start: string | null, end: string | null): string {
  if (!start && !end) return 'Kein Zeitraum';
  const f = (d: string) =>
    new Date(d).toLocaleDateString('de-DE', { day: 'numeric', month: 'short' });
  if (start && end) return `${f(start)} – ${f(end)}`;
  return f((start ?? end) as string);
}

export default async function TravelHomePage() {
  const userId = await requireUserId();
  const [stats, trips, recent] = await Promise.all([
    getUserStats(userId),
    listTrips(userId),
    listRecentActivity(userId, 8),
  ]);
  const nextTrip = pickNextTrip(trips, new Date());

  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-sans text-2xl text-text-primary">Travel</h1>
        <p className="text-text-secondary text-sm mt-1">
          Dein Reiseleben — Stats, Trips, die Welt erkunden.
        </p>
      </header>

      {/* Stats */}
      <section>
        <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-text-muted mb-2">
          Stats
        </p>
        <div className="grid grid-cols-2 gap-3">
          <KpiCard label="Kontinente" value={stats.continentCount} total={7} tone="blue" />
          <KpiCard label="Länder"     value={stats.countryCount}              tone="amber" />
          <KpiCard label="Städte"     value={stats.cityCount}                 tone="green" />
          <KpiCard label="Sights"     value={stats.sightCount}                tone="purple" />
        </div>
      </section>

      {/* Nächster Trip */}
      <section>
        <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-text-muted mb-2">
          Nächster Trip
        </p>
        {nextTrip ? (
          <Link
            href={`/travel/trips/${nextTrip.id}`}
            className="block rounded-xl border border-[#40a0d0]/25 bg-bg-surface p-4 transition-all hover:border-[#40a0d0]/40 active:scale-[0.99]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-text-primary font-medium truncate">{nextTrip.title}</p>
                <p className="text-text-muted text-xs label-mono mt-1">
                  {fmtRange(nextTrip.start_date, nextTrip.end_date)}
                </p>
              </div>
              <span className="text-accent-blue text-xs label-mono shrink-0">
                {nextTrip.stopCount} Stopps
              </span>
            </div>
          </Link>
        ) : (
          <Link
            href="/travel/trips"
            className="block rounded-xl border border-dashed border-border-subtle bg-bg-surface p-6 text-center text-sm text-text-secondary hover:border-[#40a0d0]/25 transition-colors"
          >
            Noch kein geplanter Trip — Trip planen →
          </Link>
        )}
      </section>

      {/* Einstiege */}
      <section className="grid grid-cols-2 gap-2">
        <Link
          href="/travel/explore"
          className="flex items-center gap-2 rounded-xl border border-border-subtle bg-bg-surface px-4 py-3 hover:border-[#40a0d0]/25 transition-all active:scale-[0.98]"
        >
          <span className="text-base">✈</span>
          <span className="font-mono text-sm text-text-secondary">Erkunden</span>
        </Link>
        <Link
          href="/travel/trips"
          className="flex items-center gap-2 rounded-xl border border-border-subtle bg-bg-surface px-4 py-3 hover:border-[#40a0d0]/25 transition-all active:scale-[0.98]"
        >
          <span className="text-base">◎</span>
          <span className="font-mono text-sm text-text-secondary">Trips</span>
        </Link>
      </section>

      {/* Letzte Aktivität */}
      {recent.length > 0 && (
        <section>
          <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-text-muted mb-2">
            Zuletzt
          </p>
          <RecentFeed items={recent} />
        </section>
      )}
    </div>
  );
}
```

> `listRecentActivity` liefert ausschließlich Reise-Events (Städte/Länder/Kontinente/Sights) — kein zusätzlicher Filter nötig. `RecentFeed` nimmt `items: RecentVisit[]` (wie auf dem Dashboard verwendet).

- [ ] **Step 2: Typecheck + Build**

Run: `npm run typecheck && npm run build`
Expected: PASS. Route `/travel` erscheint im Build-Output.

- [ ] **Step 3: Commit**

```bash
git add "app/(app)/travel/page.tsx"
git commit -m "feat(travel): Travel-Home mit Stats, nächstem Trip, Einstiegen"
```

---

## Task 9: Dashboard — Travel-Highlight-Sektion mit nächstem Trip

**Files:**
- Modify: `app/(app)/dashboard/page.tsx`

- [ ] **Step 1: Imports + Daten ergänzen**

In `app/(app)/dashboard/page.tsx` den Import-Block um `listTrips` und `pickNextTrip` erweitern. Zeile 2 lautet aktuell:

```ts
import { getUserStats, listRecentActivity, ensureUserProfile } from '@/lib/data/queries';
```

ersetzen durch:

```ts
import { getUserStats, listRecentActivity, ensureUserProfile, listTrips } from '@/lib/data/queries';
import { pickNextTrip } from '@/lib/travel/next-trip';
```

- [ ] **Step 2: `listTrips` in den Daten-Load aufnehmen**

Den zweiten `Promise.all`-Block (aktuell):

```ts
  const [moduleStats, today] = await Promise.all([
    getModuleStats(userId),
    getTodayOverview(userId),
  ]);
```

ersetzen durch:

```ts
  const [moduleStats, today, trips] = await Promise.all([
    getModuleStats(userId),
    getTodayOverview(userId),
    listTrips(userId),
  ]);
  const nextTrip = pickNextTrip(trips, new Date());
```

- [ ] **Step 3: Hartkodierte `travelLinks` entfernen**

Den Block (aktuell Zeilen 60–64):

```ts
  // All active modules except travel (travel has its own KPI section)
  const lifeModules = MODULE_REGISTRY.filter((m) => m.status === 'active' && m.id !== 'travel');
  // Travel sub-modules
  const travelLinks = [
    { href: '/explore', name: 'Erkunden', icon: '✈', color: 'blue' },
    { href: '/trips',   name: 'Trips',    icon: '◎', color: 'blue' },
  ];
```

ersetzen durch:

```ts
  // All active modules except travel (travel has its own highlight section)
  const lifeModules = MODULE_REGISTRY.filter((m) => m.status === 'active' && m.id !== 'travel');

  const tripRange =
    nextTrip && (nextTrip.start_date || nextTrip.end_date)
      ? [nextTrip.start_date, nextTrip.end_date]
          .filter(Boolean)
          .map((d) =>
            new Date(d as string).toLocaleDateString('de-DE', { day: 'numeric', month: 'short' }),
          )
          .join(' – ')
      : null;
```

- [ ] **Step 4: Travel-Stats-Sektion durch verlinkte Highlight-Sektion ersetzen**

Den gesamten Block (aktuell):

```tsx
      {/* Travel stats */}
      <section>
        <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-text-muted mb-2">Travel Stats</p>
        <div className="grid grid-cols-2 gap-3 mb-2">
          <KpiCard label="Kontinente" value={stats.continentCount} total={7} tone="blue" />
          <KpiCard label="Länder"     value={stats.countryCount}             tone="amber" />
          <KpiCard label="Städte"     value={stats.cityCount}                tone="green" />
          <KpiCard label="Sights"     value={stats.sightCount}               tone="purple" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          {travelLinks.map((t) => (
            <Link key={t.href} href={t.href}
              className="flex items-center gap-2 rounded-xl border border-border-subtle bg-bg-surface px-4 py-2.5 hover:border-[#40a0d0]/25 transition-all">
              <span className="text-base">{t.icon}</span>
              <span className="font-mono text-sm text-text-secondary">{t.name}</span>
            </Link>
          ))}
        </div>
      </section>
```

ersetzen durch:

```tsx
      {/* Travel highlight */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-text-muted">Travel</p>
          <Link href="/travel" className="text-accent-blue text-xs label-mono">Bereich öffnen →</Link>
        </div>
        <Link href="/travel" className="block">
          <div className="grid grid-cols-2 gap-3 mb-2">
            <KpiCard label="Kontinente" value={stats.continentCount} total={7} tone="blue" />
            <KpiCard label="Länder"     value={stats.countryCount}             tone="amber" />
            <KpiCard label="Städte"     value={stats.cityCount}                tone="green" />
            <KpiCard label="Sights"     value={stats.sightCount}               tone="purple" />
          </div>
        </Link>
        {nextTrip ? (
          <Link
            href={`/travel/trips/${nextTrip.id}`}
            className="block rounded-xl border border-[#40a0d0]/25 bg-bg-surface p-4 transition-all hover:border-[#40a0d0]/40 active:scale-[0.99]"
          >
            <p className="text-[10px] label-mono text-accent-blue">Nächster Trip</p>
            <div className="flex items-start justify-between gap-3 mt-1">
              <p className="text-text-primary text-sm truncate">{nextTrip.title}</p>
              {tripRange && (
                <span className="text-text-muted text-[11px] label-mono shrink-0">{tripRange}</span>
              )}
            </div>
          </Link>
        ) : (
          <Link
            href="/travel/trips"
            className="block rounded-xl border border-dashed border-border-subtle bg-bg-surface px-4 py-3 text-center text-xs text-text-secondary hover:border-[#40a0d0]/25 transition-colors"
          >
            Kein geplanter Trip — Trip planen →
          </Link>
        )}
      </section>
```

- [ ] **Step 5: „Erkunden →"-Link in der „Zuletzt"-Sektion umbiegen**

Aktuell (in der Recent-Activity-Sektion):

```tsx
            <Link href="/explore" className="text-accent-blue text-xs label-mono">Erkunden →</Link>
```

ersetzen durch:

```tsx
            <Link href="/travel/explore" className="text-accent-blue text-xs label-mono">Erkunden →</Link>
```

- [ ] **Step 6: Typecheck + Build**

Run: `npm run typecheck && npm run build`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add "app/(app)/dashboard/page.tsx"
git commit -m "feat(dashboard): Travel-Highlight-Sektion mit nächstem Trip, verlinkt /travel"
```

---

## Task 10: Sidebar & TopBar manifest-getrieben

**Files:**
- Modify: `components/layout/Sidebar.tsx`
- Modify: `components/layout/TopBar.tsx`

- [ ] **Step 1: Sidebar — hartkodierte Travel-Sektion entfernen, aus Manifest rendern**

In `components/layout/Sidebar.tsx`:

a) Den `TRAVEL`-Konstanten-Block (aktuell Zeilen 24–27) **löschen**:

```tsx
const TRAVEL = [
  { href: '/explore', name: 'Erkunden',  icon: '✈', color: 'blue' },
  { href: '/trips',   name: 'Trips',     icon: '◎', color: 'blue' },
];
```

b) Den Import um `travelModule` ergänzen. Aus:

```tsx
import { MODULE_REGISTRY } from '@/modules/registry';
```

wird:

```tsx
import { MODULE_REGISTRY } from '@/modules/registry';
import { travelModule } from '@/modules/travel/manifest';
```

c) Die „Travel sub-nav"-`<nav>` (aktuell):

```tsx
          {/* Travel sub-nav */}
          <nav className="space-y-0.5">
            <p className="px-3 pb-2 text-[10px] font-mono tracking-[0.2em] uppercase text-text-muted">
              Travel
            </p>
            {TRAVEL.map((i) => <Item key={i.href} {...i} />)}
          </nav>
```

ersetzen durch (Bereich-Home + Sektionen aus dem Manifest):

```tsx
          {/* Travel-Bereich (manifest-getrieben) */}
          <nav className="space-y-0.5">
            <p className="px-3 pb-2 text-[10px] font-mono tracking-[0.2em] uppercase text-text-muted">
              {travelModule.name}
            </p>
            {(travelModule.sections ?? []).map((s) => (
              <Item key={s.href} href={s.href} name={s.label} icon={s.icon} color="blue" />
            ))}
          </nav>
```

> `lifeModules` (Zeile ~36, `MODULE_REGISTRY.filter(... m.id !== 'travel')`) bleibt unverändert — Travel erscheint weiterhin als eigene Sektion, nicht doppelt im Bereiche-Grid.

- [ ] **Step 2: TopBar — Route-Labels für den Travel-Namespace**

In `components/layout/TopBar.tsx` das `ROUTE_LABELS`-Objekt anpassen: die alten Einträge `'/explore'` und `'/trips'` **entfernen** und durch die drei Travel-Einträge ersetzen. **Reihenfolge wichtig:** spezifischere Pfade (`/travel/explore`, `/travel/trips`) müssen **vor** `/travel` stehen, da die Prefix-Schleife in Einfügereihenfolge iteriert.

Vorher (Zeilen 6–21):

```tsx
const ROUTE_LABELS: Record<string, { label: string; icon: string }> = {
  '/dashboard':  { label: 'Hub',           icon: '⬡' },
  '/jarvis':     { label: 'Jarvis',        icon: 'J' },
  '/explore':    { label: 'Erkunden',      icon: '✈' },
  '/trips':      { label: 'Trips',         icon: '◎' },
  '/profile':    { label: 'Profil',        icon: '◈' },
  '/calendar':   { label: 'Kalender',      icon: '📅' },
  '/tasks':      { label: 'Tasks',         icon: '✅' },
  '/sport':      { label: 'Sport',         icon: '🏃' },
  '/gaming':     { label: 'Gaming',        icon: '🎮' },
  '/reading':    { label: 'Lesen',         icon: '📚' },
  '/finance':    { label: 'Finanzen',      icon: '💰' },
  '/wedding':    { label: 'Hochzeit',      icon: '💍' },
  '/goals':      { label: 'Jahresplan',    icon: '🎯' },
  '/wiki':       { label: 'Wissensbase',   icon: '📖' },
};
```

Nachher:

```tsx
const ROUTE_LABELS: Record<string, { label: string; icon: string }> = {
  '/dashboard':       { label: 'Hub',           icon: '⬡' },
  '/jarvis':          { label: 'Jarvis',        icon: 'J' },
  '/travel/explore':  { label: 'Erkunden',      icon: '✈' },
  '/travel/trips':    { label: 'Trips',         icon: '◎' },
  '/travel':          { label: 'Travel',        icon: '✈' },
  '/profile':         { label: 'Profil',        icon: '◈' },
  '/calendar':        { label: 'Kalender',      icon: '📅' },
  '/tasks':           { label: 'Tasks',         icon: '✅' },
  '/sport':           { label: 'Sport',         icon: '🏃' },
  '/gaming':          { label: 'Gaming',        icon: '🎮' },
  '/reading':         { label: 'Lesen',         icon: '📚' },
  '/finance':         { label: 'Finanzen',      icon: '💰' },
  '/wedding':         { label: 'Hochzeit',      icon: '💍' },
  '/goals':           { label: 'Jahresplan',    icon: '🎯' },
  '/wiki':            { label: 'Wissensbase',   icon: '📖' },
};
```

> Wirkung: `/travel` (exakt) → „Travel"; `/travel/explore/...` und `/travel/trips/...` → „Erkunden" / „Trips" (Exact-Match greift zuerst, sonst Prefix in dieser Reihenfolge).

- [ ] **Step 3: Typecheck + Build**

Run: `npm run typecheck && npm run build`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add components/layout/Sidebar.tsx components/layout/TopBar.tsx
git commit -m "refactor(nav): Sidebar/TopBar Travel manifest-getrieben statt Hardcode"
```

---

## Task 11: DailyNudge umbiegen + toten TopNav entfernen

**Files:**
- Modify: `components/dashboard/DailyNudge.tsx`
- Delete: `components/layout/TopNav.tsx`

- [ ] **Step 1: DailyNudge — `/explore` → `/travel/explore`**

In `components/dashboard/DailyNudge.tsx` gibt es drei `href: '/explore',` (in den drei `return`-Zweigen von `buildNudge`). Alle drei ersetzen durch:

```ts
      href: '/travel/explore',
```

(Zeilen vor Änderung: 23, 35, 46.) Die englischen Nudge-Texte bleiben unverändert (out of scope — nur Travel-Routing).

Verifikation:

Run: `grep -n "'/explore'\|'/trips'" components/dashboard/DailyNudge.tsx`
Expected: keine Treffer.

- [ ] **Step 2: Toten `TopNav` entfernen**

`components/layout/TopNav.tsx` ist ein Überrest der ursprünglichen Travel-Scorer-App (Light-Theme, verweist auf `/trips` & `/map`), wird **nirgends importiert** und verletzt sonst das grep-Gate aus Task 12.

Erst Bestätigung, dass er ungenutzt ist:

Run: `grep -rn "TopNav" app components --include="*.tsx" | grep -v "TopNav.tsx:"`
Expected: keine Treffer.

Dann löschen:

```bash
git rm components/layout/TopNav.tsx
```

> `components/layout/Container.tsx` **nicht** anfassen — wird von `PublicNav.tsx` weiterverwendet.

- [ ] **Step 3: Typecheck + Build**

Run: `npm run typecheck && npm run build`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add components/dashboard/DailyNudge.tsx
git rm --cached components/layout/TopNav.tsx 2>/dev/null || true
git commit -m "refactor(travel): DailyNudge umbiegen, toten TopNav entfernen"
```

---

## Task 12: Gesamt-Verifikation & README-Nachzug

**Files:**
- Modify: `README.md` (Abschnitt 4 Routing/Navigation)

- [ ] **Step 1: grep-Akzeptanz-Gate (harte Bedingung)**

Run:

```bash
grep -rn "'/explore'\|'/trips'\|\"/explore\|\"/trips\|href=\"/explore\|href=\"/trips" app components lib middleware.ts modules
```

Expected: **keine Treffer.** (Alle alten Routen sind umgebogen; die einzigen verbleibenden `/explore`/`/trips`-Strings stehen in `next.config.ts` als Redirect-Quellen — Datei liegt außerhalb der durchsuchten Verzeichnisse.)

Falls Treffer: die jeweilige Stelle gemäß Muster der Tasks 3–11 auf `/travel/...` umstellen, dann erneut prüfen.

- [ ] **Step 2: Volle Test-/Build-Suite**

Run: `npx vitest run lib/travel/next-trip.test.ts && npm run typecheck && npm run build`
Expected: Vitest 9 grün; `tsc` ohne Fehler; `next build` grün, Routen `/travel`, `/travel/explore`, `/travel/explore/[continent]/[country]/[city]`, `/travel/trips`, `/travel/trips/[id]` im Output; `/explore`/`/trips` nur noch als Redirects.

> Hinweis (README §12): `next build` + `tsc`-Reihenfolge kann kurzzeitig einen `.next/types`-Artefakt-Fehler zeigen. `next build` (was Vercel nutzt) ist maßgeblich.

- [ ] **Step 3: README Abschnitt 4 nachziehen**

In `README.md`, Abschnitt „## 4. Routing & Navigation":

a) Unter „### Sidebar" den Punkt 3 anpassen. Vorher:

```
3. **Travel** — Erkunden, Trips
```

Nachher:

```
3. **Travel-Bereich** — manifest-getrieben (`travelModule.sections`): Übersicht, Erkunden, Trips
```

b) Unter „### Module-Registry" ergänzen (neue Zeile direkt nach dem bestehenden Registry-Absatz):

```
**Bereich-als-App-Pilot:** `travelModule` hat `href: '/travel'` + `sections[]`. Travel
liegt unter `app/(app)/travel/**` mit eigenem `layout.tsx` (persistente Sub-Nav-Tab-Leiste).
Alte Routen `/explore`, `/trips` → permanente Redirects in `next.config.ts`. Sidebar,
TopBar und Sub-Nav lesen Travel aus dem Manifest. Blaupause für künftige Bereiche.
```

- [ ] **Step 4: Manueller Smoke-Test (lokal, `npm run dev`)**

Prüfen:
- `/travel` rendert: Stats-Kacheln, „Nächster Trip" (bzw. Leerzustand), Einstiege, „Zuletzt".
- Tab-Leiste sichtbar unter der TopBar auf `/travel`, `/travel/explore`, `/travel/trips`; aktiver Tab korrekt hervorgehoben; bleibt beim Scrollen sichtbar.
- `/travel/explore` → tiefe Hierarchie (Kontinent → Land → Stadt) funktioniert; Breadcrumb „Erkunden" führt zurück auf `/travel/explore`.
- `/travel/trips` → Trip anlegen funktioniert (Redirect landet auf `/travel/trips/<id>`); „← Trips"-Backlink korrekt.
- Aufruf `/explore` und `/trips` (alte URLs) → 308-Redirect auf `/travel/...`.
- Dashboard: Travel-Sektion zeigt Stats + „Nächster Trip", „Bereich öffnen →" und Klick führen nach `/travel`.
- Sidebar: Travel-Bereich-Sektion zeigt Übersicht/Erkunden/Trips aus dem Manifest.
- TopBar zeigt korrekte Titel: „Travel" / „Erkunden" / „Trips".

- [ ] **Step 5: Commit**

```bash
git add README.md
git commit -m "docs: README §4 — Travel-Bereich-Pilot (Namespace, Manifest, Redirects)"
```

---

## Task 13: Nach `main` deployen (Pflicht — Nutzer testet nur Production)

> Memory/README §11: Der Nutzer testet **ausschließlich** auf Vercel-Production. Arbeit muss nach `main` gemerged + deployt werden, sonst ist sie für ihn nicht testbar. **Nie force-pushen.**

- [ ] **Step 1: `origin/main` integrieren (Divergenz möglich, README §11)**

```bash
git fetch origin
git merge origin/main
```

Bei Konflikten: im isolierten Worktree lösen (Travel-Namespace-Dateien sind weitgehend disjunkt). Nach Lösung: `npm run typecheck && npm run build && npx vitest run lib/travel/next-trip.test.ts` erneut grün.

- [ ] **Step 2: Fast-Forward-Push nach `main`**

```bash
git push origin HEAD:main
```

Expected: Push erfolgreich (Fast-Forward, kein Force). Vercel Auto-Deploy aus `origin/main` startet.

- [ ] **Step 3: Nutzer informieren**

Dem Nutzer melden: deployt, auf Vercel-Production im eingeloggten Browser testbar (Deployment Protection → von extern 401, README §11). Smoke-Punkte aus Task 12 Step 4 als Testleitfaden nennen.

---

## Self-Review (vom Plan-Autor durchgeführt)

**Spec-Abdeckung:**
- Spec §3.2 Manifest-Vertrag → Task 1 ✓
- Spec §3.3 Routing-Namespace → Tasks 3, 4 ✓
- Spec §3.4 Redirects → Task 6 ✓
- Spec §3.5 Referenzen repointen + grep-Gate → Tasks 4, 5, 9, 10, 11; Gate in Task 12 ✓
- Spec §4 Bereich-Shell/Sub-Nav → Task 7 ✓
- Spec §5 Travel-Home → Task 8 ✓
- Spec §6 Dashboard-Anbindung + Sidebar manifest-getrieben → Tasks 9, 10 ✓
- Spec §7 Sprach-Konsistenz → Tasks 3 (Explore), 4 (Trips) ✓
- Spec §8 `pickNextTrip` pure + Tests → Task 2 ✓
- Spec §9 Dateiliste → über Tasks abgedeckt; toter `TopNav` → Task 11 ✓
- Spec §10 Verifikation → Task 12; Deploy-Memory → Task 13 ✓
- Spec §11 Risiken (verschieben statt neuschreiben, grep-Gate, Worktree) → in Tasks 3/4 als reines `git mv`, Gate Task 12, Vorbemerkung ✓

**Platzhalter-Scan:** Keine TBD/TODO; jeder Code-Schritt enthält vollständigen Code; Befehle mit erwarteter Ausgabe.

**Typ-Konsistenz:** `pickNextTrip<T extends TripLike>` (Task 2) wird in Tasks 8 & 9 mit `TripWithStopCount` (erfüllt `TripLike`) aufgerufen; `nextTrip.stopCount` nur in Task 8 genutzt (Feld existiert auf `TripWithStopCount`). `travelModule.sections` (Task 1, optional) überall mit `?? []` defensiv gelesen (Tasks 7, 10). `ModuleSection`-Felder `label/href/icon` konsistent verwendet.

Keine offenen Lücken.
