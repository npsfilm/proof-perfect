import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Service {
  id: string;
  category_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  price_cents: number;
  price_type: 'fixed' | 'per_image' | 'per_room';
  icon_name: string | null;
  gradient_class: string | null;
  features: string[];
  is_popular: boolean | null;
  show_in_booking: boolean | null;
  show_in_finalize: boolean | null;
  show_in_virtual_editing: boolean | null;
  requires_photo_selection: boolean | null;
  sort_order: number | null;
  is_active: boolean | null;
  created_at: string;
  updated_at: string;
}

interface UseServicesOptions {
  categoryId?: string;
  showIn?: 'booking' | 'finalize' | 'virtual_editing';
}

export function useServices(options?: UseServicesOptions) {
  return useQuery({
    queryKey: ['services', options],
    queryFn: async () => {
      let query = supabase
        .from('services')
        .select('*')
        .order('sort_order', { ascending: true });

      if (options?.categoryId) {
        query = query.eq('category_id', options.categoryId);
      }

      if (options?.showIn === 'booking') {
        query = query.eq('show_in_booking', true);
      } else if (options?.showIn === 'finalize') {
        query = query.eq('show_in_finalize', true);
      } else if (options?.showIn === 'virtual_editing') {
        query = query.eq('show_in_virtual_editing', true);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Service[];
    },
  });
}

export function useCreateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (service: Partial<Service>) => {
      const { data, error } = await supabase
        .from('services')
        .insert(service as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success('Service erstellt');
    },
    onError: (error) => {
      toast.error('Fehler beim Erstellen: ' + error.message);
    },
  });
}

export function useUpdateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Service> & { id: string }) => {
      const { data, error } = await supabase
        .from('services')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success('Service aktualisiert');
    },
    onError: (error) => {
      toast.error('Fehler beim Aktualisieren: ' + error.message);
    },
  });
}

export function useDeleteService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success('Service gelöscht');
    },
    onError: (error) => {
      toast.error('Fehler beim Löschen: ' + error.message);
    },
  });
}
