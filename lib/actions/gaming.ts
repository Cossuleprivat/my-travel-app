'use server';
import { revalidatePath } from 'next/cache';
import { requireUserId } from '@/lib/auth/current-user';
import { createServiceClient } from '@/lib/supabase/server';

export async function addGame(formData: FormData) {
  const userId = await requireUserId();
  const sb = createServiceClient();

  const { error } = await sb.from('user_games').insert({
    user_id: userId,
    title: formData.get('title') as string,
    platform: formData.get('platform') as string || null,
    genre: formData.get('genre') as string || null,
    played_with: formData.get('played_with') as string || 'Solo',
    status: formData.get('status') as string || 'pipeline',
    notes: formData.get('notes') as string || null,
    sort_order: 99,
  });
  if (error) throw error;
  revalidatePath('/gaming');
}

export async function setGameStatus(gameId: string, status: 'pipeline' | 'active' | 'completed', slotNumber?: number) {
  const userId = await requireUserId();
  const sb = createServiceClient();

  const update: Record<string, unknown> = { status };
  if (status === 'completed') update.completed_at = new Date().toISOString();
  if (slotNumber != null) update.slot_number = slotNumber;

  const { error } = await sb.from('user_games').update(update).eq('id', gameId).eq('user_id', userId);
  if (error) throw error;
  revalidatePath('/gaming');
}

export async function assignSlot(gameId: string, slot: number) {
  const userId = await requireUserId();
  const sb = createServiceClient();

  // Clear existing game in that slot
  await sb.from('user_games').update({ slot_number: null }).eq('user_id', userId).eq('slot_number', slot);

  const { error } = await sb.from('user_games').update({ slot_number: slot, status: 'active' }).eq('id', gameId).eq('user_id', userId);
  if (error) throw error;
  revalidatePath('/gaming');
}
