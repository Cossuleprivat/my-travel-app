# Travel Scorer — Vollständige Roadmap v2 (Stand: 2026-05-08)

## Strategie: "Hook First" (Ansatz B)

Der einzige echte Whitespace am Markt ist die Kombination aus:
- **Emotionaler Avatar** der mit dem User reist und wächst
- **Täglichem Nutzungsanreiz** auch ohne aktive Reise (Tamagotchi-Loop)
- **Reise-Gamification** (Quests, XP, Explorer Score)
- **Smart Planner** mit Transport-Intelligence

Priorität: Emotionaler Kern zuerst, dann Daily Loop, dann Planner-Intelligenz, dann Monetarisierung.

---

## Was bereits gebaut wurde (Sprints 1–8)

| Sprint | Inhalt | Status |
|---|---|---|
| 1 | App Shell, Design Tokens, Routing-Skeleton | ✅ Done |
| 2 | Auth (Supabase Email/Passwort), Onboarding Wizard | ✅ Done |
| 3 | Geography Tracking (Kontinente/Länder/Städte), Visit-Logging | ✅ Done |
| 4 | Map/List-View, Dashboard KPIs, Quick Actions | ✅ Done |
| 5 | Quest Engine (SightChecklist), Quest-Status-Transitions | ✅ Done |
| 6 | Progress Rings, XP/Level-Logik, Achievement-Katalog, Reward-Toast | ✅ Done |
| 7 | Trips CRUD, Stop-Timeline, Trip-Detail-Layout | ✅ Done |
| 8 | Quest-Attachment an Stops, Plan-vs-Done, Planner-Summary-Widgets | ✅ Done |

**Bekannte Qualitätsprobleme die im neuen Plan adressiert werden:**
- Pixel-Charakter-Design ist visuell unzureichend → wird durch KI-Avatar ersetzt
- Quest-Seeddaten dünn → Expansion in Sprint 16
- Kein echter Reward-Loop (Toast allein reicht nicht) → Avatar + Streak lösen das

---

## Phase 1: Avatar & Emotionaler Kern (Sprints 9–10)

### Sprint 9 — KI-Avatar-System

**Ziel:** User lädt Foto hoch → KI generiert Pixel-Avatar → Avatar wird persistiert und angezeigt.

**Deliverables:**
- Foto-Upload-Flow (Profil-Seite): Upload → Crop/Resize (sharp) → an Replicate API senden
- Replicate-Integration: Server Action ruft Pixel-Art-Modell auf, speichert generiertes Sprite in Supabase Storage
- Rate-Limiting-Logik: 1 Generierung/Monat + 1 Retry kostenlos; zusätzliche über Premium/IAP
- Avatar-Anzeige: ersetzt aktuelles PixelSprite-Placeholder auf Dashboard + Profil
- Fallback: Wenn User kein Foto hochlädt → generischer Avatar mit zufälliger Farbkombination

**Technisch:**
- Package: `replicate` (bereits installiert)
- Modell-Empfehlung: `zeke/pixelate` oder `andreasjansson/pixelify` auf Replicate
- Storage: Supabase Storage Bucket `avatars/` (private, per User RLS)
- DB: `user_profiles.avatar_url`, `user_profiles.avatar_generated_at`, `user_profiles.avatar_remaining_retries`

**Acceptance Criteria:**
- Foto-Upload → generiertes Pixel-Avatar erscheint innerhalb 30 Sekunden
- Rate-Limit wird korrekt enforced (DB-Tracking)
- Alte PixelSprite-Komponente durch neuen Avatar ersetzt auf Dashboard + Profil

---

### Sprint 10 — Character Customization & Item-System

**Ziel:** Avatar bekommt ausrüstbare Items (Overlays), die per XP oder Kauf freigeschaltet werden.

**Deliverables:**
- Item-Datenmodell: `items` Tabelle (id, name, category, layer, unlock_type, unlock_threshold, price_cents, seasonal_until)
- Item-Kategorien: `background`, `outfit`, `accessory`, `frame`
- Item-Rendering: Avatar + aktive Items als Layer-Stack im Browser (CSS/Canvas)
- Item-Unlock-Logic: XP-Threshold-Check bei jedem XP-Gain → neu freigeschaltete Items werden getoastet
- Customization-Screen: Grid-Ansicht aller Items (locked/unlocked), Equip-Button, Live-Preview
- Seed: 15–20 Starter-Items (Basis-Hintergründe, Outfits, Rahmen) die per XP erreichbar sind

**Item-Unlock-Matrix (Beispiele):**

| Item | Typ | Freischaltung |
|---|---|---|
| Rucksack | Accessoire | XP Level 2 |
| Bergkulisse | Hintergrund | 5 Länder besucht |
| Gold-Rahmen | Rahmen | XP Level 10 |
| Explorer-Jacke | Outfit | 10 Quests abgeschlossen |
| Platin-Rahmen | Rahmen | 100 Länder besucht |
| 30-Tage-Streak-Cape | Outfit | 30 Tage Streak (nie kaufbar) |

**Acceptance Criteria:**
- Item equip/unequip wird persistiert
- XP-basierte Items schalten korrekt frei
- Customization-Screen zeigt locked Items mit "X XP fehlen"-Hinweis

---

## Phase 2: Daily Engagement Loop (Sprints 11–12)

### Sprint 11 — Streak-System & Reward-Loop

**Ziel:** Tägliche Aktivität aufbauen durch Streak-Mechanik die emotional bedeutsam ist.

**Deliverables:**
- Streak-Tracking: `user_streaks` Tabelle (user_id, current_streak, longest_streak, last_active_date)
- Streak-Aktivität-Definition: mindestens eine der folgenden Aktionen pro Tag:
  - Quest als completed/planned markiert
  - Stadt besucht geloggt
  - Trip erstellt oder bearbeitet
  - App geöffnet + "Nearby" angesehen (via explicit check-in, kein silent tracking)
- Streak-Visualisierung: Flame-Icon mit Zähler auf Dashboard + Profil
- Streak-Milestones mit Belohnungen:
  - 7 Tage → Item-Unlock-Notification
  - 30 Tage → Exklusives Loyalty-Item (nie durch Kauf erreichbar)
  - 60 Tage → Sonder-Avatar-Pose
  - 90 Tage → Exklusiver Rahmen "Dedicated Explorer"
- Streak-Break-Feedback: emotionale Reaktion im Avatar (visueller "Sad"-State, Comeback-CTA)
- Streak Freeze: 1x/Monat für Explorer Pro Subscriber

**Acceptance Criteria:**
- Streak wird korrekt inkrementiert und bei 0-Aktivität zurückgesetzt
- Milestones feuern korrekt, Items werden freigeschaltet
- Streak-Freeze-Logik funktioniert für Pro-User

---

### Sprint 12 — Tamagotchi Daily Loop

**Ziel:** User hat täglichen Grund die App zu öffnen — auch ohne aktive Reise.

**Deliverables:**

**A) Nearby Discovery (In-App, on-demand GPS)**
- "In deiner Nähe" Sektion auf dem Dashboard (unter Daily Card)
- Zeigt Quests/Sehenswürdigkeiten im Umkreis 5 km (Geolocation API, nur on-demand)
- Daten: bestehende Quest-DB + Wikidata-Sights (bereits in Explore integriert)
- Filter: Heute machbar (Wetter-Score), Noch nicht besucht, Nach Distanz

**B) Morning Nudge (Push Notifications via web-push)**
- Service Worker Setup für PWA Push
- Tägliche Notification (9 Uhr, konfigurierbarer Zeitraum): Wetter + offene Quests in Nähe
- Wetter: OpenWeatherMap Free API (1.000 calls/Tag kostenlos, 1 call/User/Tag reicht)
- Content-Logik (Kohorten-basiert, erweiterbar):
  - Montag–Freitag Morgen → kurze Aktivitäten ≤ 1h (Café, Museum nach der Arbeit)
  - Wochenende → längere Aktivitäten/Tagesausflüge
  - Regenwetter → Indoor-Quests bevorzugt
  - Feiertage → spezielle Vorschläge
- Content-System ist bewusst rule-based für MVP → kann später durch ML/Personalisierung ersetzt werden

**C) Avatar-Mood-States**
- Avatar reagiert auf Engagement-Level:
  - Aktiv (heute oder gestern) → normaler/strahlender State
  - 2–3 Tage inaktiv → "gelangweilter" State (kleine visuelle Änderung, kein Hunger-Death)
  - Streak-aktiv → Aura/Glanz-Effekt
- Implementierung: einfache CSS-Filter/Overlay, kein Re-Generieren des Avatars

**Privacy-Prinzipien:**
- Kein Hintergrund-GPS-Tracking
- Standort nur abgefragt wenn User explizit "Nearby" öffnet
- Push-Notification-Permission optional, kein Erzwingen
- GDPR-konform: Standort wird nie gespeichert, nur zur Laufzeit verwendet

**Acceptance Criteria:**
- Nearby Discovery zeigt korrekte Ergebnisse basierend auf GPS-Position
- Push Notifications werden gesendet und enthalten Wetter + Kontext
- Avatar-Mood wechselt korrekt basierend auf last_active_date

---

## Phase 3: Smart Route Planner Intelligence (Sprint 13)

### Sprint 13 — Route Intelligence

**Ziel:** Trip-Planner zeigt Transport-Optionen, Distanzen und schlägt automatisch Quests vor.

**Deliverables:**

**A) Transport-Intelligence**
- Bei jedem Stop-Wechsel: Distanz-Berechnung (Haversine-Formel, kein API nötig)
- Regelbasierte Transport-Empfehlung:
  - < 100 km → 🚌 Bus / 🚂 Bahn
  - 100–400 km → 🚂 Bahn bevorzugt
  - 400–800 km → 🚂 oder ✈️ je nach Land/Region
  - > 800 km → ✈️ Flug
- Geschätzte Reisezeit (aus Distanz + Verkehrsmittel)
- Kosten-Indikator: € / €€ / €€€ (approximiert, kein Echtzeit)
- Keine Echtzeit-Buchungs-API in Phase 1 → nur Empfehlung

**B) Trip-Itinerary-Visualisierung**
- Verbindungsanzeige zwischen Stops:
  ```
  München ──[✈ ~1h │ €€]──▶ Wien ──[🚂 ~2.5h │ €]──▶ Budapest
            342 km                   247 km
  ```
- Gesamtdistanz + Gesamtreisezeit in Trip-Summary

**C) Auto-Quest-Suggestions**
- Beim Hinzufügen eines Stops: automatisch Top-5-Quests der Stadt vorgeschlagen
- User kann mit einem Tap alle oder einzelne zum Stop hinzufügen
- Sortierung: nach Quest-Beliebtheit (completion_count) + Kategorie-Diversität

**Acceptance Criteria:**
- Transport-Empfehlungen werden für alle Stop-Kombinationen angezeigt
- Distanzen stimmen mit tatsächlichen Luftlinien-Distanzen überein (±10%)
- Auto-Suggestions erscheinen beim Stop-Hinzufügen

---

## Phase 4: Monetarisierung (Sprints 14–15)

### Sprint 14 — Stripe + Explorer Pro Subscription

**Ziel:** Zahlungs-Infrastruktur die Premium-Features gated und Subscriptions verwaltet.

**Deliverables:**
- Stripe-Integration: `stripe` npm package, Checkout Session, Customer Portal
- Supabase: `user_subscriptions` Tabelle (user_id, stripe_customer_id, plan, status, current_period_end)
- Stripe Webhook Handler: `/api/webhooks/stripe` → sync subscription state
- Feature-Gating: `isPro(userId)` Helper der in Server Actions verwendet wird
- Upgrade-Flow: In-App Upgrade-Screen mit Feature-Vergleich
- Explorer Pro Features hinter Gate:
  - 3x Avatar-Generierungen/Monat (statt 1)
  - Unbegrenzte Retries
  - 1 gratis Seasonal Item/Season
  - Streak Freeze 1x/Monat
  - Transport-Intelligence im Planner (Route Intelligence)
  - Offline-Modus (Service Worker Caching)

**Pricing:**
- Explorer Pro: €4,99/Monat oder €39,99/Jahr (2 Monate gratis)

**Acceptance Criteria:**
- Zahlung über Stripe Checkout funktioniert End-to-End
- Subscription-Status wird nach Webhook korrekt in Supabase gesetzt
- Pro-Features sind für Free-User korrekt geblockt

---

### Sprint 15 — In-App Purchases & Share Card

**Ziel:** Einmalige Käufe (Items, Avatar-Retries) + viraler Growth-Loop über Share Cards.

**Deliverables:**

**A) IAP via Stripe Payment Links**
- Seasonal Item Bundles: Stripe Payment Link → nach Kauf Item in `user_items` freigeschaltet
- Extra Avatar-Generierung: €0,99/Versuch
- Streak Rescue: €0,99 einmalig nach gebrochenem Streak
- Item-Store-Screen: saisonale Items mit Timer ("noch 12 Tage"), Preis, Preview

**B) Share Card Generator**
- Server-side Bild-Generierung (Satori oder @vercel/og):
  - Avatar des Users
  - Explorer Score + Länder/Quests-Zähler
  - App-Name + Download-Hinweis
- `/api/share/[userId]` Route liefert PNG
- Share-Button auf Profil-Seite: öffnet Native Share Sheet (Web Share API)
- Sharable auf Instagram Stories (optimiertes 9:16 Format) + Square für Feed

**Acceptance Criteria:**
- Seasonal Item-Kauf entsperrt korrekt das Item für den User
- Share Card wird korrekt generiert und ist in Social Media teilbar
- Share-Link enthält App-Referenz

---

## Phase 5: Qualität & Release (Sprints 16–17)

### Sprint 16 — Data Ops & Analytics

**Ziel:** Qualitative Quest-Daten + Produkt-Analytics für datengetriebene Entscheidungen.

**Deliverables:**
- Quest-Seed-Expansion: mind. 50 Städte mit je 8–15 Quests (aktuell dünn)
- Admin Data Page: Import-Status, Fehler-Log, manuelle Trigger
- Analytics-Instrumentation (alle MVP-Events aus product-spec.md):
  - `avatar_generated`, `avatar_item_equipped`
  - `streak_milestone_reached`, `streak_broken`
  - `daily_nudge_opened`, `nearby_discovery_used`
  - `subscription_started`, `item_purchased`
  - `share_card_generated`
- Interne Query-Templates für Activation, D7/D30 Retention, Revenue

**Acceptance Criteria:**
- Top-50-Städte haben ausreichend Quests für sinnvolle Completion-Berechnung
- Alle neuen Events feuern zuverlässig (>95% Fire Rate in manuellen Tests)

---

### Sprint 17 — Stabilisierung & PWA Release

**Ziel:** Produktionsreife App die installierbar ist und keine kritischen Bugs hat.

**Deliverables:**
- E2E-Test: Vollständiger User-Journey (Signup → Avatar → Quest → Trip → Streak → Share)
- RLS-Audit: alle neuen Tabellen (items, user_items, user_subscriptions, user_streaks) geprüft
- Performance-Pass: Dashboard/Profil/Trip-Detail unter 500ms p95
- PWA-Optimierung: Manifest, Icons, Install-Prompt, Offline-Fallback
- Service Worker: Caching für Pro-User (Offline-Support)
- Release-Checklist + Rollback-Playbook

**Acceptance Criteria:**
- E2E-Journey green in CI
- Keine P0/P1-Bugs offen
- PWA installierbar auf iOS + Android
- p95 Read-Latenz ≤ 500ms auf Ziel-Datensatz

---

## Vollständige Sprint-Übersicht

| Phase | Sprint | Titel | Priorität |
|---|---|---|---|
| ✅ Gebaut | 1–8 | Foundation → Trips Planner | Done |
| 1 Emotionaler Kern | 9 | KI-Avatar-System | 🔴 Kritisch |
| 1 Emotionaler Kern | 10 | Character Customization & Items | 🔴 Kritisch |
| 2 Daily Loop | 11 | Streak-System & Reward-Loop | 🔴 Kritisch |
| 2 Daily Loop | 12 | Tamagotchi Daily Loop (Nearby + Push + Mood) | 🟠 Hoch |
| 3 Planner | 13 | Route Intelligence | 🟠 Hoch |
| 4 Monetarisierung | 14 | Stripe + Explorer Pro Subscription | 🟠 Hoch |
| 4 Monetarisierung | 15 | IAP + Share Card | 🟡 Mittel |
| 5 Release | 16 | Data Ops & Analytics | 🟡 Mittel |
| 5 Release | 17 | Stabilisierung & PWA Release | 🔴 Kritisch |

**Gesamte verbleibende Sprints: 9**
**Geschätzte Dauer bei 1 Sprint/Woche: ~9 Wochen**

---

## Pakete (installiert)

| Package | Zweck | Installiert |
|---|---|---|
| `replicate` | KI-Avatar-Generierung | ✅ |
| `web-push` | PWA Push Notifications | ✅ |
| `@types/web-push` | TypeScript Types | ✅ |
| `stripe` | Zahlungsabwicklung | Sprint 14 |
| `@vercel/og` oder `satori` | Share Card Generierung | Sprint 15 |

---

## Business Case — Kernthesen

**Unique Angle:** Keine andere App verbindet Reise-Gamification + emotionaler KI-Avatar + lokaler Alltagsdiscovery.

**Monetarisierungs-Logik:**
- Free Tier ist vollständig nutzbar (kein Paywall-Frustration)
- Pro-Upgrade lohnt sich für aktive User (mehr Avatar-Generierungen, Streak-Schutz)
- Seasonal Items schaffen FOMO + Urgency ohne pay-to-win Gefühl
- Loyalty-Items (nur durch Streak erreichbar) belohnen Treue

**Risiken und Mitigationen:**
- Replicate API Costs: ~$0.002/Generierung bei 1x/Monat Rate-Limit → kein Skalierungsproblem
- GPS/Privacy: kein Hintergrund-Tracking, nur on-demand → GDPR-konform
- Content-Qualität Daily Loop: rule-based MVP → ML-Erweiterung nach Validierung
- Marktdifferenzierung: Avatar-Attachment ist der Schlüssel — wenn der Avatar emotional anspricht, trägt das alles andere
