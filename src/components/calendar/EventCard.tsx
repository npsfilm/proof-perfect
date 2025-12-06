import { format, isSameDay } from 'date-fns';
import { de } from 'date-fns/locale';
import { MapPin, RefreshCw } from 'lucide-react';
import { CalendarEvent } from '@/hooks/useEvents';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

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
  const isFromGoogle = !!event.google_event_id;

  if (variant === 'compact') {
    return (
      <button
        onClick={onClick}
        className={cn(
          'w-full text-left px-2 py-1 rounded text-xs font-medium truncate transition-opacity hover:opacity-80 flex items-center gap-1',
          className
        )}
        style={{ backgroundColor: event.color, color: getContrastColor(event.color) }}
      >
        {isFromGoogle && (
          <RefreshCw className="h-2.5 w-2.5 shrink-0 opacity-70" />
        )}
        {!isMultiDay && (
          <span className="opacity-80">
            {format(startTime, 'HH:mm')}
          </span>
        )}
        <span className="truncate">{event.title}</span>
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
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-foreground truncate">{event.title}</h4>
            {isFromGoogle && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <RefreshCw className="h-3 w-3 text-muted-foreground shrink-0" />
                </TooltipTrigger>
                <TooltipContent>
                  Von Google Kalender synchronisiert
                </TooltipContent>
              </Tooltip>
            )}
          </div>
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
          {event.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {event.description}
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
