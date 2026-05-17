# Jarvis — Persönliches Lebens-OS

> **Zweck dieses Dokuments:** Vollständiger Entwicklungsstand. Wer das hier liest, weiß
> danach *was* die App kann, *wie* es technisch funktioniert und *warum* es so entschieden
> wurde — genug, um direkt in die Optimierung einzusteigen, ohne den Code erst zu
> rekonstruieren.
>
> Stand: **2026-05-17** · Branch-Basis: `main` (deployed) · Repo: `Cossuleprivat/jarvis`

---

## 1. Was ist Jarvis?

Jarvis ist ein **persönliches Lebens-OS für einen einzigen Nutzer** (Andrea). Ein zentrales
Dashboard, das alle Lebensbereiche bündelt (Reisen, Sport, Gaming, Lesen, Finanzen, Hochzeit,
Ziele, Tasks, Wissensbase), mit einem **KI-Assistenten „Jarvis"** als Herzstück, der die
echten Daten aller Module kennt und Aktionen vorschlagen + nach Bestätigung ausführen kann.

Es ist **kein Multi-User-Produkt**. Alle Architektur-Entscheidungen folgen daraus: maximale
Einfachheit, keine Auth-Komplexität, kostenlose Infrastruktur.

---

## 2. Tech-Stack

| Layer | Technologie |
|---|---|
| Framework | Next.js 15 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS (Custom Theme, Dark) |
| DB | Supabase (PostgreSQL), `@supabase/supabase-js` |
| KI (Jarvis) | OpenRouter, **nur Free-Tier-Modelle** |
| KI (Avatar) | Replicate (Flux Pixel-Art) |
| Push | `web-push` (Infrastruktur vorhanden, nicht E2E aktiv) |
| Tests | Vitest (`environment: node`) |
| Deployment | Vercel, Auto-Deploy aus `main` |

Scripts: `npm run dev` · `npm run build` · `npm run typecheck` (`tsc --noEmit`) ·
`npm test` (`vitest run`) · `npm run lint`.

---

## 3. Architektur-Grundentscheidungen (das *Warum*)

Diese Entscheidungen sind bewusst und sollten bei Optimierungen respektiert werden:

### 3.1 Single-User, kein Auth
`lib/auth/current-user.ts` → `requireUserId()` gibt **hardcoded** `acabfbe0-79cf-43e6-903b-b96834eb0a05`
zurück. Es gibt kein echtes Login.
**Warum:** Nur ein Nutzer. Echtes Auth wäre reine Komplexität ohne Nutzen. Auth-UI
(`/auth/login`, `/auth/signup`) existiert als Code-Rest, ist aber per Middleware unerreichbar.

### 3.2 RLS deaktiviert, Supabase-Creds hardcoded als Fallback
`lib/supabase/server.ts` → `createServiceClient()` nutzt den **anon key**. URL + anon key sind
als Fallback **im Code hardcoded** (`https://vfxcozgkupzzqhgozyqo.supabase.co`), damit **keine
Vercel-Env-Vars** für DB-Zugriff nötig sind. RLS ist auf allen User-Tabellen aus.
**Warum:** Single-User + kein Auth → RLS schützt vor nichts, kostet nur Komplexität. Der anon
key reicht. Hardcoded-Fallback = Deploy funktioniert ohne Env-Konfiguration.
**Konsequenz für Optimierung:** Niemals RLS „der Sauberkeit halber" einführen — das würde
`requireUserId()` (das keine echte Session hat) brechen.

### 3.3 Jarvis-KI muss kostenlos bleiben
Harte Vorgabe. Jarvis nutzt **ausschließlich OpenRouter `:free` Modelle**. Kosten = 0 €.
Konsequenz: Free-Modelle sind unzuverlässig (Rate-Limits, kaputte Modelle) → die Route hat
robustes Failover (siehe §6).

### 3.4 Einziger Hub: `/dashboard`
Es gab historisch zwei konkurrierende Hubs (`/hub` ohne Navigation, `/dashboard` mit Sidebar).
**Entscheidung:** `/dashboard` ist der einzige Hub. `/hub` (Route-Gruppe `(hub)`) wurde
**komplett gelöscht**, seine wertvolle Live-Stats-Logik in `lib/dashboard/module-stats.ts`
extrahiert und wiederverwendbar gemacht.
**Warum:** Zwei Hubs = Verwirrung + ein navigationsloser Dead-End. Ein konsistenter
Einstiegspunkt mit Sidebar.

### 3.5 Test-Konvention: nur reine Logik wird unit-getestet
Vorbild: `lib/xp.test.ts`. **Pure Funktionen** (deterministisch, keine IO) → Vitest-Unit-Tests.
**DB/IO-Wrapper** → nicht unit-getestet, sondern via `build` + Smoke-Test verifiziert.
**Warum:** DB zu mocken bringt Scheinsicherheit. Stattdessen: Logik isolieren und testen,
IO dünn halten. Deshalb das Muster „pure `computeX(input, now)` + dünner `getX(userId)`-Wrapper"
in `module-stats.ts` und `jarvis/context.ts`.

---

## 4. Routing & Navigation

### Middleware (`middleware.ts`)
`/`, `/auth/login`, `/auth/signup` → **307-Redirect auf `/dashboard`**. Sonst durchlassen.
Der `JarvisSplash` (`app/(public)/page.tsx`) ist dadurch **nie erreichbar** — er bleibt als
Komponente im Code, ist aber bewusst nicht im Routing-Pfad (Entscheidung: direkt ins
Dashboard, kein Splash-Zwischenschritt).

### Layout-Gruppen
- **`app/(app)/`** — alle echten Seiten. Layout = `AppShell` (`components/layout/AppShell.tsx`):
  `TopBar` (Hamburger + Seitenname) + Slide-in `Sidebar` + PWA-Registrar. `export const dynamic = 'force-dynamic'` (alle Seiten brauchen Runtime-Daten).
- **`app/(public)/`** — nur der unerreichbare Splash.
- **`app/(hub)/`** — **gelöscht.**

### Sidebar (`components/layout/Sidebar.tsx`)
Slide-in von links, 3 Sektionen:
1. **Übersicht** — Dashboard, Jarvis Chat, Kalender, Profil
2. **Bereiche** — dynamisch aus `MODULE_REGISTRY` (alle `status: 'active'`, außer `travel`)
3. **Travel** — Erkunden, Trips

### Module-Registry (`modules/registry.ts`)
Single Source of Truth für Module: `travel, sport, gaming, reading, finance, wedding, goals,
tasks, wiki` = `active`; `coaching` = `coming_soon`. Jedes Modul: `id, name, tagline, icon,
color, href, status`.

---

## 5. Datenmodell & Seed-System

### Schema
SQL-Migrationen in `supabase/migrations/0001…0016`. Geo-Daten (Kontinente/Länder/Städte) in
`supabase/seed/`. Relevante User-Tabellen:

- `user_tasks` — id, user_id, title, area, priority, deadline, notes, status, created_at
- `user_notes` — id, user_id, title, content, category, lektion_nr, lektion_zeitraum, is_pinned, sort_order, updated_at
- `user_run_logs` — distance_km, run_type, duration_minutes, run_date, notes
- `user_games` / `user_books` — status, type, year
- `finance_months` — year, month, kk_saldo_end, kk_free, …
- `wedding_tasks` — title, status, deadline, category
- `user_goals` — status, xp_reward, year
- Geo/Travel: Kontinent→Land→Stadt→Sight Hierarchie + Besuch-Tracking + 19k+ Quests
- `user_profile`, Avatar-, Item-, Streak-, Push-Subscription-Tabellen

### Seed-System (`lib/actions/life-seed.ts`) — wichtig
Vorbefüllung aus „Notion 2026 HQ". `seedAllFromNotion(userId)` ruft parallel
`seedGoals/Games/Books/Finance/Wedding/Tasks/Wiki`.
**Idempotenz-Muster:** Jede Seed-Funktion prüft `count` der Zieltabelle; ist `> 0`, returnt
sie sofort `{seeded:false}`. → Mehrfaches Aufrufen ist harmlos.
**Warum so:** Das Dashboard ruft `seedAllFromNotion` bei **jedem** Load (in try/catch
isoliert, siehe §7.2). Erstbesuch → Daten da. Folgebesuche → no-op dank Count-Check.
**Konsequenz für Optimierung:** Wer Seed-Daten ändert, muss bedenken: bestehende User-Rows
verhindern Re-Seed. Änderung erfordert manuelles Löschen der Tabelle oder eine Migration.

---

## 6. Jarvis-KI (das Herzstück) — vollständige Pipeline

### Dateien
| Datei | Rolle |
|---|---|
| `app/api/jarvis/route.ts` | SSE-Streaming-Endpoint, Modell-Calls, Failover, Tool-Call-Detektion |
| `app/api/jarvis/confirm/route.ts` | Führt bestätigte Tool-Aktionen aus (DB-Write) |
| `lib/jarvis/context.ts` | `formatJarvisContext` (pure, getestet) + `gatherJarvisContext` (DB) |
| `lib/jarvis/context.test.ts` | Unit-Tests der Formatierung |
| `components/jarvis/JarvisFullChat.tsx` | Vollchat `/jarvis` |
| `components/jarvis/JarvisQuickChat.tsx` | Dashboard-Widget |
| `components/jarvis/JarvisToolProposal.tsx` | Bestätigungs-Karte (Ja/Nein) |
| `components/jarvis/JarvisGreeting.tsx` | Zeitbasierte Begrüßung |

### Modelle (`app/api/jarvis/route.ts`)
- **Primary:** `openai/gpt-oss-120b:free`
- **Fallback:** `z-ai/glm-4.5-air:free`

**Warum genau diese:** Das ursprüngliche `deepseek/deepseek-v4-flash:free` war **kaputt** —
es lieferte HTTP 200 mit `content: null` und Müll im `reasoning`-Feld. Der alte Fallback
`meta-llama/llama-3.3-70b-instruct:free` war 429-rate-limited. Beide gewählten Modelle wurden
am 2026-05-17 **live E2E getestet**: korrektes Deutsch + funktionierende Tool-Calls, beide
free-tier.

### Failover-Logik (gehärtet)
Free-Modelle versagen auf zwei Arten: (a) HTTP-Fehler, (b) **HTTP 200 mit leerem Output**
(der kaputte deepseek-Fall). Die Route behandelt **beide**:
1. Primary anfragen. Bei `!res.ok` → sofort Fallback-Modell.
2. Stream lesen, dabei live Tokens durchreichen *und* `producedOutput` tracken
   (true bei erstem Content-Token **oder** erfolgreichem Tool-Call).
3. Wenn der Stream endet und `producedOutput === false` **und** Fallback noch nicht benutzt
   → einmalig Fallback-Modell anfragen und dessen Stream pumpen.
4. Bleibt es leer → `{error:'AI nicht erreichbar'}`.
5. **`data: [DONE]` wird immer** (im `finally`) gesendet → Client-Reader terminiert sauber.
Kein Doppel-Output: ein leeres Modell sendet nichts, bevor der Fallback greift.

### Live-Kontext-Injektion
`gatherJarvisContext(userId)` holt einen Snapshot (offene Tasks + Titel, km/Halbmarathon,
Hochzeits-Countdown, Bücher/Spiele, Finanzen, Goals-XP) und formatiert ihn als
„**Aktueller Stand (live):**"-Block. `buildSystemPrompt(name, liveContext)` hängt ihn vor
den `Tools:`-Abschnitt. In `route.ts` ist der Aufruf in **try/catch** — schlägt der
Kontext-Fetch fehl, läuft der Chat mit statischem Prompt weiter (nie Chat-Bruch).
**Verifiziert:** Jarvis nannte im E2E-Test echte offene Tasks mit Deadlines.

### Tool-Calling-Flow
Tools: `create_task` (→ `user_tasks`), `create_wiki_page` (→ `user_notes`).
1. User-Nachricht → Jarvis schlägt **verbal** vor (System-Prompt: „du schlägst vor, er
   genehmigt") und/oder emittiert nach Bestätigung einen `tool_call`.
2. Server akkumuliert Tool-Call-Fragmente, sendet am Stream-Ende
   `{type:'proposal', tool, params}` statt nur `[DONE]`.
3. Chat-UI ersetzt die Streaming-Bubble durch `JarvisToolProposal` (Ja/Nein-Karte).
4. „Ja" → `POST /api/jarvis/confirm` `{tool, params}` → DB-Insert → Erfolgsmeldung.
5. „Nein" → „Okay, kein Problem."
**E2E verifiziert:** Vorschlag → Bestätigung → echter Insert in `user_tasks`.

### System-Prompt-Stil (in `route.ts`)
Jarvis: direkt, witzig, manchmal frech, loyal. Max 3–4 Sätze. Immer Deutsch (außer User
schreibt Englisch). Kein Markdown in Textantworten (nur in Wiki-Inhalten). Letzte 20
History-Nachrichten werden mitgeschickt.

---

## 7. Dashboard / Hub (`app/(app)/dashboard/page.tsx`)

Der einzige Hub. Server-Component. Ablauf beim Load:

1. `requireUserId()`
2. **`seedAllFromNotion(userId)` in eigenem try/catch** (§7.2) — läuft *vor* den Stats.
3. `Promise.all`: profile, userStats, recentActivity, avatarUrl, streak.
4. `Promise.all`: `getModuleStats(userId)` + `getTodayOverview(userId)`.

Gerenderte Sektionen (von oben):
- **Jarvis-Greeting** (zeitbasiert)
- **CharacterCard** (Name, Level, Avatar, Streak, Mood)
- **DailyNudge** + **StreakBadge**
- **Heute** — aktuelle/nächste Laufplan-Woche, überfällige/heute fällige Items (Link zu
  `/tasks` bzw. `/wedding`), heutige Termine
- **Meine Bereiche** — Modul-Grid mit **Live-Werten** (`moduleStats[m.id]` headline/subline,
  Fallback auf statische `tagline`)
- **Travel Stats** — KPI-Kacheln (Kontinente/Länder/Städte/Sights) + Erkunden/Trips-Links
- **JarvisQuickChat** — eingebettetes Chat-Widget
- **Zuletzt** — RecentFeed

### 7.1 `lib/dashboard/module-stats.ts`
`computeModuleStats(input, now)` — **pure, 10 Unit-Tests**. Berechnet headline/subline pro
Modul (sport, gaming, reading, finance, wedding, goals, tasks, wiki). Konstanten:
`HM_DATE='2026-10-25'`, `STANDESAMT_DATE='2026-10-10'`. `/6 Bücher` und `L1–L17` sind
**bewusst fixe 2026-Plan-Ziele** (kommentiert, nicht aus Daten abgeleitet).
`getModuleStats(userId)` = dünner Supabase-Wrapper (8 parallele Queries) → ruft die pure Fn.

### 7.2 Seed-Fehler-Isolation (Entscheidung)
`seedAllFromNotion` läuft in eigenem `try/catch`, **nicht** im `Promise.all`.
**Warum:** Ein Seed-Fehler beim allerersten Vercel-Load darf nicht die ganze Seite 500en
(sonst untestbar). Bei Fehler: `console.error`, Seite rendert trotzdem (mit vorhandenen
Daten / statischen Taglines).

### 7.3 `lib/dashboard/today.ts`
`getTodayOverview(userId)` → `{ todayISO, dueItems, todayEvents, upcomingEvents, planWeek,
nextPlanWeek, daysToHM }`. Quelle für die „Heute"-Sektion. Bestand schon vor diesem Milestone.

---

## 8. Module (Features im Detail)

Alle Modul-Seiten unter `app/(app)/<modul>/page.tsx`, Server-Components, rufen beim Load die
passende `seed*`-Funktion (idempotent).

| Modul | Route | Was es kann | Datenquelle |
|---|---|---|---|
| **Travel/Explore** | `/explore` | Kontinent→Land→Stadt→Sight Hierarchie, Besuch-Tracking, Volltextsuche, 19k+ Quests (+5 XP) | Geo-Tabellen |
| **Trips** | `/trips`, `/trips/[id]` | Reisen erstellen, Stops sequenzieren, Quests pro Stop, Completion | Trip-Tabellen |
| **Sport** | `/sport` | 500-km-Jahresziel, Laufplan 2026 (KW 22–43), Halbmarathon-Countdown (25.10.2026), Run-Log, Wochenroutine | `user_run_logs`, `lib/sport/laufplan.ts` |
| **Gaming** | `/gaming` | 10-Spiele-Jahresziel, 10 Slots, Status (Pipeline/Aktiv/Fertig) | `user_games` |
| **Lesen** | `/reading` | 6 Bücher + 6 Hörbücher Ziel, Fortschritt | `user_books` |
| **Finanzen** | `/finance` | Monats-Tracking, KK-Saldo/-frei, Tilgungsplan | `finance_months` |
| **Hochzeit** | `/wedding` | Standesamt-Countdown (10.10.2026), Tasks in 3 Kategorien | `wedding_tasks` |
| **Ziele** | `/goals` | Jahresziele pro Bereich, XP-Belohnung, Fortschritt | `user_goals` |
| **Tasks** | `/tasks` | 9 Bereiche, Prioritäten high/medium/low, Deadlines, open/done, Inline-Edit (Titel/Beschreibung/Bereich/Prio/Datum) | `user_tasks` |
| **Wiki** | `/wiki`, `/wiki/[id]`, `/wiki/new` | Notizen, 9 Kategorien, Pin, Zeitlektüren L1–L17, Buch-Typografie | `user_notes` |
| **Kalender** | `/calendar` | Event-Tracking, ICS-Export (`/api/calendar/ics`, Apple/Outlook-Sync) | Event-Tabellen |
| **Coaching** | — | `coming_soon`, nicht implementiert | — |

> **Tasks-Inline-Edit** kam via PR #13 (`4606424`) parallel auf `main` und wurde in diesen
> Milestone konfliktfrei integriert (disjunkte Dateien).

---

## 9. Gamification

### XP & Level (`lib/xp.ts`)
8 Tiers: Newcomer(0) → Wanderer(100) → Traveler(250) → Explorer(600) → Pathfinder(1500) →
Seasoned Explorer(4000) → World Citizen(12000) → Legend(30000).
`XP_EVENTS`: continentVisit 100, countryVisit 50, cityVisit 10, sightCompleted 5,
dateBonus 3, noteBonus 2, tripCreated 20, tripStopAdded 5.

### Streak & Mood (`lib/streaks/streak.ts`)
Tages-Streak, Milestones [7,14,30,100]. `isAlive` = heute aktiv oder gestern aktiv (1 Tag
Grace). Mood-Ableitung: aktiv+Streak≥7 → `excited`, alive → `neutral`, sonst `sad`. Mood
steuert die Avatar-Anzeige.

### Achievements, Avatar, Items
7 Achievements (auto nach Stats). 4-Layer-Avatar (Background/Outfit/Accessory/Frame),
Level-Unlocks. Pixel-Avatar via Replicate, Rate-Limit 1/Monat
(`lib/avatar/rate-limit.ts` — **siehe §12, bekanntes Test-Problem**).

---

## 10. Style-System

Dark Theme. Tailwind Custom-Tokens (`tailwind.config.ts`):

| Token | Hex | Nutzung |
|---|---|---|
| `bg-base` | `#0e1a26` | Seiten-Hintergrund |
| `bg-surface` | `#121e2c` | Karten |
| `bg-elevated` | `#162230` | hervorgehobene Flächen |
| `text-primary` | `#e0eef8` | Haupttext |
| `text-secondary` | `#a8c4d8` | Sekundärtext |
| `text-muted` | `#7892a8` | Labels/gedämpft |
| `accent-blue` | `#40a0d0` | **primärer Akzent** (Jarvis-Identität) |
| `accent-amber` | `#d48030` | Reading/Wiki |
| `accent-green` | `#40c070` | Sport/Erfolg |
| `accent-purple` | `#a060e0` | Profil/Gaming |
| `border-subtle` | `#192535` | Rahmen |

Konventionen: Jarvis-Identität = `#40a0d0` + radialer Glow + `font-mono` „J"-Badge.
`.label-mono` (uppercase, getrackt) für kleine Labels. Sidebar/Drawer-BG
`rgba(10,17,27,0.98)`. Karten: `rounded-xl border border-border-subtle bg-bg-surface`.
Aktive Buttons `active:scale-[0.98]`. Sprache: **Deutsch** in der UI.

---

## 11. Entwicklung & Deployment

### Lokal
`npm run dev` → http://localhost:3000. Keine Env-Vars nötig für DB (hardcoded Fallback).
Für Jarvis: `.env.local` mit `OPENROUTER_API_KEY=...` (gitignored).

### Git-Worktree-Eigenheit (wichtig)
Entwicklung lief in `/.claude/worktrees/<name>` (separater Worktree). Worktrees haben **kein
eigenes `node_modules`** → Lösung: `node_modules` im Worktree ist ein **Symlink** auf das
`node_modules` des Haupt-Repos (gitignored, beeinflusst `main` nicht).
**Nicht** `vitest.config.ts` patchen, um Pfade zu fixen — der `server-only`-Alias dort muss
`node_modules/server-only/empty.js` bleiben (sonst bricht es auf `main`).

### Test-Befehl-Hinweis
`npx vitest run lib/<datei>.test.ts` für gezielte Läufe. Vitest-Config: `environment: node`,
Tests = `lib/**/*.test.ts`, `@`→Repo-Root, `server-only`→Empty-Stub.

### Deployment (Vercel)
**Auto-Deploy aus `origin/main`.** Der Nutzer testet **nur auf der Vercel-Production**, nicht
lokal → Arbeit muss nach `main` gemerged werden, sonst untestbar.
Es gibt **mehrere Vercel-Projekte** auf demselben Repo (`my-travel-app`, `-ubcs`, `-sbzl` —
intern noch `my-travel-app-…`, Umbenennung auf `jarvis` offen). Deployment-URLs sind durch
**Vercel Deployment Protection** geschützt (401 von extern) → Production nur im eingeloggten
Browser des Nutzers testbar.

### Merge-Lektion (für künftige Sessions)
`origin/main` kann zwischendurch divergieren (parallele PRs, manuelle Commits). **Nie
force-pushen.** Korrekt: `origin/main` in den Feature-Branch mergen, Konflikte im isolierten
Worktree lösen, verifizieren (`tsc` + `build` + Unit-Tests), dann **Fast-Forward**-Push
`git push origin HEAD:main`. So blieben PR #13 + das lokale `91e7321` erhalten.

---

## 12. Bekannte Probleme / Out-of-Scope

| Problem | Status |
|---|---|
| `lib/avatar/rate-limit.test.ts` — 4 Tests rot | **Pre-existing**, vor diesem Milestone schon kaputt, Datei nie angefasst. Out of scope. Separat fixen. |
| Push Notifications | Infrastruktur + Toggle da, **nicht E2E aktiv** |
| Coaching-Modul | `coming_soon`, nicht implementiert |
| Vercel-Projektname | Intern `my-travel-app-…`, Umbenennung auf `jarvis` offen |
| Splash-Screen | Im Code, aber per Middleware unerreichbar (bewusst) |
| `next build` + `tsc` Reihenfolge | Generierte `.next/types` können kurzzeitig einen `wiki/page.tsx`-`CATEGORIES`-Typfehler zeigen — Artefakt, nach `git worktree prune` / sauberem `tsc` weg. `next build` (was Vercel nutzt) ist grün. |

---

## 13. Wo mit Optimierung starten

Sinnvolle nächste Schritte (Priorität grob absteigend):

1. **Jarvis-Robustheit live beobachten** — Free-Modelle sind wackelig. Im Vercel-Log auf
   „Jarvis context error" und Failover-Häufigkeit achten. Ggf. weitere Free-Modelle als
   2. Fallback ergänzen (Liste live via `GET https://openrouter.ai/api/v1/models`, Filter
   `:free`, mit Tool-Support testen — IDs ändern sich!).
2. **Jarvis-Kontext erweitern** — `gatherJarvisContext` um mehr Module/Details ergänzen
   (z.B. Travel-Fortschritt, anstehende Termine), Token-Budget im Auge behalten.
3. **Tasks-Inline-Edit + Dashboard verzahnen** — neues Feature aus PR #13; prüfen, ob
   Dashboard-„Heute" und Modul-Stats die Edits korrekt spiegeln.
4. **`rate-limit.test.ts` reparieren** — kleiner, isolierter Fix.
5. **Push Notifications E2E** — Infrastruktur steht, Verdrahtung fehlt.
6. **Coaching-Modul** umsetzen.
7. **Vercel-Projekt** auf `jarvis` umbenennen, überzählige Projekte aufräumen.

---

## 14. Entscheidungs-Log (Milestone 2026-05-17)

- **Zwei Hubs → einer:** `/hub` gelöscht, Logik nach `lib/dashboard/module-stats.ts`
  extrahiert, Dashboard ist der Hub. *Grund: Konsistenz, kein navigationsloser Dead-End.*
- **Einstieg → `/dashboard`:** Middleware-Redirect geändert, Splash bewusst aus dem Pfad.
- **7 tote `/hub`-Referenzen** (login redirect, signup push, auth redirect, 4× revalidatePath)
  → `/dashboard` repointed. *Grund: sonst 404 / stale Cache nach (hub)-Löschung.*
- **Jarvis-Modell-Swap:** deepseek-v4-flash (kaputt, 200+null) → gpt-oss-120b:free,
  Fallback glm-4.5-air:free. *Grund: altes Primärmodell unbrauchbar; beide neuen live getestet.*
- **Failover gehärtet:** auch bei 200-mit-leerem-Content (nicht nur HTTP-Fehler).
  *Grund: kaputtes Modell triggert sonst kein Failover.*
- **Seed-Fehler isoliert** (eigener try/catch im Dashboard). *Grund: kein 500 beim
  Erst-Load auf Vercel.*
- **Pure/IO-Trennung** für `module-stats` & `jarvis/context`. *Grund: Test-Konvention §3.5.*
- **`origin/main`-Divergenz** (PR #13 + manueller `91e7321`) konfliktfrei integriert,
  Fast-Forward-Push, kein Force. *Grund: nichts zerstören, alles bewahren.*

Spec & Plan dieses Milestones: `docs/superpowers/specs/2026-05-17-jarvis-testable-state-design.md`,
`docs/superpowers/plans/2026-05-17-jarvis-testable-state.md`.

---

*Zuletzt aktualisiert: 2026-05-17*
