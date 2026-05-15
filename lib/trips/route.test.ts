import { describe, it, expect } from 'vitest';
import { haversineKm, travelMode, buildRouteLeg } from './route';

describe('haversineKm', () => {
  it('returns ~0 for same coordinates', () => {
    expect(haversineKm(48.8566, 2.3522, 48.8566, 2.3522)).toBeCloseTo(0, 0);
  });

  it('Paris → Berlin is roughly 878 km', () => {
    const km = haversineKm(48.8566, 2.3522, 52.5200, 13.4050);
    expect(km).toBeGreaterThan(860);
    expect(km).toBeLessThan(900);
  });

  it('Paris → London is roughly 340 km', () => {
    const km = haversineKm(48.8566, 2.3522, 51.5074, -0.1278);
    expect(km).toBeGreaterThan(320);
    expect(km).toBeLessThan(360);
  });
});

describe('travelMode', () => {
  it('walk for < 5 km', () => expect(travelMode(3)).toBe('walk'));
  it('drive for 5–79 km', () => expect(travelMode(50)).toBe('drive'));
  it('train for 80–499 km', () => expect(travelMode(200)).toBe('train'));
  it('fly for ≥ 500 km', () => expect(travelMode(900)).toBe('fly'));
});

describe('buildRouteLeg', () => {
  it('Paris → Berlin returns fly mode with correct cities', () => {
    const leg = buildRouteLeg('Paris', 'Berlin', 48.8566, 2.3522, 52.5200, 13.4050);
    expect(leg.mode).toBe('fly');
    expect(leg.fromCity).toBe('Paris');
    expect(leg.toCity).toBe('Berlin');
    expect(leg.distanceKm).toBeGreaterThan(860);
    expect(leg.modeEmoji).toBe('✈');
  });
});
