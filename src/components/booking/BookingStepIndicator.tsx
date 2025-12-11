import React from 'react';
import { useBooking } from '@/contexts/BookingContext';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const steps = [
  { id: 1, label: 'Planung' },
  { id: 2, label: 'Anzahl' },
  { id: 3, label: 'Details' },
  { id: 4, label: 'Termin' },
  { id: 5, label: 'Kontakt' },
];

export function BookingStepIndicator() {
  const { currentStep } = useBooking();

  return (
    <div className="flex items-center justify-center">
      <div className="flex items-center space-x-2 md:space-x-4">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all',
                  currentStep > step.id
                    ? 'bg-primary text-primary-foreground'
                    : currentStep === step.id
                    ? 'bg-primary text-primary-foreground ring-4 ring-primary/20'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {currentStep > step.id ? (
                  <Check className="h-4 w-4" />
                ) : (
                  step.id
                )}
              </div>
              <span
                className={cn(
                  'mt-1 text-xs md:text-sm hidden sm:block',
                  currentStep >= step.id
                    ? 'text-foreground font-medium'
                    : 'text-muted-foreground'
                )}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'w-8 md:w-16 h-0.5 transition-colors',
                  currentStep > step.id ? 'bg-primary' : 'bg-muted'
                )}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
