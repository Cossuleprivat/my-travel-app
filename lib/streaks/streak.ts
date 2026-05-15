import 'server-only';
import { createServiceClient } from '@/lib/supabase/server';

export type AvatarMood = 'excited' | 'happy' | 'neutral' | 'sad';

export type StreakData = {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  isAlive: boolean;
  activeToday: boolean;
  mood: AvatarMood;
};

export type StreakMilestone = 7 | 14 | 30 | 100;
const MILESTONES: StreakMilestone[] = [7, 14, 30, 100];

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function deriveMood(activeToday: boolean, isAlive: boolean, currentStreak: number): AvatarMood {
  if (activeToday && currentStreak >= 7) return 'excited';
  if (activeToday) return 'happy';
  if (isAlive) return 'neutral'; // alive (yesterday) but not yet active today
  return 'sad';
}

/** Pure function — testable without DB. */
export function calculateStreak(
  lastActiveDate: string | null,
  currentStreak: number,
  longestStreak: number,
  today: string,
): { newCurrent: number; newLongest: number; changed: boolean } {
  if (!lastActiveDate) {
    return { newCurrent: 1, newLongest: Math.max(1, longestStreak), changed: true };
  }

  if (lastActiveDate === today) {
    return { newCurrent: currentStreak, newLongest: longestStreak, changed: false };
  }

  const last = new Date(lastActiveDate);
  const now = new Date(today);
  const diffDays = Math.round((now.getTime() - last.getTime()) / 86_400_000);

  if (diffDays === 1) {
    const newCurrent = currentStreak + 1;
    return { newCurrent, newLongest: Math.max(newCurrent, longestStreak), changed: true };
  }

  return { newCurrent: 1, newLongest: longestStreak, changed: true };
}

/** Called after every qualifying user action. Returns hit milestones. */
export async function updateStreak(userId: string): Promise<StreakMilestone[]> {
  const sb = createServiceClient();
  const today = todayISO();

  const { data: existing } = await sb
    .from('user_streaks')
    .select('current_streak, longest_streak, last_active_date')
    .eq('user_id', userId)
    .maybeSingle();

  const { newCurrent, newLongest, changed } = calculateStreak(
    existing?.last_active_date ?? null,
    existing?.current_streak ?? 0,
    existing?.longest_streak ?? 0,
    today,
  );

  if (!changed) return [];

  if (existing) {
    await sb
      .from('user_streaks')
      .update({ current_streak: newCurrent, longest_streak: newLongest, last_active_date: today, updated_at: new Date().toISOString() })
      .eq('user_id', userId);
  } else {
    await sb
      .from('user_streaks')
      .insert({ user_id: userId, current_streak: newCurrent, longest_streak: newLongest, last_active_date: today });
  }

  const prevStreak = existing?.current_streak ?? 0;
  return MILESTONES.filter((m) => prevStreak < m && newCurrent >= m);
}

/** Read current streak, detecting expired streaks without writing. */
export async function getStreak(userId: string): Promise<StreakData> {
  const sb = createServiceClient();
  const today = todayISO();

  const { data } = await sb
    .from('user_streaks')
    .select('current_streak, longest_streak, last_active_date')
    .eq('user_id', userId)
    .maybeSingle();

  if (!data) {
    return { currentStreak: 0, longestStreak: 0, lastActiveDate: null, isAlive: false, activeToday: false, mood: 'sad' };
  }

  const last = data.last_active_date;
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayISO = yesterday.toISOString().slice(0, 10);

  const activeToday = last === today;
  const isAlive = activeToday || last === yesterdayISO;
  const currentStreak = isAlive ? data.current_streak : 0;
  const mood = deriveMood(activeToday, isAlive, currentStreak);

  return {
    currentStreak,
    longestStreak: data.longest_streak,
    lastActiveDate: last,
    isAlive,
    activeToday,
    mood,
  };
}
