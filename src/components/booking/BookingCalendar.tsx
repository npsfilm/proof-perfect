import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  isToday,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  isBefore,
  startOfDay
} from 'date-fns';
import { de } from 'date-fns/locale';

interface BookingCalendarProps {
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
  availableDates?: Date[];
}

export function BookingCalendar({
  selectedDate,
  onSelectDate,
  availableDates = [],
}: BookingCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const days = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentMonth]);
  
  const weekDays = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
  
  const today = startOfDay(new Date());
  
  const isDateAvailable = (date: Date) => {
    // Past dates are not available
    if (isBefore(date, today)) return false;
    // Weekends not available (can be configured)
    const day = date.getDay();
    if (day === 0 || day === 6) return false;
    return true;
  };
  
  return (
    <div className="bg-background rounded-3xl shadow-neu-flat p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="rounded-full"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <h2 className="text-lg font-semibold">
          {format(currentMonth, 'MMMM yyyy', { locale: de })}
        </h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="rounded-full"
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>
      
      {/* Week days header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-sm font-medium text-muted-foreground py-2"
          >
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isTodayDate = isToday(day);
          const isAvailable = isDateAvailable(day);
          
          return (
            <button
              key={day.toISOString()}
              onClick={() => isAvailable && isCurrentMonth && onSelectDate(day)}
              disabled={!isAvailable || !isCurrentMonth}
              className={cn(
                "aspect-square flex items-center justify-center text-sm rounded-xl transition-all",
                !isCurrentMonth && "text-muted-foreground/30",
                isCurrentMonth && !isAvailable && "text-muted-foreground/50 cursor-not-allowed",
                isCurrentMonth && isAvailable && "hover:bg-primary/10 cursor-pointer",
                isSelected && "bg-primary text-primary-foreground hover:bg-primary",
                isTodayDate && !isSelected && "ring-2 ring-primary/30"
              )}
            >
              {format(day, 'd')}
            </button>
          );
        })}
      </div>
    </div>
  );
}
