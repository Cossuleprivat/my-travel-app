export type TripLike = {
  id: string;
  title: string;
  start_date: string | null;
  end_date: string | null;
  status: string;
};

/**
 * Wählt den relevantesten Trip:
 *   1. ein aktiver Trip (heute zwischen start_date und end_date; offenes Ende zählt),
 *   2. sonst der nächste zukünftige (kleinstes start_date > heute),
 *   3. sonst null.
 * Pure: keine IO, deterministisch über `now`.
 */
export function pickNextTrip<T extends TripLike>(trips: T[], now: Date): T | null {
  const today = now.toISOString().slice(0, 10);

  const active = trips
    .filter(
      (t) =>
        t.start_date !== null &&
        t.start_date <= today &&
        (t.end_date === null || t.end_date >= today),
    )
    .sort((a, b) => (a.start_date! < b.start_date! ? -1 : 1));
  if (active.length > 0) return active[0];

  const upcoming = trips
    .filter((t) => t.start_date !== null && t.start_date > today)
    .sort((a, b) => (a.start_date! < b.start_date! ? -1 : 1));
  if (upcoming.length > 0) return upcoming[0];

  return null;
}
