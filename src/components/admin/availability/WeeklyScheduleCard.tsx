import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AvailabilitySettings, DaySettings } from '@/hooks/useAvailabilitySettings';

interface WeeklyScheduleCardProps {
  settings: AvailabilitySettings;
  onSettingsChange: (settings: AvailabilitySettings) => void;
}

const dayLabels: Record<string, string> = {
  monday: 'Montag',
  tuesday: 'Dienstag',
  wednesday: 'Mittwoch',
  thursday: 'Donnerstag',
  friday: 'Freitag',
  saturday: 'Samstag',
  sunday: 'Sonntag',
};

const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;

export function WeeklyScheduleCard({ settings, onSettingsChange }: WeeklyScheduleCardProps) {
  const updateDay = (day: keyof typeof dayLabels, field: keyof DaySettings, value: boolean | string) => {
    const currentDay = settings[day as keyof AvailabilitySettings] as DaySettings;
    onSettingsChange({
      ...settings,
      [day]: {
        ...currentDay,
        [field]: value,
      },
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Wöchentliche Arbeitszeiten</CardTitle>
        <CardDescription>
          Legen Sie fest, an welchen Tagen und zu welchen Zeiten Sie verfügbar sind
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {dayOrder.map((day) => {
            const daySettings = settings[day] as DaySettings;
            return (
              <div
                key={day}
                className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 rounded-lg bg-muted/50"
              >
                <div className="flex items-center gap-3 min-w-[140px]">
                  <Switch
                    checked={daySettings.enabled}
                    onCheckedChange={(checked) => updateDay(day, 'enabled', checked)}
                  />
                  <Label className="font-medium">{dayLabels[day]}</Label>
                </div>
                
                {daySettings.enabled && (
                  <div className="flex items-center gap-2 ml-0 sm:ml-auto">
                    <Input
                      type="time"
                      value={daySettings.start}
                      onChange={(e) => updateDay(day, 'start', e.target.value)}
                      className="w-[120px]"
                    />
                    <span className="text-muted-foreground">bis</span>
                    <Input
                      type="time"
                      value={daySettings.end}
                      onChange={(e) => updateDay(day, 'end', e.target.value)}
                      className="w-[120px]"
                    />
                  </div>
                )}
                
                {!daySettings.enabled && (
                  <span className="text-sm text-muted-foreground ml-0 sm:ml-auto">
                    Nicht verfügbar
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
