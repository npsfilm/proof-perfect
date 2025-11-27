import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Gallery } from '@/types/database';

export function useGallery(id: string | undefined) {
  return useQuery({
    queryKey: ['gallery', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('galleries')
        .select('*')
        .eq('id', id!)
        .single();
      if (error) throw error;
      return data as Gallery;
    },
    enabled: !!id,
  });
}

export function useGalleryBySlug(slug: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ['gallery-slug', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('galleries')
        .select('*')
        .eq('slug', slug!)
        .single();
      if (error) throw error;
      return data as Gallery;
    },
    enabled: !!slug && enabled,
  });
}
