import 'server-only';
import { createServiceClient } from '@/lib/supabase/server';

const HM_DATE = '2026-10-25';
const STANDESAMT_DATE = '2026-10-10';

export type JarvisSnapshot = {
  openTasks: { title: string; area: string; deadline: string | null }[];
  openTaskCount: number;
  totalKm: number;
  doneBooks: number;
  doneAudiobooks: number;
  doneGames: number;
  gamesTotal: number;
  weddingDone: number;
  weddingTotal: number;
  financeKkSaldo: number | null;
  financeKkFree: number | null;
  goalsDoneXp: number;
  goalsTotalXp: number;
};

function days(target: string, now: Date): number {
  return Math.ceil((new Date(target).getTime() - now.getTime()) / 86400000);
}

export function formatJarvisContext(s: JarvisSnapshot, now: Date): string {
  const todayISO = now.toISOString().slice(0, 10);

  const taskLines = s.openTasks
    .slice(0, 5)
    .map((t) => {
      const overdue = t.deadline && t.deadline < todayISO;
      const when = !t.deadline
        ? ''
        : overdue
          ? ', überfällig'
          : `, fällig ${t.deadline}`;
      return `"${t.title}" (${t.area}${when})`;
    })
    .join('; ');

  const lines = [
    'Aktueller Stand (live):',
    `• Tasks: ${s.openTaskCount} offen${taskLines ? ` — ${taskLines}` : ''}`,
    `• Sport: ${s.totalKm.toFixed(1)} / 500 km · ${days(HM_DATE, now)} Tage bis Halbmarathon`,
    `• Hochzeit: ${days(STANDESAMT_DATE, now)} Tage bis Standesamt · ${s.weddingDone}/${s.weddingTotal} Tasks erledigt`,
    `• Lesen: ${s.doneBooks}/6 Bücher · ${s.doneAudiobooks}/6 Hörbücher`,
    `• Gaming: ${s.doneGames}/${s.gamesTotal} Spiele fertig`,
    `• Finanzen: KK ${Number(s.financeKkSaldo ?? 0).toLocaleString('de-DE')} € · ${Number(s.financeKkFree ?? 0).toLocaleString('de-DE')} € frei`,
    `• Jahresplan: ${s.goalsDoneXp} / ${s.goalsTotalXp} XP erreicht`,
  ];
  return lines.join('\n');
}

export async function gatherJarvisContext(userId: string): Promise<string> {
  const sb = createServiceClient();

  const [
    { data: openTasks },
    { count: openTaskCount },
    { data: runLogs },
    { data: books },
    { data: games },
    { data: weddingTasks },
    { data: financeMonths },
    { data: goals },
  ] = await Promise.all([
    sb
      .from('user_tasks')
      .select('title, area, deadline')
      .eq('user_id', userId)
      .neq('status', 'done')
      .order('deadline', { nullsFirst: false })
      .limit(5),
    sb
      .from('user_tasks')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .neq('status', 'done'),
    sb.from('user_run_logs').select('distance_km').eq('user_id', userId),
    sb.from('user_books').select('status, type').eq('user_id', userId).eq('year', 2026),
    sb.from('user_games').select('status').eq('user_id', userId).eq('year', 2026),
    sb.from('wedding_tasks').select('status').eq('user_id', userId),
    sb
      .from('finance_months')
      .select('kk_saldo_end, kk_free')
      .eq('user_id', userId)
      .eq('year', 2026)
      .order('month')
      .limit(12),
    sb.from('user_goals').select('status, xp_reward').eq('user_id', userId).eq('year', 2026),
  ]);

  const booksArr = books ?? [];
  const gamesArr = games ?? [];
  const wArr = weddingTasks ?? [];
  const latestMonth = (financeMonths ?? []).at(-1);
  const goalsArr = goals ?? [];

  const snapshot: JarvisSnapshot = {
    openTasks: (openTasks ?? []).map((t) => ({
      title: t.title as string,
      area: (t.area as string) ?? 'allgemein',
      deadline: (t.deadline as string | null) ?? null,
    })),
    openTaskCount: openTaskCount ?? 0,
    totalKm: (runLogs ?? []).reduce((s, r) => s + Number(r.distance_km ?? 0), 0),
    doneBooks: booksArr.filter((b) => b.type === 'book' && b.status === 'done').length,
    doneAudiobooks: booksArr.filter((b) => b.type === 'audiobook' && b.status === 'done').length,
    doneGames: gamesArr.filter((g) => g.status === 'completed').length,
    gamesTotal: gamesArr.length,
    weddingDone: wArr.filter((t) => t.status === 'done').length,
    weddingTotal: wArr.length,
    financeKkSaldo: latestMonth ? Number(latestMonth.kk_saldo_end ?? 0) : null,
    financeKkFree: latestMonth ? Number(latestMonth.kk_free ?? 0) : null,
    goalsDoneXp: goalsArr.filter((g) => g.status === 'done').reduce((s, g) => s + g.xp_reward, 0),
    goalsTotalXp: goalsArr.reduce((s, g) => s + g.xp_reward, 0),
  };

  return formatJarvisContext(snapshot, new Date());
}
