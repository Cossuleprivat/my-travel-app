// Trips list page — skeleton for Sprint 4 (T4.1)
// Full CRUD implementation: trips table, create/edit forms, stop management.

import Link from "next/link";

function PlusIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
    </svg>
  );
}

export default function TripsPage() {
  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-stone-900">My Trips</h1>
          <p className="mt-1 text-stone-500 font-sans text-sm">
            Plan and track your travel itineraries.
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-lg bg-brand-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-800 transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700"
          aria-label="Create a new trip"
        >
          <PlusIcon />
          <span>Create trip</span>
        </button>
      </div>

      {/* Filter tabs — placeholder */}
      <div className="flex gap-1 border-b border-stone-200">
        {["All", "Upcoming", "Past"].map((tab, i) => (
          <button
            key={tab}
            type="button"
            className={`px-4 py-2.5 text-sm font-medium font-sans border-b-2 -mb-px transition-colors ${
              i === 0
                ? "border-brand-700 text-brand-700"
                : "border-transparent text-stone-500 hover:text-stone-700 cursor-pointer"
            }`}
            aria-selected={i === 0}
            role="tab"
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Empty state */}
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-stone-200 bg-white py-20 text-center">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-stone-50 ring-1 ring-stone-200 text-stone-400 mb-4">
          <CalendarIcon />
        </div>
        <h2 className="text-lg font-semibold text-stone-900 font-sans mb-2">
          No trips yet
        </h2>
        <p className="text-stone-500 text-sm font-sans max-w-xs mb-6 leading-relaxed">
          Create your first trip to start planning stops, attaching quests, and tracking what you get done.
        </p>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-lg bg-brand-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-800 transition-colors cursor-pointer"
        >
          <PlusIcon />
          Plan first trip
        </button>
      </div>

      {/* Sprint marker */}
      <p className="text-xs text-stone-300 text-center font-sans">
        Trip CRUD and stop management — Sprint 4 (T4.1 / T4.2)
      </p>
    </div>
  );
}
