# Supabase Source of Truth

## Rule

Die einzige verbindliche Quelle fuer Supabase-Schema und RLS sind die SQL-Dateien in `supabase/migrations/`.

Nicht mehr verwenden:
- `supabase/schema.sql`
- `supabase/rls.sql`

Diese Dateien wurden entfernt, um Drift zwischen "snapshot SQL" und Migrationen zu vermeiden.

## Team Workflow

1. Aenderungen immer als neue Migration anlegen (`supabase/migrations/XXXX_*.sql`).
2. Vor dem Merge Migration lokal gegen eine frische Datenbank testen.
3. Keine manuellen "one-off" SQL-Edits in der Datenbank ohne anschliessende Migration.
4. Reihenfolge der Migrationen niemals nachtraeglich aendern.

## Why

- verhindert widerspruechliche RLS-Regeln
- verbessert Reproduzierbarkeit in allen Umgebungen
- macht Reviews und Rollbacks nachvollziehbar
