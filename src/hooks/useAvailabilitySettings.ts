import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AvailabilitySettings {
  id: string;
  user_id: string;
  monday_enabled: boolean;
  monday_start: string;
  monday_end: string;
  tuesday_enabled: boolean;
  tuesday_start: string;
  tuesday_end: string;
  wednesday_enabled: boolean;
  wednesday_start: string;
  wednesday_end: string;
  thursday_enabled: boolean;
  thursday_start: string;
  thursday_end: string;
  friday_enabled: boolean;
  friday_start: string;
  friday_end: string;
  saturday_enabled: boolean;
  saturday_start: string;
  saturday_end: string;
  sunday_enabled: boolean;
  sunday_start: string;
  sunday_end: string;
  slot_interval: number;
  buffer_before: number;
  buffer_after: number;
}

export interface BlockedDate {
  id: string;
  user_id: string;
  start_date: string;
  end_date: string;
  reason: string | null;
  google_event_id: string | null;
  created_at: string;
}

export function useAvailabilitySettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings, isLoading: isLoadingSettings } = useQuery({
    queryKey: ['availability-settings'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('availability_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data as AvailabilitySettings | null;
    },
  });

  const { data: blockedDates = [], isLoading: isLoadingBlocked } = useQuery({
    queryKey: ['blocked-dates'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('blocked_dates')
        .select('*')
        .eq('user_id', user.id)
        .order('start_date', { ascending: true });

      if (error) throw error;
      return data as BlockedDate[];
    },
  });

  const updateSettings = useMutation({
    mutationFn: async (newSettings: Partial<AvailabilitySettings>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      if (settings) {
        const { error } = await supabase
          .from('availability_settings')
          .update(newSettings)
          .eq('user_id', user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('availability_settings')
          .insert({ ...newSettings, user_id: user.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availability-settings'] });
      toast({
        title: 'Einstellungen gespeichert',
        description: 'Verfügbarkeit wurde aktualisiert.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Fehler',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const addBlockedDate = useMutation({
    mutationFn: async (data: { start_date: string; end_date: string; reason?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('blocked_dates')
        .insert({
          user_id: user.id,
          start_date: data.start_date,
          end_date: data.end_date,
          reason: data.reason || null,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blocked-dates'] });
      toast({
        title: 'Blockierung hinzugefügt',
        description: 'Der Zeitraum wurde blockiert.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Fehler',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const removeBlockedDate = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('blocked_dates')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blocked-dates'] });
      toast({
        title: 'Blockierung entfernt',
        description: 'Der Zeitraum wurde freigegeben.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Fehler',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    settings,
    blockedDates,
    isLoading: isLoadingSettings || isLoadingBlocked,
    updateSettings,
    addBlockedDate,
    removeBlockedDate,
  };
}
