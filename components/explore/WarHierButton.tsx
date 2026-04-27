'use client';

import { useState, useTransition } from 'react';
import { markCityVisited } from '@/lib/actions/visits';

export function WarHierButton({
  cityId, alreadyTracked,
}: { cityId: string; alreadyTracked: boolean }) {
  const [hintOpen, setHintOpen] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');
  const [pending, start] = useTransition();
  const [done, setDone] = useState(alreadyTracked);

  function onTrack() {
    start(async () => {
      const res = await markCityVisited({
        cityId,
        startDate: startDate || null,
        endDate: endDate || null,
        notes: notes.trim() || null,
      });
      setDone(true);
      if (res.alreadyTracked) {
        // No XP awarded; UI still shows "✓ Visited".
      }
    });
  }

  if (done) {
    return (
      <div className="rounded-xl bg-accent-green/15 border border-accent-green/30 px-4 py-6 text-center">
        <p className="text-accent-green text-lg font-sans">✓ You&apos;ve been here</p>
        <p className="text-text-muted text-xs mt-1">+10 XP added to your journey</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={onTrack}
        disabled={pending}
        className="w-full rounded-xl bg-accent-blue text-bg-base font-sans text-base font-semibold py-4 hover:bg-accent-blue/90 transition-colors disabled:opacity-50"
      >
        {pending ? 'Tracking…' : 'War hier (+10 XP)'}
      </button>

      <button
        type="button"
        onClick={() => setHintOpen((x) => !x)}
        className="w-full text-left text-xs text-text-secondary border border-border-subtle rounded-lg px-3 py-2 hover:bg-bg-elevated"
      >
        {hintOpen ? '−' : '+'} Add date or notes — earns a journal stamp (+5 XP)
      </button>

      {hintOpen && (
        <div className="space-y-2 rounded-lg bg-bg-elevated border border-border-subtle p-3">
          <div className="grid grid-cols-2 gap-2">
            <label className="text-xs label-mono text-text-muted">
              From
              <input
                type="date" value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="block w-full mt-1 bg-bg-surface border border-border-subtle rounded px-2 py-1 text-text-primary text-sm"
              />
            </label>
            <label className="text-xs label-mono text-text-muted">
              To
              <input
                type="date" value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="block w-full mt-1 bg-bg-surface border border-border-subtle rounded px-2 py-1 text-text-primary text-sm"
              />
            </label>
          </div>
          <label className="block text-xs label-mono text-text-muted">
            Notes
            <textarea
              value={notes} maxLength={500}
              onChange={(e) => setNotes(e.target.value)}
              className="block w-full mt-1 bg-bg-surface border border-border-subtle rounded px-2 py-1 text-text-primary text-sm h-20"
              placeholder="What stood out?"
            />
          </label>
        </div>
      )}
    </div>
  );
}
