// lib/avatar/storage.ts
import 'server-only';
import { createServiceClient } from '@/lib/supabase/server';

const BUCKET = 'avatars';
const SIGNED_URL_EXPIRY = 60 * 60 * 24 * 7; // 7 Tage

function avatarPath(userId: string): string {
  return `${userId}/avatar.png`;
}

/**
 * Lädt ein Bild von einer URL herunter und speichert es im Supabase-Storage-Bucket.
 * Gibt den gespeicherten Pfad zurück (nicht die signierte URL).
 */
export async function uploadAvatarFromUrl(userId: string, sourceUrl: string): Promise<string> {
  const sb = createServiceClient();

  const response = await fetch(sourceUrl);
  if (!response.ok) throw new Error(`Bild konnte nicht geladen werden: ${response.status}`);
  const buffer = await response.arrayBuffer();

  const path = avatarPath(userId);
  const { error } = await sb.storage
    .from(BUCKET)
    .upload(path, buffer, { contentType: 'image/png', upsert: true });
  if (error) throw error;

  return path;
}

/**
 * Gibt eine signierte URL für den Avatar zurück, oder null wenn keiner existiert.
 * Signierte URLs sind 7 Tage gültig — wird im Server Component bei jedem Request neu erzeugt.
 */
export async function getAvatarSignedUrl(userId: string): Promise<string | null> {
  const sb = createServiceClient();
  const path = avatarPath(userId);

  const { data, error } = await sb.storage
    .from(BUCKET)
    .createSignedUrl(path, SIGNED_URL_EXPIRY);

  // Kein Fehler werfen wenn Datei nicht existiert (neuer User)
  if (error || !data?.signedUrl) return null;
  return data.signedUrl;
}
