'use server';
import { createServiceClient } from '@/lib/supabase/server';
import { requireUserId } from '@/lib/auth/current-user';
import { revalidatePath } from 'next/cache';

export async function addEvent(formData: FormData) {
  const userId = await requireUserId();
  const title = String(formData.get('title') ?? '').trim();
  const eventDate = String(formData.get('event_date') ?? '');
  if (!title || !eventDate) return;

  const sb = createServiceClient();
  await sb.from('user_events').insert({
    user_id: userId,
    title,
    event_date: eventDate,
    color: String(formData.get('color') ?? 'blue'),
    category: String(formData.get('category') ?? 'allgemein'),
    notes: (formData.get('notes') as string) || null,
  });
  revalidatePath('/calendar');
  revalidatePath('/dashboard');
}

export async function deleteEvent(id: string) {
  const userId = await requireUserId();
  const sb = createServiceClient();
  await sb.from('user_events').delete().eq('id', id).eq('user_id', userId);
  revalidatePath('/calendar');
  revalidatePath('/dashboard');
}
