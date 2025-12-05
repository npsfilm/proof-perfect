import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { useAvailabilitySettings, AvailabilitySettings as AvailabilitySettingsType, DaySchedule } from '@/hooks/useAvailabilitySettings';
import { Save, CalendarDays, Clock, Plus, Trash2, CalendarOff } from 'lucide-react';
import { format, parseISO } from 'date-fns';
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

function TimeSelect({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  const times: string[] = [];
  for (let h = 6; h <= 22; h++) {
    times.push(`${h.toString().padStart(2, '0')}:00`);
    times.push(`${h.toString().padStart(2, '0')}:30`);
  }

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-24">
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        {times.map((time) => (
          <SelectItem key={time} value={time}>
            {time}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function AvailabilitySettings() {
  const { toast } = useToast();
  const { settings, blockedDates, isLoading, saveSettings, addBlockedDate, deleteBlockedDate } = useAvailabilitySettings();
  
  const [localSettings, setLocalSettings] = useState<AvailabilitySettingsType>(settings);
  const [newBlockedStart, setNewBlockedStart] = useState<Date | undefined>();
  const [newBlockedEnd, setNewBlockedEnd] = useState<Date | undefined>();
  const [newBlockedReason, setNewBlockedReason] = useState('');

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const updateDaySchedule = (day: DayKey, updates: Partial<DaySchedule>) => {
    setLocalSettings((prev) => ({
      ...prev,
      [day]: { ...prev[day], ...updates },
    }));
  };

  const handleSave = async () => {
    try {
      await saveSettings.mutateAsync(localSettings);
      toast({
        title: 'Einstellungen gespeichert',
        description: 'Deine Verfügbarkeit wurde aktualisiert.',
      });
    } catch (error: any) {
      toast({
        title: 'Fehler',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleAddBlockedDate = async () => {
    if (!newBlockedStart || !newBlockedEnd) {
      toast({
        title: 'Fehler',
        description: 'Bitte Start- und Enddatum auswählen.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await addBlockedDate.mutateAsync({
        start_date: format(newBlockedStart, 'yyyy-MM-dd'),
        end_date: format(newBlockedEnd, 'yyyy-MM-dd'),
        reason: newBlockedReason || undefined,
      });
      setNewBlockedStart(undefined);
      setNewBlockedEnd(undefined);
      setNewBlockedReason('');
      toast({
        title: 'Zeitraum blockiert',
        description: 'Der Zeitraum wurde erfolgreich hinzugefügt.',
      });
    } catch (error: any) {
      toast({
        title: 'Fehler',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center text-muted-foreground">
            Lädt...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Weekly Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Wöchentliche Arbeitszeiten
          </CardTitle>
          <CardDescription>
            Lege fest, an welchen Tagen und zu welchen Zeiten du verfügbar bist
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {DAYS.map(({ key, label }) => {
            const schedule = localSettings[key];
            return (
              <div key={key} className="flex items-center gap-4 py-2 border-b border-border/50 last:border-0">
                <div className="w-28">
                  <Switch
                    checked={schedule.enabled}
                    onCheckedChange={(enabled) => updateDaySchedule(key, { enabled })}
                  />
                </div>
                <span className="w-24 font-medium text-sm">{label}</span>
                {schedule.enabled ? (
                  <div className="flex items-center gap-2">
                    <TimeSelect
                      value={schedule.start}
                      onChange={(start) => updateDaySchedule(key, { start })}
                      label="Start"
                    />
                    <span className="text-muted-foreground">bis</span>
                    <TimeSelect
                      value={schedule.end}
                      onChange={(end) => updateDaySchedule(key, { end })}
                      label="Ende"
                    />
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">Nicht verfügbar</span>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Blocked Dates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarOff className="h-5 w-5" />
            Blockierte Zeiten / Urlaub
          </CardTitle>
          <CardDescription>
            Zeiträume, in denen keine Buchungen möglich sind
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {blockedDates.length > 0 && (
            <div className="space-y-2">
              {blockedDates.map((blocked) => (
                <div
                  key={blocked.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-sm">
                      {format(parseISO(blocked.start_date), 'dd.MM.yyyy', { locale: de })}
                      {blocked.start_date !== blocked.end_date && (
                        <> – {format(parseISO(blocked.end_date), 'dd.MM.yyyy', { locale: de })}</>
                      )}
                    </p>
                    {blocked.reason && (
                      <p className="text-xs text-muted-foreground">{blocked.reason}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteBlockedDate.mutate(blocked.id)}
                    disabled={deleteBlockedDate.isPending}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-end gap-3 pt-2">
            <div className="space-y-1">
              <Label className="text-xs">Von</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="w-32">
                    {newBlockedStart
                      ? format(newBlockedStart, 'dd.MM.yyyy', { locale: de })
                      : 'Startdatum'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={newBlockedStart}
                    onSelect={setNewBlockedStart}
                    locale={de}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Bis</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="w-32">
                    {newBlockedEnd
                      ? format(newBlockedEnd, 'dd.MM.yyyy', { locale: de })
                      : 'Enddatum'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={newBlockedEnd}
                    onSelect={setNewBlockedEnd}
                    locale={de}
                    disabled={(date) => newBlockedStart ? date < newBlockedStart : false}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-1 flex-1 min-w-[150px]">
              <Label className="text-xs">Grund (optional)</Label>
              <Input
                value={newBlockedReason}
                onChange={(e) => setNewBlockedReason(e.target.value)}
                placeholder="z.B. Urlaub"
                className="h-9"
              />
            </div>

            <Button
              size="sm"
              onClick={handleAddBlockedDate}
              disabled={addBlockedDate.isPending || !newBlockedStart || !newBlockedEnd}
            >
              <Plus className="h-4 w-4 mr-1" />
              Hinzufügen
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Slot Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Termineinstellungen
          </CardTitle>
          <CardDescription>
            Feineinstellungen für Buchungsslots
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Slot-Intervall</Label>
              <Select
                value={localSettings.slot_interval.toString()}
                onValueChange={(v) => setLocalSettings((prev) => ({ ...prev, slot_interval: parseInt(v) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 Minuten</SelectItem>
                  <SelectItem value="30">30 Minuten</SelectItem>
                  <SelectItem value="60">60 Minuten</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Abstand zwischen verfügbaren Startzeiten</p>
            </div>

            <div className="space-y-2">
              <Label>Puffer vor Termin</Label>
              <Select
                value={localSettings.buffer_before.toString()}
                onValueChange={(v) => setLocalSettings((prev) => ({ ...prev, buffer_before: parseInt(v) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Kein Puffer</SelectItem>
                  <SelectItem value="15">15 Minuten</SelectItem>
                  <SelectItem value="30">30 Minuten</SelectItem>
                  <SelectItem value="45">45 Minuten</SelectItem>
                  <SelectItem value="60">60 Minuten</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Zeit vor jedem Termin freihalten</p>
            </div>

            <div className="space-y-2">
              <Label>Puffer nach Termin</Label>
              <Select
                value={localSettings.buffer_after.toString()}
                onValueChange={(v) => setLocalSettings((prev) => ({ ...prev, buffer_after: parseInt(v) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Kein Puffer</SelectItem>
                  <SelectItem value="15">15 Minuten</SelectItem>
                  <SelectItem value="30">30 Minuten</SelectItem>
                  <SelectItem value="45">45 Minuten</SelectItem>
                  <SelectItem value="60">60 Minuten</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Zeit nach jedem Termin freihalten</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saveSettings.isPending}>
          <Save className="h-4 w-4 mr-2" />
          {saveSettings.isPending ? 'Wird gespeichert...' : 'Verfügbarkeit speichern'}
        </Button>
      </div>
    </div>
  );
}
