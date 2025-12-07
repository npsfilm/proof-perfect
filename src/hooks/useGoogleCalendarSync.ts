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
  const initialSyncDone = useRef(false);

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
        const { pulled = 0 } = data || {};
        toast.success(`Sync abgeschlossen: ${pulled} Events aktualisiert`);
      }
    },
    onError: (error: Error) => {
      console.error('Sync error:', error);
      toast.error('Fehler beim Synchronisieren');
    },
  });

  const sync = useCallback((options?: { silent?: boolean }) => {
    syncMutation.mutate(options);
  }, [syncMutation]);

  // Auto-sync on mount
  useEffect(() => {
    if (autoSync && user && !initialSyncDone.current) {
      initialSyncDone.current = true;
      sync({ silent: true });
    }
  }, [autoSync, user, sync]);

  // Interval-based background sync
  useEffect(() => {
    if (!autoSync || !user) return;

    const intervalId = setInterval(() => {
      sync({ silent: true });
    }, SYNC_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [autoSync, user, sync]);

  return {
    sync: (options?: { silent?: boolean }) => syncMutation.mutate(options),
    isSyncing: syncMutation.isPending,
    lastSyncTime,
    syncError: syncMutation.error,
    isConnected: true, // Always connected with iCal (no OAuth needed)
  };
}
