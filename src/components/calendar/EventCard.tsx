import { format, isSameDay } from 'date-fns';
import { de } from 'date-fns/locale';
import { MapPin } from 'lucide-react';
import { CalendarEvent } from '@/hooks/useEvents';
import { cn } from '@/lib/utils';

interface EventCardProps {
  event: CalendarEvent;
  onClick?: () => void;
  variant?: 'compact' | 'full';
  className?: string;
}

export function EventCard({ event, onClick, variant = 'compact', className }: EventCardProps) {
  const startTime = new Date(event.start_time);
  const endTime = new Date(event.end_time);
  const isMultiDay = !isSameDay(startTime, endTime);

  if (variant === 'compact') {
    return (
      <button
        onClick={onClick}
        className={cn(
          'w-full text-left px-2 py-1 rounded text-xs font-medium truncate transition-opacity hover:opacity-80',
          className
        )}
        style={{ backgroundColor: event.color, color: getContrastColor(event.color) }}
      >
        {!isMultiDay && (
          <span className="mr-1 opacity-80">
            {format(startTime, 'HH:mm')}
          </span>
        )}
        {event.title}
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left p-3 rounded-lg transition-all hover:shadow-md border-l-4',
        'bg-card hover:bg-accent/50',
        className
      )}
      style={{ borderLeftColor: event.color }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-foreground truncate">{event.title}</h4>
          <p className="text-sm text-muted-foreground">
            {isMultiDay ? (
              <>
                {format(startTime, 'd. MMM', { locale: de })} -{' '}
                {format(endTime, 'd. MMM', { locale: de })}
              </>
            ) : (
              <>
                {format(startTime, 'HH:mm')} - {format(endTime, 'HH:mm')}
              </>
            )}
          </p>
          {event.location && (
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <MapPin className="h-3 w-3" />
              {event.location}
            </p>
          )}
        </div>
        <div
          className="w-3 h-3 rounded-full shrink-0"
          style={{ backgroundColor: event.color }}
        />
      </div>
    </button>
  );
}

// Helper to determine text color based on background
function getContrastColor(hexColor: string): string {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#ffffff';
}
