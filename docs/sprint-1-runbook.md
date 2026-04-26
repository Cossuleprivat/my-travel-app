# Sprint 1 Runbook (Day 1-3)

## Ziel von Sprint 1
Sprint 1 etabliert das technische Fundament fuer Travel Scorer:
- App Shell + Routing Skeleton
- Supabase Client Integration
- Design Token Scaffold

## GLOBALE ENTSCHEIDUNG: AUTH BYPASS
> Auth ist bewusst deaktiviert fuer Feature-First-Development.
> Alle App-Routen sind ohne Login erreichbar. Login-Buttons leiten direkt zum Dashboard.
> Die echte Auth-Implementierung (T1.2, T2.1) erfolgt nach Fertigstellung aller App-Features.
> Siehe `docs/auth-guard-approach.md` fuer Details und Reactivation Checklist.

---

## Day 1 - Foundation (T1.1) — ABGESCHLOSSEN

### Ziel
App-Grundgeruest steht stabil und alle Kernrouten rendern.

### Aufgaben
- Next.js + TypeScript + App Router Projektstruktur finalisieren.
- Basisstruktur anlegen:
  - `app/(public)/`
  - `app/(auth)/`
  - `app/(app)/dashboard`
  - `components/layout/`
  - `lib/`
- Minimal-Komponenten anlegen:
  - `AppShell`
  - `TopNav`
  - `Container`
- Platzhalterseiten erstellen:
  - `/`
  - `/auth`
  - `/onboarding`
  - `/dashboard`
- Guard-Ansatz dokumentieren (ohne Vollimplementierung).

### Definition of Done — erfuellt
- App startet lokal fehlerfrei. ✓
- Alle Kernrouten rendern. ✓
- Struktur ist nachvollziehbar und wartbar. ✓
- Lint und Typecheck gruen. ✓

### Offene Punkte aus Day 1
- `next lint` ist in Next.js 15.5 als deprecated markiert (Migration auf ESLint CLI in einem spaeteren Sprint).

---

## Day 2 - Supabase Integration (T1.2)

> **Hinweis Auth Bypass:** T1.2 wird zurueckgestellt. Supabase-Integration und Session-Guard werden implementiert, sobald alle App-Features fertig sind.

### Ziel
Supabase ist sauber, typsicher und ohne Secret-Risiken integriert.

### Aufgaben
- Env-Vertrag definieren:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Separate Clients anlegen:
  - `lib/supabase/client.ts`
  - `lib/supabase/server.ts`
- Health-Check (einfacher Read) implementieren.
- Session-Basis fuer Auth-Routing vorbereiten.
- `.env.example` pflegen, keine Secrets committen.

### Definition of Done
- Health-Check gegen Supabase erfolgreich.
- Session-Read funktioniert.
- Git-Status ohne Secrets.

---

## Day 3 - Design Token Scaffold (T1.3)

### Ziel
Ein einheitliches UI-Fundament fuer den Premium Travel Editorial Stil.

### Aufgaben
- Tokens festlegen:
  - Farben (Rollen-basiert)
  - Typografie-Skala
  - Spacing-Skala
  - Radius/Shadow
- Primitive Komponenten erstellen:
  - `SectionHeader`
  - `StatChip`
  - `Card` (Basis)
- Tokens in mindestens 2 Seiten aktiv einsetzen (`/`, `/dashboard`).
- A11y-Basics pruefen (Fokus, Kontrast, Semantik).

### Definition of Done
- Tokens werden sichtbar genutzt.
- Zwei Seiten nutzen dieselben Primitives.
- Keine unkontrollierten Inline-Styles.

---

## Sprint 1 Abschluss-Check
- T1.1 abgeschlossen. ✓
- T1.2 zurueckgestellt (Auth Bypass aktiv).
- T1.3 ausstehend.
- Lint und Typecheck grün.
- Sprint-2-Start ist vorbereitet.

---

## Arbeitsregel fuer diesen Sprint
- Immer nur den aktiven Day bearbeiten.
- Erst Day sauber abschliessen (DoD), dann zum naechsten Day.
- Keine parallelen Baustellen ausserhalb des Day-Scopes.
