import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { GallerySelectionStats } from '@/types/database';

export function useDeliveredGalleries() {
  return useQuery({
    queryKey: ['delivered-galleries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('v_gallery_selection_stats')
        .select('*')
        .eq('status', 'Delivered')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as GallerySelectionStats[];
    },
  });
}
