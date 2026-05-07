'use server';

import { revalidatePath } from 'next/cache';
import { createServiceClient } from '@/lib/supabase/server';
import { requireUserId } from '@/lib/auth/current-user';
import { XP_EVENTS, levelFromXp } from '@/lib/xp';
import {
  evaluateAchievements,
  type AchievementId,
} from '@/lib/achievements';
import { ensureUserProfile, getUserStats, listUserAchievements } from '@/lib/data/queries';

async function awardXpAndCheckAchievements(userId: string, xpDelta: number) {
  const sb = createServiceClient();
  await ensureUserProfile(userId);

  const { data: profile, error: profErr } = await sb
    .from('user_profiles')
    .select('xp_total')
    .eq('id', userId)
    .single();
  if (profErr) throw profErr;

  const newXp = (profile.xp_total ?? 0) + xpDelta;
  const newLevel = levelFromXp(newXp);

  const { error: updErr } = await sb
    .from('user_profiles')
    .update({ xp_total: newXp, level: newLevel })
    .eq('id', userId);
  if (updErr) throw updErr;

  const stats = await getUserStats(userId);
  const earned = evaluateAchievements(stats);
  const existing = new Set(await listUserAchievements(userId));
  const newOnes = earned.filter((a) => !existing.has(a));
  if (newOnes.length > 0) {
    const rows = newOnes.map((a) => ({ user_id: userId, achievement: a }));
    const { error: achErr } = await sb.from('user_achievements').insert(rows);
    if (achErr) throw achErr;
  }

  return { xpTotal: newXp, level: newLevel, newAchievements: newOnes as AchievementId[] };
}

export async function markContinentVisited(continentId: string) {
  const userId = await requireUserId();
  const sb = createServiceClient();
  const { error } = await sb
    .from('user_continent_visits')
    .insert({ user_id: userId, continent_id: continentId })
    .select('id');
  // Ignore unique-violation (already visited): Postgres code 23505.
  if (error && error.code !== '23505') throw error;
  if (!error) await awardXpAndCheckAchievements(userId, XP_EVENTS.continentVisit);
  revalidatePath('/explore');
  revalidatePath('/dashboard');
}

export async function unmarkContinentVisited(continentId: string) {
  const userId = await requireUserId();
  const sb = createServiceClient();
  const { data: existed } = await sb
    .from('user_continent_visits')
    .select('id').eq('user_id', userId).eq('continent_id', continentId).maybeSingle();
  if (!existed) return;
  const { error } = await sb
    .from('user_continent_visits')
    .delete().eq('user_id', userId).eq('continent_id', continentId);
  if (error) throw error;
  await awardXpAndCheckAchievements(userId, -XP_EVENTS.continentVisit);
  revalidatePath('/explore');
  revalidatePath('/dashboard');
}

export async function markCountryVisited(countryId: string) {
  const userId = await requireUserId();
  const sb = createServiceClient();
  const { error } = await sb
    .from('user_country_visits')
    .insert({ user_id: userId, country_id: countryId });
  if (error && error.code !== '23505') throw error;
  if (!error) await awardXpAndCheckAchievements(userId, XP_EVENTS.countryVisit);
  revalidatePath('/explore');
  revalidatePath('/dashboard');
}

export async function unmarkCountryVisited(countryId: string) {
  const userId = await requireUserId();
  const sb = createServiceClient();
  const { data: existed } = await sb
    .from('user_country_visits')
    .select('id').eq('user_id', userId).eq('country_id', countryId).maybeSingle();
  if (!existed) return;
  const { error } = await sb
    .from('user_country_visits').delete()
    .eq('user_id', userId).eq('country_id', countryId);
  if (error) throw error;
  await awardXpAndCheckAchievements(userId, -XP_EVENTS.countryVisit);
  revalidatePath('/explore');
  revalidatePath('/dashboard');
}

export type CityVisitInput = {
  cityId: string;
  startDate?: string | null;   // ISO date "YYYY-MM-DD"
  endDate?: string | null;
  notes?: string | null;
};

export async function markCityVisited(input: CityVisitInput) {
  const userId = await requireUserId();
  const sb = createServiceClient();

  // For dateless visits, the partial unique index blocks duplicates.
  // For dated visits, the gist exclude blocks overlap. We intercept
  // both to deliver a friendlier "already tracked" no-op.
  const { error } = await sb
    .from('user_city_visits')
    .insert({
      user_id: userId,
      city_id: input.cityId,
      start_date: input.startDate ?? null,
      end_date: input.endDate ?? null,
      notes: input.notes ?? null,
    });

  if (error) {
    if (error.code === '23P01' || error.code === '23505') {
      // Constraint or unique violation = already tracked. Treat as no-op.
      return { alreadyTracked: true };
    }
    throw error;
  }

  let xp = XP_EVENTS.cityVisit;
  if (input.startDate) xp += XP_EVENTS.dateBonus;
  if (input.notes && input.notes.trim().length > 0) xp += XP_EVENTS.noteBonus;

  await awardXpAndCheckAchievements(userId, xp);
  revalidatePath('/explore');
  revalidatePath('/dashboard');
  revalidatePath('/profile');
  return { alreadyTracked: false };
}

export async function toggleSightPlanned(questId: string) {
  const userId = await requireUserId();
  const sb = createServiceClient();

  const { data: existing } = await sb
    .from('user_quest_progress')
    .select('id, status')
    .eq('user_id', userId).eq('quest_id', questId).maybeSingle();

  if (existing?.status === 'planned') {
    await sb.from('user_quest_progress').delete().eq('id', existing.id);
  } else if (existing?.status === 'completed') {
    return; // already completed — no downgrade
  } else if (existing) {
    await sb.from('user_quest_progress').update({ status: 'planned' }).eq('id', existing.id);
  } else {
    await sb.from('user_quest_progress').insert({
      user_id: userId, quest_id: questId, status: 'planned',
    });
  }
  revalidatePath('/explore', 'layout');
}

export async function toggleSightCompleted(questId: string) {
  const userId = await requireUserId();
  const sb = createServiceClient();

  const { data: existing } = await sb
    .from('user_quest_progress')
    .select('id, status')
    .eq('user_id', userId).eq('quest_id', questId).maybeSingle();

  let xpDelta = 0;
  if (existing?.status === 'completed') {
    // Un-complete: per migration 0007 transition guard, we cannot move
    // out of 'completed' — so we delete instead.
    await sb.from('user_quest_progress').delete().eq('id', existing.id);
    xpDelta = -XP_EVENTS.sightCompleted;
  } else if (existing) {
    await sb
      .from('user_quest_progress')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', existing.id);
    xpDelta = XP_EVENTS.sightCompleted;
  } else {
    await sb.from('user_quest_progress').insert({
      user_id: userId, quest_id: questId, status: 'completed',
      completed_at: new Date().toISOString(),
    });
    xpDelta = XP_EVENTS.sightCompleted;
  }

  if (xpDelta !== 0) await awardXpAndCheckAchievements(userId, xpDelta);
  revalidatePath('/explore', 'layout');
  revalidatePath('/dashboard');
}
