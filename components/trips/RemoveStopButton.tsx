'use client';

import React, { useTransition } from 'react';
import { removeTripStop } from '@/lib/actions/trips';

export function RemoveStopButton({ tripId, stopId }: { tripId: string; stopId: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => start(() => removeTripStop(tripId, stopId))}
      className="text-xs text-text-muted hover:text-red-400 transition-colors disabled:opacity-40 label-mono"
    >
      {pending ? '…' : 'Remove'}
    </button>
  );
}
