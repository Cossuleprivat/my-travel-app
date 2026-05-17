'use server';
import { createServiceClient } from '@/lib/supabase/server';
import { requireUserId } from '@/lib/auth/current-user';
import { revalidatePath } from 'next/cache';

export async function addTask(formData: FormData) {
  const userId = await requireUserId();
  const sb = createServiceClient();
  await sb.from('user_tasks').insert({
    user_id: userId,
    title: formData.get('title') as string,
    area: formData.get('area') as string || 'allgemein',
    priority: formData.get('priority') as string || 'medium',
    deadline: (formData.get('deadline') as string) || null,
    notes: (formData.get('notes') as string) || null,
    status: 'open',
  });
  revalidatePath('/tasks');
}

export async function updateTask(id: string, formData: FormData) {
  const userId = await requireUserId();
  const sb = createServiceClient();
  const title = String(formData.get('title') ?? '').trim();
  if (!title) return;
  await sb
    .from('user_tasks')
    .update({
      title,
      area: (formData.get('area') as string) || 'allgemein',
      priority: (formData.get('priority') as string) || 'medium',
      deadline: (formData.get('deadline') as string) || null,
      notes: (formData.get('notes') as string) || null,
    })
    .eq('id', id)
    .eq('user_id', userId);
  revalidatePath('/tasks');
  revalidatePath('/hub');
  revalidatePath('/calendar');
}

export async function setTaskStatus(id: string, status: 'open' | 'in_progress' | 'done') {
  const userId = await requireUserId();
  const sb = createServiceClient();
  await sb.from('user_tasks').update({
    status,
    completed_at: status === 'done' ? new Date().toISOString() : null,
  }).eq('id', id).eq('user_id', userId);
  revalidatePath('/tasks');
}

export async function deleteTask(id: string) {
  const userId = await requireUserId();
  const sb = createServiceClient();
  await sb.from('user_tasks').delete().eq('id', id).eq('user_id', userId);
  revalidatePath('/tasks');
}

export async function setGoalDone(id: string, isDone: boolean) {
  const userId = await requireUserId();
  const sb = createServiceClient();
  await sb.from('user_goals').update({
    status: isDone ? 'done' : 'active',
    completed_at: isDone ? new Date().toISOString() : null,
  }).eq('id', id).eq('user_id', userId);
  revalidatePath('/goals');
}
