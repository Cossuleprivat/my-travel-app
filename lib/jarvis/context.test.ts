import { describe, it, expect } from 'vitest';
import { formatJarvisContext, type JarvisSnapshot } from './context';

const FIXED_NOW = new Date('2026-05-17T12:00:00Z');

const snap: JarvisSnapshot = {
  openTasks: [
    { title: 'Steuer 2025', area: 'finance', deadline: '2026-05-01' },
    { title: 'Trauzeugen fragen', area: 'wedding', deadline: '2026-05-20' },
  ],
  openTaskCount: 7,
  totalKm: 127.4,
  doneBooks: 1,
  doneAudiobooks: 0,
  doneGames: 2,
  gamesTotal: 10,
  weddingDone: 4,
  weddingTotal: 12,
  financeKkSaldo: -1240,
  financeKkFree: 380,
  goalsDoneXp: 50,
  goalsTotalXp: 150,
};

describe('formatJarvisContext', () => {
  it('produces a compact German status block', () => {
    const out = formatJarvisContext(snap, FIXED_NOW);
    expect(out).toContain('Aktueller Stand (live)');
    expect(out).toContain('7 offen');
    expect(out).toContain('Steuer 2025');
    expect(out).toContain('127.4 / 500 km');
    expect(out).toContain('161 Tage bis Halbmarathon');
    expect(out).toContain('146 Tage bis Standesamt');
    expect(out).toContain('1/6 Bücher');
    expect(out).toContain('2/10 Spiele');
  });

  it('marks overdue tasks relative to now', () => {
    const out = formatJarvisContext(snap, FIXED_NOW);
    expect(out).toMatch(/Steuer 2025.*überfällig/);
  });

  it('handles empty task list without throwing', () => {
    const out = formatJarvisContext(
      { ...snap, openTasks: [], openTaskCount: 0 },
      FIXED_NOW,
    );
    expect(out).toContain('0 offen');
    expect(out).toContain('Aktueller Stand (live)');
  });
});
