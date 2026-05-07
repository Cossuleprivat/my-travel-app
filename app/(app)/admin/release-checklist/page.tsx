const CHECKLIST = [
  {
    category: 'Security',
    items: [
      { label: 'RLS enabled on all tables', done: true },
      { label: 'No cross-user data access in coverage review', done: true },
      { label: 'Service role key not exposed to client-side code', done: true },
      { label: 'Auth guard (requireUserId) on all app routes', done: true },
      { label: 'import_jobs visibility restricted (deferred to v1.1)', done: false, note: 'Advisory — acceptable for MVP' },
    ],
  },
  {
    category: 'Core User Journey',
    items: [
      { label: 'Sign up → email/password auth flow', done: true },
      { label: 'Onboarding wizard (display name + interests)', done: true },
      { label: 'Explore continents → countries → cities', done: true },
      { label: 'Mark city visited ("War hier") + XP awarded', done: true },
      { label: 'Complete sight → XP + achievement check', done: true },
      { label: 'Create trip → add stops → plan quests → complete', done: true },
      { label: 'Dashboard KPIs update after activity', done: true },
      { label: 'Profile shows level, achievements, account info', done: true },
    ],
  },
  {
    category: 'Performance (p95 <= 500ms target)',
    items: [
      { label: 'Compound indexes on hot query paths (migration 0009)', done: true },
      { label: '/dashboard — 5 count queries + 4 recent activity queries, all indexed', done: true },
      { label: '/cities/[slug] — slug lookup + wikidata cache hit path', done: true },
      { label: '/trips/[id] — trip + stops + quests join chain, all indexed', done: true },
      { label: 'Formal p95 benchmark (requires live data volume)', done: false, note: 'Run with realistic dataset before public launch' },
    ],
  },
  {
    category: 'Data Quality',
    items: [
      { label: 'Geography seed loaded (continents/countries/cities)', done: true },
      { label: 'Wikidata sights cached on first city visit', done: true },
      { label: 'Import error logging to import_errors', done: true },
      { label: 'Slug uniqueness enforced by DB constraint', done: true },
    ],
  },
  {
    category: 'Known Limitations (v1.0)',
    items: [
      { label: 'Social login (deferred to v1.1)', done: false, note: 'Email/password only' },
      { label: 'Map view (list view only — map widget deferred)', done: false, note: 'List view shipped; map view is v1.1' },
      { label: 'Admin role for import_jobs visibility', done: false, note: 'Any user can see import jobs for now' },
      { label: 'Quest submissions moderation UI', done: false, note: 'DB schema ready; UI deferred to v1.1' },
      { label: 'E2E test suite in CI (T10.1)', done: false, note: 'Manual QA only for MVP' },
      { label: 'TypeScript strict mode (JSX any / React 19 TS config)', done: false, note: 'Pre-existing env issue; deferred' },
    ],
  },
];

export default function ReleaseChecklistPage() {
  const totalDone = CHECKLIST.flatMap((c) => c.items).filter((i) => i.done).length;
  const totalItems = CHECKLIST.flatMap((c) => c.items).length;

  return (
    <div className="space-y-6 max-w-2xl">
      <header>
        <h1 className="font-sans text-2xl text-text-primary">Release Checklist</h1>
        <p className="text-text-secondary text-sm mt-1">MVP sign-off: {totalDone}/{totalItems} items complete.</p>
        <div className="mt-2 h-2 rounded-full bg-bg-elevated overflow-hidden">
          <div
            className="h-full rounded-full bg-accent-green transition-all"
            style={{ width: `${(totalDone / totalItems) * 100}%` }}
          />
        </div>
      </header>

      {CHECKLIST.map((cat) => (
        <section key={cat.category} className="space-y-2">
          <h2 className="text-xs label-mono text-text-muted">{cat.category}</h2>
          <div className="rounded-xl bg-bg-surface border border-border-subtle divide-y divide-border-subtle overflow-hidden">
            {cat.items.map((item, i) => (
              <div key={i} className="flex items-start gap-3 px-4 py-3">
                <span className={`mt-0.5 text-sm shrink-0 ${item.done ? 'text-accent-green' : 'text-text-muted'}`}>
                  {item.done ? '✓' : '○'}
                </span>
                <div className="flex-1">
                  <p className={`text-sm ${item.done ? 'text-text-primary' : 'text-text-secondary'}`}>
                    {item.label}
                  </p>
                  {item.note && (
                    <p className="text-xs text-text-muted mt-0.5">{item.note}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}

      <div className="rounded-xl bg-bg-surface border border-border-subtle p-4 space-y-2">
        <h2 className="text-xs label-mono text-text-muted">Rollback Playbook</h2>
        <ol className="space-y-1 text-sm text-text-secondary list-none">
          {[
            'Revert to previous git tag: git checkout <prev-tag>',
            'Re-deploy the previous Next.js build via Vercel dashboard → Deployments → Re-deploy.',
            'If DB migration needs rollback: apply reverse migration SQL manually via Supabase SQL editor.',
            'Verify /dashboard and /trips/[id] respond correctly before announcing recovery.',
            'Post incident notes in #engineering within 24h.',
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="w-5 shrink-0 text-text-muted label-mono text-xs mt-0.5">{i + 1}.</span>
              {step}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
