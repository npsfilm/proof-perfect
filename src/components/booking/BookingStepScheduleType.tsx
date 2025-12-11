import React from 'react';
import { useBooking } from '@/contexts/BookingContext';
import { Button } from '@/components/ui/button';
import { Calendar, CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils';

export function BookingStepScheduleType() {
  const { scheduleType, setScheduleType, nextStep } = useBooking();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Terminplanung</h2>
        <p className="text-muted-foreground">
          Wie möchten Sie Ihre Shootings planen?
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => setScheduleType('single_day')}
          className={cn(
            'p-6 rounded-lg border-2 text-left transition-all hover:border-primary/50',
            scheduleType === 'single_day'
              ? 'border-primary bg-primary/5'
              : 'border-border'
          )}
        >
          <Calendar className="h-8 w-8 mb-3 text-primary" />
          <h3 className="font-semibold mb-1">Alle an einem Tag</h3>
          <p className="text-sm text-muted-foreground">
            Optimale Route für mehrere Immobilien an einem Tag
          </p>
        </button>

        <button
          onClick={() => setScheduleType('multiple_days')}
          className={cn(
            'p-6 rounded-lg border-2 text-left transition-all hover:border-primary/50',
            scheduleType === 'multiple_days'
              ? 'border-primary bg-primary/5'
              : 'border-border'
          )}
        >
          <CalendarDays className="h-8 w-8 mb-3 text-primary" />
          <h3 className="font-semibold mb-1">Auf mehrere Tage verteilen</h3>
          <p className="text-sm text-muted-foreground">
            Flexible Terminverteilung über verschiedene Tage
          </p>
        </button>
      </div>

      <div className="flex justify-end pt-4">
        <Button onClick={nextStep} disabled={!scheduleType}>
          Weiter
        </Button>
      </div>
    </div>
  );
}
