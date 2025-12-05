import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface DaySchedule {
  enabled: boolean;
  start: string;
  end: string;
}

export interface AvailabilitySettings {
  id: string;
  user_id: string;
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
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
  created_at: string;
}

// Helper to parse DB row to settings object
function parseDbRow(row: any): AvailabilitySettings {
  return {
    id: row.id,
    user_id: row.user_id,
    monday: { enabled: row.monday_enabled, start: row.monday_start, end: row.monday_end },
    tuesday: { enabled: row.tuesday_enabled, start: row.tuesday_start, end: row.tuesday_end },
    wednesday: { enabled: row.wednesday_enabled, start: row.wednesday_start, end: row.wednesday_end },
    thursday: { enabled: row.thursday_enabled, start: row.thursday_start, end: row.thursday_end },
    friday: { enabled: row.friday_enabled, start: row.friday_start, end: row.friday_end },
    saturday: { enabled: row.saturday_enabled, start: row.saturday_start, end: row.saturday_end },
    sunday: { enabled: row.sunday_enabled, start: row.sunday_start, end: row.sunday_end },
    slot_interval: row.slot_interval,
    buffer_before: row.buffer_before,
    buffer_after: row.buffer_after,
  };
}

// Helper to convert settings object to DB row format
function toDbRow(settings: AvailabilitySettings): Record<string, any> {
  return {
    monday_enabled: settings.monday.enabled,
    monday_start: settings.monday.start,
    monday_end: settings.monday.end,
    tuesday_enabled: settings.tuesday.enabled,
    tuesday_start: settings.tuesday.start,
    tuesday_end: settings.tuesday.end,
    wednesday_enabled: settings.wednesday.enabled,
    wednesday_start: settings.wednesday.start,
    wednesday_end: settings.wednesday.end,
    thursday_enabled: settings.thursday.enabled,
    thursday_start: settings.thursday.start,
    thursday_end: settings.thursday.end,
    friday_enabled: settings.friday.enabled,
    friday_start: settings.friday.start,
    friday_end: settings.friday.end,
    saturday_enabled: settings.saturday.enabled,
    saturday_start: settings.saturday.start,
    saturday_end: settings.saturday.end,
    sunday_enabled: settings.sunday.enabled,
    sunday_start: settings.sunday.start,
    sunday_end: settings.sunday.end,
    slot_interval: settings.slot_interval,
    buffer_before: settings.buffer_before,
    buffer_after: settings.buffer_after,
  };
}

export function useAvailabilitySettings() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['availability-settings', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('availability_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      
      // Return parsed data or null (will create on first save)
      return data ? parseDbRow(data) : null;
    },
    enabled: !!user?.id,
  });

  const { data: blockedDates, isLoading: blockedDatesLoading } = useQuery({
    queryKey: ['blocked-dates', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('blocked_dates')
        .select('*')
        .eq('user_id', user.id)
        .order('start_date', { ascending: true });

      if (error) throw error;
      return data as BlockedDate[];
    },
    enabled: !!user?.id,
  });

  const saveSettings = useMutation({
    mutationFn: async (newSettings: AvailabilitySettings) => {
      if (!user?.id) throw new Error('Not authenticated');

      const dbRow = toDbRow(newSettings);

      if (newSettings.id) {
        // Update existing
        const { error } = await supabase
          .from('availability_settings')
          .update(dbRow)
          .eq('id', newSettings.id);
        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from('availability_settings')
          .insert({ ...dbRow, user_id: user.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availability-settings'] });
    },
  });

  const addBlockedDate = useMutation({
    mutationFn: async (blocked: { start_date: string; end_date: string; reason?: string }) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('blocked_dates')
        .insert({
          user_id: user.id,
          start_date: blocked.start_date,
          end_date: blocked.end_date,
          reason: blocked.reason || null,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blocked-dates'] });
    },
  });

  const deleteBlockedDate = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('blocked_dates')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blocked-dates'] });
    },
  });

  // Default settings if none exist
  const defaultSettings: AvailabilitySettings = {
    id: '',
    user_id: user?.id || '',
    monday: { enabled: true, start: '08:00', end: '18:00' },
    tuesday: { enabled: true, start: '08:00', end: '18:00' },
    wednesday: { enabled: true, start: '08:00', end: '18:00' },
    thursday: { enabled: true, start: '08:00', end: '18:00' },
    friday: { enabled: true, start: '08:00', end: '18:00' },
    saturday: { enabled: false, start: '09:00', end: '14:00' },
    sunday: { enabled: false, start: '09:00', end: '14:00' },
    slot_interval: 30,
    buffer_before: 0,
    buffer_after: 15,
  };

  return {
    settings: settings || defaultSettings,
    blockedDates: blockedDates || [],
    isLoading: isLoading || blockedDatesLoading,
    saveSettings,
    addBlockedDate,
    deleteBlockedDate,
  };
}
