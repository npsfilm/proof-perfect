import { Calendar } from "@/components/ui/calendar";
import { de } from "date-fns/locale";
import { isWeekend, isBefore, startOfDay, format } from "date-fns";
import { cn } from "@/lib/utils";

interface BookingCalendarProps {
  selectedDate: Date | undefined;
  onDateSelect: (date: Date | undefined) => void;
  availableDates?: string[]; // Array of "YYYY-MM-DD" strings with available slots
}

export function BookingCalendar({ 
  selectedDate, 
  onDateSelect,
  availableDates = []
}: BookingCalendarProps) {
  const today = startOfDay(new Date());

  // Disable weekends, past dates, and days without availability
  const isDateDisabled = (date: Date) => {
    const dateStart = startOfDay(date);
    const dateKey = format(date, "yyyy-MM-dd");
    
    // Always disable past dates and weekends
    if (isWeekend(date) || isBefore(dateStart, today)) {
      return true;
    }
    
    // If availableDates is provided, disable days not in the list
    if (availableDates.length > 0 && !availableDates.includes(dateKey)) {
      return true;
    }
    
    return false;
  };

  // Check if a date has availability for showing indicator
  const hasAvailability = (date: Date) => {
    const dateKey = format(date, "yyyy-MM-dd");
    return availableDates.includes(dateKey);
  };

  return (
    <div className="flex justify-center">
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={onDateSelect}
        disabled={isDateDisabled}
        locale={de}
        className="rounded-2xl border-0 p-0 pointer-events-auto"
        modifiers={{
          available: (date) => hasAvailability(date) && !isBefore(startOfDay(date), today),
        }}
        modifiersClassNames={{
          available: "relative",
        }}
        components={{
          DayContent: ({ date }) => {
            const isAvailable = hasAvailability(date) && !isBefore(startOfDay(date), today) && !isWeekend(date);
            return (
              <div className="relative flex items-center justify-center w-full h-full">
                <span>{date.getDate()}</span>
                {isAvailable && (
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-green-500" />
                )}
              </div>
            );
          },
        }}
        classNames={{
          months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
          month: "space-y-4",
          caption: "flex justify-center pt-1 relative items-center",
          caption_label: "text-sm font-medium",
          nav: "space-x-1 flex items-center",
          nav_button: "h-8 w-8 bg-transparent p-0 opacity-50 hover:opacity-100 rounded-full hover:bg-muted transition-colors",
          nav_button_previous: "absolute left-1",
          nav_button_next: "absolute right-1",
          table: "w-full border-collapse space-y-1",
          head_row: "flex",
          head_cell: "text-muted-foreground rounded-md w-10 font-normal text-[0.8rem]",
          row: "flex w-full mt-2",
          cell: cn(
            "h-10 w-10 text-center text-sm p-0 relative",
            "focus-within:relative focus-within:z-20"
          ),
          day: cn(
            "h-10 w-10 p-0 font-normal rounded-full transition-colors",
            "hover:bg-primary/10 aria-selected:opacity-100"
          ),
          day_range_end: "day-range-end",
          day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
          day_today: "bg-accent text-accent-foreground font-semibold",
          day_outside: "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
          day_disabled: "text-muted-foreground opacity-30 cursor-not-allowed hover:bg-transparent",
          day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
          day_hidden: "invisible",
        }}
      />
    </div>
  );
}
