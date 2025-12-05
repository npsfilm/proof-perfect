import { useState, useCallback } from 'react';
import { addMonths, subMonths, addWeeks, subWeeks, addDays, subDays, startOfToday } from 'date-fns';

export type CalendarView = 'month' | 'week' | 'day' | 'list';

export function useCalendarNavigation() {
  const [currentDate, setCurrentDate] = useState(startOfToday());
  const [view, setView] = useState<CalendarView>('month');

  const goToToday = useCallback(() => {
    setCurrentDate(startOfToday());
  }, []);

  const goToPrevious = useCallback(() => {
    setCurrentDate(prev => {
      switch (view) {
        case 'month':
          return subMonths(prev, 1);
        case 'week':
          return subWeeks(prev, 1);
        case 'day':
        case 'list':
          return subDays(prev, 1);
        default:
          return prev;
      }
    });
  }, [view]);

  const goToNext = useCallback(() => {
    setCurrentDate(prev => {
      switch (view) {
        case 'month':
          return addMonths(prev, 1);
        case 'week':
          return addWeeks(prev, 1);
        case 'day':
        case 'list':
          return addDays(prev, 1);
        default:
          return prev;
      }
    });
  }, [view]);

  const goToDate = useCallback((date: Date) => {
    setCurrentDate(date);
  }, []);

  return {
    currentDate,
    view,
    setView,
    goToToday,
    goToPrevious,
    goToNext,
    goToDate,
  };
}
