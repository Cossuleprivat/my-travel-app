// Sprite abstraction layer — swap `getSpriteSource` to return `{ type: 'url' }`
// when switching to PixelLab API or static PNGs. PixelSprite handles both.

export type CharacterPreset =
  | 'default'
  | 'explorer'
  | 'adventurer'
  | 'scholar'
  | 'nomad';

export type SpriteSource =
  | { type: 'css'; grid: number[][]; palette: string[] }
  | { type: 'url'; url: string; alt: string };

const GRIDS: Record<CharacterPreset, { grid: number[][]; palette: string[] }> = {
  default: {
    grid: [
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
    ],
    palette: ['transparent', '#e8c8a0', '#0e1a26', '#40a0d0', '#604030'],
  },
  explorer: {
    grid: [
      [0,0,2,2,2,0,0],
      [2,2,5,5,5,2,2],
      [0,2,1,1,1,2,0],
      [0,0,2,1,2,0,0],
      [0,2,6,6,6,2,0],
      [2,6,6,6,6,6,2],
      [2,6,6,6,6,6,2],
      [2,6,6,6,6,6,2],
      [0,2,6,0,6,2,0],
      [0,2,2,0,2,2,0],
    ],
    palette: ['transparent', '#e8c8a0', '#0e1a26', '#40a0d0', '#604030', '#8B5E3C', '#d48030'],
  },
  adventurer: {
    grid: [
      [0,0,2,2,2,0,0],
      [0,2,7,7,7,2,0],
      [0,2,1,1,1,2,0],
      [0,0,2,1,2,0,0],
      [0,2,8,8,8,2,0],
      [2,8,8,8,8,8,2],
      [2,8,8,8,8,8,2],
      [2,8,8,8,8,8,2],
      [0,2,8,0,8,2,0],
      [0,2,2,0,2,2,0],
    ],
    palette: ['transparent', '#e8c8a0', '#0e1a26', '#40a0d0', '#604030', '#8B5E3C', '#d48030', '#604030', '#40c070'],
  },
  scholar: {
    grid: [
      [0,0,2,2,2,0,0],
      [0,2,9,9,9,2,0],
      [0,2,1,1,1,2,0],
      [0,0,2,1,2,0,0],
      [0,2,10,10,10,2,0],
      [2,10,10,10,10,10,2],
      [2,10,10,10,10,10,2],
      [2,10,10,10,10,10,2],
      [0,2,10,0,10,2,0],
      [0,2,2,0,2,2,0],
    ],
    palette: ['transparent', '#e8c8a0', '#0e1a26', '#40a0d0', '#604030', '#8B5E3C', '#d48030', '#40c070', '#a060e0', '#c8a060', '#a060e0'],
  },
  nomad: {
    grid: [
      [0,0,2,2,2,0,0],
      [0,2,11,11,11,2,0],
      [0,2,1,1,1,2,0],
      [0,0,2,1,2,0,0],
      [0,2,12,12,12,2,0],
      [2,12,12,12,12,12,2],
      [2,12,12,12,12,12,2],
      [2,12,12,12,12,12,2],
      [0,2,12,0,12,2,0],
      [0,2,2,0,2,2,0],
    ],
    palette: ['transparent', '#e8c8a0', '#0e1a26', '#40a0d0', '#604030', '#8B5E3C', '#d48030', '#40c070', '#a060e0', '#c8a060', '#a060e0', '#c8a060', '#7892a8'],
  },
};

// To switch to PixelLab (or static PNGs), replace this function:
//   return { type: 'url', url: `https://api.pixellab.ai/...`, alt: preset };
export function getSpriteSource(preset: CharacterPreset = 'default'): SpriteSource {
  return { type: 'css', ...(GRIDS[preset] ?? GRIDS.default) };
}
