import { Button } from '@/components/ui/button';
import { SchedulerNavigationProps } from './types';

export function SchedulerNavigation({
  canContinue,
  onPrev,
  onNext,
}: SchedulerNavigationProps) {
  return (
    <div className="flex gap-3 w-full max-w-md">
      <Button variant="outline" size="lg" className="flex-1" onClick={onPrev}>
        Zurück
      </Button>
      <Button
        size="lg"
        className="flex-1"
        onClick={onNext}
        disabled={!canContinue}
      >
        Weiter
      </Button>
    </div>
  );
}
