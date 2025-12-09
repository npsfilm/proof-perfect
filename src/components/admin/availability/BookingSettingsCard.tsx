import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { LocalSettings } from './types';

interface BookingSettingsCardProps {
  localSettings: LocalSettings;
  onSettingsChange: (updates: Partial<LocalSettings>) => void;
}

export function BookingSettingsCard({ localSettings, onSettingsChange }: BookingSettingsCardProps) {
  return (
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
            onValueChange={(value) => onSettingsChange({ slot_interval: parseInt(value) })}
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
            onValueChange={([value]) => onSettingsChange({ buffer_before: value })}
            max={60}
            step={5}
            className="w-64"
          />
        </div>

        <div className="space-y-2">
          <Label>Puffer nach dem Termin: {localSettings.buffer_after} Min</Label>
          <Slider
            value={[localSettings.buffer_after as number]}
            onValueChange={([value]) => onSettingsChange({ buffer_after: value })}
            max={60}
            step={5}
            className="w-64"
          />
        </div>
      </CardContent>
    </Card>
  );
}
