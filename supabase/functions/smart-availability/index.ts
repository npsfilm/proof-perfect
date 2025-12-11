import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AvailabilityRequest {
  date?: string; // specific date or null for next 14 days
  duration_minutes: number;
  addresses?: { lat: number; lng: number }[];
}

interface TimeSlot {
  date: string;
  start: string;
  end: string;
  is_weekend: boolean;
  is_request_only: boolean;
  label?: string;
  efficiency_score?: number;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { date, duration_minutes, addresses } = await req.json() as AvailabilityRequest;

    // Get availability settings
    const { data: settings } = await supabase
      .from('availability_settings')
      .select('*')
      .limit(1)
      .maybeSingle();

    // Default settings if none exist
    const defaultSettings = {
      monday_enabled: true, monday_start: '08:00', monday_end: '18:00',
      tuesday_enabled: true, tuesday_start: '08:00', tuesday_end: '18:00',
      wednesday_enabled: true, wednesday_start: '08:00', wednesday_end: '18:00',
      thursday_enabled: true, thursday_start: '08:00', thursday_end: '18:00',
      friday_enabled: true, friday_start: '08:00', friday_end: '18:00',
      saturday_enabled: false, saturday_start: '09:00', saturday_end: '14:00',
      sunday_enabled: false, sunday_start: '09:00', sunday_end: '14:00',
      slot_interval: 30,
      buffer_before: 0,
      buffer_after: 15,
    };

    const availSettings = settings || defaultSettings;

    // Get blocked dates
    const { data: blockedDates } = await supabase
      .from('blocked_dates')
      .select('start_date, end_date')
      .gte('end_date', new Date().toISOString().split('T')[0]);

    // Get existing bookings
    const startDate = date || new Date().toISOString().split('T')[0];
    const endDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const { data: existingBookings } = await supabase
      .from('bookings')
      .select('scheduled_date, scheduled_start, scheduled_end, status')
      .gte('scheduled_date', startDate)
      .lte('scheduled_date', endDate)
      .in('status', ['confirmed', 'request']);

    // Generate available slots
    const slots: TimeSlot[] = [];
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

    for (let i = 0; i < 14; i++) {
      const currentDate = new Date(Date.now() + i * 24 * 60 * 60 * 1000);
      const dateStr = currentDate.toISOString().split('T')[0];
      const dayOfWeek = currentDate.getDay();
      const dayName = dayNames[dayOfWeek];

      // Check if date is blocked
      const isBlocked = blockedDates?.some(bd => 
        dateStr >= bd.start_date && dateStr <= bd.end_date
      );
      if (isBlocked) continue;

      // Get day settings
      const dayEnabled = availSettings[`${dayName}_enabled`];
      const dayStart = availSettings[`${dayName}_start`];
      const dayEnd = availSettings[`${dayName}_end`];

      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      // Skip if day is disabled (but still allow weekend requests)
      if (!dayEnabled && !isWeekend) continue;

      // Generate time slots
      const startHour = parseInt(dayStart.split(':')[0]);
      const startMin = parseInt(dayStart.split(':')[1]);
      const endHour = parseInt(dayEnd.split(':')[0]);
      const endMin = parseInt(dayEnd.split(':')[1]);

      const slotDuration = duration_minutes + availSettings.buffer_after;
      const interval = availSettings.slot_interval;

      for (let hour = startHour; hour < endHour; hour++) {
        for (let min = hour === startHour ? startMin : 0; min < 60; min += interval) {
          const slotStart = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
          
          // Calculate slot end
          const endMinutes = hour * 60 + min + slotDuration;
          const slotEndHour = Math.floor(endMinutes / 60);
          const slotEndMin = endMinutes % 60;
          
          // Skip if slot extends beyond working hours
          if (slotEndHour > endHour || (slotEndHour === endHour && slotEndMin > endMin)) continue;

          const slotEnd = `${slotEndHour.toString().padStart(2, '0')}:${slotEndMin.toString().padStart(2, '0')}`;

          // Check for conflicts with existing bookings
          const hasConflict = existingBookings?.some(booking => {
            if (booking.scheduled_date !== dateStr) return false;
            const bookingStart = booking.scheduled_start;
            const bookingEnd = booking.scheduled_end;
            return slotStart < bookingEnd && slotEnd > bookingStart;
          });

          if (hasConflict) continue;

          // Skip past slots for today
          if (i === 0) {
            const now = new Date();
            const slotTime = new Date(`${dateStr}T${slotStart}:00`);
            if (slotTime <= now) continue;
          }

          slots.push({
            date: dateStr,
            start: slotStart,
            end: slotEnd,
            is_weekend: isWeekend,
            is_request_only: isWeekend,
            label: isWeekend ? 'Nur auf Anfrage (+25-50%)' : undefined,
          });
        }
      }
    }

    // Sort and categorize slots
    const categorizedSlots = {
      recommended: slots.filter(s => !s.is_weekend).slice(0, 5),
      all: slots,
      weekend_requests: slots.filter(s => s.is_weekend),
    };

    return new Response(JSON.stringify(categorizedSlots), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Error in smart-availability:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
