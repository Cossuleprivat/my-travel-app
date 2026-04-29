import { describe, it, expect } from 'vitest';
import { XP_EVENTS, calcLevel, levelFromXp, LEVEL_TIERS } from './xp';

describe('XP_EVENTS', () => {
  it('matches the design spec values', () => {
    expect(XP_EVENTS.continentVisit).toBe(100);
    expect(XP_EVENTS.countryVisit).toBe(50);
    expect(XP_EVENTS.cityVisit).toBe(10);
    expect(XP_EVENTS.sightCompleted).toBe(5);
    expect(XP_EVENTS.dateBonus).toBe(3);
    expect(XP_EVENTS.noteBonus).toBe(2);
  });
});

describe('levelFromXp', () => {
  it('returns 1 for 0 XP', () => {
    expect(levelFromXp(0)).toBe(1);
  });

  it('returns 1 for 99 XP (below first threshold)', () => {
    expect(levelFromXp(99)).toBe(1);
  });

  it('returns 2 at exactly 100 XP', () => {
    expect(levelFromXp(100)).toBe(2);
  });

  it('returns 5 at 600 XP (Explorer)', () => {
    expect(levelFromXp(600)).toBe(5);
  });

  it('returns 30 at 30000 XP (Legend)', () => {
    expect(levelFromXp(30000)).toBe(30);
  });

  it('caps at the highest tier for higher XP', () => {
    expect(levelFromXp(99999)).toBe(30);
  });
});

describe('calcLevel', () => {
  it('returns full breakdown for a mid-progress user', () => {
    const r = calcLevel(700);
    expect(r.level).toBe(5);
    expect(r.title).toBe('Explorer');
    expect(r.currentXp).toBe(700);
    expect(r.tierXpStart).toBe(600);
    expect(r.tierXpEnd).toBe(1500); // next tier (Pathfinder, level 8)
    expect(r.xpIntoTier).toBe(100);
    expect(r.xpToNextTier).toBe(800);
    expect(r.progressPct).toBeCloseTo(11.11, 1);
  });

  it('clamps progress at 100% for max tier', () => {
    const r = calcLevel(50000);
    expect(r.level).toBe(30);
    expect(r.title).toBe('Legend');
    expect(r.progressPct).toBe(100);
    expect(r.tierXpEnd).toBeNull();
  });
});

describe('LEVEL_TIERS', () => {
  it('is sorted ascending by xp', () => {
    const sorted = [...LEVEL_TIERS].sort((a, b) => a.xp - b.xp);
    expect(LEVEL_TIERS).toEqual(sorted);
  });
});
