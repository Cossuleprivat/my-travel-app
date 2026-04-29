import { describe, it, expect } from 'vitest';
import { ACHIEVEMENTS, evaluateAchievements } from './achievements';

describe('ACHIEVEMENTS catalog', () => {
  it('contains all 7 base achievements', () => {
    const ids = ACHIEVEMENTS.map((a) => a.id);
    expect(ids).toEqual([
      'first_steps',
      'continent_hopper',
      'world_explorer',
      'country_collector',
      'globe_trotter',
      'city_slicker',
      'sight_seer',
    ]);
  });
});

describe('evaluateAchievements', () => {
  const base = {
    cityCount: 0, continentCount: 0, countryCount: 0, sightCount: 0,
  };

  it('returns empty for a brand new user', () => {
    expect(evaluateAchievements(base)).toEqual([]);
  });

  it('unlocks first_steps after 1 city', () => {
    const r = evaluateAchievements({ ...base, cityCount: 1 });
    expect(r).toContain('first_steps');
  });

  it('unlocks continent_hopper after 2 continents', () => {
    const r = evaluateAchievements({ ...base, continentCount: 2 });
    expect(r).toContain('continent_hopper');
  });

  it('unlocks both world_explorer and continent_hopper at 5 continents', () => {
    const r = evaluateAchievements({ ...base, continentCount: 5 });
    expect(r).toContain('continent_hopper');
    expect(r).toContain('world_explorer');
  });

  it('unlocks country_collector at 10 and globe_trotter at 50', () => {
    expect(evaluateAchievements({ ...base, countryCount: 10 })).toContain('country_collector');
    expect(evaluateAchievements({ ...base, countryCount: 50 })).toContain('globe_trotter');
  });

  it('unlocks city_slicker at 25 cities', () => {
    expect(evaluateAchievements({ ...base, cityCount: 25 })).toContain('city_slicker');
  });

  it('unlocks sight_seer at 50 sights', () => {
    expect(evaluateAchievements({ ...base, sightCount: 50 })).toContain('sight_seer');
  });
});
