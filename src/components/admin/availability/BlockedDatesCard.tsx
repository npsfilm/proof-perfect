import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, Plus, Trash2 } from 'lucide-react';
import { BlockedDate } from '@/hooks/useAvailabilitySettings';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface BlockedDatesCardProps {
  blockedDates: BlockedDate[];
  onAdd: (data: { startDate: string; endDate: string; reason?: string }) => void;
  onRemove: (id: string) => void;
  isAdding?: boolean;
  isRemoving?: boolean;
}

export function BlockedDatesCard({ 
  blockedDates, 
  onAdd, 
  onRemove, 
  isAdding,
  isRemoving 
}: BlockedDatesCardProps) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  const handleAdd = () => {
    if (!startDate || !endDate) return;
    onAdd({ startDate, endDate, reason: reason || undefined });
    setStartDate('');
    setEndDate('');
    setReason('');
  };

  const formatDateRange = (start: string, end: string) => {
    const startFormatted = format(new Date(start), 'd. MMM yyyy', { locale: de });
    const endFormatted = format(new Date(end), 'd. MMM yyyy', { locale: de });
    if (start === end) return startFormatted;
    return `${startFormatted} – ${endFormatted}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Blockierte Zeiträume
        </CardTitle>
        <CardDescription>
          Zeiträume, in denen keine Buchungen möglich sind (z.B. Urlaub)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add new blocked date */}
        <div className="p-4 border rounded-lg bg-muted/30 space-y-4">
          <h4 className="font-medium text-sm">Neuen Zeitraum hinzufügen</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">Von</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date">Bis</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="reason">Grund (optional)</Label>
            <Input
              id="reason"
              type="text"
              placeholder="z.B. Urlaub, Fortbildung..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
          <Button 
            onClick={handleAdd} 
            disabled={!startDate || !endDate || isAdding}
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            {isAdding ? 'Wird hinzugefügt...' : 'Hinzufügen'}
          </Button>
        </div>

        {/* List of blocked dates */}
        {blockedDates.length > 0 ? (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Aktive Blockierungen</h4>
            <div className="space-y-2">
              {blockedDates.map((blocked) => (
                <div
                  key={blocked.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div>
                    <p className="font-medium text-sm">
                      {formatDateRange(blocked.start_date, blocked.end_date)}
                    </p>
                    {blocked.reason && (
                      <p className="text-xs text-muted-foreground">{blocked.reason}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemove(blocked.id)}
                    disabled={isRemoving}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            Keine blockierten Zeiträume vorhanden
          </p>
        )}
      </CardContent>
    </Card>
  );
}
