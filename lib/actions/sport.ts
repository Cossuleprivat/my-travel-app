'use server';
import { revalidatePath } from 'next/cache';
import { requireUserId } from '@/lib/auth/current-user';
import { createServiceClient } from '@/lib/supabase/server';

export async function logRun(formData: FormData) {
  const userId = await requireUserId();
  const sb = createServiceClient();

  const distanceKm = parseFloat(formData.get('distance_km') as string);
  const durationMinutes = formData.get('duration_minutes') ? parseInt(formData.get('duration_minutes') as string) : null;
  const runType = formData.get('run_type') as string || 'EL';
  const runDate = formData.get('run_date') as string || new Date().toISOString().split('T')[0];
  const notes = formData.get('notes') as string || null;

  if (!distanceKm || distanceKm <= 0) throw new Error('Ungültige Distanz');

  const { error } = await sb.from('user_run_logs').insert({
    user_id: userId,
    distance_km: distanceKm,
    duration_minutes: durationMinutes,
    run_type: runType,
    run_date: runDate,
    notes,
  });
  if (error) throw error;
  revalidatePath('/sport');
}

export async function deleteRunLog(id: string) {
  const userId = await requireUserId();
  const sb = createServiceClient();
  const { error } = await sb.from('user_run_logs').delete().eq('id', id).eq('user_id', userId);
  if (error) throw error;
  revalidatePath('/sport');
}
