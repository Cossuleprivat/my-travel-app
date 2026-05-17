import 'server-only';
import { createServiceClient } from '@/lib/supabase/server';

export type ModuleStat = { headline: string; subline: string } | null;
export type ModuleStatsResult = Record<string, ModuleStat>;

export type ModuleStatsInput = {
  runLogs: { distance_km: number | string | null }[];
  games: { status: string }[];
  books: { status: string; type: string }[];
  financeMonths: { kk_saldo_end: number | string | null; kk_free: number | string | null }[];
  weddingTasks: { status: string }[];
  goals: { status: string; xp_reward: number }[];
  tasks: { status: string }[];
  wikiNotes: { category: string; lektion_nr: number | null }[];
};

const HM_DATE = '2026-10-25';
const STANDESAMT_DATE = '2026-10-10';

function daysBetween(target: string, now: Date): number {
  return Math.ceil((new Date(target).getTime() - now.getTime()) / 86400000);
}

export function computeModuleStats(input: ModuleStatsInput, now: Date): ModuleStatsResult {
  const totalKm = input.runLogs.reduce((s, r) => s + Number(r.distance_km ?? 0), 0);
  const daysToHM = daysBetween(HM_DATE, now);

  const gamesCompleted = input.games.filter((g) => g.status === 'completed').length;
  const gamesTotal = input.games.length;

  const booksDone = input.books.filter((b) => b.type === 'book' && b.status === 'done').length;
  const audioDone = input.books.filter((b) => b.type === 'audiobook' && b.status === 'done').length;

  const latestMonth = input.financeMonths.at(-1);

  const wDone = input.weddingTasks.filter((t) => t.status === 'done').length;
  const wTotal = input.weddingTasks.length;
  const daysToStandesamt = daysBetween(STANDESAMT_DATE, now);

  const totalXP = input.goals.reduce((s, g) => s + g.xp_reward, 0);
  const doneXP = input.goals.filter((g) => g.status === 'done').reduce((s, g) => s + g.xp_reward, 0);
  const goalsDone = input.goals.filter((g) => g.status === 'done').length;

  const tasksRemaining = input.tasks.filter((t) => t.status !== 'done').length;
  const tasksDone = input.tasks.filter((t) => t.status === 'done').length;

  const zeitlekturen = input.wikiNotes.filter((n) => n.category === 'zeitlektur').length;
  const wikiTotal = input.wikiNotes.length;

  return {
    sport: {
      headline: `${totalKm.toFixed(1)} km gelaufen`,
      subline: `${daysToHM}d bis Halbmarathon · Ziel: 500 km`,
    },
    gaming: {
      headline: `${gamesCompleted}/${gamesTotal} Spiele fertig`,
      subline: '10-Slot Backlog · Jahresplan 2026',
    },
    reading: {
      headline: `${booksDone}/6 Bücher · ${audioDone}/6 Hörbücher`,
      subline: 'Leseplan 2026',
    },
    finance: latestMonth
      ? {
          headline: `KK ${Number(latestMonth.kk_saldo_end ?? 0).toLocaleString('de-DE')} €`,
          subline: `${Number(latestMonth.kk_free ?? 0).toLocaleString('de-DE')} € frei · Tilgungsplan aktiv`,
        }
      : {
          headline: 'Noch kein Snapshot',
          subline: 'Ersten Monatseintrag erstellen',
        },
    wedding: {
      headline: `${wDone}/${wTotal} Tasks erledigt`,
      subline: `Standesamt in ${daysToStandesamt} Tagen`,
    },
    goals: {
      headline: `${doneXP} / ${totalXP} XP`,
      subline: `${goalsDone}/${input.goals.length} Ziele erreicht`,
    },
    tasks: {
      headline: `${tasksRemaining} offen`,
      subline: `${tasksDone}/${input.tasks.length} erledigt`,
    },
    wiki: {
      headline: `${wikiTotal} Notizen`,
      subline: `${zeitlekturen} Zeitlektüren · L1–L17`,
    },
  };
}

export async function getModuleStats(userId: string): Promise<ModuleStatsResult> {
  const sb = createServiceClient();

  const [
    { data: runLogs },
    { data: games },
    { data: books },
    { data: financeMonths },
    { data: weddingTasks },
    { data: goals },
    { data: tasks },
    { data: wikiNotes },
  ] = await Promise.all([
    sb.from('user_run_logs').select('distance_km').eq('user_id', userId),
    sb.from('user_games').select('status').eq('user_id', userId).eq('year', 2026),
    sb.from('user_books').select('status, type').eq('user_id', userId).eq('year', 2026),
    sb
      .from('finance_months')
      .select('kk_saldo_end, kk_free')
      .eq('user_id', userId)
      .eq('year', 2026)
      .order('month')
      .limit(12),
    sb.from('wedding_tasks').select('status').eq('user_id', userId),
    sb.from('user_goals').select('status, xp_reward').eq('user_id', userId).eq('year', 2026),
    sb.from('user_tasks').select('status').eq('user_id', userId),
    sb.from('user_notes').select('category, lektion_nr').eq('user_id', userId),
  ]);

  return computeModuleStats(
    {
      runLogs: runLogs ?? [],
      games: games ?? [],
      books: books ?? [],
      financeMonths: financeMonths ?? [],
      weddingTasks: weddingTasks ?? [],
      goals: goals ?? [],
      tasks: tasks ?? [],
      wikiNotes: wikiNotes ?? [],
    },
    new Date(),
  );
}
