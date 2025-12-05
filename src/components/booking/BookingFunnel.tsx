import { useBooking } from '@/contexts/BookingContext';
import { BookingStepIndicator } from './BookingStepIndicator';
import { BookingStepQuantity } from './BookingStepQuantity';
import { BookingStepAddress } from './BookingStepAddress';
import { BookingStepService } from './BookingStepService';
import { BookingStepPackage } from './BookingStepPackage';
import { BookingStepScheduler } from './BookingStepScheduler';
import { BookingStepContact } from './BookingStepContact';
import { BookingSummaryCard } from './BookingSummaryCard';
import { BookingSuccess } from './BookingSuccess';

export function BookingFunnel() {
  const { currentStep } = useBooking();

  // Success screen (step 7)
  if (currentStep > 6) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto py-12">
          <BookingSuccess />
        </div>
      </div>
    );
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <BookingStepQuantity />;
      case 2:
        return <BookingStepAddress />;
      case 3:
        return <BookingStepService />;
      case 4:
        return <BookingStepPackage />;
      case 5:
        return <BookingStepScheduler />;
      case 6:
        return <BookingStepContact />;
      default:
        return <BookingStepQuantity />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-foreground">Termin buchen</h1>
          </div>
          <BookingStepIndicator />
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-8">
        <div className="grid lg:grid-cols-3 gap-8 px-4">
          {/* Step content - takes 2/3 on desktop */}
          <div className="lg:col-span-2">
            {renderStep()}
          </div>

          {/* Summary card - takes 1/3 on desktop, hidden on step 1 and mobile */}
          <div className="hidden lg:block">
            {currentStep > 1 && <BookingSummaryCard />}
          </div>
        </div>
      </main>
    </div>
  );
}
