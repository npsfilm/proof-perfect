import { format, isSameDay } from 'date-fns';
import { de } from 'date-fns/locale';
import { Clock, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SchedulerTimeSlotsProps } from './types';

export function SchedulerTimeSlots({
  selectedDate,
  slots,
  isLoading,
  error,
  currentScheduledTime,
  currentScheduledDate,
  onSelectTime,
}: SchedulerTimeSlotsProps) {
  const availableSlots = slots.filter(s => s.available);

  return (
    <div className="w-full max-w-3xl mb-8">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
        Verfügbare Zeiten für {format(selectedDate, 'EEEE, d. MMMM', { locale: de })}
      </h3>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <span className="ml-3 text-muted-foreground">Verfügbarkeit wird geprüft...</span>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-12 text-destructive">
          <AlertCircle className="w-6 h-6 mr-2" />
          <span>{error}</span>
        </div>
      ) : availableSlots.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Keine verfügbaren Zeiten an diesem Tag.</p>
          <p className="text-sm">Bitte wählen Sie ein anderes Datum.</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {availableSlots.map((slot) => {
            const isSelected = currentScheduledTime === slot.time &&
              currentScheduledDate &&
              isSameDay(currentScheduledDate, selectedDate);

            return (
              <button
                key={slot.time}
                onClick={() => onSelectTime(slot.time)}
                className={cn(
                  'py-3 px-4 rounded-lg border-2 text-center transition-all font-medium',
                  isSelected
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card hover:border-primary/50'
                )}
              >
                {slot.time}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
