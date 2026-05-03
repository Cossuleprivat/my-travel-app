'use client';

import { useTransition } from 'react';
import { GiCheckMark, GiPositionMarker } from 'react-icons/gi';
import { markCountryVisited, unmarkCountryVisited } from '@/lib/actions/visits';

export function CountryVisitToggle({
  countryId, visited,
}: { countryId: string; visited: boolean }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => start(async () => {
        if (visited) await unmarkCountryVisited(countryId);
        else await markCountryVisited(countryId);
      })}
      className={[
        'rounded-lg px-3 py-2 text-xs label-mono border transition-colors',
        visited
          ? 'bg-accent-green/15 border-accent-green/30 text-accent-green'
          : 'bg-bg-elevated border-border-interactive text-accent-blue hover:bg-accent-blue/10',
        pending && 'opacity-50',
      ].filter(Boolean).join(' ')}
    >
      {pending ? '…' : visited
        ? <><GiCheckMark className="inline mr-1" />Visited</>
        : <><GiPositionMarker className="inline mr-1" />Track</>
      }
    </button>
  );
}
