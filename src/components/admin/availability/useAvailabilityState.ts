import { useState, useEffect } from 'react';
import { useAvailabilitySettings, AvailabilitySettings } from '@/hooks/useAvailabilitySettings';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { LocalSettings, NewBlockedDate, DEFAULT_SETTINGS, DayKey } from './types';

export function useAvailabilityState() {
  const { toast } = useToast();
  const { settings, blockedDates, isLoading, updateSettings, addBlockedDate, removeBlockedDate } = useAvailabilitySettings();
  const [isSyncing, setIsSyncing] = useState(false);
  const [localSettings, setLocalSettings] = useState<LocalSettings>(DEFAULT_SETTINGS);
  const [newBlockedDate, setNewBlockedDate] = useState<NewBlockedDate>({
    start_date: '',
    end_date: '',
    reason: '',
  });

  useEffect(() => {
    if (settings) {
      setLocalSettings({
        monday_enabled: settings.monday_enabled,
        monday_start: settings.monday_start,
        monday_end: settings.monday_end,
        tuesday_enabled: settings.tuesday_enabled,
        tuesday_start: settings.tuesday_start,
        tuesday_end: settings.tuesday_end,
        wednesday_enabled: settings.wednesday_enabled,
        wednesday_start: settings.wednesday_start,
        wednesday_end: settings.wednesday_end,
        thursday_enabled: settings.thursday_enabled,
        thursday_start: settings.thursday_start,
        thursday_end: settings.thursday_end,
        friday_enabled: settings.friday_enabled,
        friday_start: settings.friday_start,
        friday_end: settings.friday_end,
        saturday_enabled: settings.saturday_enabled,
        saturday_start: settings.saturday_start,
        saturday_end: settings.saturday_end,
        sunday_enabled: settings.sunday_enabled,
        sunday_start: settings.sunday_start,
        sunday_end: settings.sunday_end,
        slot_interval: settings.slot_interval,
        buffer_before: settings.buffer_before,
        buffer_after: settings.buffer_after,
      });
    }
  }, [settings]);

  const handleDayToggle = (day: DayKey, enabled: boolean) => {
    setLocalSettings(prev => ({ ...prev, [`${day}_enabled`]: enabled }));
  };

  const handleTimeChange = (day: DayKey, type: 'start' | 'end', value: string) => {
    setLocalSettings(prev => ({ ...prev, [`${day}_${type}`]: value }));
  };

  const handleSettingsChange = (updates: Partial<LocalSettings>) => {
    setLocalSettings(prev => ({ ...prev, ...updates }));
  };

  const handleSaveSettings = () => {
    updateSettings.mutate(localSettings as Partial<AvailabilitySettings>);
  };

  const handleAddBlockedDate = () => {
    if (!newBlockedDate.start_date || !newBlockedDate.end_date) {
      toast({
        title: 'Fehler',
        description: 'Bitte Start- und Enddatum eingeben.',
        variant: 'destructive',
      });
      return;
    }
    addBlockedDate.mutate(newBlockedDate, {
      onSuccess: () => {
        setNewBlockedDate({ start_date: '', end_date: '', reason: '' });
      },
    });
  };

  const handleSyncToGoogle = async () => {
    setIsSyncing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const { data, error } = await supabase.functions.invoke('sync-google-calendar', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (error) throw error;

      toast({
        title: 'Synchronisierung erfolgreich',
        description: `${data.pulled || 0} Ereignisse abgerufen, ${data.pushed || 0} gesendet, ${data.blockedSynced || 0} blockierte Zeiten synchronisiert.`,
      });
    } catch (error: any) {
      toast({
        title: 'Synchronisierung fehlgeschlagen',
        description: error.message === 'token expired' 
          ? 'Google-Verbindung abgelaufen. Bitte erneut verbinden.' 
          : error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return {
    localSettings,
    blockedDates,
    newBlockedDate,
    isLoading,
    isSyncing,
    isSaving: updateSettings.isPending,
    isAddingBlocked: addBlockedDate.isPending,
    isRemovingBlocked: removeBlockedDate.isPending,
    setNewBlockedDate,
    handleDayToggle,
    handleTimeChange,
    handleSettingsChange,
    handleSaveSettings,
    handleAddBlockedDate,
    handleRemoveBlockedDate: (id: string) => removeBlockedDate.mutate(id),
    handleSyncToGoogle,
  };
}
