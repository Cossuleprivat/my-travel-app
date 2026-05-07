import Link from 'next/link';
import { ensureUserProfile, getUserStats, listUserAchievements } from '@/lib/data/queries';
import { calcLevel } from '@/lib/xp';
import { requireUserId } from '@/lib/auth/current-user';
import { ProfileHero } from '@/components/profile/ProfileHero';
import { CustomizationSlots } from '@/components/profile/CustomizationSlots';
import { AchievementsStrip } from '@/components/profile/AchievementsStrip';
import { SignOutButton } from '@/components/auth/SignOutButton';
import { createCookieClient } from '@/lib/supabase/cookie-client';

export default async function ProfilePage() {
  const userId = await requireUserId();
  const sb = await createCookieClient();
  const { data: { user } } = await sb.auth.getUser();
  const profile = await ensureUserProfile(userId);
  const [stats, ach] = await Promise.all([
    getUserStats(userId),
    listUserAchievements(userId),
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
        <h2 className="text-xs label-mono text-text-muted">Account</h2>
        {user?.email && (
          <p className="text-text-secondary text-sm">
            Signed in as <span className="text-text-primary">{user.email}</span>
          </p>
        )}
        <SignOutButton />
      </section>

      <section className="rounded-xl bg-bg-surface border border-border-subtle p-4 space-y-2">
        <h2 className="text-xs label-mono text-text-muted">Admin</h2>
        <div className="flex flex-col gap-1.5">
          {([
            { href: '/admin', label: 'Data Ops & Import Jobs' },
            { href: '/admin/rls-audit', label: 'RLS Audit' },
            { href: '/admin/release-checklist', label: 'Release Checklist' },
          ] as { href: string; label: string }[]).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-accent-blue hover:underline"
            >
              {link.label} →
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
