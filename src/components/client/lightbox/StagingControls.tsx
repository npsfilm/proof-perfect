import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface StagingControlsProps {
  stagingRequested: boolean;
  stagingStyle: string;
  onStagingToggle: (checked: boolean) => void;
  onStagingStyleChange: (style: string) => void;
}

export function StagingControls({
  stagingRequested,
  stagingStyle,
  onStagingToggle,
  onStagingStyleChange,
}: StagingControlsProps) {
  return (
    <div className="space-y-4 border-t pt-4">
      <div className="flex items-center justify-between">
        <div>
          <Label htmlFor="staging" className="text-base">Virtuelles Staging</Label>
          <p className="text-xs text-muted-foreground mt-1">
            Möbel digital hinzufügen
          </p>
        </div>
        <Switch
          id="staging"
          checked={stagingRequested}
          onCheckedChange={onStagingToggle}
        />
      </div>

      {stagingRequested && (
        <div className="space-y-2">
          <Label htmlFor="staging-style">Stil</Label>
          <Select value={stagingStyle} onValueChange={onStagingStyleChange}>
            <SelectTrigger id="staging-style">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Modern">Modern</SelectItem>
              <SelectItem value="Scandinavian">Skandinavisch</SelectItem>
              <SelectItem value="Industrial">Industriell</SelectItem>
              <SelectItem value="Minimalist">Minimalistisch</SelectItem>
              <SelectItem value="Traditional">Traditionell</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
