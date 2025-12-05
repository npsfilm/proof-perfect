import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Home base for the photographer (Augsburg)
const HOME_BASE = {
  lat: 48.3705,
  lng: 10.8978,
};

// Default settings (fallback if no DB settings exist)
const DEFAULT_SETTINGS = {
  monday: { enabled: true, start: '08:00', end: '18:00' },
  tuesday: { enabled: true, start: '08:00', end: '18:00' },
  wednesday: { enabled: true, start: '08:00', end: '18:00' },
  thursday: { enabled: true, start: '08:00', end: '18:00' },
  friday: { enabled: true, start: '08:00', end: '18:00' },
  saturday: { enabled: false, start: '09:00', end: '14:00' },
  sunday: { enabled: false, start: '09:00', end: '14:00' },
  slot_interval: 30,
  buffer_before: 0,
  buffer_after: 15,
};

const DAY_KEYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

interface DaySchedule {
  enabled: boolean;
  start: string;
  end: string;
}

interface AvailabilitySettings {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
  slot_interval: number;
  buffer_before: number;
  buffer_after: number;
}

interface BlockedDate {
  start_date: string;
  end_date: string;
}

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

async function getAvailabilitySettings(supabase: any): Promise<AvailabilitySettings> {
  try {
    // Get the first admin user's settings
    const { data, error } = await supabase
      .from('availability_settings')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      console.log('No availability settings found, using defaults');
      return DEFAULT_SETTINGS;
    }

    return {
      monday: { enabled: data.monday_enabled, start: data.monday_start, end: data.monday_end },
      tuesday: { enabled: data.tuesday_enabled, start: data.tuesday_start, end: data.tuesday_end },
      wednesday: { enabled: data.wednesday_enabled, start: data.wednesday_start, end: data.wednesday_end },
      thursday: { enabled: data.thursday_enabled, start: data.thursday_start, end: data.thursday_end },
      friday: { enabled: data.friday_enabled, start: data.friday_start, end: data.friday_end },
      saturday: { enabled: data.saturday_enabled, start: data.saturday_start, end: data.saturday_end },
      sunday: { enabled: data.sunday_enabled, start: data.sunday_start, end: data.sunday_end },
      slot_interval: data.slot_interval,
      buffer_before: data.buffer_before,
      buffer_after: data.buffer_after,
    };
  } catch (error) {
    console.error('Error fetching availability settings:', error);
    return DEFAULT_SETTINGS;
  }
}

async function getBlockedDates(supabase: any): Promise<BlockedDate[]> {
  try {
    const { data, error } = await supabase
      .from('blocked_dates')
      .select('start_date, end_date');

    if (error || !data) {
      return [];
    }

    return data;
  } catch (error) {
    console.error('Error fetching blocked dates:', error);
    return [];
  }
}

function isDateBlocked(date: string, blockedDates: BlockedDate[]): boolean {
  const checkDate = new Date(date);
  
  for (const blocked of blockedDates) {
    const start = new Date(blocked.start_date);
    const end = new Date(blocked.end_date);
    
    if (checkDate >= start && checkDate <= end) {
      return true;
    }
  }
  
  return false;
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

function generateTimeSlots(daySchedule: DaySchedule, slotInterval: number): string[] {
  if (!daySchedule.enabled) return [];
  
  const slots: string[] = [];
  const [startHour, startMin] = daySchedule.start.split(':').map(Number);
  const [endHour, endMin] = daySchedule.end.split(':').map(Number);
  
  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;
  
  for (let mins = startMinutes; mins < endMinutes; mins += slotInterval) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    slots.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
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

    // Create Supabase client with service role for DB access
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch availability settings from database
    const settings = await getAvailabilitySettings(supabase);
    console.log('Using availability settings:', settings);

    // Fetch blocked dates from database
    const blockedDates = await getBlockedDates(supabase);
    console.log('Blocked dates:', blockedDates.length);

    // Check if the date is blocked
    if (isDateBlocked(date, blockedDates)) {
      console.log('Date is blocked:', date);
      return new Response(
        JSON.stringify({ slots: [], date, eventsCount: 0, blocked: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the day of week (0 = Sunday, 1 = Monday, etc.)
    const dayOfWeek = new Date(date).getDay();
    const dayKey = DAY_KEYS[dayOfWeek] as keyof AvailabilitySettings;
    const daySchedule = settings[dayKey] as DaySchedule;

    // Check if day is enabled
    if (!daySchedule.enabled) {
      console.log('Day is not enabled:', dayKey);
      return new Response(
        JSON.stringify({ slots: [], date, eventsCount: 0, dayDisabled: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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
    const allSlots = generateTimeSlots(daySchedule, settings.slot_interval);
    const validSlots: TimeSlot[] = [];

    const dayEndMinutes = timeToMinutes(daySchedule.end);

    for (const slotTime of allSlots) {
      const slotStartMinutes = timeToMinutes(slotTime);
      // Include buffer times in total duration
      const totalDuration = settings.buffer_before + durationMinutes + settings.buffer_after;
      const slotEndMinutes = slotStartMinutes + totalDuration;

      // Check if slot is within business hours
      if (slotEndMinutes > dayEndMinutes) {
        continue;
      }

      let isValid = true;
      let travelFromPrevious = driveFromHome;
      let travelToNext = driveFromHome;

      // Find previous and next events relative to this slot
      const previousEvent = sortedEvents
        .filter(e => e.end.getHours() * 60 + e.end.getMinutes() <= slotStartMinutes)
        .pop();

      const nextEvent = sortedEvents
        .find(e => e.start.getHours() * 60 + e.start.getMinutes() >= slotEndMinutes);

      // Check travel time from previous event (or home base)
      if (previousEvent) {
        const previousEndMinutes = previousEvent.end.getHours() * 60 + previousEvent.end.getMinutes();
        travelFromPrevious = await getDriveTime(previousEvent.location, targetLocation);
        
        if (previousEndMinutes + travelFromPrevious > slotStartMinutes) {
          isValid = false;
        }
      } else {
        // No previous event - must be able to travel from home
        const dayStartMinutes = timeToMinutes(daySchedule.start);
        const homeArrivalTime = dayStartMinutes + driveFromHome;
        if (homeArrivalTime > slotStartMinutes) {
          isValid = false;
        }
      }

      // Check travel time to next event
      if (nextEvent && isValid) {
        const nextStartMinutes = nextEvent.start.getHours() * 60 + nextEvent.start.getMinutes();
        travelToNext = await getDriveTime(targetLocation, nextEvent.location);
        
        if (slotEndMinutes + travelToNext > nextStartMinutes) {
          isValid = false;
        }
      }

      // Check for overlapping events
      for (const event of sortedEvents) {
        const eventStartMinutes = event.start.getHours() * 60 + event.start.getMinutes();
        const eventEndMinutes = event.end.getHours() * 60 + event.end.getMinutes();

        if (
          (slotStartMinutes >= eventStartMinutes && slotStartMinutes < eventEndMinutes) ||
          (slotEndMinutes > eventStartMinutes && slotEndMinutes <= eventEndMinutes) ||
          (slotStartMinutes <= eventStartMinutes && slotEndMinutes >= eventEndMinutes)
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
