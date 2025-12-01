import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const GOOGLE_CLIENT_ID = "609689183520-fuiuj6rl261f6b2gqigaq0pq28kp31.apps.googleusercontent.com";
const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.freebusy';

interface Calendar {
  id: string;
  summary: string;
  primary?: boolean;
}

interface TimeSlot {
  start: Date;
  end: Date;
  displayTime: string;
}

interface BusyPeriod {
  start: string;
  end: string;
}

export function useGoogleCalendar() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [calendars, setCalendars] = useState<Calendar[]>([]);
  const [selectedCalendarIds, setSelectedCalendarIds] = useState<string[]>([]);
  const [freeSlots, setFreeSlots] = useState<Record<string, TimeSlot[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem('google_access_token');
    if (token) {
      setAccessToken(token);
      setIsAuthenticated(true);
      fetchCalendars(token);
    }
  }, []);

  const signIn = useCallback(() => {
    const redirectUri = `${window.location.origin}/buchung`;
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${GOOGLE_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent(SCOPES)}&` +
      `access_type=offline&` +
      `prompt=consent`;
    
    window.location.href = authUrl;
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem('google_access_token');
    setAccessToken(null);
    setIsAuthenticated(false);
    setCalendars([]);
    setSelectedCalendarIds([]);
    setFreeSlots({});
  }, []);

  const exchangeCodeForToken = useCallback(async (code: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const redirectUri = `${window.location.origin}/buchung`;
      const { data, error } = await supabase.functions.invoke('google-calendar-auth/exchange', {
        body: { code, redirectUri }
      });

      if (error) throw error;

      const { access_token } = data;
      localStorage.setItem('google_access_token', access_token);
      setAccessToken(access_token);
      setIsAuthenticated(true);
      
      await fetchCalendars(access_token);
      
      // Clean up URL
      window.history.replaceState({}, document.title, '/buchung');
    } catch (err) {
      console.error('Token exchange error:', err);
      setError('Authentifizierung fehlgeschlagen');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchCalendars = async (token: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('google-calendar-auth/calendars', {
        body: { accessToken: token }
      });

      if (error) throw error;

      const calendarList = data.items || [];
      setCalendars(calendarList);
      
      // Auto-select primary calendar
      const primaryCalendar = calendarList.find((cal: Calendar) => cal.primary);
      if (primaryCalendar) {
        setSelectedCalendarIds([primaryCalendar.id]);
      }
    } catch (err) {
      console.error('Fetch calendars error:', err);
      setError('Kalender konnten nicht geladen werden');
    }
  };

  const fetchFreeSlots = useCallback(async (startDate: Date, endDate: Date) => {
    if (!accessToken || selectedCalendarIds.length === 0) return;

    try {
      setIsLoading(true);
      setError(null);

      const timeMin = startDate.toISOString();
      const timeMax = endDate.toISOString();

      const { data, error } = await supabase.functions.invoke('google-calendar-auth/freebusy', {
        body: {
          accessToken,
          calendarIds: selectedCalendarIds,
          timeMin,
          timeMax,
        }
      });

      if (error) throw error;

      // Compute free slots
      const slots = computeFreeSlots(startDate, endDate, data.calendars);
      setFreeSlots(slots);
    } catch (err) {
      console.error('Fetch free slots error:', err);
      setError('Verfügbare Zeiten konnten nicht geladen werden');
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, selectedCalendarIds]);

  const computeFreeSlots = (
    startDate: Date,
    endDate: Date,
    calendars: Record<string, { busy: BusyPeriod[] }>
  ): Record<string, TimeSlot[]> => {
    const slots: Record<string, TimeSlot[]> = {};
    
    // Merge busy periods from all selected calendars
    const allBusyPeriods: BusyPeriod[] = [];
    selectedCalendarIds.forEach(calId => {
      if (calendars[calId]?.busy) {
        allBusyPeriods.push(...calendars[calId].busy);
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

      // Generate 30-min slots from 09:00 to 17:00 (last slot starts at 16:30)
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
    isAuthenticated,
    accessToken,
    calendars,
    selectedCalendarIds,
    setSelectedCalendarIds,
    freeSlots,
    isLoading,
    error,
    signIn,
    signOut,
    exchangeCodeForToken,
    fetchFreeSlots,
  };
}
