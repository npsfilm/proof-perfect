import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Photo } from '@/types/database';

export function usePhotoSelection(galleryId: string | undefined) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [lastSaved, setLastSaved] = useState<Date>();

  const toggleSelection = useMutation({
    mutationFn: async ({ photoId, currentState }: { photoId: string; currentState: boolean }) => {
      const { error } = await supabase
        .from('photos')
        .update({ is_selected: !currentState })
        .eq('id', photoId);
      
      if (error) throw error;
    },
    onMutate: async ({ photoId, currentState }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['photos', galleryId] });

      // Snapshot previous value
      const previousPhotos = queryClient.getQueryData<Photo[]>(['photos', galleryId]);

      // Optimistically update
      queryClient.setQueryData<Photo[]>(['photos', galleryId], (old) =>
        old?.map((photo) =>
          photo.id === photoId
            ? { ...photo, is_selected: !currentState }
            : photo
        )
      );

      return { previousPhotos };
    },
    onError: (error: any, variables, context) => {
      // Rollback on error
      queryClient.setQueryData(['photos', galleryId], context?.previousPhotos);
      toast({
        title: 'Fehler',
        description: error.message,
        variant: 'destructive',
      });
    },
    onSuccess: () => {
      setLastSaved(new Date());
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['photos', galleryId] });
    },
  });

  return { 
    toggleSelection,
    isSaving: toggleSelection.isPending,
    lastSaved,
  };
}
