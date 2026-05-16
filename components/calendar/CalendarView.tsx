'use client';

import { useState, useRef, useCallback } from 'react';
import type { CalEvent } from '@/lib/calendar/events';

const WEEKDAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

const MONTH_NAMES = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
];

const COLOR_DOT: Record<string, string> = {
  blue:   'bg-blue-500',
  green:  'bg-green-500',
  amber:  'bg-amber-500',
  purple: 'bg-purple-500',
  red:    'bg-red-500',
};

const COLOR_TEXT: Record<string, string> = {
  blue:   'text-blue-400',
  green:  'text-green-400',
  amber:  'text-amber-400',
  purple: 'text-purple-400',
  red:    'text-red-400',
};

interface CalendarViewProps {
  events: CalEvent[];
}

export function CalendarView({ events }: CalendarViewProps) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth()); // 0-indexed
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const dateRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const setDateRef = useCallback((dateStr: string) => (el: HTMLDivElement | null) => {
    dateRefs.current[dateStr] = el;
  }, []);

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
    setSelectedDay(null);
  }

  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
    setSelectedDay(null);
  }

  // Events for this month
  const monthEvents = events.filter((e) => {
    const [ey, em] = e.date.split('-').map(Number);
    return ey === year && em - 1 === month;
  });

  // Group by day
  const eventsByDay = new Map<number, CalEvent[]>();
  for (const ev of monthEvents) {
    const day = parseInt(ev.date.split('-')[2], 10);
    if (!eventsByDay.has(day)) eventsByDay.set(day, []);
    eventsByDay.get(day)!.push(ev);
  }

  // Calendar grid
  const firstDay = new Date(year, month, 1);
  // getDay(): 0=Sun, convert to Mon-first (Mon=0)
  const startDow = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const totalCells = Math.ceil((startDow + daysInMonth) / 7) * 7;

  function handleDayClick(day: number) {
    setSelectedDay(day === selectedDay ? null : day);
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setTimeout(() => {
      dateRefs.current[dateStr]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }

  // Group month events by date string for list
  const groupedEvents = new Map<string, CalEvent[]>();
  for (const ev of monthEvents) {
    if (!groupedEvents.has(ev.date)) groupedEvents.set(ev.date, []);
    groupedEvents.get(ev.date)!.push(ev);
  }
  const sortedDates = Array.from(groupedEvents.keys()).sort();

  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  return (
    <div className="space-y-4">
      {/* Month header */}
      <div className="flex items-center justify-between px-1">
        <button
          onClick={prevMonth}
          className="text-text-muted hover:text-text-primary transition-colors px-2 py-1"
          aria-label="Vorheriger Monat"
        >
          ‹
        </button>
        <h2 className="text-text-primary font-semibold">
          {MONTH_NAMES[month]} {year}
        </h2>
        <button
          onClick={nextMonth}
          className="text-text-muted hover:text-text-primary transition-colors px-2 py-1"
          aria-label="Nächster Monat"
        >
          ›
        </button>
      </div>

      {/* Calendar grid */}
      <div className="rounded-xl bg-bg-surface border border-border-subtle overflow-hidden">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 border-b border-border-subtle">
          {WEEKDAYS.map((d) => (
            <div key={d} className="text-center py-2 text-xs label-mono text-text-muted">
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7">
          {Array.from({ length: totalCells }).map((_, i) => {
            const dayNum = i - startDow + 1;
            const isCurrentMonth = dayNum >= 1 && dayNum <= daysInMonth;
            const dayEvents = isCurrentMonth ? (eventsByDay.get(dayNum) ?? []) : [];
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const isToday = isCurrentMonth && dateStr === todayStr;
            const isSelected = isCurrentMonth && dayNum === selectedDay;

            return (
              <button
                key={i}
                disabled={!isCurrentMonth}
                onClick={() => isCurrentMonth && handleDayClick(dayNum)}
                className={[
                  'min-h-[52px] p-1 flex flex-col items-center gap-0.5 border-b border-r border-border-subtle',
                  'transition-colors last:border-r-0',
                  isCurrentMonth ? 'hover:bg-bg-elevated cursor-pointer' : 'cursor-default',
                  isSelected ? 'bg-bg-elevated' : '',
                ].join(' ')}
              >
                {isCurrentMonth ? (
                  <>
                    <span
                      className={[
                        'text-sm w-7 h-7 flex items-center justify-center rounded-full',
                        isToday ? 'bg-accent-blue text-white font-bold' : 'text-text-primary',
                      ].join(' ')}
                    >
                      {dayNum}
                    </span>
                    {/* Event dots */}
                    <div className="flex gap-0.5 flex-wrap justify-center">
                      {dayEvents.slice(0, 3).map((ev, idx) => (
                        <span
                          key={idx}
                          className={['w-1.5 h-1.5 rounded-full', COLOR_DOT[ev.color] ?? 'bg-gray-500'].join(' ')}
                        />
                      ))}
                      {dayEvents.length > 3 && (
                        <span className="text-[9px] text-text-muted leading-none">+{dayEvents.length - 3}</span>
                      )}
                    </div>
                  </>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {/* Event list */}
      {monthEvents.length > 0 ? (
        <div className="space-y-3">
          <h3 className="label-mono text-text-muted px-1">Events im {MONTH_NAMES[month]}</h3>
          {sortedDates.map((dateStr) => {
            const dayEvs = groupedEvents.get(dateStr)!;
            const [, , dd] = dateStr.split('-');
            const dayLabel = new Date(dateStr + 'T00:00:00').toLocaleDateString('de-DE', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
            });

            return (
              <div
                key={dateStr}
                ref={setDateRef(dateStr)}
                className="rounded-xl bg-bg-surface border border-border-subtle overflow-hidden"
              >
                <div className="px-4 py-2 border-b border-border-subtle bg-bg-elevated">
                  <span className="label-mono text-text-muted text-xs">{dayLabel}</span>
                </div>
                <div className="divide-y divide-border-subtle">
                  {dayEvs.map((ev) => (
                    <div key={ev.id} className="flex items-center gap-3 px-4 py-3">
                      <span
                        className={['w-2 h-2 rounded-full flex-shrink-0', COLOR_DOT[ev.color] ?? 'bg-gray-500'].join(' ')}
                      />
                      <div className="flex-1 min-w-0">
                        <span
                          className={[
                            'text-sm text-text-primary',
                            ev.done ? 'line-through text-text-muted' : '',
                          ].join(' ')}
                        >
                          {ev.title}
                        </span>
                        <span className={['ml-2 text-xs label-mono', COLOR_TEXT[ev.color] ?? 'text-gray-400'].join(' ')}>
                          {ev.module}
                        </span>
                      </div>
                      {ev.done && (
                        <span className="text-green-400 text-sm flex-shrink-0" aria-label="Erledigt">✓</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-center text-text-muted text-sm py-6">
          Keine Events in diesem Monat.
        </p>
      )}
    </div>
  );
}
