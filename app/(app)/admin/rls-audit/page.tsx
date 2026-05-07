export default function RlsAuditPage() {
  const tables = [
    {
      name: 'continents / countries / cities / quests',
      rls: true,
      policies: ['SELECT: public (all rows)'],
      notes: 'Reference data. No write access for regular users.',
      status: 'ok' as const,
    },
    {
      name: 'user_profiles',
      rls: true,
      policies: ['SELECT own row (id = auth.uid())', 'INSERT own (id = auth.uid())', 'UPDATE own'],
      notes: 'No delete policy — profiles are permanent. OK for MVP.',
      status: 'ok' as const,
    },
    {
      name: 'user_city_visits',
      rls: true,
      policies: ['SELECT/INSERT/UPDATE/DELETE own (user_id = auth.uid())'],
      notes: 'Full CRUD isolated per user.',
      status: 'ok' as const,
    },
    {
      name: 'user_continent_visits / user_country_visits',
      rls: true,
      policies: ['SELECT/INSERT/DELETE own (user_id = auth.uid())'],
      notes: 'No UPDATE policy — continent/country visits are immutable once set.',
      status: 'ok' as const,
    },
    {
      name: 'user_achievements',
      rls: true,
      policies: ['SELECT/INSERT own (user_id = auth.uid())'],
      notes: 'No delete/update — achievements are permanent. Correct.',
      status: 'ok' as const,
    },
    {
      name: 'user_quest_progress',
      rls: true,
      policies: ['SELECT/INSERT/UPDATE/DELETE own (user_id = auth.uid())'],
      notes: 'Full CRUD. Transition guard in migration 0007 enforces valid state changes.',
      status: 'ok' as const,
    },
    {
      name: 'trips',
      rls: true,
      policies: ['SELECT/INSERT/UPDATE/DELETE own (user_id = auth.uid())'],
      notes: 'Full CRUD isolated per user.',
      status: 'ok' as const,
    },
    {
      name: 'trip_stops',
      rls: true,
      policies: ['SELECT/INSERT/UPDATE/DELETE via trip owner join'],
      notes: 'Ownership checked via trips FK join — no direct user_id.',
      status: 'ok' as const,
    },
    {
      name: 'trip_quests',
      rls: true,
      policies: ['SELECT/UPDATE/DELETE: user_id = auth.uid()', 'INSERT: user_id check + trip owner join'],
      notes: 'Double-check on insert: user must own the trip stop. Correct.',
      status: 'ok' as const,
    },
    {
      name: 'quest_submissions',
      rls: true,
      policies: ['SELECT/INSERT/UPDATE(pending)/DELETE(pending) own'],
      notes: 'Users can only edit their own pending submissions.',
      status: 'ok' as const,
    },
    {
      name: 'data_sources',
      rls: true,
      policies: ['SELECT: public (all rows)'],
      notes: 'Read-only reference. No user write access.',
      status: 'ok' as const,
    },
    {
      name: 'import_jobs / import_errors',
      rls: true,
      policies: ['SELECT: authenticated users only'],
      notes: 'No user-facing write. Writes happen via service role in server actions.',
      status: 'warn' as const,
      warn: 'No admin-only restriction — any logged-in user can read all import jobs. Acceptable for MVP; restrict to admin role in v1.1.',
    },
  ];

  return (
    <div className="space-y-5 max-w-2xl">
      <header>
        <h1 className="font-sans text-2xl text-text-primary">RLS Audit</h1>
        <p className="text-text-secondary text-sm mt-1">
          Row-Level Security coverage for all tables. Last reviewed: 2026-05-05.
        </p>
      </header>

      <div className="space-y-2">
        {tables.map((t) => (
          <div
            key={t.name}
            className={`rounded-xl bg-bg-surface border p-4 space-y-2 ${
              t.status === 'warn' ? 'border-accent-amber/30' : 'border-border-subtle'
            }`}
          >
            <div className="flex items-start gap-2">
              <span className={`mt-0.5 text-sm ${t.status === 'warn' ? 'text-accent-amber' : 'text-accent-green'}`}>
                {t.status === 'warn' ? '⚠' : '✓'}
              </span>
              <div className="flex-1">
                <p className="text-text-primary text-sm font-sans">{t.name}</p>
                <ul className="mt-1 space-y-0.5">
                  {t.policies.map((p, i) => (
                    <li key={i} className="text-xs label-mono text-text-muted">· {p}</li>
                  ))}
                </ul>
                <p className="text-xs text-text-secondary mt-1">{t.notes}</p>
                {t.warn && (
                  <p className="text-xs text-accent-amber mt-1">{t.warn}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl bg-accent-green/10 border border-accent-green/30 px-4 py-3">
        <p className="text-accent-green text-sm">
          All tables have RLS enabled. No cross-user data leakage observed in coverage review.
          One advisory item (import_jobs visibility) deferred to v1.1.
        </p>
      </div>
    </div>
  );
}
