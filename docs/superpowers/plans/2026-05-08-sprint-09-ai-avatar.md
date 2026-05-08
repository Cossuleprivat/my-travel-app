# Sprint 9: KI-Avatar-System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** User lädt ein Profilfoto hoch, Replicate-API generiert daraus einen Pixel-Avatar, der auf Dashboard und Profil den bisherigen CSS-Placeholder (PixelSprite) ersetzt — mit Rate-Limiting (1x/Monat + 1 Retry kostenlos).

**Architecture:** Server Action nimmt Foto-Upload entgegen, ruft Replicate-Pixel-Art-Modell auf, speichert das generierte Bild in Supabase Storage und aktualisiert `user_profiles`. Die Rate-Limit-Logik ist als reine Funktion implementiert, damit sie ohne Datenbank-Mocking testbar ist. `AvatarDisplay` ist ein Drop-in-Ersatz für `PixelSprite` mit einem `avatarUrl`-Prop.

**Tech Stack:** Next.js 15 App Router · Supabase (DB + Storage) · `replicate` npm package · Vitest · TypeScript

**Env Vars nötig (in `.env.local` eintragen):**
```
REPLICATE_API_TOKEN=r8_...
REPLICATE_PIXEL_MODEL=zeke/pixelate
```

---

## File Map

| Datei | Aktion | Zweck |
|---|---|---|
| `supabase/migrations/0009_avatar_system.sql` | Neu | Avatar-Felder in user_profiles + Storage Bucket |
| `lib/supabase/types.ts` | Ändern | UserProfile um Avatar-Felder erweitern |
| `lib/avatar/rate-limit.ts` | Neu | Reine Logik + DB-Wrapper für Rate-Limiting |
| `lib/avatar/rate-limit.test.ts` | Neu | Unit-Tests für reine Rate-Limit-Logik |
| `lib/avatar/generate.ts` | Neu | Replicate-API-Call |
| `lib/avatar/storage.ts` | Neu | Supabase Storage: Upload + Signed URL |
| `lib/actions/avatar.ts` | Neu | Server Action: generateAvatarAction |
| `components/avatar/AvatarDisplay.tsx` | Neu | Drop-in-Ersatz für PixelSprite |
| `components/avatar/AvatarUploader.tsx` | Neu | Client-Component: Upload-Form + Status |
| `app/(app)/profile/avatar/page.tsx` | Neu | Avatar-Seite (Server Component) |
| `components/dashboard/CharacterCard.tsx` | Ändern | PixelSprite → AvatarDisplay |
| `components/profile/ProfileHero.tsx` | Ändern | PixelSprite → AvatarDisplay |
| `app/(app)/dashboard/page.tsx` | Ändern | avatarUrl an CharacterCard übergeben |
| `app/(app)/profile/page.tsx` | Ändern | avatarUrl an ProfileHero + Avatar-Link |
| `lib/data/queries.ts` | Ändern | ensureUserProfile: avatar_url fetchen |

---

## Task 1: DB-Migration — Avatar-Felder + Storage Bucket

**Files:**
- Create: `supabase/migrations/0009_avatar_system.sql`

- [ ] **Schritt 1: Migration-Datei anlegen**

```sql
-- supabase/migrations/0009_avatar_system.sql

-- 1. Avatar-Felder zur user_profiles Tabelle hinzufügen
alter table public.user_profiles
  add column if not exists avatar_url           text,
  add column if not exists avatar_generated_at  timestamptz,
  add column if not exists avatar_generation_month integer,   -- Format: YYYYMM z.B. 202605
  add column if not exists avatar_generation_count integer not null default 0;

-- 2. Storage Bucket für Avatare erstellen (private, 5 MB Limit)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
) on conflict (id) do nothing;

-- 3. RLS Policies für den Bucket
create policy "users_can_upload_own_avatar"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "users_can_read_own_avatar"
  on storage.objects for select
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "users_can_update_own_avatar"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "users_can_delete_own_avatar"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
```

- [ ] **Schritt 2: Migration in Supabase einspielen**

```bash
npx supabase db push
```

Erwartete Ausgabe: Migration `0009_avatar_system` erfolgreich angewendet.

- [ ] **Schritt 3: Commit**

```bash
git add supabase/migrations/0009_avatar_system.sql
git commit -m "feat(avatar): db migration — avatar fields + storage bucket"
```

---

## Task 2: TypeScript-Typen aktualisieren

**Files:**
- Modify: `lib/supabase/types.ts`

- [ ] **Schritt 1: UserProfile um Avatar-Felder erweitern**

In `lib/supabase/types.ts` den `UserProfile`-Typ ersetzen:

```typescript
export type UserProfile = {
  id: string;
  display_name: string | null;
  home_city_id: string | null;
  travel_interests: string[];
  xp_total: number;
  level: number;
  avatar_url: string | null;
  avatar_generated_at: string | null;
  avatar_generation_month: number | null;
  avatar_generation_count: number;
};
```

- [ ] **Schritt 2: Typecheck ausführen**

```bash
npm run typecheck
```

Erwartete Ausgabe: Fehler nur in Dateien, die `UserProfile` verwenden und noch kein `avatar_url` erwarten — diese werden in späteren Tasks behoben.

- [ ] **Schritt 3: Commit**

```bash
git add lib/supabase/types.ts
git commit -m "feat(avatar): extend UserProfile type with avatar fields"
```

---

## Task 3: Rate-Limit-Logik (rein + DB-Wrapper)

**Files:**
- Create: `lib/avatar/rate-limit.ts`
- Create: `lib/avatar/rate-limit.test.ts`

- [ ] **Schritt 1: Test-Datei schreiben (TDD — Tests zuerst)**

```typescript
// lib/avatar/rate-limit.test.ts
import { describe, it, expect } from 'vitest';
import { checkAvatarRateLimit } from './rate-limit';

const FREE_GENS = 2; // 1 regulär + 1 Retry

describe('checkAvatarRateLimit', () => {
  it('erlaubt Generierung wenn noch nie generiert wurde', () => {
    const result = checkAvatarRateLimit(null, 0, 202605);
    expect(result.canGenerate).toBe(true);
    expect(result.isRetry).toBe(false);
    expect(result.generationsLeft).toBe(FREE_GENS);
  });

  it('erlaubt Retry nach erster Generierung im selben Monat', () => {
    const result = checkAvatarRateLimit(202605, 1, 202605);
    expect(result.canGenerate).toBe(true);
    expect(result.isRetry).toBe(true);
    expect(result.generationsLeft).toBe(1);
  });

  it('blockiert nach zwei Generierungen im selben Monat', () => {
    const result = checkAvatarRateLimit(202605, 2, 202605);
    expect(result.canGenerate).toBe(false);
    expect(result.generationsLeft).toBe(0);
  });

  it('setzt Limit für neuen Monat zurück', () => {
    // Generation war im April, jetzt ist Mai
    const result = checkAvatarRateLimit(202604, 2, 202605);
    expect(result.canGenerate).toBe(true);
    expect(result.isRetry).toBe(false);
    expect(result.generationsLeft).toBe(FREE_GENS);
  });

  it('behandelt generation_count=0 korrekt als kein Retry', () => {
    const result = checkAvatarRateLimit(202605, 0, 202605);
    expect(result.isRetry).toBe(false);
    expect(result.canGenerate).toBe(true);
  });
});
```

- [ ] **Schritt 2: Tests ausführen — müssen fehlschlagen**

```bash
npm test -- rate-limit
```

Erwartete Ausgabe: `FAIL — cannot find module './rate-limit'`

- [ ] **Schritt 3: rate-limit.ts implementieren**

```typescript
// lib/avatar/rate-limit.ts
import 'server-only';
import { createServiceClient } from '@/lib/supabase/server';

const FREE_GENS_PER_MONTH = 2; // 1 regulär + 1 Retry

export type RateLimitStatus = {
  canGenerate: boolean;
  isRetry: boolean;
  generationsLeft: number;
};

/** Reine Funktion — testbar ohne Datenbank. */
export function checkAvatarRateLimit(
  generationMonth: number | null,
  generationCount: number,
  currentMonth: number,
): RateLimitStatus {
  const isNewMonth = generationMonth !== currentMonth;
  const usedThisMonth = isNewMonth ? 0 : generationCount;

  return {
    canGenerate: usedThisMonth < FREE_GENS_PER_MONTH,
    isRetry: usedThisMonth === 1,
    generationsLeft: Math.max(0, FREE_GENS_PER_MONTH - usedThisMonth),
  };
}

export function currentYYYYMM(): number {
  const now = new Date();
  return now.getFullYear() * 100 + (now.getMonth() + 1);
}

/** Liest aktuellen Status aus der DB. */
export async function getAvatarRateLimitStatus(userId: string): Promise<RateLimitStatus> {
  const sb = createServiceClient();
  const { data, error } = await sb
    .from('user_profiles')
    .select('avatar_generation_month, avatar_generation_count')
    .eq('id', userId)
    .single();
  if (error) throw error;

  return checkAvatarRateLimit(
    data.avatar_generation_month,
    data.avatar_generation_count ?? 0,
    currentYYYYMM(),
  );
}

/** Verbraucht einen Generierungsslot. Wirft RATE_LIMIT_EXCEEDED wenn kein Slot frei. */
export async function consumeAvatarGeneration(userId: string): Promise<void> {
  const sb = createServiceClient();
  const status = await getAvatarRateLimitStatus(userId);

  if (!status.canGenerate) throw new Error('RATE_LIMIT_EXCEEDED');

  const month = currentYYYYMM();
  const newCount = status.isRetry ? 2 : 1;

  const { error } = await sb
    .from('user_profiles')
    .update({
      avatar_generation_month: month,
      avatar_generation_count: newCount,
    })
    .eq('id', userId);
  if (error) throw error;
}
```

- [ ] **Schritt 4: Tests ausführen — müssen bestehen**

```bash
npm test -- rate-limit
```

Erwartete Ausgabe: `PASS — 5 tests passed`

- [ ] **Schritt 5: Commit**

```bash
git add lib/avatar/rate-limit.ts lib/avatar/rate-limit.test.ts
git commit -m "feat(avatar): rate-limit logic with pure checkAvatarRateLimit"
```

---

## Task 4: Replicate-Integration

**Files:**
- Create: `lib/avatar/generate.ts`

- [ ] **Schritt 1: generate.ts implementieren**

```typescript
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
  if (typeof output === 'string' && output.startsWith('http')) return output;
  if (Array.isArray(output) && typeof output[0] === 'string') return output[0] as string;

  throw new Error(`Unerwartetes Output-Format von Replicate: ${JSON.stringify(output)}`);
}
```

- [ ] **Schritt 2: Typecheck**

```bash
npm run typecheck
```

Erwartete Ausgabe: Keine neuen Fehler.

- [ ] **Schritt 3: Commit**

```bash
git add lib/avatar/generate.ts
git commit -m "feat(avatar): replicate pixel-art generation wrapper"
```

---

## Task 5: Supabase Storage Helpers

**Files:**
- Create: `lib/avatar/storage.ts`

- [ ] **Schritt 1: storage.ts implementieren**

```typescript
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
```

- [ ] **Schritt 2: Typecheck**

```bash
npm run typecheck
```

- [ ] **Schritt 3: Commit**

```bash
git add lib/avatar/storage.ts
git commit -m "feat(avatar): supabase storage upload + signed-url helpers"
```

---

## Task 6: Server Action — generateAvatarAction

**Files:**
- Create: `lib/actions/avatar.ts`

- [ ] **Schritt 1: Server Action implementieren**

```typescript
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
  await consumeAvatarGeneration(userId);

  revalidatePath('/profile');
  revalidatePath('/dashboard');

  return { success: true, avatarUrl: generatedUrl };
}
```

- [ ] **Schritt 2: Typecheck**

```bash
npm run typecheck
```

Erwartete Ausgabe: Keine Fehler.

- [ ] **Schritt 3: Commit**

```bash
git add lib/actions/avatar.ts
git commit -m "feat(avatar): generateAvatarAction server action"
```

---

## Task 7: AvatarDisplay-Komponente

**Files:**
- Create: `components/avatar/AvatarDisplay.tsx`

- [ ] **Schritt 1: AvatarDisplay implementieren**

```tsx
// components/avatar/AvatarDisplay.tsx

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

// Deterministisch basierend auf dem ersten Zeichen des Namens
const FALLBACK_COLORS = ['#40a0d0', '#d48030', '#60b860', '#d04040', '#a060d0'];

function fallbackColor(name: string | null): string {
  if (!name) return FALLBACK_COLORS[0];
  return FALLBACK_COLORS[name.charCodeAt(0) % FALLBACK_COLORS.length];
}

/**
 * Zeigt den KI-generierten Pixel-Avatar oder einen Fallback.
 * Drop-in-Ersatz für PixelSprite — gleiche Size-API.
 */
export function AvatarDisplay({
  avatarUrl,
  name = null,
  size = 'md',
  className = '',
}: {
  avatarUrl: string | null;
  name?: string | null;
  size?: Size;
  className?: string;
}) {
  return (
    <div
      className={`${sizeMap[size]} rounded-lg overflow-hidden flex items-center justify-center shrink-0 ${className}`}
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
  );
}
```

- [ ] **Schritt 2: Typecheck**

```bash
npm run typecheck
```

- [ ] **Schritt 3: Commit**

```bash
git add components/avatar/AvatarDisplay.tsx
git commit -m "feat(avatar): AvatarDisplay component — drop-in replacement for PixelSprite"
```

---

## Task 8: AvatarUploader-Client-Komponente

**Files:**
- Create: `components/avatar/AvatarUploader.tsx`

- [ ] **Schritt 1: AvatarUploader implementieren**

```tsx
// components/avatar/AvatarUploader.tsx
'use client';

import { useState, useTransition, useRef } from 'react';
import { generateAvatarAction } from '@/lib/actions/avatar';
import { AvatarDisplay } from './AvatarDisplay';

// Typ lokal definiert — kein Import aus server-only Modul im Client Component
type RateLimitStatus = {
  canGenerate: boolean;
  isRetry: boolean;
  generationsLeft: number;
};

export function AvatarUploader({
  currentAvatarUrl,
  userName,
  rateLimitStatus,
}: {
  currentAvatarUrl: string | null;
  userName: string | null;
  rateLimitStatus: RateLimitStatus;
}) {
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setErrorMsg(null);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await generateAvatarAction(formData);
      if (!result.success) {
        setErrorMsg(result.error);
      } else {
        formRef.current?.reset();
        setPreview(null);
      }
    });
  }

  const displayUrl = preview ?? currentAvatarUrl;

  return (
    <div className="space-y-5">
      <div className="flex justify-center">
        <AvatarDisplay avatarUrl={displayUrl} name={userName} size="lg" />
      </div>

      {rateLimitStatus.canGenerate ? (
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-3">
          <label className="block">
            <span className="text-xs label-mono text-text-muted block mb-1">
              Foto hochladen (JPEG · PNG · WebP · max. 5 MB)
            </span>
            <input
              type="file"
              name="photo"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="block w-full text-sm text-text-secondary file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:bg-bg-elevated file:text-text-primary hover:file:bg-border-subtle"
            />
          </label>

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-2 px-4 bg-accent-amber text-bg-base font-mono text-sm rounded-lg disabled:opacity-50 transition-opacity"
          >
            {isPending
              ? 'Generiere Avatar…'
              : rateLimitStatus.isRetry
                ? 'Nochmal generieren (Retry)'
                : 'Pixel-Avatar generieren'}
          </button>

          <p className="text-text-muted text-[10px] label-mono text-center">
            {rateLimitStatus.generationsLeft === 2
              ? '1 Generierung + 1 Retry diesen Monat verfügbar'
              : rateLimitStatus.generationsLeft === 1
                ? '1 Retry diesen Monat noch verfügbar'
                : ''}
          </p>
        </form>
      ) : (
        <div className="text-center space-y-2">
          <p className="text-text-muted text-sm label-mono">
            Monatliches Limit erreicht.
          </p>
          <p className="text-text-muted text-[10px] label-mono">
            Nächste Generierung ab dem 1. des nächsten Monats.
          </p>
        </div>
      )}

      {isPending && (
        <p className="text-accent-amber text-xs label-mono text-center animate-pulse">
          KI arbeitet… das dauert 10–30 Sekunden.
        </p>
      )}

      {errorMsg && (
        <p className="text-red-400 text-sm label-mono text-center">{errorMsg}</p>
      )}
    </div>
  );
}
```

- [ ] **Schritt 2: Typecheck**

```bash
npm run typecheck
```

- [ ] **Schritt 3: Commit**

```bash
git add components/avatar/AvatarUploader.tsx
git commit -m "feat(avatar): AvatarUploader client component with file preview"
```

---

## Task 9: Avatar-Seite (`/profile/avatar`)

**Files:**
- Create: `app/(app)/profile/avatar/page.tsx`

- [ ] **Schritt 1: Avatar-Seite implementieren**

```tsx
// app/(app)/profile/avatar/page.tsx
import { requireUserId } from '@/lib/auth/current-user';
import { getAvatarRateLimitStatus } from '@/lib/avatar/rate-limit';
import { getAvatarSignedUrl } from '@/lib/avatar/storage';
import { ensureUserProfile } from '@/lib/data/queries';
import { AvatarUploader } from '@/components/avatar/AvatarUploader';

export default async function AvatarPage() {
  const userId = await requireUserId();
  const [profile, rateLimitStatus, avatarUrl] = await Promise.all([
    ensureUserProfile(userId),
    getAvatarRateLimitStatus(userId),
    getAvatarSignedUrl(userId),
  ]);

  return (
    <div className="space-y-4">
      <section className="rounded-xl bg-bg-surface border border-border-subtle p-5">
        <h1 className="font-mono text-lg uppercase tracking-wider mb-5">Pixel-Avatar</h1>

        <AvatarUploader
          currentAvatarUrl={avatarUrl}
          userName={profile.display_name}
          rateLimitStatus={rateLimitStatus}
        />
      </section>

      <section className="rounded-xl bg-bg-surface border border-border-subtle p-4">
        <h2 className="text-xs label-mono text-text-muted mb-2">So funktioniert es</h2>
        <ul className="space-y-1 text-text-secondary text-sm">
          <li>• Lade ein klares Foto von dir hoch</li>
          <li>• Die KI verwandelt es in einen Pixel-Charakter</li>
          <li>• 1 Generierung + 1 Retry pro Monat kostenlos</li>
          <li>• Dein Avatar wächst mit deinen Reisen</li>
        </ul>
      </section>
    </div>
  );
}
```

- [ ] **Schritt 2: Typecheck**

```bash
npm run typecheck
```

- [ ] **Schritt 3: Commit**

```bash
git add app/(app)/profile/avatar/page.tsx
git commit -m "feat(avatar): avatar generation page at /profile/avatar"
```

---

## Task 10: queries.ts — avatar_url fetchen

**Files:**
- Modify: `lib/data/queries.ts`

- [ ] **Schritt 1: ensureUserProfile um Avatar-Felder erweitern**

In `lib/data/queries.ts` das Select in `ensureUserProfile` anpassen. Alte Zeile (ca. 119–122):

```typescript
  const { data: existing } = await sb
    .from('user_profiles')
    .select('id, display_name, home_city_id, travel_interests, xp_total, level')
    .eq('id', userId)
    .maybeSingle();
```

Ersetzen durch:

```typescript
  const { data: existing } = await sb
    .from('user_profiles')
    .select('id, display_name, home_city_id, travel_interests, xp_total, level, avatar_url, avatar_generated_at, avatar_generation_month, avatar_generation_count')
    .eq('id', userId)
    .maybeSingle();
```

Gleiche Änderung beim Insert-Select weiter unten (ca. 125–129):

```typescript
  const { data, error } = await sb
    .from('user_profiles')
    .insert({ id: userId, display_name: 'Traveler', travel_interests: [] })
    .select('id, display_name, home_city_id, travel_interests, xp_total, level, avatar_url, avatar_generated_at, avatar_generation_month, avatar_generation_count')
    .single();
```

- [ ] **Schritt 2: Typecheck**

```bash
npm run typecheck
```

- [ ] **Schritt 3: Commit**

```bash
git add lib/data/queries.ts
git commit -m "feat(avatar): fetch avatar fields in ensureUserProfile"
```

---

## Task 11: CharacterCard — PixelSprite → AvatarDisplay

**Files:**
- Modify: `components/dashboard/CharacterCard.tsx`
- Modify: `app/(app)/dashboard/page.tsx`

- [ ] **Schritt 1: CharacterCard anpassen**

`components/dashboard/CharacterCard.tsx` komplett ersetzen:

```tsx
// components/dashboard/CharacterCard.tsx
import { AvatarDisplay } from '@/components/avatar/AvatarDisplay';
import { ProgressRing } from '@/components/ui/ProgressRing';
import type { LevelBreakdown } from '@/lib/xp';

export function CharacterCard({
  name, level, avatarUrl,
}: {
  name: string;
  level: LevelBreakdown;
  avatarUrl: string | null;
}) {
  return (
    <section className="rounded-xl bg-bg-surface border border-border-subtle p-5">
      <div className="flex items-center gap-4">
        <div className="relative">
          <AvatarDisplay avatarUrl={avatarUrl} name={name} size="md" />
          <div className="absolute -bottom-2 -right-2">
            <ProgressRing
              pct={level.progressPct}
              size={32}
              stroke={3}
              color="#d48030"
            />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs label-mono text-text-muted">Lvl {level.level}</p>
          <h2 className="font-mono text-lg uppercase tracking-wider truncate">{name}</h2>
          <p className="text-accent-amber text-xs label-mono">{level.title}</p>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex justify-between text-[10px] label-mono text-text-muted">
          <span>{level.currentXp} XP</span>
          <span>{level.tierXpEnd ?? '∞'} XP</span>
        </div>
        <div className="h-2 bg-bg-elevated rounded mt-1 overflow-hidden">
          <div
            className="h-full bg-accent-amber transition-all duration-500"
            style={{ width: `${Math.min(100, level.progressPct)}%` }}
          />
        </div>
        {level.tierXpEnd && (
          <p className="text-text-muted text-[10px] label-mono mt-1">
            {level.xpToNextTier} XP to next tier
          </p>
        )}
      </div>
    </section>
  );
}
```

- [ ] **Schritt 2: DashboardPage — avatarUrl weitergeben**

In `app/(app)/dashboard/page.tsx` folgende Zeile suchen:

```tsx
      <CharacterCard name={profile.display_name ?? 'Traveler'} level={level} />
```

Ersetzen durch:

```tsx
      <CharacterCard
        name={profile.display_name ?? 'Traveler'}
        level={level}
        avatarUrl={profile.avatar_url ?? null}
      />
```

- [ ] **Schritt 3: Typecheck**

```bash
npm run typecheck
```

Erwartete Ausgabe: Keine Fehler — `profile.avatar_url` ist durch Task 2 + 10 bereits typisiert.

- [ ] **Schritt 4: Commit**

```bash
git add components/dashboard/CharacterCard.tsx app/(app)/dashboard/page.tsx
git commit -m "feat(avatar): wire AvatarDisplay into CharacterCard"
```

---

## Task 12: ProfileHero + ProfilePage — PixelSprite → AvatarDisplay

**Files:**
- Modify: `components/profile/ProfileHero.tsx`
- Modify: `app/(app)/profile/page.tsx`

- [ ] **Schritt 1: ProfileHero anpassen**

`components/profile/ProfileHero.tsx` komplett ersetzen:

```tsx
// components/profile/ProfileHero.tsx
import Link from 'next/link';
import { AvatarDisplay } from '@/components/avatar/AvatarDisplay';
import type { LevelBreakdown } from '@/lib/xp';

export function ProfileHero({
  name, level, stats, avatarUrl,
}: {
  name: string;
  level: LevelBreakdown;
  stats: { continents: number; countries: number; cities: number };
  avatarUrl: string | null;
}) {
  return (
    <section className="rounded-xl bg-bg-surface border border-border-subtle p-6 text-center">
      <div className="flex justify-center">
        <AvatarDisplay avatarUrl={avatarUrl} name={name} size="lg" />
      </div>
      <h1 className="mt-4 font-mono uppercase tracking-wider text-xl">{name}</h1>
      <p className="text-accent-amber text-xs label-mono mt-1">
        Lvl {level.level} · {level.title}
      </p>

      <div className="mt-4">
        <div className="h-2 bg-bg-elevated rounded overflow-hidden">
          <div className="h-full bg-accent-amber" style={{ width: `${Math.min(100, level.progressPct)}%` }} />
        </div>
        <p className="text-text-muted text-[10px] label-mono mt-1">
          {level.currentXp} / {level.tierXpEnd ?? '∞'} XP
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-5 text-xs label-mono">
        <div>
          <div className="font-mono text-2xl text-accent-blue">{stats.continents}</div>
          <div className="text-text-muted">Continents</div>
        </div>
        <div>
          <div className="font-mono text-2xl text-accent-amber">{stats.countries}</div>
          <div className="text-text-muted">Countries</div>
        </div>
        <div>
          <div className="font-mono text-2xl text-accent-green">{stats.cities}</div>
          <div className="text-text-muted">Cities</div>
        </div>
      </div>

      <Link
        href="/profile/avatar"
        className="inline-block mt-4 text-xs label-mono text-accent-blue hover:underline"
      >
        {avatarUrl ? 'Avatar ändern →' : 'Pixel-Avatar erstellen →'}
      </Link>
    </section>
  );
}
```

- [ ] **Schritt 2: ProfilePage — avatarUrl + getAvatarSignedUrl integrieren**

`app/(app)/profile/page.tsx` komplett ersetzen:

```tsx
// app/(app)/profile/page.tsx
import { ensureUserProfile, getUserStats, listUserAchievements } from '@/lib/data/queries';
import { calcLevel } from '@/lib/xp';
import { requireUserId } from '@/lib/auth/current-user';
import { getAvatarSignedUrl } from '@/lib/avatar/storage';
import { ProfileHero } from '@/components/profile/ProfileHero';
import { CustomizationSlots } from '@/components/profile/CustomizationSlots';
import { AchievementsStrip } from '@/components/profile/AchievementsStrip';
import { SignOutButton } from '@/components/auth/SignOutButton';
import { createCookieClient } from '@/lib/supabase/cookie-client';

export default async function ProfilePage() {
  const userId = await requireUserId();
  const sb = await createCookieClient();
  const { data: { user } } = await sb.auth.getUser();
  const [profile, stats, ach, avatarUrl] = await Promise.all([
    ensureUserProfile(userId),
    getUserStats(userId),
    listUserAchievements(userId),
    getAvatarSignedUrl(userId),
  ]);
  const level = calcLevel(stats.xpTotal);

  return (
    <div className="space-y-4">
      <ProfileHero
        name={profile.display_name ?? 'Traveler'}
        level={level}
        stats={{ continents: stats.continentCount, countries: stats.countryCount, cities: stats.cityCount }}
        avatarUrl={avatarUrl}
      />
      <CustomizationSlots />
      <AchievementsStrip unlocked={new Set(ach)} />

      <section className="rounded-xl bg-bg-surface border border-border-subtle p-4 space-y-3">
        <h2 className="text-xs label-mono text-text-muted">Account</h2>
        {user?.email && (
          <p className="text-text-secondary text-sm">
            Signed in as <span className="text-text-primary">{user.email}</span>
          </p>
        )}
        <SignOutButton />
      </section>
    </div>
  );
}
```

- [ ] **Schritt 3: Typecheck + Tests**

```bash
npm run typecheck && npm test
```

Erwartete Ausgabe: Typecheck sauber, alle Tests grün.

- [ ] **Schritt 4: Commit**

```bash
git add components/profile/ProfileHero.tsx app/(app)/profile/page.tsx
git commit -m "feat(avatar): wire AvatarDisplay into ProfileHero with avatar-link"
```

---

## Task 13: End-to-End-Verifikation

- [ ] **Schritt 1: Dev-Server starten**

```bash
npm run dev
```

- [ ] **Schritt 2: Manuell testen**

Folgende Journey durchlaufen:

1. `/profile` öffnen → Fallback-Avatar (Initials) erscheint, "Pixel-Avatar erstellen →"-Link sichtbar
2. Link klickt → `/profile/avatar` öffnet
3. Foto hochladen → Button "Pixel-Avatar generieren" klicken
4. Ladezustand erscheint ("KI arbeitet… 10–30 Sekunden")
5. Nach Generierung: Avatar erscheint als Vorschau
6. `/profile` neu laden → neuer Avatar in ProfileHero sichtbar
7. `/dashboard` öffnen → Avatar in CharacterCard sichtbar
8. Nochmal `/profile/avatar` → "Retry"-Button erscheint (1 Generierung verbraucht)
9. Retry durchführen → neuer Avatar
10. Nochmal `/profile/avatar` → "Limit erreicht"-Meldung erscheint

- [ ] **Schritt 3: Alle Tests ausführen**

```bash
npm test
```

Erwartete Ausgabe: Alle Tests grün, inkl. `rate-limit.test.ts` (5 Tests).

- [ ] **Schritt 4: Final-Commit**

```bash
git add .
git commit -m "feat(sprint-9): KI-Avatar-System komplett — Generierung, Rate-Limit, Storage, UI"
```

---

## Spec-Abgleich

| Spec-Anforderung | Task |
|---|---|
| Foto-Upload-Flow (Upload → Replicate) | Task 4, 6 |
| Rate-Limiting: 1x/Monat + 1 Retry | Task 3 |
| Avatar in Supabase Storage speichern | Task 5 |
| Avatar auf Dashboard + Profil anzeigen | Task 11, 12 |
| Fallback wenn kein Foto vorhanden | Task 7 |
| PixelSprite-Placeholder entfernt | Task 11, 12 |
| Storage RLS (nur eigener Avatar lesbar) | Task 1 |

Alle Spec-Anforderungen für Sprint 9 sind abgedeckt.
