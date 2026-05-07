'use client';

import React, { useState, useTransition } from 'react';
import { addTripStop } from '@/lib/actions/trips';

export function AddStopForm({ tripId }: { tripId: string }) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [citySlug, setCitySlug] = useState('');

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full rounded-xl border border-dashed border-border-interactive/50 bg-bg-surface py-3 text-text-secondary text-sm hover:bg-bg-elevated transition-colors"
      >
        + Add Stop
      </button>
    );
  }

  return (
    <div className="rounded-xl bg-bg-surface border border-border-subtle p-4 space-y-3 animate-fade-in">
      <h3 className="text-xs label-mono text-text-muted">Add City Stop</h3>
      <form
        action={(fd: FormData) => {
          start(async () => {
            await addTripStop(tripId, fd);
            setOpen(false);
            setCitySlug('');
          });
        }}
        className="space-y-3"
      >
        <label className="block text-xs label-mono text-text-muted">
          City Slug *
          <input
            name="city_slug"
            required
            value={citySlug}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCitySlug(e.target.value)}
            placeholder="e.g. paris, berlin, tokyo"
            className="block w-full mt-1 bg-bg-base border border-border-subtle rounded-lg px-3 py-2 text-text-primary text-sm focus:outline-none focus:border-accent-blue"
          />
          <span className="text-text-muted text-xs mt-1 block">Use the URL slug from the Explore page.</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          <label className="text-xs label-mono text-text-muted">
            Arrival
            <input
              type="date"
              name="arrival_date"
              className="block w-full mt-1 bg-bg-base border border-border-subtle rounded-lg px-3 py-2 text-text-primary text-sm"
            />
          </label>
          <label className="text-xs label-mono text-text-muted">
            Departure
            <input
              type="date"
              name="departure_date"
              className="block w-full mt-1 bg-bg-base border border-border-subtle rounded-lg px-3 py-2 text-text-primary text-sm"
            />
          </label>
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={pending}
            className="flex-1 rounded-lg bg-accent-blue text-bg-base text-sm font-sans py-2 disabled:opacity-50"
          >
            {pending ? 'Adding…' : 'Add Stop'}
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex-1 rounded-lg border border-border-subtle text-text-secondary text-sm py-2 hover:bg-bg-elevated"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
