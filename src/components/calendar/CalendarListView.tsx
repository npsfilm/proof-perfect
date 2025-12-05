import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  isSameDay,
  isToday,
  isFuture,
  isPast,
} from 'date-fns';
import { de } from 'date-fns/locale';
import { CalendarEvent } from '@/hooks/useEvents';
import { EventCard } from './EventCard';
import { cn } from '@/lib/utils';

interface CalendarListViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
}

export function CalendarListView({
  currentDate,
  events,
  onEventClick,
}: CalendarListViewProps) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Sort events by start time
  const sortedEvents = [...events].sort(
    (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
  );

  // Group events by day
  const eventsByDay = days.map((day) => ({
    day,
    events: sortedEvents.filter((event) => {
      const eventStart = new Date(event.start_time);
      return isSameDay(eventStart, day);
    }),
  })).filter(({ events }) => events.length > 0);

  if (eventsByDay.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <p className="text-lg font-medium">Keine Termine</p>
          <p className="text-sm">
            Klicken Sie auf einen Tag im Kalender, um einen Termin zu erstellen.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-3xl mx-auto py-4 space-y-6">
        {eventsByDay.map(({ day, events }) => (
          <div key={day.toISOString()}>
            {/* Day header */}
            <div
              className={cn(
                'sticky top-0 bg-background/95 backdrop-blur-sm py-2 px-3 mb-2 border-b border-border',
                isPast(day) && !isToday(day) && 'text-muted-foreground'
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center text-lg font-medium',
                    isToday(day) && 'bg-primary text-primary-foreground',
                    !isToday(day) && 'bg-muted'
                  )}
                >
                  {format(day, 'd')}
                </div>
                <div>
                  <div className="font-medium">
                    {format(day, 'EEEE', { locale: de })}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {format(day, 'd. MMMM yyyy', { locale: de })}
                  </div>
                </div>
              </div>
            </div>

            {/* Events for the day */}
            <div className="space-y-2 pl-14">
              {events.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  variant="full"
                  onClick={() => onEventClick(event)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
