import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Save, Loader2 } from 'lucide-react';
import { useAvailabilitySettings, AvailabilitySettings as AvailabilitySettingsType } from '@/hooks/useAvailabilitySettings';
import { WeeklyScheduleCard } from './WeeklyScheduleCard';
import { BlockedDatesCard } from './BlockedDatesCard';
import { BookingSettingsCard } from './BookingSettingsCard';

export function AvailabilitySettings() {
  const { 
    settings, 
    blockedDates, 
    isLoading, 
    saveSettings, 
    addBlockedDate, 
    removeBlockedDate 
  } = useAvailabilitySettings();

  const [localSettings, setLocalSettings] = useState<AvailabilitySettingsType>(settings);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <WeeklyScheduleCard 
        settings={localSettings} 
        onSettingsChange={setLocalSettings} 
      />
      
      <BookingSettingsCard 
        settings={localSettings} 
        onSettingsChange={setLocalSettings} 
      />
      
      <BlockedDatesCard
        blockedDates={blockedDates}
        onAdd={(data) => addBlockedDate.mutate(data)}
        onRemove={(id) => removeBlockedDate.mutate(id)}
        isAdding={addBlockedDate.isPending}
        isRemoving={removeBlockedDate.isPending}
      />

      <Button 
        onClick={() => saveSettings.mutate(localSettings)} 
        disabled={saveSettings.isPending}
        className="w-full sm:w-auto"
      >
        {saveSettings.isPending ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Save className="h-4 w-4 mr-2" />
        )}
        {saveSettings.isPending ? 'Wird gespeichert...' : 'Verfügbarkeit speichern'}
      </Button>
    </div>
  );
}
