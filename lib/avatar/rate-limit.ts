// lib/avatar/rate-limit.ts
import 'server-only';
import { createServiceClient } from '@/lib/supabase/server';

const FREE_GENS_PER_MONTH = 2; // 1 regulär + 1 Retry

export type RateLimitStatus = {
  canGenerate: boolean;
  isRetry: boolean;
  generationsLeft: number;
};

/** Reine Funktion — testbar ohne Datenbank. */
export function checkAvatarRateLimit(
  generationMonth: number | null,
  generationCount: number,
  currentMonth: number,
): RateLimitStatus {
  const isNewMonth = generationMonth !== currentMonth;
  const usedThisMonth = isNewMonth ? 0 : generationCount;

  return {
    canGenerate: usedThisMonth < FREE_GENS_PER_MONTH,
    isRetry: usedThisMonth === 1,
    generationsLeft: Math.max(0, FREE_GENS_PER_MONTH - usedThisMonth),
  };
}

export function currentYYYYMM(): number {
  const now = new Date();
  return now.getFullYear() * 100 + (now.getMonth() + 1);
}

/** Liest aktuellen Status aus der DB. */
export async function getAvatarRateLimitStatus(userId: string): Promise<RateLimitStatus> {
  const sb = createServiceClient();
  const { data, error } = await sb
    .from('user_profiles')
    .select('avatar_generation_month, avatar_generation_count')
    .eq('id', userId)
    .single();
  if (error) throw error;

  return checkAvatarRateLimit(
    data.avatar_generation_month,
    data.avatar_generation_count ?? 0,
    currentYYYYMM(),
  );
}

/** Verbraucht einen Generierungsslot. Wirft RATE_LIMIT_EXCEEDED wenn kein Slot frei. */
export async function consumeAvatarGeneration(userId: string): Promise<void> {
  const sb = createServiceClient();
  const status = await getAvatarRateLimitStatus(userId);

  if (!status.canGenerate) throw new Error('RATE_LIMIT_EXCEEDED');

  const month = currentYYYYMM();
  const newCount = status.isRetry ? 2 : 1;

  const { error } = await sb
    .from('user_profiles')
    .update({
      avatar_generation_month: month,
      avatar_generation_count: newCount,
    })
    .eq('id', userId);
  if (error) throw error;
}
