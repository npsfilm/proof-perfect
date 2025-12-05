import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface TimeSlot {
  time: string; // HH:MM format
  available: boolean;
  travelInfo?: {
    fromPrevious: number; // minutes
    toNext: number; // minutes
  };
}

interface UseSmartAvailabilityParams {
  date: Date | null;
  coordinates: { lat: number; lng: number } | null;
  durationMinutes: number;
  batchId: string;
}

interface UseSmartAvailabilityReturn {
  slots: TimeSlot[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useSmartAvailability({
  date,
  coordinates,
  durationMinutes,
  batchId,
}: UseSmartAvailabilityParams): UseSmartAvailabilityReturn {
  const [error, setError] = useState<string | null>(null);

  const { data: slots = [], isLoading, refetch } = useQuery({
    queryKey: ['smart-availability', date?.toISOString(), coordinates?.lat, coordinates?.lng, durationMinutes, batchId],
    queryFn: async () => {
      if (!date || !coordinates) return [];

      setError(null);

      try {
        const { data, error: fnError } = await supabase.functions.invoke('get-smart-availability', {
          body: {
            date: date.toISOString().split('T')[0],
            targetLocation: coordinates,
            durationMinutes,
            batchId,
          }
        });

        if (fnError) throw fnError;

        return data?.slots || [];
      } catch (err) {
        console.error('Smart availability error:', err);
        setError('Verfügbarkeit konnte nicht geladen werden');
        return [];
      }
    },
    enabled: !!date && !!coordinates && durationMinutes > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    slots,
    isLoading,
    error,
    refetch,
  };
}
