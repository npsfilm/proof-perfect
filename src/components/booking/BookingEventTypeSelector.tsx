import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CalendlyEventType } from '@/hooks/useCalendly';

interface BookingEventTypeSelectorProps {
  eventTypes: CalendlyEventType[];
  selectedEventType: CalendlyEventType | null;
  onSelect: (eventType: CalendlyEventType) => void;
}

export function BookingEventTypeSelector({
  eventTypes,
  selectedEventType,
  onSelect,
}: BookingEventTypeSelectorProps) {
  if (eventTypes.length === 0) return null;
  
  // If only one event type, don't show selector
  if (eventTypes.length === 1) return null;
  
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-muted-foreground">Terminart wählen</h3>
      <div className="space-y-2">
        {eventTypes.map((eventType) => (
          <button
            key={eventType.uri}
            onClick={() => onSelect(eventType)}
            className={cn(
              "w-full p-4 rounded-2xl text-left transition-all",
              "border-2",
              selectedEventType?.uri === eventType.uri
                ? "border-primary bg-primary/5 shadow-neu-flat-sm"
                : "border-transparent bg-background shadow-neu-flat hover:shadow-neu-flat-sm"
            )}
          >
            <div className="flex items-start gap-3">
              <div 
                className="w-3 h-3 rounded-full mt-1.5 flex-shrink-0"
                style={{ backgroundColor: eventType.color }}
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground">{eventType.name}</p>
                {eventType.description_plain && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {eventType.description_plain}
                  </p>
                )}
                <div className="flex items-center gap-1.5 mt-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>{eventType.duration} Min.</span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
