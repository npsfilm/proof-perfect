import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export function useGoogleCalendarSync() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  const syncMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');

      const { data: session } = await supabase.auth.getSession();
      if (!session.session) throw new Error('No session');

      const { data, error } = await supabase.functions.invoke('sync-google-calendar', {
        headers: {
          Authorization: `Bearer ${session.session.access_token}`,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setLastSyncTime(new Date());
      queryClient.invalidateQueries({ queryKey: ['events'] });
      
      const { pulled, pushed } = data || { pulled: 0, pushed: 0 };
      toast.success(`Sync abgeschlossen: ${pulled} abgerufen, ${pushed} hochgeladen`);
    },
    onError: (error: Error) => {
      console.error('Sync error:', error);
      
      if (error.message?.includes('not connected')) {
        toast.error('Bitte verbinden Sie zuerst Ihren Google Kalender');
      } else if (error.message?.includes('token expired')) {
        toast.error('Google-Verbindung abgelaufen. Bitte erneut verbinden.');
      } else {
        toast.error('Fehler beim Synchronisieren');
      }
    },
  });

  return {
    sync: syncMutation.mutate,
    isSyncing: syncMutation.isPending,
    lastSyncTime,
    syncError: syncMutation.error,
  };
}
