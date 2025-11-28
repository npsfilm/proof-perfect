import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { ReopenRequest } from '@/types/database';

export const useReopenRequests = (galleryId?: string) => {
  return useQuery({
    queryKey: ['reopen-requests', galleryId],
    queryFn: async () => {
      const query = supabase
        .from('reopen_requests')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (galleryId) {
        query.eq('gallery_id', galleryId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as ReopenRequest[];
    },
  });
};

export const useCreateReopenRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ galleryId, message }: { galleryId: string; message?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('reopen_requests')
        .insert([{
          gallery_id: galleryId,
          user_id: user.id,
          message,
          status: 'pending',
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reopen-requests'] });
      toast({
        title: 'Anfrage gesendet',
        description: 'Ihre Anfrage zur Wiedereröffnung wurde gesendet.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Fehler',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useResolveReopenRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      requestId, 
      status, 
      reopenGallery 
    }: { 
      requestId: string; 
      status: 'approved' | 'rejected';
      reopenGallery?: boolean;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      // Update request status
      const { error: requestError } = await supabase
        .from('reopen_requests')
        .update({
          status,
          resolved_at: new Date().toISOString(),
          resolved_by: user.id,
        })
        .eq('id', requestId);
      
      if (requestError) throw requestError;
      
      // If approved and should reopen gallery
      if (status === 'approved' && reopenGallery) {
        const { data: request } = await supabase
          .from('reopen_requests')
          .select('gallery_id')
          .eq('id', requestId)
          .single();
        
        if (request) {
          const { error: galleryError } = await supabase
            .from('galleries')
            .update({
              status: 'Open',
              is_locked: false,
            })
            .eq('id', request.gallery_id);
          
          if (galleryError) throw galleryError;
        }
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reopen-requests'] });
      queryClient.invalidateQueries({ queryKey: ['galleries'] });
      toast({
        title: variables.status === 'approved' ? 'Anfrage genehmigt' : 'Anfrage abgelehnt',
        description: variables.status === 'approved' 
          ? 'Die Galerie wurde wiedereröffnet.' 
          : 'Die Anfrage wurde abgelehnt.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Fehler',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};
