import Link from 'next/link';
import { requireUserId } from '@/lib/auth/current-user';
import { listVisitedPlaces, getGlobalCompletion } from '@/lib/data/queries';
import { ProgressRing } from '@/components/ui/ProgressRing';

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export default async function MyPlacesPage() {
  const userId = await requireUserId();
  const [places, global] = await Promise.all([
    listVisitedPlaces(userId, 200),
    getGlobalCompletion(userId),
  ]);

  const cities    = places.filter((p) => p.kind === 'city');
  const countries = places.filter((p) => p.kind === 'country');

  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-sans text-2xl text-text-primary">My Places</h1>
        <p className="text-text-secondary text-sm mt-1">Every city and country you&apos;ve visited.</p>
      </header>

      {/* Global stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-bg-surface border border-accent-blue/30 p-4 flex flex-col items-center gap-2">
          <ProgressRing pct={global.cities.pct} size={52} stroke={4} color="#40a0d0" />
          <div className="text-center">
            <p className="text-lg font-mono text-text-primary">{global.cities.visited}</p>
            <p className="text-xs label-mono text-text-muted">cities</p>
            <p className="text-xs text-text-muted">{global.cities.pct}% of {global.cities.total}</p>
          </div>
        </div>
        <div className="rounded-xl bg-bg-surface border border-accent-amber/30 p-4 flex flex-col items-center gap-2">
          <ProgressRing pct={global.countries.pct} size={52} stroke={4} color="#d48030" />
          <div className="text-center">
            <p className="text-lg font-mono text-text-primary">{global.countries.visited}</p>
            <p className="text-xs label-mono text-text-muted">countries</p>
            <p className="text-xs text-text-muted">{global.countries.pct}% of {global.countries.total}</p>
          </div>
        </div>
        <div className="rounded-xl bg-bg-surface border border-accent-green/30 p-4 flex flex-col items-center gap-2">
          <ProgressRing pct={Math.round((global.continents.visited / global.continents.total) * 100)} size={52} stroke={4} color="#40c070" />
          <div className="text-center">
            <p className="text-lg font-mono text-text-primary">{global.continents.visited}</p>
            <p className="text-xs label-mono text-text-muted">continents</p>
            <p className="text-xs text-text-muted">of {global.continents.total}</p>
          </div>
        </div>
      </div>

      {/* Cities */}
      <section className="space-y-2">
        <h2 className="text-xs label-mono text-text-muted">
          Cities <span className="text-text-primary">{cities.length}</span>
        </h2>
        {cities.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border-subtle bg-bg-surface p-8 text-center">
            <p className="text-text-muted text-sm">No cities visited yet.</p>
            <Link href="/explore" className="text-accent-blue text-sm mt-2 block hover:underline">
              Start exploring →
            </Link>
          </div>
        ) : (
          <div className="rounded-xl bg-bg-surface border border-border-subtle divide-y divide-border-subtle overflow-hidden">
            {cities.map((p) => (
              <Link
                key={p.id}
                href={`/explore/${p.continentSlug}/${p.parentSlug}/${p.slug}`}
                className="flex items-center gap-3 px-4 py-3 hover:bg-bg-elevated transition-colors"
              >
                <span className="text-text-primary text-sm flex-1">{p.name}</span>
                <span className="text-text-muted text-xs">{p.subLabel}</span>
                <span className="text-text-muted text-xs label-mono ml-2">{fmtDate(p.visitedAt)}</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Countries */}
      <section className="space-y-2">
        <h2 className="text-xs label-mono text-text-muted">
          Countries <span className="text-text-primary">{countries.length}</span>
        </h2>
        {countries.length === 0 ? (
          <p className="text-text-muted text-sm">No countries tracked yet.</p>
        ) : (
          <div className="rounded-xl bg-bg-surface border border-border-subtle divide-y divide-border-subtle overflow-hidden">
            {countries.map((p) => (
              <Link
                key={p.id}
                href={`/explore/${p.continentSlug}/${p.slug}`}
                className="flex items-center gap-3 px-4 py-3 hover:bg-bg-elevated transition-colors"
              >
                <span className="text-text-primary text-sm flex-1">{p.name}</span>
                <span className="text-text-muted text-xs">{p.subLabel}</span>
                <span className="text-text-muted text-xs label-mono ml-2">{fmtDate(p.visitedAt)}</span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
