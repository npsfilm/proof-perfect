import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Clock } from 'lucide-react';
import { DAYS, DayKey, LocalSettings } from './types';

interface WeeklyScheduleCardProps {
  localSettings: LocalSettings;
  onDayToggle: (day: DayKey, enabled: boolean) => void;
  onTimeChange: (day: DayKey, type: 'start' | 'end', value: string) => void;
}

export function WeeklyScheduleCard({ localSettings, onDayToggle, onTimeChange }: WeeklyScheduleCardProps) {
  return (
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
              onCheckedChange={(checked) => onDayToggle(key, checked)}
            />
            <span className="w-24 font-medium">{label}</span>
            {localSettings[`${key}_enabled`] ? (
              <>
                <Input
                  type="time"
                  value={localSettings[`${key}_start`] as string}
                  onChange={(e) => onTimeChange(key, 'start', e.target.value)}
                  className="w-32"
                />
                <span className="text-muted-foreground">bis</span>
                <Input
                  type="time"
                  value={localSettings[`${key}_end`] as string}
                  onChange={(e) => onTimeChange(key, 'end', e.target.value)}
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
  );
}
