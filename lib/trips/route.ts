export type TravelMode = 'walk' | 'drive' | 'train' | 'fly';

export type RouteLeg = {
  fromCity: string;
  toCity: string;
  distanceKm: number;
  mode: TravelMode;
  modeEmoji: string;
  modeLabel: string;
  durationLabel: string;
};

const MODE_META: Record<TravelMode, { emoji: string; label: string }> = {
  walk:  { emoji: '🚶', label: 'Walk'  },
  drive: { emoji: '🚗', label: 'Drive' },
  train: { emoji: '🚆', label: 'Train' },
  fly:   { emoji: '✈',  label: 'Fly'   },
};

export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function travelMode(distanceKm: number): TravelMode {
  if (distanceKm < 5) return 'walk';
  if (distanceKm < 80) return 'drive';
  if (distanceKm < 500) return 'train';
  return 'fly';
}

function formatDuration(hours: number): string {
  if (hours < 1) return `${Math.round(hours * 60)} min`;
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return m > 0 ? `~${h}h ${m}m` : `~${h}h`;
}

function estimateHours(distanceKm: number, mode: TravelMode): number {
  switch (mode) {
    case 'walk':  return distanceKm / 5;
    case 'drive': return distanceKm / 80 + 0.25; // +15 min overhead
    case 'train': return distanceKm / 120 + 0.5;  // +30 min overhead
    case 'fly':   return distanceKm / 800 + 3.5;  // +3.5h airport overhead
  }
}

export function buildRouteLeg(
  fromCity: string, toCity: string,
  lat1: number, lon1: number,
  lat2: number, lon2: number,
): RouteLeg {
  const distanceKm = Math.round(haversineKm(lat1, lon1, lat2, lon2));
  const mode = travelMode(distanceKm);
  const hours = estimateHours(distanceKm, mode);
  return {
    fromCity, toCity, distanceKm, mode,
    modeEmoji: MODE_META[mode].emoji,
    modeLabel: MODE_META[mode].label,
    durationLabel: formatDuration(hours),
  };
}
