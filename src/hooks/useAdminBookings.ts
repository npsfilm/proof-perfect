import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Booking {
  id: string;
  batch_id: string;
  property_index: number;
  contact_name: string;
  contact_email: string;
  contact_phone?: string;
  company_name?: string;
  address: string;
  latitude?: number;
  longitude?: number;
  package_type: 'foto' | 'drohne' | 'kombi';
  photo_count: number;
  property_type?: 'bewohnt' | 'unbewohnt' | 'gestaged';
  square_meters?: number;
  scheduled_date: string;
  scheduled_start: string;
  scheduled_end: string;
  estimated_duration_minutes: number;
  status: 'confirmed' | 'request' | 'cancelled' | 'completed';
  is_weekend_request: boolean;
  drive_time_from_previous_minutes?: number;
  drive_distance_km?: number;
  notes?: string;
  source?: string;
  created_at: string;
  updated_at: string;
}

export function useAdminBookings(filters?: {
  status?: string;
  startDate?: string;
  endDate?: string;
}) {
  return useQuery({
    queryKey: ['admin-bookings', filters],
    queryFn: async () => {
      let query = supabase
        .from('bookings')
        .select('*')
        .order('scheduled_date', { ascending: true })
        .order('scheduled_start', { ascending: true });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.startDate) {
        query = query.gte('scheduled_date', filters.startDate);
      }

      if (filters?.endDate) {
        query = query.lte('scheduled_date', filters.endDate);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Booking[];
    },
  });
}

export function useBookingsByDate(date: string) {
  return useQuery({
    queryKey: ['bookings-by-date', date],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('scheduled_date', date)
        .in('status', ['confirmed', 'request'])
        .order('scheduled_start');

      if (error) throw error;
      return data as Booking[];
    },
    enabled: !!date,
  });
}

export function useUpdateBookingStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Booking['status'] }) => {
      const { error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['bookings-by-date'] });
      toast.success('Status aktualisiert');
    },
    onError: (error) => {
      console.error('Update error:', error);
      toast.error('Fehler beim Aktualisieren');
    },
  });
}

export function useDeleteBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['bookings-by-date'] });
      toast.success('Buchung gelöscht');
    },
    onError: (error) => {
      console.error('Delete error:', error);
      toast.error('Fehler beim Löschen');
    },
  });
}
