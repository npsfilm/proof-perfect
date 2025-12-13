import { useState, useCallback } from 'react';
import type { SlotSuggestion, SlotSelection } from '../types/scheduler';

export function useSlotSelection(setSelectedSlots: (slots: SlotSelection[]) => void) {
  const [selectedSlot, setSelectedSlot] = useState<SlotSuggestion | null>(null);

  const handleSlotSelect = useCallback((slot: SlotSuggestion) => {
    setSelectedSlot(slot);
    
    const slotSelections: SlotSelection[] = slot.slots?.map((s) => ({
      date: slot.date,
      start: s.start,
      end: s.end,
      isWeekendRequest: slot.type === 'weekend',
    })) || [{
      date: slot.date,
      start: slot.start,
      end: slot.end,
      isWeekendRequest: slot.is_weekend || slot.type === 'weekend',
    }];

    setSelectedSlots(slotSelections);
  }, [setSelectedSlots]);

  return { selectedSlot, handleSlotSelect };
}
