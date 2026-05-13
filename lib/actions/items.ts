'use server';

import { revalidatePath } from 'next/cache';
import { createServiceClient } from '@/lib/supabase/server';
import { requireUserId } from '@/lib/auth/current-user';
import { getUserStats } from '@/lib/data/queries';
import { levelFromXp } from '@/lib/xp';
import { isItemUnlocked } from '@/lib/items/unlock';
import type { EquippedItems, Item } from '@/lib/items/types';

/** Grants any newly-eligible items to the user. Called after every XP/stat change. */
export async function checkAndGrantNewItems(userId: string): Promise<string[]> {
  const sb = createServiceClient();

  const [statsResult, profileResult, allItemsResult, ownedResult] = await Promise.all([
    getUserStats(userId),
    sb.from('user_profiles').select('xp_total').eq('id', userId).single(),
    sb.from('items').select('*'),
    sb.from('user_items').select('item_id').eq('user_id', userId),
  ]);

  if (profileResult.error || allItemsResult.error) return [];

  const level = levelFromXp(profileResult.data.xp_total ?? 0);
  const stats = statsResult;
  const ownedIds = new Set((ownedResult.data ?? []).map((r) => r.item_id));
  const allItems = (allItemsResult.data ?? []) as Item[];

  const newlyEligible = allItems.filter(
    (item) => !ownedIds.has(item.id) && isItemUnlocked(item, stats, level),
  );

  if (newlyEligible.length === 0) return [];

  const rows = newlyEligible.map((item) => ({ user_id: userId, item_id: item.id }));
  await sb.from('user_items').insert(rows).throwOnError();

  return newlyEligible.map((i) => i.slug);
}

export async function equipItemAction(itemSlug: string, category: string) {
  const userId = await requireUserId();
  const sb = createServiceClient();

  // Verify user actually owns this item
  const { data: item } = await sb
    .from('items')
    .select('id, slug, category')
    .eq('slug', itemSlug)
    .single();
  if (!item) throw new Error('Item not found');

  const { count } = await sb
    .from('user_items')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('item_id', item.id);
  if (!count) throw new Error('Item not unlocked');

  // Merge into equipped_items JSONB
  const { data: profile } = await sb
    .from('user_profiles')
    .select('equipped_items')
    .eq('id', userId)
    .single();

  const current: EquippedItems = (profile?.equipped_items as EquippedItems) ?? {};
  const updated = { ...current, [category]: itemSlug };

  await sb
    .from('user_profiles')
    .update({ equipped_items: updated })
    .eq('id', userId)
    .throwOnError();

  revalidatePath('/profile');
  revalidatePath('/profile/items');
  revalidatePath('/hub');
}

export async function unequipItemAction(category: string) {
  const userId = await requireUserId();
  const sb = createServiceClient();

  const { data: profile } = await sb
    .from('user_profiles')
    .select('equipped_items')
    .eq('id', userId)
    .single();

  const current: EquippedItems = (profile?.equipped_items as EquippedItems) ?? {};
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { [category as keyof EquippedItems]: _removed, ...updated } = current;

  await sb
    .from('user_profiles')
    .update({ equipped_items: updated })
    .eq('id', userId)
    .throwOnError();

  revalidatePath('/profile');
  revalidatePath('/profile/items');
  revalidatePath('/hub');
}
