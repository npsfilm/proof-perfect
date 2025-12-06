import { useState, useEffect, useCallback, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const SYNC_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

export function useGoogleCalendarSync(autoSync: boolean = false) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const initialSyncDone = useRef(false);

  // Check if Google Calendar is connected
  useEffect(() => {
    if (!user) {
      setIsConnected(false);
      return;
    }

    const checkConnection = async () => {
      const { data } = await supabase
        .from('google_calendar_tokens')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      setIsConnected(!!data);
    };

    checkConnection();
  }, [user]);

  const syncMutation = useMutation({
    mutationFn: async (options?: { silent?: boolean }) => {
      if (!user) throw new Error('Not authenticated');

      const { data: session } = await supabase.auth.getSession();
      if (!session.session) throw new Error('No session');

      const { data, error } = await supabase.functions.invoke('sync-google-calendar', {
        headers: {
          Authorization: `Bearer ${session.session.access_token}`,
        },
      });

      if (error) throw error;
      return { ...data, silent: options?.silent };
    },
    onSuccess: (data) => {
      setLastSyncTime(new Date());
      queryClient.invalidateQueries({ queryKey: ['events'] });
      
      if (!data?.silent) {
        const { pulled, pushed } = data || { pulled: 0, pushed: 0 };
        toast.success(`Sync abgeschlossen: ${pulled} abgerufen, ${pushed} hochgeladen`);
      }
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

  const sync = useCallback((options?: { silent?: boolean }) => {
    syncMutation.mutate(options);
  }, [syncMutation]);

  // Auto-sync on mount if connected
  useEffect(() => {
    if (autoSync && isConnected && user && !initialSyncDone.current) {
      initialSyncDone.current = true;
      sync({ silent: true });
    }
  }, [autoSync, isConnected, user, sync]);

  // Interval-based background sync
  useEffect(() => {
    if (!autoSync || !isConnected || !user) return;

    const intervalId = setInterval(() => {
      sync({ silent: true });
    }, SYNC_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [autoSync, isConnected, user, sync]);

  return {
    sync: (options?: { silent?: boolean }) => syncMutation.mutate(options),
    isSyncing: syncMutation.isPending,
    lastSyncTime,
    syncError: syncMutation.error,
    isConnected,
  };
}
