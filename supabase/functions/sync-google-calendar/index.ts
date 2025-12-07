import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Calendar configurations with their ICS URLs
const CALENDARS = [
  {
    id: 'npsfilm',
    name: 'NPS Film',
    envKey: 'CALENDAR_ICS_NPSFILM',
    color: '#10b981', // green
  },
  {
    id: 'group',
    name: 'Gruppen-Kalender',
    envKey: 'CALENDAR_ICS_GROUP',
    color: '#8b5cf6', // purple
  },
];

interface ICSEvent {
  uid: string;
  summary: string;
  description?: string;
  location?: string;
  dtstart: Date;
  dtend: Date;
}

// Parse ICS date format (handles both DATE and DATE-TIME)
function parseICSDate(dateStr: string): Date {
  dateStr = dateStr.replace(/"/g, '');
  
  // Handle DATE format: 20241215
  if (dateStr.length === 8) {
    const year = parseInt(dateStr.substring(0, 4));
    const month = parseInt(dateStr.substring(4, 6)) - 1;
    const day = parseInt(dateStr.substring(6, 8));
    return new Date(year, month, day);
  }
  
  // Handle DATE-TIME format: 20241215T100000 or 20241215T100000Z
  if (dateStr.includes('T')) {
    const isUTC = dateStr.endsWith('Z');
    const cleanStr = dateStr.replace('Z', '');
    
    const year = parseInt(cleanStr.substring(0, 4));
    const month = parseInt(cleanStr.substring(4, 6)) - 1;
    const day = parseInt(cleanStr.substring(6, 8));
    const hour = parseInt(cleanStr.substring(9, 11));
    const minute = parseInt(cleanStr.substring(11, 13));
    const second = parseInt(cleanStr.substring(13, 15)) || 0;
    
    if (isUTC) {
      return new Date(Date.UTC(year, month, day, hour, minute, second));
    } else {
      return new Date(year, month, day, hour, minute, second);
    }
  }
  
  return new Date(dateStr);
}

// Parse ICS content into events
function parseICS(icsContent: string): ICSEvent[] {
  const events: ICSEvent[] = [];
  const lines = icsContent.split(/\r?\n/);
  
  let inEvent = false;
  let currentEvent: Partial<ICSEvent> = {};
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    
    // Handle line folding
    while (i + 1 < lines.length && (lines[i + 1].startsWith(' ') || lines[i + 1].startsWith('\t'))) {
      i++;
      line += lines[i].substring(1);
    }
    
    if (line.startsWith('BEGIN:VEVENT')) {
      inEvent = true;
      currentEvent = {};
      continue;
    }
    
    if (line.startsWith('END:VEVENT')) {
      inEvent = false;
      if (currentEvent.uid && currentEvent.summary && currentEvent.dtstart && currentEvent.dtend) {
        events.push(currentEvent as ICSEvent);
      }
      continue;
    }
    
    if (!inEvent) continue;
    
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;
    
    const keyPart = line.substring(0, colonIndex);
    const value = line.substring(colonIndex + 1);
    const baseKey = keyPart.split(';')[0];
    
    switch (baseKey) {
      case 'UID':
        currentEvent.uid = value;
        break;
      case 'SUMMARY':
        currentEvent.summary = value.replace(/\\,/g, ',').replace(/\\n/g, '\n').replace(/\\;/g, ';');
        break;
      case 'DESCRIPTION':
        currentEvent.description = value.replace(/\\,/g, ',').replace(/\\n/g, '\n').replace(/\\;/g, ';');
        break;
      case 'LOCATION':
        currentEvent.location = value.replace(/\\,/g, ',').replace(/\\n/g, '\n').replace(/\\;/g, ';');
        break;
      case 'DTSTART':
        currentEvent.dtstart = parseICSDate(value);
        break;
      case 'DTEND':
        currentEvent.dtend = parseICSDate(value);
        break;
    }
  }
  
  return events;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const supabaseAuth = createClient(
      supabaseUrl,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );
    
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    console.log(`\n=== iCal Sync started for user: ${user.id} ===\n`);

    const now = new Date();
    const timeMin = new Date(now.getFullYear(), now.getMonth() - 3, 1);
    const timeMax = new Date(now.getFullYear(), now.getMonth() + 3, 0);

    let totalInserted = 0;
    let totalUpdated = 0;
    let totalSkipped = 0;
    const calendarStatuses: { name: string; status: string; eventCount: number; inserted: number; updated: number }[] = [];

    for (const calendar of CALENDARS) {
      const icsUrl = Deno.env.get(calendar.envKey);
      
      if (!icsUrl) {
        console.log(`⚠️ No ICS URL for ${calendar.name} (${calendar.envKey})`);
        calendarStatuses.push({ name: calendar.name, status: 'not_configured', eventCount: 0, inserted: 0, updated: 0 });
        continue;
      }

      console.log(`\n--- Fetching ${calendar.name} ---`);

      try {
        const response = await fetch(icsUrl);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const icsContent = await response.text();
        const events = parseICS(icsContent);
        
        const filteredEvents = events.filter(event => 
          event.dtstart >= timeMin && event.dtstart <= timeMax
        );

        console.log(`✓ Found ${filteredEvents.length} events in time window`);

        let inserted = 0, updated = 0, skipped = 0;

        const { data: existingEvents } = await supabase
          .from('events')
          .select('id, google_event_id, title, start_time, end_time')
          .eq('user_id', user.id)
          .eq('calendar_source', calendar.id);

        const existingMap = new Map((existingEvents || []).map(e => [e.google_event_id, e]));

        for (const event of filteredEvents) {
          const eventData = {
            user_id: user.id,
            google_event_id: event.uid,
            title: event.summary || 'Untitled',
            description: event.description || null,
            location: event.location || null,
            start_time: event.dtstart.toISOString(),
            end_time: event.dtend.toISOString(),
            calendar_source: calendar.id,
            color: calendar.color,
            last_synced_at: new Date().toISOString(),
          };

          const existing = existingMap.get(event.uid);

          if (existing) {
            const existingStart = new Date(existing.start_time).getTime();
            const existingEnd = new Date(existing.end_time).getTime();
            const newStart = event.dtstart.getTime();
            const newEnd = event.dtend.getTime();

            if (existingStart !== newStart || existingEnd !== newEnd || existing.title !== event.summary) {
              const { error } = await supabase.from('events').update(eventData).eq('id', existing.id);
              if (!error) updated++;
            } else {
              skipped++;
            }
          } else {
            const { error } = await supabase.from('events').insert(eventData);
            if (!error) inserted++;
          }
        }

        console.log(`  → Inserted: ${inserted}, Updated: ${updated}, Skipped: ${skipped}`);

        totalInserted += inserted;
        totalUpdated += updated;
        totalSkipped += skipped;

        calendarStatuses.push({ name: calendar.name, status: 'success', eventCount: filteredEvents.length, inserted, updated });

      } catch (calError) {
        console.error(`✗ Error fetching ${calendar.name}:`, calError);
        calendarStatuses.push({ name: calendar.name, status: 'error', eventCount: 0, inserted: 0, updated: 0 });
      }
    }

    console.log(`\n=== Sync complete: ${totalInserted} inserted, ${totalUpdated} updated, ${totalSkipped} unchanged ===\n`);

    return new Response(
      JSON.stringify({ success: true, pulled: totalInserted + totalUpdated, pushed: 0, calendars: calendarStatuses }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Sync error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
