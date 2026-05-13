import Link from 'next/link';
import type { EquippedItems, Item } from '@/lib/items/types';

const SLOT_META: { category: keyof EquippedItems; label: string; icon: string }[] = [
  { category: 'background', label: 'Background', icon: '🌄' },
  { category: 'outfit',     label: 'Outfit',     icon: '🧥' },
  { category: 'accessory',  label: 'Accessory',  icon: '🎒' },
  { category: 'frame',      label: 'Frame',      icon: '⬡'  },
];

type Props = {
  equipped: EquippedItems;
  unlockedItems: Item[];
};

export function CustomizationSlots({ equipped, unlockedItems }: Props) {
  const bySlug = Object.fromEntries(unlockedItems.map((i) => [i.slug, i]));

  return (
    <section className="rounded-xl bg-bg-surface border border-border-subtle p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs label-mono text-text-muted">Equipped</h2>
        <Link href="/profile/items" className="text-accent-blue text-xs label-mono">
          All items →
        </Link>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {SLOT_META.map(({ category, label, icon }) => {
          const slug = equipped[category];
          const item = slug ? bySlug[slug] : null;
          return (
            <Link
              key={category}
              href="/profile/items"
              className="aspect-square rounded-lg bg-bg-elevated border border-border-subtle hover:border-border-interactive flex flex-col items-center justify-center text-center transition-colors"
            >
              <span className="text-2xl leading-none" aria-hidden="true">
                {item?.emoji ?? icon}
              </span>
              <span className="text-[10px] label-mono text-text-muted mt-1">
                {item?.name ?? label}
              </span>
              {!item && (
                <span className="text-[9px] text-text-muted opacity-50">empty</span>
              )}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
