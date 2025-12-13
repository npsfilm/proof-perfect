import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Photo } from '@/types/database';

export function usePhotoMutation(photoId: string, galleryId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const updatePhoto = useMutation({
    mutationFn: async (updates: Partial<Photo>) => {
      const { error } = await supabase
        .from('photos')
        .update(updates)
        .eq('id', photoId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photos', galleryId] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Fehler',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const toggleSelection = (currentSelection: boolean) => {
    updatePhoto.mutate({ is_selected: !currentSelection });
  };

  const saveComment = (comment: string, originalComment: string | null) => {
    if (comment !== originalComment) {
      updatePhoto.mutate({ client_comment: comment || null });
    }
  };

  const updateStaging = (requested: boolean, style: string) => {
    updatePhoto.mutate({ 
      staging_requested: requested,
      staging_style: requested ? style : null,
    });
  };

  const updateStagingStyle = (style: string, isRequested: boolean) => {
    if (isRequested) {
      updatePhoto.mutate({ staging_style: style });
    }
  };

  return {
    updatePhoto,
    toggleSelection,
    saveComment,
    updateStaging,
    updateStagingStyle,
    isPending: updatePhoto.isPending,
  };
}
