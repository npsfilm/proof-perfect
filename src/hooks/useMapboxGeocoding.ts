import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface GeocodingResult {
  id: string;
  place_name: string;
  center: [number, number]; // [lng, lat]
  text: string;
  context?: Array<{
    id: string;
    text: string;
  }>;
}

interface UseMapboxGeocodingReturn {
  suggestions: GeocodingResult[];
  isLoading: boolean;
  error: string | null;
  searchAddress: (query: string) => Promise<void>;
  clearSuggestions: () => void;
}

export function useMapboxGeocoding(): UseMapboxGeocodingReturn {
  const [suggestions, setSuggestions] = useState<GeocodingResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchAddress = useCallback(async (query: string) => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('mapbox-geocoding', {
        body: { action: 'search', query, country: 'de' }
      });

      if (fnError) throw fnError;

      setSuggestions(data?.features || []);
    } catch (err) {
      console.error('Geocoding error:', err);
      setError('Adresssuche fehlgeschlagen');
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
  }, []);

  return {
    suggestions,
    isLoading,
    error,
    searchAddress,
    clearSuggestions,
  };
}
