import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface BookingUpgrade {
  id: string;
  name: string;
  description: string | null;
  price_cents: number;
  icon_name: string | null;
  is_per_image: boolean;
  min_quantity: number;
  max_quantity: number;
  is_active: boolean;
  sort_order: number;
}

export function useBookingUpgrades() {
  return useQuery({
    queryKey: ['booking-upgrades'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('booking_upgrades')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;
      return data as BookingUpgrade[];
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}
