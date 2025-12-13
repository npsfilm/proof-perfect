import { Skeleton } from '@/components/ui/skeleton';
import { SlotCard } from './SlotCard';
import { AlertTriangle, Calendar as CalendarIcon } from 'lucide-react';
import type { SlotSuggestion, SlotType, PropertySlot } from './types/scheduler';

interface RouteOptimizerSuggestion {
  type: string;
  label: string;
  description: string;
  date: string;
  slots: PropertySlot[];
  total_drive_time_minutes?: number;
}

interface SchedulerSlotListProps {
  isLoading: boolean;
  routeOptimizerData: { suggestions?: RouteOptimizerSuggestion[] } | undefined;
  availabilityData: { recommended?: any[]; weekend_requests?: any[]; all?: any[] } | undefined;
  properties: { address: string }[];
  selectedSlot: SlotSuggestion | null;
  onSlotSelect: (slot: SlotSuggestion) => void;
}

export function SchedulerSlotList({
  isLoading,
  routeOptimizerData,
  availabilityData,
  properties,
  selectedSlot,
  onSlotSelect,
}: SchedulerSlotListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    );
  }

  // Route optimizer suggestions
  if (routeOptimizerData?.suggestions) {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground">Vorschläge</h3>
        {routeOptimizerData.suggestions.map((suggestion, index) => (
          <SlotCard
            key={index}
            type={suggestion.type as SlotType}
            label={suggestion.label}
            description={suggestion.description}
            date={suggestion.date}
            slots={suggestion.slots}
            totalDriveTime={suggestion.total_drive_time_minutes}
            isSelected={selectedSlot?.type === suggestion.type && selectedSlot?.date === suggestion.date}
            onSelect={() => onSlotSelect(suggestion as SlotSuggestion)}
          />
        ))}
      </div>
    );
  }

  // Fallback to simple availability
  if (availabilityData) {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground">Verfügbare Termine</h3>
        {availabilityData.recommended?.slice(0, 5).map((slot, index) => (
          <SlotCard
            key={index}
            type="recommended"
            label={slot.is_weekend ? '📅 Wochenende (nur auf Anfrage)' : '🟢 Verfügbar'}
            description={slot.label || ''}
            date={slot.date}
            slots={[{ property_index: 1, address: properties[0]?.address, start: slot.start, end: slot.end }]}
            isSelected={selectedSlot?.date === slot.date && selectedSlot?.start === slot.start}
            onSelect={() => onSlotSelect({
              type: 'recommended',
              label: slot.label || '',
              description: '',
              date: slot.date,
              start: slot.start,
              end: slot.end,
              is_weekend: slot.is_weekend,
            })}
          />
        ))}

        {availabilityData.weekend_requests && availabilityData.weekend_requests.length > 0 && (
          <>
            <h3 className="text-sm font-medium text-muted-foreground mt-6 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              Wochenende (nur auf Anfrage)
            </h3>
            {availabilityData.weekend_requests.slice(0, 3).map((slot, index) => (
              <SlotCard
                key={`weekend-${index}`}
                type="weekend"
                label="📅 Wochenende"
                description="+25-50% Wochenendzuschlag"
                date={slot.date}
                slots={[{ property_index: 1, address: properties[0]?.address, start: slot.start, end: slot.end }]}
                isSelected={selectedSlot?.date === slot.date && selectedSlot?.start === slot.start}
                onSelect={() => onSlotSelect({
                  type: 'weekend',
                  label: '📅 Wochenende',
                  description: '+25-50% Wochenendzuschlag',
                  date: slot.date,
                  start: slot.start,
                  end: slot.end,
                  is_weekend: true,
                })}
              />
            ))}
          </>
        )}
      </div>
    );
  }

  // No results
  if (!availabilityData?.all?.length && !routeOptimizerData) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <CalendarIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p>Keine verfügbaren Termine für diesen Tag.</p>
        <p className="text-sm">Bitte wählen Sie ein anderes Datum.</p>
      </div>
    );
  }

  return null;
}
