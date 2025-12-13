import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface GalleryFeedback {
  id: string;
  gallery_id: string;
  author_user_id: string;
  message: string;
  created_at: string;
}

export function useGalleryFeedback(galleryId: string | undefined) {
  return useQuery({
    queryKey: ['gallery-feedback', galleryId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gallery_feedback')
        .select('*')
        .eq('gallery_id', galleryId!)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as GalleryFeedback[];
    },
    enabled: !!galleryId,
  });
}
