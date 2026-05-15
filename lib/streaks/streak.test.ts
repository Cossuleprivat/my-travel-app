import { describe, it, expect } from 'vitest';
import { calculateStreak } from './streak';

describe('calculateStreak', () => {
  const TODAY = '2026-05-15';
  const YESTERDAY = '2026-05-14';
  const TWO_DAYS_AGO = '2026-05-13';

  it('starts streak at 1 when no prior activity', () => {
    const r = calculateStreak(null, 0, 0, TODAY);
    expect(r.newCurrent).toBe(1);
    expect(r.newLongest).toBe(1);
    expect(r.changed).toBe(true);
  });

  it('continues streak when last active was yesterday', () => {
    const r = calculateStreak(YESTERDAY, 5, 5, TODAY);
    expect(r.newCurrent).toBe(6);
    expect(r.newLongest).toBe(6);
    expect(r.changed).toBe(true);
  });

  it('does not change when already active today', () => {
    const r = calculateStreak(TODAY, 3, 3, TODAY);
    expect(r.newCurrent).toBe(3);
    expect(r.changed).toBe(false);
  });

  it('resets streak to 1 when more than 1 day gap', () => {
    const r = calculateStreak(TWO_DAYS_AGO, 10, 10, TODAY);
    expect(r.newCurrent).toBe(1);
    expect(r.newLongest).toBe(10); // longest preserved
    expect(r.changed).toBe(true);
  });

  it('updates longest when current exceeds it', () => {
    const r = calculateStreak(YESTERDAY, 7, 7, TODAY);
    expect(r.newCurrent).toBe(8);
    expect(r.newLongest).toBe(8);
  });

  it('preserves longest when current does not exceed it', () => {
    const r = calculateStreak(TWO_DAYS_AGO, 5, 30, TODAY);
    expect(r.newCurrent).toBe(1);
    expect(r.newLongest).toBe(30);
  });
});
