import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useDebounce } from '@/hooks/useDebounce';
import { useQuery } from '@tanstack/react-query';

interface GeocodeResult {
  address: string;
  lat: number;
  lng: number;
  place_name: string;
}

export function useMapboxGeocoding() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);

  const { data: results = [], isLoading } = useQuery({
    queryKey: ['geocoding', debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery || debouncedQuery.length < 3) {
        return [];
      }

      const { data, error } = await supabase.functions.invoke('mapbox-geocoding', {
        body: { query: debouncedQuery, limit: 5 },
      });

      if (error) {
        console.error('Geocoding error:', error);
        return [];
      }

      return (data?.results || []) as GeocodeResult[];
    },
    enabled: debouncedQuery.length >= 3,
    staleTime: 1000 * 60 * 5,
  });

  const search = useCallback((searchQuery: string) => {
    setQuery(searchQuery);
  }, []);

  const clear = useCallback(() => {
    setQuery('');
  }, []);

  return {
    query,
    results,
    isLoading,
    search,
    clear,
  };
}
