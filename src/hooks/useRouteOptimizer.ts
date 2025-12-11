import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Property {
  address: string;
  lat: number;
  lng: number;
  duration_minutes: number;
}

interface OptimizationParams {
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

interface OptimizationResponse {
  suggestions: SlotSuggestion[];
  total_duration_minutes: number;
  total_drive_time_minutes: number;
}

export function useRouteOptimizer() {
  return useMutation({
    mutationFn: async (params: OptimizationParams): Promise<OptimizationResponse> => {
      const { data, error } = await supabase.functions.invoke('route-optimizer', {
        body: params,
      });

      if (error) throw error;
      return data as OptimizationResponse;
    },
  });
}
