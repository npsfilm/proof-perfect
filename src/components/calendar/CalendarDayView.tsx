import {
  format,
  isSameDay,
  setHours,
  setMinutes,
  getHours,
  getMinutes,
  differenceInMinutes,
} from 'date-fns';
import { de } from 'date-fns/locale';
import { CalendarEvent } from '@/hooks/useEvents';
import { cn } from '@/lib/utils';

interface CalendarDayViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onTimeSlotClick: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const HOUR_HEIGHT = 60;

export function CalendarDayView({
  currentDate,
  events,
  onTimeSlotClick,
  onEventClick,
}: CalendarDayViewProps) {
  const dayEvents = events.filter((event) => {
    const eventStart = new Date(event.start_time);
    return isSameDay(eventStart, currentDate);
  });

  const getEventPosition = (event: CalendarEvent) => {
    const start = new Date(event.start_time);
    const end = new Date(event.end_time);
    const startMinutes = getHours(start) * 60 + getMinutes(start);
    const durationMinutes = differenceInMinutes(end, start);
    
    return {
      top: (startMinutes / 60) * HOUR_HEIGHT,
      height: Math.max((durationMinutes / 60) * HOUR_HEIGHT, 30),
    };
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="py-2 md:py-4 text-center border-b border-border bg-muted/30">
        <div className="text-xs md:text-sm text-muted-foreground">
          {format(currentDate, 'EEEE', { locale: de })}
        </div>
        <div className="text-xl md:text-3xl font-medium text-foreground">
          {format(currentDate, 'd. MMMM yyyy', { locale: de })}
        </div>
      </div>

      {/* Time grid */}
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-[45px_1fr] md:grid-cols-[60px_1fr]" style={{ minHeight: HOURS.length * HOUR_HEIGHT }}>
          {/* Time column */}
          <div className="border-r border-border">
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="relative border-b border-border"
                style={{ height: HOUR_HEIGHT }}
              >
                <span className="absolute -top-2.5 right-1 md:right-2 text-[10px] md:text-xs text-muted-foreground">
                  {format(setHours(setMinutes(new Date(), 0), hour), 'HH:mm')}
                </span>
              </div>
            ))}
          </div>

          {/* Events column */}
          <div className="relative">
            {/* Hour lines */}
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="border-b border-border cursor-pointer hover:bg-accent/30 transition-colors"
                style={{ height: HOUR_HEIGHT }}
                onClick={() => onTimeSlotClick(setHours(currentDate, hour))}
              />
            ))}

            {/* Events */}
            {dayEvents.map((event) => {
              const { top, height } = getEventPosition(event);
              return (
                <button
                  key={event.id}
                  onClick={() => onEventClick(event)}
                  className="absolute left-1 right-1 md:left-2 md:right-2 rounded-lg px-2 md:px-3 py-1.5 md:py-2 text-left hover:opacity-90 transition-opacity shadow-sm"
                  style={{
                    top,
                    height,
                    backgroundColor: event.color,
                    color: getContrastColor(event.color),
                  }}
                >
                  <div className="font-medium text-sm md:text-base">{event.title}</div>
                  <div className="text-xs md:text-sm opacity-80">
                    {format(new Date(event.start_time), 'HH:mm')} -{' '}
                    {format(new Date(event.end_time), 'HH:mm')}
                  </div>
                  {height > 60 && event.location && (
                    <div className="text-xs md:text-sm opacity-70 mt-1">{event.location}</div>
                  )}
                </button>
              );
            })}
          </div>
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
