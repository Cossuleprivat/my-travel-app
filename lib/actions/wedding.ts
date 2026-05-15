'use server';
import { createServiceClient } from '@/lib/supabase/server';
import { requireUserId } from '@/lib/auth/current-user';
import { revalidatePath } from 'next/cache';

export async function toggleTask(id: string, currentStatus: string) {
  const userId = await requireUserId();
  const sb = createServiceClient();
  const next = currentStatus === 'done' ? 'open' : 'done';
  await sb.from('wedding_tasks').update({ status: next }).eq('id', id).eq('user_id', userId);
  revalidatePath('/wedding');
}
