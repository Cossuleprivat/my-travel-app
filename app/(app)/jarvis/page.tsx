import { requireUserId } from '@/lib/auth/current-user';
import { ensureUserProfile } from '@/lib/data/queries';
import { JarvisFullChat } from '@/components/jarvis/JarvisFullChat';

export default async function JarvisPage() {
  const userId  = await requireUserId();
  const profile = await ensureUserProfile(userId);
  const name    = profile.display_name ?? 'Traveler';

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4">
        <div
          className="h-10 w-10 rounded-full border border-[#40a0d0]/40 flex items-center justify-center shrink-0"
          style={{ background: 'radial-gradient(circle, #0d2035 0%, #060c14 100%)', boxShadow: '0 0 12px rgba(64,160,208,0.15)' }}
        >
          <span className="font-mono text-sm font-bold text-[#40a0d0]">J</span>
        </div>
        <div>
          <h1 className="font-mono text-base uppercase tracking-widest text-text-primary">
            Jarvis
          </h1>
          <p className="text-[10px] font-mono text-[#40a0d0]/50 tracking-widest">
            ● Persönlicher Assistent
          </p>
        </div>
      </div>

      <JarvisFullChat userName={name} />
    </div>
  );
}
