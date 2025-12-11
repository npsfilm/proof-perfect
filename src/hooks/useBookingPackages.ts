import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface BookingPackage {
  id: string;
  package_type: 'foto' | 'drohne' | 'kombi';
  photo_count: number;
  duration_minutes: number;
  price_cents: number;
  requires_additional_info: boolean;
  is_active: boolean;
}

export function useBookingPackages() {
  return useQuery({
    queryKey: ['booking-packages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('booking_packages')
        .select('*')
        .eq('is_active', true)
        .order('package_type')
        .order('photo_count');

      if (error) throw error;
      return data as BookingPackage[];
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

export function usePackagesByType(type: 'foto' | 'drohne' | 'kombi') {
  const { data: packages, ...rest } = useBookingPackages();
  
  return {
    ...rest,
    data: packages?.filter(p => p.package_type === type),
  };
}
