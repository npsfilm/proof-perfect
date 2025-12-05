import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface CalendlyUser {
  uri: string;
  name: string;
  email: string;
  avatar_url: string | null;
  timezone: string;
}

export interface CalendlyEventType {
  uri: string;
  name: string;
  description_plain: string | null;
  duration: number;
  scheduling_url: string;
  color: string;
  active: boolean;
}

interface AvailableTime {
  status: string;
  start_time: string;
  invitees_remaining: number;
}

async function callCalendlyApi(action: string, params?: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke('calendly-api', {
    body: { action, params },
  });
  
  if (error) throw new Error(error.message);
  if (data?.error) throw new Error(data.error);
  return data;
}

export function useCalendlyUser() {
  return useQuery({
    queryKey: ['calendly', 'user'],
    queryFn: async () => {
      const response = await callCalendlyApi('get_user');
      return response.resource as CalendlyUser;
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

export function useCalendlyEventTypes(userUri: string | undefined) {
  return useQuery({
    queryKey: ['calendly', 'event-types', userUri],
    queryFn: async () => {
      if (!userUri) return [];
      const response = await callCalendlyApi('get_event_types', { userUri });
      return response.collection as CalendlyEventType[];
    },
    enabled: !!userUri,
    staleTime: 1000 * 60 * 15, // 15 minutes
  });
}

export function useCalendlyAvailableTimes(
  eventTypeUri: string | undefined,
  startDate: Date | undefined,
  endDate: Date | undefined
) {
  return useQuery({
    queryKey: ['calendly', 'available-times', eventTypeUri, startDate?.toISOString(), endDate?.toISOString()],
    queryFn: async () => {
      if (!eventTypeUri || !startDate || !endDate) return [];
      
      const response = await callCalendlyApi('get_available_times', {
        eventTypeUri,
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
      });
      
      return response.collection as AvailableTime[];
    },
    enabled: !!eventTypeUri && !!startDate && !!endDate,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useCalendly() {
  const [selectedEventType, setSelectedEventType] = useState<CalendlyEventType | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<AvailableTime | null>(null);
  
  const { data: user, isLoading: isLoadingUser, error: userError } = useCalendlyUser();
  const { data: eventTypes, isLoading: isLoadingEventTypes } = useCalendlyEventTypes(user?.uri);
  
  // Calculate date range for available times (selected date to end of day)
  const startDate = selectedDate ? new Date(selectedDate) : undefined;
  const endDate = selectedDate ? new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000) : undefined;
  
  const { 
    data: availableTimes, 
    isLoading: isLoadingTimes 
  } = useCalendlyAvailableTimes(selectedEventType?.uri, startDate, endDate);
  
  // Auto-select first event type
  useEffect(() => {
    if (eventTypes && eventTypes.length > 0 && !selectedEventType) {
      setSelectedEventType(eventTypes[0]);
    }
  }, [eventTypes, selectedEventType]);
  
  const openSchedulingUrl = () => {
    if (selectedEventType?.scheduling_url) {
      window.open(selectedEventType.scheduling_url, '_blank');
    }
  };
  
  return {
    user,
    eventTypes: eventTypes || [],
    selectedEventType,
    setSelectedEventType,
    selectedDate,
    setSelectedDate,
    selectedTime,
    setSelectedTime,
    availableTimes: availableTimes || [],
    isLoading: isLoadingUser || isLoadingEventTypes,
    isLoadingTimes,
    error: userError,
    openSchedulingUrl,
  };
}
