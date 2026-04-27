export const XP_EVENTS = {
  continentVisit: 100,
  countryVisit: 50,
  cityVisit: 10,
  sightCompleted: 5,
  dateBonus: 3,
  noteBonus: 2,
} as const;

export type LevelTier = {
  level: number;
  xp: number;
  title: string;
};

export const LEVEL_TIERS: readonly LevelTier[] = [
  { level: 1,  xp: 0,     title: 'Newcomer' },
  { level: 2,  xp: 100,   title: 'Wanderer' },
  { level: 3,  xp: 250,   title: 'Traveler' },
  { level: 5,  xp: 600,   title: 'Explorer' },
  { level: 8,  xp: 1500,  title: 'Pathfinder' },
  { level: 12, xp: 4000,  title: 'Seasoned Explorer' },
  { level: 20, xp: 12000, title: 'World Citizen' },
  { level: 30, xp: 30000, title: 'Legend' },
];

export function levelFromXp(xp: number): number {
  let current = LEVEL_TIERS[0];
  for (const tier of LEVEL_TIERS) {
    if (xp >= tier.xp) current = tier;
    else break;
  }
  return current.level;
}

export type LevelBreakdown = {
  level: number;
  title: string;
  currentXp: number;
  tierXpStart: number;
  tierXpEnd: number | null;
  xpIntoTier: number;
  xpToNextTier: number;
  progressPct: number;
};

export function calcLevel(xp: number): LevelBreakdown {
  const safe = Math.max(0, Math.floor(xp));
  let current = LEVEL_TIERS[0];
  let next: LevelTier | null = null;
  for (let i = 0; i < LEVEL_TIERS.length; i++) {
    if (safe >= LEVEL_TIERS[i].xp) current = LEVEL_TIERS[i];
    else { next = LEVEL_TIERS[i]; break; }
  }

  const tierXpStart = current.xp;
  const tierXpEnd = next?.xp ?? null;
  const xpIntoTier = safe - tierXpStart;
  const xpToNextTier = next ? next.xp - safe : 0;
  const progressPct = next
    ? (xpIntoTier / (next.xp - tierXpStart)) * 100
    : 100;

  return {
    level: current.level,
    title: current.title,
    currentXp: safe,
    tierXpStart,
    tierXpEnd,
    xpIntoTier,
    xpToNextTier,
    progressPct,
  };
}
