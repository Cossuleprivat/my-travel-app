// app/(app)/profile/page.tsx
import { ensureUserProfile, getUserStats, listUserAchievements, getUserItems, getEquippedItems } from '@/lib/data/queries';
import { calcLevel } from '@/lib/xp';
import { requireUserId } from '@/lib/auth/current-user';
import { getAvatarSignedUrl } from '@/lib/avatar/storage';
import { ProfileHero } from '@/components/profile/ProfileHero';
import { CustomizationSlots } from '@/components/profile/CustomizationSlots';
import { AchievementsStrip } from '@/components/profile/AchievementsStrip';
import { PushNotificationToggle } from '@/components/profile/PushNotificationToggle';
import { createServiceClient } from '@/lib/supabase/server';

interface KpiStat {
  label: string;
  value: string;
  icon: string;
  color: string;
}

export default async function ProfilePage() {
  const userId = await requireUserId();
  const sb = createServiceClient();

  const [profile, stats, ach, avatarUrl, userItems, equipped] = await Promise.all([
    ensureUserProfile(userId),
    getUserStats(userId),
    listUserAchievements(userId),
    getAvatarSignedUrl(userId),
    getUserItems(userId),
    getEquippedItems(userId),
  ]);

  // Multi-module stats
  const [runResult, gamesResult, booksResult, tasksResult, goalsResult] = await Promise.all([
    sb
      .from('user_run_logs')
      .select('distance_km')
      .eq('user_id', userId)
      .gte('run_date', '2026-01-01'),
    sb
      .from('user_games')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'completed'),
    sb
      .from('user_books')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'done'),
    sb
      .from('user_tasks')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'done'),
    sb
      .from('user_goals')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'done'),
  ]);

  const totalKm = (runResult.data ?? []).reduce(
    (sum: number, row: { distance_km: number | null }) => sum + (row.distance_km ?? 0),
    0,
  );

  const kpiStats: KpiStat[] = [
    {
      label: 'gelaufen',
      value: `${totalKm.toFixed(1)} km`,
      icon: '🏃',
      color: 'text-green-400',
    },
    {
      label: 'Spiele',
      value: String(gamesResult.count ?? 0),
      icon: '🎮',
      color: 'text-purple-400',
    },
    {
      label: 'Bücher/Hörbücher',
      value: String(booksResult.count ?? 0),
      icon: '📚',
      color: 'text-amber-400',
    },
    {
      label: 'Tasks erledigt',
      value: String(tasksResult.count ?? 0),
      icon: '✅',
      color: 'text-blue-400',
    },
    {
      label: 'Ziele erreicht',
      value: String(goalsResult.count ?? 0),
      icon: '🎯',
      color: 'text-blue-400',
    },
  ];

  const level = calcLevel(stats.xpTotal);

  return (
    <div className="space-y-4">
      <ProfileHero
        name={profile.display_name ?? 'Traveler'}
        level={level}
        stats={{ continents: stats.continentCount, countries: stats.countryCount, cities: stats.cityCount }}
        avatarUrl={avatarUrl}
      />

      {/* Multi-module KPI stats */}
      <section className="rounded-xl bg-bg-surface border border-border-subtle p-4 space-y-3">
        <h2 className="text-xs label-mono text-text-muted">Stats 2026</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {kpiStats.map((kpi) => (
            <div
              key={kpi.label}
              className="rounded-lg bg-bg-elevated border border-border-subtle p-3 flex flex-col gap-1"
            >
              <span className="text-xl leading-none">{kpi.icon}</span>
              <span className={`text-lg font-semibold ${kpi.color}`}>{kpi.value}</span>
              <span className="text-xs label-mono text-text-muted">{kpi.label}</span>
            </div>
          ))}
        </div>
      </section>

      <CustomizationSlots equipped={equipped} unlockedItems={userItems.map((ui) => ui.item)} />
      <AchievementsStrip unlocked={new Set(ach)} />

      <section className="rounded-xl bg-bg-surface border border-border-subtle p-4 space-y-4">
        <h2 className="text-xs label-mono text-text-muted">Notifications</h2>
        <PushNotificationToggle />
      </section>
    </div>
  );
}
