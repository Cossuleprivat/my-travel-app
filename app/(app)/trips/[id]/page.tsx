import { notFound } from 'next/navigation';
import Link from 'next/link';
import { requireUserId } from '@/lib/auth/current-user';
import { getTripDetail, listQuestsForCity } from '@/lib/data/queries';
import type { TripDetail } from '@/lib/data/queries';
import { AddStopForm } from '@/components/trips/AddStopForm';
import { RemoveStopButton } from '@/components/trips/RemoveStopButton';
import { TripQuestRow } from '@/components/trips/TripQuestRow';
import { AddQuestToStopForm } from '@/components/trips/AddQuestToStopForm';
import { DeleteTripButton } from '@/components/trips/DeleteTripButton';
import { LegConnector } from '@/components/trips/LegConnector';
import { SmartSuggestions } from '@/components/trips/SmartSuggestions';
import { buildRouteLeg } from '@/lib/trips/route';

const STATUS_LABEL: Record<string, string> = {
  draft: 'Draft', planned: 'Planned', in_progress: 'In Progress',
  completed: 'Done', archived: 'Archived',
};

function formatDate(d: string | null) {
  if (!d) return null;
  return new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
}

async function TripContent({ trip, routeId }: { trip: TripDetail; routeId: string }) {
  const stopsWithQuests = await Promise.all(
    trip.stops.map(async (stop) => {
      const allQuests = await listQuestsForCity(stop.city_id);
      const plannedQuestIds = new Set(stop.quests.map((q) => q.quest_id));
      const availableQuests = allQuests.filter((q) => !plannedQuestIds.has(q.id));
      return { stop, availableQuests };
    })
  );

  const totalQuests = trip.stops.reduce((acc, s) => acc + s.quests.length, 0);
  const completedQuests = trip.stops.reduce((acc, s) => acc + s.quests.filter((q) => q.is_completed).length, 0);

  // Total route distance from consecutive stop pairs with known coords
  let totalDistanceKm = 0;
  for (let i = 1; i < trip.stops.length; i++) {
    const a = trip.stops[i - 1];
    const b = trip.stops[i];
    if (a.lat && a.lng && b.lat && b.lng) {
      totalDistanceKm += Math.round(buildRouteLeg(a.cityName, b.cityName, a.lat, a.lng, b.lat, b.lng).distanceKm);
    }
  }

  return (
    <div className="space-y-5">
      <header>
        <div className="flex items-start justify-between gap-2">
          <div>
            <Link href="/trips" className="text-xs label-mono text-text-muted hover:text-text-secondary">
              ← Trips
            </Link>
            <h1 className="font-sans text-2xl text-text-primary mt-1">{trip.title}</h1>
          </div>
          <span className="text-xs label-mono border border-border-subtle text-text-muted rounded px-2 py-0.5 shrink-0 mt-1">
            {STATUS_LABEL[trip.status] ?? trip.status}
          </span>
        </div>
        {trip.description && (
          <p className="text-text-secondary text-sm mt-1">{trip.description}</p>
        )}
        {(trip.start_date || trip.end_date) && (
          <p className="text-xs label-mono text-text-muted mt-1">
            {formatDate(trip.start_date)} {trip.start_date && trip.end_date ? '→' : ''} {formatDate(trip.end_date)}
          </p>
        )}
      </header>

      {(trip.stops.length > 0 || totalQuests > 0) && (
        <div className="rounded-xl bg-bg-surface border border-border-subtle px-4 py-3 flex items-center gap-4">
          <div className="text-center shrink-0">
            <div className="text-lg font-sans text-text-primary">{trip.stops.length}</div>
            <div className="text-xs label-mono text-text-muted">stops</div>
          </div>
          {totalDistanceKm > 0 && (
            <>
              <div className="w-px h-8 bg-border-subtle" />
              <div className="text-center shrink-0">
                <div className="text-lg font-sans text-text-primary">{totalDistanceKm.toLocaleString()}</div>
                <div className="text-xs label-mono text-text-muted">km total</div>
              </div>
            </>
          )}
          {totalQuests > 0 && (
            <>
              <div className="w-px h-8 bg-border-subtle" />
              <div className="text-center shrink-0">
                <div className="text-lg font-sans text-text-primary">{completedQuests}/{totalQuests}</div>
                <div className="text-xs label-mono text-text-muted">quests</div>
              </div>
              <div className="flex-1 ml-2">
                <div className="h-2 rounded-full bg-bg-elevated overflow-hidden">
                  <div
                    className="h-full rounded-full bg-accent-green transition-all"
                    style={{ width: `${totalQuests > 0 ? (completedQuests / totalQuests) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      )}

      <section className="space-y-3">
        <h2 className="text-xs label-mono text-text-muted">Itinerary</h2>

        {trip.stops.length === 0 && (
          <div className="rounded-xl border border-dashed border-border-subtle bg-bg-surface p-8 text-center">
            <p className="text-text-muted text-sm">No stops yet — add your first city below.</p>
          </div>
        )}

        {stopsWithQuests.map(({ stop, availableQuests }, idx) => {
          const prev = idx > 0 ? stopsWithQuests[idx - 1].stop : null;
          const leg = prev && prev.lat && prev.lng && stop.lat && stop.lng
            ? buildRouteLeg(prev.cityName, stop.cityName, prev.lat, prev.lng, stop.lat, stop.lng)
            : null;

          return (
            <div key={stop.id}>
              {leg && <LegConnector leg={leg} />}

              <div className="rounded-xl bg-bg-surface border border-border-subtle overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-3 border-b border-border-subtle">
                  <span className="w-6 h-6 rounded-full bg-accent-blue/20 text-accent-blue text-xs label-mono flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/explore/${stop.continentSlug}/${stop.countrySlug}/${stop.citySlug}`}
                      className="text-text-primary font-sans hover:text-accent-blue transition-colors"
                    >
                      {stop.cityName}
                    </Link>
                    <p className="text-xs text-text-muted">{stop.countryName}</p>
                  </div>
                  {(stop.arrival_date || stop.departure_date) && (
                    <div className="text-right shrink-0">
                      {stop.arrival_date && (
                        <p className="text-xs label-mono text-text-muted">{formatDate(stop.arrival_date)}</p>
                      )}
                      {stop.departure_date && (
                        <p className="text-xs label-mono text-text-muted">→ {formatDate(stop.departure_date)}</p>
                      )}
                    </div>
                  )}
                  <RemoveStopButton tripId={routeId} stopId={stop.id} />
                </div>

                <div className="px-4 py-3 space-y-3">
                  {stop.quests.length > 0 ? (
                    <ul className="space-y-2">
                      {stop.quests.map((tq) => (
                        <TripQuestRow key={tq.id} tq={tq} tripId={routeId} />
                      ))}
                    </ul>
                  ) : (
                    <SmartSuggestions quests={availableQuests} tripStopId={stop.id} />
                  )}
                  <AddQuestToStopForm tripStopId={stop.id} availableQuests={availableQuests} />
                </div>
              </div>
            </div>
          );
        })}

        <AddStopForm tripId={routeId} />
      </section>

      <div className="flex justify-end pt-2">
        <DeleteTripButton tripId={routeId} />
      </div>
    </div>
  );
}

export default async function TripDetailPage({
  params,
}: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await requireUserId();
  const trip = await getTripDetail(id, userId);
  if (!trip) notFound();
  return <TripContent trip={trip as TripDetail} routeId={id} />;
}
