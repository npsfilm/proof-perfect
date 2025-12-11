import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CompanyGalleryStats, UserActivity, GallerySelectionStats } from '@/types/database';

export function useCompanyGalleryStats() {
  return useQuery({
    queryKey: ['company-gallery-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('v_company_gallery_stats')
        .select('*')
        .order('galleries_count', { ascending: false });
      
      if (error) throw error;
      return data as CompanyGalleryStats[];
    },
  });
}

export function useUserActivity(page: number = 0, pageSize: number = 50) {
  return useQuery({
    queryKey: ['user-activity', page],
    queryFn: async () => {
      const from = page * pageSize;
      const to = from + pageSize - 1;

      const { data, error } = await supabase
        .from('v_user_activity')
        .select('*')
        .order('last_activity', { ascending: false, nullsFirst: false })
        .range(from, to);
      
      if (error) throw error;
      return data as UserActivity[];
    },
  });
}

export function useCompanyGalleryList(companyId: string) {
  return useQuery({
    queryKey: ['company-galleries', companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('v_gallery_selection_stats')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as GallerySelectionStats[];
    },
    enabled: !!companyId,
  });
}
