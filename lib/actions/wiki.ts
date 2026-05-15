'use server';
import { createServiceClient } from '@/lib/supabase/server';
import { requireUserId } from '@/lib/auth/current-user';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createNote(formData: FormData) {
  const userId = await requireUserId();
  const sb = createServiceClient();
  const { data, error } = await sb.from('user_notes').insert({
    user_id: userId,
    title: formData.get('title') as string,
    category: formData.get('category') as string || 'allgemein',
    content: formData.get('content') as string || '',
  }).select('id').single();
  if (error) throw error;
  revalidatePath('/wiki');
  redirect(`/wiki/${data.id}`);
}

export async function updateNote(id: string, formData: FormData) {
  const userId = await requireUserId();
  const sb = createServiceClient();
  await sb.from('user_notes').update({
    title: formData.get('title') as string,
    content: formData.get('content') as string || '',
    updated_at: new Date().toISOString(),
  }).eq('id', id).eq('user_id', userId);
  revalidatePath(`/wiki/${id}`);
  revalidatePath('/wiki');
}

export async function deleteNote(id: string) {
  const userId = await requireUserId();
  const sb = createServiceClient();
  await sb.from('user_notes').delete().eq('id', id).eq('user_id', userId);
  revalidatePath('/wiki');
  redirect('/wiki');
}

export async function togglePin(id: string, current: boolean) {
  const userId = await requireUserId();
  const sb = createServiceClient();
  await sb.from('user_notes').update({ is_pinned: !current }).eq('id', id).eq('user_id', userId);
  revalidatePath('/wiki');
  revalidatePath(`/wiki/${id}`);
}
