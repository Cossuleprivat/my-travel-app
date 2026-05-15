import Link from 'next/link';
import { getUserStats, listRecentActivity, ensureUserProfile } from '@/lib/data/queries';
import { calcLevel } from '@/lib/xp';
import { requireUserId } from '@/lib/auth/current-user';
import { getAvatarSignedUrl } from '@/lib/avatar/storage';
import { getStreak } from '@/lib/streaks/streak';
import { CharacterCard } from '@/components/dashboard/CharacterCard';
import { KpiCard } from '@/components/dashboard/KpiCard';
import { RecentFeed } from '@/components/dashboard/RecentFeed';
import { StreakBadge } from '@/components/dashboard/StreakBadge';
import { DailyNudge } from '@/components/dashboard/DailyNudge';

export default async function DashboardPage() {
  const userId = await requireUserId();
  const [profile, stats, recent, avatarUrl, streakData] = await Promise.all([
    ensureUserProfile(userId),
    getUserStats(userId),
    listRecentActivity(userId, 6),
    getAvatarSignedUrl(userId),
    getStreak(userId),
  ]);
  const level = calcLevel(stats.xpTotal);

  return (
    <div className="space-y-5">
      <CharacterCard
        name={profile.display_name ?? 'Traveler'}
        level={level}
        avatarUrl={avatarUrl}
        streak={streakData.currentStreak}
        streakAlive={streakData.isAlive}
        mood={streakData.mood}
      />

      <DailyNudge
        streak={streakData}
        cityCount={stats.cityCount}
        questCount={stats.sightCount}
      />

      <StreakBadge
        streak={streakData.currentStreak}
        isAlive={streakData.isAlive}
        longestStreak={streakData.longestStreak}
      />

      <section className="grid grid-cols-2 gap-3">
        <KpiCard label="Continents" value={stats.continentCount} total={7}    tone="blue" />
        <KpiCard label="Countries"  value={stats.countryCount}  tone="amber" />
        <KpiCard label="Cities"     value={stats.cityCount}     tone="green" />
        <KpiCard label="Sights"     value={stats.sightCount}    tone="purple" />
      </section>

      <section>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs label-mono text-text-muted">Recent</h2>
          <Link href="/explore" className="text-accent-blue text-xs label-mono">Explore →</Link>
        </div>
        <RecentFeed items={recent} />
      </section>
    </div>
  );
}
