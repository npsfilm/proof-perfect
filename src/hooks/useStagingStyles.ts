import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface StagingStyle {
  id: string;
  name: string;
  slug: string;
  color_class: string | null;
  thumbnail_url: string | null;
  sort_order: number | null;
  is_active: boolean | null;
  created_at: string;
  updated_at: string;
}

export function useStagingStyles() {
  return useQuery({
    queryKey: ['staging-styles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('staging_styles')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data as StagingStyle[];
    },
  });
}

export function useCreateStagingStyle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (style: Partial<StagingStyle>) => {
      const { data, error } = await supabase
        .from('staging_styles')
        .insert(style as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staging-styles'] });
      toast.success('Stil erstellt');
    },
    onError: (error) => {
      toast.error('Fehler beim Erstellen: ' + error.message);
    },
  });
}

export function useUpdateStagingStyle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<StagingStyle> & { id: string }) => {
      const { data, error } = await supabase
        .from('staging_styles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staging-styles'] });
      toast.success('Stil aktualisiert');
    },
    onError: (error) => {
      toast.error('Fehler beim Aktualisieren: ' + error.message);
    },
  });
}

export function useDeleteStagingStyle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('staging_styles')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staging-styles'] });
      toast.success('Stil gelöscht');
    },
    onError: (error) => {
      toast.error('Fehler beim Löschen: ' + error.message);
    },
  });
}
