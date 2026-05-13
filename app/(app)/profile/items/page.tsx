import Link from 'next/link';
import { requireUserId } from '@/lib/auth/current-user';
import { getItemCatalog, getUserItems, getEquippedItems, getUserStats } from '@/lib/data/queries';
import { calcLevel } from '@/lib/xp';
import { isItemUnlocked, unlockHint } from '@/lib/items/unlock';
import { ItemGrid } from '@/components/profile/ItemGrid';
import type { ItemWithStatus } from '@/lib/items/types';

export default async function ItemsPage() {
  const userId = await requireUserId();
  const [catalog, userItems, equipped, stats] = await Promise.all([
    getItemCatalog(),
    getUserItems(userId),
    getEquippedItems(userId),
    getUserStats(userId),
  ]);

  const level = calcLevel(stats.xpTotal).level;
  const unlockedSlugs = new Set(userItems.map((ui) => ui.item.slug));

  const itemsWithStatus: ItemWithStatus[] = catalog.map((item) => ({
    ...item,
    isUnlocked: unlockedSlugs.has(item.slug),
    isEquipped: equipped[item.category as keyof typeof equipped] === item.slug,
    unlockHint: unlockHint(item),
  }));

  const unlockedCount = itemsWithStatus.filter((i) => i.isUnlocked).length;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/profile" className="text-text-muted text-sm hover:text-text-secondary">
          ← Profile
        </Link>
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-text-primary font-semibold">Items</h1>
        <span className="text-xs label-mono text-text-muted">
          {unlockedCount} / {catalog.length} unlocked
        </span>
      </div>

      <ItemGrid items={itemsWithStatus} />
    </div>
  );
}
