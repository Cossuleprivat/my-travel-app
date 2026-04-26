# AI Development Workflow Policy

## Zweck
Diese Regel stellt sicher, dass das Projekt nie planlos umgesetzt wird.
Jede Entwicklung folgt einem festen Zyklus aus Planung, fokussierter Umsetzung und Re-Planung.

---

## Verbindlicher Ablauf (immer)
1. **Day planen**
   - Ziel, Scope und Akzeptanzkriterien fuer den aktuellen Day festlegen.
2. **Day umsetzen**
   - Nur die Aufgaben des aktuellen Days bearbeiten.
3. **Day abschliessen**
   - Definition of Done pruefen.
   - Lint/Typecheck/Tests ausfuehren.
   - Offene Risiken dokumentieren.
4. **Neu planen**
   - Ergebnisse bewerten.
   - Naechsten Day oder naechsten Sprint konkret planen.
5. **Erst dann wieder umsetzen**
   - Keine neue Umsetzung ohne aktualisierte Planung.

---

## Kernprinzip
**Immer erst die Days abarbeiten, dann neu planen, erst dann wieder in die Umsetzung gehen.**

Das gilt fuer:
- Cursor Chat
- Cursor Terminal
- Claude in Cursor
- Claude Web

---

## Operative Regeln
- Keine Arbeit ohne aktives Ticket/Day-Ziel.
- Kein Scope-Creep waehrend eines Days.
- DB-Aenderungen nur ueber `supabase/migrations`.
- Sicherheits- und Datenqualitaetsregeln haben Vorrang vor Feature-Speed.
- Nach jedem Day kurze Retro:
  - Was wurde erreicht?
  - Was blockiert?
  - Was wird im naechsten Day angepasst?

---

## Tool-Nutzung (empfohlen)
- **Cursor Chat**: Implementierung, Refactoring, lokale Code-Iteration.
- **Cursor Terminal**: Befehle, Tests, Migrationen, Build-Checks.
- **Claude Web**: Strategische Reviews, Gegenpruefung, Risikoanalyse.

---

## Gate fuer den Start eines neuen Days
Ein neuer Day startet nur, wenn:
- der vorherige Day formal abgeschlossen ist, oder
- ein expliziter Re-Plan mit Prioritaetsanpassung dokumentiert wurde.
