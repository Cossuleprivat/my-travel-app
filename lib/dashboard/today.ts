import 'server-only';
import { createServiceClient } from '@/lib/supabase/server';
import { loadCalendarEvents, type CalEvent } from '@/lib/calendar/events';
import {
  getISOWeek,
  getCurrentPlanWeek,
  getNextPlanWeek,
  daysUntilHM,
  type LaufplanWeek,
} from '@/lib/sport/laufplan';

export type TodoItem = {
  id: string;
  title: string;
  area: string;
  deadline: string | null;
  overdue: boolean;
  source: 'task' | 'wedding';
};

export type TodayOverview = {
  todayISO: string;
  dueItems: TodoItem[];
  todayEvents: CalEvent[];
  upcomingEvents: CalEvent[];
  planWeek: LaufplanWeek | null;
  nextPlanWeek: LaufplanWeek | null;
  daysToHM: number;
};

function iso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export async function getTodayOverview(userId: string): Promise<TodayOverview> {
  const sb = createServiceClient();
  const now = new Date();
  const todayISO = iso(now);

  const [{ data: tasks }, { data: wedding }, allEvents] = await Promise.all([
    sb
      .from('user_tasks')
      .select('id, title, area, deadline, status')
      .eq('user_id', userId)
      .neq('status', 'done')
      .not('deadline', 'is', null)
      .order('deadline', { ascending: true }),
    sb
      .from('wedding_tasks')
      .select('id, title, deadline, status')
      .eq('user_id', userId)
      .neq('status', 'done')
      .not('deadline', 'is', null)
      .order('deadline', { ascending: true }),
    loadCalendarEvents(userId),
  ]);

  const dueItems: TodoItem[] = [];
  for (const t of tasks ?? []) {
    const dl = t.deadline as string;
    if (dl <= todayISO) {
      dueItems.push({
        id: t.id as string,
        title: t.title as string,
        area: (t.area as string) ?? 'allgemein',
        deadline: dl,
        overdue: dl < todayISO,
        source: 'task',
      });
    }
  }
  for (const w of wedding ?? []) {
    const dl = w.deadline as string;
    if (dl <= todayISO) {
      dueItems.push({
        id: w.id as string,
        title: w.title as string,
        area: 'hochzeit',
        deadline: dl,
        overdue: dl < todayISO,
        source: 'wedding',
      });
    }
  }
  dueItems.sort((a, b) => (a.deadline ?? '').localeCompare(b.deadline ?? ''));

  const todayEvents = allEvents.filter((e) => e.date === todayISO);
  const in14 = iso(new Date(now.getTime() + 14 * 86400000));
  const upcomingEvents = allEvents
    .filter((e) => e.date > todayISO && e.date <= in14 && !e.done)
    .slice(0, 6);

  const week = getISOWeek(now);
  const planWeek = getCurrentPlanWeek(week);
  const nextPlanWeek = planWeek ? null : getNextPlanWeek(week);

  return {
    todayISO,
    dueItems,
    todayEvents,
    upcomingEvents,
    planWeek,
    nextPlanWeek,
    daysToHM: daysUntilHM(now),
  };
}
