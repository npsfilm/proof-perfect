import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { StagingRequest } from '@/types/database';
import { toast } from '@/hooks/use-toast';

export function useAdminStagingRequests() {
  return useQuery({
    queryKey: ['admin-staging-requests'],
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

      // Fetch user emails separately
      const userIds = [...new Set(data.map(r => r.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email')
        .in('id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p.email]));

      return data.map(request => ({
        ...request,
        user_email: profileMap.get(request.user_id) || 'Unbekannt',
      }));
    },
  });
}

export function useUpdateStagingRequestStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      requestId,
      status,
    }: {
      requestId: string;
      status: 'pending' | 'processing' | 'delivered';
    }) => {
      const { error } = await supabase
        .from('staging_requests')
        .update({ status })
        .eq('id', requestId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-staging-requests'] });
      toast({
        title: 'Status aktualisiert',
        description: 'Der Anfrage-Status wurde erfolgreich geändert.',
      });
    },
    onError: (error) => {
      console.error('Error updating staging request status:', error);
      toast({
        title: 'Fehler',
        description: 'Der Status konnte nicht aktualisiert werden.',
        variant: 'destructive',
      });
    },
  });
}
