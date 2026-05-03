import Link from 'next/link';
import { getUserStats, listRecentActivity, ensureUserProfile } from '@/lib/data/queries';
import { calcLevel } from '@/lib/xp';
import { requireUserId } from '@/lib/auth/current-user';
import { HeroBanner } from '@/components/dashboard/HeroBanner';
import { KpiCard } from '@/components/dashboard/KpiCard';
import { RecentFeed } from '@/components/dashboard/RecentFeed';

export default async function DashboardPage() {
  const userId = await requireUserId();
  const profile = await ensureUserProfile(userId);
  const [stats, recent] = await Promise.all([
    getUserStats(userId),
    listRecentActivity(userId, 6),
  ]);
  const level = calcLevel(stats.xpTotal);

  return (
    <div className="lg:grid lg:grid-cols-[1.1fr_0.9fr] lg:gap-6 space-y-5 lg:space-y-0">

      {/* ── LEFT: Hero + World Progress ── */}
      <div className="space-y-5">
        <HeroBanner name={profile.display_name ?? 'Traveler'} level={level} />

        <section className="hidden lg:block rounded-2xl bg-bg-surface border border-border-subtle p-6">
          <h2 className="text-xs label-mono text-text-muted uppercase tracking-widest mb-4">World Coverage</h2>
          <div className="space-y-4">
            {[
              { label: 'Continents', value: stats.continentCount, total: 7,   color: 'bg-accent-blue',   glow: 'shadow-glow-blue'   },
              { label: 'Countries',  value: stats.countryCount,  total: 195,  color: 'bg-accent-amber',  glow: 'shadow-glow-amber'  },
              { label: 'Cities',     value: stats.cityCount,     total: 1000, color: 'bg-accent-green',  glow: 'shadow-glow-green'  },
            ].map(({ label, value, total, color, glow }) => (
              <div key={label}>
                <div className="flex justify-between text-[11px] label-mono mb-1.5">
                  <span className="text-text-secondary uppercase">{label}</span>
                  <span className="text-text-muted">{value} / {total}</span>
                </div>
                <div className="h-2.5 rounded-full bg-bg-elevated border border-border-subtle overflow-hidden">
                  <div
                    className={`h-full rounded-full ${color} ${glow} transition-all duration-700`}
                    style={{ width: `${Math.max(2, Math.min(100, (value / total) * 100))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ── RIGHT: KPIs + Activity ── */}
      <div className="space-y-5">
        <section className="grid grid-cols-2 gap-3">
          <KpiCard label="Continents" value={stats.continentCount} total={7} tone="blue"   />
          <KpiCard label="Countries"  value={stats.countryCount}             tone="amber"  />
          <KpiCard label="Cities"     value={stats.cityCount}                tone="green"  />
          <KpiCard label="Sights"     value={stats.sightCount}               tone="purple" />
        </section>

        <section className="rounded-2xl bg-bg-surface border border-border-subtle p-4 lg:p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm label-mono text-text-secondary uppercase tracking-widest">Adventure Log</h2>
            <Link href="/explore" className="text-accent-blue text-xs label-mono hover:text-accent-blue/80 transition-colors">
              Explore →
            </Link>
          </div>
          <RecentFeed items={recent} />
        </section>
      </div>

    </div>
  );
}
