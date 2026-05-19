import { describe, it, expect } from 'vitest';
import { pickNextTrip, type TripLike } from './next-trip';

const t = (over: Partial<TripLike> & { id: string }): TripLike => ({
  title: over.id,
  start_date: null,
  end_date: null,
  status: 'draft',
  ...over,
});

describe('pickNextTrip', () => {
  const now = new Date('2026-06-15T12:00:00Z');

  it('returns null when no trips have dates', () => {
    expect(pickNextTrip([t({ id: 'a' }), t({ id: 'b' })], now)).toBeNull();
  });

  it('returns null for an empty list', () => {
    expect(pickNextTrip([], now)).toBeNull();
  });

  it('prefers an active trip (now within start/end) over an upcoming one', () => {
    const active = t({ id: 'active', start_date: '2026-06-10', end_date: '2026-06-20' });
    const upcoming = t({ id: 'up', start_date: '2026-07-01', end_date: '2026-07-05' });
    expect(pickNextTrip([upcoming, active], now)?.id).toBe('active');
  });

  it('returns the earliest upcoming trip when none are active', () => {
    const later = t({ id: 'later', start_date: '2026-09-01' });
    const sooner = t({ id: 'sooner', start_date: '2026-07-01' });
    expect(pickNextTrip([later, sooner], now)?.id).toBe('sooner');
  });

  it('treats start_date == today as active', () => {
    const trip = t({ id: 'startsToday', start_date: '2026-06-15', end_date: '2026-06-20' });
    expect(pickNextTrip([trip], now)?.id).toBe('startsToday');
  });

  it('treats end_date == today as still active', () => {
    const trip = t({ id: 'endsToday', start_date: '2026-06-01', end_date: '2026-06-15' });
    expect(pickNextTrip([trip], now)?.id).toBe('endsToday');
  });

  it('treats an open-ended started trip (no end_date) as active', () => {
    const trip = t({ id: 'openEnded', start_date: '2026-06-01', end_date: null });
    expect(pickNextTrip([trip], now)?.id).toBe('openEnded');
  });

  it('ignores a fully past trip', () => {
    const past = t({ id: 'past', start_date: '2026-01-01', end_date: '2026-01-10' });
    expect(pickNextTrip([past], now)).toBeNull();
  });

  it('ignores trips without a start_date', () => {
    const noStart = t({ id: 'noStart', start_date: null, end_date: '2026-07-01' });
    expect(pickNextTrip([noStart], now)).toBeNull();
  });
});
