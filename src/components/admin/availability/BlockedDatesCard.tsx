import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, Trash2, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { BlockedDate } from '@/hooks/useAvailabilitySettings';
import { NewBlockedDate } from './types';

interface BlockedDatesCardProps {
  blockedDates: BlockedDate[];
  newBlockedDate: NewBlockedDate;
  onNewBlockedDateChange: (data: NewBlockedDate) => void;
  onAddBlockedDate: () => void;
  onRemoveBlockedDate: (id: string) => void;
  isAdding: boolean;
  isRemoving: boolean;
}

export function BlockedDatesCard({
  blockedDates,
  newBlockedDate,
  onNewBlockedDateChange,
  onAddBlockedDate,
  onRemoveBlockedDate,
  isAdding,
  isRemoving,
}: BlockedDatesCardProps) {
  return (
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
                  onClick={() => onRemoveBlockedDate(blocked.id)}
                  disabled={isRemoving}
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
              onChange={(e) => onNewBlockedDateChange({ ...newBlockedDate, start_date: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Enddatum</Label>
            <Input
              type="date"
              value={newBlockedDate.end_date}
              onChange={(e) => onNewBlockedDateChange({ ...newBlockedDate, end_date: e.target.value })}
            />
          </div>
          <div className="space-y-2 flex-1">
            <Label>Grund (optional)</Label>
            <Input
              placeholder="z.B. Urlaub, Krankheit..."
              value={newBlockedDate.reason}
              onChange={(e) => onNewBlockedDateChange({ ...newBlockedDate, reason: e.target.value })}
            />
          </div>
          <Button onClick={onAddBlockedDate} disabled={isAdding}>
            <Plus className="h-4 w-4 mr-2" />
            Hinzufügen
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
