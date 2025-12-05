import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar, RefreshCw, Link2, Unlink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { CalendarView } from '@/hooks/useCalendarNavigation';
import { useGoogleCalendarAuth } from '@/hooks/useGoogleCalendarAuth';
import { useGoogleCalendarSync } from '@/hooks/useGoogleCalendarSync';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface CalendarHeaderProps {
  currentDate: Date;
  view: CalendarView;
  onViewChange: (view: CalendarView) => void;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
}

export function CalendarHeader({
  currentDate,
  view,
  onViewChange,
  onPrevious,
  onNext,
  onToday,
}: CalendarHeaderProps) {
  const { isConnected, isLoadingToken, initiateOAuth, disconnectCalendar } = useGoogleCalendarAuth();
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
      <div className="flex items-center justify-between">
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

          <div className="flex items-center gap-2">
            {isConnected && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => sync()}
                disabled={isSyncing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Synchronisiere...' : 'Sync'}
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" disabled={isLoadingToken}>
                  <Calendar className="h-4 w-4 mr-2" />
                  {isConnected ? 'Google verbunden' : 'Google verbinden'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {isConnected ? (
                  <>
                    <DropdownMenuItem onClick={() => sync()} disabled={isSyncing}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Jetzt synchronisieren
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => disconnectCalendar.mutate()}
                      className="text-destructive"
                    >
                      <Unlink className="h-4 w-4 mr-2" />
                      Verbindung trennen
                    </DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem onClick={initiateOAuth}>
                    <Link2 className="h-4 w-4 mr-2" />
                    Mit Google Kalender verbinden
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {lastSyncTime && (
        <p className="text-xs text-muted-foreground">
          Zuletzt synchronisiert: {format(lastSyncTime, 'HH:mm', { locale: de })}
        </p>
      )}
    </div>
  );
}
