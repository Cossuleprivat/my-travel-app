import { describe, it, expect } from 'vitest';
import { computeModuleStats, type ModuleStatsInput } from './module-stats';

const FIXED_NOW = new Date('2026-05-17T12:00:00Z');

const baseInput: ModuleStatsInput = {
  runLogs: [{ distance_km: 100 }, { distance_km: 27.4 }],
  games: [{ status: 'completed' }, { status: 'active' }, { status: 'pipeline' }],
  books: [
    { status: 'done', type: 'book' },
    { status: 'reading', type: 'book' },
    { status: 'done', type: 'audiobook' },
  ],
  financeMonths: [
    { kk_saldo_end: -2000, kk_free: 100 },
    { kk_saldo_end: -1240, kk_free: 380 },
  ],
  weddingTasks: [{ status: 'done' }, { status: 'open' }, { status: 'open' }],
  goals: [
    { status: 'done', xp_reward: 50 },
    { status: 'open', xp_reward: 100 },
  ],
  tasks: [{ status: 'open' }, { status: 'open' }, { status: 'done' }],
  wikiNotes: [
    { category: 'zeitlektur', lektion_nr: 1 },
    { category: 'literatur', lektion_nr: null },
  ],
};

describe('computeModuleStats', () => {
  it('sums run distance and counts days to half marathon', () => {
    const r = computeModuleStats(baseInput, FIXED_NOW);
    expect(r.sport?.headline).toBe('127.4 km gelaufen');
    expect(r.sport?.subline).toBe('161d bis Halbmarathon · Ziel: 500 km');
  });

  it('counts completed games out of total', () => {
    const r = computeModuleStats(baseInput, FIXED_NOW);
    expect(r.gaming?.headline).toBe('1/3 Spiele fertig');
  });

  it('counts done books and audiobooks separately', () => {
    const r = computeModuleStats(baseInput, FIXED_NOW);
    expect(r.reading?.headline).toBe('1/6 Bücher · 1/6 Hörbücher');
  });

  it('uses the latest finance month', () => {
    const r = computeModuleStats(baseInput, FIXED_NOW);
    expect(r.finance?.headline).toContain('-1.240');
    expect(r.finance?.subline).toContain('380');
  });

  it('falls back when no finance month exists', () => {
    const r = computeModuleStats({ ...baseInput, financeMonths: [] }, FIXED_NOW);
    expect(r.finance?.headline).toBe('Noch kein Snapshot');
  });

  it('counts wedding tasks and days to Standesamt', () => {
    const r = computeModuleStats(baseInput, FIXED_NOW);
    expect(r.wedding?.headline).toBe('1/3 Tasks erledigt');
    expect(r.wedding?.subline).toBe('Standesamt in 146 Tagen');
  });

  it('sums goal XP done vs total', () => {
    const r = computeModuleStats(baseInput, FIXED_NOW);
    expect(r.goals?.headline).toBe('50 / 150 XP');
    expect(r.goals?.subline).toBe('1/2 Ziele erreicht');
  });

  it('counts open vs done tasks', () => {
    const r = computeModuleStats(baseInput, FIXED_NOW);
    expect(r.tasks?.headline).toBe('2 offen');
    expect(r.tasks?.subline).toBe('1/3 erledigt');
  });

  it('counts wiki notes and zeitlektüren', () => {
    const r = computeModuleStats(baseInput, FIXED_NOW);
    expect(r.wiki?.headline).toBe('2 Notizen');
    expect(r.wiki?.subline).toBe('1 Zeitlektüren · L1–L17');
  });

  it('handles all-empty input without throwing', () => {
    const empty: ModuleStatsInput = {
      runLogs: [], games: [], books: [], financeMonths: [],
      weddingTasks: [], goals: [], tasks: [], wikiNotes: [],
    };
    const r = computeModuleStats(empty, FIXED_NOW);
    expect(r.sport?.headline).toBe('0.0 km gelaufen');
    expect(r.gaming?.headline).toBe('0/0 Spiele fertig');
  });
});
