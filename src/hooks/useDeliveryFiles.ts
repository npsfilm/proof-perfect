import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DeliveryFile } from '@/types/database';
import { DeliveryFolderType } from '@/constants/delivery-folders';
import { toast } from '@/hooks/use-toast';

export function useDeliveryFiles(galleryId: string | undefined) {
  return useQuery({
    queryKey: ['delivery-files', galleryId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('delivery_files')
        .select('*')
        .eq('gallery_id', galleryId!)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data as DeliveryFile[];
    },
    enabled: !!galleryId,
  });
}

export function useDeliveryFolderStats(galleryId: string | undefined) {
  return useQuery({
    queryKey: ['delivery-folder-stats', galleryId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('delivery_files')
        .select('folder_type, file_size')
        .eq('gallery_id', galleryId!);
      
      if (error) throw error;
      
      const stats: Record<DeliveryFolderType, { count: number; totalSize: number }> = {
        full_resolution: { count: 0, totalSize: 0 },
        web_version: { count: 0, totalSize: 0 },
        virtual_staging: { count: 0, totalSize: 0 },
        blue_hour: { count: 0, totalSize: 0 },
      };
      
      data.forEach((file) => {
        const folderType = file.folder_type as DeliveryFolderType;
        stats[folderType].count++;
        stats[folderType].totalSize += file.file_size || 0;
      });
      
      return stats;
    },
    enabled: !!galleryId,
  });
}

export function useUploadDeliveryFile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      galleryId,
      gallerySlug,
      folderType,
      file,
    }: {
      galleryId: string;
      gallerySlug: string;
      folderType: DeliveryFolderType;
      file: File;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      // Sanitize filename
      const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const storagePath = `${gallerySlug}/${folderType}/${sanitizedFilename}`;
      
      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('deliveries')
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: false,
        });
      
      if (uploadError) throw uploadError;
      
      // Create database record
      const { error: dbError } = await supabase
        .from('delivery_files')
        .insert({
          gallery_id: galleryId,
          folder_type: folderType,
          filename: sanitizedFilename,
          storage_url: storagePath,
          file_size: file.size,
          uploaded_by: user.id,
        });
      
      if (dbError) {
        // Cleanup storage if DB insert fails
        await supabase.storage.from('deliveries').remove([storagePath]);
        throw dbError;
      }
      
      return storagePath;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['delivery-files', variables.galleryId] });
      queryClient.invalidateQueries({ queryKey: ['delivery-folder-stats', variables.galleryId] });
      toast({
        title: 'Datei hochgeladen',
        description: 'Die Datei wurde erfolgreich hochgeladen.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Upload fehlgeschlagen',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteDeliveryFile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ fileId, storagePath, galleryId }: { fileId: string; storagePath: string; galleryId: string }) => {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('deliveries')
        .remove([storagePath]);
      
      if (storageError) throw storageError;
      
      // Delete from database
      const { error: dbError } = await supabase
        .from('delivery_files')
        .delete()
        .eq('id', fileId);
      
      if (dbError) throw dbError;
      
      return { galleryId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['delivery-files', data.galleryId] });
      queryClient.invalidateQueries({ queryKey: ['delivery-folder-stats', data.galleryId] });
      toast({
        title: 'Datei gelöscht',
        description: 'Die Datei wurde erfolgreich gelöscht.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Löschen fehlgeschlagen',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}
