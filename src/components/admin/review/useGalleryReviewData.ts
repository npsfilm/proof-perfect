import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Gallery, Photo, StagingReference } from '@/types/database';
import { useToast } from '@/hooks/use-toast';
import { useDeliveryFiles } from '@/hooks/useDeliveryFiles';
import { useSignedPhotoUrls } from '@/hooks/useSignedPhotoUrls';

export function useGalleryReviewData(id: string | undefined) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: gallery, isLoading: galleryLoading } = useQuery({
    queryKey: ['gallery', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('galleries')
        .select('*, companies(name)')
        .eq('id', id!)
        .single();
      if (error) throw error;
      return data as Gallery & { companies?: { name: string } | null };
    },
    enabled: !!id,
  });

  // Automatically set status to Processing when opening review page
  useEffect(() => {
    const updateStatusToProcessing = async () => {
      if (gallery && gallery.status === 'Closed') {
        try {
          const { error } = await supabase
            .from('galleries')
            .update({ status: 'Processing' })
            .eq('id', gallery.id);

          if (error) {
            console.error('Error updating status:', error);
            return;
          }

          queryClient.invalidateQueries({ queryKey: ['gallery', id] });
          queryClient.invalidateQueries({ queryKey: ['galleries'] });

          toast({
            title: 'Status aktualisiert',
            description: 'Galerie ist jetzt in Bearbeitung.',
          });
        } catch (error) {
          console.error('Error updating gallery status:', error);
        }
      }
    };

    updateStatusToProcessing();
  }, [gallery, id, queryClient, toast]);

  const { data: selectedPhotos } = useQuery({
    queryKey: ['selected-photos', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .eq('gallery_id', id!)
        .eq('is_selected', true)
        .order('upload_order', { ascending: true });
      if (error) throw error;
      return data as Photo[];
    },
    enabled: !!id,
  });

  const { data: feedback } = useQuery({
    queryKey: ['gallery-feedback', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gallery_feedback')
        .select('*, profiles(email)')
        .eq('gallery_id', id!)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: clientEmails } = useQuery({
    queryKey: ['gallery-clients', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gallery_access')
        .select('profiles(email)')
        .eq('gallery_id', id!);
      if (error) throw error;
      return data.map((a: any) => a.profiles.email) as string[];
    },
    enabled: !!id,
  });

  const { data: deliveryFiles } = useDeliveryFiles(id);

  const { data: allAnnotations } = useQuery({
    queryKey: ['all-annotations', id],
    queryFn: async () => {
      if (!selectedPhotos || selectedPhotos.length === 0) return [];
      
      const photoIds = selectedPhotos.map(p => p.id);
      const { data, error } = await supabase
        .from('photo_annotations')
        .select('*')
        .in('photo_id', photoIds);
      
      if (error) throw error;
      return data;
    },
    enabled: !!selectedPhotos && selectedPhotos.length > 0,
  });

  const { data: stagingReferences } = useQuery({
    queryKey: ['staging-references', id],
    queryFn: async () => {
      if (!selectedPhotos || selectedPhotos.length === 0) return [];
      
      const photoIds = selectedPhotos.map(p => p.id);
      const { data, error } = await supabase
        .from('staging_references')
        .select('*')
        .in('photo_id', photoIds);
      
      if (error) throw error;
      return data as StagingReference[];
    },
    enabled: !!selectedPhotos && selectedPhotos.length > 0,
  });

  // Generate signed URLs for selected photos
  const { signedUrls, isLoading: signedUrlsLoading } = useSignedPhotoUrls(selectedPhotos);

  return {
    gallery,
    galleryLoading,
    selectedPhotos,
    feedback,
    clientEmails,
    deliveryFiles,
    allAnnotations,
    stagingReferences,
    signedUrls,
    signedUrlsLoading,
  };
}
