import type { LiveOSModule } from '@/modules/types';

export const travelModule: LiveOSModule = {
  id: 'travel',
  name: 'Travel Scorer',
  tagline: 'Städte tracken, Quests abschließen, als Explorer leveln',
  icon: '✈',
  color: 'blue',
  href: '/travel',
  profileDataHref: '/api/modules/travel/profile-data',
  status: 'active',
  sections: [
    { label: 'Übersicht', href: '/travel',          icon: '⬡' },
    { label: 'Erkunden',  href: '/travel/explore',  icon: '✈' },
    { label: 'Trips',     href: '/travel/trips',    icon: '◎' },
  ],
};
