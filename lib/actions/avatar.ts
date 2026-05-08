// lib/actions/avatar.ts
'use server';

import { requireUserId } from '@/lib/auth/current-user';
import { getAvatarRateLimitStatus, consumeAvatarGeneration } from '@/lib/avatar/rate-limit';
import { generatePixelAvatar } from '@/lib/avatar/generate';
import { uploadAvatarFromUrl } from '@/lib/avatar/storage';
import { createServiceClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export type AvatarActionResult =
  | { success: true; avatarUrl: string }
  | { success: false; error: string };

export async function generateAvatarAction(
  formData: FormData,
): Promise<AvatarActionResult> {
  const userId = await requireUserId();

  // Rate-Limit prüfen
  const status = await getAvatarRateLimitStatus(userId);
  if (!status.canGenerate) {
    return {
      success: false,
      error: 'Limit erreicht. Nächste Generierung erst nächsten Monat möglich.',
    };
  }

  // Datei validieren
  const file = formData.get('photo') as File | null;
  if (!file || file.size === 0) {
    return { success: false, error: 'Kein Foto ausgewählt.' };
  }
  if (file.size > 5 * 1024 * 1024) {
    return { success: false, error: 'Foto zu groß — maximal 5 MB erlaubt.' };
  }
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    return { success: false, error: 'Nur JPEG, PNG oder WebP erlaubt.' };
  }

  // In Base64 konvertieren für Replicate
  const arrayBuffer = await file.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString('base64');
  const dataUrl = `data:${file.type};base64,${base64}`;

  // Pixel-Avatar generieren
  let generatedUrl: string;
  try {
    generatedUrl = await generatePixelAvatar(dataUrl);
  } catch {
    return { success: false, error: 'Avatar-Generierung fehlgeschlagen. Bitte nochmal versuchen.' };
  }

  // Bild in Storage speichern
  let storagePath: string;
  try {
    storagePath = await uploadAvatarFromUrl(userId, generatedUrl);
  } catch {
    return { success: false, error: 'Bild konnte nicht gespeichert werden.' };
  }

  // user_profiles aktualisieren
  const sb = createServiceClient();
  const { error: updateError } = await sb
    .from('user_profiles')
    .update({
      avatar_url: storagePath,
      avatar_generated_at: new Date().toISOString(),
    })
    .eq('id', userId);
  if (updateError) return { success: false, error: 'Profil konnte nicht aktualisiert werden.' };

  // Rate-Limit-Zähler erhöhen
  try {
    await consumeAvatarGeneration(userId);
  } catch {
    // Profile was saved — non-fatal, counter update failure just means
    // the limit won't be enforced this cycle.
  }

  revalidatePath('/profile');
  revalidatePath('/profile/avatar');
  revalidatePath('/dashboard');

  return { success: true, avatarUrl: generatedUrl };
}
