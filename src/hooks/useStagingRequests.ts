import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { StagingRequest, StagingRequestPhoto } from '@/types/database';
import { toast } from '@/hooks/use-toast';

export function useStagingRequests() {
  return useQuery({
    queryKey: ['staging-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('staging_requests')
        .select(`
          *,
          galleries (
            name,
            slug,
            address
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as (StagingRequest & { galleries: { name: string; slug: string; address?: string } })[];
    },
  });
}

export function useCreateStagingRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      gallery_id,
      staging_style,
      photo_ids,
      notes,
    }: {
      gallery_id: string;
      staging_style: string;
      photo_ids: string[];
      notes?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Create staging request
      const { data: request, error: requestError } = await supabase
        .from('staging_requests')
        .insert({
          gallery_id,
          user_id: user.id,
          staging_style,
          notes,
        })
        .select()
        .single();

      if (requestError) throw requestError;

      // Insert staging request photos
      const photos = photo_ids.map(photo_id => ({
        staging_request_id: request.id,
        photo_id,
      }));

      const { error: photosError } = await supabase
        .from('staging_request_photos')
        .insert(photos);

      if (photosError) throw photosError;

      return request;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staging-requests'] });
      toast({
        title: 'Staging-Anfrage gesendet',
        description: 'Ihre Anfrage wurde erfolgreich übermittelt.',
      });
    },
    onError: (error) => {
      console.error('Error creating staging request:', error);
      toast({
        title: 'Fehler',
        description: 'Die Anfrage konnte nicht erstellt werden.',
        variant: 'destructive',
      });
    },
  });
}

export function useStagingRequestPhotos(requestId?: string) {
  return useQuery({
    queryKey: ['staging-request-photos', requestId],
    queryFn: async () => {
      if (!requestId) return [];

      const { data, error } = await supabase
        .from('staging_request_photos')
        .select(`
          *,
          photos (
            id,
            filename,
            storage_url,
            gallery_id
          )
        `)
        .eq('staging_request_id', requestId);

      if (error) throw error;
      return data as (StagingRequestPhoto & {
        photos: {
          id: string;
          filename: string;
          storage_url: string;
          gallery_id: string;
        };
      })[];
    },
    enabled: !!requestId,
  });
}
