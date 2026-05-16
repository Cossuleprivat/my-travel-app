export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { loadCalendarEvents } from '@/lib/calendar/events';

export async function GET() {
  // hardcoded owner user id
  const OWNER = 'acabfbe0-79cf-43e6-903b-b96834eb0a05';
  const events = await loadCalendarEvents(OWNER);

  // Build ICS string
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//LiveOS//Personal Calendar//DE',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:LiveOS',
    'X-WR-TIMEZONE:Europe/Berlin',
  ];

  for (const ev of events) {
    // Format date as YYYYMMDD
    const dateStr = ev.date.replace(/-/g, '');
    lines.push('BEGIN:VEVENT');
    lines.push(`UID:liveos-${ev.id}@liveos`);
    lines.push(`DTSTART;VALUE=DATE:${dateStr}`);
    lines.push(`DTEND;VALUE=DATE:${dateStr}`);
    lines.push(`SUMMARY:${ev.title}`);
    lines.push(`CATEGORIES:${ev.module.toUpperCase()}`);
    if (ev.done) lines.push('STATUS:COMPLETED');
    lines.push('END:VEVENT');
  }

  lines.push('END:VCALENDAR');
  const ics = lines.join('\r\n');

  return new NextResponse(ics, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'attachment; filename="liveos.ics"',
      'Cache-Control': 'no-cache',
    },
  });
}
