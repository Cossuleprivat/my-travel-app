// components/avatar/AvatarDisplay.tsx
import type { AvatarMood } from '@/lib/streaks/streak';

type Size = 'sm' | 'md' | 'lg';

const sizeMap: Record<Size, string> = {
  sm: 'w-12 h-12',
  md: 'w-20 h-20',
  lg: 'w-32 h-32',
};

const fontSizeMap: Record<Size, string> = {
  sm: 'text-lg',
  md: 'text-2xl',
  lg: 'text-4xl',
};

const moodBadgeSizeMap: Record<Size, string> = {
  sm: 'text-sm -bottom-1 -right-1',
  md: 'text-base -bottom-1 -right-1',
  lg: 'text-xl -bottom-1 -right-1',
};

const MOOD_EMOJI: Record<AvatarMood, string> = {
  excited: '🤩',
  happy:   '😊',
  neutral: '😐',
  sad:     '😢',
};

const FALLBACK_COLORS = ['#40a0d0', '#d48030', '#60b860', '#d04040', '#a060d0'];

function fallbackColor(name: string | null): string {
  if (!name) return FALLBACK_COLORS[0];
  return FALLBACK_COLORS[name.charCodeAt(0) % FALLBACK_COLORS.length];
}

export function AvatarDisplay({
  avatarUrl,
  name = null,
  size = 'md',
  className = '',
  mood,
}: {
  avatarUrl: string | null;
  name?: string | null;
  size?: Size;
  className?: string;
  mood?: AvatarMood;
}) {
  return (
    <div className={`relative shrink-0 ${sizeMap[size]} ${className}`}>
      <div
        className="w-full h-full rounded-lg overflow-hidden flex items-center justify-center"
        style={!avatarUrl ? { backgroundColor: fallbackColor(name) } : undefined}
      >
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt="Dein Pixel-Avatar"
            className="w-full h-full object-cover"
            style={{ imageRendering: 'pixelated' }}
          />
        ) : (
          <span className={`${fontSizeMap[size]} font-mono text-white font-bold select-none`}>
            {name ? name.charAt(0).toUpperCase() : '?'}
          </span>
        )}
      </div>

      {mood && (
        <span
          className={`absolute leading-none ${moodBadgeSizeMap[size]}`}
          aria-label={`Mood: ${mood}`}
        >
          {MOOD_EMOJI[mood]}
        </span>
      )}
    </div>
  );
}
