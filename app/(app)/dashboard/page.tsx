import Link from 'next/link';
import { getUserStats, listRecentActivity, ensureUserProfile } from '@/lib/data/queries';
import { calcLevel } from '@/lib/xp';
import { DEV_USER_ID } from '@/lib/dev-user';
import { CharacterCard } from '@/components/dashboard/CharacterCard';
import { KpiCard } from '@/components/dashboard/KpiCard';
import { RecentFeed } from '@/components/dashboard/RecentFeed';

export default async function DashboardPage() {
  const profile = await ensureUserProfile(DEV_USER_ID);
  const [stats, recent] = await Promise.all([
    getUserStats(DEV_USER_ID),
    listRecentActivity(DEV_USER_ID, 6),
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
