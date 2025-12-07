import { Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FinalizeStep } from './types';
import { cn } from '@/lib/utils';

interface FinalizeFooterButtonsProps {
  step: FinalizeStep;
  selectedServices: {
    expressDelivery: boolean;
    virtualStaging: boolean;
    blueHour: boolean;
  };
  isSubmitting: boolean;
  isMobile: boolean;
  onClose: () => void;
  onSetStep: (step: FinalizeStep) => void;
  onFeedbackNext: () => void;
  onServicesNext: () => void;
  onStagingNext: () => void;
  onBlueHourNext: () => void;
  onFinalSubmit: () => void;
}

export function FinalizeFooterButtons({
  step,
  selectedServices,
  isSubmitting,
  isMobile,
  onClose,
  onSetStep,
  onFeedbackNext,
  onServicesNext,
  onStagingNext,
  onBlueHourNext,
  onFinalSubmit,
}: FinalizeFooterButtonsProps) {
  if (step === 'feedback') {
    return (
      <>
        <Button 
          variant="outline" 
          onClick={onClose} 
          className={cn("rounded-full px-6", isMobile && "min-h-12 text-base")}
        >
          Abbrechen
        </Button>
        <Button 
          onClick={onFeedbackNext} 
          className={cn("rounded-full px-8 shadow-neu-flat-sm", isMobile && "min-h-12 text-base")}
        >
          Weiter
        </Button>
      </>
    );
  }

  if (step === 'services') {
    return (
      <>
        <Button 
          variant="outline" 
          onClick={() => onSetStep('feedback')} 
          className={cn("rounded-full px-6", isMobile && "min-h-12 text-base")}
        >
          Zurück
        </Button>
        <Button 
          onClick={onServicesNext} 
          className={cn("rounded-full px-8 shadow-neu-flat-sm", isMobile && "min-h-12 text-base")}
        >
          {selectedServices.virtualStaging || selectedServices.blueHour ? 'Weiter' : 'Auswahl finalisieren'}
        </Button>
      </>
    );
  }

  if (step === 'staging') {
    return (
      <>
        <Button 
          variant="outline" 
          onClick={() => onSetStep('services')} 
          className={cn("rounded-full px-6", isMobile && "min-h-12 text-base")}
        >
          Zurück
        </Button>
        <Button 
          onClick={onStagingNext} 
          className={cn("rounded-full px-8 shadow-neu-flat-sm", isMobile && "min-h-12 text-base")}
        >
          {selectedServices.blueHour ? 'Weiter' : 'Weiter zur Zusammenfassung'}
        </Button>
      </>
    );
  }

  if (step === 'blueHour') {
    return (
      <>
        <Button 
          variant="outline" 
          onClick={() => onSetStep('staging')} 
          className={cn("rounded-full px-6", isMobile && "min-h-12 text-base")}
        >
          Zurück
        </Button>
        <Button 
          onClick={onBlueHourNext} 
          className={cn("rounded-full px-8 shadow-neu-flat-sm", isMobile && "min-h-12 text-base")}
        >
          Weiter zur Zusammenfassung
        </Button>
      </>
    );
  }

  if (step === 'summary') {
    const handleBack = () => {
      if (selectedServices.blueHour) {
        onSetStep('blueHour');
      } else if (selectedServices.virtualStaging) {
        onSetStep('staging');
      } else {
        onSetStep('services');
      }
    };

    return (
      <>
        <Button 
          variant="outline" 
          onClick={handleBack} 
          className={cn("rounded-full px-6", isMobile && "min-h-12 text-base")}
          disabled={isSubmitting}
        >
          Zurück
        </Button>
        <Button 
          onClick={onFinalSubmit} 
          disabled={isSubmitting}
          className={cn(
            "rounded-full px-8 shadow-neu-float bg-gradient-to-r from-primary to-primary/90",
            isMobile && "min-h-12 text-base"
          )}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Wird übermittelt...
            </>
          ) : (
            <>
              <Check className="mr-2 h-4 w-4" />
              Jetzt finalisieren
            </>
          )}
        </Button>
      </>
    );
  }

  return null;
}
