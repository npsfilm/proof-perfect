import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-secret',
};

interface WebhookBookingPayload {
  secret?: string;
  address: string;
  package_type: 'foto' | 'drohne' | 'kombi';
  photo_count: number;
  date: string;
  start_time: string;
  contact_name: string;
  contact_email: string;
  contact_phone?: string;
  company_name?: string;
  notes?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify webhook secret
    const webhookSecret = Deno.env.get('WEBHOOK_SECRET');
    const providedSecret = req.headers.get('x-webhook-secret') || (await req.clone().json()).secret;

    if (!webhookSecret || providedSecret !== webhookSecret) {
      console.error('Invalid webhook secret');
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const payload = await req.json() as WebhookBookingPayload;

    // Validate required fields
    const requiredFields = ['address', 'package_type', 'photo_count', 'date', 'start_time', 'contact_name', 'contact_email'];
    for (const field of requiredFields) {
      if (!payload[field as keyof WebhookBookingPayload]) {
        return new Response(JSON.stringify({ error: `Missing required field: ${field}` }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Get package duration
    const { data: packageData } = await supabase
      .from('booking_packages')
      .select('duration_minutes')
      .eq('package_type', payload.package_type)
      .eq('photo_count', payload.photo_count)
      .maybeSingle();

    if (!packageData) {
      return new Response(JSON.stringify({ error: 'Invalid package configuration' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Calculate end time
    const [startHour, startMin] = payload.start_time.split(':').map(Number);
    const endMinutes = startHour * 60 + startMin + packageData.duration_minutes;
    const endTime = `${Math.floor(endMinutes / 60).toString().padStart(2, '0')}:${(endMinutes % 60).toString().padStart(2, '0')}`;

    // Check for slot conflicts
    const { data: conflicts } = await supabase
      .from('bookings')
      .select('id')
      .eq('scheduled_date', payload.date)
      .in('status', ['confirmed', 'request'])
      .or(`and(scheduled_start.lt.${endTime},scheduled_end.gt.${payload.start_time})`);

    if (conflicts && conflicts.length > 0) {
      return new Response(JSON.stringify({ error: 'Time slot is already booked' }), {
        status: 409,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if weekend
    const bookingDate = new Date(payload.date);
    const isWeekend = bookingDate.getDay() === 0 || bookingDate.getDay() === 6;

    // Create booking
    const { data: booking, error: insertError } = await supabase
      .from('bookings')
      .insert({
        batch_id: crypto.randomUUID(),
        property_index: 1,
        contact_name: payload.contact_name,
        contact_email: payload.contact_email,
        contact_phone: payload.contact_phone,
        company_name: payload.company_name,
        address: payload.address,
        package_type: payload.package_type,
        photo_count: payload.photo_count,
        scheduled_date: payload.date,
        scheduled_start: payload.start_time,
        scheduled_end: endTime,
        estimated_duration_minutes: packageData.duration_minutes,
        status: isWeekend ? 'request' : 'confirmed',
        is_weekend_request: isWeekend,
        notes: payload.notes,
        source: 'webhook',
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating booking:', insertError);
      return new Response(JSON.stringify({ error: 'Failed to create booking' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Webhook booking created:', booking.id);

    return new Response(JSON.stringify({
      success: true,
      booking_id: booking.id,
      status: booking.status,
      message: isWeekend 
        ? 'Weekend booking created as request. Admin approval required.'
        : 'Booking confirmed successfully.',
    }), {
      status: 201,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Error in booking-webhook:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
