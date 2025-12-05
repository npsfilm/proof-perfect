import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';

interface AvailableTime {
  start_time: string;
}

interface EventType {
  scheduling_url: string;
  name: string;
  duration: number;
}

interface BookingConfirmButtonProps {
  selectedTime: AvailableTime | null;
  selectedDate: Date | null;
  eventType: EventType | null;
}

export function BookingConfirmButton({
  selectedTime,
  selectedDate,
  eventType,
}: BookingConfirmButtonProps) {
  if (!selectedTime || !eventType) return null;
  
  const startTime = parseISO(selectedTime.start_time);
  
  // Build the scheduling URL with pre-selected time
  // Calendly scheduling URLs can include date/time parameters
  const buildSchedulingUrl = () => {
    const baseUrl = eventType.scheduling_url;
    // Add the selected date and time as query parameters
    const dateParam = format(startTime, 'yyyy-MM-dd');
    const timeParam = format(startTime, 'HH:mm');
    return `${baseUrl}?date=${dateParam}&time=${timeParam}`;
  };
  
  const handleConfirm = () => {
    window.open(buildSchedulingUrl(), '_blank');
  };
  
  return (
    <div className="bg-background rounded-3xl shadow-neu-flat p-6 space-y-4">
      <div className="text-center space-y-2">
        <h3 className="font-semibold text-lg">Ausgewählter Termin</h3>
        <p className="text-muted-foreground">
          {selectedDate && format(selectedDate, 'EEEE, d. MMMM yyyy', { locale: de })}
        </p>
        <p className="text-2xl font-bold text-primary">
          {format(startTime, 'HH:mm', { locale: de })} Uhr
        </p>
        <p className="text-sm text-muted-foreground">
          {eventType.name} • {eventType.duration} Min.
        </p>
      </div>
      
      <Button
        onClick={handleConfirm}
        className="w-full rounded-full py-6 text-lg font-semibold"
        size="lg"
      >
        <ExternalLink className="w-5 h-5 mr-2" />
        Termin buchen
      </Button>
      
      <p className="text-xs text-center text-muted-foreground">
        Sie werden zu Calendly weitergeleitet, um die Buchung abzuschließen
      </p>
    </div>
  );
}
