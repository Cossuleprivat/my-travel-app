'use client';

import { useTransition } from 'react';
import { equipItemAction, unequipItemAction } from '@/lib/actions/items';
import { unlockHint } from '@/lib/items/unlock';
import type { ItemWithStatus, ItemCategory } from '@/lib/items/types';

const CATEGORY_LABELS: Record<ItemCategory, string> = {
  background: 'Backgrounds',
  outfit:     'Outfits',
  accessory:  'Accessories',
  frame:      'Frames',
};
const CATEGORY_ORDER: ItemCategory[] = ['background', 'outfit', 'accessory', 'frame'];

type Props = { items: ItemWithStatus[] };

export function ItemGrid({ items }: Props) {
  const [pending, startTransition] = useTransition();

  const byCategory = CATEGORY_ORDER.map((cat) => ({
    cat,
    items: items.filter((i) => i.category === cat),
  }));

  return (
    <div className="space-y-6">
      {byCategory.map(({ cat, items: catItems }) => (
        <section key={cat}>
          <h2 className="text-xs label-mono text-text-muted mb-3">{CATEGORY_LABELS[cat]}</h2>
          <div className="grid grid-cols-3 gap-2">
            {catItems.map((item) => (
              <div
                key={item.slug}
                className={[
                  'rounded-xl border p-3 flex flex-col items-center gap-2 text-center transition-opacity',
                  item.isUnlocked
                    ? 'bg-bg-surface border-border-subtle'
                    : 'bg-bg-elevated border-border-subtle opacity-50',
                ].join(' ')}
              >
                <span className="text-3xl leading-none" aria-hidden="true">{item.emoji}</span>
                <span className="text-xs text-text-primary font-medium leading-tight">{item.name}</span>

                {item.isEquipped && (
                  <button
                    disabled={pending}
                    onClick={() => startTransition(() => unequipItemAction(item.category))}
                    className="w-full text-[10px] label-mono px-2 py-1 rounded-lg bg-accent-blue/20 text-accent-blue border border-accent-blue/30 hover:bg-accent-blue/30 transition-colors disabled:opacity-50"
                  >
                    Equipped ✓
                  </button>
                )}

                {item.isUnlocked && !item.isEquipped && (
                  <button
                    disabled={pending}
                    onClick={() => startTransition(() => equipItemAction(item.slug, item.category))}
                    className="w-full text-[10px] label-mono px-2 py-1 rounded-lg bg-bg-elevated border border-border-interactive text-text-secondary hover:text-text-primary hover:border-accent-blue/50 transition-colors disabled:opacity-50"
                  >
                    Equip
                  </button>
                )}

                {!item.isUnlocked && (
                  <span className="text-[10px] label-mono text-text-muted">
                    🔒 {unlockHint(item)}
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
