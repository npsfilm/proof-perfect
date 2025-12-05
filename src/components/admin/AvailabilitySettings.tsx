import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Calendar, Clock, Trash2, Plus, RefreshCw, Save } from 'lucide-react';
import { useAvailabilitySettings, AvailabilitySettings as AvailabilitySettingsType } from '@/hooks/useAvailabilitySettings';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

const DAYS = [
  { key: 'monday', label: 'Montag' },
  { key: 'tuesday', label: 'Dienstag' },
  { key: 'wednesday', label: 'Mittwoch' },
  { key: 'thursday', label: 'Donnerstag' },
  { key: 'friday', label: 'Freitag' },
  { key: 'saturday', label: 'Samstag' },
  { key: 'sunday', label: 'Sonntag' },
] as const;

type DayKey = typeof DAYS[number]['key'];

interface LocalSettings {
  [key: string]: boolean | string | number;
}

export function AvailabilitySettings() {
  const { toast } = useToast();
  const { settings, blockedDates, isLoading, updateSettings, addBlockedDate, removeBlockedDate } = useAvailabilitySettings();
  const [isSyncing, setIsSyncing] = useState(false);
  
  const [localSettings, setLocalSettings] = useState<LocalSettings>({
    monday_enabled: true,
    monday_start: '08:00',
    monday_end: '18:00',
    tuesday_enabled: true,
    tuesday_start: '08:00',
    tuesday_end: '18:00',
    wednesday_enabled: true,
    wednesday_start: '08:00',
    wednesday_end: '18:00',
    thursday_enabled: true,
    thursday_start: '08:00',
    thursday_end: '18:00',
    friday_enabled: true,
    friday_start: '08:00',
    friday_end: '18:00',
    saturday_enabled: false,
    saturday_start: '09:00',
    saturday_end: '14:00',
    sunday_enabled: false,
    sunday_start: '09:00',
    sunday_end: '14:00',
    slot_interval: 30,
    buffer_before: 0,
    buffer_after: 15,
  });

  const [newBlockedDate, setNewBlockedDate] = useState({
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

  const handleSaveSettings = () => {
    updateSettings.mutate(localSettings as Partial<AvailabilitySettingsType>);
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

  if (isLoading) {
    return <div className="animate-pulse h-96 bg-muted rounded-lg" />;
  }

  return (
    <div className="space-y-6">
      {/* Weekly Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Wöchentliche Arbeitszeiten
          </CardTitle>
          <CardDescription>
            Legen Sie Ihre verfügbaren Zeiten für jeden Wochentag fest
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {DAYS.map(({ key, label }) => (
            <div key={key} className="flex items-center gap-4">
              <Switch
                checked={localSettings[`${key}_enabled`] as boolean}
                onCheckedChange={(checked) => handleDayToggle(key, checked)}
              />
              <span className="w-24 font-medium">{label}</span>
              {localSettings[`${key}_enabled`] ? (
                <>
                  <Input
                    type="time"
                    value={localSettings[`${key}_start`] as string}
                    onChange={(e) => handleTimeChange(key, 'start', e.target.value)}
                    className="w-32"
                  />
                  <span className="text-muted-foreground">bis</span>
                  <Input
                    type="time"
                    value={localSettings[`${key}_end`] as string}
                    onChange={(e) => handleTimeChange(key, 'end', e.target.value)}
                    className="w-32"
                  />
                </>
              ) : (
                <span className="text-muted-foreground">Nicht verfügbar</span>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Blocked Dates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Blockierte Zeiten / Urlaub
          </CardTitle>
          <CardDescription>
            Zeiträume, in denen keine Termine gebucht werden können
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {blockedDates.length > 0 && (
            <div className="space-y-2">
              {blockedDates.map((blocked) => (
                <div key={blocked.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <span className="font-medium">
                      {format(new Date(blocked.start_date), 'dd.MM.yyyy', { locale: de })}
                      {blocked.start_date !== blocked.end_date && (
                        <> – {format(new Date(blocked.end_date), 'dd.MM.yyyy', { locale: de })}</>
                      )}
                    </span>
                    {blocked.reason && (
                      <span className="ml-2 text-muted-foreground">({blocked.reason})</span>
                    )}
                    {blocked.google_event_id && (
                      <span className="ml-2 text-xs text-green-600">✓ Synced</span>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeBlockedDate.mutate(blocked.id)}
                    disabled={removeBlockedDate.isPending}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-end gap-4 pt-4 border-t">
            <div className="space-y-2">
              <Label>Startdatum</Label>
              <Input
                type="date"
                value={newBlockedDate.start_date}
                onChange={(e) => setNewBlockedDate(prev => ({ ...prev, start_date: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Enddatum</Label>
              <Input
                type="date"
                value={newBlockedDate.end_date}
                onChange={(e) => setNewBlockedDate(prev => ({ ...prev, end_date: e.target.value }))}
              />
            </div>
            <div className="space-y-2 flex-1">
              <Label>Grund (optional)</Label>
              <Input
                placeholder="z.B. Urlaub, Krankheit..."
                value={newBlockedDate.reason}
                onChange={(e) => setNewBlockedDate(prev => ({ ...prev, reason: e.target.value }))}
              />
            </div>
            <Button onClick={handleAddBlockedDate} disabled={addBlockedDate.isPending}>
              <Plus className="h-4 w-4 mr-2" />
              Hinzufügen
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Booking Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Termineinstellungen</CardTitle>
          <CardDescription>
            Konfigurieren Sie Slot-Intervalle und Pufferzeiten
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Slot-Intervall</Label>
            <Select
              value={String(localSettings.slot_interval)}
              onValueChange={(value) => setLocalSettings(prev => ({ ...prev, slot_interval: parseInt(value) }))}
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 Minuten</SelectItem>
                <SelectItem value="30">30 Minuten</SelectItem>
                <SelectItem value="60">60 Minuten</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Puffer vor dem Termin: {localSettings.buffer_before} Min</Label>
            <Slider
              value={[localSettings.buffer_before as number]}
              onValueChange={([value]) => setLocalSettings(prev => ({ ...prev, buffer_before: value }))}
              max={60}
              step={5}
              className="w-64"
            />
          </div>

          <div className="space-y-2">
            <Label>Puffer nach dem Termin: {localSettings.buffer_after} Min</Label>
            <Slider
              value={[localSettings.buffer_after as number]}
              onValueChange={([value]) => setLocalSettings(prev => ({ ...prev, buffer_after: value }))}
              max={60}
              step={5}
              className="w-64"
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4">
        <Button onClick={handleSaveSettings} disabled={updateSettings.isPending}>
          <Save className="h-4 w-4 mr-2" />
          {updateSettings.isPending ? 'Wird gespeichert...' : 'Einstellungen speichern'}
        </Button>
        <Button variant="outline" onClick={handleSyncToGoogle} disabled={isSyncing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
          {isSyncing ? 'Synchronisiere...' : 'Mit Google Kalender synchronisieren'}
        </Button>
      </div>
    </div>
  );
}
