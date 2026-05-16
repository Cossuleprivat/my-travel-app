import { requireUserId } from '@/lib/auth/current-user';
import { loadCalendarEvents } from '@/lib/calendar/events';
import { CalendarView } from '@/components/calendar/CalendarView';
import { AddEvent } from '@/components/calendar/AddEvent';

export const dynamic = 'force-dynamic';

export default async function CalendarPage() {
  const userId = await requireUserId();
  const events = await loadCalendarEvents(userId);

  const webcalUrl = `webcal://${process.env.NEXT_PUBLIC_APP_URL?.replace(/^https?:\/\//, '') ?? 'my-travel-app.vercel.app'}/api/calendar/ics`;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-text-primary font-semibold text-lg">Kalender</h1>
      </div>

      {/* ICS subscription banner */}
      <div className="rounded-xl bg-bg-surface border border-border-subtle p-4 flex items-center gap-3">
        <span className="text-xl" aria-hidden="true">📅</span>
        <div className="flex-1 min-w-0">
          <p className="text-xs label-mono text-text-muted mb-1">Apple Calendar / Webcal Feed</p>
          <p className="text-xs text-text-secondary truncate">{webcalUrl}</p>
        </div>
        <a
          href={webcalUrl}
          className="text-xs label-mono text-accent-blue hover:opacity-80 transition-opacity whitespace-nowrap"
        >
          Abonnieren
        </a>
      </div>

      <AddEvent />

      <CalendarView events={events} />
    </div>
  );
}
