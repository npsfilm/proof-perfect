import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.86.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID');
const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

// Calendars to sync - primary + additional shared calendars
const CALENDAR_IDS = [
  { id: 'primary', name: 'Hauptkalender', color: '#3b82f6' },
  { id: 'hello@npsfilm.de', name: 'NPS Film', color: '#10b981' },
  { id: 'c_87445ee88350c15ef8f4e0bb32a2bf765f7cdb991c0631a46fe59fdf528570f8@group.calendar.google.com', name: 'Gruppen-Kalender', color: '#f59e0b' },
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Invalid authorization');
    }

    console.log('Sync requested by user:', user.id);

    // Get user's Google Calendar tokens
    const { data: tokenData, error: tokenError } = await supabase
      .from('google_calendar_tokens')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (tokenError || !tokenData) {
      throw new Error('Google Calendar not connected');
    }

    let accessToken = tokenData.access_token;
    const expiresAt = new Date(tokenData.expires_at);

    // Check if token needs refresh
    if (expiresAt < new Date()) {
      console.log('Token expired, refreshing...');
      
      const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: GOOGLE_CLIENT_ID!,
          client_secret: GOOGLE_CLIENT_SECRET!,
          refresh_token: tokenData.refresh_token,
          grant_type: 'refresh_token',
        }),
      });

      const refreshData = await refreshResponse.json();
      
      if (!refreshResponse.ok) {
        console.error('Token refresh failed:', refreshData);
        throw new Error('token expired');
      }

      accessToken = refreshData.access_token;
      const newExpiresAt = new Date(Date.now() + refreshData.expires_in * 1000).toISOString();

      await supabase
        .from('google_calendar_tokens')
        .update({
          access_token: accessToken,
          expires_at: newExpiresAt,
        })
        .eq('user_id', user.id);

      console.log('Token refreshed successfully');
    }

    const now = new Date();
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
    const threeMonthsFromNow = new Date(now.getFullYear(), now.getMonth() + 3, 0);

    let totalPulled = 0;
    let totalPushed = 0;
    let blockedSynced = 0;

    // PULL: Fetch events from ALL configured Google Calendars
    for (const calendar of CALENDAR_IDS) {
      console.log(`Pulling events from calendar: ${calendar.name} (${calendar.id})...`);
      
      try {
        const calendarResponse = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendar.id)}/events?` +
          `timeMin=${threeMonthsAgo.toISOString()}&` +
          `timeMax=${threeMonthsFromNow.toISOString()}&` +
          `singleEvents=true&` +
          `orderBy=startTime`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
          }
        );

        if (!calendarResponse.ok) {
          const errorData = await calendarResponse.json();
          console.error(`Failed to fetch calendar ${calendar.id}:`, errorData);
          // Continue with other calendars even if one fails
          continue;
        }

        const calendarData = await calendarResponse.json();
        const googleEvents = calendarData.items || [];

        console.log(`Found ${googleEvents.length} events in ${calendar.name}`);

        // Process each Google event
        for (const gEvent of googleEvents) {
          if (!gEvent.start || (!gEvent.start.dateTime && !gEvent.start.date)) {
            continue;
          }

          const startTime = gEvent.start.dateTime || `${gEvent.start.date}T00:00:00`;
          const endTime = gEvent.end?.dateTime || gEvent.end?.date 
            ? (gEvent.end.dateTime || `${gEvent.end.date}T23:59:59`)
            : startTime;

          const { data: existingEvent } = await supabase
            .from('events')
            .select('*')
            .eq('google_event_id', gEvent.id)
            .eq('user_id', user.id)
            .single();

          if (existingEvent) {
            const googleUpdated = new Date(gEvent.updated);
            const localUpdated = new Date(existingEvent.updated_at);

            if (googleUpdated > localUpdated) {
              await supabase
                .from('events')
                .update({
                  title: gEvent.summary || 'Untitled',
                  description: gEvent.description || null,
                  start_time: startTime,
                  end_time: endTime,
                  location: gEvent.location || null,
                  calendar_source: calendar.id,
                  color: calendar.color,
                  last_synced_at: new Date().toISOString(),
                })
                .eq('id', existingEvent.id);
              
              totalPulled++;
            }
          } else {
            await supabase
              .from('events')
              .insert({
                user_id: user.id,
                title: gEvent.summary || 'Untitled',
                description: gEvent.description || null,
                start_time: startTime,
                end_time: endTime,
                location: gEvent.location || null,
                google_event_id: gEvent.id,
                calendar_source: calendar.id,
                color: calendar.color,
                last_synced_at: new Date().toISOString(),
              });
            
            totalPulled++;
          }
        }
      } catch (calError) {
        console.error(`Error syncing calendar ${calendar.id}:`, calError);
        // Continue with other calendars
      }
    }

    // PUSH: Send local events without google_event_id to primary Google Calendar
    console.log('Pushing local events to Google Calendar...');

    const { data: localEvents } = await supabase
      .from('events')
      .select('*')
      .eq('user_id', user.id)
      .is('google_event_id', null);

    for (const localEvent of localEvents || []) {
      const googleEvent = {
        summary: localEvent.title,
        description: localEvent.description,
        location: localEvent.location,
        start: {
          dateTime: localEvent.start_time,
          timeZone: 'Europe/Berlin',
        },
        end: {
          dateTime: localEvent.end_time,
          timeZone: 'Europe/Berlin',
        },
      };

      const createResponse = await fetch(
        'https://www.googleapis.com/calendar/v3/calendars/primary/events',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(googleEvent),
        }
      );

      if (createResponse.ok) {
        const createdEvent = await createResponse.json();
        
        await supabase
          .from('events')
          .update({
            google_event_id: createdEvent.id,
            calendar_source: 'primary',
            last_synced_at: new Date().toISOString(),
          })
          .eq('id', localEvent.id);
        
        totalPushed++;
      } else {
        console.error('Failed to push event:', localEvent.id);
      }
    }

    // SYNC BLOCKED DATES: Push blocked dates to Google Calendar as "Out of Office" events
    console.log('Syncing blocked dates to Google Calendar...');

    const { data: blockedDates } = await supabase
      .from('blocked_dates')
      .select('*')
      .eq('user_id', user.id);

    for (const blocked of blockedDates || []) {
      // Skip if already synced
      if (blocked.google_event_id) {
        // Check if the Google event still exists
        const checkResponse = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/primary/events/${blocked.google_event_id}`,
          {
            headers: { 'Authorization': `Bearer ${accessToken}` },
          }
        );
        
        if (checkResponse.ok) {
          console.log('Blocked date already synced:', blocked.id);
          continue;
        }
        // If event was deleted from Google, we'll recreate it
      }

      // Create all-day event for the blocked period
      const blockedEvent = {
        summary: blocked.reason || 'Nicht verfügbar',
        description: 'Blockierte Zeit - automatisch synchronisiert',
        start: {
          date: blocked.start_date,
        },
        end: {
          // Google Calendar end date is exclusive, so add one day
          date: new Date(new Date(blocked.end_date).getTime() + 86400000).toISOString().split('T')[0],
        },
        transparency: 'opaque', // Show as busy
        colorId: '4', // Flamingo (pinkish-red) color
      };

      const createResponse = await fetch(
        'https://www.googleapis.com/calendar/v3/calendars/primary/events',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(blockedEvent),
        }
      );

      if (createResponse.ok) {
        const createdEvent = await createResponse.json();
        
        // Update blocked date with Google event ID
        await supabase
          .from('blocked_dates')
          .update({ google_event_id: createdEvent.id })
          .eq('id', blocked.id);
        
        blockedSynced++;
        console.log('Synced blocked date:', blocked.id, '→', createdEvent.id);
      } else {
        const errorData = await createResponse.json();
        console.error('Failed to sync blocked date:', blocked.id, errorData);
      }
    }

    console.log(`Sync complete: ${totalPulled} pulled, ${totalPushed} pushed, ${blockedSynced} blocked dates synced`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        pulled: totalPulled, 
        pushed: totalPushed, 
        blockedSynced,
        calendars: CALENDAR_IDS.map(c => c.name),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Sync error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
