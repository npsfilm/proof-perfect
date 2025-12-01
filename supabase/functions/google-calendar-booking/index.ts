import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createSupabaseClient } from "../_shared/supabase-client.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GOOGLE_CLIENT_ID = "609689183520-fuiuj6rl261f6b2gqigaq0pq28kp31.apps.googleusercontent.com";
const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET') ?? '';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname.split('/').pop();
    const supabase = createSupabaseClient();

    // Admin: Exchange authorization code and save tokens
    if (path === 'connect' && req.method === 'POST') {
      const authHeader = req.headers.get('Authorization');
      if (!authHeader) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const { code, redirectUri } = await req.json();

      // Exchange code for tokens
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: GOOGLE_CLIENT_ID,
          client_secret: GOOGLE_CLIENT_SECRET,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        }),
      });

      const tokens = await tokenResponse.json();

      if (!tokenResponse.ok) {
        console.error('Token exchange error:', tokens);
        return new Response(
          JSON.stringify({ error: 'Token exchange failed', details: tokens }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get user's calendar list to find primary calendar
      const calendarsResponse = await fetch(
        'https://www.googleapis.com/calendar/v3/users/me/calendarList',
        {
          headers: {
            'Authorization': `Bearer ${tokens.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const calendars = await calendarsResponse.json();
      const primaryCalendar = calendars.items.find((cal: any) => cal.primary);

      if (!primaryCalendar) {
        return new Response(
          JSON.stringify({ error: 'No primary calendar found' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get user ID from auth header
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: userError } = await supabase.auth.getUser(token);

      if (userError || !user) {
        return new Response(JSON.stringify({ error: 'Invalid user' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Calculate expiry time
      const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

      // Save to database (upsert)
      const { error: dbError } = await supabase
        .from('booking_settings')
        .upsert({
          user_id: user.id,
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          calendar_id: primaryCalendar.id,
          calendar_name: primaryCalendar.summary,
          expires_at: expiresAt,
        }, { onConflict: 'user_id' });

      if (dbError) {
        console.error('Database error:', dbError);
        return new Response(
          JSON.stringify({ error: 'Failed to save settings' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          calendar: {
            id: primaryCalendar.id,
            name: primaryCalendar.summary
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Public: Get availability for booking
    if (path === 'availability' && req.method === 'POST') {
      const { startDate, endDate } = await req.json();

      const { data, error } = await supabase
        .from('booking_settings')
        .select('*')
        .maybeSingle();

      if (error) {
        console.error('Booking settings fetch error:', error);
        return new Response(
          JSON.stringify({ error: 'Booking system not configured' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!data) {
        return new Response(
          JSON.stringify({ error: 'Booking system not configured' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const settings = data;

      // Check if token is expired and refresh if needed
      let accessToken = settings.access_token;
      if (new Date(settings.expires_at) < new Date()) {
        const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            client_id: GOOGLE_CLIENT_ID,
            client_secret: GOOGLE_CLIENT_SECRET,
            refresh_token: settings.refresh_token,
            grant_type: 'refresh_token',
          }),
        });

        const refreshData = await refreshResponse.json();
        if (refreshResponse.ok) {
          accessToken = refreshData.access_token;
          const newExpiresAt = new Date(Date.now() + refreshData.expires_in * 1000).toISOString();

          // Update token in database
          await supabase
            .from('booking_settings')
            .update({
              access_token: accessToken,
              expires_at: newExpiresAt,
            })
            .eq('user_id', settings.user_id);
        }
      }

      // Get freeBusy information
      const freeBusyResponse = await fetch(
        'https://www.googleapis.com/calendar/v3/freeBusy',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            timeMin: startDate,
            timeMax: endDate,
            items: [{ id: settings.calendar_id }],
          }),
        }
      );

      const freeBusy = await freeBusyResponse.json();

      if (!freeBusyResponse.ok) {
        console.error('FreeBusy error:', freeBusy);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch availability' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify(freeBusy),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Public: Create booking
    if (path === 'book' && req.method === 'POST') {
      const { name, email, phone, message, bookingDate, bookingTime } = await req.json();

      // Validate inputs
      if (!name || !email || !bookingDate || !bookingTime) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get booking settings
      const { data, error } = await supabase
        .from('booking_settings')
        .select('*')
        .maybeSingle();

      if (error) {
        console.error('Booking settings fetch error:', error);
        return new Response(
          JSON.stringify({ error: 'Booking system not configured' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!data) {
        return new Response(
          JSON.stringify({ error: 'Booking system not configured' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const settings = data;

      // Refresh token if needed (same logic as above)
      let accessToken = settings.access_token;
      if (new Date(settings.expires_at) < new Date()) {
        const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            client_id: GOOGLE_CLIENT_ID,
            client_secret: GOOGLE_CLIENT_SECRET,
            refresh_token: settings.refresh_token,
            grant_type: 'refresh_token',
          }),
        });

        const refreshData = await refreshResponse.json();
        if (refreshResponse.ok) {
          accessToken = refreshData.access_token;
          const newExpiresAt = new Date(Date.now() + refreshData.expires_in * 1000).toISOString();
          await supabase
            .from('booking_settings')
            .update({ access_token: accessToken, expires_at: newExpiresAt })
            .eq('user_id', settings.user_id);
        }
      }

      // Create event in Google Calendar
      const startDateTime = `${bookingDate}T${bookingTime}:00`;
      const endTime = new Date(new Date(startDateTime).getTime() + 30 * 60000);
      const endDateTime = endTime.toISOString().slice(0, 19);

      const eventResponse = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${settings.calendar_id}/events`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            summary: `Termin: ${name}`,
            description: `Name: ${name}\nEmail: ${email}\nTelefon: ${phone || 'Nicht angegeben'}\n\nNachricht:\n${message || 'Keine Nachricht'}`,
            start: {
              dateTime: startDateTime,
              timeZone: 'Europe/Berlin',
            },
            end: {
              dateTime: endDateTime,
              timeZone: 'Europe/Berlin',
            },
            attendees: [{ email }],
          }),
        }
      );

      const event = await eventResponse.json();

      if (!eventResponse.ok) {
        console.error('Event creation error:', event);
        return new Response(
          JSON.stringify({ error: 'Failed to create booking' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Save booking to database
      const { error: bookingError } = await supabase
        .from('bookings')
        .insert({
          name,
          email,
          phone,
          message,
          booking_date: bookingDate,
          booking_time: bookingTime,
          google_event_id: event.id,
          status: 'confirmed',
        });

      if (bookingError) {
        console.error('Booking save error:', bookingError);
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          eventId: event.id,
          message: 'Termin erfolgreich gebucht!'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid endpoint' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in google-calendar-booking function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
