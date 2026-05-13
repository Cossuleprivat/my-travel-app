export type ItemCategory = 'background' | 'outfit' | 'accessory' | 'frame';
export type ItemUnlockType = 'xp_level' | 'country_count' | 'city_count' | 'quest_count';

export type Item = {
  id: string;
  slug: string;
  name: string;
  category: ItemCategory;
  layer: number;
  emoji: string;
  unlock_type: ItemUnlockType;
  unlock_threshold: number;
  price_cents: number;
  seasonal_until: string | null;
};

export type UserItem = {
  item_id: string;
  unlocked_at: string;
  item: Item;
};

/** JSON shape stored in user_profiles.equipped_items */
export type EquippedItems = Partial<Record<ItemCategory, string>>;

export type ItemWithStatus = Item & {
  isUnlocked: boolean;
  isEquipped: boolean;
  unlockHint: string;
};
