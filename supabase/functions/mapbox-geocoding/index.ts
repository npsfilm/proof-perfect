const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GeocodeRequest {
  query: string;
  limit?: number;
}

interface GeocodeResult {
  address: string;
  lat: number;
  lng: number;
  place_name: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const mapboxToken = Deno.env.get('MAPBOX_ACCESS_TOKEN');
    
    if (!mapboxToken) {
      return new Response(JSON.stringify({ 
        error: 'Mapbox token not configured',
        results: [] 
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { query, limit = 5 } = await req.json() as GeocodeRequest;

    if (!query || query.length < 3) {
      return new Response(JSON.stringify({ results: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Focus on Germany
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?` +
      `access_token=${mapboxToken}&` +
      `country=de&` +
      `language=de&` +
      `types=address,place&` +
      `limit=${limit}`
    );

    if (!response.ok) {
      console.error('Mapbox geocoding error:', await response.text());
      return new Response(JSON.stringify({ error: 'Geocoding failed', results: [] }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();

    const results: GeocodeResult[] = data.features.map((feature: any) => ({
      address: feature.place_name,
      lat: feature.center[1],
      lng: feature.center[0],
      place_name: feature.text,
    }));

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Error in mapbox-geocoding:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message, results: [] }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
