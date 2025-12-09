export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface SchedulerDateSelectorProps {
  dates: Date[];
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
}

export interface SchedulerTimeSlotsProps {
  selectedDate: Date;
  slots: TimeSlot[];
  isLoading: boolean;
  error: string | null;
  currentScheduledTime: string | null;
  currentScheduledDate: Date | null;
  onSelectTime: (time: string) => void;
}

export interface SchedulerConfirmationProps {
  scheduledDate: Date;
  scheduledTime: string;
}

export interface SchedulerNavigationProps {
  canContinue: boolean;
  onPrev: () => void;
  onNext: () => void;
}
