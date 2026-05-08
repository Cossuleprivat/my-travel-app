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
