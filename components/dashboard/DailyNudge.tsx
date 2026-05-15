import Link from 'next/link';
import type { StreakData } from '@/lib/streaks/streak';

type Props = {
  streak: StreakData;
  cityCount: number;
  questCount: number;
};

type Nudge = { icon: string; title: string; body: string; cta: string; href: string; tone: string };

function buildNudge(streak: StreakData, cityCount: number, questCount: number): Nudge | null {
  // Already active today → no nudge needed
  if (streak.activeToday) return null;

  if (streak.isAlive) {
    // Alive but not yet done something today
    return {
      icon: '🔥',
      title: `Keep your ${streak.currentStreak}-day streak alive!`,
      body: 'Log a city, tick a quest, or add a trip stop — any action counts.',
      cta: cityCount === 0 ? 'Log your first city' : 'Explore',
      href: '/explore',
      tone: 'amber',
    };
  }

  if (streak.longestStreak > 0) {
    // Broken streak — recovery message
    return {
      icon: '💪',
      title: 'Start a new streak today',
      body: `Your last streak was ${streak.longestStreak} days. Every legend has a comeback.`,
      cta: 'Log something now',
      href: '/explore',
      tone: 'blue',
    };
  }

  // First time / no history
  return {
    icon: '✈',
    title: 'Start your explorer journey',
    body: 'Log your first city visit to earn XP, unlock items, and start a daily streak.',
    cta: 'Explore the world',
    href: '/explore',
    tone: 'blue',
  };
}

const TONE_CLASSES: Record<string, { border: string; icon: string; cta: string }> = {
  amber: {
    border: 'border-accent-amber/30 bg-accent-amber/5',
    icon: 'text-accent-amber',
    cta: 'text-accent-amber border-accent-amber/40 hover:bg-accent-amber/10',
  },
  blue: {
    border: 'border-accent-blue/30 bg-accent-blue/5',
    icon: 'text-accent-blue',
    cta: 'text-accent-blue border-accent-blue/40 hover:bg-accent-blue/10',
  },
};

export function DailyNudge({ streak, cityCount, questCount }: Props) {
  const nudge = buildNudge(streak, cityCount, questCount);
  if (!nudge) return null;

  const tone = TONE_CLASSES[nudge.tone] ?? TONE_CLASSES.blue;

  return (
    <div className={`rounded-xl border p-4 flex items-start gap-3 ${tone.border}`}>
      <span className={`text-2xl leading-none shrink-0 ${tone.icon}`} aria-hidden="true">
        {nudge.icon}
      </span>
      <div className="flex-1 min-w-0 space-y-2">
        <p className="text-text-primary text-sm font-medium">{nudge.title}</p>
        <p className="text-text-muted text-xs leading-relaxed">{nudge.body}</p>
        <Link
          href={nudge.href}
          className={`inline-block text-xs label-mono px-3 py-1.5 rounded-lg border transition-colors ${tone.cta}`}
        >
          {nudge.cta} →
        </Link>
      </div>
    </div>
  );
}
