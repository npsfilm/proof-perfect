import { Button } from '@/components/ui/button';
import { RefreshCw, Save } from 'lucide-react';

interface AvailabilityActionsBarProps {
  onSave: () => void;
  onSync: () => void;
  isSaving: boolean;
  isSyncing: boolean;
}

export function AvailabilityActionsBar({ onSave, onSync, isSaving, isSyncing }: AvailabilityActionsBarProps) {
  return (
    <div className="flex gap-4">
      <Button onClick={onSave} disabled={isSaving}>
        <Save className="h-4 w-4 mr-2" />
        {isSaving ? 'Wird gespeichert...' : 'Einstellungen speichern'}
      </Button>
      <Button variant="outline" onClick={onSync} disabled={isSyncing}>
        <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
        {isSyncing ? 'Synchronisiere...' : 'Mit Google Kalender synchronisieren'}
      </Button>
    </div>
  );
}
