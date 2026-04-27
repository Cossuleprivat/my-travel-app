import { ensureUserProfile, getUserStats, listUserAchievements } from '@/lib/data/queries';
import { calcLevel } from '@/lib/xp';
import { DEV_USER_ID } from '@/lib/dev-user';
import { ProfileHero } from '@/components/profile/ProfileHero';
import { CustomizationSlots } from '@/components/profile/CustomizationSlots';
import { AchievementsStrip } from '@/components/profile/AchievementsStrip';

export default async function ProfilePage() {
  const profile = await ensureUserProfile(DEV_USER_ID);
  const [stats, ach] = await Promise.all([
    getUserStats(DEV_USER_ID),
    listUserAchievements(DEV_USER_ID),
  ]);
  const level = calcLevel(stats.xpTotal);

  return (
    <div className="space-y-4">
      <ProfileHero
        name={profile.display_name ?? 'Traveler'}
        level={level}
        stats={{ continents: stats.continentCount, countries: stats.countryCount, cities: stats.cityCount }}
      />
      <CustomizationSlots />
      <AchievementsStrip unlocked={new Set(ach)} />

      <section className="rounded-xl bg-bg-surface border border-border-subtle p-4 space-y-3">
        <h2 className="text-xs label-mono text-text-muted">Settings</h2>
        <p className="text-text-secondary text-sm">
          Account &amp; auth land in Session 05. Display name, language,
          notifications, and privacy will live here.
        </p>
      </section>
    </div>
  );
}
