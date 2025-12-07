import { format, formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, RefreshCw, CheckCircle2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { CalendarView } from '@/hooks/useCalendarNavigation';
import { useGoogleCalendarSync } from '@/hooks/useGoogleCalendarSync';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';

// Calendar sources - matches Edge Function iCal configuration
export const CALENDAR_SOURCES = [
  { id: 'npsfilm', name: 'NPS Film', color: '#10b981' },
  { id: 'group', name: 'Gruppen-Kalender', color: '#8b5cf6' },
];

interface CalendarHeaderProps {
  currentDate: Date;
  view: CalendarView;
  onViewChange: (view: CalendarView) => void;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
  onNewEvent?: () => void;
  visibleCalendars?: string[];
  onToggleCalendar?: (calendarId: string) => void;
}

export function CalendarHeader({
  currentDate,
  view,
  onViewChange,
  onPrevious,
  onNext,
  onToday,
  onNewEvent,
  visibleCalendars = CALENDAR_SOURCES.map(c => c.id),
  onToggleCalendar,
}: CalendarHeaderProps) {
  const { sync, isSyncing, lastSyncTime } = useGoogleCalendarSync();

  const getTitle = () => {
    switch (view) {
      case 'month':
        return format(currentDate, 'MMMM yyyy', { locale: de });
      case 'week':
        return format(currentDate, "'KW' w, MMMM yyyy", { locale: de });
      case 'day':
        return format(currentDate, 'EEEE, d. MMMM yyyy', { locale: de });
      case 'list':
        return format(currentDate, 'MMMM yyyy', { locale: de });
      default:
        return '';
    }
  };

  return (
    <div className="flex flex-col gap-4 pb-4 border-b border-border">
      {/* Top row - Title, navigation, views, actions */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-semibold text-foreground capitalize">
            {getTitle()}
          </h2>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" onClick={onPrevious}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={onToday}>
              Heute
            </Button>
            <Button variant="outline" size="icon" onClick={onNext}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* New Event Button */}
          {onNewEvent && (
            <Button onClick={onNewEvent} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Neuer Termin
            </Button>
          )}

          {/* View Toggle */}
          <ToggleGroup
            type="single"
            value={view}
            onValueChange={(value) => value && onViewChange(value as CalendarView)}
            className="bg-muted rounded-lg p-1"
          >
            <ToggleGroupItem value="month" size="sm" className="data-[state=on]:bg-background">
              Monat
            </ToggleGroupItem>
            <ToggleGroupItem value="week" size="sm" className="data-[state=on]:bg-background">
              Woche
            </ToggleGroupItem>
            <ToggleGroupItem value="day" size="sm" className="data-[state=on]:bg-background">
              Tag
            </ToggleGroupItem>
            <ToggleGroupItem value="list" size="sm" className="data-[state=on]:bg-background">
              Liste
            </ToggleGroupItem>
          </ToggleGroup>

          {/* Sync Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => sync()}
            disabled={isSyncing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Sync...' : 'Sync'}
          </Button>
        </div>
      </div>

      {/* Bottom row - Calendar Legend & Filters */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        {/* Calendar Filters */}
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">Kalender:</span>
          <div className="flex items-center gap-3">
            {CALENDAR_SOURCES.map((calendar) => {
              const isVisible = visibleCalendars.includes(calendar.id);
              return (
                <label
                  key={calendar.id}
                  className="flex items-center gap-2 cursor-pointer group"
                >
                  <Checkbox
                    checked={isVisible}
                    onCheckedChange={() => onToggleCalendar?.(calendar.id)}
                    className="border-2"
                    style={{ 
                      borderColor: calendar.color,
                      backgroundColor: isVisible ? calendar.color : 'transparent',
                    }}
                  />
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: calendar.color }}
                    />
                    <span className="text-sm text-foreground group-hover:text-foreground/80">
                      {calendar.name}
                    </span>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Sync Status */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="secondary" className="gap-1 font-normal">
            <CheckCircle2 className="h-3 w-3 text-green-500" />
            iCal verbunden
          </Badge>
          {lastSyncTime && (
            <span>
              Zuletzt: {formatDistanceToNow(lastSyncTime, { addSuffix: true, locale: de })}
            </span>
          )}
          {isSyncing && (
            <span className="flex items-center gap-1">
              <RefreshCw className="h-3 w-3 animate-spin" />
              Synchronisiere...
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
