import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface AvailabilityParams {
  date?: string;
  duration_minutes: number;
  addresses?: { lat: number; lng: number }[];
}

interface TimeSlot {
  date: string;
  start: string;
  end: string;
  is_weekend: boolean;
  is_request_only: boolean;
  label?: string;
  efficiency_score?: number;
}

interface AvailabilityResponse {
  recommended: TimeSlot[];
  all: TimeSlot[];
  weekend_requests: TimeSlot[];
}

export function useSmartAvailability(params: AvailabilityParams) {
  return useQuery({
    queryKey: ['smart-availability', params],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('smart-availability', {
        body: params,
      });

      if (error) throw error;
      return data as AvailabilityResponse;
    },
    enabled: params.duration_minutes > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
