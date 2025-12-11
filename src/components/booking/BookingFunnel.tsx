import React from 'react';
import { BookingProvider, useBooking } from '@/contexts/BookingContext';
import { BookingStepIndicator } from './BookingStepIndicator';
import { BookingStepScheduleType } from './BookingStepScheduleType';
import { BookingStepQuantity } from './BookingStepQuantity';
import { BookingStepProperty } from './BookingStepProperty';
import { BookingStepScheduler } from './BookingStepScheduler';
import { BookingStepContact } from './BookingStepContact';
import { BookingSuccess } from './BookingSuccess';
import { BookingSummaryCard } from './BookingSummaryCard';
import { Card } from '@/components/ui/card';

function BookingFunnelContent() {
  const { currentStep, isComplete } = useBooking();

  if (isComplete) {
    return <BookingSuccess />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Shooting buchen
          </h1>
          <p className="text-muted-foreground">
            Buchen Sie Ihr professionelles Immobilienshooting in wenigen Schritten
          </p>
        </div>

        <BookingStepIndicator />

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              {currentStep === 1 && <BookingStepScheduleType />}
              {currentStep === 2 && <BookingStepQuantity />}
              {currentStep === 3 && <BookingStepProperty />}
              {currentStep === 4 && <BookingStepScheduler />}
              {currentStep === 5 && <BookingStepContact />}
            </Card>
          </div>

          {/* Summary sidebar */}
          <div className="lg:col-span-1">
            <BookingSummaryCard />
          </div>
        </div>
      </div>
    </div>
  );
}

export function BookingFunnel() {
  return (
    <BookingProvider>
      <BookingFunnelContent />
    </BookingProvider>
  );
}
