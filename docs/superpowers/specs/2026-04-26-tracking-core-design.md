# Travel Scorer — Tracking Core Design

**Datum:** 2026-04-26
**Session:** Brainstorming Session 02
**Status:** Approved

---

## 1. Ziel & Scope

Fokus dieser Iteration: Das **Tracking-Kernsystem** — Nutzer können Kontinente, Länder, Städte und Sehenswürdigkeiten als besucht markieren. Gamification durch XP und Level. Trip-Planung ist explizit **Out of Scope** für diese Iteration.

### In Scope
- Explore-Route mit Hierarchy-Browser + globaler Suche
- Visit-Tracking auf allen Ebenen (Kontinent / Land / Stadt / Sehenswürdigkeit)
- Dashboard mit Charakter, XP/Level, KPI-Karten, Recent-Feed
- Profil-Seite mit Character-Display, Name, Mini-Stats, Achievements-Strip, Einstellungen
- Seed-Daten: Kontinente, Länder, Top-Städte pro Land
- Landmarks via Wikidata API (on-demand, gecacht)
- Basis-Gamification: XP pro Aktion, Level-Thresholds

### Out of Scope (nächste Sessions)
- Pixel-Character-Sprites (5 Presets + Customization-Items)
- Trip-Planung / Routen-Planer
- Community-Features, Store, Microtransactions
- Auth-Implementierung (bleibt deaktiviert bis alle Features fertig)
- Timeline / Tagebuch-Stempel-Ansicht (nach Tracking-Core)
- Map-Ansicht (`/map`)

---

## 2. Visuelles Design-System

### Farbpalette (Pivot von Editorial zu Pixel Adventure)
| Token | Wert | Verwendung |
|-------|------|-----------|
| bg.base | `#0e1a26` | App-Hintergrund |
| bg.surface | `#121e2c` | Cards, Panels |
| bg.elevated | `#162230` | Inputs, aktive Items |
| text.primary | `#c0dff0` | Haupttext |
| text.secondary | `#80a0b8` | Sekundärtext |
| text.muted | `#405060` | Metadaten, Labels |
| accent.blue | `#40a0d0` | Primär-Interaktion, aktive Nav, CTAs |
| accent.amber | `#d48030` | XP, Länder-KPI, Gamification |
| accent.green | `#40c070` | Visited-Badges, Erfolg |
| accent.purple | `#a060e0` | Sehenswürdigkeiten-KPI |
| border.subtle | `#192535` | Trennlinien |
| border.interactive | `#2a5070` | Hover, Focus |

### Typografie
- UI-Text: `system-ui` / `Segoe UI` (kein Custom Font nötig für dark UI)
- Zahlen/Badges/Labels: `monospace` (gibt Pixel-Art-Feeling ohne echte Pixel-Fonts)
- Charaktername, Level: monospace + uppercase

### Character-Sprites
- Für diese Iteration: **ein statischer Platzhalter-Sprite** (CSS-Pixel-Grid) im Dashboard und Profil
- Nächste Session: 5 echte Pixel-Art-Presets + 4 Customization-Slots (Hut, Jacke, Brille, Stiefel)

---

## 3. Architektur — Explore-First

### Routen
```
/dashboard           → Stats-Übersicht + Character + Recent Feed
/explore             → Kontinente-Liste (Startpunkt Hierarchy)
/explore/[continent] → Länder-Liste des Kontinents
/explore/[continent]/[country]        → Städte-Liste des Landes
/explore/[continent]/[country]/[city] → Stadt-Detail + Sights-Checklist
/profile             → Character + Stats + Customization + Settings
```

Bestehende Routen bleiben erhalten, `/trips` bleibt Skeleton bis Trip-Session.

### Navigation (Bottom Nav — 4 Items)
1. **Dashboard** (⌂) — Startseite
2. **Explore** (◎) — Tracking-Hub
3. **Trips** (✈) — Placeholder
4. **Profil** (◈) — Character & Settings

---

## 4. Datenquellen (Hybrid-Strategie)

### Statisch geseedet (einmalig in Supabase)
- **7 Kontinente** — manuell
- **~250 Länder** — aus `restcountries.com` Daten (Name, ISO-Code, Flaggen-Emoji, Kontinent-Zuordnung)
- **Top 3–5 Städte pro Land** — aus öffentlichen Quellen (GeoNames / Wikipedia), ~750–1.250 Städte
- Seed-Skript erstellt Claude aus öffentlich verfügbaren Daten

### On-demand via API (gecacht in Supabase)
- **Sehenswürdigkeiten pro Stadt** — Wikidata SPARQL oder Wikipedia "Tourist attractions"-Listen
- Beim ersten Aufruf einer Stadt-Seite geladen und in `sights`-Tabelle gecacht
- Top 8–12 Sights pro Stadt

### Bestehende Tabellen (Migrationen 0001–0007 vorhanden)
```
continents          → id, code, name
countries           → id, continent_id, code, name
cities              → id, country_id, slug, name, lat, lng
quests              → id, city_id, title, category (landmark/activity/restaurant/hidden_gem)
user_city_visits    → id, user_id, city_id, start_date (NOT NULL!), end_date, notes
user_quest_progress → id, user_id, quest_id, status (not_started/planned/completed)
user_profiles       → id, display_name, home_city_id, travel_interests
```

### Neue Migration 0008 (im Rahmen dieser Iteration)
```sql
-- 1. Fehlende Spalten an Referenzdaten
ALTER TABLE continents ADD COLUMN IF NOT EXISTS emoji text;
ALTER TABLE continents ADD COLUMN IF NOT EXISTS slug text UNIQUE;
ALTER TABLE countries  ADD COLUMN IF NOT EXISTS flag_emoji text;
ALTER TABLE countries  ADD COLUMN IF NOT EXISTS iso2 text;
ALTER TABLE countries  ADD COLUMN IF NOT EXISTS slug text UNIQUE;

-- 2. start_date nullable machen (war NOT NULL — blockiert "War hier"-Tap ohne Datum)
ALTER TABLE user_city_visits ALTER COLUMN start_date DROP NOT NULL;

-- 3. Kontinent- und Länder-Tracking (neue Tabellen)
CREATE TABLE user_continent_visits (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  continent_id uuid NOT NULL REFERENCES continents(id),
  visited_at  timestamptz DEFAULT now(),
  UNIQUE (user_id, continent_id)
);

CREATE TABLE user_country_visits (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  country_id  uuid NOT NULL REFERENCES countries(id),
  visited_at  timestamptz DEFAULT now(),
  UNIQUE (user_id, country_id)
);

-- 4. XP + Level am Profil
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS xp_total integer NOT NULL DEFAULT 0;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS level   integer NOT NULL DEFAULT 1;

-- 5. Achievements
CREATE TABLE user_achievements (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement  text NOT NULL,
  unlocked_at  timestamptz DEFAULT now(),
  UNIQUE (user_id, achievement)
);
```

**Hinweis Sehenswürdigkeiten**: Die bestehende `quests`-Tabelle wird als "Sights" genutzt (`category = 'landmark'` für klassische Sehenswürdigkeiten). `user_quest_progress.status = 'completed'` entspricht "abgehakt". Kein neuer Tabellen-Overhead.

RLS: Nutzer sieht nur eigene Visit/Progress-Zeilen. Referenzdaten (`continents`, `countries`, `cities`, `quests`) sind public read.

---

## 5. Tracking-Interaktion

### A+B: Hierarchy-Browser + Globale Suche

**Suche** (immer oben auf `/explore` und allen Unterseiten):
- Sucht live across alle Ebenen: Kontinent, Land, Stadt, Sight
- Ergebnis zeigt Typ + Pfad (z.B. "Paris · Frankreich · Europa")
- Pro Ergebnis: "+ Track"-Button für Sofort-Tracking ohne Navigation

**Hierarchy-Browser**:
- Breadcrumb-Navigation zeigt aktuellen Pfad
- Jede Zeile: Icon + Name + Sub-Info + Badge + Pfeil
- Badge-Status: `✓ Visited` (grün) / `7/12` (amber, teilweise) / `Neu` (blau)
- Tippen auf eine Zeile navigiert eine Ebene tiefer

### Stadt-Screen (Endpunkt)
1. **"WAR HIER"-Button** — ein Tap, sofort `user_visit` angelegt, +XP vergeben
2. **Hint-Banner** — "Mit Datum wird ein Tagebuch-Stempel erstellt" → aufklappbar
3. **Optionale Felder** (nach Hint-Tap sichtbar):
   - Datum von / bis (date picker)
   - Notiz (textarea, max 500 Zeichen)
4. **Sights-Checklist** — darunter, jede Sehenswürdigkeit einzeln abhakbar (+5 XP)

---

## 6. Gamification (Basis)

### XP-Tabelle
| Aktion | XP |
|--------|----|
| Kontinent als besucht markiert | 100 XP |
| Land als besucht markiert | 50 XP |
| Stadt als besucht markiert | 10 XP |
| Sight abgehakt | 5 XP |
| Datum zu Besuch hinzugefügt | +3 XP Bonus |
| Notiz hinzugefügt | +2 XP Bonus |

### Level-Thresholds (MVP)
| Level | XP | Titel |
|-------|----|-------|
| 1 | 0 | Newcomer |
| 2 | 100 | Wanderer |
| 3 | 250 | Traveler |
| 5 | 600 | Explorer |
| 8 | 1.500 | Pathfinder |
| 12 | 4.000 | Seasoned Explorer |
| 20 | 12.000 | World Citizen |
| 30 | 30.000 | Legend |

### Achievements (Basis-Set)
Werden in `user_achievements`-Tabelle gespeichert. Achievements triggern beim Überschreiten von Schwellenwerten.

| Achievement | Bedingung |
|-------------|-----------|
| First Steps | Erste Stadt getrackt |
| Continent Hopper | 2 Kontinente besucht |
| World Explorer | 5 Kontinente besucht |
| Country Collector | 10 Länder besucht |
| Globe Trotter | 50 Länder besucht |
| City Slicker | 25 Städte besucht |
| Sight Seer | 50 Sights gesehen |

---

## 7. Screens im Detail

### Dashboard (`/dashboard`)
- **Character-Card**: Pixel-Sprite (Platzhalter), Name, Titel, XP-Bar (current/next level)
- **4 KPI-Karten**: Kontinente (blau) / Länder (amber) / Städte (grün) / Sights (lila)
- **Recent Feed**: Letzte 5 getrackte Orte (Icon + Name + Datum + XP)
- **CTA**: "Erkunden →" Link zu `/explore`

### Explore (`/explore` + Unterseiten)
- Sticky Suchbar oben
- Breadcrumb unter Suchbar
- Liste der aktuellen Hierarchie-Ebene
- Leerer Zustand: "Noch nichts getrackt — fang an zu erkunden!"

### Stadt-Detail (`/explore/[cont]/[country]/[city]`)
- Header: Flagge, Stadtname, Land · Kontinent · N Sights
- "WAR HIER"-Button (großflächig, prominentes CTA)
- Hint-Banner für optionale Felder
- Sights-Sektion mit Checklist

### Profil (`/profile`)
- **Hero**: Pixel-Sprite (groß), Name + Edit-Button, XP-Bar, Mini-Stats (3 KPIs)
- **Customization**: 4 Slots (Hut / Jacke / Brille / Stiefel), Locked-Banner für zukünftige Items
- **Achievements**: Horizontaler Strip, unlocked in Farbe, locked ausgegraut
- **Einstellungen**: Name, Sprache, Notifications, Account & Privacy

---

## 8. Strategische Notizen (für spätere Sessions)

### Wettbewerb & Differenzierung
- **Visited Earth / Been** — reine Karten-Tracker, kein Gamification, kein Social
- **Polarsteps** — Reisetagebuch-Fokus, gut für aktive Trips, schwach im Rückblick-Tracking
- **Checkmark** — Länder-Checklist, kein Gamification
- **Differenzierung Travel Scorer**: Pixel-Character + Leveling + Community (Items verdienen) — einziger Tracker mit RPG-DNA

### Monetarisierung (geplant, nicht jetzt)
- **Free Tier**: Tracking + Basis-Charakter + alle Kontinente/Länder/Städte
- **Einzel-Käufe (Microtransactions)**: Premium Item-Packs (Jacken, Hüte, Skins)
- **Level-Unlocks**: Bestimmte Items nur durch leveln (nie nur durch Geld — wichtig für Fairness)
- **Premium-Abo** (später): Erweiterte Stats, Timeline, Community-Features

### PWA vs. Native App
- **Phase 1 (jetzt)**: PWA — schnell deploybar, kein App-Store-Overhead, gut zum Validieren
- **Phase 2**: React Native / Expo wenn PMF nachgewiesen und Community-Features kommen
- PWA ist ausreichend bis ~10k aktive Nutzer, danach Push-Notifications und Offline ein Argument für Native

### Nächste Sessions (Reihenfolge)
1. **Session 02** (diese Spec): Tracking-Core implementieren
2. **Session 03**: Pixel-Characters (5 Presets + 4 Customization-Slots modellieren & rendern)
3. **Session 04**: Timeline / Tagebuch-Stempel-Ansicht
4. **Session 05**: Auth aktivieren (Supabase, Session-Guard, Login)
5. **Session 06**: Trip-Planung
6. **Session 07**: Community-Features + Store

---

## 9. Supabase Integration — Aktueller Stand

Die Migrations-Dateien `0001–0007` sind lokal vorhanden aber **noch nicht auf Supabase deployed**. Der Next.js-Stack ist ebenfalls noch **nicht committed**. Vor Implementierungsstart:
- [ ] Supabase-Projekt verbinden (`.env.local` mit `NEXT_PUBLIC_SUPABASE_URL` + `ANON_KEY`)
- [ ] Migrations deployen
- [ ] Seed-Skript ausführen (Kontinente, Länder, Städte)
- [ ] Supabase-Client in `lib/supabase.ts` einrichten

---

*Mockups gespeichert in `.superpowers/brainstorm/` (in `.gitignore`).*
