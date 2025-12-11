import React from 'react';
import { useBooking } from '@/contexts/BookingContext';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';
import { cn } from '@/lib/utils';

export function BookingStepQuantity() {
  const { propertyCount, setPropertyCount, nextStep, prevStep } = useBooking();

  const quantities = [1, 2, 3, 4, 5];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Anzahl Immobilien</h2>
        <p className="text-muted-foreground">
          Wie viele Immobilien möchten Sie fotografieren lassen?
        </p>
      </div>

      <div className="flex flex-wrap gap-3 justify-center py-4">
        {quantities.map((qty) => (
          <button
            key={qty}
            onClick={() => setPropertyCount(qty)}
            className={cn(
              'w-16 h-16 md:w-20 md:h-20 rounded-lg border-2 flex flex-col items-center justify-center transition-all hover:border-primary/50',
              propertyCount === qty
                ? 'border-primary bg-primary/5'
                : 'border-border'
            )}
          >
            <Home className={cn(
              'h-5 w-5 mb-1',
              propertyCount === qty ? 'text-primary' : 'text-muted-foreground'
            )} />
            <span className={cn(
              'text-lg font-semibold',
              propertyCount === qty ? 'text-primary' : 'text-foreground'
            )}>
              {qty}
            </span>
          </button>
        ))}
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Bei mehr als 5 Immobilien kontaktieren Sie uns bitte direkt.
      </p>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={prevStep}>
          Zurück
        </Button>
        <Button onClick={nextStep}>
          Weiter
        </Button>
      </div>
    </div>
  );
}
