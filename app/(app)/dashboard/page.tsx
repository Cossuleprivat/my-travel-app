import Link from 'next/link';
import { getUserStats, listRecentActivity, ensureUserProfile } from '@/lib/data/queries';
import { calcLevel } from '@/lib/xp';
import { requireUserId } from '@/lib/auth/current-user';
import { CharacterCard } from '@/components/dashboard/CharacterCard';
import { KpiCard } from '@/components/dashboard/KpiCard';
import { RecentFeed } from '@/components/dashboard/RecentFeed';
import { QuickActions } from '@/components/dashboard/QuickActions';

export default async function DashboardPage() {
  const userId = await requireUserId();
  const profile = await ensureUserProfile(userId);
  const [stats, recent] = await Promise.all([
    getUserStats(userId),
    listRecentActivity(userId, 6),
  ]);
  const level = calcLevel(stats.xpTotal);

  return (
    <div className="space-y-5">
      <CharacterCard name={profile.display_name ?? 'Traveler'} level={level} />

      <section className="grid grid-cols-2 gap-3">
        <KpiCard label="Continents" value={stats.continentCount} total={7}    tone="blue" />
        <KpiCard label="Countries"  value={stats.countryCount}  tone="amber" />
        <KpiCard label="Cities"     value={stats.cityCount}     tone="green" />
        <KpiCard label="Sights"     value={stats.sightCount}    tone="purple" />
      </section>

      <QuickActions />

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
