'use client';

import React, { useState, useTransition } from 'react';
import { createTrip } from '@/lib/actions/trips';

export function CreateTripForm() {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full rounded-xl border border-dashed border-accent-blue/40 bg-bg-surface py-4 text-accent-blue text-sm font-sans hover:bg-bg-elevated transition-colors"
      >
        + New Trip
      </button>
    );
  }

  return (
    <div className="rounded-xl bg-bg-surface border border-border-subtle p-4 space-y-3 animate-fade-in">
      <h2 className="text-sm label-mono text-text-muted">New Trip</h2>
      <form
        action={(fd: FormData) => start(() => createTrip(fd))}
        className="space-y-3"
      >
        <label className="block text-xs label-mono text-text-muted">
          Title *
          <input
            name="title"
            required
            placeholder="e.g. Balkans 2025"
            className="block w-full mt-1 bg-bg-base border border-border-subtle rounded-lg px-3 py-2 text-text-primary text-sm focus:outline-none focus:border-accent-blue"
          />
        </label>
        <label className="block text-xs label-mono text-text-muted">
          Description
          <textarea
            name="description"
            placeholder="What's this trip about?"
            className="block w-full mt-1 bg-bg-base border border-border-subtle rounded-lg px-3 py-2 text-text-primary text-sm h-16 focus:outline-none focus:border-accent-blue"
          />
        </label>
        <div className="grid grid-cols-2 gap-2">
          <label className="text-xs label-mono text-text-muted">
            Start Date
            <input
              type="date"
              name="start_date"
              className="block w-full mt-1 bg-bg-base border border-border-subtle rounded-lg px-3 py-2 text-text-primary text-sm focus:outline-none focus:border-accent-blue"
            />
          </label>
          <label className="text-xs label-mono text-text-muted">
            End Date
            <input
              type="date"
              name="end_date"
              className="block w-full mt-1 bg-bg-base border border-border-subtle rounded-lg px-3 py-2 text-text-primary text-sm focus:outline-none focus:border-accent-blue"
            />
          </label>
        </div>
        <div className="flex gap-2 pt-1">
          <button
            type="submit"
            disabled={pending}
            className="flex-1 rounded-lg bg-accent-blue text-bg-base text-sm font-sans py-2 disabled:opacity-50"
          >
            {pending ? 'Creating…' : 'Create Trip'}
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
