import 'server-only';
import { createServiceClient } from '@/lib/supabase/server';

export type CalEvent = {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  module: 'tasks' | 'goals' | 'wedding' | 'sport' | 'gaming' | 'reading' | 'finance' | 'hub';
  color: string; // tailwind color name: 'blue' | 'green' | 'amber' | 'purple' | 'red'
  href?: string;
  done?: boolean;
};

const STATIC_EVENTS: CalEvent[] = [
  {
    id: 'hm-2026',
    date: '2026-10-25',
    title: '🏃 Halbmarathon Köln',
    module: 'sport',
    color: 'green',
  },
];

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

  // 4. Static events
  events.push(...STATIC_EVENTS);

  // Sort by date ascending, return max 500
  events.sort((a, b) => a.date.localeCompare(b.date));
  return events.slice(0, 500);
}
