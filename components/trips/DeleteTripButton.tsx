'use client';

import React, { useTransition } from 'react';
import { deleteTrip } from '@/lib/actions/trips';

export function DeleteTripButton({ tripId }: { tripId: string }) {
  const [pending, start] = useTransition();

  function handleClick() {
    if (!confirm('Delete this trip? This cannot be undone.')) return;
    start(() => deleteTrip(tripId));
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={handleClick}
      className="text-xs label-mono text-text-muted hover:text-red-400 transition-colors disabled:opacity-40"
    >
      {pending ? 'Deleting…' : 'Delete trip'}
    </button>
  );
}
