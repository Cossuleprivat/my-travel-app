// lib/avatar/rate-limit.test.ts
import { describe, it, expect, vi } from 'vitest';

// Mock the DB client so server.ts doesn't throw on missing env vars
vi.mock('@/lib/supabase/server', () => ({ createServiceClient: vi.fn() }));

import { checkAvatarRateLimit } from './rate-limit';

const FREE_GENS = 2; // 1 regulär + 1 Retry

describe('checkAvatarRateLimit', () => {
  it('erlaubt Generierung wenn noch nie generiert wurde', () => {
    const result = checkAvatarRateLimit(null, 0, 202605);
    expect(result.canGenerate).toBe(true);
    expect(result.isRetry).toBe(false);
    expect(result.generationsLeft).toBe(FREE_GENS);
  });

  it('erlaubt Retry nach erster Generierung im selben Monat', () => {
    const result = checkAvatarRateLimit(202605, 1, 202605);
    expect(result.canGenerate).toBe(true);
    expect(result.isRetry).toBe(true);
    expect(result.generationsLeft).toBe(1);
  });

  it('blockiert nach zwei Generierungen im selben Monat', () => {
    const result = checkAvatarRateLimit(202605, 2, 202605);
    expect(result.canGenerate).toBe(false);
    expect(result.generationsLeft).toBe(0);
  });

  it('setzt Limit für neuen Monat zurück', () => {
    // Generation war im April, jetzt ist Mai
    const result = checkAvatarRateLimit(202604, 2, 202605);
    expect(result.canGenerate).toBe(true);
    expect(result.isRetry).toBe(false);
    expect(result.generationsLeft).toBe(FREE_GENS);
  });

  it('behandelt generation_count=0 korrekt als kein Retry', () => {
    const result = checkAvatarRateLimit(202605, 0, 202605);
    expect(result.isRetry).toBe(false);
    expect(result.canGenerate).toBe(true);
  });
});
