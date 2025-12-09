import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Clock } from 'lucide-react';
import { SchedulerConfirmationProps } from './types';

export function SchedulerConfirmation({
  scheduledDate,
  scheduledTime,
}: SchedulerConfirmationProps) {
  return (
    <div className="w-full max-w-3xl p-4 bg-primary/5 border border-primary/20 rounded-xl mb-8">
      <div className="flex items-center gap-3">
        <Clock className="w-5 h-5 text-primary" />
        <div>
          <p className="font-medium">
            {format(scheduledDate, 'EEEE, d. MMMM yyyy', { locale: de })}
          </p>
          <p className="text-lg font-bold text-primary">
            {scheduledTime} Uhr
          </p>
        </div>
      </div>
    </div>
  );
}
