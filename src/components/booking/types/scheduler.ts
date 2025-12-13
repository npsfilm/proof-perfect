export interface PropertySlot {
  property_index: number;
  address: string;
  start: string;
  end: string;
}

export type SlotType = 'recommended' | 'cheapest' | 'flexible' | 'weekend';

export interface SlotSuggestion {
  type: SlotType;
  label: string;
  description: string;
  date: string;
  start: string;
  end: string;
  is_weekend?: boolean;
  slots?: PropertySlot[];
  total_drive_time_minutes?: number;
}

export interface SlotSelection {
  date: string;
  start: string;
  end: string;
  isWeekendRequest: boolean;
}
