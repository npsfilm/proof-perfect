import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Gallery } from '@/types/database';
import { useToast } from '@/hooks/use-toast';

export function useGalleries() {
  return useQuery({
    queryKey: ['galleries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('galleries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Gallery[];
    },
  });
}

export function useCreateGallery() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (gallery: {
      name: string;
      package_target_count: number;
      salutation_type: 'Du' | 'Sie';
      address?: string | null;
      company_id?: string | null;
    }) => {
      const { data: slugData, error: slugError } = await supabase.rpc(
        'generate_unique_slug',
        { p_name: gallery.name }
      );

      if (slugError) throw slugError;

      const { data, error } = await supabase
        .from('galleries')
        .insert({
          name: gallery.name,
          slug: slugData,
          package_target_count: gallery.package_target_count,
          salutation_type: gallery.salutation_type,
          address: gallery.address,
          company_id: gallery.company_id,
          status: 'Planning',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['galleries'] });
      toast({
        title: 'Galerie erstellt',
        description: 'Die Galerie wurde erfolgreich erstellt.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Fehler',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateGallery() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Gallery> & { id: string }) => {
      const { data, error } = await supabase
        .from('galleries')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['galleries'] });
      toast({
        title: 'Galerie aktualisiert',
        description: 'Die Galerie wurde erfolgreich aktualisiert.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Fehler',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteGallery() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('galleries').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['galleries'] });
      toast({
        title: 'Galerie gelöscht',
        description: 'Die Galerie wurde erfolgreich gelöscht.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Fehler',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}
