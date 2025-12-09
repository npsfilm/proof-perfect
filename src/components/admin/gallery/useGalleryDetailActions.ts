import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useResolveReopenRequest } from '@/hooks/useReopenRequests';

export function useGalleryDetailActions(galleryId: string | undefined) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const resolveRequest = useResolveReopenRequest();

  const handleApproveRequest = (requestId: string) => {
    resolveRequest.mutate(
      { requestId, status: 'approved', reopenGallery: true },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['gallery', galleryId] });
        },
      }
    );
  };

  const handleRejectRequest = (requestId: string) => {
    resolveRequest.mutate({ requestId, status: 'rejected' });
  };

  const handleReopenGallery = async () => {
    if (!galleryId) return;

    try {
      const { error } = await supabase
        .from('galleries')
        .update({ status: 'Open' })
        .eq('id', galleryId);

      if (error) throw error;

      toast({
        title: 'Galerie geöffnet',
        description: 'Die Galerie wurde wieder geöffnet und kann bearbeitet werden.',
      });

      queryClient.invalidateQueries({ queryKey: ['gallery', galleryId] });
    } catch (error: any) {
      toast({
        title: 'Fehler',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return {
    handleApproveRequest,
    handleRejectRequest,
    handleReopenGallery,
    isResolving: resolveRequest.isPending,
  };
}
