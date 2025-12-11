import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Property {
  address: string;
  lat: number;
  lng: number;
  duration_minutes: number;
}

interface OptimizationRequest {
  properties: Property[];
  date: string;
  single_day: boolean;
}

interface SlotSuggestion {
  type: 'recommended' | 'cheapest' | 'flexible' | 'weekend';
  label: string;
  description: string;
  date: string;
  slots: {
    property_index: number;
    address: string;
    start: string;
    end: string;
    drive_time_minutes?: number;
  }[];
  total_drive_time_minutes: number;
  efficiency_score: number;
}

// Home base: Augsburg, Germany
const HOME_BASE = { lat: 48.3705, lng: 10.8978 };

async function getRouteMatrix(origins: { lat: number; lng: number }[], destinations: { lat: number; lng: number }[]) {
  const mapboxToken = Deno.env.get('MAPBOX_ACCESS_TOKEN');
  if (!mapboxToken) {
    console.warn('No Mapbox token, using estimated times');
    return null;
  }

  const coordinates = [...origins, ...destinations]
    .map(c => `${c.lng},${c.lat}`)
    .join(';');

  const sourcesCount = origins.length;
  const sources = Array.from({ length: sourcesCount }, (_, i) => i).join(';');
  const destinationsIndices = Array.from({ length: destinations.length }, (_, i) => i + sourcesCount).join(';');

  try {
    const response = await fetch(
      `https://api.mapbox.com/directions-matrix/v1/mapbox/driving/${coordinates}?sources=${sources}&destinations=${destinationsIndices}&access_token=${mapboxToken}`
    );

    if (!response.ok) {
      console.error('Mapbox API error:', await response.text());
      return null;
    }

    const data = await response.json();
    return data.durations; // Matrix of durations in seconds
  } catch (error) {
    console.error('Mapbox request failed:', error);
    return null;
  }
}

function estimateDriveTime(from: { lat: number; lng: number }, to: { lat: number; lng: number }): number {
  // Haversine distance approximation
  const R = 6371;
  const dLat = (to.lat - from.lat) * Math.PI / 180;
  const dLon = (to.lng - from.lng) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(from.lat * Math.PI / 180) * Math.cos(to.lat * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  // Assume average 50 km/h
  return Math.round(distance / 50 * 60);
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

    const { properties, date, single_day } = await req.json() as OptimizationRequest;

    if (!properties || properties.length === 0) {
      return new Response(JSON.stringify({ error: 'No properties provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get existing bookings for context
    const { data: existingBookings } = await supabase
      .from('bookings')
      .select('scheduled_date, scheduled_start, scheduled_end, latitude, longitude')
      .eq('scheduled_date', date)
      .in('status', ['confirmed', 'request']);

    // Try to get route matrix from Mapbox
    const allLocations = [HOME_BASE, ...properties.map(p => ({ lat: p.lat, lng: p.lng }))];
    const routeMatrix = await getRouteMatrix([HOME_BASE], properties.map(p => ({ lat: p.lat, lng: p.lng })));

    // Calculate drive times
    const driveTimes: number[] = [];
    for (let i = 0; i < properties.length; i++) {
      const from = i === 0 ? HOME_BASE : properties[i - 1];
      const to = properties[i];
      
      if (routeMatrix && routeMatrix[0]) {
        driveTimes.push(Math.round(routeMatrix[0][i] / 60)); // Convert seconds to minutes
      } else {
        driveTimes.push(estimateDriveTime(from, to));
      }
    }

    // Calculate total time needed
    const totalShootingTime = properties.reduce((sum, p) => sum + p.duration_minutes, 0);
    const totalDriveTime = driveTimes.reduce((sum, t) => sum + t, 0);
    const bufferTime = properties.length * 15; // 15 min buffer per property
    const totalTime = totalShootingTime + totalDriveTime + bufferTime;

    // Generate slot suggestions
    const suggestions: SlotSuggestion[] = [];

    // Earliest possible start (not before 9:00, accounting for drive time from home)
    const driveFromHome = driveTimes[0] || 30;
    const earliestStart = Math.max(9 * 60, 8 * 60 + driveFromHome); // Minutes from midnight

    // Create recommended suggestion
    const recommendedSlots = properties.map((p, i) => {
      const previousEnd = i === 0 
        ? earliestStart 
        : earliestStart + properties.slice(0, i).reduce((sum, prev, j) => 
            sum + prev.duration_minutes + 15 + (driveTimes[j + 1] || 0), 0);
      
      const start = previousEnd + (i > 0 ? driveTimes[i] : 0);
      const end = start + p.duration_minutes;

      return {
        property_index: i + 1,
        address: p.address,
        start: `${Math.floor(start / 60).toString().padStart(2, '0')}:${(start % 60).toString().padStart(2, '0')}`,
        end: `${Math.floor(end / 60).toString().padStart(2, '0')}:${(end % 60).toString().padStart(2, '0')}`,
        drive_time_minutes: driveTimes[i],
      };
    });

    suggestions.push({
      type: 'recommended',
      label: '⭐ Empfohlen',
      description: 'Optimale Route mit minimaler Fahrzeit',
      date,
      slots: recommendedSlots,
      total_drive_time_minutes: totalDriveTime,
      efficiency_score: 95,
    });

    // Create flexible suggestion (later start)
    const flexibleStart = earliestStart + 120; // 2 hours later
    const flexibleSlots = properties.map((p, i) => {
      const previousEnd = i === 0 
        ? flexibleStart 
        : flexibleStart + properties.slice(0, i).reduce((sum, prev, j) => 
            sum + prev.duration_minutes + 15 + (driveTimes[j + 1] || 0), 0);
      
      const start = previousEnd + (i > 0 ? driveTimes[i] : 0);
      const end = start + p.duration_minutes;

      return {
        property_index: i + 1,
        address: p.address,
        start: `${Math.floor(start / 60).toString().padStart(2, '0')}:${(start % 60).toString().padStart(2, '0')}`,
        end: `${Math.floor(end / 60).toString().padStart(2, '0')}:${(end % 60).toString().padStart(2, '0')}`,
        drive_time_minutes: driveTimes[i],
      };
    });

    suggestions.push({
      type: 'flexible',
      label: '🔄 Flexibler Slot',
      description: 'Späterer Start mit Puffer',
      date,
      slots: flexibleSlots,
      total_drive_time_minutes: totalDriveTime,
      efficiency_score: 80,
    });

    // Add weekend option
    const dateObj = new Date(date);
    const dayOfWeek = dateObj.getDay();
    
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      // Find next weekend
      const daysUntilSaturday = (6 - dayOfWeek + 7) % 7 || 7;
      const weekendDate = new Date(dateObj.getTime() + daysUntilSaturday * 24 * 60 * 60 * 1000);
      const weekendDateStr = weekendDate.toISOString().split('T')[0];

      suggestions.push({
        type: 'weekend',
        label: '📅 Wochenende',
        description: 'Samstag/Sonntag (+25-50% Zuschlag)',
        date: weekendDateStr,
        slots: recommendedSlots, // Same slots, different date
        total_drive_time_minutes: totalDriveTime,
        efficiency_score: 70,
      });
    }

    return new Response(JSON.stringify({
      suggestions,
      total_duration_minutes: totalTime,
      total_drive_time_minutes: totalDriveTime,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Error in route-optimizer:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
