import { redirect } from 'next/navigation';
import { requireUserId } from '@/lib/auth/current-user';
import { ensureUserProfile } from '@/lib/data/queries';
import { completeOnboarding } from '@/lib/actions/profile';

const INTERESTS = [
  { value: 'history', label: 'History & Culture' },
  { value: 'nature', label: 'Nature & Outdoors' },
  { value: 'food', label: 'Food & Drink' },
  { value: 'architecture', label: 'Architecture' },
  { value: 'adventure', label: 'Adventure Sports' },
  { value: 'art', label: 'Art & Museums' },
  { value: 'nightlife', label: 'Nightlife' },
  { value: 'beaches', label: 'Beaches' },
];

export default async function OnboardingPage() {
  const userId = await requireUserId();
  const profile = await ensureUserProfile(userId);

  // Already onboarded (has a real display name set by user)
  if (profile.display_name && profile.display_name !== 'Traveler') {
    redirect('/dashboard');
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <div className="w-full max-w-md space-y-6">
        <header className="text-center">
          <div className="text-4xl mb-3">🌍</div>
          <h1 className="font-sans text-2xl text-text-primary">Welcome, Explorer!</h1>
          <p className="text-text-secondary text-sm mt-2">
            Let&apos;s set up your traveler profile.
          </p>
        </header>

        <form action={completeOnboarding} className="space-y-5">
          {/* Display name */}
          <label className="block text-xs label-mono text-text-muted">
            Your name *
            <input
              name="display_name"
              required
              placeholder="e.g. Alex the Explorer"
              defaultValue=""
              className="block w-full mt-1 bg-bg-surface border border-border-subtle rounded-xl px-4 py-3 text-text-primary text-base focus:outline-none focus:border-accent-blue"
            />
          </label>

          {/* Travel interests */}
          <fieldset>
            <legend className="text-xs label-mono text-text-muted mb-2">
              Travel interests (pick any)
            </legend>
            <div className="grid grid-cols-2 gap-2">
              {INTERESTS.map((i) => (
                <label
                  key={i.value}
                  className="flex items-center gap-2 rounded-lg bg-bg-surface border border-border-subtle px-3 py-2 cursor-pointer hover:border-accent-blue/40 transition-colors has-[:checked]:border-accent-blue has-[:checked]:bg-accent-blue/10"
                >
                  <input
                    type="checkbox"
                    name="interests"
                    value={i.value}
                    className="accent-accent-blue"
                  />
                  <span className="text-text-secondary text-sm">{i.label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          {/* Home city */}
          <label className="block text-xs label-mono text-text-muted">
            Home city slug <span className="text-text-muted">(optional)</span>
            <input
              name="home_city_slug"
              placeholder="e.g. berlin, vienna, tokyo"
              className="block w-full mt-1 bg-bg-surface border border-border-subtle rounded-xl px-4 py-3 text-text-primary text-base focus:outline-none focus:border-accent-blue"
            />
            <span className="text-text-muted text-xs mt-1 block">Find the slug in the Explore page URL.</span>
          </label>

          <button
            type="submit"
            className="w-full rounded-xl bg-accent-blue text-bg-base font-sans text-base font-semibold py-3 hover:bg-accent-blue/90 transition-colors"
          >
            Start exploring →
          </button>
        </form>
      </div>
    </div>
  );
}
