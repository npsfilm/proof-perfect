import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimeSlot {
  start: Date;
  end: Date;
  displayTime: string;
}

interface SelectedSlot {
  date: string;
  time: string;
}

interface BookingTimeSlotsProps {
  selectedDate: Date | undefined;
  slots: TimeSlot[];
  selectedSlot: SelectedSlot | null;
  onSlotSelect: (slot: SelectedSlot) => void;
  isLoading: boolean;
}

export function BookingTimeSlots({
  selectedDate,
  slots,
  selectedSlot,
  onSlotSelect,
  isLoading,
}: BookingTimeSlotsProps) {
  if (!selectedDate) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground text-sm">
          Wählen Sie ein Datum aus dem Kalender
        </p>
      </div>
    );
  }

  const formattedDate = format(selectedDate, "EEEE, d. MMMM", { locale: de });
  const selectedDateStr = format(selectedDate, "yyyy-MM-dd");

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="text-muted-foreground text-sm mt-3">Lade verfügbare Zeiten...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-foreground capitalize">{formattedDate}</h3>
      
      {slots.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-muted-foreground text-sm">
            Keine verfügbaren Termine an diesem Tag
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[300px] overflow-y-auto pr-1">
          {slots.map((slot, index) => {
            const isSelected = selectedSlot?.date === selectedDateStr && selectedSlot?.time === slot.displayTime;
            
            return (
              <button
                key={`${selectedDateStr}-${slot.displayTime}-${index}`}
                onClick={() => onSlotSelect({ date: selectedDateStr, time: slot.displayTime })}
                className={cn(
                  "px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                  "border border-border hover:border-primary",
                  isSelected
                    ? "bg-primary text-primary-foreground border-primary shadow-neu-flat-sm"
                    : "bg-background hover:bg-primary/5"
                )}
              >
                {slot.displayTime}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
