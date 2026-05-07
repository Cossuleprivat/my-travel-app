import { createServiceClient } from '@/lib/supabase/server';
import { requireUserId } from '@/lib/auth/current-user';

type DataSource = {
  id: string;
  source_key: string;
  display_name: string;
  license: string | null;
  source_url: string | null;
  is_active: boolean;
};

type ImportJob = {
  id: string;
  source_id: string;
  entity_type: string;
  started_at: string;
  finished_at: string | null;
  status: string;
  records_read: number;
  records_inserted: number;
  records_updated: number;
  data_sources: { display_name: string } | null;
};

type ImportError = {
  id: string;
  import_job_id: string;
  record_ref: string | null;
  error_code: string;
  error_message: string;
  created_at: string;
};

const STATUS_COLOR: Record<string, string> = {
  running: 'text-accent-amber',
  completed: 'text-accent-green',
  failed: 'text-red-400',
  cancelled: 'text-text-muted',
};

function fmtDate(d: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' });
}

export default async function AdminPage() {
  await requireUserId();
  const sb = createServiceClient();

  const [{ data: sources }, { data: jobs }, { data: errors }] = await Promise.all([
    sb.from('data_sources').select('id, source_key, display_name, license, source_url, is_active').order('display_name'),
    sb.from('import_jobs')
      .select('id, source_id, entity_type, started_at, finished_at, status, records_read, records_inserted, records_updated, data_sources!inner(display_name)')
      .order('started_at', { ascending: false })
      .limit(20),
    sb.from('import_errors')
      .select('id, import_job_id, record_ref, error_code, error_message, created_at')
      .order('created_at', { ascending: false })
      .limit(30),
  ]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-sans text-2xl text-text-primary">Data Ops</h1>
        <p className="text-text-secondary text-sm mt-1">Import sources, jobs and validation errors.</p>
      </header>

      {/* Data Sources */}
      <section className="space-y-2">
        <h2 className="text-xs label-mono text-text-muted">Data Sources</h2>
        {(sources ?? []).length === 0 ? (
          <p className="text-text-muted text-sm">No sources registered.</p>
        ) : (
          <div className="rounded-xl bg-bg-surface border border-border-subtle divide-y divide-border-subtle overflow-hidden">
            {(sources as DataSource[] ?? []).map((s) => (
              <div key={s.id} className="px-4 py-3 flex items-center gap-3">
                <span className={`w-2 h-2 rounded-full shrink-0 ${s.is_active ? 'bg-accent-green' : 'bg-border-subtle'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-text-primary text-sm">{s.display_name}</p>
                  <p className="text-text-muted text-xs label-mono">{s.source_key}</p>
                </div>
                {s.license && <span className="text-xs label-mono text-text-muted shrink-0">{s.license}</span>}
                {s.source_url && (
                  <a
                    href={s.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-accent-blue label-mono shrink-0 hover:underline"
                  >
                    ↗
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recent Import Jobs */}
      <section className="space-y-2">
        <h2 className="text-xs label-mono text-text-muted">Recent Import Jobs</h2>
        {(jobs ?? []).length === 0 ? (
          <p className="text-text-muted text-sm">No import jobs yet.</p>
        ) : (
          <div className="rounded-xl bg-bg-surface border border-border-subtle divide-y divide-border-subtle overflow-hidden">
            {(jobs as (ImportJob & { data_sources: { display_name: string } })[] ?? []).map((j) => (
              <div key={j.id} className="px-4 py-3 grid grid-cols-[1fr_auto] gap-2">
                <div>
                  <p className="text-text-primary text-sm">
                    {(j as any).data_sources?.display_name ?? '—'} · {j.entity_type}
                  </p>
                  <p className="text-text-muted text-xs label-mono">
                    Started {fmtDate(j.started_at)}
                    {j.finished_at ? ` → ${fmtDate(j.finished_at)}` : ''}
                  </p>
                  <p className="text-text-muted text-xs mt-0.5">
                    Read {j.records_read} · Inserted {j.records_inserted} · Updated {j.records_updated}
                  </p>
                </div>
                <span className={`text-xs label-mono ${STATUS_COLOR[j.status] ?? 'text-text-muted'}`}>
                  {j.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recent Import Errors */}
      <section className="space-y-2">
        <h2 className="text-xs label-mono text-text-muted">Recent Import Errors</h2>
        {(errors ?? []).length === 0 ? (
          <div className="rounded-xl border border-dashed border-accent-green/30 bg-accent-green/5 p-6 text-center">
            <p className="text-accent-green text-sm">No errors — all clean ✓</p>
          </div>
        ) : (
          <div className="rounded-xl bg-bg-surface border border-red-900/30 divide-y divide-border-subtle overflow-hidden">
            {(errors as ImportError[]).map((e) => (
              <div key={e.id} className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs label-mono text-red-400">{e.error_code}</span>
                  {e.record_ref && <span className="text-xs text-text-muted label-mono">ref: {e.record_ref}</span>}
                  <span className="ml-auto text-xs text-text-muted">{fmtDate(e.created_at)}</span>
                </div>
                <p className="text-text-secondary text-xs mt-1">{e.error_message}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
