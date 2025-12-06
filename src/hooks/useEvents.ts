import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns';

export interface CalendarEvent {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  location: string | null;
  color: string;
  google_event_id: string | null;
  last_synced_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateEventData {
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  location?: string;
  color?: string;
}

export interface UpdateEventData extends Partial<CreateEventData> {
  id: string;
}

export function useEvents(currentDate: Date) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch events for a 6-month window around currentDate (matching Edge Function)
  const rangeStart = startOfMonth(subMonths(currentDate, 3));
  const rangeEnd = endOfMonth(addMonths(currentDate, 3));

  const { data: events = [], isLoading, error } = useQuery({
    queryKey: ['events', rangeStart.toISOString(), rangeEnd.toISOString()],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .gte('start_time', rangeStart.toISOString())
        .lte('end_time', rangeEnd.toISOString())
        .order('start_time', { ascending: true });

      if (error) throw error;
      return data as CalendarEvent[];
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const createEvent = useMutation({
    mutationFn: async (eventData: CreateEventData) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('events')
        .insert({
          ...eventData,
          user_id: user.id,
          color: eventData.color || '#3b82f6',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success('Termin erstellt');
    },
    onError: (error) => {
      console.error('Error creating event:', error);
      toast.error('Fehler beim Erstellen des Termins');
    },
  });

  const updateEvent = useMutation({
    mutationFn: async ({ id, ...eventData }: UpdateEventData) => {
      const { data, error } = await supabase
        .from('events')
        .update(eventData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success('Termin aktualisiert');
    },
    onError: (error) => {
      console.error('Error updating event:', error);
      toast.error('Fehler beim Aktualisieren des Termins');
    },
  });

  const deleteEvent = useMutation({
    mutationFn: async (eventId: string) => {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success('Termin gelöscht');
    },
    onError: (error) => {
      console.error('Error deleting event:', error);
      toast.error('Fehler beim Löschen des Termins');
    },
  });

  return {
    events,
    isLoading,
    error,
    createEvent,
    updateEvent,
    deleteEvent,
  };
}
