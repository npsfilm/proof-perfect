import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, Timer } from 'lucide-react';
import { AvailabilitySettings } from '@/hooks/useAvailabilitySettings';

interface BookingSettingsCardProps {
  settings: AvailabilitySettings;
  onSettingsChange: (settings: AvailabilitySettings) => void;
}

export function BookingSettingsCard({ settings, onSettingsChange }: BookingSettingsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Timer className="h-5 w-5" />
          Buchungseinstellungen
        </CardTitle>
        <CardDescription>
          Konfigurieren Sie Zeitslots und Pufferzeiten
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              Zeitslot-Intervall
            </Label>
            <Select
              value={String(settings.slotInterval)}
              onValueChange={(value) => 
                onSettingsChange({ ...settings, slotInterval: parseInt(value) })
              }
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
            <p className="text-xs text-muted-foreground">
              Abstand zwischen verfügbaren Startzeiten
            </p>
          </div>

          <div className="space-y-2">
            <Label>Puffer vor Termin</Label>
            <Select
              value={String(settings.bufferBefore)}
              onValueChange={(value) => 
                onSettingsChange({ ...settings, bufferBefore: parseInt(value) })
              }
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
            <p className="text-xs text-muted-foreground">
              Zeit vor dem Termin freihalten
            </p>
          </div>

          <div className="space-y-2">
            <Label>Puffer nach Termin</Label>
            <Select
              value={String(settings.bufferAfter)}
              onValueChange={(value) => 
                onSettingsChange({ ...settings, bufferAfter: parseInt(value) })
              }
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
            <p className="text-xs text-muted-foreground">
              Zeit nach dem Termin freihalten
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
