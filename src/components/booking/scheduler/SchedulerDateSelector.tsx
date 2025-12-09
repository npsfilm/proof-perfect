import { format, isSameDay } from 'date-fns';
import { de } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { SchedulerDateSelectorProps } from './types';

export function SchedulerDateSelector({
  dates,
  selectedDate,
  onSelectDate,
}: SchedulerDateSelectorProps) {
  return (
    <div className="w-full max-w-3xl mb-8">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
        Datum auswählen
      </h3>
      <div className="flex gap-2 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
        {dates.map((date) => {
          const isSelected = selectedDate && isSameDay(date, selectedDate);
          const dayName = format(date, 'EEE', { locale: de });
          const dayNumber = format(date, 'd');
          const monthName = format(date, 'MMM', { locale: de });

          return (
            <button
              key={date.toISOString()}
              onClick={() => onSelectDate(date)}
              className={cn(
                'flex-shrink-0 w-16 py-3 rounded-xl border-2 text-center transition-all',
                isSelected
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-card hover:border-primary/50'
              )}
            >
              <p className={cn('text-xs font-medium', isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground')}>
                {dayName}
              </p>
              <p className="text-xl font-bold">{dayNumber}</p>
              <p className={cn('text-xs', isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground')}>
                {monthName}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
