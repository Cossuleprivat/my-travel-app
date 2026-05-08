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
