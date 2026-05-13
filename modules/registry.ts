import type { LiveOSModule } from './types';
import { travelModule } from './travel/manifest';

export const MODULE_REGISTRY: LiveOSModule[] = [
  travelModule,
  {
    id: 'fitness',
    name: 'Fitness Scorer',
    tagline: 'Log workouts, track PRs, crush your goals',
    icon: '🏋',
    color: 'green',
    href: '/fitness',
    profileDataHref: '/api/modules/fitness/profile-data',
    status: 'coming_soon',
  },
  {
    id: 'gaming',
    name: 'Gaming Scorer',
    tagline: 'Anime, games & watchlists — powered by Anilist',
    icon: '🎮',
    color: 'purple',
    href: '/gaming',
    profileDataHref: '/api/modules/gaming/profile-data',
    status: 'coming_soon',
  },
  {
    id: 'finance',
    name: 'Finance',
    tagline: 'Account balances, budgets & forecasts',
    icon: '◈',
    color: 'amber',
    href: '/finance',
    profileDataHref: '/api/modules/finance/profile-data',
    status: 'coming_soon',
  },
  {
    id: 'coaching',
    name: 'Coaching',
    tagline: 'Projects, clients & progress tracking',
    icon: '◎',
    color: 'indigo',
    href: '/coaching',
    profileDataHref: '/api/modules/coaching/profile-data',
    status: 'coming_soon',
  },
];
