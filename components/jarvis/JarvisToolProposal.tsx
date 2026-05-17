'use client';

import { useState } from 'react';

type Params = Record<string, string | undefined>;

interface Props {
  tool: string;
  params: Params;
  onConfirm: (params: Params) => Promise<void>;
  onReject: () => void;
}

const TOOL_LABELS: Record<string, string> = {
  create_task:      'Aufgabe erstellen',
  create_wiki_page: 'Wiki-Seite erstellen',
};

const PARAM_LABELS: Record<string, string> = {
  title:    'Titel',
  area:     'Bereich',
  priority: 'Priorität',
  deadline: 'Fällig am',
  notes:    'Notizen',
  content:  'Inhalt',
  category: 'Kategorie',
};

const PRIORITY_LABELS: Record<string, string> = {
  high:   '● Hoch',
  medium: '● Mittel',
  low:    '● Niedrig',
};

const PRIORITY_COLORS: Record<string, string> = {
  high:   'text-red-400',
  medium: 'text-amber-400',
  low:    'text-green-400',
};

export function JarvisToolProposal({ tool, params, onConfirm, onReject }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    await onConfirm(params);
    setLoading(false);
  }

  const entries = Object.entries(params).filter(([, v]) => v != null && v !== '');

  return (
    <div
      className="rounded-xl border border-[#40a0d0]/25 overflow-hidden text-left"
      style={{ background: 'rgba(13,32,53,0.65)' }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-3 py-2 border-b border-[#40a0d0]/15"
        style={{ background: 'rgba(64,160,208,0.07)' }}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-[#40a0d0]/60 shrink-0" />
        <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-[#40a0d0]/60">
          Jarvis schlägt vor ·
        </span>
        <span className="font-mono text-[10px] tracking-wider text-[#40a0d0] font-medium">
          {TOOL_LABELS[tool] ?? tool}
        </span>
      </div>

      {/* Params */}
      <div className="px-3 py-3 space-y-2">
        {entries.map(([key, val]) => (
          <div key={key} className="flex gap-3 items-start">
            <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider pt-0.5 w-14 shrink-0">
              {PARAM_LABELS[key] ?? key}
            </span>
            <span
              className={[
                'text-xs leading-snug flex-1',
                key === 'priority'
                  ? (PRIORITY_COLORS[val!] ?? 'text-text-secondary')
                  : 'text-text-secondary',
              ].join(' ')}
            >
              {key === 'priority'
                ? (PRIORITY_LABELS[val!] ?? val)
                : key === 'content' && val!.length > 110
                ? val!.slice(0, 110) + '…'
                : val}
            </span>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2 px-3 py-2.5 border-t border-[#40a0d0]/10">
        <button
          type="button"
          onClick={handleConfirm}
          disabled={loading}
          className="flex-1 rounded-lg py-2 text-[11px] font-mono tracking-wider border border-[#40a0d0]/35 text-[#40a0d0] hover:bg-[#40a0d0]/15 disabled:opacity-40 transition-all"
          style={{ background: 'rgba(64,160,208,0.08)' }}
        >
          {loading ? '···' : '✓  Ja, mach das'}
        </button>
        <button
          type="button"
          onClick={onReject}
          disabled={loading}
          className="flex-1 rounded-lg py-2 text-[11px] font-mono tracking-wider border border-border-subtle text-text-muted hover:text-text-secondary disabled:opacity-40 transition-all"
        >
          ✗  Nein danke
        </button>
      </div>
    </div>
  );
}
