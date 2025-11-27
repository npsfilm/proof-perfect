import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Photo } from '@/types/database';

export function useGalleryPhotos(galleryId: string | undefined) {
  return useQuery({
    queryKey: ['photos', galleryId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .eq('gallery_id', galleryId!)
        .order('upload_order', { ascending: true });
      if (error) throw error;
      return data as Photo[];
    },
    enabled: !!galleryId,
  });
}
