import Link from 'next/link';
import { requireUserId } from '@/lib/auth/current-user';
import { ensureUserProfile, getUserStats } from '@/lib/data/queries';
import { getAvatarSignedUrl } from '@/lib/avatar/storage';
import { calcLevel } from '@/lib/xp';
import { MODULE_REGISTRY } from '@/modules/registry';
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

export default async function HubPage() {
  const userId = await requireUserId();
  const [profile, avatarUrl, travelStats] = await Promise.all([
    ensureUserProfile(userId),
    getAvatarSignedUrl(userId),
    getUserStats(userId),
  ]);

  const level = calcLevel(travelStats.xpTotal);

  const moduleStats: Record<string, ModuleStats> = {
    travel: {
      headline: `Level ${level.level} Explorer`,
      subline: `${travelStats.countryCount} countries · ${travelStats.cityCount} cities · ${travelStats.sightCount} quests`,
    },
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
            {profile.display_name ?? 'Your LiveOS'}
          </h1>
          <p className="text-text-muted text-sm">Personal life operating system</p>
        </div>
      </div>

      {/* Modules */}
      <section className="space-y-3">
        <h2 className="text-xs label-mono text-text-muted">Modules</h2>
        <div className="space-y-2">
          {MODULE_REGISTRY.map((mod) => (
            <ModuleCard key={mod.id} mod={mod} stats={moduleStats[mod.id] ?? null} />
          ))}
        </div>
      </section>
    </div>
  );
}
