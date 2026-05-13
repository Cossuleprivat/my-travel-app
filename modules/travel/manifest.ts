import type { LiveOSModule } from '@/modules/types';

export const travelModule: LiveOSModule = {
  id: 'travel',
  name: 'Travel Scorer',
  tagline: 'Track cities, complete quests, level up as an explorer',
  icon: '✈',
  color: 'blue',
  href: '/dashboard',
  profileDataHref: '/api/modules/travel/profile-data',
  status: 'active',
};
