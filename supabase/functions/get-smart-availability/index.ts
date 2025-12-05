import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Home base for the photographer (Augsburg)
const HOME_BASE = {
  lat: 48.3705,
  lng: 10.8978,
};

// Business hours
const BUSINESS_START = 8; // 08:00
const BUSINESS_END = 18; // 18:00
const SLOT_INTERVAL = 30; // minutes

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

async function getCalendlyEvents(date: string): Promise<CalendlyEvent[]> {
  const CALENDLY_API_KEY = Deno.env.get('CALENDLY_API_KEY');
  if (!CALENDLY_API_KEY) {
    console.log('No Calendly API key, returning empty events');
    return [];
  }

  try {
    // First get user URI
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

    // Get scheduled events for the date
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
    return 30; // Default 30 minutes
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
    return Math.ceil(durationSeconds / 60); // Convert to minutes, round up
  } catch (error) {
    console.error('Mapbox API error:', error);
    return 30;
  }
}

function generateTimeSlots(): string[] {
  const slots: string[] = [];
  for (let hour = BUSINESS_START; hour < BUSINESS_END; hour++) {
    for (let minute = 0; minute < 60; minute += SLOT_INTERVAL) {
      slots.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
    }
  }
  return slots;
}

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
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

    // Generate all possible time slots
    const allSlots = generateTimeSlots();
    const validSlots: TimeSlot[] = [];

    for (const slotTime of allSlots) {
      const slotStartMinutes = timeToMinutes(slotTime);
      const slotEndMinutes = slotStartMinutes + durationMinutes;

      // Check if slot is within business hours
      if (slotEndMinutes > BUSINESS_END * 60) {
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
        
        // Must have enough time to travel from previous event
        if (previousEndMinutes + travelFromPrevious > slotStartMinutes) {
          isValid = false;
        }
      } else {
        // No previous event - must be able to travel from home
        const homeArrivalTime = BUSINESS_START * 60 + driveFromHome;
        if (homeArrivalTime > slotStartMinutes) {
          isValid = false;
        }
      }

      // Check travel time to next event
      if (nextEvent && isValid) {
        const nextStartMinutes = nextEvent.start.getHours() * 60 + nextEvent.start.getMinutes();
        travelToNext = await getDriveTime(targetLocation, nextEvent.location);
        
        // Must have enough time to travel to next event
        if (slotEndMinutes + travelToNext > nextStartMinutes) {
          isValid = false;
        }
      }

      // Check for overlapping events
      for (const event of sortedEvents) {
        const eventStartMinutes = event.start.getHours() * 60 + event.start.getMinutes();
        const eventEndMinutes = event.end.getHours() * 60 + event.end.getMinutes();

        // Check if slot overlaps with event
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
