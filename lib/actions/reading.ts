'use server';
import { createServiceClient } from '@/lib/supabase/server';
import { requireUserId } from '@/lib/auth/current-user';
import { revalidatePath } from 'next/cache';

export async function addBook(fd: FormData) {
  const userId = await requireUserId();
  const sb = createServiceClient();
  await sb.from('user_books').insert({
    user_id: userId,
    title: fd.get('title') as string,
    author: fd.get('author') as string || null,
    type: fd.get('type') as string || 'book',
    status: 'planned',
    year: 2026,
    notes: fd.get('notes') as string || null,
  });
  revalidatePath('/reading');
}

export async function setBookStatus(id: string, status: string) {
  const userId = await requireUserId();
  const sb = createServiceClient();
  await sb.from('user_books').update({
    status,
    completed_at: status === 'done' ? new Date().toISOString() : null,
  }).eq('id', id).eq('user_id', userId);
  revalidatePath('/reading');
}
