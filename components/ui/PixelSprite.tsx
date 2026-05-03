import { getSpriteSource, type CharacterPreset } from '@/lib/sprites';

type Size = 'sm' | 'md' | 'lg' | 'xl';

const sizeMap: Record<Size, { className: string; px: number; cols: number; rows: number }> = {
  sm:  { className: 'w-12 h-12',   px: 48,  cols: 7, rows: 10 },
  md:  { className: 'w-20 h-20',   px: 80,  cols: 7, rows: 10 },
  lg:  { className: 'w-32 h-32',   px: 128, cols: 7, rows: 10 },
  xl:  { className: 'w-48 h-48',   px: 192, cols: 7, rows: 10 },
};

export function PixelSprite({
  preset = 'default',
  size = 'md',
}: {
  preset?: CharacterPreset;
  size?: Size;
}) {
  const source = getSpriteSource(preset);
  const { className, px, cols, rows } = sizeMap[size];

  if (source.type === 'url') {
    return (
      <img
        src={source.url}
        alt={source.alt}
        className={className}
        style={{ imageRendering: 'pixelated' }}
      />
    );
  }

  const cellW = px / cols;
  const cellH = px / rows;

  return (
    <div
      className={`${className} grid flex-shrink-0`}
      style={{ gridTemplateColumns: `repeat(${cols}, ${cellW}px)`, gridTemplateRows: `repeat(${rows}, ${cellH}px)` }}
      role="img"
      aria-label="Pixel character"
    >
      {source.grid.flat().map((c, i) => (
        <div key={i} style={{ background: source.palette[c] ?? 'transparent' }} />
      ))}
    </div>
  );
}
