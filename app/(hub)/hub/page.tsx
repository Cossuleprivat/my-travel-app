import Link from 'next/link';
import { requireUserId } from '@/lib/auth/current-user';
import { ensureUserProfile, getUserStats } from '@/lib/data/queries';
import { getAvatarSignedUrl } from '@/lib/avatar/storage';
import { calcLevel } from '@/lib/xp';
import { MODULE_REGISTRY } from '@/modules/registry';
import { createServiceClient } from '@/lib/supabase/server';
import { seedAllFromNotion } from '@/lib/actions/life-seed';
import type { LiveOSModule } from '@/modules/types';

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
  ] = await Promise.all([
    sb.from('user_run_logs').select('distance_km').eq('user_id', userId),
    sb.from('user_games').select('status').eq('user_id', userId).eq('year', 2026),
    sb.from('user_books').select('status, type').eq('user_id', userId).eq('year', 2026),
    sb.from('finance_months').select('kk_saldo_end, kk_free').eq('user_id', userId).eq('year', 2026).order('month').limit(12),
    sb.from('wedding_tasks').select('status').eq('user_id', userId),
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
  const lifeStats = await getLifeModuleStats(userId);

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
          <p className="text-text-muted text-sm">Personal life operating system</p>
        </div>
      </div>

      {/* Modules */}
      <section className="space-y-3">
        <h2 className="text-xs label-mono text-text-muted">Module</h2>
        <div className="space-y-2">
          {MODULE_REGISTRY.map((mod) => (
            <ModuleCard key={mod.id} mod={mod} stats={moduleStats[mod.id] ?? null} />
          ))}
        </div>
      </section>
    </div>
  );
}
