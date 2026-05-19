import { requireUserId } from '@/lib/auth/current-user';
import { listTrips } from '@/lib/data/queries';
import { TripCard } from '@/components/trips/TripCard';
import { CreateTripForm } from '@/components/trips/CreateTripForm';

export default async function TripsPage() {
  const userId = await requireUserId();
  const trips = await listTrips(userId);

  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-sans text-2xl text-text-primary">Meine Trips</h1>
        <p className="text-text-secondary text-sm mt-1">
          Reisen planen und verfolgen.
        </p>
      </header>

      <CreateTripForm />

      {trips.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border-subtle bg-bg-surface p-10 text-center">
          <p className="text-text-secondary text-sm">Noch keine Trips — erstelle oben deinen ersten.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {trips.map((t) => <TripCard key={t.id} trip={t} />)}
        </div>
      )}
    </div>
  );
}
