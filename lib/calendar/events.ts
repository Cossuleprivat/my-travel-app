import 'server-only';
import { createServiceClient } from '@/lib/supabase/server';
import { LAUFPLAN_2026 } from '@/lib/sport/laufplan';

export type CalEvent = {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  module: 'tasks' | 'goals' | 'wedding' | 'sport' | 'gaming' | 'reading' | 'finance' | 'hub' | 'event';
  color: string; // tailwind color name: 'blue' | 'green' | 'amber' | 'purple' | 'red'
  href?: string;
  done?: boolean;
};

const STATIC_EVENTS: CalEvent[] = [
  {
    id: 'hm-2026',
    date: '2026-10-25',
    title: '🏃 Halbmarathon — Sportscheck Run Nürnberg',
    module: 'sport',
    color: 'green',
  },
];

/** Monday (ISO) of a given ISO week in a year, as YYYY-MM-DD. */
function mondayOfISOWeek(week: number, year: number): string {
  const simple = new Date(Date.UTC(year, 0, 1 + (week - 1) * 7));
  const dow = simple.getUTCDay();
  const monday = new Date(simple);
  if (dow <= 4) {
    monday.setUTCDate(simple.getUTCDate() - simple.getUTCDay() + 1);
  } else {
    monday.setUTCDate(simple.getUTCDate() + 8 - simple.getUTCDay());
  }
  return monday.toISOString().slice(0, 10);
}

function laufplanEvents(): CalEvent[] {
  return LAUFPLAN_2026.filter((w) => !w.isRace).map((w) => ({
    id: `laufplan-${w.week}`,
    date: mondayOfISOWeek(w.week, 2026),
    title: `🏃 ${w.weekStr} · ${w.km} km — ${w.units}`,
    module: 'sport' as const,
    color: w.isTaper ? 'amber' : w.isSardinia ? 'purple' : 'green',
    href: '/sport',
  }));
}

export async function loadCalendarEvents(userId: string): Promise<CalEvent[]> {
  const sb = createServiceClient();
  const events: CalEvent[] = [];

  // 1. user_tasks with deadline
  const { data: tasks } = await sb
    .from('user_tasks')
    .select('id, title, deadline, status')
    .eq('user_id', userId)
    .not('deadline', 'is', null);

  if (tasks) {
    for (const t of tasks) {
      events.push({
        id: `task-${t.id}`,
        date: t.deadline as string,
        title: t.title as string,
        module: 'tasks',
        color: 'blue',
        href: '/tasks',
        done: t.status === 'done',
      });
    }
  }

  // 2. user_goals with deadline
  const { data: goals } = await sb
    .from('user_goals')
    .select('id, title, deadline, status')
    .eq('user_id', userId)
    .not('deadline', 'is', null);

  if (goals) {
    for (const g of goals) {
      events.push({
        id: `goal-${g.id}`,
        date: g.deadline as string,
        title: g.title as string,
        module: 'goals',
        color: 'green',
        href: '/goals',
        done: g.status === 'done',
      });
    }
  }

  // 3. wedding_tasks with deadline
  const { data: weddingTasks } = await sb
    .from('wedding_tasks')
    .select('id, title, deadline, status')
    .eq('user_id', userId)
    .not('deadline', 'is', null);

  if (weddingTasks) {
    for (const w of weddingTasks) {
      events.push({
        id: `wedding-${w.id}`,
        date: w.deadline as string,
        title: w.title as string,
        module: 'wedding',
        color: 'red',
        href: '/wedding',
        done: w.status === 'done',
      });
    }
  }

  // 4. Custom user events
  const { data: customEvents } = await sb
    .from('user_events')
    .select('id, title, event_date, color')
    .eq('user_id', userId);

  if (customEvents) {
    for (const c of customEvents) {
      events.push({
        id: `event-${c.id}`,
        date: c.event_date as string,
        title: c.title as string,
        module: 'event',
        color: (c.color as string) ?? 'blue',
        href: '/calendar',
      });
    }
  }

  // 5. Laufplan training weeks + static events
  events.push(...laufplanEvents());
  events.push(...STATIC_EVENTS);

  // Sort by date ascending, return max 500
  events.sort((a, b) => a.date.localeCompare(b.date));
  return events.slice(0, 500);
}
