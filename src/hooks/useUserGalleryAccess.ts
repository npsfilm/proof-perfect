import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useUserGalleryAccess(userId: string) {
  return useQuery({
    queryKey: ['user-gallery-access', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gallery_access')
        .select(`
          gallery_id,
          galleries:gallery_id (
            id,
            name,
            slug,
            status
          )
        `)
        .eq('user_id', userId);
      
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}

export function useAddUserGalleryAccess() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, galleryId }: { userId: string; galleryId: string }) => {
      const { error } = await supabase
        .from('gallery_access')
        .insert({ user_id: userId, gallery_id: galleryId });
      
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user-gallery-access', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['gallery-access', variables.galleryId] });
      queryClient.invalidateQueries({ queryKey: ['user-activity'] });
    },
  });
}

export function useRemoveUserGalleryAccess() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, galleryId }: { userId: string; galleryId: string }) => {
      const { error } = await supabase
        .from('gallery_access')
        .delete()
        .eq('user_id', userId)
        .eq('gallery_id', galleryId);
      
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user-gallery-access', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['gallery-access', variables.galleryId] });
      queryClient.invalidateQueries({ queryKey: ['user-activity'] });
    },
  });
}
