'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createServiceClient } from '@/lib/supabase/server';
import { requireUserId } from '@/lib/auth/current-user';
import { ensureUserProfile } from '@/lib/data/queries';

export async function completeOnboarding(formData: FormData) {
  const userId = await requireUserId();
  const displayName = (formData.get('display_name') as string).trim();
  if (!displayName) throw new Error('Display name required');

  const interests = formData.getAll('interests') as string[];
  const homeCitySlug = (formData.get('home_city_slug') as string | null)?.trim() || null;

  const sb = createServiceClient();

  let homeCityId: string | null = null;
  if (homeCitySlug) {
    const { data: city } = await sb
      .from('cities')
      .select('id')
      .eq('slug', homeCitySlug)
      .maybeSingle();
    homeCityId = city?.id ?? null;
  }

  await ensureUserProfile(userId);
  const { error } = await sb
    .from('user_profiles')
    .update({
      display_name: displayName,
      travel_interests: interests,
      home_city_id: homeCityId,
    })
    .eq('id', userId);
  if (error) throw error;

  revalidatePath('/profile');
  revalidatePath('/dashboard');
  redirect('/dashboard');
}

export async function updateDisplayName(formData: FormData) {
  const userId = await requireUserId();
  const displayName = (formData.get('display_name') as string).trim();
  if (!displayName) return;

  const sb = createServiceClient();
  await sb
    .from('user_profiles')
    .update({ display_name: displayName })
    .eq('id', userId);
  revalidatePath('/profile');
}
