import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface AvailableTime {
  status: string;
  start_time: string;
  invitees_remaining: number;
}

interface BookingTimeSlotsProps {
  times: AvailableTime[];
  selectedTime: AvailableTime | null;
  onSelectTime: (time: AvailableTime) => void;
  isLoading?: boolean;
  selectedDate: Date | null;
}

export function BookingTimeSlots({
  times,
  selectedTime,
  onSelectTime,
  isLoading,
  selectedDate,
}: BookingTimeSlotsProps) {
  if (!selectedDate) {
    return (
      <div className="bg-background rounded-3xl shadow-neu-flat p-6 h-full flex items-center justify-center">
        <p className="text-muted-foreground text-center">
          Wählen Sie ein Datum aus dem Kalender
        </p>
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className="bg-background rounded-3xl shadow-neu-flat p-6 space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground mb-4">
          Verfügbare Zeiten
        </h3>
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-xl" />
        ))}
      </div>
    );
  }
  
  const availableTimes = times.filter(t => t.status === 'available');
  
  if (availableTimes.length === 0) {
    return (
      <div className="bg-background rounded-3xl shadow-neu-flat p-6 h-full flex flex-col">
        <h3 className="text-sm font-medium text-muted-foreground mb-4">
          {format(selectedDate, 'EEEE, d. MMMM', { locale: de })}
        </h3>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground text-center">
            Keine verfügbaren Zeiten an diesem Tag
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-background rounded-3xl shadow-neu-flat p-6">
      <h3 className="text-sm font-medium text-muted-foreground mb-4">
        {format(selectedDate, 'EEEE, d. MMMM', { locale: de })}
      </h3>
      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
        {availableTimes.map((time) => {
          const startTime = parseISO(time.start_time);
          const isSelected = selectedTime?.start_time === time.start_time;
          
          return (
            <button
              key={time.start_time}
              onClick={() => onSelectTime(time)}
              className={cn(
                "w-full py-3 px-4 rounded-xl text-center font-medium transition-all",
                isSelected
                  ? "bg-primary text-primary-foreground shadow-neu-pressed"
                  : "bg-background shadow-neu-flat-sm hover:shadow-neu-flat hover:scale-[1.02]"
              )}
            >
              {format(startTime, 'HH:mm', { locale: de })} Uhr
            </button>
          );
        })}
      </div>
    </div>
  );
}
