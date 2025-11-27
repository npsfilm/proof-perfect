import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { GalleryStatus } from '@/types/database';

export function useBatchGalleryOperations() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const duplicateGalleries = useMutation({
    mutationFn: async (galleryIds: string[]) => {
      const duplicatedIds: string[] = [];

      for (const id of galleryIds) {
        // Fetch original gallery
        const { data: original, error: fetchError } = await supabase
          .from('galleries')
          .select('*')
          .eq('id', id)
          .single();

        if (fetchError) throw fetchError;

        // Generate unique slug
        const { data: newSlug, error: slugError } = await supabase.rpc(
          'generate_unique_slug',
          { p_name: `${original.name} (Copy)` }
        );

        if (slugError) throw slugError;

        // Create duplicate with Draft status
        const { data: duplicate, error: insertError } = await supabase
          .from('galleries')
          .insert({
            name: `${original.name} (Copy)`,
            slug: newSlug,
            package_target_count: original.package_target_count,
            salutation_type: original.salutation_type,
            status: 'Draft',
            is_locked: false,
          })
          .select()
          .single();

        if (insertError) throw insertError;

        // Copy gallery access relationships
        const { data: accessList, error: accessFetchError } = await supabase
          .from('gallery_access')
          .select('user_id')
          .eq('gallery_id', id);

        if (accessFetchError) throw accessFetchError;

        if (accessList && accessList.length > 0) {
          const accessInserts = accessList.map((access) => ({
            gallery_id: duplicate.id,
            user_id: access.user_id,
          }));

          const { error: accessInsertError } = await supabase
            .from('gallery_access')
            .insert(accessInserts);

          if (accessInsertError) throw accessInsertError;
        }

        duplicatedIds.push(duplicate.id);
      }

      return duplicatedIds;
    },
    onSuccess: (duplicatedIds) => {
      queryClient.invalidateQueries({ queryKey: ['galleries'] });
      toast({
        title: 'Galleries duplicated!',
        description: `Successfully created ${duplicatedIds.length} ${duplicatedIds.length === 1 ? 'copy' : 'copies'}.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const bulkStatusUpdate = useMutation({
    mutationFn: async ({ galleryIds, status }: { galleryIds: string[]; status: GalleryStatus }) => {
      const { error } = await supabase
        .from('galleries')
        .update({ status })
        .in('id', galleryIds);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['galleries'] });
      toast({
        title: 'Status updated!',
        description: `Updated ${variables.galleryIds.length} ${variables.galleryIds.length === 1 ? 'gallery' : 'galleries'} to ${variables.status}.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const bulkDelete = useMutation({
    mutationFn: async (galleryIds: string[]) => {
      // Delete in sequence to handle foreign key constraints
      for (const id of galleryIds) {
        const { error } = await supabase
          .from('galleries')
          .delete()
          .eq('id', id);

        if (error) throw error;
      }
    },
    onSuccess: (_, galleryIds) => {
      queryClient.invalidateQueries({ queryKey: ['galleries'] });
      toast({
        title: 'Galleries deleted!',
        description: `Successfully deleted ${galleryIds.length} ${galleryIds.length === 1 ? 'gallery' : 'galleries'}.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    duplicateGalleries,
    bulkStatusUpdate,
    bulkDelete,
  };
}
