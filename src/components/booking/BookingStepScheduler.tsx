import React, { useEffect, useState } from 'react';
import { useBooking } from '@/contexts/BookingContext';
import { useSmartAvailability } from '@/hooks/useSmartAvailability';
import { useRouteOptimizer } from '@/hooks/useRouteOptimizer';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { SlotCard } from './SlotCard';
import { format, addDays } from 'date-fns';
import { de } from 'date-fns/locale';
import { AlertTriangle, Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export function BookingStepScheduler() {
  const { properties, scheduleType, setSelectedSlots, nextStep, prevStep } = useBooking();
  const [selectedDate, setSelectedDate] = useState<Date>(addDays(new Date(), 1));
  const [selectedSlot, setSelectedSlot] = useState<any>(null);

  const totalDuration = properties.reduce((sum, p) => sum + p.durationMinutes, 0);

  const { data: availability, isLoading: availabilityLoading } = useSmartAvailability({
    date: format(selectedDate, 'yyyy-MM-dd'),
    duration_minutes: totalDuration,
    addresses: properties
      .filter(p => p.lat && p.lng)
      .map(p => ({ lat: p.lat!, lng: p.lng! })),
  });

  const routeOptimizer = useRouteOptimizer();

  useEffect(() => {
    if (properties.length > 0 && properties.every(p => p.lat && p.lng)) {
      routeOptimizer.mutate({
        properties: properties.map(p => ({
          address: p.address,
          lat: p.lat!,
          lng: p.lng!,
          duration_minutes: p.durationMinutes,
        })),
        date: format(selectedDate, 'yyyy-MM-dd'),
        single_day: scheduleType === 'single_day',
      });
    }
  }, [properties, selectedDate, scheduleType]);

  const handleSlotSelect = (slot: any) => {
    setSelectedSlot(slot);
    
    // Create slot selections for all properties
    const slotSelections = slot.slots?.map((s: any, i: number) => ({
      date: slot.date,
      start: s.start,
      end: s.end,
      isWeekendRequest: slot.type === 'weekend',
    })) || [{
      date: slot.date,
      start: slot.start,
      end: slot.end,
      isWeekendRequest: slot.is_weekend || slot.type === 'weekend',
    }];

    setSelectedSlots(slotSelections);
  };

  const handleNext = () => {
    if (selectedSlot) {
      nextStep();
    }
  };

  const isLoading = availabilityLoading || routeOptimizer.isPending;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Termin wählen</h2>
        <p className="text-muted-foreground">
          Wählen Sie einen passenden Termin für Ihre {properties.length} Immobilie{properties.length > 1 ? 'n' : ''}
        </p>
      </div>

      {/* Date picker */}
      <div className="flex items-center gap-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full sm:w-auto justify-start">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {format(selectedDate, 'PPP', { locale: de })}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              disabled={(date) => date < new Date()}
              locale={de}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      )}

      {/* Route optimizer suggestions */}
      {!isLoading && routeOptimizer.data?.suggestions && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">Vorschläge</h3>
          {routeOptimizer.data.suggestions.map((suggestion, index) => (
            <SlotCard
              key={index}
              type={suggestion.type}
              label={suggestion.label}
              description={suggestion.description}
              date={suggestion.date}
              slots={suggestion.slots}
              totalDriveTime={suggestion.total_drive_time_minutes}
              isSelected={selectedSlot?.type === suggestion.type && selectedSlot?.date === suggestion.date}
              onSelect={() => handleSlotSelect(suggestion)}
            />
          ))}
        </div>
      )}

      {/* Fallback to simple availability */}
      {!isLoading && !routeOptimizer.data && availability && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">Verfügbare Termine</h3>
          {availability.recommended?.slice(0, 5).map((slot, index) => (
            <SlotCard
              key={index}
              type="recommended"
              label={slot.is_weekend ? '📅 Wochenende (nur auf Anfrage)' : '🟢 Verfügbar'}
              description={slot.label || ''}
              date={slot.date}
              slots={[{ property_index: 1, address: properties[0]?.address, start: slot.start, end: slot.end }]}
              isSelected={selectedSlot?.date === slot.date && selectedSlot?.start === slot.start}
              onSelect={() => handleSlotSelect(slot)}
            />
          ))}

          {availability.weekend_requests?.length > 0 && (
            <>
              <h3 className="text-sm font-medium text-muted-foreground mt-6 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                Wochenende (nur auf Anfrage)
              </h3>
              {availability.weekend_requests.slice(0, 3).map((slot, index) => (
                <SlotCard
                  key={`weekend-${index}`}
                  type="weekend"
                  label="📅 Wochenende"
                  description="+25-50% Wochenendzuschlag"
                  date={slot.date}
                  slots={[{ property_index: 1, address: properties[0]?.address, start: slot.start, end: slot.end }]}
                  isSelected={selectedSlot?.date === slot.date && selectedSlot?.start === slot.start}
                  onSelect={() => handleSlotSelect(slot)}
                />
              ))}
            </>
          )}
        </div>
      )}

      {/* No results */}
      {!isLoading && !availability?.all?.length && !routeOptimizer.data && (
        <div className="text-center py-8 text-muted-foreground">
          <CalendarIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>Keine verfügbaren Termine für diesen Tag.</p>
          <p className="text-sm">Bitte wählen Sie ein anderes Datum.</p>
        </div>
      )}

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={prevStep}>
          Zurück
        </Button>
        <Button onClick={handleNext} disabled={!selectedSlot}>
          Weiter
        </Button>
      </div>
    </div>
  );
}
