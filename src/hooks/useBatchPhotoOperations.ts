import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DeletePhotosParams {
  photoIds: string[];
  gallerySlug: string;
}

interface ReorderPhotosParams {
  photoId: string;
  newOrder: number;
}

export function useBatchPhotoOperations(galleryId: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deletePhotos = useMutation({
    mutationFn: async ({ photoIds, gallerySlug }: DeletePhotosParams) => {
      // First, fetch photo details to get storage paths
      const { data: photos, error: fetchError } = await supabase
        .from('photos')
        .select('filename, storage_url')
        .in('id', photoIds);

      if (fetchError) throw fetchError;

      // Delete from storage
      const filePaths = photos?.map(photo => `${gallerySlug}/${photo.filename}`) || [];
      if (filePaths.length > 0) {
        const { error: storageError } = await supabase.storage
          .from('proofs')
          .remove(filePaths);

        if (storageError) {
          console.error('Storage deletion error:', storageError);
          // Continue with database deletion even if storage fails
        }
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('photos')
        .delete()
        .in('id', photoIds);

      if (dbError) throw dbError;

      return { deletedCount: photoIds.length };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['photos', galleryId] });
      toast({
        title: 'Fotos gelöscht',
        description: `${data.deletedCount} Foto${data.deletedCount > 1 ? 's' : ''} erfolgreich gelöscht.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Fehler beim Löschen',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const reorderPhotos = useMutation({
    mutationFn: async (updates: ReorderPhotosParams[]) => {
      // Update all photo orders in a batch
      const promises = updates.map(({ photoId, newOrder }) =>
        supabase
          .from('photos')
          .update({ upload_order: newOrder })
          .eq('id', photoId)
      );

      const results = await Promise.all(promises);
      const errors = results.filter(r => r.error);
      if (errors.length > 0) throw errors[0].error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photos', galleryId] });
      toast({
        title: 'Reihenfolge aktualisiert',
        description: 'Die Foto-Reihenfolge wurde erfolgreich gespeichert.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Fehler beim Sortieren',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    deletePhotos,
    reorderPhotos,
  };
}
