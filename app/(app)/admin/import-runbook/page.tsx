export default function ImportRunbookPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <header>
        <h1 className="font-sans text-2xl text-text-primary">Import Runbook</h1>
        <p className="text-text-secondary text-sm mt-1">
          Step-by-step guide for running geography and quest data imports.
        </p>
      </header>

      {/* Dry Run */}
      <section className="rounded-xl bg-bg-surface border border-border-subtle p-5 space-y-3">
        <h2 className="text-sm font-sans text-text-primary">Pre-flight: Dry-Run Checklist</h2>
        <ul className="space-y-2 text-sm text-text-secondary">
          {[
            'Confirm SUPABASE_SERVICE_KEY is set in the environment.',
            'Ensure no import_jobs with status=running exist for the target source.',
            'Check data_sources table: verify source_key and is_active=true for the import target.',
            'Review last import_errors for the same source — understand any outstanding issues.',
            'Run dry-run mode (set DRY_RUN=true) and confirm expected record counts.',
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="mt-0.5 w-5 h-5 rounded border border-border-interactive text-xs text-text-muted flex items-center justify-center shrink-0">
                {i + 1}
              </span>
              {item}
            </li>
          ))}
        </ul>
      </section>

      {/* Real Run */}
      <section className="rounded-xl bg-bg-surface border border-border-subtle p-5 space-y-3">
        <h2 className="text-sm font-sans text-text-primary">Real-Run Checklist</h2>
        <ul className="space-y-2 text-sm text-text-secondary">
          {[
            'Disable dry-run mode (DRY_RUN=false or unset).',
            'Create an import_job record with status=running before inserting rows.',
            'Insert/upsert rows; log failures to import_errors with the job id.',
            'Update import_job: set status=completed|failed, finished_at=now(), records_* counts.',
            'Check import_errors for the job — if errors > 5% of records_read, investigate before proceeding.',
            'Refresh materialized views or trigger cache invalidation if applicable.',
            'Verify row counts via the Data Ops admin page.',
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="mt-0.5 w-5 h-5 rounded border border-border-interactive text-xs text-text-muted flex items-center justify-center shrink-0">
                {i + 1}
              </span>
              {item}
            </li>
          ))}
        </ul>
      </section>

      {/* Sources reference */}
      <section className="rounded-xl bg-bg-surface border border-border-subtle p-5 space-y-3">
        <h2 className="text-sm font-sans text-text-primary">Data Sources Reference</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs label-mono text-text-muted border-b border-border-subtle">
              <th className="pb-2 pr-4">Source Key</th>
              <th className="pb-2 pr-4">Entity Types</th>
              <th className="pb-2">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            <tr>
              <td className="py-2 pr-4 label-mono text-text-primary text-xs">wikidata</td>
              <td className="py-2 pr-4 text-text-secondary">quests (landmarks)</td>
              <td className="py-2 text-text-muted text-xs">Fetched on-demand per city via SPARQL. Cache in quests table.</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 label-mono text-text-primary text-xs">seed-geo</td>
              <td className="py-2 pr-4 text-text-secondary">continents, countries, cities</td>
              <td className="py-2 text-text-muted text-xs">One-time seed. Re-run only to add new cities.</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Validation rules */}
      <section className="rounded-xl bg-bg-surface border border-border-subtle p-5 space-y-3">
        <h2 className="text-sm font-sans text-text-primary">Validation Enforcement</h2>
        <ul className="space-y-1 text-sm text-text-secondary">
          <li>• Slugs must be lowercase, alphanumeric with hyphens only (<code className="text-accent-blue text-xs">^[a-z0-9-]+$</code>).</li>
          <li>• Quests require a non-empty title and valid city_id FK.</li>
          <li>• Invalid rows are written to <code className="text-accent-blue text-xs">import_errors</code> with error_code=VALIDATION_FAIL.</li>
          <li>• Rows with missing required fields are skipped and logged.</li>
          <li>• Duplicate slugs trigger an UPSERT (update) rather than an error.</li>
        </ul>
      </section>
    </div>
  );
}
