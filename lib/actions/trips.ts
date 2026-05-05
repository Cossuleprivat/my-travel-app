'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createServiceClient } from '@/lib/supabase/server';
import { requireUserId } from '@/lib/auth/current-user';
import { XP_EVENTS } from '@/lib/xp';
import { getUserStats, listUserAchievements, ensureUserProfile } from '@/lib/data/queries';
import { evaluateAchievements } from '@/lib/achievements';
import { levelFromXp } from '@/lib/xp';

async function awardXp(userId: string, xpDelta: number) {
  const sb = createServiceClient();
  await ensureUserProfile(userId);
  const { data: profile } = await sb
    .from('user_profiles')
    .select('xp_total')
    .eq('id', userId)
    .single();
  const newXp = (profile?.xp_total ?? 0) + xpDelta;
  const newLevel = levelFromXp(newXp);
  await sb.from('user_profiles').update({ xp_total: newXp, level: newLevel }).eq('id', userId);

  const stats = await getUserStats(userId);
  const earned = evaluateAchievements(stats);
  const existing = new Set(await listUserAchievements(userId));
  const newOnes = earned.filter((a) => !existing.has(a));
  if (newOnes.length > 0) {
    await sb.from('user_achievements').insert(newOnes.map((a) => ({ user_id: userId, achievement: a })));
  }
}

// ---- Trip CRUD ----

export async function createTrip(formData: FormData) {
  const userId = await requireUserId();
  const title = (formData.get('title') as string).trim();
  if (!title) throw new Error('Title required');
  const description = (formData.get('description') as string | null)?.trim() || null;
  const start_date = (formData.get('start_date') as string | null) || null;
  const end_date = (formData.get('end_date') as string | null) || null;

  const sb = createServiceClient();
  const { data, error } = await sb
    .from('trips')
    .insert({ user_id: userId, title, description, start_date, end_date, status: 'draft' })
    .select('id')
    .single();
  if (error) throw error;
  await awardXp(userId, XP_EVENTS.tripCreated ?? 20);
  revalidatePath('/trips');
  redirect(`/trips/${data.id}`);
}

export async function updateTrip(tripId: string, formData: FormData) {
  const userId = await requireUserId();
  const title = (formData.get('title') as string).trim();
  if (!title) throw new Error('Title required');
  const description = (formData.get('description') as string | null)?.trim() || null;
  const start_date = (formData.get('start_date') as string | null) || null;
  const end_date = (formData.get('end_date') as string | null) || null;
  const status = (formData.get('status') as string | null) || 'draft';

  const sb = createServiceClient();
  const { error } = await sb
    .from('trips')
    .update({ title, description, start_date, end_date, status })
    .eq('id', tripId)
    .eq('user_id', userId);
  if (error) throw error;
  revalidatePath(`/trips/${tripId}`);
  revalidatePath('/trips');
}

export async function deleteTrip(tripId: string) {
  const userId = await requireUserId();
  const sb = createServiceClient();
  const { error } = await sb
    .from('trips')
    .delete()
    .eq('id', tripId)
    .eq('user_id', userId);
  if (error) throw error;
  revalidatePath('/trips');
  redirect('/trips');
}

// ---- Trip Stops ----

export async function addTripStop(tripId: string, formData: FormData) {
  const userId = await requireUserId();
  const citySlug = (formData.get('city_slug') as string).trim();
  const arrival_date = (formData.get('arrival_date') as string | null) || null;
  const departure_date = (formData.get('departure_date') as string | null) || null;

  const sb = createServiceClient();
  // Verify trip ownership
  const { data: trip } = await sb.from('trips').select('id').eq('id', tripId).eq('user_id', userId).maybeSingle();
  if (!trip) throw new Error('Trip not found');

  // Resolve city
  const { data: city } = await sb.from('cities').select('id').eq('slug', citySlug).maybeSingle();
  if (!city) throw new Error('City not found');

  // Next position
  const { count } = await sb.from('trip_stops').select('id', { count: 'exact', head: true }).eq('trip_id', tripId);
  const position = (count ?? 0) + 1;

  const { error } = await sb
    .from('trip_stops')
    .insert({ trip_id: tripId, city_id: city.id, position, arrival_date, departure_date });
  if (error) throw error;
  revalidatePath(`/trips/${tripId}`);
}

export async function removeTripStop(tripId: string, stopId: string) {
  const userId = await requireUserId();
  const sb = createServiceClient();
  // Verify ownership via trip
  const { data: trip } = await sb.from('trips').select('id').eq('id', tripId).eq('user_id', userId).maybeSingle();
  if (!trip) throw new Error('Trip not found');

  await sb.from('trip_stops').delete().eq('id', stopId).eq('trip_id', tripId);

  // Re-number positions
  const { data: remaining } = await sb
    .from('trip_stops')
    .select('id')
    .eq('trip_id', tripId)
    .order('position');
  for (let i = 0; i < (remaining ?? []).length; i++) {
    await sb.from('trip_stops').update({ position: i + 1 }).eq('id', remaining![i].id);
  }
  revalidatePath(`/trips/${tripId}`);
}

// ---- Trip Quests ----

export async function addQuestToStop(tripStopId: string, questId: string) {
  const userId = await requireUserId();
  const sb = createServiceClient();

  const { error } = await sb.from('trip_quests').insert({
    trip_stop_id: tripStopId,
    quest_id: questId,
    user_id: userId,
    is_completed: false,
  });
  // Ignore duplicate
  if (error && error.code !== '23505') throw error;

  const { data: stop } = await sb.from('trip_stops').select('trip_id').eq('id', tripStopId).maybeSingle();
  if (stop) revalidatePath(`/trips/${stop.trip_id}`);
}

export async function removeQuestFromStop(tripQuestId: string, tripId: string) {
  const userId = await requireUserId();
  const sb = createServiceClient();
  await sb.from('trip_quests').delete().eq('id', tripQuestId).eq('user_id', userId);
  revalidatePath(`/trips/${tripId}`);
}

export async function completeTripQuest(tripQuestId: string, tripId: string) {
  const userId = await requireUserId();
  const sb = createServiceClient();

  const { data: tq } = await sb
    .from('trip_quests')
    .select('quest_id, is_completed')
    .eq('id', tripQuestId)
    .eq('user_id', userId)
    .maybeSingle();
  if (!tq) throw new Error('Trip quest not found');

  if (tq.is_completed) {
    // Toggle off
    await sb.from('trip_quests').update({ is_completed: false, completed_at: null }).eq('id', tripQuestId);
    // Remove from user_quest_progress if present
    await sb.from('user_quest_progress').delete().eq('user_id', userId).eq('quest_id', tq.quest_id);
    await awardXp(userId, -XP_EVENTS.sightCompleted);
  } else {
    const now = new Date().toISOString();
    await sb.from('trip_quests').update({ is_completed: true, completed_at: now }).eq('id', tripQuestId);
    // Upsert quest progress
    const { data: existing } = await sb
      .from('user_quest_progress')
      .select('id, status')
      .eq('user_id', userId)
      .eq('quest_id', tq.quest_id)
      .maybeSingle();
    if (existing) {
      await sb.from('user_quest_progress').update({ status: 'completed', completed_at: now }).eq('id', existing.id);
    } else {
      await sb.from('user_quest_progress').insert({ user_id: userId, quest_id: tq.quest_id, status: 'completed', completed_at: now });
    }
    await awardXp(userId, XP_EVENTS.sightCompleted);
  }

  revalidatePath(`/trips/${tripId}`);
  revalidatePath('/dashboard');
}
