import { useState, useCallback } from 'react';

interface TimeSlot {
  start: Date;
  end: Date;
  displayTime: string;
}

interface BusyPeriod {
  start: string;
  end: string;
}

export function usePublicBooking() {
  const [freeSlots, setFreeSlots] = useState<Record<string, TimeSlot[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAvailability = useCallback(async (startDate: Date, endDate: Date) => {
    try {
      setIsLoading(true);
      setError(null);

      const timeMin = startDate.toISOString();
      const timeMax = endDate.toISOString();

      // Use direct fetch for better control and error handling
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/google-calendar-booking/availability`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({ startDate: timeMin, endDate: timeMax }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Verfügbarkeit konnte nicht geladen werden');
      }

      // Null-check for calendars
      if (!data.calendars) {
        throw new Error('Keine Kalenderdaten erhalten');
      }

      // Compute free slots from busy periods
      const slots = computeFreeSlots(startDate, endDate, data.calendars);
      setFreeSlots(slots);
    } catch (err) {
      console.error('Fetch availability error:', err);
      setError(err instanceof Error ? err.message : 'Verfügbare Zeiten konnten nicht geladen werden');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createBooking = useCallback(async (
    name: string,
    email: string,
    phone: string,
    message: string,
    bookingDate: string,
    bookingTime: string
  ) => {
    try {
      setIsLoading(true);
      setError(null);

      // Use direct fetch for better control
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/google-calendar-booking/book`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({
            name,
            email,
            phone,
            message,
            bookingDate,
            bookingTime,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Buchung konnte nicht erstellt werden');
      }

      return { success: true, data };
    } catch (err) {
      console.error('Create booking error:', err);
      setError(err instanceof Error ? err.message : 'Buchung konnte nicht erstellt werden');
      return { success: false, error: err };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const computeFreeSlots = (
    startDate: Date,
    endDate: Date,
    calendars: Record<string, { busy: BusyPeriod[] }>
  ): Record<string, TimeSlot[]> => {
    const slots: Record<string, TimeSlot[]> = {};
    
    // Merge busy periods from calendar
    const allBusyPeriods: BusyPeriod[] = [];
    Object.values(calendars || {}).forEach(cal => {
      if (cal?.busy) {
        allBusyPeriods.push(...cal.busy);
      }
    });

    // Sort busy periods
    allBusyPeriods.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

    // Generate slots for each day
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      // Skip weekends
      if (currentDate.getDay() === 0 || currentDate.getDay() === 6) {
        currentDate.setDate(currentDate.getDate() + 1);
        continue;
      }

      const dateKey = currentDate.toISOString().split('T')[0];
      const daySlots: TimeSlot[] = [];

      // Generate 30-min slots from 09:00 to 17:00
      for (let hour = 9; hour < 17; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const slotStart = new Date(currentDate);
          slotStart.setHours(hour, minute, 0, 0);
          
          const slotEnd = new Date(slotStart);
          slotEnd.setMinutes(slotEnd.getMinutes() + 30);

          // Check if slot overlaps with any busy period
          const isBusy = allBusyPeriods.some(busy => {
            const busyStart = new Date(busy.start);
            const busyEnd = new Date(busy.end);
            return (
              (slotStart >= busyStart && slotStart < busyEnd) ||
              (slotEnd > busyStart && slotEnd <= busyEnd) ||
              (slotStart <= busyStart && slotEnd >= busyEnd)
            );
          });

          if (!isBusy) {
            daySlots.push({
              start: slotStart,
              end: slotEnd,
              displayTime: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
            });
          }
        }
      }

      slots[dateKey] = daySlots;
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return slots;
  };

  return {
    freeSlots,
    isLoading,
    error,
    fetchAvailability,
    createBooking,
  };
}
