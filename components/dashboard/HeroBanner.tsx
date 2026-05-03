import { PixelSprite } from '@/components/ui/PixelSprite';
import type { LevelBreakdown } from '@/lib/xp';
import type { CharacterPreset } from '@/lib/sprites';

// Pixel-art stepped mountain paths (only horizontal + vertical segments = pixel look)
const MTN_BACK =
  'M0,100 L0,72 L12,72 L12,58 L24,58 L24,44 L36,44 L36,30 L48,30 L48,44 L60,44 L60,56 ' +
  'L72,56 L72,40 L84,40 L84,24 L96,24 L96,10 L108,10 L108,24 L120,24 L120,38 L132,38 ' +
  'L132,52 L144,52 L144,38 L156,38 L156,22 L168,22 L168,38 L180,38 L180,54 L192,54 ' +
  'L192,42 L204,42 L204,26 L216,26 L216,42 L228,42 L228,58 L240,58 L240,44 L252,44 ' +
  'L252,30 L264,30 L264,44 L276,44 L276,60 L288,60 L288,46 L300,46 L300,32 L312,32 ' +
  'L312,46 L324,46 L324,60 L336,60 L336,48 L348,48 L348,62 L360,62 L360,74 L372,74 ' +
  'L372,62 L384,62 L384,50 L396,50 L396,64 L400,64 L400,100 Z';

const MTN_MID =
  'M0,100 L0,80 L16,80 L16,66 L32,66 L32,52 L48,52 L48,66 L64,66 L64,54 L80,54 ' +
  'L80,68 L96,68 L96,54 L112,54 L112,40 L128,40 L128,54 L144,54 L144,40 L160,40 ' +
  'L160,54 L176,54 L176,68 L192,68 L192,54 L208,54 L208,42 L224,42 L224,56 L240,56 ' +
  'L240,70 L256,70 L256,56 L272,56 L272,44 L288,44 L288,58 L304,58 L304,72 L320,72 ' +
  'L320,60 L336,60 L336,74 L352,74 L352,62 L368,62 L368,76 L384,76 L384,80 L400,80 ' +
  'L400,100 Z';

export function HeroBanner({
  name,
  level,
  preset = 'default',
}: {
  name: string;
  level: LevelBreakdown;
  preset?: CharacterPreset;
}) {
  return (
    <section
      className="relative overflow-hidden rounded-2xl border border-border-subtle w-full"
      style={{ height: '340px' }}
      aria-label="Character hero"
    >
      {/* ── SKY ── */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#04090f] via-[#071526] to-[#0d1f30]" />

      {/* ── STARS (CSS radial dots) ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: [
            'radial-gradient(1px 1px at 5% 8%, rgba(224,238,248,0.9), transparent)',
            'radial-gradient(1px 1px at 14% 5%, rgba(64,160,208,0.7), transparent)',
            'radial-gradient(2px 2px at 22% 14%, rgba(224,238,248,0.5), transparent)',
            'radial-gradient(1px 1px at 31% 7%, rgba(212,128,48,0.6), transparent)',
            'radial-gradient(1px 1px at 40% 3%, rgba(224,238,248,0.8), transparent)',
            'radial-gradient(2px 2px at 48% 11%, rgba(64,160,208,0.5), transparent)',
            'radial-gradient(1px 1px at 57% 6%, rgba(224,238,248,0.9), transparent)',
            'radial-gradient(1px 1px at 65% 18%, rgba(224,238,248,0.4), transparent)',
            'radial-gradient(1px 1px at 73% 4%, rgba(64,160,208,0.8), transparent)',
            'radial-gradient(2px 2px at 82% 9%, rgba(224,238,248,0.6), transparent)',
            'radial-gradient(1px 1px at 90% 15%, rgba(212,128,48,0.4), transparent)',
            'radial-gradient(1px 1px at 96% 6%, rgba(224,238,248,0.9), transparent)',
            'radial-gradient(1px 1px at 18% 20%, rgba(224,238,248,0.3), transparent)',
            'radial-gradient(1px 1px at 55% 22%, rgba(64,160,208,0.4), transparent)',
            'radial-gradient(1px 1px at 78% 24%, rgba(224,238,248,0.5), transparent)',
          ].join(','),
        }}
      />

      {/* ── PIXEL MOUNTAINS (back — dark blue) ── */}
      <svg
        className="absolute inset-x-0"
        style={{ bottom: 90 }}
        viewBox="0 0 400 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d={MTN_BACK} fill="#0a1e30" />
      </svg>

      {/* ── PIXEL MOUNTAINS (mid — darker) ── */}
      <svg
        className="absolute inset-x-0"
        style={{ bottom: 56 }}
        viewBox="0 0 400 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d={MTN_MID} fill="#081624" />
      </svg>

      {/* ── GROUND PLANE ── */}
      <div
        className="absolute inset-x-0 bottom-0 border-t border-accent-blue/10"
        style={{ height: 60, background: 'linear-gradient(to bottom, #091620, #0e1a26)' }}
      />

      {/* ── CHARACTER ── */}
      <div className="absolute left-1/2 -translate-x-1/2" style={{ bottom: 44 }}>
        {/* shadow glow on ground */}
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-28 h-5 rounded-full bg-accent-blue/20 blur-md" />
        <PixelSprite size="xl" preset={preset} />
      </div>

      {/* ── TOP HUD: level badge ── */}
      <div className="absolute top-4 left-4 flex items-center gap-2">
        <span className="bg-accent-blue/20 border border-accent-blue/50 text-accent-blue text-xs label-mono px-2.5 py-1 rounded-lg">
          LVL {level.level}
        </span>
        <span className="text-xs label-mono text-text-muted hidden sm:inline">
          {level.currentXp} / {level.tierXpEnd ?? '∞'} XP
        </span>
      </div>

      {/* ── BOTTOM HUD PANEL (gradient scrim + info) ── */}
      <div
        className="absolute inset-x-0 bottom-0 px-5 pt-10 pb-4"
        style={{ background: 'linear-gradient(to top, rgba(14,26,38,0.98) 50%, transparent)' }}
      >
        <div className="flex items-end justify-between mb-2">
          <div>
            <h2 className="font-mono text-2xl lg:text-3xl uppercase tracking-widest text-text-primary drop-shadow-lg">
              {name}
            </h2>
            <p className="text-accent-amber text-xs label-mono mt-0.5">{level.title}</p>
          </div>
          {level.xpToNextTier != null && (
            <p className="text-text-muted text-[11px] label-mono pb-0.5">
              {level.xpToNextTier} XP to next tier
            </p>
          )}
        </div>

        {/* XP bar */}
        <div className="h-3 rounded-full bg-bg-elevated border border-border-subtle overflow-hidden">
          <div
            className="h-full rounded-full bg-accent-amber shadow-glow-amber transition-all duration-700"
            style={{ width: `${Math.min(100, level.progressPct)}%` }}
          />
        </div>
      </div>
    </section>
  );
}
