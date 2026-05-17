# Jarvis — Status & Roadmap

> Stand: Mai 2026 · Repo: `Cossuleprivat/jarvis`

---

## Was ist das?

**Jarvis** ist ein persönliches Lebens-OS — ein zentrales Dashboard für alle Lebensbereiche mit einem KI-Assistenten (Jarvis) als Herzstück. Die App basiert auf Next.js 15, Supabase, und ist auf Vercel deployed.

---

## Implementierte Features (aktueller Stand)

### ✅ Core-System

| Feature | Details |
|---|---|
| **Auth** | Supabase Login/Signup, Cookie-Sessions, Middleware-Schutz |
| **XP-System** | 8 Level-Stufen (Newcomer → Legend), Event-basierte XP-Vergabe |
| **Achievements** | 7 Abzeichen, automatisch freigeschaltet nach Stats |
| **Streak-System** | Tages-Streak mit Verfall, Mood-System, Meilensteine (7/14/30/100 Tage) |
| **Items & Customization** | 4-Layer Avatar-System (Background/Outfit/Accessory/Frame), Level-Unlocks |
| **Pixel-Avatar** | KI-Generierung via Replicate, Rate-Limiting (1/Monat), Mood-Anzeige |
| **Push Notifications** | Infrastruktur vorhanden (Tabelle, Toggle), noch nicht vollständig verdrahtet |

### ✅ Travel-Modul (vollständig)

| Feature | Details |
|---|---|
| **Explore-Hierarchie** | Kontinent → Land → Stadt → Sehenswürdigkeit |
| **Besuch-Tracking** | Kontinente, Länder, Städte als besucht markieren |
| **Sight-Checklisten** | 19.321 Quests in der DB, +5 XP pro Abgehaktem |
| **Suche** | Volltext-Suche über gesamte Geografie |
| **Trip-Planer** | Reisen erstellen, Stops sequenzieren, Quests pro Stop, Completion-Tracking |
| **KPI-Dashboard** | 7 Kontinente, Länder, Städte, Sights live gezählt |

### ✅ Life-Module (vollständig implementiert, Navigation fehlt noch)

| Modul | Was es macht |
|---|---|
| **Sport** | 500 km Jahresziel, Laufplan 2026 (Woche 22–43), Halbmarathon-Countdown (25. Okt), Run-Log |
| **Gaming** | 10 Spiele-Jahresziel, 10 Slots, Status-Tracking (Pipeline/Aktiv/Fertig) |
| **Lesen** | 5 Bücher + 5 Hörbücher Ziel, Fortschritts-Tracking, Routine-Sektion |
| **Finanzen** | Monats-Tracking, Schulden-Tilgungsplan (3 Kredite), Sonderausgaben, Haushalts-Status |
| **Hochzeit** | Countdown zu 10.10.2026, Aufgaben in 3 Kategorien (Standesamt, Freie Trauung, Allgemein) |
| **Wiki** | Notizen mit 9 Kategorien, Pin-Funktion, Zeitlektüren-Struktur, vorbefüllt |
| **Kalender** | Event-Tracking, ICS-Export (Apple Calendar / Outlook sync) |
| **Tasks** | 9 Bereiche, Prioritäten (High/Med/Low), Deadlines, Status open/done |
| **Jahres-Ziele** | Ziele pro Lebensbereich, XP-Belohnungen, Fortschritts-Balken |

### ✅ Jarvis-UI (vollständig, Backend noch Mock)

| Feature | Details |
|---|---|
| **Splash-Screen** | Cinematic Entry mit Click-to-Enter, animierter Orb, Scan-Lines |
| **Jarvis Hub** | Dashboard als Kommandozentrale mit Modul-Grid, Greeting, Character-Card |
| **Quick-Chat** | Widget direkt im Dashboard, Vorschlags-Chips |
| **Vollchat** | Eigene `/jarvis`-Seite mit Gesprächsverlauf, Kontext, Typing-Indikator |
| **Mock-API** | Persönlichkeits-getriebene Antworten (Reisen, Motivation, Fitness, Begrüßung) |
| **Navigation** | BottomNav 5 Tabs: Hub · Reisen · Trips · Jarvis · Profil |

---

## Bekannte Probleme

| Problem | Priorität | Details |
|---|---|---|
| **Navigation unvollständig** | 🔴 KRITISCH | BottomNav zeigt nur 5 Tabs. Life-Module (Sport, Gaming, Lesen, Finanzen, Hochzeit, Wiki, Kalender, Tasks, Ziele) sind erreichbar, aber nicht sichtbar in der Nav. Module-Grid im Hub zeigt noch "Coming Soon" für fertige Features. |
| **Jarvis KI ist ein Mock** | 🔴 KRITISCH | Kein echter Claude-Call. Anthropic API-Key noch nicht eingebunden. |
| **Push Notifications** | 🟡 MITTEL | DB-Tabelle und Toggle existieren, Ende-zu-Ende noch nicht aktiv. |
| **Vercel Projektname** | 🟢 NIEDRIG | Heißt noch `my-travel-app-3sfb` intern. Kann in Vercel-Dashboard umbenannt werden. |

---

## Roadmap

### Phase 1 — Navigation & Hub fertigstellen (Diese Woche)

**Ziel:** Alle implementierten Module sind erreichbar. Der Hub zeigt den echten Status.

- [ ] **Hub-Modul-Grid reparieren** — Sport, Gaming, Lesen, Finanzen, Hochzeit, Wiki, Kalender, Tasks, Ziele als aktive Kacheln anzeigen
- [ ] **Navigation ausbauen** — Entweder Sidebar mit allen Modulen wiederherstellen, oder BottomNav mit "Mehr"-Tab + Drawer
- [ ] **Jarvis-Greeting kontextuell** — Jarvis soll wissen welches Modul gerade aktiv ist und darauf Bezug nehmen
- [ ] **Modul-Einstiegsseiten polieren** — Jedes Modul bekommt einen sauberen Header mit Jarvis-Sprechblase

---

### Phase 2 — Echter Jarvis mit Claude Haiku (Nächste Woche)

**Ziel:** Jarvis ist ein echter KI-Assistent der über alle Lebensbereiche Bescheid weiß.

- [ ] **Anthropic API-Key** eintragen (`.env.local`: `ANTHROPIC_API_KEY=sk-ant-...`)
- [ ] **Claude Haiku einbinden** — `claude-haiku-4-5-20251001` (günstigstes Modell) in `/api/jarvis/route.ts`
- [ ] **System-Prompt mit Kontext** — Jarvis kennt: Name, Level, Streak, aktive Trips, Monatsziel-Status, Hochzeits-Countdown
- [ ] **Modul-Agenten** — Jedes Modul hat einen eigenen Charakter-Prompt:
  - Travel-Agent: abenteuerlüstern, kennt alle Städte
  - Sport-Agent: motivierend, kennt den Laufplan
  - Finance-Agent: sachlich, kennt Schuldenstand
  - Wedding-Agent: entspannt aber fokussiert
- [ ] **Gesprächsgedächtnis** — Letzte 10 Nachrichten als Kontext mitschicken
- [ ] **Streaming-Antworten** — Buchstabe für Buchstabe erscheinen für Echtzeit-Feeling

---

### Phase 3 — Jarvis wird smarter (Folgewoche)

**Ziel:** Jarvis handelt proaktiv und kennt den Alltag.

- [ ] **Kontext-API** — Endpunkt der alle User-Daten für Jarvis zusammenstellt (Stats, Goals, Streak, offene Tasks, aktuelle Trips)
- [ ] **Tagesbrief** — Jarvis generiert jeden Morgen eine kurze Zusammenfassung: was steht an, welche Ziele sind in Gefahr, was wurde gestern erreicht
- [ ] **Proaktive Nudges** — Jarvis erinnert an Streak-Gefahr, nahende Deadlines, Hochzeits-Aufgaben
- [ ] **Schnellbefehle** — Sprich direkt mit Jarvis: "Füge 5 km Run hinzu", "Zeig meinen Schuldenstand", "Was habe ich diese Woche erledigt"
- [ ] **Jarvis-Persönlichkeit ausbauen** — Mehr Sprüche, Kontext-aware Reaktionen, Referenzen auf vergangene Gespräche

---

### Phase 4 — Polish & PWA (Mittelfristig)

**Ziel:** Die App fühlt sich wie eine native App an.

- [ ] **Push Notifications** aktivieren — Streak-Warnung, Tagesbrief, Hochzeits-Meilensteine
- [ ] **Offline-Support** — Service Worker für die wichtigsten Seiten
- [ ] **Travel-Map** — Weltkarte mit besuchten Ländern (interaktiv, gefärbt nach Besuchen)
- [ ] **Onboarding-Flow** — Neuer Nutzer wählt Lebensbereiche, Jarvis stellt sich vor
- [ ] **Vercel Projektname** → `jarvis` in Vercel-Dashboard umbenennen

---

### Phase 5 — Langfristige Vision

- [ ] **Jarvis als echter Agent** — Kann Tasks anlegen, Trips planen, Ziele anpassen — nicht nur antworten
- [ ] **Social Features** — Reise-Highlights teilen, Achievements zeigen
- [ ] **API-Key einsparen** — Caching, Prompt-Komprimierung, Zusammenfassungen statt voller History
- [ ] **Mehrere Nutzer** — Eventual support für Partner/Freunde (Hochzeits-Planung gemeinsam)
- [ ] **Mehr Life-Module** — z.B. Ernährung, Lernprojekte, Musik

---

## Technologie-Stack

| Layer | Technologie |
|---|---|
| Frontend | Next.js 15, React 19, Tailwind CSS |
| Backend | Next.js App Router (Server Components + Server Actions) |
| Datenbank | Supabase (PostgreSQL + Storage) |
| Auth | Supabase Auth |
| KI | Replicate (Avatar), Anthropic Claude Haiku (Jarvis, geplant) |
| Deployment | Vercel |
| Avatar | Replicate (Flux Pixel-Art Modell) |

---

## Kosten-Abschätzung Jarvis KI

> Modell: `claude-haiku-4-5` — günstigstes Claude-Modell

| Nutzung | Tokens/Monat | Kosten/Monat |
|---|---|---|
| 10 Chats/Tag × 200 Token | ~60.000 | ~$0.05 |
| 30 Chats/Tag × 500 Token | ~450.000 | ~$0.40 |
| Mit Kontext-System-Prompt (~500 Token fix) | +450.000 | +$0.40 |
| **Realistisch gesamt** | **~500.000** | **~$0.50–1.00** |

Haiku kostet $0.80/1M Input-Token, $4.00/1M Output-Token. Bei persönlicher Nutzung bleibt das sehr günstig.

---

*Zuletzt aktualisiert: Mai 2026*
