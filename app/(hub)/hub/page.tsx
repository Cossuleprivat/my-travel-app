import Link from 'next/link';
import { requireUserId } from '@/lib/auth/current-user';
import { ensureUserProfile, getUserStats } from '@/lib/data/queries';
import { getAvatarSignedUrl } from '@/lib/avatar/storage';
import { calcLevel } from '@/lib/xp';
import { MODULE_REGISTRY } from '@/modules/registry';
import { createServiceClient } from '@/lib/supabase/server';
import { seedAllFromNotion } from '@/lib/actions/life-seed';
import { getTodayOverview } from '@/lib/dashboard/today';
import { QuickAddTask } from '@/components/dashboard/QuickAddTask';
import type { LiveOSModule } from '@/modules/types';

const EVENT_DOT: Record<string, string> = {
  blue: 'bg-accent-blue',
  green: 'bg-accent-green',
  amber: 'bg-accent-amber',
  purple: 'bg-accent-purple',
  red: 'bg-red-400',
};

function fmtDate(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${d}.${m}.`;
}

const COLOR_MAP: Record<string, { border: string; accent: string; badge: string }> = {
  blue:   { border: 'border-accent-blue/30',   accent: 'text-accent-blue',   badge: 'bg-accent-blue/10 text-accent-blue' },
  green:  { border: 'border-accent-green/30',  accent: 'text-accent-green',  badge: 'bg-accent-green/10 text-accent-green' },
  amber:  { border: 'border-accent-amber/30',  accent: 'text-accent-amber',  badge: 'bg-accent-amber/10 text-accent-amber' },
  purple: { border: 'border-accent-purple/30', accent: 'text-accent-purple', badge: 'bg-accent-purple/10 text-accent-purple' },
  indigo: { border: 'border-accent-purple/30', accent: 'text-accent-purple', badge: 'bg-accent-purple/10 text-accent-purple' },
  red:    { border: 'border-red-400/30',        accent: 'text-red-400',        badge: 'bg-red-400/10 text-red-400' },
};

type ModuleStats = { headline: string; subline: string } | null;

function ModuleCard({ mod, stats }: { mod: LiveOSModule; stats: ModuleStats }) {
  const colors = COLOR_MAP[mod.color] ?? COLOR_MAP.blue;
  const isActive = mod.status === 'active';

  const card = (
    <div
      className={[
        'rounded-xl bg-bg-surface border p-4 transition-colors',
        isActive ? `${colors.border} hover:bg-bg-elevated` : 'border-border-subtle opacity-60',
      ].join(' ')}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl leading-none" aria-hidden="true">{mod.icon}</span>
          <div>
            <h2 className="text-text-primary font-medium text-sm">{mod.name}</h2>
            {stats ? (
              <>
                <p className={`text-xs font-medium mt-0.5 ${colors.accent}`}>{stats.headline}</p>
                <p className="text-text-muted text-xs">{stats.subline}</p>
              </>
            ) : (
              <p className="text-text-muted text-xs mt-0.5">{mod.tagline}</p>
            )}
          </div>
        </div>
        {!isActive && (
          <span className="text-[10px] label-mono px-1.5 py-0.5 rounded bg-bg-elevated text-text-muted border border-border-subtle whitespace-nowrap">
            Soon
          </span>
        )}
        {isActive && (
          <span className={`text-[10px] label-mono px-1.5 py-0.5 rounded ${colors.badge} whitespace-nowrap`}>
            Active
          </span>
        )}
      </div>
    </div>
  );

  if (!isActive) return card;
  return <Link href={mod.href}>{card}</Link>;
}

async function getLifeModuleStats(userId: string) {
  const sb = createServiceClient();

  const [
    { data: runLogs },
    { data: games },
    { data: books },
    { data: financeMonths },
    { data: weddingTasks },
    { data: goals },
    { data: openTasks },
    { data: wikiNotes },
  ] = await Promise.all([
    sb.from('user_run_logs').select('distance_km').eq('user_id', userId),
    sb.from('user_games').select('status').eq('user_id', userId).eq('year', 2026),
    sb.from('user_books').select('status, type').eq('user_id', userId).eq('year', 2026),
    sb.from('finance_months').select('kk_saldo_end, kk_free').eq('user_id', userId).eq('year', 2026).order('month').limit(12),
    sb.from('wedding_tasks').select('status').eq('user_id', userId),
    sb.from('user_goals').select('status, xp_reward').eq('user_id', userId).eq('year', 2026),
    sb.from('user_tasks').select('status').eq('user_id', userId),
    sb.from('user_notes').select('category, lektion_nr').eq('user_id', userId),
  ]);

  const totalKm = (runLogs ?? []).reduce((s, r) => s + Number(r.distance_km ?? 0), 0);
  const daysToHM = Math.ceil((new Date('2026-10-25').getTime() - Date.now()) / 86400000);

  const gamesArr = games ?? [];
  const gamesCompleted = gamesArr.filter((g) => g.status === 'completed').length;
  const gamesTotal = gamesArr.length;

  const booksArr = books ?? [];
  const booksDone = booksArr.filter((b) => b.type === 'book' && b.status === 'done').length;
  const audioDone = booksArr.filter((b) => b.type === 'audiobook' && b.status === 'done').length;

  const latestMonth = (financeMonths ?? []).at(-1);

  const wArr = weddingTasks ?? [];
  const wDone = wArr.filter((t) => t.status === 'done').length;
  const wTotal = wArr.length;
  const daysToStandesamt = Math.ceil((new Date('2026-10-10').getTime() - Date.now()) / 86400000);

  return {
    sport: {
      headline: `${totalKm.toFixed(1)} km gelaufen`,
      subline: `${daysToHM}d bis Halbmarathon · Ziel: 500 km`,
    },
    gaming: {
      headline: `${gamesCompleted}/${gamesTotal} Spiele fertig`,
      subline: '10-Slot Backlog · Jahresplan 2026',
    },
    reading: {
      headline: `${booksDone}/6 Bücher · ${audioDone}/6 Hörbücher`,
      subline: 'Leseplan 2026',
    },
    finance: latestMonth ? {
      headline: `KK ${Number(latestMonth.kk_saldo_end ?? 0).toLocaleString('de-DE')} €`,
      subline: `${Number(latestMonth.kk_free ?? 0).toLocaleString('de-DE')} € frei · Tilgungsplan aktiv`,
    } : {
      headline: 'Noch kein Snapshot',
      subline: 'Ersten Monatseintrag erstellen',
    },
    wedding: {
      headline: `${wDone}/${wTotal} Tasks erledigt`,
      subline: `Standesamt in ${daysToStandesamt} Tagen`,
    },
    goals: (() => {
      const gArr = goals ?? [];
      const totalXP = gArr.reduce((s, g) => s + g.xp_reward, 0);
      const doneXP = gArr.filter((g) => g.status === 'done').reduce((s, g) => s + g.xp_reward, 0);
      return { headline: `${doneXP} / ${totalXP} XP`, subline: `${gArr.filter((g) => g.status === 'done').length}/${gArr.length} Ziele erreicht` };
    })(),
    tasks: (() => {
      const tArr = openTasks ?? [];
      const remaining = tArr.filter((t) => t.status !== 'done').length;
      const done = tArr.filter((t) => t.status === 'done').length;
      return { headline: `${remaining} offen`, subline: `${done}/${tArr.length} erledigt` };
    })(),
    wiki: (() => {
      const wArr = wikiNotes ?? [];
      const zeitlekturen = wArr.filter((n) => n.category === 'zeitlektur').length;
      const total = wArr.length;
      return { headline: `${total} Notizen`, subline: `${zeitlekturen} Zeitlektüren · L1–L17` };
    })(),
  };
}

export default async function HubPage() {
  const userId = await requireUserId();

  const [profile, avatarUrl, travelStats] = await Promise.all([
    ensureUserProfile(userId),
    getAvatarSignedUrl(userId),
    getUserStats(userId),
    seedAllFromNotion(userId),
  ]);

  const level = calcLevel(travelStats.xpTotal);
  const [lifeStats, today] = await Promise.all([
    getLifeModuleStats(userId),
    getTodayOverview(userId),
  ]);

  const moduleStats: Record<string, ModuleStats> = {
    travel: {
      headline: `Level ${level.level} Explorer`,
      subline: `${travelStats.countryCount} Länder · ${travelStats.cityCount} Städte · ${travelStats.sightCount} Quests`,
    },
    ...lifeStats,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="Your avatar"
            className="w-14 h-14 rounded-full object-cover border-2 border-accent-blue/40"
          />
        ) : (
          <div className="w-14 h-14 rounded-full bg-bg-elevated border-2 border-border-subtle flex items-center justify-center text-2xl">
            ◈
          </div>
        )}
        <div>
          <h1 className="text-xl font-semibold text-text-primary">
            {profile.display_name ?? 'Dein LiveOS'}
          </h1>
          <p className="text-text-muted text-sm">
            {new Date(today.todayISO + 'T00:00:00').toLocaleDateString('de-DE', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </p>
        </div>
      </div>

      {/* TODAY */}
      <section className="space-y-3">
        <h2 className="text-xs label-mono text-text-muted">Heute</h2>

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

        <QuickAddTask />
      </section>

      {/* Upcoming */}
      {today.upcomingEvents.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs label-mono text-text-muted">Demnächst</h2>
            <Link href="/calendar" className="text-accent-blue text-xs label-mono">
              Kalender →
            </Link>
          </div>
          <div className="rounded-xl bg-bg-surface border border-border-subtle divide-y divide-border-subtle">
            {today.upcomingEvents.map((e) => (
              <Link
                key={e.id}
                href={e.href ?? '/calendar'}
                className="flex items-center gap-3 p-3 hover:bg-bg-elevated transition-colors"
              >
                <span className={`h-2 w-2 rounded-full shrink-0 ${EVENT_DOT[e.color] ?? 'bg-accent-blue'}`} />
                <span className="flex-1 text-sm text-text-primary truncate">{e.title}</span>
                <span className="text-[11px] label-mono text-text-muted shrink-0">
                  {fmtDate(e.date)}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Modules / Command Center */}
      <section className="space-y-3">
        <h2 className="text-xs label-mono text-text-muted">Bereiche</h2>
        <div className="space-y-2">
          {MODULE_REGISTRY.map((mod) => (
            <ModuleCard key={mod.id} mod={mod} stats={moduleStats[mod.id] ?? null} />
          ))}
        </div>
      </section>
    </div>
  );
}
