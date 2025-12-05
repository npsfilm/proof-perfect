import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.86.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Home base for the photographer (Augsburg)
const HOME_BASE = {
  lat: 48.3705,
  lng: 10.8978,
};

// Default business hours (fallback if no settings)
const DEFAULT_BUSINESS_START = 8;
const DEFAULT_BUSINESS_END = 18;
const DEFAULT_SLOT_INTERVAL = 30;
const DEFAULT_BUFFER_BEFORE = 0;
const DEFAULT_BUFFER_AFTER = 15;

interface CalendlyEvent {
  start_time: string;
  end_time: string;
  location?: {
    location?: string;
    coordinates?: { lat: number; lng: number };
  };
}

interface TimeSlot {
  time: string;
  available: boolean;
  travelInfo?: {
    fromPrevious: number;
    toNext: number;
  };
}

interface AvailabilitySettings {
  monday_enabled: boolean;
  monday_start: string;
  monday_end: string;
  tuesday_enabled: boolean;
  tuesday_start: string;
  tuesday_end: string;
  wednesday_enabled: boolean;
  wednesday_start: string;
  wednesday_end: string;
  thursday_enabled: boolean;
  thursday_start: string;
  thursday_end: string;
  friday_enabled: boolean;
  friday_start: string;
  friday_end: string;
  saturday_enabled: boolean;
  saturday_start: string;
  saturday_end: string;
  sunday_enabled: boolean;
  sunday_start: string;
  sunday_end: string;
  slot_interval: number;
  buffer_before: number;
  buffer_after: number;
}

const DAY_KEYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;

async function getAvailabilitySettings(supabase: any, userId: string): Promise<AvailabilitySettings | null> {
  const { data, error } = await supabase
    .from('availability_settings')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching availability settings:', error);
    return null;
  }
  return data;
}

async function getBlockedDates(supabase: any, userId: string): Promise<{ start_date: string; end_date: string }[]> {
  const { data, error } = await supabase
    .from('blocked_dates')
    .select('start_date, end_date')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching blocked dates:', error);
    return [];
  }
  return data || [];
}

function isDateBlocked(date: string, blockedDates: { start_date: string; end_date: string }[]): boolean {
  const checkDate = new Date(date);
  for (const blocked of blockedDates) {
    const startDate = new Date(blocked.start_date);
    const endDate = new Date(blocked.end_date);
    if (checkDate >= startDate && checkDate <= endDate) {
      return true;
    }
  }
  return false;
}

function getDaySettings(settings: AvailabilitySettings | null, date: Date): { enabled: boolean; start: number; end: number } {
  if (!settings) {
    return {
      enabled: date.getDay() >= 1 && date.getDay() <= 5, // Mon-Fri
      start: DEFAULT_BUSINESS_START,
      end: DEFAULT_BUSINESS_END,
    };
  }

  const dayKey = DAY_KEYS[date.getDay()];
  const enabled = settings[`${dayKey}_enabled` as keyof AvailabilitySettings] as boolean;
  const startTime = settings[`${dayKey}_start` as keyof AvailabilitySettings] as string;
  const endTime = settings[`${dayKey}_end` as keyof AvailabilitySettings] as string;

  return {
    enabled,
    start: parseInt(startTime.split(':')[0]),
    end: parseInt(endTime.split(':')[0]),
  };
}

async function getCalendlyEvents(date: string): Promise<CalendlyEvent[]> {
  const CALENDLY_API_KEY = Deno.env.get('CALENDLY_API_KEY');
  if (!CALENDLY_API_KEY) {
    console.log('No Calendly API key, returning empty events');
    return [];
  }

  try {
    const userResponse = await fetch('https://api.calendly.com/users/me', {
      headers: { 'Authorization': `Bearer ${CALENDLY_API_KEY}` }
    });
    
    if (!userResponse.ok) {
      console.error('Failed to get Calendly user');
      return [];
    }
    
    const userData = await userResponse.json();
    const userUri = userData.resource?.uri;
    
    if (!userUri) return [];

    const startTime = `${date}T00:00:00Z`;
    const endTime = `${date}T23:59:59Z`;
    
    const eventsResponse = await fetch(
      `https://api.calendly.com/scheduled_events?user=${encodeURIComponent(userUri)}&min_start_time=${startTime}&max_start_time=${endTime}&status=active`,
      { headers: { 'Authorization': `Bearer ${CALENDLY_API_KEY}` } }
    );

    if (!eventsResponse.ok) {
      console.error('Failed to get Calendly events');
      return [];
    }

    const eventsData = await eventsResponse.json();
    return eventsData.collection || [];
  } catch (error) {
    console.error('Calendly API error:', error);
    return [];
  }
}

async function getDriveTime(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number }
): Promise<number> {
  const MAPBOX_TOKEN = Deno.env.get('MAPBOX_ACCESS_TOKEN');
  if (!MAPBOX_TOKEN) {
    console.log('No Mapbox token, using default drive time');
    return 30;
  }

  try {
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${from.lng},${from.lat};${to.lng},${to.lat}?access_token=${MAPBOX_TOKEN}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error('Mapbox directions error:', response.status);
      return 30;
    }

    const data = await response.json();
    const durationSeconds = data.routes?.[0]?.duration || 1800;
    return Math.ceil(durationSeconds / 60);
  } catch (error) {
    console.error('Mapbox API error:', error);
    return 30;
  }
}

function generateTimeSlots(startHour: number, endHour: number, interval: number): string[] {
  const slots: string[] = [];
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += interval) {
      slots.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
    }
  }
  return slots;
}

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { date, targetLocation, durationMinutes, batchId } = await req.json();
    console.log('Smart availability request:', { date, targetLocation, durationMinutes, batchId });

    if (!date || !targetLocation || !durationMinutes) {
      throw new Error('Missing required parameters');
    }

    // Create Supabase client
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get admin user ID (first admin in the system for now)
    const { data: adminRole } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'admin')
      .limit(1)
      .single();

    const adminUserId = adminRole?.user_id;

    // Fetch availability settings and blocked dates
    const settings = adminUserId ? await getAvailabilitySettings(supabase, adminUserId) : null;
    const blockedDates = adminUserId ? await getBlockedDates(supabase, adminUserId) : [];

    // Check if date is blocked
    if (isDateBlocked(date, blockedDates)) {
      console.log('Date is blocked:', date);
      return new Response(
        JSON.stringify({ slots: [], date, eventsCount: 0, blocked: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get day-specific settings
    const requestDate = new Date(date);
    const daySettings = getDaySettings(settings, requestDate);

    if (!daySettings.enabled) {
      console.log('Day is not enabled:', DAY_KEYS[requestDate.getDay()]);
      return new Response(
        JSON.stringify({ slots: [], date, eventsCount: 0, dayDisabled: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const slotInterval = settings?.slot_interval || DEFAULT_SLOT_INTERVAL;
    const bufferBefore = settings?.buffer_before || DEFAULT_BUFFER_BEFORE;
    const bufferAfter = settings?.buffer_after || DEFAULT_BUFFER_AFTER;

    // Get existing events from Calendly
    const events = await getCalendlyEvents(date);
    console.log('Found Calendly events:', events.length);

    // Sort events by start time
    const sortedEvents = events
      .map(e => ({
        start: new Date(e.start_time),
        end: new Date(e.end_time),
        location: e.location?.coordinates || HOME_BASE,
      }))
      .sort((a, b) => a.start.getTime() - b.start.getTime());

    // Calculate drive time from home base to target
    const driveFromHome = await getDriveTime(HOME_BASE, targetLocation);
    console.log('Drive time from home:', driveFromHome, 'minutes');

    // Generate time slots based on settings
    const allSlots = generateTimeSlots(daySettings.start, daySettings.end, slotInterval);
    const validSlots: TimeSlot[] = [];

    for (const slotTime of allSlots) {
      const slotStartMinutes = timeToMinutes(slotTime);
      const slotEndMinutes = slotStartMinutes + durationMinutes;

      // Check if slot is within business hours (including buffer after)
      if (slotEndMinutes + bufferAfter > daySettings.end * 60) {
        continue;
      }

      let isValid = true;
      let travelFromPrevious = driveFromHome;
      let travelToNext = driveFromHome;

      // Find previous and next events relative to this slot
      const previousEvent = sortedEvents
        .filter(e => e.end.getHours() * 60 + e.end.getMinutes() <= slotStartMinutes - bufferBefore)
        .pop();

      const nextEvent = sortedEvents
        .find(e => e.start.getHours() * 60 + e.start.getMinutes() >= slotEndMinutes + bufferAfter);

      // Check travel time from previous event (or home base)
      if (previousEvent) {
        const previousEndMinutes = previousEvent.end.getHours() * 60 + previousEvent.end.getMinutes();
        travelFromPrevious = await getDriveTime(previousEvent.location, targetLocation);
        
        if (previousEndMinutes + travelFromPrevious + bufferBefore > slotStartMinutes) {
          isValid = false;
        }
      } else {
        const homeArrivalTime = daySettings.start * 60 + driveFromHome;
        if (homeArrivalTime > slotStartMinutes) {
          isValid = false;
        }
      }

      // Check travel time to next event
      if (nextEvent && isValid) {
        const nextStartMinutes = nextEvent.start.getHours() * 60 + nextEvent.start.getMinutes();
        travelToNext = await getDriveTime(targetLocation, nextEvent.location);
        
        if (slotEndMinutes + travelToNext + bufferAfter > nextStartMinutes) {
          isValid = false;
        }
      }

      // Check for overlapping events (including buffers)
      for (const event of sortedEvents) {
        const eventStartMinutes = event.start.getHours() * 60 + event.start.getMinutes();
        const eventEndMinutes = event.end.getHours() * 60 + event.end.getMinutes();

        const slotWithBufferStart = slotStartMinutes - bufferBefore;
        const slotWithBufferEnd = slotEndMinutes + bufferAfter;

        if (
          (slotWithBufferStart >= eventStartMinutes && slotWithBufferStart < eventEndMinutes) ||
          (slotWithBufferEnd > eventStartMinutes && slotWithBufferEnd <= eventEndMinutes) ||
          (slotWithBufferStart <= eventStartMinutes && slotWithBufferEnd >= eventEndMinutes)
        ) {
          isValid = false;
          break;
        }
      }

      if (isValid) {
        validSlots.push({
          time: slotTime,
          available: true,
          travelInfo: {
            fromPrevious: travelFromPrevious,
            toNext: travelToNext,
          },
        });
      }
    }

    console.log('Valid slots found:', validSlots.length);

    return new Response(
      JSON.stringify({ slots: validSlots, date, eventsCount: events.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Smart availability error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage, slots: [] }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
