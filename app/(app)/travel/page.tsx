import Link from 'next/link';
import { requireUserId } from '@/lib/auth/current-user';
import { getUserStats, listTrips, listRecentActivity } from '@/lib/data/queries';
import { pickNextTrip } from '@/lib/travel/next-trip';
import { KpiCard } from '@/components/dashboard/KpiCard';
import { RecentFeed } from '@/components/dashboard/RecentFeed';

function fmtRange(start: string | null, end: string | null): string {
  if (!start && !end) return 'Kein Zeitraum';
  const f = (d: string) =>
    new Date(d).toLocaleDateString('de-DE', { day: 'numeric', month: 'short' });
  if (start && end) return `${f(start)} – ${f(end)}`;
  return f((start ?? end) as string);
}

export default async function TravelHomePage() {
  const userId = await requireUserId();
  const [stats, trips, recent] = await Promise.all([
    getUserStats(userId),
    listTrips(userId),
    listRecentActivity(userId, 8),
  ]);
  const nextTrip = pickNextTrip(trips, new Date());

  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-sans text-2xl text-text-primary">Travel</h1>
        <p className="text-text-secondary text-sm mt-1">
          Dein Reiseleben — Stats, Trips, die Welt erkunden.
        </p>
      </header>

      {/* Stats */}
      <section>
        <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-text-muted mb-2">
          Stats
        </p>
        <div className="grid grid-cols-2 gap-3">
          <KpiCard label="Kontinente" value={stats.continentCount} total={7} tone="blue" />
          <KpiCard label="Länder"     value={stats.countryCount}              tone="amber" />
          <KpiCard label="Städte"     value={stats.cityCount}                 tone="green" />
          <KpiCard label="Sights"     value={stats.sightCount}                tone="purple" />
        </div>
      </section>

      {/* Nächster Trip */}
      <section>
        <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-text-muted mb-2">
          Nächster Trip
        </p>
        {nextTrip ? (
          <Link
            href={`/travel/trips/${nextTrip.id}`}
            className="block rounded-xl border border-[#40a0d0]/25 bg-bg-surface p-4 transition-all hover:border-[#40a0d0]/40 active:scale-[0.99]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-text-primary font-medium truncate">{nextTrip.title}</p>
                <p className="text-text-muted text-xs label-mono mt-1">
                  {fmtRange(nextTrip.start_date, nextTrip.end_date)}
                </p>
              </div>
              <span className="text-accent-blue text-xs label-mono shrink-0">
                {nextTrip.stopCount} Stopps
              </span>
            </div>
          </Link>
        ) : (
          <Link
            href="/travel/trips"
            className="block rounded-xl border border-dashed border-border-subtle bg-bg-surface p-6 text-center text-sm text-text-secondary hover:border-[#40a0d0]/25 transition-colors"
          >
            Noch kein geplanter Trip — Trip planen →
          </Link>
        )}
      </section>

      {/* Einstiege */}
      <section className="grid grid-cols-2 gap-2">
        <Link
          href="/travel/explore"
          className="flex items-center gap-2 rounded-xl border border-border-subtle bg-bg-surface px-4 py-3 hover:border-[#40a0d0]/25 transition-all active:scale-[0.98]"
        >
          <span className="text-base">✈</span>
          <span className="font-mono text-sm text-text-secondary">Erkunden</span>
        </Link>
        <Link
          href="/travel/trips"
          className="flex items-center gap-2 rounded-xl border border-border-subtle bg-bg-surface px-4 py-3 hover:border-[#40a0d0]/25 transition-all active:scale-[0.98]"
        >
          <span className="text-base">◎</span>
          <span className="font-mono text-sm text-text-secondary">Trips</span>
        </Link>
      </section>

      {/* Letzte Aktivität */}
      {recent.length > 0 && (
        <section>
          <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-text-muted mb-2">
            Zuletzt
          </p>
          <RecentFeed items={recent} />
        </section>
      )}
    </div>
  );
}
