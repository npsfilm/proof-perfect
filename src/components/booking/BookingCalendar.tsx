import { Calendar } from "@/components/ui/calendar";
import { de } from "date-fns/locale";
import { isWeekend, isBefore, startOfDay } from "date-fns";

interface BookingCalendarProps {
  selectedDate: Date | undefined;
  onDateSelect: (date: Date | undefined) => void;
  availableDates?: Date[];
}

export function BookingCalendar({ 
  selectedDate, 
  onDateSelect,
  availableDates = []
}: BookingCalendarProps) {
  const today = startOfDay(new Date());

  // Disable weekends and past dates
  const isDateDisabled = (date: Date) => {
    const dateStart = startOfDay(date);
    return isWeekend(date) || isBefore(dateStart, today);
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
          cell: "h-10 w-10 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
          day: "h-10 w-10 p-0 font-normal rounded-full hover:bg-primary/10 transition-colors aria-selected:opacity-100",
          day_range_end: "day-range-end",
          day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
          day_today: "bg-accent text-accent-foreground font-semibold",
          day_outside: "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
          day_disabled: "text-muted-foreground opacity-50 cursor-not-allowed",
          day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
          day_hidden: "invisible",
        }}
      />
    </div>
  );
}
