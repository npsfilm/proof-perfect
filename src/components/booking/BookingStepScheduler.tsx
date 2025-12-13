import React, { useEffect, useCallback } from 'react';
import { useBooking } from '@/contexts/BookingContext';
import { useSmartAvailability } from '@/hooks/useSmartAvailability';
import { useRouteOptimizer } from '@/hooks/useRouteOptimizer';
import { Button } from '@/components/ui/button';
import { SchedulerDatePicker } from './SchedulerDatePicker';
import { SchedulerSlotList } from './SchedulerSlotList';
import { useSlotSelection } from './hooks/useSlotSelection';
import { format, addDays } from 'date-fns';
import { useState } from 'react';

export function BookingStepScheduler() {
  const { properties, scheduleType, setSelectedSlots, nextStep, prevStep } = useBooking();
  const [selectedDate, setSelectedDate] = useState<Date>(addDays(new Date(), 1));
  const { selectedSlot, handleSlotSelect } = useSlotSelection(setSelectedSlots);

  const totalDuration = properties.reduce((sum, p) => sum + p.durationMinutes, 0);

  const { data: availability, isLoading: availabilityLoading } = useSmartAvailability({
    date: format(selectedDate, 'yyyy-MM-dd'),
    duration_minutes: totalDuration,
    addresses: properties
      .filter(p => p.lat && p.lng)
      .map(p => ({ lat: p.lat!, lng: p.lng! })),
  });

  const routeOptimizer = useRouteOptimizer();

  const triggerRouteOptimizer = useCallback(() => {
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
  }, [properties, selectedDate, scheduleType, routeOptimizer]);

  useEffect(() => {
    triggerRouteOptimizer();
  }, [triggerRouteOptimizer]);

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

      <SchedulerDatePicker
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
      />

      <SchedulerSlotList
        isLoading={isLoading}
        routeOptimizerData={routeOptimizer.data}
        availabilityData={availability}
        properties={properties}
        selectedSlot={selectedSlot}
        onSlotSelect={handleSlotSelect}
      />

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
