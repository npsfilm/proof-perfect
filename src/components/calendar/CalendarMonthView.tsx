import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  isToday,
} from 'date-fns';
import { de } from 'date-fns/locale';
import { CalendarEvent } from '@/hooks/useEvents';
import { EventCard } from './EventCard';
import { cn } from '@/lib/utils';

interface CalendarMonthViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onDateClick: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
}

export function CalendarMonthView({
  currentDate,
  events,
  onDateClick,
  onEventClick,
}: CalendarMonthViewProps) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getEventsForDay = (day: Date) => {
    return events.filter((event) => {
      const eventStart = new Date(event.start_time);
      const eventEnd = new Date(event.end_time);
      return (
        isSameDay(eventStart, day) ||
        (eventStart <= day && eventEnd >= day)
      );
    });
  };

  const weekDays = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="grid grid-cols-7 border-b border-border">
        {weekDays.map((day) => (
          <div
            key={day}
            className="py-2 text-center text-sm font-medium text-muted-foreground"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="flex-1 grid grid-cols-7 auto-rows-fr">
        {days.map((day, index) => {
          const dayEvents = getEventsForDay(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isCurrentDay = isToday(day);

          return (
            <div
              key={day.toISOString()}
              className={cn(
                'min-h-[100px] p-1 border-b border-r border-border cursor-pointer hover:bg-accent/30 transition-colors',
                !isCurrentMonth && 'bg-muted/30',
                index % 7 === 0 && 'border-l'
              )}
              onClick={() => onDateClick(day)}
            >
              <div className="flex flex-col h-full">
                <span
                  className={cn(
                    'inline-flex items-center justify-center w-7 h-7 text-sm rounded-full mb-1',
                    isCurrentDay && 'bg-primary text-primary-foreground font-medium',
                    !isCurrentMonth && 'text-muted-foreground'
                  )}
                >
                  {format(day, 'd')}
                </span>
                <div className="flex-1 space-y-0.5 overflow-hidden">
                  {dayEvents.slice(0, 3).map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      variant="compact"
                      onClick={() => onEventClick(event)}
                    />
                  ))}
                  {dayEvents.length > 3 && (
                    <span className="text-xs text-muted-foreground pl-2">
                      +{dayEvents.length - 3} mehr
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
