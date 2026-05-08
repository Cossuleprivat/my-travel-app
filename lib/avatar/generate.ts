// lib/avatar/generate.ts
import 'server-only';
import Replicate from 'replicate';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

// Modell kann via Env-Var überschrieben werden (z.B. für Experimente)
const PIXEL_MODEL = (process.env.REPLICATE_PIXEL_MODEL ?? 'zeke/pixelate') as `${string}/${string}`;

/**
 * Sendet ein Bild als Base64-Data-URL an Replicate und gibt die URL
 * des generierten Pixel-Art-Bildes zurück.
 */
export async function generatePixelAvatar(imageDataUrl: string): Promise<string> {
  if (!process.env.REPLICATE_API_TOKEN) {
    throw new Error('REPLICATE_API_TOKEN ist nicht gesetzt');
  }

  const output = await replicate.run(PIXEL_MODEL, {
    input: { image: imageDataUrl },
  });

  // Replicate gibt je nach Modell unterschiedliche Output-Formate zurück
  if (typeof output === 'string' && (output as string).startsWith('http')) {
    return output as string;
  }
  if (Array.isArray(output) && typeof output[0] === 'string') {
    return output[0];
  }

  throw new Error(`Unerwartetes Output-Format von Replicate: ${JSON.stringify(output)}`);
}
