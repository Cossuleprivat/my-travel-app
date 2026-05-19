import Link from 'next/link';
import { getUserStats, listRecentActivity, ensureUserProfile, listTrips } from '@/lib/data/queries';
import { pickNextTrip } from '@/lib/travel/next-trip';
import { calcLevel } from '@/lib/xp';
import { requireUserId } from '@/lib/auth/current-user';
import { getAvatarSignedUrl } from '@/lib/avatar/storage';
import { getStreak } from '@/lib/streaks/streak';
import { MODULE_REGISTRY } from '@/modules/registry';
import { CharacterCard } from '@/components/dashboard/CharacterCard';
import { KpiCard } from '@/components/dashboard/KpiCard';
import { RecentFeed } from '@/components/dashboard/RecentFeed';
import { StreakBadge } from '@/components/dashboard/StreakBadge';
import { DailyNudge } from '@/components/dashboard/DailyNudge';
import { JarvisGreeting } from '@/components/jarvis/JarvisGreeting';
import { JarvisQuickChat } from '@/components/jarvis/JarvisQuickChat';
import { getModuleStats } from '@/lib/dashboard/module-stats';
import { getTodayOverview } from '@/lib/dashboard/today';
import { seedAllFromNotion } from '@/lib/actions/life-seed';

const COLOR_MAP: Record<string, string> = {
  blue:   '#40a0d0',
  green:  '#40c070',
  amber:  '#d48030',
  purple: '#a060e0',
  indigo: '#a060e0',
  red:    '#f87171',
};

const EVENT_DOT: Record<string, string> = {
  blue: 'bg-accent-blue',
  green: 'bg-accent-green',
  amber: 'bg-accent-amber',
  purple: 'bg-accent-purple',
  indigo: 'bg-accent-purple',
  red: 'bg-red-400',
};

export default async function DashboardPage() {
  const userId = await requireUserId();
  try {
    await seedAllFromNotion(userId);
  } catch (e) {
    console.error('seedAllFromNotion failed:', e);
  }
  const [profile, stats, recent, avatarUrl, streakData] = await Promise.all([
    ensureUserProfile(userId),
    getUserStats(userId),
    listRecentActivity(userId, 5),
    getAvatarSignedUrl(userId),
    getStreak(userId),
  ]);
  const [moduleStats, today, trips] = await Promise.all([
    getModuleStats(userId),
    getTodayOverview(userId),
    listTrips(userId),
  ]);
  const nextTrip = pickNextTrip(trips, new Date());
  const level = calcLevel(stats.xpTotal);
  const name  = profile.display_name ?? 'Traveler';

  // All active modules except travel (travel has its own highlight section)
  const lifeModules = MODULE_REGISTRY.filter((m) => m.status === 'active' && m.id !== 'travel');

  // pickNextTrip garantiert: ein zurückgegebener Trip hat immer ein start_date.
  const tripRange = nextTrip
    ? [nextTrip.start_date, nextTrip.end_date]
        .filter(Boolean)
        .map((d) =>
          new Date(d as string).toLocaleDateString('de-DE', { day: 'numeric', month: 'short' }),
        )
        .join(' – ')
    : null;

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

      {/* Character card */}
      <CharacterCard
        name={name} level={level} avatarUrl={avatarUrl}
        streak={streakData.currentStreak}
        streakAlive={streakData.isAlive}
        mood={streakData.mood}
      />

      <DailyNudge streak={streakData} cityCount={stats.cityCount} questCount={stats.sightCount} />
      <StreakBadge streak={streakData.currentStreak} isAlive={streakData.isAlive} longestStreak={streakData.longestStreak} />

      {/* Heute */}
      <section className="space-y-3">
        <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-text-muted">Heute</p>

        {today.planWeek && (
          <div className="rounded-xl bg-bg-surface border border-accent-green/30 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs label-mono text-accent-green">
                  Laufplan {today.planWeek.weekStr} · {today.planWeek.dates}
                </p>
                <p className="text-text-primary text-sm mt-1">{today.planWeek.units}</p>
              </div>
              <div className="text-right shrink-0 ml-3">
                <p className="text-accent-green font-semibold">{today.planWeek.km} km</p>
                <p className="text-text-muted text-[11px]">{today.daysToHM}d bis HM</p>
              </div>
            </div>
          </div>
        )}
        {!today.planWeek && today.nextPlanWeek && (
          <div className="rounded-xl bg-bg-surface border border-border-subtle p-4">
            <p className="text-xs label-mono text-text-muted">Laufplan startet</p>
            <p className="text-text-primary text-sm mt-1">
              {today.nextPlanWeek.weekStr} · {today.nextPlanWeek.dates} — {today.nextPlanWeek.units}
            </p>
          </div>
        )}

        {today.dueItems.length > 0 ? (
          <div className="rounded-xl bg-bg-surface border border-border-subtle divide-y divide-border-subtle">
            {today.dueItems.slice(0, 6).map((item) => (
              <Link
                key={`${item.source}-${item.id}`}
                href={item.source === 'wedding' ? '/wedding' : '/tasks'}
                className="flex items-center gap-3 p-3 hover:bg-bg-elevated transition-colors"
              >
                <span
                  className={[
                    'h-2 w-2 rounded-full shrink-0',
                    item.overdue ? 'bg-red-400' : 'bg-accent-amber',
                  ].join(' ')}
                />
                <span className="flex-1 text-sm text-text-primary truncate">{item.title}</span>
                <span
                  className={[
                    'text-[11px] label-mono shrink-0',
                    item.overdue ? 'text-red-400' : 'text-text-muted',
                  ].join(' ')}
                >
                  {item.overdue ? 'überfällig' : 'heute'} · {item.area}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-text-muted text-sm px-1">Nichts überfällig — alles im Griff.</p>
        )}

        {today.todayEvents.length > 0 && (
          <div className="rounded-xl bg-bg-surface border border-border-subtle p-3 space-y-2">
            <p className="text-[11px] label-mono text-text-muted">Termine heute</p>
            {today.todayEvents.map((e) => (
              <div key={e.id} className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${EVENT_DOT[e.color] ?? 'bg-accent-blue'}`} />
                <span className="text-sm text-text-primary">{e.title}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Life modules grid */}
      <section>
        <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-text-muted mb-2">Meine Bereiche</p>
        <div className="grid grid-cols-2 gap-2">
          {lifeModules.map((m) => {
            const color = COLOR_MAP[m.color] ?? '#40a0d0';
            return (
              <Link key={m.id} href={m.href}
                className="group relative rounded-xl border border-border-subtle bg-bg-surface px-4 py-3 transition-all hover:border-[#40a0d0]/25 active:scale-[0.98]">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-lg">{m.icon}</span>
                  <span className="font-mono text-sm text-text-primary truncate">{m.name}</span>
                </div>
                {moduleStats[m.id] ? (
                  <>
                    <p className="text-[10px] text-text-secondary truncate">{moduleStats[m.id]!.headline}</p>
                    <p className="text-[10px] text-text-muted truncate">{moduleStats[m.id]!.subline}</p>
                  </>
                ) : (
                  <p className="text-[10px] text-text-muted truncate">{m.tagline}</p>
                )}
                <div className="absolute inset-x-0 bottom-0 h-px rounded-b-xl transition-opacity opacity-0 group-hover:opacity-100"
                     style={{ background: `linear-gradient(90deg, transparent, ${color}30, transparent)` }} />
              </Link>
            );
          })}
        </div>
      </section>

      {/* Travel highlight */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-text-muted">Travel</p>
          <Link href="/travel" className="text-accent-blue text-xs label-mono">Bereich öffnen →</Link>
        </div>
        <Link href="/travel" className="block transition-transform active:scale-[0.99]">
          <div className="grid grid-cols-2 gap-3 mb-2">
            <KpiCard label="Kontinente" value={stats.continentCount} total={7} tone="blue" />
            <KpiCard label="Länder"     value={stats.countryCount}             tone="amber" />
            <KpiCard label="Städte"     value={stats.cityCount}                tone="green" />
            <KpiCard label="Sights"     value={stats.sightCount}               tone="purple" />
          </div>
        </Link>
        {nextTrip ? (
          <Link
            href={`/travel/trips/${nextTrip.id}`}
            className="block rounded-xl border border-[#40a0d0]/25 bg-bg-surface p-4 transition-all hover:border-[#40a0d0]/40 active:scale-[0.99]"
          >
            <p className="text-[10px] label-mono text-accent-blue">Nächster Trip</p>
            <div className="flex items-start justify-between gap-3 mt-1">
              <p className="text-text-primary text-sm truncate">{nextTrip.title}</p>
              {tripRange && (
                <span className="text-text-muted text-[11px] label-mono shrink-0">{tripRange}</span>
              )}
            </div>
          </Link>
        ) : (
          <Link
            href="/travel/trips"
            className="block rounded-xl border border-dashed border-border-subtle bg-bg-surface px-4 py-3 text-center text-xs text-text-secondary hover:border-[#40a0d0]/25 transition-colors"
          >
            Kein geplanter Trip — Trip planen →
          </Link>
        )}
      </section>

      {/* Jarvis chat widget */}
      <JarvisQuickChat userName={name} />

      {/* Recent activity */}
      {recent.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-text-muted">Zuletzt</p>
            <Link href="/travel/explore" className="text-accent-blue text-xs label-mono">Erkunden →</Link>
          </div>
          <RecentFeed items={recent} />
        </section>
      )}
    </div>
  );
}
