# Working Agreement (Travel Scorer)

## Ziel
Dieses Agreement definiert verbindlich, wie wir planen, entwickeln und Entscheidungen treffen, damit die Umsetzung fokussiert, sicher und wartbar bleibt.

---

## 1) Plan-First Regel (verbindlich)
- Wir arbeiten immer in klar definierten Days/Sprints.
- Reihenfolge ist immer:
  1. Planen
  2. Umsetzen
  3. Validieren
  4. Neu planen
- Es gibt keine neue Umsetzung ohne vorherige Planung.

Kurzform:
**Day abschliessen -> neu planen -> erst dann naechsten Day umsetzen.**

---

## 2) Scope-Disziplin
- Pro Day wird nur der vereinbarte Scope umgesetzt.
- Kein Scope-Creep waehrend laufender Umsetzung.
- Neue Ideen landen im Backlog und werden bei der Re-Planung priorisiert.

---

## 3) Quality Gates pro Day
- Lint und Typecheck muessen gruen sein.
- Relevante Tests muessen laufen (mindestens betroffene Kernlogik).
- Akzeptanzkriterien des Tickets/Days muessen erfuellt sein.
- Risiken/Offene Punkte werden kurz dokumentiert.

---

## 4) Security und Data Governance
- Keine Secrets im Code oder Repo.
- DB-Aenderungen nur ueber `supabase/migrations`.
- RLS und Datenintegritaet haben Vorrang vor Delivery-Speed.
- Keine destruktiven Datenoperationen ohne explizite Freigabe.

---

## 5) Architektur- und Code-Prinzipien
- TypeScript-first.
- Kleine, fokussierte Funktionen (Single Responsibility).
- Klare Namen statt Abkuerzungen.
- Composition vor Vererbung.
- Lesbarkeit und Wartbarkeit vor cleveren Shortcuts.

---

## 6) Tool-Nutzung
- Cursor Chat: Implementierung und Refactoring.
- Cursor Terminal: Tests, Builds, Migrationen, technische Verifikation.
- Claude Web: Strategie, Gegenpruefung, Reviews.

---

## 7) Definition of Done (Team)
Ein Arbeitspaket gilt nur dann als abgeschlossen, wenn:
- Scope umgesetzt,
- Quality Gates bestanden,
- Dokumentation aktualisiert (wenn erforderlich),
- naechster Schritt im Plan festgelegt ist.

---

## 8) Eskalation bei Unsicherheit
- Wenn Anforderungen unklar sind: zuerst klaeren, dann entwickeln.
- Wenn Risiken hoch sind: zuerst mini-plan und Review, dann Umsetzung.
- Wenn ein Day blockiert ist: Blocker dokumentieren und Re-Plan erzwingen.
