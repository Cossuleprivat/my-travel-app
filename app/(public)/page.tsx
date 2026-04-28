import Link from "next/link";

export default function LandingPage() {
  const features = [
    {
      title: "Track Your Travels",
      description:
        "Log every city you've explored. Watch your world map fill up as you add visits — with dates, notes, and memories attached.",
    },
    {
      title: "Complete City Quests",
      description:
        "Each city has curated quests — landmarks, local restaurants, hidden gems. Tick them off as you go to earn XP.",
    },
    {
      title: "Plan Smarter Trips",
      description:
        "Build itineraries with quest-aware stop lists. Know what's worth doing at each city before you arrive.",
    },
  ];

  const stats = [
    { value: "180+", label: "Countries" },
    { value: "10k+", label: "Cities" },
    { value: "50k+", label: "Quests" },
    { value: "4", label: "Categories" },
  ];

  return (
    <main id="main" className="bg-bg-base text-text-primary">
      {/* Hero */}
      <section className="border-b border-border-subtle">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-bg-surface border border-border-subtle px-3.5 py-1.5 text-xs label-mono text-accent-blue mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-accent-blue" aria-hidden="true" />
              Travel tracking, gamified
            </div>

            <h1 className="font-sans text-4xl sm:text-5xl text-text-primary leading-tight mb-6">
              Turn every trip into a story{" "}
              <span className="text-accent-amber">worth completing.</span>
            </h1>

            <p className="text-text-secondary text-lg leading-relaxed mb-8 max-w-lg">
              Track visited cities, complete local quests, and level up a pixel
              character along the way.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              {/* AUTH BYPASS: links go to /dashboard until real auth is implemented */}
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent-blue px-6 py-3.5 text-base font-medium text-bg-base hover:bg-accent-blue/90 transition-colors"
              >
                Start for free →
              </Link>
              <Link
                href="/explore"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-border-interactive bg-bg-surface px-6 py-3.5 text-base font-medium text-text-primary hover:bg-bg-elevated transition-colors"
              >
                Explore the world
              </Link>
            </div>

            <p className="mt-4 text-xs label-mono text-text-muted">
              No credit card required · Auth coming in Session 05
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-b border-border-subtle" aria-labelledby="features-heading">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="text-center mb-12">
            <h2
              id="features-heading"
              className="font-sans text-2xl sm:text-3xl text-text-primary mb-4"
            >
              Everything a traveler needs
            </h2>
            <p className="text-text-secondary max-w-2xl mx-auto">
              From logging your first visit to completing every quest in a city.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-xl bg-bg-surface border border-border-subtle p-6"
              >
                <h3 className="font-mono uppercase tracking-wider text-sm text-accent-blue mb-2">
                  {f.title}
                </h3>
                <p className="text-text-secondary text-sm leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-border-subtle" aria-labelledby="stats-heading">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <h2 id="stats-heading" className="sr-only">Platform statistics</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="font-mono text-3xl sm:text-4xl text-accent-amber mb-1">
                  {value}
                </p>
                <p className="text-text-muted text-xs label-mono">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section aria-labelledby="cta-heading">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
          <h2
            id="cta-heading"
            className="font-sans text-3xl sm:text-4xl text-text-primary mb-4"
          >
            Start your travel story today.
          </h2>
          <p className="text-text-secondary mb-8">
            Join travelers who track their journeys, complete city quests, and
            plan smarter trips.
          </p>
          {/* AUTH BYPASS: link goes to /dashboard until real auth is implemented */}
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent-blue px-8 py-4 text-lg font-medium text-bg-base hover:bg-accent-blue/90 transition-colors"
          >
            Open the dashboard →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border-subtle bg-bg-surface text-text-muted">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-md bg-accent-blue flex items-center justify-center">
                <span className="font-mono text-xs font-bold text-bg-base">TS</span>
              </div>
              <span className="text-sm font-mono uppercase tracking-wider text-text-secondary">
                Travel Scorer
              </span>
            </div>
            <p className="text-xs label-mono">
              &copy; {new Date().getFullYear()} Travel Scorer · MVP in progress
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
