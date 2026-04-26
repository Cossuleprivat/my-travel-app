import Link from "next/link";

// ─── SVG Icons ────────────────────────────────────────────────────────────────

function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
      />
    </svg>
  );
}

function TrophyIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 0 1 2.916.52 6.003 6.003 0 0 1-5.395 4.972m0 0a6.726 6.726 0 0 1-2.749 1.35m0 0a6.772 6.772 0 0 1-3.044 0"
      />
    </svg>
  );
}

function RouteIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.159.69.159 1.006 0Z"
      />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2.5}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

// ─── Hero Preview Card ────────────────────────────────────────────────────────

function HeroPreviewCard() {
  const quests = [
    { name: "Eiffel Tower", done: true },
    { name: "Louvre Museum", done: true },
    { name: "Sagrada Família", done: false },
  ];

  return (
    <div className="relative rounded-2xl bg-white shadow-xl ring-1 ring-stone-200/80 p-6 max-w-xs mx-auto animate-fade-in">
      {/* Decorative accent */}
      <div className="absolute -top-px left-8 right-8 h-0.5 bg-gradient-to-r from-brand-700 via-sky-400 to-brand-700 rounded-full" />

      {/* User header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="h-9 w-9 rounded-full bg-brand-700 flex items-center justify-center flex-shrink-0">
          <span className="text-white text-sm font-semibold font-sans">A</span>
        </div>
        <div>
          <p className="text-sm font-semibold text-stone-900">Alex Explorer</p>
          <p className="text-xs text-stone-400">Global Level 3</p>
        </div>
        <div className="ml-auto">
          <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-amber-200">
            Active
          </span>
        </div>
      </div>

      {/* Explorer Score */}
      <div className="mb-4">
        <p className="text-xs font-medium text-stone-400 uppercase tracking-widest mb-1">
          Explorer Score
        </p>
        <div className="flex items-baseline gap-1.5">
          <span className="font-display text-4xl text-brand-700">76.5</span>
          <span className="text-stone-400 text-sm font-sans">/ 100</span>
        </div>
        <div className="mt-2 h-2 bg-stone-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-brand-700 to-sky-400 rounded-full transition-all"
            style={{ width: "76.5%" }}
            role="progressbar"
            aria-valuenow={76.5}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Explorer score: 76.5 out of 100"
          />
        </div>
      </div>

      {/* KPI chips */}
      <div className="grid grid-cols-3 gap-2 mb-5">
        {[
          { label: "Cities", value: "24" },
          { label: "Countries", value: "12" },
          { label: "Continents", value: "3" },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="rounded-lg bg-stone-50 ring-1 ring-stone-100 p-2.5 text-center"
          >
            <p className="text-lg font-semibold text-stone-900 font-sans">{value}</p>
            <p className="text-xs text-stone-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Recent quests */}
      <div>
        <p className="text-xs font-medium text-stone-400 uppercase tracking-widest mb-2.5">
          Recent Quests
        </p>
        <div className="space-y-2">
          {quests.map(({ name, done }) => (
            <div key={name} className="flex items-center gap-2.5">
              <div
                className={`h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                  done
                    ? "bg-emerald-500"
                    : "border-2 border-stone-200 bg-white"
                }`}
                aria-label={done ? "Completed" : "Not started"}
              >
                {done && <CheckIcon className="h-3 w-3 text-white" />}
              </div>
              <span
                className={`text-sm font-sans ${
                  done
                    ? "text-stone-400 line-through"
                    : "text-stone-700"
                }`}
              >
                {name}
              </span>
              {!done && (
                <span className="ml-auto text-xs text-amber-600 font-medium">Planned</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Feature Card ─────────────────────────────────────────────────────────────

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="rounded-xl bg-white ring-1 ring-stone-200 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-brand-50 text-brand-700 mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-stone-900 mb-2 font-sans">{title}</h3>
      <p className="text-stone-600 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

// ─── Landing Page ─────────────────────────────────────────────────────────────

export default function LandingPage() {
  const features = [
    {
      icon: <MapPinIcon className="h-6 w-6" />,
      title: "Track Your Travels",
      description:
        "Log every city you've explored. Watch your world map fill up as you add visits — with dates, notes, and memories attached.",
    },
    {
      icon: <TrophyIcon className="h-6 w-6" />,
      title: "Complete City Quests",
      description:
        "Each city has curated quests — landmarks, local restaurants, hidden gems, and experiences. Complete them to unlock your city score.",
    },
    {
      icon: <RouteIcon className="h-6 w-6" />,
      title: "Plan Smarter Trips",
      description:
        "Build itineraries with quest-aware stop lists. Know what's worth doing at each city before you arrive.",
    },
  ];

  const stats = [
    { value: "180+", label: "Countries in database" },
    { value: "10,000+", label: "Cities indexed" },
    { value: "50,000+", label: "Quests to complete" },
    { value: "4", label: "Quest categories" },
  ];

  return (
    <main id="main">
      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="bg-white border-b border-stone-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left: Copy */}
            <div className="animate-fade-up">
              <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3.5 py-1.5 text-sm text-brand-700 font-medium mb-6 ring-1 ring-brand-100">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-700" aria-hidden="true" />
                Travel tracking made beautiful
              </div>

              <h1 className="font-display text-5xl sm:text-6xl lg:text-5xl xl:text-6xl text-stone-900 leading-[1.1] mb-6">
                Turn every trip into a story{" "}
                <span className="text-brand-700">worth completing.</span>
              </h1>

              <p className="text-lg text-stone-600 leading-relaxed mb-8 max-w-lg">
                Track visited cities, complete local quests, and plan future
                adventures — all in one beautiful place. Your travel progress,
                gamified.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                {/* AUTH BYPASS: links go to /dashboard until real auth is implemented */}
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-700 px-6 py-3.5 text-base font-medium text-white hover:bg-brand-800 transition-colors cursor-pointer shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700"
                >
                  Start for free
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-stone-300 bg-white px-6 py-3.5 text-base font-medium text-stone-700 hover:bg-stone-50 transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-400"
                >
                  See the dashboard
                </Link>
              </div>

              <p className="mt-4 text-sm text-stone-400">
                No credit card required &middot; Auth coming soon
              </p>
            </div>

            {/* Right: Preview card */}
            <div className="lg:flex lg:justify-end">
              <HeroPreviewCard />
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section className="bg-stone-50 border-b border-stone-100" aria-labelledby="features-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
          <div className="text-center mb-12">
            <h2
              id="features-heading"
              className="font-display text-3xl sm:text-4xl text-stone-900 mb-4"
            >
              Everything a traveler needs
            </h2>
            <p className="text-stone-600 text-lg max-w-2xl mx-auto leading-relaxed">
              From logging your first visit to completing every quest in a city,
              Travel Scorer keeps your travel story organized and moving forward.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats / Social Proof ─────────────────────────────────────────── */}
      <section
        className="bg-brand-900 text-white"
        aria-labelledby="stats-heading"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <h2 id="stats-heading" className="sr-only">
            Platform statistics
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {stats.map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="font-display text-4xl sm:text-5xl text-white mb-2">
                  {value}
                </p>
                <p className="text-sky-200 text-sm font-sans">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────────────────── */}
      <section className="bg-white border-b border-stone-100" aria-labelledby="how-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
          <div className="text-center mb-12">
            <h2
              id="how-heading"
              className="font-display text-3xl sm:text-4xl text-stone-900 mb-4"
            >
              Your travel, structured
            </h2>
            <p className="text-stone-600 text-lg max-w-xl mx-auto">
              Three simple steps to turn your travels into a complete picture.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-8 relative">
            {/* Connector lines on desktop */}
            <div
              className="hidden sm:block absolute top-6 left-[calc(33.3%+1rem)] right-[calc(33.3%+1rem)] h-px bg-stone-200"
              aria-hidden="true"
            />

            {[
              {
                step: "1",
                title: "Log your cities",
                description:
                  "Search and add every city you've visited. Add dates and notes to build your travel timeline.",
              },
              {
                step: "2",
                title: "Complete quests",
                description:
                  "Browse curated quest lists per city — landmarks, food, activities. Check them off as you go.",
              },
              {
                step: "3",
                title: "Plan your next trip",
                description:
                  "Create trips with multi-city stops. See which quests are worth doing before you arrive.",
              },
            ].map(({ step, title, description }) => (
              <div key={step} className="text-center relative">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand-700 text-white font-semibold text-lg font-sans mb-4 z-10 relative">
                  {step}
                </div>
                <h3 className="text-lg font-semibold text-stone-900 mb-2 font-sans">
                  {title}
                </h3>
                <p className="text-stone-600 text-sm leading-relaxed">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────────────── */}
      <section className="bg-stone-50 border-b border-stone-100" aria-labelledby="cta-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="mx-auto max-w-2xl text-center">
            <h2
              id="cta-heading"
              className="font-display text-4xl sm:text-5xl text-stone-900 mb-6"
            >
              Start your travel story today.
            </h2>
            <p className="text-stone-600 text-lg mb-8 leading-relaxed">
              Join travelers who track their journeys, complete city quests, and
              plan smarter trips with Travel Scorer.
            </p>
            {/* AUTH BYPASS: link goes to /dashboard until real auth is implemented */}
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-700 px-8 py-4 text-lg font-medium text-white hover:bg-brand-800 transition-colors cursor-pointer shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700"
            >
              Create free account
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="bg-stone-900 text-stone-400">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-md bg-brand-700 flex items-center justify-center">
                <svg
                  className="h-3.5 w-3.5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418"
                  />
                </svg>
              </div>
              <span className="text-sm font-medium text-stone-300 font-sans">Travel Scorer</span>
            </div>
            <p className="text-sm font-sans">
              &copy; {new Date().getFullYear()} Travel Scorer. MVP v1 in progress.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
