type Size = 'sm' | 'md' | 'lg';

const sizeMap: Record<Size, string> = {
  sm: 'w-12 h-12',
  md: 'w-20 h-20',
  lg: 'w-32 h-32',
};

// Static placeholder. Real sprites land in Session 03.
// Renders a minimal CSS pixel-art body (head + body + base) using a
// 7x10 grid of divs.
export function PixelSprite({ size = 'md' }: { size?: Size }) {
  const px = size === 'sm' ? 6 : size === 'md' ? 10 : 16;
  // Color map: 0=transparent, 1=skin, 2=outline, 3=shirt, 4=hair
  const grid: number[][] = [
    [0,0,2,2,2,0,0],
    [0,2,4,4,4,2,0],
    [0,2,1,1,1,2,0],
    [0,0,2,1,2,0,0],
    [0,2,3,3,3,2,0],
    [2,3,3,3,3,3,2],
    [2,3,3,3,3,3,2],
    [2,3,3,3,3,3,2],
    [0,2,3,0,3,2,0],
    [0,2,2,0,2,2,0],
  ];
  const palette = ['transparent', '#e8c8a0', '#0e1a26', '#40a0d0', '#604030'];
  return (
    <div
      className={`${sizeMap[size]} grid grid-cols-7 grid-rows-10 mx-auto`}
      role="img"
      aria-label="Pixel character"
    >
      {grid.flat().map((c, i) => (
        <div
          key={i}
          style={{ background: palette[c], width: px / 7 + 'px', height: px / 10 + 'px' }}
        />
      ))}
    </div>
  );
}
