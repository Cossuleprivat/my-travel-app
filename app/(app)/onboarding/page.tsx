export default function OnboardingPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="w-full max-w-md space-y-6 text-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Welcome to Travel Scorer</h1>
          <p className="mt-3 text-slate-600">
            Let&apos;s set up your profile before you start exploring.
          </p>
        </div>

        <div className="rounded-xl border border-dashed border-slate-300 p-12 text-slate-400">
          Onboarding wizard (display name, interests, home city) — Sprint 2, T2.3
        </div>
      </div>
    </div>
  );
}
