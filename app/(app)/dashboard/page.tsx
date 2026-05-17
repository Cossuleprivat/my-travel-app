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
import { JarvisGreeting } from '@/components/jarvis/JarvisGreeting';
import { JarvisQuickChat } from '@/components/jarvis/JarvisQuickChat';

const MODULES = [
  { id: 'travel',  label: 'Travel',   icon: '✈', href: '/explore', color: '#40a0d0', desc: 'Reisen, Städte, Quests', active: true  },
  { id: 'fitness', label: 'Fitness',  icon: '◈', href: '#',        color: '#40c070', desc: 'Coming soon',            active: false },
  { id: 'finance', label: 'Finance',  icon: '◆', href: '#',        color: '#d48030', desc: 'Coming soon',            active: false },
  { id: 'goals',   label: 'Goals',    icon: '◎', href: '#',        color: '#a060e0', desc: 'Coming soon',            active: false },
] as const;

export default async function DashboardPage() {
  const userId = await requireUserId();
  const [profile, stats, recent, avatarUrl, streakData] = await Promise.all([
    ensureUserProfile(userId),
    getUserStats(userId),
    listRecentActivity(userId, 5),
    getAvatarSignedUrl(userId),
    getStreak(userId),
  ]);
  const level = calcLevel(stats.xpTotal);
  const name  = profile.display_name ?? 'Traveler';

  return (
    <div className="space-y-5">
      {/* Jarvis greeting */}
      <div className="rounded-xl bg-bg-surface border border-[#40a0d0]/20 px-4 py-4"
           style={{ boxShadow: '0 0 20px rgba(64,160,208,0.05)' }}>
        <div className="flex items-start gap-3">
          <div className="shrink-0 h-10 w-10 rounded-full border border-[#40a0d0]/30 flex items-center justify-center"
               style={{ background: 'radial-gradient(circle, #0d2035 0%, #060c14 100%)' }}>
            <span className="font-mono text-xs font-bold text-[#40a0d0]">J</span>
          </div>
          <JarvisGreeting name={name} />
        </div>
      </div>

      <CharacterCard
        name={name}
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

      <section>
        <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-text-muted mb-2">Module</p>
        <div className="grid grid-cols-2 gap-2">
          {MODULES.map((m) => (
            <Link
              key={m.id}
              href={m.href}
              className={[
                'group relative rounded-xl border px-4 py-3 transition-all',
                m.active
                  ? 'border-border-subtle bg-bg-surface hover:border-[#40a0d0]/30'
                  : 'border-border-subtle bg-bg-surface opacity-40 pointer-events-none',
              ].join(' ')}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg" style={{ color: m.color }}>{m.icon}</span>
                <span className="font-mono text-sm text-text-primary">{m.label}</span>
                {!m.active && (
                  <span className="ml-auto font-mono text-[9px] text-text-muted border border-border-subtle rounded px-1">bald</span>
                )}
              </div>
              <p className="text-[11px] text-text-muted">{m.desc}</p>
              {m.active && (
                <div className="absolute inset-x-0 bottom-0 h-px rounded-b-xl transition-opacity opacity-0 group-hover:opacity-100"
                     style={{ background: `linear-gradient(90deg, transparent, ${m.color}40, transparent)` }} />
              )}
            </Link>
          ))}
        </div>
      </section>

      <section>
        <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-text-muted mb-2">Travel Stats</p>
        <div className="grid grid-cols-2 gap-3">
          <KpiCard label="Kontinente" value={stats.continentCount} total={7} tone="blue" />
          <KpiCard label="Länder"     value={stats.countryCount}             tone="amber" />
          <KpiCard label="Städte"     value={stats.cityCount}                tone="green" />
          <KpiCard label="Sights"     value={stats.sightCount}               tone="purple" />
        </div>
      </section>

      <JarvisQuickChat userName={name} />

      {recent.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-text-muted">Zuletzt</p>
            <Link href="/explore" className="text-accent-blue text-xs label-mono">Erkunden →</Link>
          </div>
          <RecentFeed items={recent} />
        </section>
      )}
    </div>
  );
}
