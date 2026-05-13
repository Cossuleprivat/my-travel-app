import { NextResponse } from 'next/server';
import { requireUserId } from '@/lib/auth/current-user';
import { getUserStats } from '@/lib/data/queries';
import { calcLevel } from '@/lib/xp';
import type { ModuleProfileData } from '@/modules/types';

export async function GET() {
  const userId = await requireUserId();
  const stats = await getUserStats(userId);
  const level = calcLevel(stats.xpTotal);

  const data: ModuleProfileData = {
    moduleId: 'travel',
    headline: `Level ${level.level} Explorer`,
    subline: `${stats.countryCount} countries · ${stats.cityCount} cities`,
    metrics: [
      { label: 'Countries', value: stats.countryCount },
      { label: 'Cities', value: stats.cityCount },
      { label: 'Continents', value: stats.continentCount },
      { label: 'Quests done', value: stats.sightCount },
      { label: 'XP', value: stats.xpTotal },
      { label: 'Level', value: level.level },
    ],
  };

  return NextResponse.json(data);
}
