import {
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameDay,
  isToday,
  setHours,
  setMinutes,
  getHours,
  getMinutes,
  differenceInMinutes,
} from 'date-fns';
import { de } from 'date-fns/locale';
import { CalendarEvent } from '@/hooks/useEvents';
import { cn } from '@/lib/utils';

interface CalendarWeekViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onTimeSlotClick: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const HOUR_HEIGHT = 60; // pixels per hour

export function CalendarWeekView({
  currentDate,
  events,
  onTimeSlotClick,
  onEventClick,
}: CalendarWeekViewProps) {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const getEventsForDay = (day: Date) => {
    return events.filter((event) => {
      const eventStart = new Date(event.start_time);
      return isSameDay(eventStart, day);
    });
  };

  const getEventPosition = (event: CalendarEvent) => {
    const start = new Date(event.start_time);
    const end = new Date(event.end_time);
    const startMinutes = getHours(start) * 60 + getMinutes(start);
    const durationMinutes = differenceInMinutes(end, start);
    
    return {
      top: (startMinutes / 60) * HOUR_HEIGHT,
      height: Math.max((durationMinutes / 60) * HOUR_HEIGHT, 20),
    };
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header with days */}
      <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-border shrink-0">
        <div className="border-r border-border" />
        {days.map((day) => (
          <div
            key={day.toISOString()}
            className={cn(
              'py-3 text-center border-r border-border',
              isToday(day) && 'bg-primary/5'
            )}
          >
            <div className="text-sm text-muted-foreground">
              {format(day, 'EEE', { locale: de })}
            </div>
            <div
              className={cn(
                'text-lg font-medium',
                isToday(day) && 'text-primary'
              )}
            >
              {format(day, 'd')}
            </div>
          </div>
        ))}
      </div>

      {/* Time grid */}
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-[60px_repeat(7,1fr)]" style={{ minHeight: HOURS.length * HOUR_HEIGHT }}>
          {/* Time column */}
          <div className="border-r border-border">
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="relative border-b border-border"
                style={{ height: HOUR_HEIGHT }}
              >
                <span className="absolute -top-2.5 right-2 text-xs text-muted-foreground">
                  {format(setHours(setMinutes(new Date(), 0), hour), 'HH:mm')}
                </span>
              </div>
            ))}
          </div>

          {/* Day columns */}
          {days.map((day) => {
            const dayEvents = getEventsForDay(day);
            
            return (
              <div
                key={day.toISOString()}
                className={cn(
                  'relative border-r border-border',
                  isToday(day) && 'bg-primary/5'
                )}
              >
                {/* Hour lines */}
                {HOURS.map((hour) => (
                  <div
                    key={hour}
                    className="border-b border-border cursor-pointer hover:bg-accent/30 transition-colors"
                    style={{ height: HOUR_HEIGHT }}
                    onClick={() => onTimeSlotClick(setHours(day, hour))}
                  />
                ))}

                {/* Events */}
                {dayEvents.map((event) => {
                  const { top, height } = getEventPosition(event);
                  return (
                    <button
                      key={event.id}
                      onClick={() => onEventClick(event)}
                      className="absolute left-1 right-1 rounded px-2 py-1 text-xs font-medium overflow-hidden text-left hover:opacity-90 transition-opacity"
                      style={{
                        top,
                        height,
                        backgroundColor: event.color,
                        color: getContrastColor(event.color),
                      }}
                    >
                      <div className="font-medium truncate">{event.title}</div>
                      {height > 30 && (
                        <div className="opacity-80 truncate">
                          {format(new Date(event.start_time), 'HH:mm')}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function getContrastColor(hexColor: string): string {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#ffffff';
}
