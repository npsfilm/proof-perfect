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
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';

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
          const visibleEvents = dayEvents.slice(0, 3);
          const hiddenCount = dayEvents.length - 3;

          return (
            <div
              key={day.toISOString()}
              className={cn(
                'min-h-[120px] p-1.5 border-b border-r border-border cursor-pointer hover:bg-accent/30 transition-colors group',
                !isCurrentMonth && 'bg-muted/30',
                index % 7 === 0 && 'border-l'
              )}
              onClick={() => onDateClick(day)}
            >
              <div className="flex flex-col h-full">
                <span
                  className={cn(
                    'inline-flex items-center justify-center w-7 h-7 text-sm rounded-full mb-1 transition-colors',
                    isCurrentDay && 'bg-primary text-primary-foreground font-medium',
                    !isCurrentMonth && 'text-muted-foreground',
                    !isCurrentDay && 'group-hover:bg-accent'
                  )}
                >
                  {format(day, 'd')}
                </span>
                <div className="flex-1 space-y-0.5 overflow-hidden">
                  {visibleEvents.map((event) => (
                    <Tooltip key={event.id}>
                      <TooltipTrigger asChild>
                        <div onClick={(e) => e.stopPropagation()}>
                          <EventCard
                            event={event}
                            variant="compact"
                            onClick={() => onEventClick(event)}
                          />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-xs">
                        <div className="space-y-1">
                          <p className="font-medium">{event.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(event.start_time), 'HH:mm')} - {format(new Date(event.end_time), 'HH:mm')}
                          </p>
                          {event.location && (
                            <p className="text-xs text-muted-foreground">{event.location}</p>
                          )}
                          {event.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2">{event.description}</p>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                  {hiddenCount > 0 && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button 
                          className="text-xs text-muted-foreground hover:text-foreground pl-2 w-full text-left"
                          onClick={(e) => e.stopPropagation()}
                        >
                          +{hiddenCount} weitere
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-xs">
                        <ScrollArea className="max-h-48">
                          <div className="space-y-2 p-1">
                            {dayEvents.slice(3).map((event) => (
                              <button
                                key={event.id}
                                onClick={() => onEventClick(event)}
                                className="w-full text-left p-2 rounded hover:bg-accent transition-colors"
                              >
                                <div className="flex items-center gap-2">
                                  <div
                                    className="w-2 h-2 rounded-full shrink-0"
                                    style={{ backgroundColor: event.color }}
                                  />
                                  <div>
                                    <p className="font-medium text-sm">{event.title}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {format(new Date(event.start_time), 'HH:mm')}
                                    </p>
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        </ScrollArea>
                      </TooltipContent>
                    </Tooltip>
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
