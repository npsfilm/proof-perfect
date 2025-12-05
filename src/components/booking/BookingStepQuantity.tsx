import { Minus, Plus, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBooking } from '@/contexts/BookingContext';
import { cn } from '@/lib/utils';

export function BookingStepQuantity() {
  const { totalProperties, setTotalProperties, nextStep } = useBooking();

  const handleDecrement = () => {
    if (totalProperties > 1) {
      setTotalProperties(totalProperties - 1);
    }
  };

  const handleIncrement = () => {
    if (totalProperties < 5) {
      setTotalProperties(totalProperties + 1);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] px-4">
      <div className="text-center mb-8">
        <Building2 className="w-16 h-16 mx-auto text-primary mb-4" />
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
          Mehrere Objekte an einem Tag?
        </h2>
        <p className="text-muted-foreground">
          Buchen Sie mehrere Immobilien hintereinander – wir optimieren Ihre Route.
        </p>
      </div>

      <div className="flex items-center gap-6 mb-8">
        <Button
          variant="outline"
          size="icon"
          className="w-14 h-14 rounded-full"
          onClick={handleDecrement}
          disabled={totalProperties <= 1}
        >
          <Minus className="w-6 h-6" />
        </Button>

        <div className="text-center">
          <span className="text-6xl font-bold text-primary">{totalProperties}</span>
          <p className="text-sm text-muted-foreground mt-1">
            {totalProperties === 1 ? 'Immobilie' : 'Immobilien'}
          </p>
        </div>

        <Button
          variant="outline"
          size="icon"
          className="w-14 h-14 rounded-full"
          onClick={handleIncrement}
          disabled={totalProperties >= 5}
        >
          <Plus className="w-6 h-6" />
        </Button>
      </div>

      {/* Quick select buttons */}
      <div className="flex gap-2 mb-8">
        {[1, 2, 3, 4, 5].map((num) => (
          <button
            key={num}
            onClick={() => setTotalProperties(num)}
            className={cn(
              'w-10 h-10 rounded-full text-sm font-medium transition-all',
              totalProperties === num
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            )}
          >
            {num}
          </button>
        ))}
      </div>

      <Button size="lg" className="w-full max-w-xs" onClick={nextStep}>
        Weiter
      </Button>
    </div>
  );
}
