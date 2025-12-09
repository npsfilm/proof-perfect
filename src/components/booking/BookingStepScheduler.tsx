import { useState } from 'react';
import { addDays, startOfDay } from 'date-fns';
import { useBooking } from '@/contexts/BookingContext';
import { useSmartAvailability } from '@/hooks/useSmartAvailability';
import {
  SchedulerHeader,
  SchedulerDateSelector,
  SchedulerTimeSlots,
  SchedulerConfirmation,
  SchedulerNavigation,
} from './scheduler';

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

  const handleSelectTime = (time: string) => {
    if (selectedDate) {
      setScheduledTime(time, selectedDate);
    }
  };

  const canContinue = !!(currentProperty.scheduledTime && currentProperty.scheduledDate);

  return (
    <div className="flex flex-col items-center min-h-[400px] px-4 py-8">
      <SchedulerHeader />

      <SchedulerDateSelector
        dates={dates}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
      />

      {selectedDate && (
        <SchedulerTimeSlots
          selectedDate={selectedDate}
          slots={slots}
          isLoading={isLoading}
          error={error}
          currentScheduledTime={currentProperty.scheduledTime}
          currentScheduledDate={currentProperty.scheduledDate}
          onSelectTime={handleSelectTime}
        />
      )}

      {currentProperty.scheduledTime && currentProperty.scheduledDate && (
        <SchedulerConfirmation
          scheduledDate={currentProperty.scheduledDate}
          scheduledTime={currentProperty.scheduledTime}
        />
      )}

      <SchedulerNavigation
        canContinue={canContinue}
        onPrev={prevStep}
        onNext={nextStep}
      />
    </div>
  );
}
