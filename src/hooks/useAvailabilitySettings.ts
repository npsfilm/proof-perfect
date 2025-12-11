import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface DaySettings {
  enabled: boolean;
  start: string;
  end: string;
}

export interface AvailabilitySettings {
  id?: string;
  monday: DaySettings;
  tuesday: DaySettings;
  wednesday: DaySettings;
  thursday: DaySettings;
  friday: DaySettings;
  saturday: DaySettings;
  sunday: DaySettings;
  slotInterval: number;
  bufferBefore: number;
  bufferAfter: number;
}

export interface BlockedDate {
  id: string;
  start_date: string;
  end_date: string;
  reason: string | null;
}

const defaultSettings: AvailabilitySettings = {
  monday: { enabled: true, start: '08:00', end: '18:00' },
  tuesday: { enabled: true, start: '08:00', end: '18:00' },
  wednesday: { enabled: true, start: '08:00', end: '18:00' },
  thursday: { enabled: true, start: '08:00', end: '18:00' },
  friday: { enabled: true, start: '08:00', end: '18:00' },
  saturday: { enabled: false, start: '09:00', end: '14:00' },
  sunday: { enabled: false, start: '09:00', end: '14:00' },
  slotInterval: 30,
  bufferBefore: 0,
  bufferAfter: 15,
};

export function useAvailabilitySettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings, isLoading: settingsLoading } = useQuery({
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
      
      if (!data) return defaultSettings;

      return {
        id: data.id,
        monday: { enabled: data.monday_enabled, start: data.monday_start, end: data.monday_end },
        tuesday: { enabled: data.tuesday_enabled, start: data.tuesday_start, end: data.tuesday_end },
        wednesday: { enabled: data.wednesday_enabled, start: data.wednesday_start, end: data.wednesday_end },
        thursday: { enabled: data.thursday_enabled, start: data.thursday_start, end: data.thursday_end },
        friday: { enabled: data.friday_enabled, start: data.friday_start, end: data.friday_end },
        saturday: { enabled: data.saturday_enabled, start: data.saturday_start, end: data.saturday_end },
        sunday: { enabled: data.sunday_enabled, start: data.sunday_start, end: data.sunday_end },
        slotInterval: data.slot_interval,
        bufferBefore: data.buffer_before,
        bufferAfter: data.buffer_after,
      } as AvailabilitySettings;
    },
  });

  const { data: blockedDates, isLoading: blockedDatesLoading } = useQuery({
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

  const saveSettings = useMutation({
    mutationFn: async (newSettings: AvailabilitySettings) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const dbData = {
        user_id: user.id,
        monday_enabled: newSettings.monday.enabled,
        monday_start: newSettings.monday.start,
        monday_end: newSettings.monday.end,
        tuesday_enabled: newSettings.tuesday.enabled,
        tuesday_start: newSettings.tuesday.start,
        tuesday_end: newSettings.tuesday.end,
        wednesday_enabled: newSettings.wednesday.enabled,
        wednesday_start: newSettings.wednesday.start,
        wednesday_end: newSettings.wednesday.end,
        thursday_enabled: newSettings.thursday.enabled,
        thursday_start: newSettings.thursday.start,
        thursday_end: newSettings.thursday.end,
        friday_enabled: newSettings.friday.enabled,
        friday_start: newSettings.friday.start,
        friday_end: newSettings.friday.end,
        saturday_enabled: newSettings.saturday.enabled,
        saturday_start: newSettings.saturday.start,
        saturday_end: newSettings.saturday.end,
        sunday_enabled: newSettings.sunday.enabled,
        sunday_start: newSettings.sunday.start,
        sunday_end: newSettings.sunday.end,
        slot_interval: newSettings.slotInterval,
        buffer_before: newSettings.bufferBefore,
        buffer_after: newSettings.bufferAfter,
      };

      if (newSettings.id) {
        const { error } = await supabase
          .from('availability_settings')
          .update(dbData)
          .eq('id', newSettings.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('availability_settings')
          .insert(dbData);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availability-settings'] });
      toast({
        title: 'Verfügbarkeit gespeichert',
        description: 'Ihre Verfügbarkeitseinstellungen wurden aktualisiert.',
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
    mutationFn: async (blockedDate: { startDate: string; endDate: string; reason?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('blocked_dates')
        .insert({
          user_id: user.id,
          start_date: blockedDate.startDate,
          end_date: blockedDate.endDate,
          reason: blockedDate.reason || null,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blocked-dates'] });
      toast({
        title: 'Blockierter Zeitraum hinzugefügt',
        description: 'Der Zeitraum wurde zur Liste hinzugefügt.',
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
        title: 'Blockierter Zeitraum entfernt',
        description: 'Der Zeitraum wurde aus der Liste entfernt.',
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
    settings: settings || defaultSettings,
    blockedDates: blockedDates || [],
    isLoading: settingsLoading || blockedDatesLoading,
    saveSettings,
    addBlockedDate,
    removeBlockedDate,
  };
}
