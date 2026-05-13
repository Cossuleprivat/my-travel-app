import type { Item, ItemUnlockType } from './types';

type Stats = { countryCount: number; cityCount: number; sightCount: number };

const UNLOCK_LABELS: Record<ItemUnlockType, (threshold: number) => string> = {
  xp_level:      (t) => `Level ${t}`,
  country_count: (t) => `${t} ${t === 1 ? 'country' : 'countries'}`,
  city_count:    (t) => `${t} ${t === 1 ? 'city' : 'cities'}`,
  quest_count:   (t) => `${t} quests done`,
};

export function isItemUnlocked(item: Item, stats: Stats, level: number): boolean {
  switch (item.unlock_type) {
    case 'xp_level':      return level >= item.unlock_threshold;
    case 'country_count': return stats.countryCount >= item.unlock_threshold;
    case 'city_count':    return stats.cityCount >= item.unlock_threshold;
    case 'quest_count':   return stats.sightCount >= item.unlock_threshold;
  }
}

export function unlockHint(item: Item): string {
  return UNLOCK_LABELS[item.unlock_type](item.unlock_threshold);
}
