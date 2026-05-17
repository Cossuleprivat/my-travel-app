# Jarvis — Testbarer Zustand: Design

> Stand: 2026-05-17 · Branch: `claude/zealous-bell-2416c4`
> Ziel: Jarvis soweit fertigstellen, dass es testweise täglich genutzt werden kann — alles funktioniert, ist erreichbar und sinnvoll.

---

## Problem

Jarvis ist funktional weit, hat aber strukturelle Brüche, die echtes Nutzen verhindern:

1. **Routing kaputt:** `middleware.ts` leitet `/`, `/auth/login`, `/auth/signup` auf `/hub` um. `/hub` läuft unter der Route-Gruppe `(hub)` mit eigenem `layout.tsx` **ohne AppShell/Sidebar** — der Nutzer landet auf einer Seite ohne Navigation. Der `JarvisSplash` unter `(public)/page.tsx` wird durch die Middleware nie erreicht.
2. **Zwei konkurrierende Hubs:** `/hub` hat reichhaltige Live-Modul-Stats und eine „Heute"-Übersicht, aber keine Sidebar. `/dashboard` hat AppShell + Sidebar + Jarvis-Greeting + QuickChat, aber nur statische Modul-Taglines.
3. **Jarvis ohne Kontext:** Der System-Prompt in `app/api/jarvis/route.ts` enthält nur statische Modul-Namen. Jarvis kann „Was steht an?" oder „Sport-Status" nicht mit echten Zahlen beantworten.
4. **STATUS.md veraltet:** Behauptet, Jarvis sei ein Mock und die Navigation unvollständig — beides nicht mehr wahr.

## Ziel & Erfolgskriterien

- Egal über welchen Pfad man die App betritt — man landet im `/dashboard` mit funktionierender Sidebar-Navigation.
- Das Dashboard zeigt echte Live-Daten aller Module (km, offene Tasks, Countdown etc.) und eine „Heute"-Übersicht.
- Jarvis antwortet auf Status-Fragen mit echten Zahlen aus der DB.
- Alle Modul-Routen rendern fehlerfrei; `tsc --noEmit` und `npm run build` laufen sauber durch.
- STATUS.md spiegelt den realen Stand.

## Nicht-Ziele (bewusst außerhalb Scope)

- Coaching-Modul bleibt `coming_soon`.
- Push Notifications bleiben Infrastruktur-only (kein End-to-End-Aktivieren).
- Vercel-Projekt-Umbenennung (`my-travel-app-3sfb`).
- Echtes Auth-System (Single-User-Modus mit hardcoded `OWNER_USER_ID` bleibt).
- Splash-Screen ins Routing einbinden (Nutzer wählte „direkt /dashboard").

---

## Architektur & Änderungen

### 1. Routing & Einstieg

**`middleware.ts`**
- Redirect-Ziel von `/hub` auf `/dashboard` ändern. Die Pfad-Bedingung (`/`, `/auth/login`, `/auth/signup`) bleibt unverändert.

**Route-Gruppe `(hub)` entfernen**
- `app/(hub)/hub/page.tsx` löschen.
- `app/(hub)/layout.tsx` löschen.
- Damit verschwindet der navigationslose Hub vollständig. Seine wertvolle Logik wird vorher extrahiert (siehe 2).

**Splash-Screen**
- `components/jarvis/JarvisSplash.tsx` und `app/(public)/page.tsx` bleiben unangetastet im Code. Sie sind durch die Middleware nicht erreichbar — kein Konflikt, kein toter Routing-Pfad. Keine Aktion nötig.

### 2. Dashboard wird der echte Hub

**Neue Lib-Funktion: `lib/dashboard/module-stats.ts`**
- Extrahiere die Funktion `getLifeModuleStats(userId)` aus `app/(hub)/hub/page.tsx` (Zeilen ~81–165) in ein eigenes, `server-only`-Modul.
- Signatur: `export async function getModuleStats(userId: string): Promise<Record<string, { headline: string; subline: string } | null>>`.
- Enthält die bestehende Logik für sport, gaming, reading, finance, wedding, goals, tasks, wiki.
- Travel-Stats bleiben separat (das Dashboard hat bereits `getUserStats`).

**`app/(app)/dashboard/page.tsx` erweitern**
- `seedAllFromNotion(userId)` beim Load aufrufen (in das bestehende `Promise.all` aufnehmen, wie bisher im Hub).
- `getModuleStats(userId)` und `getTodayOverview(userId)` (existiert bereits in `lib/dashboard/today.ts`) laden.
- **Modul-Grid:** Statt statischer `m.tagline` die Live-`headline`/`subline` aus `getModuleStats` rendern (Fallback auf `tagline`, wenn `null`).
- **Neue „Heute"-Sektion** zwischen Greeting und Modul-Grid:
  - Aktuelle/nächste Laufplan-Woche (`today.planWeek` / `today.nextPlanWeek`).
  - Überfällige + heute fällige Items (`today.dueItems`), verlinkt auf `/tasks` bzw. `/wedding`.
  - Heutige Termine (`today.todayEvents`).
  - Fallback-Text wenn nichts ansteht.
- **Beibehalten:** Jarvis-Greeting, CharacterCard, DailyNudge, StreakBadge, Travel-KPIs, JarvisQuickChat, RecentFeed.
- Die UI-Bausteine der „Heute"-Sektion aus der alten Hub-Seite übernehmen (gleiche Tailwind-Klassen, konsistent mit Dashboard-Stil).

### 3. Jarvis Live-Kontext

**Neue Funktion: `lib/jarvis/context.ts`**
- `export async function gatherJarvisContext(userId: string): Promise<string>` — `server-only`.
- Fragt einen kompakten Snapshot ab (parallele Supabase-Queries):
  - Offene Tasks: Anzahl + bis zu 5 Titel mit Bereich/Deadline.
  - Sport: Summe `distance_km` aus `user_run_logs` + Ziel 500 km + Tage bis Halbmarathon (2026-10-25).
  - Hochzeit: Tage bis Standesamt (2026-10-10) + offene `wedding_tasks`.
  - Lesen: erledigte Bücher/Hörbücher aus `user_books` (year 2026).
  - Gaming: fertige Spiele aus `user_games` (year 2026).
  - Finanzen: letzter `finance_months`-Eintrag (kk_saldo_end, kk_free).
  - Goals: erreichte vs. gesamte XP aus `user_goals`.
- Gibt einen formatierten Text-Block zurück (kein JSON), z.B.:
  ```
  Aktueller Stand (live):
  • Tasks: 7 offen — "Steuer 2025" (finance, überfällig), "Trauzeugen fragen" (wedding, 3d) …
  • Sport: 127.4 / 500 km · 161 Tage bis Halbmarathon
  • Hochzeit: 146 Tage bis Standesamt · 4/12 Tasks erledigt
  • Lesen: 1/6 Bücher · 0/6 Hörbücher
  • Finanzen: KK -1.240 € · 380 € frei
  ```

**`app/api/jarvis/route.ts` anpassen**
- `requireUserId()` aufrufen (Import aus `@/lib/auth/current-user`).
- `gatherJarvisContext(userId)` aufrufen, Ergebnis an `buildSystemPrompt` übergeben.
- `buildSystemPrompt(userName, contextBlock)` hängt den Block nach dem Modul-Abschnitt an.
- Fehlertoleranz: Wirft die Context-Query, fällt der Prompt auf den statischen Teil zurück (try/catch, leerer Block) — Chat darf nie wegen Context-Fehler brechen.

### 4. Verifikation & Aufräumen

- `npx tsc --noEmit` — alle Typfehler beheben.
- `npm run build` — Build muss durchlaufen.
- `npm test` (vitest) — bestehende Tests müssen grün bleiben.
- Smoke-Test jeder Route (Dev-Server, im Browser falls möglich, sonst HTTP-Status-Check): `/dashboard`, `/jarvis`, `/tasks`, `/sport`, `/gaming`, `/reading`, `/finance`, `/wedding`, `/goals`, `/wiki`, `/calendar`, `/explore`, `/trips`, `/profile`. Erwartung: HTTP 200, kein Render-Error.
- Funktionaler Jarvis-Test: „Was steht an?" liefert echte Task-Zahlen; „Leg eine Aufgabe X an" → Proposal-Card → Bestätigen → Eintrag in `user_tasks`.
- `STATUS.md` aktualisieren: Jarvis kein Mock, Navigation/Routing fertig, bekannte Probleme bereinigt.

---

## Datenfluss

```
Request "/"  → middleware.ts → redirect /dashboard
/dashboard (app layout: AppShell + Sidebar + TopBar)
  → requireUserId()
  → Promise.all[ ensureUserProfile, getUserStats, listRecentActivity,
                 getAvatarSignedUrl, getStreak, seedAllFromNotion ]
  → getModuleStats(userId)      (lib/dashboard/module-stats.ts)
  → getTodayOverview(userId)    (lib/dashboard/today.ts, existiert)
  → render: Greeting · Character · Heute · Modul-Grid(live) · Travel · QuickChat · Recent

Chat:
POST /api/jarvis
  → requireUserId()
  → gatherJarvisContext(userId) (lib/jarvis/context.ts)  [try/catch → fallback ""]
  → buildSystemPrompt(name, contextBlock)
  → OpenRouter stream (DeepSeek v4 Flash → Llama Fallback)
  → SSE: tokens | {type:'proposal'}
POST /api/jarvis/confirm  → insert user_tasks / user_notes  (unverändert)
```

## Isolierte Einheiten

| Einheit | Zweck | Abhängigkeiten |
|---|---|---|
| `lib/dashboard/module-stats.ts` | Live-Stats pro Modul für Dashboard-Cards | Supabase service client |
| `lib/jarvis/context.ts` | Text-Snapshot des Nutzerstands für System-Prompt | Supabase service client |
| `middleware.ts` | Einstiegs-Redirect | — |
| `app/(app)/dashboard/page.tsx` | Hub-Komposition | module-stats, today, queries |
| `app/api/jarvis/route.ts` | Chat-Stream mit Live-Kontext | context, OpenRouter |

Jede Lib-Funktion ist allein verständlich, hat eine klare Signatur und ist unabhängig vom UI-Code testbar.

## Fehlerbehandlung

- `gatherJarvisContext`: try/catch in der Route → bei Fehler leerer Context-Block, Chat läuft mit statischem Prompt weiter.
- `getModuleStats`: pro Modul Fallback auf `null` → Card zeigt statische `tagline`.
- Routing: Middleware ist rein synchron, kein Fehlerpfad.

## Risiken

- **DB-Roundtrip pro Chat-Message** durch `gatherJarvisContext`. Akzeptabel (Single-User, niedrige Frequenz).
- **Worktree-Kontext:** Arbeit erfolgt im Worktree `claude/zealous-bell-2416c4`; Merge nach `main` löst Auto-Deploy auf Vercel aus — erst nach grünem Build/Smoke-Test.
- **Seed-Funktionen** könnten bei leerer DB lange laufen; `seedAllFromNotion` ist bereits idempotent (bestehende Annahme aus Hub-Nutzung).
