# Session 01 — UI Build: Landing Page & App Shell

**Datum:** 2026-04-12  
**Skills:** `ui-ux-pro-max`, `using-superpowers`  
**Status:** In Progress

---

## Session-Ziel

Vollständige visuelle Shell von Travel Scorer bauen:
- Landing Page (öffentlich, ohne Login-Requirement)
- App-Navigation (TopNav für App, PublicNav für Landing)
- Dashboard-Seite (styled skeleton)
- Trips-Liste (skeleton)
- City Detail Seite (skeleton)
- Design-Token-Gerüst

**Auth-Strategie:** Auth bleibt bewusst deaktiviert. Login-Links zeigen direkt aufs Dashboard.
Grund: Feature-first development gemäß `docs/mvp-contract.md`.

---

## Design System Entscheidungen

### Visual Style
- **Stil:** Premium Travel Editorial (ruhig, aspirational, strukturiert)
- **Referenz:** Condé Nast Traveler, Lonely Planet Digital
- **Quelle:** `ui-ux-pro-max` Skill — "Premium editorial" Kategorie

### Farbpalette
| Token | Tailwind Klasse | Hex | Verwendung |
|-------|-----------------|-----|------------|
| bg.primary | stone-50 | #FAFAF8 | Seitenhintergrund |
| bg.surface | white | #FFFFFF | Karten, Panels |
| text.primary | stone-900 | #1C1917 | Haupttext |
| text.secondary | stone-600 | #57534E | Body-Text |
| text.muted | stone-400 | #A8A29E | Metadata |
| accent.brand | sky-700 | #0369A1 | CTAs, Links, Highlights |
| accent.brand.dark | sky-800 | #075985 | Hover States |
| accent.success | emerald-500 | #10B981 | Quest completed |
| accent.warning | amber-500 | #F59E0B | Quest planned / pending |
| border.subtle | stone-200 | #E7E5E4 | Card/Section-Trenner |

**Entscheidungsregel:** Sky-700 für Ozean/Reise-Metapher. Stone-Töne für wärme, editorial.
Amber als Highlight-Akzent für gamification (planned quests, progress indicators).

### Typography
| Rolle | Font | Klassen |
|-------|------|---------|
| Display/Hero | DM Serif Display | `font-display text-5xl lg:text-6xl` |
| H1 | DM Serif Display | `font-display text-4xl` |
| H2/Section | DM Serif Display | `font-display text-3xl` |
| H3/Card | Inter Semibold | `font-sans text-xl font-semibold` |
| Body | Inter Regular | `font-sans text-base` |
| Caption | Inter Regular | `font-sans text-sm text-stone-400` |

**Warum DM Serif Display:** Gibt einen editorial, zeitschriften-ähnlichen look.
Inter als body font ist bewährt für readability.

### Spacing & Radius
- Card radius: `rounded-xl` (12px)
- Button radius: `rounded-lg` (8px)
- Section spacing: `py-20` / `py-24`
- Card padding: `p-6` / `p-8`

### Responsive Breakpoints
- Mobile-first design (sm: 640px, md: 768px, lg: 1024px, xl: 1280px)
- Landing hero: Einspaltlig mobile → zweispaltig ab lg
- Dashboard KPI: 1 Spalte mobile → 2 tablet → 4 desktop
- Navigation: Hamburger auf mobile (vereinfacht: nur Desktop-Nav in Session 01)

---

## Architektur-Entscheidungen

### Navigation
- `PublicNav` (neu) für öffentliche Seiten (Landing, Auth)
- `TopNav` (update) für App-Seiten via AppShell
- Auth-bypass bleibt aktiv: alle Buttons zeigen auf `/dashboard`

### Route-Skelette die heute gebaut werden
| Route | Datei | Status |
|-------|-------|--------|
| `/` | `app/(public)/page.tsx` | Vollständig |
| `/dashboard` | `app/(app)/dashboard/page.tsx` | Styled skeleton |
| `/trips` | `app/(app)/trips/page.tsx` | Skeleton (NEU) |
| `/cities/[slug]` | `app/(app)/cities/[slug]/page.tsx` | Skeleton (NEU) |

### Explizit ausgelassen heute
- `/map` — benötigt externe Map-Library (Leaflet/Mapbox), nächste Session
- `/trips/[id]` — komplexes Layout, nächste Session
- `/onboarding` — auth-bezogen, vor Auth-Implementation
- `/profile` — auth-bezogen, vor Auth-Implementation
- `/auth` — auth-bezogen, am Ende des Projekts

---

## Definition of Done — Session 01

- [ ] `tailwind.config.ts` — Design-Tokens (Fonts, Farben, Custom)
- [ ] `app/layout.tsx` — Google Fonts (DM Serif Display + Inter) via `next/font`
- [ ] `app/globals.css` — CSS Custom Properties für Tokens
- [ ] `components/layout/PublicNav.tsx` — Landing Navigation (NEU)
- [ ] `components/layout/TopNav.tsx` — App-Navigation mit Links (update)
- [ ] `app/(public)/page.tsx` — Landing: Hero + Features + Stats + CTA
- [ ] `app/(app)/dashboard/page.tsx` — KPI Karten + Sections styled
- [ ] `app/(app)/trips/page.tsx` — Trips-Liste Skeleton (NEU)
- [ ] `app/(app)/cities/[slug]/page.tsx` — City-Detail Skeleton (NEU)
- [ ] `npm run typecheck` — kein Fehler
- [ ] `npm run lint` — kein Fehler
- [ ] Alle Entscheidungen hier dokumentiert

---

## Fortschritt-Log

| Zeit | Was | Status |
|------|-----|--------|
| Start | Session geplant, Design entschieden | ✓ |
| - | tailwind.config.ts | - |
| - | Fonts in layout.tsx | - |
| - | PublicNav | - |
| - | Landing Page | - |
| - | TopNav update | - |
| - | Dashboard | - |
| - | Trips page | - |
| - | Cities/[slug] page | - |
| - | typecheck | - |

---

## UX-Checkliste (ui-ux-pro-max)

Angewendete Regeln pro Priority:

### Priority 1 — Accessibility
- [ ] Kontrast ≥ 4.5:1 für Body-Text (stone-900 auf white ✓)
- [ ] Focus-Ringe auf allen interaktiven Elementen
- [ ] `aria-label` für Icon-only Buttons
- [ ] Semantische Überschriften-Hierarchie (h1→h2→h3)
- [ ] `skip-to-main` Link in PublicNav

### Priority 2 — Touch & Interaction
- [ ] Buttons ≥ 44×44px
- [ ] Mindestens 8px Abstand zwischen Touch-Targets
- [ ] `cursor-pointer` auf klickbaren Elementen

### Priority 4 — Style
- [ ] Kein Emoji als Icon (nur SVG)
- [ ] Konsistenter Icon-Stil (Heroicons, stroke-width 1.5)

### Priority 5 — Layout
- [ ] Mobile-first Breakpoints
- [ ] Kein horizontales Scrollen
- [ ] max-w-7xl Container konsistent

### Priority 6 — Typography
- [ ] body font-size ≥ 16px (base)
- [ ] line-height 1.5–1.75 für Body
- [ ] Semantische Farb-Tokens (keine raw hex in Komponenten)

---

## Nächste Session (Session 02) — Geplant

- `/map` Page mit Kartenansicht (Leaflet oder react-simple-maps)
- `/trips/[id]` Trip-Detail mit Timeline-Layout
- Echte KPI-Werte im Dashboard (Supabase-Anbindung)
- Mobile Navigation (Hamburger + Drawer)
