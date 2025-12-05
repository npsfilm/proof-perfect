import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const CALENDLY_API_BASE = 'https://api.calendly.com';

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const apiKey = Deno.env.get('CALENDLY_API_KEY');
  if (!apiKey) {
    console.error('CALENDLY_API_KEY not configured');
    return new Response(
      JSON.stringify({ error: 'Calendly API key not configured' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const { action, params } = await req.json();
    console.log(`Calendly API action: ${action}`, params);

    const headers = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    };

    let result;

    switch (action) {
      case 'get_user': {
        // Get current user info
        const response = await fetch(`${CALENDLY_API_BASE}/users/me`, { headers });
        if (!response.ok) {
          const error = await response.text();
          console.error('Failed to get user:', error);
          throw new Error(`Failed to get user: ${response.status}`);
        }
        result = await response.json();
        break;
      }

      case 'get_event_types': {
        // Get event types for the user
        const { userUri } = params;
        if (!userUri) throw new Error('userUri required');
        
        const url = new URL(`${CALENDLY_API_BASE}/event_types`);
        url.searchParams.set('user', userUri);
        url.searchParams.set('active', 'true');
        
        const response = await fetch(url.toString(), { headers });
        if (!response.ok) {
          const error = await response.text();
          console.error('Failed to get event types:', error);
          throw new Error(`Failed to get event types: ${response.status}`);
        }
        result = await response.json();
        break;
      }

      case 'get_available_times': {
        // Get available time slots for an event type
        const { eventTypeUri, startTime, endTime } = params;
        if (!eventTypeUri || !startTime || !endTime) {
          throw new Error('eventTypeUri, startTime, and endTime required');
        }
        
        const url = new URL(`${CALENDLY_API_BASE}/event_type_available_times`);
        url.searchParams.set('event_type', eventTypeUri);
        url.searchParams.set('start_time', startTime);
        url.searchParams.set('end_time', endTime);
        
        const response = await fetch(url.toString(), { headers });
        if (!response.ok) {
          const error = await response.text();
          console.error('Failed to get available times:', error);
          throw new Error(`Failed to get available times: ${response.status}`);
        }
        result = await response.json();
        break;
      }

      case 'create_invitee': {
        // Schedule a meeting (create invitee)
        // Note: This requires the scheduling_url from the event type
        const { schedulingUrl, invitee } = params;
        if (!schedulingUrl || !invitee) {
          throw new Error('schedulingUrl and invitee required');
        }
        
        // Calendly API v2 doesn't support direct invitee creation via API
        // Instead, return the scheduling URL for the user to complete booking
        result = { 
          scheduling_url: schedulingUrl,
          message: 'Redirect user to scheduling URL to complete booking'
        };
        break;
      }

      case 'get_scheduled_events': {
        // Get scheduled events for a user
        const { userUri, minStartTime, maxStartTime, status } = params;
        if (!userUri) throw new Error('userUri required');
        
        const url = new URL(`${CALENDLY_API_BASE}/scheduled_events`);
        url.searchParams.set('user', userUri);
        if (minStartTime) url.searchParams.set('min_start_time', minStartTime);
        if (maxStartTime) url.searchParams.set('max_start_time', maxStartTime);
        if (status) url.searchParams.set('status', status);
        
        const response = await fetch(url.toString(), { headers });
        if (!response.ok) {
          const error = await response.text();
          console.error('Failed to get scheduled events:', error);
          throw new Error(`Failed to get scheduled events: ${response.status}`);
        }
        result = await response.json();
        break;
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    console.log(`Calendly API ${action} success`);
    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Calendly API error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
