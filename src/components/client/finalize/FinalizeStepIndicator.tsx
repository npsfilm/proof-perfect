import { Camera, Gift, Home, Sunset, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FinalizeStep } from './types';

interface FinalizeStepIndicatorProps {
  currentStep: FinalizeStep;
}

const steps = [
  { key: 'feedback', label: 'Übersicht', icon: Camera },
  { key: 'services', label: 'Leistungen', icon: Gift },
  { key: 'staging', label: 'Staging', icon: Home },
  { key: 'blueHour', label: 'Blaue Stunde', icon: Sunset },
  { key: 'summary', label: 'Zusammenfassung', icon: Check },
] as const;

export function FinalizeStepIndicator({ currentStep }: FinalizeStepIndicatorProps) {
  const currentIndex = steps.findIndex(s => s.key === currentStep);

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isActive = index === currentIndex;
          const isCompleted = index < currentIndex;
          const Icon = step.icon;
          
          return (
            <div key={step.key} className="flex items-center flex-1">
              <div className="flex flex-col items-center gap-2">
                <div
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-all duration-500",
                    isActive && "bg-primary text-primary-foreground shadow-neu-float scale-110",
                    isCompleted && "bg-primary text-primary-foreground shadow-neu-flat",
                    !isActive && !isCompleted && "bg-muted text-muted-foreground shadow-neu-pressed"
                  )}
                >
                  <Icon className={cn("h-5 w-5 transition-transform", isActive && "scale-110")} />
                </div>
                <span className={cn(
                  "text-xs font-medium transition-all duration-300 hidden sm:block",
                  isActive && "text-primary font-bold",
                  isCompleted && "text-primary/70",
                  !isActive && !isCompleted && "text-muted-foreground"
                )}>
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className="flex-1 px-2">
                  <div className="h-1 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full bg-primary transition-all duration-500 rounded-full",
                        index < currentIndex ? "w-full" : "w-0"
                      )} 
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
