import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

    // Exchange authorization code for tokens
    if (path === 'exchange' && req.method === 'POST') {
      const { code, redirectUri } = await req.json();

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

      return new Response(
        JSON.stringify(tokens),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // List user's calendars
    if (path === 'calendars' && req.method === 'POST') {
      const { accessToken } = await req.json();

      const calendarsResponse = await fetch(
        'https://www.googleapis.com/calendar/v3/users/me/calendarList',
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const calendars = await calendarsResponse.json();

      if (!calendarsResponse.ok) {
        console.error('Calendar list error:', calendars);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch calendars', details: calendars }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify(calendars),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get freeBusy information
    if (path === 'freebusy' && req.method === 'POST') {
      const { accessToken, calendarIds, timeMin, timeMax } = await req.json();

      const freeBusyResponse = await fetch(
        'https://www.googleapis.com/calendar/v3/freeBusy',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            timeMin,
            timeMax,
            items: calendarIds.map((id: string) => ({ id })),
          }),
        }
      );

      const freeBusy = await freeBusyResponse.json();

      if (!freeBusyResponse.ok) {
        console.error('FreeBusy error:', freeBusy);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch freeBusy', details: freeBusy }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify(freeBusy),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid endpoint' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in google-calendar-auth function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
