import Link from "next/link";

// ─── Sub-components ───────────────────────────────────────────────────────────

interface KpiCardProps {
  label: string;
  value: string | number;
  sub?: string;
  accent?: boolean;
}

function KpiCard({ label, value, sub, accent }: KpiCardProps) {
  return (
    <div
      className={`rounded-xl p-6 ring-1 ${
        accent
          ? "bg-brand-700 ring-brand-600 text-white"
          : "bg-white ring-stone-200"
      }`}
    >
      <p
        className={`text-xs font-medium uppercase tracking-widest mb-1 font-sans ${
          accent ? "text-sky-200" : "text-stone-400"
        }`}
      >
        {label}
      </p>
      <p
        className={`font-display text-4xl ${
          accent ? "text-white" : "text-stone-900"
        }`}
      >
        {value}
      </p>
      {sub && (
        <p
          className={`mt-1 text-xs font-sans ${
            accent ? "text-sky-200" : "text-stone-400"
          }`}
        >
          {sub}
        </p>
      )}
    </div>
  );
}

function QuickActionButton({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-lg border border-stone-200 bg-white px-4 py-3 text-sm font-medium text-stone-700 hover:bg-stone-50 hover:border-stone-300 transition-all cursor-pointer group"
    >
      <span className="text-brand-700 group-hover:text-brand-800 transition-colors">
        {icon}
      </span>
      {label}
    </Link>
  );
}

// ─── Icon helpers ─────────────────────────────────────────────────────────────

function PlusIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}

function MapIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.159.69.159 1.006 0Z" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
    </svg>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({
  title,
  description,
  actionHref,
  actionLabel,
}: {
  title: string;
  description: string;
  actionHref: string;
  actionLabel: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="h-12 w-12 rounded-full bg-stone-100 flex items-center justify-center mb-4">
        <svg className="h-6 w-6 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
        </svg>
      </div>
      <p className="text-stone-700 font-medium font-sans mb-1">{title}</p>
      <p className="text-stone-400 text-sm font-sans mb-4 max-w-xs">{description}</p>
      <Link
        href={actionHref}
        className="inline-flex items-center gap-1.5 rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white hover:bg-brand-800 transition-colors cursor-pointer"
      >
        {actionLabel}
      </Link>
    </div>
  );
}

// ─── Dashboard Page ───────────────────────────────────────────────────────────

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl text-stone-900">Dashboard</h1>
          <p className="mt-1 text-stone-500 font-sans text-sm">
            Your travel progress at a glance.
          </p>
        </div>
        <Link
          href="/trips"
          className="hidden sm:inline-flex items-center gap-1.5 rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white hover:bg-brand-800 transition-colors cursor-pointer"
        >
          <PlusIcon />
          Plan a trip
        </Link>
      </div>

      {/* KPI row */}
      <section aria-label="Key stats">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            label="Explorer Score"
            value="—"
            sub="Start logging cities"
            accent
          />
          <KpiCard label="Cities Visited" value="—" />
          <KpiCard label="Countries" value="—" />
          <KpiCard label="Continents" value="—" />
        </div>
      </section>

      {/* Quick actions */}
      <section aria-labelledby="actions-heading">
        <h2 id="actions-heading" className="text-sm font-medium text-stone-500 uppercase tracking-widest mb-3 font-sans">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <QuickActionButton
            href="/map"
            icon={<MapIcon />}
            label="Log a city visit"
          />
          <QuickActionButton
            href="/trips"
            icon={<PlusIcon />}
            label="Create a trip"
          />
          <QuickActionButton
            href="/map"
            icon={<StarIcon />}
            label="Browse quests"
          />
        </div>
      </section>

      {/* Two-column section: Recent quests + Upcoming trips */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent quests */}
        <section
          aria-labelledby="quests-heading"
          className="rounded-xl bg-white ring-1 ring-stone-200"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
            <h2 id="quests-heading" className="font-semibold text-stone-900 font-sans">
              Recent Quests
            </h2>
            <span className="text-xs text-stone-400 font-sans">Sprint 3</span>
          </div>
          <EmptyState
            title="No quests yet"
            description="Log a city visit first, then browse and complete city quests."
            actionHref="/map"
            actionLabel="Browse cities"
          />
        </section>

        {/* Upcoming trips */}
        <section
          aria-labelledby="trips-heading"
          className="rounded-xl bg-white ring-1 ring-stone-200"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
            <h2 id="trips-heading" className="font-semibold text-stone-900 font-sans">
              Upcoming Trips
            </h2>
            <Link
              href="/trips"
              className="text-xs text-brand-700 hover:text-brand-800 font-medium font-sans cursor-pointer"
            >
              View all
            </Link>
          </div>
          <EmptyState
            title="No trips planned"
            description="Plan a trip with quest-aware stop lists and track progress on the go."
            actionHref="/trips"
            actionLabel="Plan first trip"
          />
        </section>
      </div>

      {/* Sprint marker */}
      <p className="text-xs text-stone-300 text-center font-sans">
        Live KPI data wired in Sprint 5 (T5.2) &middot; Quest list in Sprint 3 (T3.2)
      </p>
    </div>
  );
}
