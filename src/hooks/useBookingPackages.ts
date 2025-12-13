import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface BookingPackage {
  id: string;
  package_type: string;
  name: string | null;
  description: string | null;
  photo_count: number;
  duration_minutes: number;
  price_cents: number;
  features: string[];
  requires_additional_info: boolean;
  is_active: boolean;
  is_popular: boolean;
  sort_order: number;
}

export function useBookingPackages() {
  return useQuery({
    queryKey: ['booking-packages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('booking_packages')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;
      
      // Parse features from JSON to string array
      return (data || []).map(pkg => ({
        ...pkg,
        features: Array.isArray(pkg.features) ? pkg.features : [],
      })) as BookingPackage[];
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

export function usePackagesByType(type: 'Foto' | 'Drohne' | 'Kombi') {
  const { data: packages, ...rest } = useBookingPackages();
  
  return {
    ...rest,
    data: packages?.filter(p => p.package_type === type),
  };
}

export function useAllBookingPackages() {
  return useQuery({
    queryKey: ['booking-packages-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('booking_packages')
        .select('*')
        .order('package_type')
        .order('sort_order');

      if (error) throw error;
      
      return (data || []).map(pkg => ({
        ...pkg,
        features: Array.isArray(pkg.features) ? pkg.features : [],
      })) as BookingPackage[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes for admin
  });
}
