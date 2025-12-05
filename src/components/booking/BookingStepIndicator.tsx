import { Check } from 'lucide-react';
import { BOOKING_STEPS } from '@/constants/booking';
import { useBooking } from '@/contexts/BookingContext';
import { cn } from '@/lib/utils';

export function BookingStepIndicator() {
  const { currentStep, bookingsCompleted, totalProperties } = useBooking();

  // Don't show on success step
  if (currentStep > 6) return null;

  return (
    <div className="w-full">
      {/* Property counter for batch bookings */}
      {totalProperties > 1 && (
        <div className="text-center mb-4">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
            Objekt {bookingsCompleted + 1} von {totalProperties}
          </span>
        </div>
      )}
      
      {/* Step progress */}
      <div className="flex items-center justify-between">
        {BOOKING_STEPS.map((step, index) => {
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;
          const isFirst = index === 0;
          
          return (
            <div key={step.id} className="flex items-center flex-1">
              {/* Step circle */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all',
                    isCompleted && 'bg-primary text-primary-foreground',
                    isActive && 'bg-primary text-primary-foreground ring-4 ring-primary/20',
                    !isActive && !isCompleted && 'bg-muted text-muted-foreground'
                  )}
                >
                  {isCompleted ? <Check className="w-5 h-5" /> : step.id}
                </div>
                <span
                  className={cn(
                    'text-xs mt-2 hidden sm:block',
                    isActive && 'text-primary font-medium',
                    !isActive && 'text-muted-foreground'
                  )}
                >
                  {step.name}
                </span>
              </div>
              
              {/* Connector line */}
              {index < BOOKING_STEPS.length - 1 && (
                <div
                  className={cn(
                    'flex-1 h-1 mx-2 rounded-full transition-all',
                    currentStep > step.id ? 'bg-primary' : 'bg-muted'
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
