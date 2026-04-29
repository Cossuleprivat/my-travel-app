export type AchievementId =
  | 'first_steps'
  | 'continent_hopper'
  | 'world_explorer'
  | 'country_collector'
  | 'globe_trotter'
  | 'city_slicker'
  | 'sight_seer';

export type Achievement = {
  id: AchievementId;
  title: string;
  description: string;
};

export const ACHIEVEMENTS: readonly Achievement[] = [
  { id: 'first_steps',       title: 'First Steps',       description: 'Track your first city.' },
  { id: 'continent_hopper',  title: 'Continent Hopper',  description: 'Visit 2 continents.' },
  { id: 'world_explorer',    title: 'World Explorer',    description: 'Visit 5 continents.' },
  { id: 'country_collector', title: 'Country Collector', description: 'Visit 10 countries.' },
  { id: 'globe_trotter',     title: 'Globe Trotter',     description: 'Visit 50 countries.' },
  { id: 'city_slicker',      title: 'City Slicker',      description: 'Visit 25 cities.' },
  { id: 'sight_seer',        title: 'Sight Seer',        description: 'Tick 50 sights.' },
];

export type AchievementCounts = {
  cityCount: number;
  continentCount: number;
  countryCount: number;
  sightCount: number;
};

export function evaluateAchievements(c: AchievementCounts): AchievementId[] {
  const unlocked: AchievementId[] = [];
  if (c.cityCount >= 1) unlocked.push('first_steps');
  if (c.continentCount >= 2) unlocked.push('continent_hopper');
  if (c.continentCount >= 5) unlocked.push('world_explorer');
  if (c.countryCount >= 10) unlocked.push('country_collector');
  if (c.countryCount >= 50) unlocked.push('globe_trotter');
  if (c.cityCount >= 25) unlocked.push('city_slicker');
  if (c.sightCount >= 50) unlocked.push('sight_seer');
  return unlocked;
}
