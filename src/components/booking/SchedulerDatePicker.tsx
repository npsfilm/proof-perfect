import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface SchedulerDatePickerProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export function SchedulerDatePicker({ selectedDate, onDateChange }: SchedulerDatePickerProps) {
  return (
    <div className="flex items-center gap-4">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full sm:w-auto justify-start">
            <CalendarIcon className="mr-2 h-4 w-4" />
            {format(selectedDate, 'PPP', { locale: de })}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && onDateChange(date)}
            disabled={(date) => date < new Date()}
            locale={de}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
