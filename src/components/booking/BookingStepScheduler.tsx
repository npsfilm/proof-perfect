import { useState } from 'react';
import { format, addDays, isSameDay, isAfter, startOfDay } from 'date-fns';
import { de } from 'date-fns/locale';
import { CalendarDays, Clock, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBooking } from '@/contexts/BookingContext';
import { useSmartAvailability } from '@/hooks/useSmartAvailability';
import { cn } from '@/lib/utils';

export function BookingStepScheduler() {
  const { currentProperty, setScheduledTime, nextStep, prevStep, batchId, getTotalDuration } = useBooking();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const { slots, isLoading, error } = useSmartAvailability({
    date: selectedDate,
    coordinates: currentProperty.coordinates,
    durationMinutes: getTotalDuration(),
    batchId,
  });

  // Generate next 14 days for date selection
  const today = startOfDay(new Date());
  const dates = Array.from({ length: 14 }, (_, i) => addDays(today, i + 1));

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date);
  };

  const handleSelectTime = (time: string) => {
    if (selectedDate) {
      setScheduledTime(time, selectedDate);
    }
  };

  const availableSlots = slots.filter(s => s.available);

  return (
    <div className="flex flex-col items-center min-h-[400px] px-4 py-8">
      <div className="text-center mb-8">
        <CalendarDays className="w-16 h-16 mx-auto text-primary mb-4" />
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
          Termin wählen
        </h2>
        <p className="text-muted-foreground">
          Wählen Sie einen passenden Termin für Ihr Shooting.
        </p>
      </div>

      {/* Date selector */}
      <div className="w-full max-w-3xl mb-8">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Datum auswählen
        </h3>
        <div className="flex gap-2 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
          {dates.map((date) => {
            const isSelected = selectedDate && isSameDay(date, selectedDate);
            const dayName = format(date, 'EEE', { locale: de });
            const dayNumber = format(date, 'd');
            const monthName = format(date, 'MMM', { locale: de });

            return (
              <button
                key={date.toISOString()}
                onClick={() => handleSelectDate(date)}
                className={cn(
                  'flex-shrink-0 w-16 py-3 rounded-xl border-2 text-center transition-all',
                  isSelected
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card hover:border-primary/50'
                )}
              >
                <p className={cn('text-xs font-medium', isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground')}>
                  {dayName}
                </p>
                <p className="text-xl font-bold">{dayNumber}</p>
                <p className={cn('text-xs', isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground')}>
                  {monthName}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Time slots */}
      {selectedDate && (
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
                const isSelected = currentProperty.scheduledTime === slot.time &&
                  currentProperty.scheduledDate &&
                  isSameDay(currentProperty.scheduledDate, selectedDate);

                return (
                  <button
                    key={slot.time}
                    onClick={() => handleSelectTime(slot.time)}
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
      )}

      {/* Selected time confirmation */}
      {currentProperty.scheduledTime && currentProperty.scheduledDate && (
        <div className="w-full max-w-3xl p-4 bg-primary/5 border border-primary/20 rounded-xl mb-8">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-primary" />
            <div>
              <p className="font-medium">
                {format(currentProperty.scheduledDate, 'EEEE, d. MMMM yyyy', { locale: de })}
              </p>
              <p className="text-lg font-bold text-primary">
                {currentProperty.scheduledTime} Uhr
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-3 w-full max-w-md">
        <Button variant="outline" size="lg" className="flex-1" onClick={prevStep}>
          Zurück
        </Button>
        <Button
          size="lg"
          className="flex-1"
          onClick={nextStep}
          disabled={!currentProperty.scheduledTime || !currentProperty.scheduledDate}
        >
          Weiter
        </Button>
      </div>
    </div>
  );
}
