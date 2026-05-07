import 'server-only';
import { createServiceClient } from '@/lib/supabase/server';

type WikiSight = { name: string; description?: string };

const SLUG_RE = /^[a-z0-9-]+$/;
const MAX_TITLE_LEN = 200;
const MAX_DESC_LEN  = 500;

function validateSight(s: WikiSight): string | null {
  if (!s.name || typeof s.name !== 'string') return 'MISSING_TITLE';
  const trimmed = s.name.trim();
  if (trimmed.length === 0)           return 'EMPTY_TITLE';
  if (trimmed.startsWith('Q'))        return 'UNRESOLVED_WIKIDATA_ID';
  if (trimmed.length > MAX_TITLE_LEN) return 'TITLE_TOO_LONG';
  if (s.description && s.description.length > MAX_DESC_LEN) return 'DESC_TOO_LONG';
  return null;
}

async function logImportError(
  sb: ReturnType<typeof createServiceClient>,
  jobId: string | null,
  ref: string,
  code: string,
  message: string,
) {
  if (!jobId) return;
  await sb.from('import_errors').insert({
    import_job_id: jobId,
    record_ref: ref,
    error_code: code,
    error_message: message,
  }).then(() => undefined);
}

// Wikidata SPARQL: top "tourist attractions" / heritage sites in a city.
async function fetchSightsFromWikidata(cityName: string): Promise<WikiSight[]> {
  const sparql = `
    SELECT ?item ?itemLabel ?desc WHERE {
      ?item wdt:P131* ?city .
      ?city rdfs:label "${cityName.replace(/"/g, '\\"')}"@en .
      { ?item wdt:P31/wdt:P279* wd:Q570116 . }
        UNION { ?item wdt:P31/wdt:P279* wd:Q839954 . }
        UNION { ?item wdt:P31/wdt:P279* wd:Q33506 . }
      OPTIONAL { ?item schema:description ?desc . FILTER(LANG(?desc) = "en") }
      SERVICE wikibase:label { bd:serviceParam wikibase:language "en" . }
    }
    LIMIT 12
  `.trim();

  const url =
    'https://query.wikidata.org/sparql?format=json&query=' + encodeURIComponent(sparql);

  const res = await fetch(url, {
    headers: { 'User-Agent': 'TravelScorer/0.1 (dev@travelscorer.local)' },
    cache: 'no-store',
  });
  if (!res.ok) return [];
  const json = (await res.json()) as { results: { bindings: Array<{
    itemLabel?: { value: string };
    desc?: { value: string };
  }> } };
  const rows = json.results.bindings;
  const seen = new Set<string>();
  return rows
    .map((r) => ({
      name: r.itemLabel?.value ?? '',
      description: r.desc?.value,
    }))
    .filter((r) => r.name && !r.name.startsWith('Q') && !seen.has(r.name) && seen.add(r.name));
}

export async function ensureCitySights(cityId: string, cityName: string) {
  const sb = createServiceClient();
  const { data: existing } = await sb
    .from('quests')
    .select('id')
    .eq('city_id', cityId)
    .eq('category', 'landmark')
    .limit(1);
  if (existing && existing.length > 0) return;

  let sights: WikiSight[] = [];
  try { sights = await fetchSightsFromWikidata(cityName); } catch { sights = []; }
  if (sights.length === 0) return;

  // Create import job for tracking
  const { data: source } = await sb
    .from('data_sources')
    .select('id')
    .eq('source_key', 'wikidata')
    .maybeSingle();

  let jobId: string | null = null;
  if (source) {
    const { data: job } = await sb.from('import_jobs').insert({
      source_id: source.id,
      entity_type: 'quests',
      records_read: sights.length,
      status: 'running',
    }).select('id').single();
    jobId = job?.id ?? null;
  }

  // Validate and insert
  const validRows: object[] = [];
  let errorCount = 0;

  for (const s of sights) {
    const err = validateSight(s);
    if (err) {
      errorCount++;
      await logImportError(sb, jobId, s.name || '(empty)', err,
        `Validation failed for sight: "${s.name}" — ${err}`);
      continue;
    }
    validRows.push({
      city_id: cityId,
      title: s.name.trim(),
      description: s.description ? s.description.slice(0, MAX_DESC_LEN) : null,
      category: 'landmark' as const,
      source: 'wikidata',
      publish_status: 'published',
      is_active: true,
    });
  }

  let inserted = 0;
  if (validRows.length > 0) {
    const { error, data } = await sb.from('quests').insert(validRows).select('id');
    if (error) {
      await logImportError(sb, jobId, cityName, 'INSERT_FAILED', error.message);
    } else {
      inserted = data?.length ?? validRows.length;
    }
  }

  // Finalise job
  if (jobId) {
    const status = errorCount > 0 && inserted === 0 ? 'failed' : 'completed';
    await sb.from('import_jobs').update({
      status,
      finished_at: new Date().toISOString(),
      records_inserted: inserted,
      records_read: sights.length,
    }).eq('id', jobId);
  }
}
