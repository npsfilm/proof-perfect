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
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface CalendarWeekViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onTimeSlotClick: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const HOUR_HEIGHT = 60; // pixels per hour

interface PositionedEvent {
  event: CalendarEvent;
  top: number;
  height: number;
  left: number;
  width: number;
  column: number;
  totalColumns: number;
}

// Calculate overlapping event positions
function calculateEventPositions(events: CalendarEvent[]): PositionedEvent[] {
  if (events.length === 0) return [];

  // Sort events by start time, then by duration (longer first)
  const sortedEvents = [...events].sort((a, b) => {
    const startDiff = new Date(a.start_time).getTime() - new Date(b.start_time).getTime();
    if (startDiff !== 0) return startDiff;
    const durationA = differenceInMinutes(new Date(a.end_time), new Date(a.start_time));
    const durationB = differenceInMinutes(new Date(b.end_time), new Date(b.start_time));
    return durationB - durationA;
  });

  const positionedEvents: PositionedEvent[] = [];
  const columns: { end: Date; events: CalendarEvent[] }[] = [];

  for (const event of sortedEvents) {
    const start = new Date(event.start_time);
    const end = new Date(event.end_time);
    const startMinutes = getHours(start) * 60 + getMinutes(start);
    const durationMinutes = differenceInMinutes(end, start);

    // Find a column where this event doesn't overlap
    let columnIndex = columns.findIndex(col => col.end <= start);
    
    if (columnIndex === -1) {
      // Need a new column
      columnIndex = columns.length;
      columns.push({ end, events: [event] });
    } else {
      columns[columnIndex].end = end;
      columns[columnIndex].events.push(event);
    }

    positionedEvents.push({
      event,
      top: (startMinutes / 60) * HOUR_HEIGHT,
      height: Math.max((durationMinutes / 60) * HOUR_HEIGHT, 24),
      left: 0,
      width: 100,
      column: columnIndex,
      totalColumns: columns.length,
    });
  }

  // Update widths and positions based on total columns
  const totalColumns = columns.length;
  for (const positioned of positionedEvents) {
    positioned.totalColumns = totalColumns;
    positioned.width = 100 / totalColumns;
    positioned.left = positioned.column * positioned.width;
  }

  return positionedEvents;
}

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

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header with days */}
      <div className="grid grid-cols-[40px_repeat(7,1fr)] md:grid-cols-[60px_repeat(7,1fr)] border-b border-border shrink-0">
        <div className="border-r border-border" />
        {days.map((day) => (
          <div
            key={day.toISOString()}
            className={cn(
              'py-1.5 md:py-3 text-center border-r border-border',
              isToday(day) && 'bg-primary/5'
            )}
          >
            <div className="text-[10px] md:text-sm text-muted-foreground">
              {format(day, 'EEEEE', { locale: de })}
            </div>
            <div
              className={cn(
                'text-sm md:text-lg font-medium',
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
        <div className="grid grid-cols-[40px_repeat(7,1fr)] md:grid-cols-[60px_repeat(7,1fr)]" style={{ minHeight: HOURS.length * HOUR_HEIGHT }}>
          {/* Time column */}
          <div className="border-r border-border">
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="relative border-b border-border"
                style={{ height: HOUR_HEIGHT }}
              >
                <span className="absolute -top-2.5 right-0.5 md:right-2 text-[10px] md:text-xs text-muted-foreground">
                  {format(setHours(setMinutes(new Date(), 0), hour), 'HH')}
                </span>
              </div>
            ))}
          </div>

          {/* Day columns */}
          {days.map((day) => {
            const dayEvents = getEventsForDay(day);
            const positionedEvents = calculateEventPositions(dayEvents);
            
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
                {positionedEvents.map(({ event, top, height, left, width }) => (
                  <Tooltip key={event.id}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => onEventClick(event)}
                        className="absolute rounded px-0.5 md:px-1.5 py-0.5 md:py-1 text-[8px] md:text-xs font-medium overflow-hidden text-left hover:opacity-90 transition-opacity border-l-2"
                        style={{
                          top,
                          height,
                          left: `calc(${left}% + 1px)`,
                          width: `calc(${width}% - 2px)`,
                          backgroundColor: `${event.color}20`,
                          borderLeftColor: event.color,
                          color: getContrastColor(event.color, true),
                        }}
                      >
                        <div className="font-medium truncate text-foreground text-[8px] md:text-xs">{event.title}</div>
                        {height > 30 && (
                          <div className="opacity-70 truncate text-foreground/70 text-[8px] md:text-[10px] hidden md:block">
                            {format(new Date(event.start_time), 'HH:mm')}
                          </div>
                        )}
                      </button>
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
                      </div>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function getContrastColor(hexColor: string, lightBg = false): string {
  if (lightBg) return '#1a1a1a'; // Dark text for light background
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#ffffff';
}
